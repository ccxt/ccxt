import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, rpc } from './helpers/harness.js';
import { HOSTED_TOOLS } from '../src/profile.js';
import { parseUiDomain } from '../src/config.js';

// What the OpenAI plugin directory reads from the server itself: per-tool auth
// (securitySchemes) and the views' dedicated origin (_meta.ui.domain on resources/read).
// The domain goes only to callers from OpenAI's egress ranges: Claude derives its own from a
// hash of the connector URL, so it must not receive ours.

// a /32 from the embedded OpenAI connector ranges (src/data/openai-egress.ts)
const OPENAI_ADDRESS = '100.31.168.162';
const ANTHROPIC_ADDRESS = '160.79.104.10';
const OTHER_ADDRESS = '203.0.113.7';

async function readView (url: string, ip: string): Promise<any> {
    const listed = await rpc (url, 'resources/list', {}, { 'x-real-ip': ip });
    const uri = listed.body.result.resources[0].uri;
    const read = await rpc (url, 'resources/read', { uri }, { 'x-real-ip': ip });
    return { 'listed': listed.body.result.resources[0], 'contents': read.body.result.contents[0] };
}

test ('directory: every hosted tool declares noauth securitySchemes in _meta', async () => {
    const harness = await startHarness ();
    try {
        const listed = await rpc (harness.url, 'tools/list');
        const tools = listed.body.result.tools;
        assert.deepEqual (tools.map ((tool: any) => tool.name).sort (), Object.keys (HOSTED_TOOLS).sort ());
        for (const tool of tools) {
            assert.deepEqual (tool._meta?.securitySchemes, [ { 'type': 'noauth' } ], tool.name + ' securitySchemes');
        }
        // the render tools keep their view links next to it
        const chart = tools.find ((tool: any) => tool.name === 'show_chart');
        assert.match (chart._meta.ui.resourceUri, /^ui:\/\/ccxt\/chart\.[0-9a-f]+\.html$/);
        assert.equal (chart._meta['openai/widgetAccessible'], true);
    } finally {
        await harness.close ();
    }
});

test ('directory: _meta.ui.domain is sent to OpenAI callers only, merged into the view\'s ui block', async () => {
    const harness = await startHarness ({ 'TRUSTED_PROXY': 'nginx-x-real-ip', 'PUBLIC_BASE_URL': 'https://docs.ccxt.com' });
    try {
        const openai = await readView (harness.url, OPENAI_ADDRESS);
        assert.deepEqual (openai.contents._meta.ui, { 'prefersBorder': true, 'domain': 'https://docs.ccxt.com' });
        // the listing is the same for everyone (lists are publicly cacheable)
        assert.equal (openai.listed._meta.ui.domain, undefined);
        for (const ip of [ ANTHROPIC_ADDRESS, OTHER_ADDRESS ]) {
            const view = await readView (harness.url, ip);
            assert.deepEqual (view.contents._meta.ui, { 'prefersBorder': true }, ip);
        }
    } finally {
        await harness.close ();
    }
});

test ('directory: UI_DOMAIN_OPENAI=off sends no domain to anyone', async () => {
    const harness = await startHarness ({ 'TRUSTED_PROXY': 'nginx-x-real-ip', 'UI_DOMAIN_OPENAI': 'off' });
    try {
        const openai = await readView (harness.url, OPENAI_ADDRESS);
        assert.deepEqual (openai.contents._meta.ui, { 'prefersBorder': true });
    } finally {
        await harness.close ();
    }
});

test ('directory: UI_DOMAIN_OPENAI defaults to the public origin and accepts only an https origin', () => {
    assert.equal (parseUiDomain (undefined, 'https://docs.ccxt.com'), 'https://docs.ccxt.com');
    assert.equal (parseUiDomain ('', 'https://docs.ccxt.com/'), 'https://docs.ccxt.com');
    assert.equal (parseUiDomain ('OFF', 'https://docs.ccxt.com'), undefined);
    assert.equal (parseUiDomain ('https://views.ccxt.com', 'https://docs.ccxt.com'), 'https://views.ccxt.com');
    assert.equal (parseUiDomain ('https://views.ccxt.com/', 'https://docs.ccxt.com'), 'https://views.ccxt.com');
    for (const bad of [ 'http://docs.ccxt.com', 'https://docs.ccxt.com/mcp', 'docs.ccxt.com', 'not a url' ]) {
        assert.throws (() => parseUiDomain (bad, 'https://docs.ccxt.com'), /UI_DOMAIN_OPENAI/, bad);
    }
});

test ('directory: listing/ANNOTATIONS.md matches every hosted tool\'s annotations', async () => {
    const fs = await import ('node:fs');
    const path = await import ('node:path');
    const url = await import ('node:url');
    const file = path.join (path.dirname (url.fileURLToPath (import.meta.url)), '..', 'listing', 'ANNOTATIONS.md');
    const rows = new Map<string, [ boolean, boolean, boolean ]> ();
    for (const line of fs.readFileSync (file, 'utf8').split ('\n')) {
        const match = line.match (/^\| `([a-z_]+)` \| (true|false) \| (true|false) \| (true|false) \| (.+) \|$/);
        if (match !== null) {
            assert.ok (match[5].trim ().length > 20, match[1] + ' needs a justification');
            rows.set (match[1], [ match[2] === 'true', match[3] === 'true', match[4] === 'true' ]);
        }
    }
    const harness = await startHarness ();
    try {
        const tools = (await rpc (harness.url, 'tools/list')).body.result.tools;
        assert.deepEqual ([ ...rows.keys () ].sort (), tools.map ((tool: any) => tool.name).sort ());
        for (const tool of tools) {
            const a = tool.annotations;
            assert.deepEqual (rows.get (tool.name), [ a.readOnlyHint, a.destructiveHint, a.openWorldHint ], tool.name);
        }
    } finally {
        await harness.close ();
    }
});
