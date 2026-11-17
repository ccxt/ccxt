import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries } from '../src/entries.ts';
import { fixture, NOW, OKX, parse, venueOf } from './helpers.ts';

const okxVenue = venueOf ('okx', [ 'okx.com' ], [ OKX ]);

test ('okx Slate changelog fixture', async () => {
    const out = await parse (OKX, fixture ('okx-log.html'));
    assert.equal (out.entries.length, 9);
    const titles = out.entries.map ((e) => e.title);
    assert.equal (titles[0], 'WebSocket port 8443 discontinuation');
    assert.equal (titles[3], 'New bbo-rpi-tbt order book channel for RPI best bid and ask');
    assert.equal (out.entries[3].anchor, '2026-10-27-new-bbo-rpi-tbt-order-book-channel-for-rpi-best-bid-and-ask');
    assert.equal (out.entries[3].context, '2026-10-27');
    // h3 sub-sections stay inside their h2 entry; the next h1/h2 ends it
    assert.match (out.entries[0].body, /### Breaking change/);
    assert.ok (!out.entries[0].body.includes ('SBE order entry'));
    assert.ok (!out.snapshot.includes ('window.__nonce'), 'scripts are stripped');
    assert.ok (!out.snapshot.includes ('toc-link'), 'nav is stripped');
    const entries = buildEntries (out.entries, { venue: okxVenue, source: OKX, affects: [ 'okx', 'myokx' ], now: NOW, firstRun: true });
    assert.equal (entries[0].publishedAt, null, 'upcoming change: no date in the anchor');
    // "will stop accepting WebSocket connections on port 8443 ...: - Public internet: October 31, 2026 - Colo: November 16, 2026"
    assert.equal (entries[0].effectiveDate, '2026-10-31', 'the earliest live rollout line');
    assert.equal (entries[0].dateKind, 'effective');
    // "expected to launch in the demo trading environment on November 11, 2026 and in the production environment in early December 2026"
    assert.equal (entries[1].effectiveDate, undefined, 'a demo date is not the effective date when production follows');
    assert.equal (entries[3].publishedAt, '2026-10-27');
    assert.equal (entries[3].url, 'https://www.okx.com/docs-v5/log_en/#2026-10-27-new-bbo-rpi-tbt-order-book-channel-for-rpi-best-bid-and-ask');
    assert.deepEqual (entries[3].affects, [ 'okx', 'myokx' ]);
    assert.ok (entries[0].tags.includes ('deprecation') && entries[0].tags.includes ('websocket'));
});

test ('without date config the enclosing h1 dates the entry', async () => {
    const source = { ...OKX, date: undefined };
    const out = await parse (source, fixture ('okx-log.html'));
    const entries = buildEntries (out.entries, { venue: okxVenue, source, affects: [ 'okx' ], now: NOW, firstRun: false });
    assert.equal (entries[5].title, 'USD spot trading pair migration');
    assert.equal (entries[5].publishedAt, '2026-09-30');
});

test ('row-style changelogs with split.item and strip', async () => {
    const page = `<html><body><div id="log"><div class="ad">Sign up now</div><table>
        <tr><th>Date</th><th>Change</th></tr>
        <tr id="r1"><td>2026-11-02</td><td><strong>New endpoint</strong> GET /v2/x</td></tr>
        <tr id="r2"><td>2026-10-30</td><td>Rate limit for /v2/y lowered</td></tr>
        </table></div></body></html>`;
    const source = { id: 'ex-rows', type: 'html' as const, url: 'https://example.com/log', slice: { selector: '#log' }, split: { item: 'table tr:has(td)' }, strip: [ '.ad' ] };
    const out = await parse (source, page);
    assert.equal (out.entries.length, 2);
    assert.equal (out.entries[0].title, 'New endpoint');
    assert.equal (out.entries[1].title, '2026-10-30 | Rate limit for /v2/y lowered');
    assert.ok (!out.snapshot.includes ('Sign up now'));
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => e.publishedAt), [ '2026-11-02', '2026-10-30' ]);
    assert.equal (entries[0].url, 'https://example.com/log#r1');
    assert.equal (out.entries[0].body, '| 2026-11-02 | GET /v2/x |', 'the title element is not repeated in the body');
});

