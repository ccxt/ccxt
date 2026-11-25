import type { AddressInfo } from 'node:net';
import type { EventEmitter } from 'node:events';
import { serve } from '@hono/node-server';
import type { HostedConfig } from './config.js';
import { createRuntime, type HostedRuntime } from './runtime.js';
import { createHostedApp, type HostedApp } from './app.js';
import type { Telemetry } from './telemetry/index.js';

// Starts the hosted server: shared runtime, HTTP app, listening socket, background markets
// warm-up. main.ts wires it to the real ccxt and the process; tests wire it to a fake ccxt.

export interface StartOptions {
    config: HostedConfig;
    ccxt: any;
    telemetry: Telemetry;
    now?: () => number;
    random?: () => number;
}

export interface RunningServer {
    url: URL; // the MCP endpoint
    origin: string;
    port: number;
    runtime: HostedRuntime;
    hosted: HostedApp;
    // graceful stop: drain (503 to new requests, in-flight ones finish within the drain
    // deadline), stop timers, close the socket, flush telemetry. Idempotent
    stop: (reason: string) => Promise<{ drained: boolean, inflight: number }>;
}

export async function startHostedServer (options: StartOptions): Promise<RunningServer> {
    const { config, telemetry } = options;
    const runtime = createRuntime (config, options.ccxt, telemetry, { 'now': options.now, 'random': options.random });
    const hosted = createHostedApp ({ config, 'shared': runtime.shared, 'exchanges': runtime.exchanges, telemetry, 'now': options.now });
    const server: any = await new Promise ((resolve) => {
        const started = serve ({ 'fetch': hosted.app.fetch, 'port': config.port, 'hostname': config.host }, () => resolve (started));
    });
    // connection hygiene for the origin behind nginx: bounded header and body read time,
    // idle keep-alive above nginx's upstream keepalive, a connection cap
    server.headersTimeout = 15000;
    server.requestTimeout = 30000;
    server.keepAliveTimeout = 65000;
    server.maxConnections = 2048;
    const address = server.address () as AddressInfo;
    const host = (address.family === 'IPv6') ? '[' + address.address + ']' : address.address;
    const origin = 'http://' + host + ':' + address.port;
    telemetry.log ('info', 'listening', {
        'address': address.address,
        'port': address.port,
        'mcpPath': config.mcpPath,
        'exchanges': config.exchanges.join (','),
        'ccxt': String (options.ccxt.version ?? 'unknown'),
        'version': config.version,
    });
    // markets load in the background; /readyz turns 200 once they are warm
    runtime.exchanges.prewarm ();
    let stopping: Promise<{ drained: boolean, inflight: number }> | undefined;
    const stop = (reason: string) => {
        if (stopping === undefined) {
            stopping = (async () => {
                telemetry.log ('info', 'draining', { reason, 'inflight': hosted.inflight () });
                const result = await hosted.drain (config.drainTimeoutMs);
                telemetry.log (result.drained ? 'info' : 'warn', 'drained', result);
                await runtime.exchanges.closeAll ();
                await hosted.close ();
                await new Promise<void> ((resolve) => {
                    server.close (() => resolve ());
                    server.closeIdleConnections?.();
                    // whatever is still open after the drain deadline is cut
                    setTimeout (() => server.closeAllConnections?.(), 1000).unref ();
                });
                await telemetry.shutdown (5000);
                return result;
            }) ();
        }
        return stopping;
    };
    return { 'url': new URL (origin + config.mcpPath), origin, 'port': address.port, runtime, hosted, stop };
}

// SIGTERM (docker stop, compose down/up) and SIGINT start a graceful stop, then exit
export function installSignalHandlers (target: EventEmitter, running: RunningServer, exit: (code: number) => void, telemetry: Telemetry): void {
    for (const signal of [ 'SIGTERM', 'SIGINT' ]) {
        target.on (signal, () => {
            void running.stop (signal).then (() => exit (0), () => exit (1));
        });
    }
    target.on ('unhandledRejection', (reason: any) => {
        telemetry.log ('error', 'unhandled rejection', { 'error': String (reason?.message ?? reason).slice (0, 300) });
    });
    target.on ('uncaughtException', (error: any) => {
        telemetry.log ('error', 'uncaught exception', { 'error': String (error?.stack ?? error).slice (0, 1000) });
        void telemetry.shutdown (2000).finally (() => exit (1));
    });
}
