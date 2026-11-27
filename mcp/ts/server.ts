#!/usr/bin/env node
// logging must be the first import: it re-routes console.* to stderr before anything
// else loads, protecting the stdio JSON-RPC channel on stdout
import { log, setLogRedactor } from './logging.js';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { ccxt, ccxtVersion, exchangeClass, isKnownExchange, allExchangeIds, closestMatches } from './ccxt-loader.js';
import { loadConfig } from './config.js';
import { redact } from './redact.js';
import { isBenignStreamClose } from './errors.js';
import { createSharedState, buildServer } from './factory.js';
import { tierSummary } from './tools/index.js';
import { createRequire } from 'module';

const require = createRequire (import.meta.url);
const packageJson = require ('../package.json');

async function main (): Promise<void> {
    setLogRedactor (redact);
    const config = loadConfig ();
    // process-wide state is built once; the SDK's stdio entry builds the McpServer itself
    // (one per connection, plus a throwaway one when it probes for the 2026-07-28 revision)
    const shared = createSharedState ({
        config,
        'ccxtModule': ccxt,
        'poolsDeps': { exchangeClass, isKnownExchange, allExchangeIds, closestMatches },
        'version': packageJson.version,
    });
    const pools = shared.pools;

    let shuttingDown = false;
    const shutdown = async (reason: string, code = 0): Promise<void> => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        log ('info', 'shutting down (' + reason + ')');
        try {
            await shared.subscriptions.closeAll ();
            await shared.live.close ();
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
    process.on ('uncaughtException', (error) => {
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

    // legacy: 'serve' keeps today's hosts (Claude Desktop, Claude Code, Cursor, VS Code), which
    // open with the 2025 initialize handshake, working unchanged; 2026-07-28 clients are served
    // on the same pipe. The era the client chose is handed to the factory per instance
    serveStdio ((request) => buildServer (shared, { 'hosted': false, 'era': request.era, 'authInfo': request.authInfo }).server, {
        'legacy': 'serve',
        'onerror': (error) => log ('warning', 'stdio transport error: ' + redact (String (error?.message ?? error))),
    });
    log ('info', 'ccxt-mcp ' + packageJson.version + ' (ccxt ' + ccxtVersion () + ') serving over stdio — ' + tierSummary (config));

    // fire-and-forget markets prewarm for configured accounts; never delays startup
    pools.prewarm ();
}

main ().catch ((error) => {
    log ('error', 'fatal: ' + String (error?.stack ?? error));
    process.exit (1);
});
