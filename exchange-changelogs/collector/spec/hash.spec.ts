import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addedLines, normalizeForHash } from '../src/adapters/hash.ts';
import { parse } from './helpers.ts';

const source = { id: 'ex-api', type: 'hash' as const, url: 'https://example.com/api', strip: [ '#server-time' ], minChange: 0 };
const page = (extra: string, token: string, time: string) => `<html><head><meta name="csrf-token" content="${token}"></head><body>
<nav>menu</nav><div id="server-time">${time}</div>
<h1>API</h1><p>GET /v1/ticker</p>${extra}
<input type="hidden" name="_token" value="${token}"><script>var nonce="${token}"</script>
<p>Page generated at 2026-11-08T10:00:${time.slice (-2)}Z</p></body></html>`;

test ('first run stores a snapshot and emits nothing', async () => {
    const out = await parse (source, page ('', 'aaaaaaaaaaaaaaaa', '10:00:01'));
    assert.equal (out.entries.length, 0);
    assert.match (out.snapshot, /GET \/v1\/ticker/);
    assert.ok (!out.snapshot.includes ('menu'));
});

test ('volatile tokens, nonces and timestamps do not count as changes', async () => {
    const a = await parse (source, page ('', 'aaaaaaaaaaaaaaaa', '10:00:01'));
    const b = await parse (source, page ('', 'bbbbbbbbbbbbbbbb', '11:22:33'), a.snapshot);
    assert.equal (b.snapshot, a.snapshot);
    assert.equal (b.entries.length, 0);
});

test ('a real change emits one "Docs changed: <path>" entry listing added lines', async () => {
    const a = await parse (source, page ('', 'aaaaaaaaaaaaaaaa', '10:00:01'));
    const b = await parse (source, page ('<p>POST /v1/order (new)</p>', 'cccccccccccccccc', '12:00:00'), a.snapshot);
    assert.equal (b.entries.length, 1);
    assert.equal (b.entries[0].title, 'Docs changed: /api');
    assert.match (b.entries[0].body, /^1 line\(s\) added, 0 line\(s\) removed\.\n\n\+ POST \/v1\/order \(new\)$/);
    assert.match (b.entries[0].guid!, /^snapshot:[0-9a-f]{16}$/);
});

test ('line diff', () => {
    assert.deepEqual (addedLines ('a\nb\nb', 'a\nb\nb\nb\nc'), [ 'b', 'c' ]);
    assert.equal (normalizeForHash ('x  1700000000000  y\nid 0123456789abcdef0123456789abcdef'), 'x y\nid');
});

test ('non-html bodies are hashed as text', async () => {
    const md = { id: 'ex-md', type: 'hash' as const, url: 'https://example.com/a.md', minChange: 0 };
    const a = await parse (md, '# API\n\nGET /a\n');
    const b = await parse (md, '# API\n\nGET /a\nGET /b\n', a.snapshot);
    assert.match (b.entries[0].body, /\+ GET \/b/);
});

test ('stored snapshots (with a trailing newline) compare equal; reorders emit nothing; scope in the title', async () => {
    const md = { id: 'ex-md', type: 'hash' as const, url: 'https://example.com/docs/info.md', scope: 'REST info endpoint', minChange: 0 };
    const a = await parse (md, '# API\n\nGET /a\nGET /b\n');
    const same = await parse (md, '# API\n\nGET /a\nGET /b\n', a.snapshot + '\n');
    assert.equal (same.entries.length, 0, 'a trailing newline is not a change');
    const reordered = await parse (md, '# API\n\nGET /b\nGET /a\n', a.snapshot + '\n');
    assert.equal (reordered.entries.length, 0, 'nothing added or removed');
    const changed = await parse (md, '# API\n\nGET /a\n', a.snapshot + '\n');
    assert.equal (changed.entries[0].title, 'Docs changed: REST info endpoint');
    assert.match (changed.entries[0].body, /^0 line\(s\) added, 1 line\(s\) removed\./);
});

test ('store round-trips snapshots without the trailing newline', async () => {
    const { mkdtemp } = await import ('node:fs/promises');
    const { tmpdir } = await import ('node:os');
    const { join } = await import ('node:path');
    const { Store } = await import ('../src/store.ts');
    const store = new Store (await mkdtemp (join (tmpdir (), 'snap-')));
    await store.saveSnapshot ('ex-a', 'line 1\nline 2');
    assert.equal (await store.loadSnapshot ('ex-a'), 'line 1\nline 2');
});

test ('minChange: changes under 40 characters (default) only update the snapshot', async () => {
    const md = { id: 'ex-md', type: 'hash' as const, url: 'https://example.com/a.md' };
    const a = await parse (md, '# API\n\nVersion 1.2.3\nGET /a\n');
    const small = await parse (md, '# API\n\nVersion 1.2.4\nGET /a\n', a.snapshot);
    assert.equal (small.entries.length, 0, 'a version bump is under the threshold');
    assert.notEqual (small.snapshot, a.snapshot, 'the snapshot still moves forward');
    const big = await parse (md, '# API\n\nVersion 1.2.4\nGET /a\nPOST /api/v1/order/batch (new batch order endpoint)\n', small.snapshot);
    assert.equal (big.entries.length, 1);
    const removed = await parse (md, '# API\n\nVersion 1.2.4\nGET /a\n', big.snapshot);
    assert.equal (removed.entries.length, 1, 'removing 40+ characters counts too');
    assert.match (removed.entries[0].body, /^0 line\(s\) added, 1 line\(s\) removed\./);
    const strict = await parse ({ ...md, minChange: 100 }, '# API\n\nVersion 1.2.4\nGET /a\nPOST /api/v1/order/batch (new batch order endpoint)\n', removed.snapshot);
    assert.equal (strict.entries.length, 0, 'minChange raises the threshold');
});
