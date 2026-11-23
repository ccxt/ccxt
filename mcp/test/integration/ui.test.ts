import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import vm from 'node:vm';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
import { FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

// MCP Apps UI (io.modelcontextprotocol/ui): the three show_* tools, their ui:// resources and
// the model-summary / view-payload split, exercised over a real client <-> server pair.

const UI_MIME = 'text/html;profile=mcp-app';
const UI_EXTENSION = 'io.modelcontextprotocol/ui';
const UI_CAPABILITIES = { 'extensions': { [UI_EXTENSION]: { 'mimeTypes': [ UI_MIME ] } } };
const UI_TOOLS: Record<string, string> = {
    'show_chart': 'ui://ccxt/chart.html',
    'show_orderbook': 'ui://ccxt/orderbook.html',
    'show_tickers': 'ui://ccxt/tickers.html',
};
const UI_META_KEYS = [ 'ui', 'ui/resourceUri', 'openai/outputTemplate' ];
const T0 = 1700000000000;
const HOUR = 3600000;

interface ConnectOptions {
    accounts?: any;
    capabilities?: any; // client capabilities — omit for a host without MCP Apps support
    exchangeClass?: any; // a FakeExchange subclass with test-specific market data
}

async function connect (options: ConnectOptions = {}): Promise<Client> {
    const exchangeClass = options.exchangeClass;
    const { server } = createServer ({
        'config': makeConfig (options.accounts ?? {}),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': (exchangeClass === undefined) ? fakePoolsDeps : { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = (options.capabilities === undefined)
        ? new Client ({ 'name': 'ui-test', 'version': '0.0.1' })
        : new Client ({ 'name': 'ui-test', 'version': '0.0.1' }, { 'capabilities': options.capabilities });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return client;
}

// the raw tool result plus its parsed text envelope
async function callRaw (client: Client, name: string, args: any): Promise<{ result: any, envelope: any }> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    assert.equal (result.content.length, 1, name + ' returns exactly one content item');
    assert.equal (result.content[0].type, 'text');
    return { result, 'envelope': JSON.parse (result.content[0].text) };
}

// ---------------------------------------------------------------------------------------
// (a) tools/list

test ('tools/list: the three show_* tools — and only they — advertise a ui:// resource', async () => {
    const client = await connect ({ 'accounts': { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } } });
    const { tools } = await client.listTools ();
    const byName = new Map (tools.map ((tool: any) => [ tool.name, tool ]));
    for (const [ name, uri ] of Object.entries (UI_TOOLS)) {
        const tool: any = byName.get (name);
        assert.ok (tool !== undefined, name + ' must be listed');
        assert.deepEqual (tool._meta, { 'ui': { 'resourceUri': uri }, 'ui/resourceUri': uri, 'openai/outputTemplate': uri }, name + ' _meta');
        // public market data: read-only, no account parameter
        assert.equal (tool.annotations?.readOnlyHint, true, name + ' must be readOnly');
        assert.ok (!('account' in (tool.inputSchema?.properties ?? {})), name + ' must not take an account');
        // structuredContent is deliberately un-schema'd (the view contract lives in the view);
        // declaring an outputSchema would make the SDK validate every result against it
        assert.equal (tool.outputSchema, undefined, name + ' must not declare an outputSchema');
    }
    const others = tools.filter ((tool: any) => !(tool.name in UI_TOOLS));
    assert.ok (others.length > 20, 'the non-UI tools are listed too');
    for (const tool of others as any[]) {
        for (const key of UI_META_KEYS) {
            assert.ok (tool._meta === undefined || !(key in tool._meta), tool.name + ' must not carry _meta["' + key + '"]');
        }
    }
    await client.close ();
});

test ('tools/list: every advertised ui:// uri is a listed resource', async () => {
    const client = await connect ();
    const { tools } = await client.listTools ();
    const { resources } = await client.listResources ();
    const uris = new Set (resources.map ((resource: any) => resource.uri));
    for (const tool of tools as any[]) {
        const uri = tool._meta?.ui?.resourceUri;
        if (uri !== undefined) {
            assert.ok (uris.has (uri), tool.name + ' points at an unlisted resource ' + uri);
        }
    }
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// (b) resources

test ('resources/list: three ui:// resources with the MCP Apps mime type', async () => {
    const client = await connect ();
    assert.ok (client.getServerCapabilities ()?.resources !== undefined, 'server must advertise the resources capability');
    const { resources } = await client.listResources ();
    const ui = resources.filter ((resource: any) => resource.uri.startsWith ('ui://'));
    assert.deepEqual (ui.map ((resource: any) => resource.uri).sort (), Object.values (UI_TOOLS).sort ());
    for (const resource of ui as any[]) {
        assert.equal (resource.mimeType, UI_MIME, resource.uri);
        assert.ok (typeof resource.name === 'string' && resource.name.length > 0);
        assert.ok (typeof resource.title === 'string' && resource.title.length > 0);
        assert.ok (typeof resource.description === 'string' && resource.description.length > 0);
        assert.equal (resource._meta?.ui?.prefersBorder, true, resource.uri + ' list entry _meta.ui.prefersBorder');
    }
    assert.equal (new Set (ui.map ((resource: any) => resource.name)).size, 3);
    await client.close ();
});

// every <script>…</script> / <style>…</style> block of a document, by plain tag scanning
function blocks (html: string, tag: string): { attributes: string, body: string }[] {
    const out: { attributes: string, body: string }[] = [];
    const pattern = new RegExp ('<' + tag + '\\b([^>]*)>([\\s\\S]*?)</' + tag + '\\s*>', 'gi');
    for (const match of html.matchAll (pattern)) {
        out.push ({ 'attributes': match[1], 'body': match[2] });
    }
    return out;
}

function count (text: string, pattern: RegExp): number {
    return [ ...text.matchAll (pattern) ].length;
}

// The host renders a view under a CSP that blocks every external origin, so a view that
// references one is broken. An absolute URL is only legitimate as an inert XML namespace
// string (document.createElementNS ('http://www.w3.org/2000/svg', …)) — so loader contexts
// are checked one by one, and every remaining URL literal must be a w3.org namespace.
function assertSelfContained (html: string, label: string): void {
    const external = '(?:https?:|wss?:|ftp:)?//';
    const checks: Record<string, RegExp> = {
        'a resource attribute with an external URL': new RegExp ('\\b(?:src|href|srcset|action|formaction|poster|data|manifest|ping|background|xlink:href)\\s*=\\s*["\']?\\s*' + external, 'i'),
        'a css url() with an external URL': new RegExp ('url\\(\\s*["\']?\\s*' + external, 'i'),
        'a css @import': /@import\b/i,
        'a script loaded by src': /<script\b[^>]*\bsrc\s*=/i,
        'a <link> element': /<link\b/i,
        'a <base> element': /<base\b/i,
        'an embedded frame/object': /<(?:iframe|frame|object|embed|portal)\b/i,
        'a meta refresh': /<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i,
        'an ES module import': /(?:^|[;{}\s])import\s*(?:\(|["'{*]|[A-Za-z_$][\w$]*\s*(?:,|from\b))/m,
        'importScripts': /\bimportScripts\s*\(/,
        'a fetch call': /\bfetch\s*\(/,
        'XMLHttpRequest': /\bXMLHttpRequest\b/,
        'a WebSocket/EventSource': /\bnew\s+(?:WebSocket|EventSource|Worker|SharedWorker)\b/,
        'sendBeacon': /\bsendBeacon\b/,
        'a window.open / location navigation': /\bwindow\.open\s*\(|\blocation\.(?:href|assign|replace)\b/,
    };
    for (const [ what, pattern ] of Object.entries (checks)) {
        const match = html.match (pattern);
        assert.equal (match, null, label + ' contains ' + what + ': ' + JSON.stringify (match?.[0]) + ' at offset ' + match?.index);
    }
    for (const match of html.matchAll (/\b(?:https?|wss?|ftp):\/\/[^\s'"`<>)\\]+/gi)) {
        assert.match (match[0], /^http:\/\/www\.w3\.org\/(?:2000\/svg|1999\/xhtml|1999\/xlink|XML\/1998\/namespace)$/, label + ' contains a non-namespace absolute URL: ' + match[0]);
    }
}

for (const [ toolName, uri ] of Object.entries (UI_TOOLS)) {
    test ('resources/read ' + uri + ': one self-contained MCP Apps document', async () => {
        const client = await connect ();
        const result: any = await client.readResource ({ uri });
        assert.equal (result.contents.length, 1);
        const item = result.contents[0];
        assert.equal (item.uri, uri);
        assert.equal (item.mimeType, UI_MIME);
        assert.equal (item._meta?.ui?.prefersBorder, true);
        assert.equal (item.blob, undefined);
        const html: string = item.text;
        assert.equal (typeof html, 'string');
        assert.match (html, /^\s*<!doctype html>/i, 'starts with a doctype');
        assert.match (html, /<\/html>\s*$/i, 'ends with </html>');
        // includes resolved, bridge inlined
        assert.ok (!html.includes ('@include'), 'unresolved @include marker');
        assert.ok (html.includes ('window.ccxtApp'), 'bridge runtime (window.ccxtApp) missing');
        assert.ok (html.includes ('ui/initialize'), 'ui/initialize handshake missing');
        assert.ok (html.includes ('ui/notifications/tool-result'), 'tool-result notification handler missing');
        assertSelfContained (html, uri);
        // An inlined fragment containing "</script" or "</style" would end its element early
        // and break the document. Each template has exactly two scripts (bridge + view) and
        // one style block; any stray terminator changes the counts, and every script body
        // must still be a syntactically complete program on its own.
        const scripts = blocks (html, 'script');
        const styles = blocks (html, 'style');
        assert.equal (count (html, /<script\b/gi), 2, 'expected exactly 2 <script> openings');
        assert.equal (count (html, /<\/script/gi), 2, 'expected exactly 2 </script terminators');
        assert.equal (count (html, /<style\b/gi), 1, 'expected exactly 1 <style> opening');
        assert.equal (count (html, /<\/style/gi), 1, 'expected exactly 1 </style terminator');
        assert.equal (scripts.length, 2);
        assert.equal (styles.length, 1);
        assert.ok (!html.includes ('<!--'), 'an html comment opener inside a script changes how the parser finds </script>');
        for (const [ index, script ] of scripts.entries ()) {
            assert.equal (script.attributes.trim (), '', 'inline classic script, no attributes');
            assert.doesNotThrow (() => new vm.Script (script.body, { 'filename': uri + '#script' + index }), uri + ' script ' + index + ' must parse');
        }
        assert.ok (scripts[0].body.includes ('window.ccxtApp ='), 'the first script is the bridge');
        assert.ok (!scripts[1].body.includes ('window.ccxtApp ='), 'the second script is the view');
        assert.ok (scripts[1].body.includes ('ccxtApp'), 'the view script uses the bridge');
        assert.ok (styles[0].body.includes ('--'), 'shared css tokens inlined');
        // the view renders the payload of its own tool
        const view = toolName.replace ('show_', '');
        assert.ok (new RegExp ('[\'"]' + view + '[\'"]').test (scripts[1].body) || html.includes (view), uri + ' should reference its view name');
        await client.close ();
    });
}

test ('resources/read: an unknown ui:// uri is a protocol error, not a view', async () => {
    const client = await connect ();
    await assert.rejects (client.readResource ({ 'uri': 'ui://ccxt/nope.html' }));
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// (c) show_chart

test ('show_chart: the model gets a summary, the view gets the candles', async () => {
    const client = await connect ();
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    // 200 fake candles of [ts, 1, 2, 0.5, 1.5, 100], one per hour
    assert.deepEqual (envelope.data, {
        'count': 200,
        'from': new Date (T0).toISOString (),
        'to': new Date (T0 + 199 * HOUR).toISOString (),
        'open': 1,
        'close': 1.5,
        'changePercent': 50,
        'high': 2,
        'low': 0.5,
        'volume': 20000,
    });
    // never the rows: the text stays small and carries no candle array
    assert.ok (!Array.isArray (envelope.data));
    assert.ok (!result.content[0].text.includes (String (T0 + HOUR)), 'candle rows leaked into the text content');
    assert.ok (result.content[0].text.length < 1500, 'summary text should be compact, got ' + result.content[0].text.length);
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.equal (envelope.meta.timeframe, '1h');
    const view = result.structuredContent;
    assert.equal (view.view, 'chart');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.timeframe, '1h');
    assert.deepEqual (view.timeframes, [ '1m', '1h', '1d' ]);
    assert.equal (view.limit, 200);
    assert.equal (view.candles.length, 200);
    assert.deepEqual (view.candles[0], [ T0, 1, 2, 0.5, 1.5, 100 ]);
    assert.deepEqual (view.candles[199], [ T0 + 199 * HOUR, 1, 2, 0.5, 1.5, 100 ]);
    await client.close ();
});

test ('show_chart: meta.ui is "unsupported" for a host without the MCP Apps extension', async () => {
    const client = await connect ();
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.match (envelope.meta.notice, /did not advertise MCP Apps/);
    assert.match (envelope.meta.notice, /get_ohlcv/);
    // the view payload is still attached — a host is free to render it anyway
    assert.equal (result.structuredContent.view, 'chart');
    await client.close ();
});

test ('show_chart: meta.ui is "displayed" when the client advertises the MCP Apps extension', async () => {
    const client = await connect ({ 'capabilities': UI_CAPABILITIES });
    const { envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
    assert.equal (envelope.meta.ui, 'displayed');
    assert.match (envelope.meta.notice, /displayed to the user/);
    for (const [ name, args ] of [ [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' } ], [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } ] ] as [ string, any ][]) {
        assert.equal ((await callRaw (client, name, args)).envelope.meta.ui, 'displayed', name);
    }
    await client.close ();
});

test ('show_chart: the extension only counts when it lists our mime type', async () => {
    for (const extension of [ {}, { 'mimeTypes': [] }, { 'mimeTypes': [ 'text/html' ] }, { 'mimeTypes': 'text/html;profile=mcp-app' } ]) {
        const client = await connect ({ 'capabilities': { 'extensions': { [UI_EXTENSION]: extension } } });
        const { envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
        assert.equal (envelope.meta.ui, 'unsupported', JSON.stringify (extension));
        await client.close ();
    }
    const other = await connect ({ 'capabilities': { 'extensions': { 'com.example/other': { 'mimeTypes': [ UI_MIME ] } } } });
    assert.equal ((await callRaw (other, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 })).envelope.meta.ui, 'unsupported');
    await other.close ();
});

test ('show_chart: limit defaults to 200 and is clamped to 1..500', async () => {
    const client = await connect ();
    const cases: [ any, number ][] = [ [ undefined, 200 ], [ 5, 5 ], [ 500, 500 ], [ 501, 500 ], [ 100000, 500 ], [ 0, 1 ], [ -7, 1 ] ];
    for (const [ limit, expected ] of cases) {
        const args: any = { 'exchange': 'fakex', 'symbol': 'BTC/USDT' };
        if (limit !== undefined) {
            args['limit'] = limit;
        }
        const { result, envelope } = await callRaw (client, 'show_chart', args);
        assert.equal (envelope.ok, true, 'limit ' + limit);
        assert.equal (result.structuredContent.limit, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.candles.length, expected, 'limit ' + limit);
        assert.equal (envelope.data.count, expected, 'limit ' + limit);
    }
    await client.close ();
});

// a venue that ignores the limit, answers newest-first and emits junk rows
class MessyCandlesExchange extends FakeExchange {
    async fetchOHLCV (): Promise<any> {
        const rows: any[] = [];
        for (let i = 599; i >= 0; i--) {
            rows.push ([ T0 + i * HOUR, 10 + i, 20 + i, 5 + i, 15 + i, (i % 2 === 0) ? 1 : undefined ]);
        }
        rows.splice (10, 0, null, [ T0 - HOUR, null, null, null, null, null ], [ 'x', 1, 2, 3, 4, 5 ]);
        return rows;
    }
}

test ('show_chart: candles are cleaned, sorted ascending and cut to the most recent limit', async () => {
    const client = await connect ({ 'exchangeClass': MessyCandlesExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 50 });
    const candles: number[][] = result.structuredContent.candles;
    assert.equal (candles.length, 50);
    for (const [ index, candle ] of candles.entries ()) {
        assert.equal (candle.length, 6);
        assert.ok (candle.every ((value) => typeof value === 'number' && Number.isFinite (value)), 'row ' + index + ' must be six finite numbers');
        if (index > 0) {
            assert.ok (candle[0] > candles[index - 1][0], 'timestamps must ascend at row ' + index);
        }
    }
    // the 50 most recent of the 600 valid rows: i = 550 … 599, missing volume -> 0
    assert.deepEqual (candles[0], [ T0 + 550 * HOUR, 560, 570, 555, 565, 1 ]);
    assert.deepEqual (candles[49], [ T0 + 599 * HOUR, 609, 619, 604, 614, 0 ]);
    assert.equal (envelope.data.count, 50);
    assert.equal (envelope.data.open, 560);
    assert.equal (envelope.data.close, 614);
    assert.equal (envelope.data.high, 619);
    assert.equal (envelope.data.low, 555);
    assert.equal (envelope.data.volume, 25);
    assert.equal (envelope.data.from, new Date (T0 + 550 * HOUR).toISOString ());
    assert.equal (envelope.data.to, new Date (T0 + 599 * HOUR).toISOString ());
    await client.close ();
});

class EmptyCandlesExchange extends FakeExchange {
    async fetchOHLCV (): Promise<any> {
        return [];
    }
}

test ('show_chart: no candles is an ok result with a zero count and a notice', async () => {
    const client = await connect ({ 'exchangeClass': EmptyCandlesExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, { 'count': 0 });
    assert.match (envelope.meta.notice, /returned no candles/);
    assert.deepEqual (result.structuredContent.candles, []);
    assert.equal (result.structuredContent.view, 'chart');
    await client.close ();
});

test ('show_chart: an explicit timeframe and since are honored', async () => {
    const client = await connect ();
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '1d', 'since': '2024-01-01T00:00:00Z', 'limit': 2 });
    assert.equal (envelope.ok, true);
    assert.equal (envelope.meta.timeframe, '1d');
    assert.equal (result.structuredContent.timeframe, '1d');
    const bad = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': 'not-a-date' });
    assert.equal (bad.envelope.ok, false);
    assert.equal (bad.envelope.error.code, 'BAD_REQUEST');
    assert.equal (bad.result.structuredContent, undefined);
    await client.close ();
});

test ('show_chart: a bad timeframe is a plain-text error with no view payload', async () => {
    const client = await connect ({ 'capabilities': UI_CAPABILITIES });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '7m' });
    assert.equal (result.isError, true);
    assert.equal (envelope.ok, false);
    assert.equal (envelope.error.code, 'BAD_TIMEFRAME');
    assert.match (envelope.error.hint, /1m, 1h, 1d/);
    assert.equal (result.structuredContent, undefined);
    assert.ok (!('structuredContent' in result));
    await client.close ();
});

test ('show_*: an unknown exchange is UNKNOWN_EXCHANGE with no view payload', async () => {
    const client = await connect ();
    const calls: [ string, any ][] = [
        [ 'show_chart', { 'exchange': 'nope', 'symbol': 'BTC/USDT' } ],
        [ 'show_orderbook', { 'exchange': 'nope', 'symbol': 'BTC/USDT' } ],
        [ 'show_tickers', { 'exchange': 'nope', 'symbols': [ 'BTC/USDT' ] } ],
    ];
    for (const [ name, args ] of calls) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.equal (envelope.error.code, 'UNKNOWN_EXCHANGE', name);
        assert.match (envelope.error.hint, /fakex/, name);
        assert.equal (result.structuredContent, undefined, name);
    }
    await client.close ();
});

class FailingExchange extends FakeExchange {
    async fetchOHLCV (): Promise<any> {
        throw new Error ('fakex upstream exploded');
    }
}

test ('show_chart: an exchange failure takes the normal error path (text only)', async () => {
    const client = await connect ({ 'exchangeClass': FailingExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, true);
    assert.equal (envelope.ok, false);
    assert.ok (typeof envelope.error.code === 'string' && envelope.error.code.length > 0);
    assert.match (envelope.error.message, /upstream exploded/);
    assert.equal (result.structuredContent, undefined);
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// (d) show_orderbook

// 200 levels a side with a 2.0 spread; asks carry a third per-level element (kraken-style)
class BookExchange extends FakeExchange {
    async fetchOrderBook (symbol: string): Promise<any> {
        return {
            symbol,
            'timestamp': T0,
            'datetime': '2023-11-14T22:13:20.000Z',
            'nonce': 1,
            'bids': Array.from ({ 'length': 200 }, (_, i) => [ 49999 - i, 2 ]),
            'asks': Array.from ({ 'length': 200 }, (_, i) => [ 50001 + i, 1, T0 + i ]),
        };
    }
}

test ('show_orderbook: summary for the model, [price, amount] ladder for the view', async () => {
    const client = await connect ({ 'exchangeClass': BookExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, {
        'bestBid': 49999,
        'bestAsk': 50001,
        'bidLevels': 50,
        'askLevels': 50,
        'bidDepth': 100,
        'askDepth': 50,
        'mid': 50000,
        'spread': 2,
        'spreadPercent': 0.004,
    });
    assert.equal (envelope.data.bids, undefined);
    assert.equal (envelope.data.asks, undefined);
    assert.ok (result.content[0].text.length < 1500, 'summary text should be compact');
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.equal (envelope.meta.timestamp, T0);
    assert.equal (envelope.meta.datetime, '2023-11-14T22:13:20.000Z');
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.match (envelope.meta.notice, /get_orderbook/);
    const view = result.structuredContent;
    assert.equal (view.view, 'orderbook');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.base, 'BTC');
    assert.equal (view.quote, 'USDT');
    assert.equal (view.limit, 50);
    assert.equal (view.timestamp, T0);
    assert.equal (view.bids.length, 50);
    assert.equal (view.asks.length, 50);
    assert.deepEqual (view.bids[0], [ 49999, 2 ]);
    assert.deepEqual (view.bids[49], [ 49950, 2 ]);
    assert.deepEqual (view.asks[0], [ 50001, 1 ]);
    assert.deepEqual (view.asks[49], [ 50050, 1 ]);
    for (const level of [ ...view.bids, ...view.asks ]) {
        assert.equal (level.length, 2, 'every level is exactly [price, amount]');
    }
    await client.close ();
});

test ('show_orderbook: limit defaults to 50 and is clamped to 1..100', async () => {
    const client = await connect ({ 'exchangeClass': BookExchange });
    const cases: [ any, number ][] = [ [ undefined, 50 ], [ 5, 5 ], [ 100, 100 ], [ 101, 100 ], [ 5000, 100 ], [ 0, 1 ] ];
    for (const [ limit, expected ] of cases) {
        const args: any = { 'exchange': 'fakex', 'symbol': 'BTC/USDT' };
        if (limit !== undefined) {
            args['limit'] = limit;
        }
        const { result, envelope } = await callRaw (client, 'show_orderbook', args);
        assert.equal (envelope.ok, true, 'limit ' + limit);
        assert.equal (result.structuredContent.limit, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.bids.length, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.asks.length, expected, 'limit ' + limit);
        assert.equal (envelope.data.bidLevels, expected, 'limit ' + limit);
        assert.equal (envelope.data.askLevels, expected, 'limit ' + limit);
        assert.equal (envelope.data.bidDepth, expected * 2, 'limit ' + limit);
        assert.equal (envelope.data.askDepth, expected, 'limit ' + limit);
    }
    await client.close ();
});

class OneSidedBookExchange extends FakeExchange {
    async fetchOrderBook (symbol: string): Promise<any> {
        return { symbol, 'timestamp': undefined, 'datetime': undefined, 'bids': [ [ 49999, 3 ] ], 'asks': [] };
    }
}

test ('show_orderbook: a one-sided book has no mid/spread and still renders', async () => {
    const client = await connect ({ 'exchangeClass': OneSidedBookExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (envelope.ok, true);
    assert.equal (envelope.data.bestBid, 49999);
    assert.equal (envelope.data.bidDepth, 3);
    assert.equal (envelope.data.askLevels, 0);
    assert.equal (envelope.data.askDepth, 0);
    for (const key of [ 'bestAsk', 'mid', 'spread', 'spreadPercent' ]) {
        assert.ok (envelope.data[key] === undefined || envelope.data[key] === null, key + ' must be absent or null');
    }
    assert.deepEqual (result.structuredContent.bids, [ [ 49999, 3 ] ]);
    assert.deepEqual (result.structuredContent.asks, []);
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// (e) show_tickers

class TickerExchange extends FakeExchange {
    markets: Record<string, any> = {
        'BTC/USDT': { 'symbol': 'BTC/USDT', 'id': 'BTCUSDT', 'type': 'spot', 'base': 'BTC', 'quote': 'USDT' },
        'ETH/USDT': { 'symbol': 'ETH/USDT', 'id': 'ETHUSDT', 'type': 'spot', 'base': 'ETH', 'quote': 'USDT' },
    };

    async fetchTicker (symbol: string): Promise<any> {
        const eth = symbol === 'ETH/USDT';
        return {
            symbol,
            'timestamp': T0,
            'datetime': '2023-11-14T22:13:20.000Z',
            'last': eth ? 2000 : 50000,
            'bid': eth ? 1999 : 49999,
            'ask': eth ? 2001 : 50001,
            'high': eth ? 2100 : 51000,
            'low': eth ? 1900 : 49000,
            'open': eth ? 2050 : 48000,
            'close': eth ? 2000 : 50000,
            'change': eth ? -50 : 2000,
            'percentage': eth ? -2.439 : 4.1667,
            'baseVolume': eth ? 1000 : 10,
            'quoteVolume': eth ? 2000000 : 500000,
            'vwap': undefined,
            'markPrice': 1, // not a TICKER_FIELDS member — must be projected away
            'info': { 'raw': 'exchange-payload', 'internal': [ 1, 2, 3 ] },
        };
    }
}

test ('show_tickers: summary rows carry only symbol/last/percentage/quoteVolume', async () => {
    const client = await connect ({ 'exchangeClass': TickerExchange });
    const symbols = [ 'ETH/USDT', 'BTC/USDT' ];
    const { result, envelope } = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', symbols });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, [
        { 'symbol': 'ETH/USDT', 'last': 2000, 'percentage': -2.439, 'quoteVolume': 2000000 },
        { 'symbol': 'BTC/USDT', 'last': 50000, 'percentage': 4.1667, 'quoteVolume': 500000 },
    ]);
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.count, 2);
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.match (envelope.meta.notice, /get_tickers/);
    assert.ok (!result.content[0].text.includes ('exchange-payload'));
    const view = result.structuredContent;
    assert.equal (view.view, 'tickers');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.deepEqual (view.symbols, symbols);
    // request order, the full unified ticker minus info and non-unified extras
    assert.deepEqual (view.tickers.map ((ticker: any) => ticker.symbol), symbols);
    for (const ticker of view.tickers) {
        assert.ok (!('info' in ticker), 'info must be stripped from the view payload');
        assert.ok (!('markPrice' in ticker));
        for (const field of [ 'last', 'bid', 'ask', 'high', 'low', 'open', 'close', 'change', 'percentage', 'baseVolume', 'quoteVolume', 'timestamp', 'datetime' ]) {
            assert.ok (ticker[field] !== undefined, field + ' must reach the view');
        }
    }
    assert.ok (!JSON.stringify (view).includes ('exchange-payload'));
    assert.equal (view.tickers[0].high, 2100);
    assert.equal (view.tickers[1].low, 49000);
    await client.close ();
});

test ('show_tickers: a single symbol works and absent fields are simply omitted', async () => {
    // the stock fake ticker has no percentage/quoteVolume
    const client = await connect ();
    const { result, envelope } = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, [ { 'symbol': 'BTC/USDT', 'last': 50000 } ]);
    assert.equal (envelope.meta.count, 1);
    assert.equal (result.structuredContent.tickers.length, 1);
    assert.equal (result.structuredContent.tickers[0].info, undefined);
    assert.equal (result.structuredContent.tickers[0].bid, 49999);
    await client.close ();
});

test ('show_tickers: the symbols argument is bounded to 1..50 by the schema', async () => {
    const client = await connect ();
    for (const symbols of [ [], Array.from ({ 'length': 51 }, () => 'BTC/USDT') ]) {
        // the SDK reports an input-schema violation either as a protocol error or as an
        // isError result depending on its version — both are a rejection
        let rejected = false;
        try {
            const result: any = await client.callTool ({ 'name': 'show_tickers', 'arguments': { 'exchange': 'fakex', symbols } });
            rejected = result.isError === true;
            assert.equal (result.structuredContent, undefined);
        } catch (error) {
            rejected = true;
        }
        assert.ok (rejected, symbols.length + ' symbols must be rejected');
    }
    await client.close ();
});

// ---------------------------------------------------------------------------------------
// (f) secrets

const SECRET_KEY = 'FAKEKEY-UI-9f3c1e77a0';

// an exchange whose public payloads echo a credential back (signed-URL echoes and
// account-tagged labels are the real-world shape of this)
class LeakyExchange extends FakeExchange {
    name = 'Fakex [' + SECRET_KEY + ']';

    async fetchOrderBook (symbol: string): Promise<any> {
        return { 'symbol': symbol + '?key=' + SECRET_KEY, 'timestamp': T0, 'datetime': 'sig ' + SECRET_KEY, 'bids': [ [ 49999, 1 ] ], 'asks': [ [ 50001, 1 ] ] };
    }

    async fetchTicker (symbol: string): Promise<any> {
        return { symbol, 'last': 50000, 'datetime': 'sig ' + SECRET_KEY, 'info': { 'key': SECRET_KEY } };
    }
}

// makeConfig builds a ResolvedConfig directly, so the secret registration that loadConfig
// performs for every account credential (ts/config.ts registerAccountSecrets) is mirrored
// here with registerSecret — the same call, on the same process-wide redactor that
// test/unit/redact.test.ts drives. Everything after that (tool -> run -> toUiContent ->
// redact) is the production path.
async function withRegisteredSecret (fn: () => Promise<void>): Promise<void> {
    clearSecrets ();
    registerSecret (SECRET_KEY, 'apiKey');
    try {
        await fn ();
    } finally {
        clearSecrets ();
    }
}

test ('secrets: a credential echoed by exchange data is redacted in text AND structuredContent', async () => {
    await withRegisteredSecret (async () => {
        const client = await connect ({ 'accounts': { 'acc': { 'apiKey': SECRET_KEY, 'secret': 'FAKESECRET123456' } }, 'exchangeClass': LeakyExchange, 'capabilities': UI_CAPABILITIES });
        const calls: [ string, any ][] = [
            [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 } ],
            [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' } ],
            [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } ],
        ];
        for (const [ name, args ] of calls) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.ok, true, name);
            assert.ok (!JSON.stringify (result).includes (SECRET_KEY), name + ' leaked the apiKey');
            assert.equal (result.structuredContent.exchangeName, 'Fakex [[redacted:apiKey]]', name);
        }
        const book = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
        assert.equal (book.result.structuredContent.symbol, 'BTC/USDT?key=[redacted:apiKey]');
        assert.equal (book.result.structuredContent.datetime, 'sig [redacted:apiKey]');
        assert.equal (book.envelope.meta.symbol, 'BTC/USDT?key=[redacted:apiKey]');
        // the numeric payload around the redacted strings is untouched
        assert.deepEqual (book.result.structuredContent.bids, [ [ 49999, 1 ] ]);
        const tickers = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (tickers.result.structuredContent.tickers[0].datetime, 'sig [redacted:apiKey]');
        // a secret passed in by the caller is not echoed back either
        const echoed = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': SECRET_KEY, 'limit': 3 });
        assert.ok (!JSON.stringify (echoed.result).includes (SECRET_KEY));
        assert.equal (echoed.result.structuredContent.symbol, '[redacted:apiKey]');
        await client.close ();
    });
});

test ('secrets: the view payload passes through untouched when nothing is registered', async () => {
    clearSecrets ();
    const client = await connect ({ 'exchangeClass': LeakyExchange });
    const { result } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.structuredContent.exchangeName, 'Fakex [' + SECRET_KEY + ']');
    await client.close ();
});

// Regression: a credential made only of digits (exchange `uid`s usually are) must never be
// replaced inside a NUMBER. Redacting the serialized view turned the timestamp 1700000000000
// into 1[redacted:uid]0000 — no longer JSON — so every show_* call failed for that user;
// toUiContent now redacts string leaves only.
test ('secrets: a numeric credential that collides with a number must not break the view payload', async () => {
    clearSecrets ();
    registerSecret ('70000000', 'uid'); // substring of the fake candle timestamps 1700000000000…
    try {
        const client = await connect ();
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
        await client.close ();
        assert.equal (envelope.ok, true, 'show_chart failed: ' + JSON.stringify (envelope.error));
        assert.equal (result.structuredContent?.view, 'chart');
        assert.equal (result.structuredContent.candles.length, 3);
    } finally {
        clearSecrets ();
    }
});
