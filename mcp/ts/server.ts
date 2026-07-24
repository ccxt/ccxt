#!/usr/bin/env node
// logging must be the first import: it re-routes console.* to stderr before anything
// else loads, protecting the stdio JSON-RPC channel on stdout
import { log, setLogRedactor } from './logging.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ccxt, ccxtVersion, exchangeClass, isKnownExchange, allExchangeIds, closestMatches } from './ccxt-loader.js';
import { loadConfig } from './config.js';
import { redact } from './redact.js';
import { createServer } from './factory.js';
import { createRequire } from 'module';

const require = createRequire (import.meta.url);
const packageJson = require ('../package.json');

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
