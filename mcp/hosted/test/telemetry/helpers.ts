// Offline stand-ins for PostHog and for the hosted HTTP layer, so the telemetry tests see
// exactly the bytes that would leave the process.
import http from 'node:http';
import zlib from 'node:zlib';
import type { AddressInfo } from 'node:net';
import { serve } from '@hono/node-server';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { z } from 'zod';
import type { Telemetry, RequestInfo } from '../../src/telemetry/index.js';

export interface SinkRequest {
    method: string;
    url: string;
    headers: http.IncomingHttpHeaders;
    raw: Buffer; // as received (possibly compressed)
    body: string; // decoded
    json: any;
}

export interface Sink {
    url: string;
    requests: SinkRequest[];
    flagsStatus: number;
    hang: boolean; // accept connections but never answer
    events: () => any[]; // every analytics event received, in order
    logRecords: () => { resource: Record<string, any>, record: any, attributes: Record<string, any> }[];
    close: () => Promise<void>;
}

function decode (raw: Buffer, encoding: string | undefined): Buffer {
    try {
        if (encoding === 'gzip' || (raw[0] === 0x1f && raw[1] === 0x8b)) {
            return zlib.gunzipSync (raw);
        }
        if (encoding === 'deflate') {
            return zlib.inflateSync (raw);
        }
        if (encoding === 'zstd') {
            return (zlib as any).zstdDecompressSync (raw);
        }
    } catch (e) {
        // fall through: record what arrived
    }
    return raw;
}

// OTLP any-value -> plain JS value
export function otlpValue (value: any): any {
    if (value === undefined || value === null) {
        return undefined;
    }
    if ('stringValue' in value) {
        return value.stringValue;
    }
    if ('intValue' in value) {
        return Number (value.intValue);
    }
    if ('doubleValue' in value) {
        return value.doubleValue;
    }
    if ('boolValue' in value) {
        return value.boolValue;
    }
    if ('arrayValue' in value) {
        return (value.arrayValue.values ?? []).map (otlpValue);
    }
    if ('kvlistValue' in value) {
        return otlpAttributes (value.kvlistValue.values);
    }
    return undefined;
}

export function otlpAttributes (list: any[] | undefined): Record<string, any> {
    const out: Record<string, any> = {};
    for (const entry of list ?? []) {
        out[entry.key] = otlpValue (entry.value);
    }
    return out;
}

export async function startSink (): Promise<Sink> {
    const requests: SinkRequest[] = [];
    const held: http.ServerResponse[] = [];
    const sink: Sink = {
        'url': '',
        requests,
        'flagsStatus': 200,
        'hang': false,
        'events': () => requests.filter ((r) => r.url.startsWith ('/i/v1/analytics')).flatMap ((r) => r.json?.batch ?? []),
        'logRecords': () => requests.filter ((r) => r.url.startsWith ('/i/v1/logs')).flatMap ((r) => (r.json?.resourceLogs ?? []).flatMap ((rl: any) => {
            const resource = otlpAttributes (rl.resource?.attributes);
            return (rl.scopeLogs ?? []).flatMap ((sl: any) => (sl.logRecords ?? []).map ((record: any) => ({ resource, record, 'attributes': otlpAttributes (record.attributes) })));
        })),
        'close': async () => undefined,
    };
    const server = http.createServer ((req, res) => {
        const chunks: Buffer[] = [];
        req.on ('data', (chunk) => chunks.push (chunk));
        req.on ('end', () => {
            const raw = Buffer.concat (chunks);
            const body = decode (raw, req.headers['content-encoding'] as string | undefined).toString ('utf8');
            let json: any;
            try {
                json = JSON.parse (body);
            } catch (e) {
                json = undefined;
            }
            requests.push ({ 'method': req.method ?? '', 'url': req.url ?? '', 'headers': req.headers, raw, body, json });
            if (sink.hang) {
                held.push (res);
                return;
            }
            const path = req.url ?? '';
            if (path.startsWith ('/flags')) {
                res.writeHead (sink.flagsStatus, { 'content-type': 'application/json' });
                res.end ((sink.flagsStatus === 200) ? '{"flags":{},"errorsWhileComputingFlags":false}' : '{"type":"authentication_error","code":"invalid_api_key"}');
                return;
            }
            if (path.startsWith ('/i/v1/analytics')) {
                // capture v1 answers with a result per event uuid
                const results: Record<string, any> = {};
                for (const event of json?.batch ?? []) {
                    results[event.uuid] = { 'result': 'ok' };
                }
                res.writeHead (200, { 'content-type': 'application/json' });
                res.end (JSON.stringify ({ results }));
                return;
            }
            res.writeHead (200, { 'content-type': 'application/json' });
            res.end ('{}');
        });
    });
    await new Promise<void> ((resolve) => server.listen (0, '127.0.0.1', () => resolve ()));
    sink.url = 'http://127.0.0.1:' + (server.address () as AddressInfo).port;
    sink.close = async () => {
        for (const res of held) {
            res.destroy ();
        }
        server.closeAllConnections ();
        await new Promise<void> ((resolve) => server.close (() => resolve ()));
    };
    return sink;
}

