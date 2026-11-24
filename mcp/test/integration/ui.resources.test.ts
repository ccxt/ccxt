import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { waitForViewFiles } from '../helpers/fake-ccxt.js';
import { ACCOUNT_UI_TOOLS, ALL_UI_TOOLS, connect, UI_META_KEYS, UI_MIME, UI_TOOLS } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). What the server advertises: the six show_* tools and their
// ui:// resources, each one a self-contained document.

test ('tools/list: the six show_* tools — and only they — advertise a ui:// resource', async () => {
    const client = await connect ({ 'accounts': { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } } });
    const { tools } = await client.listTools ();
    const byName = new Map (tools.map ((tool: any) => [ tool.name, tool ]));
    for (const [ name, uri ] of Object.entries (UI_TOOLS)) {
        const tool: any = byName.get (name);
        assert.ok (tool !== undefined, name + ' must be listed');
        assert.deepEqual (tool._meta, { 'ui': { 'resourceUri': uri }, 'ui/resourceUri': uri, 'openai/outputTemplate': uri }, name + ' _meta');
        // public market data: read-only, and usable without an account — show_chart alone
        // accepts one, optionally, for its open-orders overlay
        assert.equal (tool.annotations?.readOnlyHint, true, name + ' must be readOnly');
        assert.equal ('account' in (tool.inputSchema?.properties ?? {}), name === 'show_chart', name + ' account parameter');
        assert.ok (!(tool.inputSchema?.required ?? []).includes ('account'), name + ' must not require an account');
        // structuredContent is deliberately un-schema'd (the view contract lives in the view);
        // declaring an outputSchema would make the SDK validate every result against it
        assert.equal (tool.outputSchema, undefined, name + ' must not declare an outputSchema');
    }
    for (const [ name, uri ] of Object.entries (ACCOUNT_UI_TOOLS)) {
        const tool: any = byName.get (name);
        assert.ok (tool !== undefined, name + ' must be listed');
        assert.deepEqual (tool._meta, { 'ui': { 'resourceUri': uri }, 'ui/resourceUri': uri, 'openai/outputTemplate': uri }, name + ' _meta');
        assert.equal (tool.annotations?.readOnlyHint, true, name + ' must be readOnly');
        assert.ok ((tool.inputSchema?.required ?? []).includes ('account'), name + ' must require an account');
        assert.equal (tool.outputSchema, undefined, name + ' must not declare an outputSchema');
    }
    const others = tools.filter ((tool: any) => !(tool.name in ALL_UI_TOOLS));
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

test ('resources/list: six ui:// resources with the MCP Apps mime type', async () => {
    const client = await connect ();
    assert.ok (client.getServerCapabilities ()?.resources !== undefined, 'server must advertise the resources capability');
    const { resources } = await client.listResources ();
    const ui = resources.filter ((resource: any) => resource.uri.startsWith ('ui://'));
    assert.deepEqual (ui.map ((resource: any) => resource.uri).sort (), Object.values (ALL_UI_TOOLS).sort ());
    for (const resource of ui as any[]) {
        assert.equal (resource.mimeType, UI_MIME, resource.uri);
        assert.ok (typeof resource.name === 'string' && resource.name.length > 0);
        assert.ok (typeof resource.title === 'string' && resource.title.length > 0);
        assert.ok (typeof resource.description === 'string' && resource.description.length > 0);
        assert.equal (resource._meta?.ui?.prefersBorder, true, resource.uri + ' list entry _meta.ui.prefersBorder');
    }
    assert.equal (new Set (ui.map ((resource: any) => resource.name)).size, 6);
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

for (const [ toolName, uri ] of Object.entries (ALL_UI_TOOLS)) {
    test ('resources/read ' + uri + ': one self-contained MCP Apps document', async () => {
        await waitForViewFiles ([ uri.slice (uri.lastIndexOf ('/') + 1) ]);
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
