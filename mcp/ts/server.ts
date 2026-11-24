#!/usr/bin/env node
// logging must be the first import: it re-routes console.* to stderr before anything
// else loads, protecting the stdio JSON-RPC channel on stdout
import { log, setLogRedactor } from './logging.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ccxt, ccxtVersion, exchangeClass, isKnownExchange, allExchangeIds, closestMatches } from './ccxt-loader.js';
import { loadConfig } from './config.js';
import { redact } from './redact.js';
import { isBenignStreamClose } from './errors.js';
import { createServer } from './factory.js';
import { packageVersion } from './embedded.js';

const packageJson = { 'version': packageVersion () };

// A host that crashes or is force-quit closes stdin, stdout and stderr in one go. With no
// listener, the EPIPE from the next write to either output surfaces as an uncaught exception,
// whose handler logs — another write, another EPIPE — and the orphaned server spins at 100%
// CPU until the user finds and kills it. Nobody is left to read either stream, so their
// errors are dropped; the closed stdin (or the listener in main) ends the process.
process.stdout.on ('error', () => undefined);
process.stderr.on ('error', () => undefined);

async function main (): Promise<void> {
    setLogRedactor (redact);
    const config = loadConfig ();
    const { server, ctx } = createServer ({
        config,
        'ccxtModule': ccxt,
        'poolsDeps': { exchangeClass, isKnownExchange, allExchangeIds, closestMatches },
        'version': packageJson.version,
    });
    const pools = ctx.pools;

    let shuttingDown = false;
    const shutdown = async (reason: string, code = 0): Promise<void> => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        log ('info', 'shutting down (' + reason + ')');
        try {
            // the setup form's loopback listener must not outlive the server that owns it
            await ctx.setup?.close ();
            await ctx.subscriptions.closeAll ();
            await pools.closeAll ();
        } catch (e) {
            // nothing useful left to do on the way out
        }
        process.exit (code);
    };

    process.on ('SIGINT', () => void shutdown ('SIGINT'));
    process.on ('SIGTERM', () => void shutdown ('SIGTERM'));
    // hosts terminate stdio servers by closing stdin
    process.stdin.on ('end', () => void shutdown ('stdin closed'));
    process.stdin.on ('close', () => void shutdown ('stdin closed'));
    // a broken output pipe means the host is gone even if stdin has not said so yet
    process.stdout.on ('error', () => void shutdown ('stdout closed'));
    process.on ('uncaughtException', (error) => {
        // a second failure while already on the way out, or a dead pipe reported some other
        // way: logging it could only fail again, so leave without another word
        const code = (error as NodeJS.ErrnoException)?.code;
        if (shuttingDown || code === 'EPIPE' || code === 'ERR_STREAM_DESTROYED') {
            process.exit (1);
        }
        log ('error', 'uncaught exception: ' + redact (String (error?.stack ?? error)));
        void shutdown ('uncaught exception', 1);
    });
    process.on ('unhandledRejection', (reason) => {
        // a routine stream-socket close rejects ccxt.pro's in-flight watch futures; that is
        // expected background noise, not a fault — log it quietly and keep serving
        if (isBenignStreamClose (reason)) {
            log ('debug', 'stream socket closed: ' + redact (String ((reason as any)?.message ?? reason)));
            return;
        }
        log ('error', 'unhandled rejection: ' + redact (String ((reason as any)?.stack ?? reason)));
    });

    const transport = new StdioServerTransport ();
    await server.connect (transport);
    log ('info', 'ccxt-mcp ' + packageJson.version + ' (ccxt ' + ccxtVersion () + ') connected over stdio — accounts: ' + Object.keys (config.accounts).length);

    // fire-and-forget markets prewarm for configured accounts; never delays startup
    pools.prewarm ();
}

main ().catch ((error) => {
    log ('error', 'fatal: ' + String (error?.stack ?? error));
    process.exit (1);
});
