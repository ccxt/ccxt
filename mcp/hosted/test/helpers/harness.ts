import { loadConfig, type HostedConfig } from '../../src/config.js';
import { startHostedServer, type RunningServer } from '../../src/server.js';
import type { Telemetry, RequestInfo, RequestSummary } from '../../src/telemetry/index.js';
import { createVenue } from './venue.js';

// Starts the real hosted server (Hono app, createMcpHandler, guarded exchanges) on an
// ephemeral loopback port over the fake venue, with a recording stand-in for telemetry.

export interface RecordingTelemetry extends Telemetry {
    summaries: RequestSummary[];
    infos: RequestInfo[];
    logs: { level: string, message: string, attributes?: Record<string, unknown> }[];
    instrumented: number;
    shutdownCalls: number;
    shutdownDone: boolean;
}

export function recordingTelemetry (shutdownDelayMs = 0): RecordingTelemetry {
    const telemetry: RecordingTelemetry = {
        'summaries': [],
        'infos': [],
        'logs': [],
        'instrumented': 0,
        'shutdownCalls': 0,
        'shutdownDone': false,
        'instrument': () => {
            telemetry.instrumented += 1;
        },
        'runWithRequest': (info, fn) => {
            telemetry.infos.push (info);
            return fn ();
        },
        'currentRequest': () => undefined,
        'log': (level, message, attributes) => {
            telemetry.logs.push ({ level, message, attributes });
        },
        'requestDone': (summary) => {
            telemetry.summaries.push (summary);
        },
        'status': () => ({ 'analytics': 'off', 'logs': 'off' }),
        'shutdown': async () => {
            telemetry.shutdownCalls += 1;
            await new Promise ((resolve) => setTimeout (resolve, shutdownDelayMs));
            telemetry.shutdownDone = true;
        },
        'hashClient': (key) => 'h-' + key.length,
        'annotate': () => {},
        'verified': async () => {},
    };
    return telemetry;
}

export interface Harness {
    server: RunningServer;
    venue: ReturnType<typeof createVenue>;
    telemetry: RecordingTelemetry;
    config: HostedConfig;
    url: string;
    origin: string;
    close: () => Promise<void>;
}

export async function startHarness (env: Record<string, string> = {}, options: { ids?: string[], warm?: boolean, venue?: ReturnType<typeof createVenue>, shutdownDelayMs?: number } = {}): Promise<Harness> {
    const venue = options.venue ?? createVenue (options.ids ?? [ 'alpha', 'beta' ]);
    const config = loadConfig ({
        'PORT': '0',
        'HOST': '127.0.0.1',
        'EXCHANGES': (options.ids ?? [ 'alpha', 'beta' ]).join (','),
        'MARKETS_REFRESH_MINUTES': '0',
        ...env,
    }, 'test');
    const telemetry = recordingTelemetry (options.shutdownDelayMs ?? 0);
    const server = await startHostedServer ({ config, 'ccxt': venue.module, telemetry });
    if (options.warm !== false) {
        await waitFor (() => server.hosted.ready (), 5000);
    }
    return {
        server,
        venue,
        telemetry,
        config,
        'url': server.url.href,
        'origin': server.origin,
        'close': async () => {
            venue.release ();
            await server.stop ('test');
        },
    };
}

export async function waitFor (predicate: () => boolean, timeoutMs: number): Promise<void> {
    const started = Date.now ();
    while (!predicate ()) {
        if (Date.now () - started > timeoutMs) {
            throw new Error ('condition not met within ' + timeoutMs + ' ms');
        }
        await new Promise ((resolve) => setTimeout (resolve, 10));
    }
}

let nextId = 1;

// one raw JSON-RPC POST the way a 2025-era stateless host sends it (no initialize needed)
export async function rpc (url: string, method: string, params: any = {}, headers: Record<string, string> = {}): Promise<{ status: number, headers: Headers, body: any, text: string }> {
    const response = await fetch (url, {
        'method': 'POST',
        'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream', ...headers },
        'body': JSON.stringify ({ 'jsonrpc': '2.0', 'id': nextId++, method, params }),
    });
    const text = await response.text ();
    return { 'status': response.status, 'headers': response.headers, 'body': parseRpc (text), text };
}

export function parseRpc (text: string): any {
    const trimmed = text.trim ();
    if (trimmed.startsWith ('{')) {
        return JSON.parse (trimmed);
    }
    const data = trimmed.split ('\n').filter ((line) => line.startsWith ('data:')).map ((line) => line.slice (5).trim ()).join ('');
    return (data.length > 0) ? JSON.parse (data) : undefined;
}

export async function callTool (url: string, name: string, args: any, headers: Record<string, string> = {}): Promise<{ status: number, result: any, envelope: any, headers: Headers }> {
    const response = await rpc (url, 'tools/call', { name, 'arguments': args }, headers);
    const result = response.body?.result;
    let envelope: any;
    try {
        envelope = JSON.parse (result?.content?.[0]?.text);
    } catch (e) {
        envelope = undefined;
    }
    return { 'status': response.status, result, envelope, 'headers': response.headers };
}
