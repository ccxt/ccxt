import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildViewCatalog, readUiAsset, viewUri, VIEW_SOURCES } from '../../ts/ui.js';
import { connect, UI_META_KEYS, UI_MIME, UI_TOOLS, uiUri } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). What the server advertises: the three show_* tools and their
// versioned ui:// resources, each one a self-contained document.

const VERSIONED_URI = /^ui:\/\/ccxt\/(chart|orderbook|tickers)\.[0-9a-f]{12}\.html$/;

for (const era of [ 'legacy', 'modern' ] as const) {
    test ('tools/list (' + era + '): the three show_* tools — and only they — advertise a ui:// resource', async () => {
        const client = await connect ({ era });
        const { tools } = await client.listTools ();
        const byName = new Map (tools.map ((tool: any) => [ tool.name, tool ]));
        for (const name of Object.keys (UI_TOOLS)) {
            const tool: any = byName.get (name);
            const uri = uiUri (name);
            assert.match (uri, VERSIONED_URI);
            assert.ok (tool !== undefined, name + ' must be listed');
            // the standard key, its deprecated flat predecessor and ChatGPT's alias all name
            // the same versioned resource
            // (openai/widgetAccessible: in ChatGPT the view may call tools itself — Refresh and live_update)
            assert.deepEqual (tool._meta, { 'ui': { 'resourceUri': uri }, 'ui/resourceUri': uri, 'openai/outputTemplate': uri, 'openai/widgetAccessible': true }, name + ' _meta');
            // public market data: read-only, and usable without an account
            assert.equal (tool.annotations?.readOnlyHint, true, name + ' must be readOnly');
            assert.equal (tool.annotations?.destructiveHint, false, name);
            assert.equal (tool.annotations?.openWorldHint, true, name);
            assert.ok (!('account' in (tool.inputSchema?.properties ?? {})), name + ' takes no account');
            // structuredContent is always returned, so the tool declares what it holds
            assert.equal (tool.outputSchema?.type, 'object', name + ' must declare an object outputSchema');
            assert.ok ((tool.outputSchema.required ?? []).includes ('ui'), name + ' outputSchema requires ui');
        }
        const others = tools.filter ((tool: any) => !(tool.name in UI_TOOLS));
        assert.ok (others.length > 20, 'the non-UI tools are listed too');
        for (const tool of others as any[]) {
            // the views' app-only refresh tool carries ui.visibility, never a resource
            if (tool.name === 'live_update') {
                assert.deepEqual (tool._meta, { 'ui': { 'visibility': [ 'app' ] }, 'openai/visibility': 'private', 'openai/widgetAccessible': true });
                continue;
            }
            for (const key of UI_META_KEYS) {
                assert.ok (tool._meta === undefined || !(key in tool._meta), tool.name + ' must not carry _meta["' + key + '"]');
            }
        }
        await client.close ();
    });

    test ('resources/list and resources/read agree with the tools (' + era + ')', async () => {
        const client = await connect ({ era });
        const { tools } = await client.listTools ();
        const { resources } = await client.listResources ();
        const uris = new Set (resources.map ((resource: any) => resource.uri));
        for (const tool of tools as any[]) {
            const uri = tool._meta?.ui?.resourceUri;
            if (uri !== undefined) {
                assert.ok (uris.has (uri), tool.name + ' points at an unlisted resource ' + uri);
                const read: any = await client.readResource ({ uri });
                assert.equal (read.contents[0].uri, uri, tool.name);
                // the URI is the hash of exactly the document it serves
                assert.equal (viewUri (UI_TOOLS[tool.name], read.contents[0].text), uri, tool.name);
            }
        }
        await client.close ();
    });
}

// ---------------------------------------------------------------------------------------
// (b) resources

test ('resources/list: three versioned ui:// resources with the MCP Apps mime type', async () => {
    const client = await connect ();
    assert.ok (client.getServerCapabilities ()?.resources !== undefined, 'server must advertise the resources capability');
    const { resources } = await client.listResources ();
    const ui = resources.filter ((resource: any) => resource.uri.startsWith ('ui://'));
    assert.deepEqual (ui.map ((resource: any) => resource.uri).sort (), Object.keys (UI_TOOLS).map (uiUri).sort ());
    for (const resource of ui as any[]) {
        assert.match (resource.uri, VERSIONED_URI);
        assert.equal (resource.mimeType, UI_MIME, resource.uri);
        assert.ok (typeof resource.name === 'string' && resource.name.length > 0);
        assert.ok (typeof resource.title === 'string' && resource.title.length > 0);
        assert.ok (typeof resource.description === 'string' && resource.description.length > 0);
        assert.equal (resource._meta?.ui?.prefersBorder, true, resource.uri + ' list entry _meta.ui.prefersBorder');
    }
    assert.equal (new Set (ui.map ((resource: any) => resource.name)).size, 3);
    await client.close ();
});

// Hosts cache a view by URI. A changed view must therefore be a new URI, and the old URI must
// stop resolving instead of serving the new document under the old name.
test ('versioned URIs: changing a view changes its URI, and the old URI is no longer served', async () => {
    const current = buildViewCatalog ();
    // the same files, with one byte more in the chart template (and only there)
    const edited = buildViewCatalog ((file) => readUiAsset (file) + ((file === 'chart.html') ? ' ' : ''));
    assert.notEqual (edited.chart.uri, current.chart.uri, 'a changed chart must get a new URI');
    assert.equal (edited.orderbook.uri, current.orderbook.uri, 'an unchanged view keeps its URI');
    assert.equal (edited.tickers.uri, current.tickers.uri, 'an unchanged view keeps its URI');
    // a change to a shared fragment changes every view that inlines it
    const bridgeEdited = buildViewCatalog ((file) => readUiAsset (file) + ((file === 'bridge.js') ? '\n' : ''));
    for (const view of Object.keys (VIEW_SOURCES) as ('chart' | 'orderbook' | 'tickers')[]) {
        assert.notEqual (bridgeEdited[view].uri, current[view].uri, view + ' inlines bridge.js');
    }
    const client = await connect ({ 'views': edited });
    const { tools } = await client.listTools ();
    const chart: any = tools.find ((tool: any) => tool.name === 'show_chart');
    assert.equal (chart._meta.ui.resourceUri, edited.chart.uri);
    assert.equal (chart._meta['openai/outputTemplate'], edited.chart.uri);
    const read: any = await client.readResource ({ 'uri': edited.chart.uri });
    assert.equal (read.contents[0].text, edited.chart.html);
    await assert.rejects (client.readResource ({ 'uri': current.chart.uri }), 'the previous chart URI must not be served');
    // nor the unversioned name of earlier releases
    await assert.rejects (client.readResource ({ 'uri': 'ui://ccxt/chart.html' }));
    const { resources } = await client.listResources ();
    assert.ok (!resources.some ((resource: any) => resource.uri === current.chart.uri));
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

for (const toolName of Object.keys (UI_TOOLS)) {
    const uri = uiUri (toolName);
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
