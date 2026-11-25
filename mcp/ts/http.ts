#!/usr/bin/env node
// Hosted entry point for public market data and an browser-signed exchange relay.
// This file never loads exchange credentials or account configuration.
import { log } from './logging.js';
import { ccxt, ccxtVersion, exchangeClass, isKnownExchange, allExchangeIds, closestMatches } from './ccxt-loader.js';
import { createHostedApp } from './hosted.js';
import { createPostHog } from './posthog.js';
import { DEFAULT_FRAME_ANCESTORS } from './browser-trading.js';
import { createRequire } from 'module';

const require = createRequire (import.meta.url);
const packageJson = require ('../package.json');

const LOOPBACK = [ '127.0.0.1', 'localhost', '::1' ];

function envList (name: string): string[] | undefined {
    const raw = process.env[name];
    if (raw === undefined || raw.trim () === '') {
        return undefined;
    }
    return raw.split (',').map ((item) => item.trim ()).filter ((item) => item !== '');
}

async function main (): Promise<void> {
    const port = Number (process.env['CCXT_MCP_HTTP_PORT'] ?? process.env['PORT'] ?? 3000);
    if (!Number.isInteger (port) || port < 0 || port > 65535) {
        throw new Error ('invalid port: ' + String (process.env['CCXT_MCP_HTTP_PORT'] ?? process.env['PORT']));
    }
    // loopback by default; a real deployment sets CCXT_MCP_HTTP_HOST=0.0.0.0 on purpose
    const host = process.env['CCXT_MCP_HTTP_HOST'] ?? '127.0.0.1';
    let allowedHosts = envList ('CCXT_MCP_HTTP_ALLOWED_HOSTS');
    if (allowedHosts === undefined && LOOPBACK.includes (host)) {
        // bound to loopback: refuse foreign Host headers (DNS-rebinding protection)
        allowedHosts = [ '127.0.0.1:' + port, 'localhost:' + port, '[::1]:' + port ];
    }
    if (allowedHosts === undefined) {
        log ('warning', 'CCXT_MCP_HTTP_ALLOWED_HOSTS is not set — Host headers are not validated; set it to the public hostname(s) of this deployment');
    }
    let signingOrigin = process.env['CCXT_MCP_SIGNING_ORIGIN'];
    const requireRelayToken = process.env['CCXT_MCP_RELAY_REQUIRE_TOKEN'] === 'true';
    const relayToken = requireRelayToken ? process.env['CCXT_MCP_RELAY_TOKEN'] : undefined;
    const browserTradingEnabled = process.env['CCXT_MCP_BROWSER_TRADING'] !== 'false';
    if (browserTradingEnabled && signingOrigin === undefined && LOOPBACK.includes (host) && port !== 0) {
        const browserHost = host === '::1' ? '[::1]' : host;
        signingOrigin = new URL ('http://' + browserHost + ':' + port).origin;
    }
    if (requireRelayToken && relayToken === undefined) {
        throw new Error ('CCXT_MCP_RELAY_REQUIRE_TOKEN=true needs CCXT_MCP_RELAY_TOKEN (at least 32 characters)');
    }
    const framingEnv = process.env['CCXT_MCP_SIGNING_FRAME_ANCESTORS'];
    const frameAncestors = (framingEnv === 'none') ? [] : (envList ('CCXT_MCP_SIGNING_FRAME_ANCESTORS') ?? DEFAULT_FRAME_ANCESTORS);
    // server-side MCP analytics (off unless a PostHog project token is set); nothing runs in the pages
    const posthog = createPostHog (process.env['POSTHOG_PROJECT_TOKEN'], process.env['POSTHOG_HOST']);
    if (posthog !== undefined) {
        log ('info', 'PostHog MCP analytics on (' + (process.env['POSTHOG_HOST'] ?? 'https://eu.i.posthog.com') + ')');
    }

    
    const app = createHostedApp ({
        posthog,
        'browserTrading': browserTradingEnabled && signingOrigin !== undefined ? { 'origin': signingOrigin, 'token': relayToken, frameAncestors } : undefined,
        'ccxtModule': ccxt,
        'poolsDeps': { exchangeClass, isKnownExchange, allExchangeIds, closestMatches },
        'version': packageJson.version,
        'path': process.env['CCXT_MCP_HTTP_PATH'] ?? '/mcp',
        allowedHosts,
        'accessLog': process.env['CCXT_MCP_HTTP_ACCESS_LOG'] !== 'false',
        'trustProxy': process.env['CCXT_MCP_HTTP_TRUST_PROXY'] === 'true',
    });

    let shuttingDown = false;
    const shutdown = async (reason: string, code = 0): Promise<void> => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        log ('info', 'shutting down (' + reason + ')');
        try {
            // flush queued analytics events before exiting
            await posthog?.shutdown (3000);
            await app.close ();
        } catch (e) {
            // nothing useful left to do on the way out
        }
        process.exit (code);
    };
    process.on ('SIGINT', () => void shutdown ('SIGINT'));
    process.on ('SIGTERM', () => void shutdown ('SIGTERM'));
    process.on ('uncaughtException', (error) => {
        log ('error', 'uncaught exception: ' + String (error?.stack ?? error));
        void shutdown ('uncaught exception', 1);
    });
    process.on ('unhandledRejection', (reason) => {
        log ('error', 'unhandled rejection: ' + String ((reason as any)?.stack ?? reason));
    });

    app.httpServer.on ('error', (error) => {
        log ('error', 'http server error: ' + String (error?.stack ?? error));
        void shutdown ('http server error', 1);
    });
    app.httpServer.listen (port, host, () => {
        log ('info', 'ccxt-mcp ' + packageJson.version + ' (ccxt ' + ccxtVersion () + ') hosted public server listening on http://' + host + ':' + port + (process.env['CCXT_MCP_HTTP_PATH'] ?? '/mcp') + ' — no server-side exchange accounts');
    });
}

main ().catch ((error) => {
    log ('error', 'fatal: ' + String (error?.stack ?? error));
    process.exit (1);
});