// Tools shaped like the hosted ones: the {ok, data|error} envelope as JSON text in
// content[0], isError on failure.
function envelope (value: any, isError = false) {
    return { 'content': [ { 'type': 'text' as const, 'text': JSON.stringify (value) } ], ...(isError ? { 'isError': true } : {}) };
}

export const TEST_ROOT_ERROR_PATH = '/home/someone/deploy/ccxt/mcp/hosted/src/tools/boom.ts';

export function buildTestServer (telemetry: Telemetry): McpServer {
    const server = new McpServer ({ 'name': 'ccxt-mcp', 'version': 'test' });
    const loose = z.record (z.string (), z.any ()).optional ();
    server.registerTool ('get_tickers', {
        'description': 'Get tickers',
        'inputSchema': z.object ({ 'exchange': z.string (), 'symbols': z.array (z.string ()).optional (), 'params': loose, 'accounts': z.array (z.any ()).optional (), 'note': z.string ().optional () }),
    }, async (args: any) => {
        telemetry.annotate ({ 'cache': 'hit' });
        telemetry.log ('info', 'tool ran', { 'tool': 'get_tickers', 'arguments': args, 'headers': { 'x': 1 } });
        return envelope ({ 'ok': true, 'data': { 'BTC/USD': { 'last': 1, 'padding': 'x'.repeat (5000) } }, 'argKeys': Object.keys (args) });
    });
    server.registerTool ('get_orderbook', {
        'description': 'Get an order book',
        'inputSchema': z.object ({ 'exchange': z.string (), 'symbol': z.string () }),
    }, async () => envelope ({ 'ok': false, 'error': { 'code': 'BAD_SYMBOL', 'type': 'BadSymbol', 'message': 'kraken does not have market symbol NOPE/USD', 'retryable': false } }, true));
    server.registerTool ('get_ohlcv', {
        'description': 'Get candles',
        'inputSchema': z.object ({ 'exchange': z.string (), 'symbol': z.string () }),
    }, async () => {
        throw new Error ('unexpected failure in ' + TEST_ROOT_ERROR_PATH + ':12');
    });
    server.registerTool ('get_trades', {
        'description': 'Get trades',
        'inputSchema': z.object ({ 'exchange': z.string () }),
    }, async () => envelope ({ 'ok': false, 'error': { 'code': 'INTERNAL_ERROR', 'type': 'TypeError', 'message': 'x is undefined', 'retryable': false } }, true));
    server.registerTool ('get_balance', {
        'description': 'Get balance',
        'inputSchema': z.object ({ 'account': z.string ().optional () }),
    }, async () => envelope ({ 'ok': false, 'error': { 'code': 'ACCOUNT_REQUIRED', 'message': 'account data needs the local ccxt-mcp server', 'retryable': false } }, true));
    telemetry.instrument (server);
    return server;
}

export interface TestMcp {
    url: URL;
    close: () => Promise<void>;
}

// The hosted request path in miniature: a request id and client key from the HTTP layer,
// the telemetry scope around the SDK's stateless handler, requestDone after the response.
export async function startTestMcp (telemetry: Telemetry): Promise<TestMcp> {
    const handler = createMcpHandler (() => buildTestServer (telemetry), { 'legacy': 'stateless' });
    let counter = 0;
    const fetchHandler = async (request: Request): Promise<Response> => {
        counter += 1;
        const ip = (request.headers.get ('x-forwarded-for') ?? '127.0.0.1').split (',')[0].trim ();
        const info: RequestInfo = {
            'requestId': request.headers.get ('x-test-request-id') ?? ('req-' + counter),
            'clientKey': ip,
            'clientHash': '',
            'userAgent': request.headers.get ('user-agent') ?? undefined,
            'authState': 'anonymous',
            ip,
        };
        const started = Date.now ();
        const response = await telemetry.runWithRequest (info, () => handler.fetch (request));
        telemetry.requestDone ({ 'requestId': info.requestId, 'status': response.status, 'durationMs': Date.now () - started, 'mcpMethod': 'tools/call' });
        return response;
    };
    const server = await new Promise<ReturnType<typeof serve>> ((resolve) => {
        const started = serve ({ 'fetch': fetchHandler, 'port': 0, 'hostname': '127.0.0.1' }, () => resolve (started));
    });
    return {
        'url': new URL ('http://127.0.0.1:' + (server.address () as AddressInfo).port + '/mcp'),
        'close': async () => {
            await handler.close ();
            await new Promise<void> ((resolve) => server.close (() => resolve ()));
        },
    };
}

// A client whose every HTTP request carries a fixed request id and a forwarded address,
// so the test can find the events of one call by request_id.
export async function connectClient (url: URL, mode: 'legacy' | 'auto', headers: () => Record<string, string>): Promise<Client> {
    const client = new Client ({ 'name': 'telemetry-test', 'version': '1.0.0' }, { 'versionNegotiation': { mode } } as any);
    const transport = new StreamableHTTPClientTransport (url, {
        'fetch': (input: any, init: any = {}) => {
            const merged = new Headers (init.headers ?? {});
            for (const [ key, value ] of Object.entries (headers ())) {
                merged.set (key, value);
            }
            return fetch (input, { ...init, 'headers': merged });
        },
    } as any);
    await client.connect (transport);
    return client;
}

export function wait (ms: number): Promise<void> {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}