test ('split.item: a leading title element and its separator are left out of the body (Crypto.com, KuCoin)', async () => {
    const page = `<html><body><div class="doc"><h2 id="change-log">Change Log</h2><ul>
        <li><strong>2025-11-13</strong> - Update 35=D, added tag20100 ReceiveWindow</li>
        <li><strong>2026-05-21</strong><ul><li><code>public/get-instruments</code> response updated</li><li>Trading Bot API section was added</li></ul></li>
        </ul>
        <div class="card"><h3 id="20261106">2026.11.06</h3><ul><li>[Add] UTA WebSocket Private Channel FundingFeeSettle</li></ul></div></div></body></html>`;
    const source = { id: 'ex-li', type: 'html' as const, url: 'https://example.com/log', slice: { selector: '.doc' }, split: { item: 'h2#change-log ~ ul > li, .card' }, date: { from: 'title' as const } };
    const out = await parse (source, page);
    assert.deepEqual (out.entries.map ((e) => [ e.title, e.body ]), [
        [ '2025-11-13', 'Update 35=D, added tag20100 ReceiveWindow' ],
        [ '2026-05-21', '- `public/get-instruments` response updated\n- Trading Bot API section was added' ],
        [ '2026.11.06', '- [Add] UTA WebSocket Private Channel FundingFeeSettle' ],
    ]);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => e.title), [ 'Update 35=D, added tag20100 ReceiveWindow', 'public/get-instruments response updated', 'Added: UTA WebSocket Private Channel FundingFeeSettle' ], 'the date repeats the day heading; "[Add]" reads "Added:"');
    assert.equal (entries[0].excerpt, 'Update 35=D, added tag20100 ReceiveWindow');
    assert.equal (entries[2].url, 'https://example.com/log#20261106');
});

test ('missing slice.selector is a parse error', async () => {
    await assert.rejects (parse ({ ...OKX, slice: { selector: '.nope' } }, fixture ('okx-log.html')), /slice.selector/);
});

test ('non-heading split elements keep their ordinary siblings (Gate changelog)', async () => {
    const page = `<html><body><div class="content">
        <h1 id="changelog">Changelog</h1>
        <p><strong>v4.106.179</strong></p>
        <p>2026-11-03</p>
        <ul><li>Add <code>GET /spot/x</code></li></ul>
        <p><strong>v4.106.178</strong></p>
        <p>2026-10-30</p>
        <table><tr><td>a</td><td>b</td></tr></table>
        <h3>Notes</h3>
        <p>after h3</p>
        <h1 id="general">General</h1>
        <p>not part of any entry</p>
    </div></body></html>`;
    const source = { id: 'ex-gate', type: 'html' as const, url: 'https://example.com/docs/', split: { heading: '#changelog ~ p:has(> strong:only-child):not(#changelog ~ h1 ~ *)' }, date: { from: 'body' as const } };
    const out = await parse (source, page);
    assert.deepEqual (out.entries.map ((e) => e.title), [ 'v4.106.179', 'v4.106.178' ]);
    assert.match (out.entries[0].body, /^2026-11-03\n\n- Add `GET \/spot\/x`$/);
    assert.equal (out.entries[1].body, '2026-10-30\n\n| a | b |', 'a real heading (h3) ends the entry');
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => e.publishedAt), [ '2026-11-03', '2026-10-30' ]);
});

test ('inline split elements ("p > strong") stand for their paragraph', async () => {
    const page = `<html><body><div id="log">
        <p><strong>November 12, 2026</strong> Orders: new field.</p>
        <ul><li>detail one</li></ul>
        <p>more text</p>
        <p><strong>November 1, 2026</strong></p>
        <p>Second entry.</p>
    </div></body></html>`;
    const source = { id: 'ex-bold', type: 'html' as const, url: 'https://example.com/log', slice: { selector: '#log' }, split: { heading: 'p > strong' } };
    const out = await parse (source, page);
    assert.deepEqual (out.entries.map ((e) => e.title), [ 'November 12, 2026', 'November 1, 2026' ]);
    assert.equal (out.entries[0].body, 'Orders: new field.\n\n- detail one\n\nmore text');
    assert.equal (out.entries[1].body, 'Second entry.');
});
