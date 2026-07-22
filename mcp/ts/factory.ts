import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ExchangePools, type PoolsDeps } from './pools.js';
import { Safety } from './safety.js';
import { Journal } from './journal.js';
import { registerAllTools, SERVER_INSTRUCTIONS } from './tools/index.js';
import type { ResolvedConfig, ServerContext } from './types.js';

export interface CreateServerOptions {
    config: ResolvedConfig;
    ccxtModule: any;
    poolsDeps: PoolsDeps;
    version: string;
    journalDir?: string;
}

// assembles a fully-wired server; server.ts feeds it the real ccxt module and loader deps,
// tests feed it fakes — this factory is the only place the pieces meet
export function createServer (options: CreateServerOptions): { server: McpServer, ctx: ServerContext } {
    const journal = new Journal (options.journalDir);
    const safety = new Safety (journal);
    const pools = new ExchangePools (options.config, options.poolsDeps);
    const server = new McpServer ({
        'name': 'ccxt-mcp',
        'version': options.version,
    }, {
        'instructions': SERVER_INSTRUCTIONS,
    });
    const ctx: ServerContext = {
        'ccxt': options.ccxtModule,
        'config': options.config,
        pools,
        safety,
        journal,
        'version': options.version,
        'elicitationSupported': () => {
            const capabilities = server.server.getClientCapabilities ();
            return capabilities?.elicitation !== undefined;
        },
        // humans reading a withdrawal preview take longer than the SDK's 60s default —
        // give confirmations 5 minutes and keep resetting while the host reports progress
        'elicit': async (message: string, requestedSchema: any) => server.server.elicitInput (
            { message, requestedSchema },
            { 'timeout': 300000, 'maxTotalTimeout': 300000, 'resetTimeoutOnProgress': true },
        ),
    };
    registerAllTools (server, ctx);
    return { server, ctx };
}
