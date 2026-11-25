import type { AddressInfo } from 'net';
import { serve } from '@hono/node-server';
import { createMcpHonoApp } from '@modelcontextprotocol/hono';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { buildServer, type SharedState, type BuildServerOptions } from '../../ts/factory.js';

// A minimal stateless Streamable HTTP endpoint over the real SDK v2 pieces the hosted server
// will use: createMcpHandler (legacy: 'stateless', one McpServer per request) behind the
// official Hono app, on a loopback port. It exists to test per-request behaviour (client
// capabilities, the view attach decision) the way a remote host meets it; the hosted app
// itself (limits, analytics, routes) is built elsewhere.
export interface TestHttpServer {
    url: URL;
    eras: string[]; // the era of every server the factory built, in order
    close: () => Promise<void>;
}

export async function startHttpServer (shared: SharedState, options: BuildServerOptions = {}): Promise<TestHttpServer> {
    const eras: string[] = [];
    const handler = createMcpHandler ((request) => {
        eras.push (request.era);
        return buildServer (shared, { ...options, 'era': request.era, 'authInfo': request.authInfo }).server;
    }, { 'legacy': 'stateless' });
    const app = createMcpHonoApp ({ 'host': '127.0.0.1' });
    // createMcpHonoApp parses the JSON body once and leaves it under 'parsedBody' (untyped in Hono's context)
    app.all ('/mcp', (c) => handler.fetch (c.req.raw, { 'parsedBody': (c as any).get ('parsedBody') }));
    const server = await new Promise<ReturnType<typeof serve>> ((resolve) => {
        const started = serve ({ 'fetch': app.fetch, 'port': 0, 'hostname': '127.0.0.1' }, () => resolve (started));
    });
    const port = (server.address () as AddressInfo).port;
    return {
        'url': new URL ('http://127.0.0.1:' + port + '/mcp'),
        eras,
        'close': async () => {
            await handler.close ();
            await new Promise<void> ((resolve) => server.close (() => resolve ()));
        },
    };
}
