import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries } from '../src/entries.ts';
import { fixture, KALSHI, NOW, parse, venueOf } from './helpers.ts';

test ('kalshi RSS fixture (Mintlify)', async () => {
    const out = await parse (KALSHI, fixture ('kalshi-rss.xml'));
    assert.equal (out.entries.length, 5);
    const first = out.entries[0];
    assert.equal (first.title, 'API key signing algorithm metadata');
    assert.equal (first.guid, 'dec4dee21d01018a');
    assert.deepEqual (first.categories, [ 'REST', 'Predictions' ]);
    assert.match (first.body, /`GET \/api_keys` now includes `key_type`/);
    assert.ok (!/<p>|<code>/.test (first.body));
    const entries = buildEntries (out.entries, { venue: venueOf ('kalshi', [ 'kalshi.com' ], [ KALSHI ], 'prediction'), source: KALSHI, affects: [ 'kalshi' ], now: NOW, firstRun: true });
    assert.equal (entries[0].publishedAt, '2026-11-06');
    assert.equal (out.entries[0].anchor, 'november-12-2026', 'the link fragment is the anchor');
    assert.equal (entries[0].effectiveDate, '2026-11-12', 'a dated fragment that differs from pubDate is the effective date');
    assert.equal (entries[0].dateKind, 'effective');
    assert.equal (entries[0].url, 'https://docs.kalshi.com/changelog#november-12-2026');
    assert.equal (entries[0].kind, 'prediction');
    assert.ok (entries[0].tags.includes ('auth'));
});

test ('titleFilter also matches rss categories', async () => {
    const out = await parse (KALSHI, fixture ('kalshi-rss.xml'));
    const source = { ...KALSHI, titleFilter: '^WebSocket$', excludeFilter: 'perps' };
    const entries = buildEntries (out.entries, { venue: venueOf ('kalshi', [ 'kalshi.com' ], [ source ]), source, affects: [ 'kalshi' ], now: NOW, firstRun: false });
    assert.equal (entries.length, 1);
    assert.equal (entries[0].title, 'market_lifecycle_v2 covers trading-hours closes');
});

test ('atom feeds', async () => {
    const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Changelog</title>
  <entry>
    <title type="html">New &lt;b&gt;orders&lt;/b&gt; endpoint</title>
    <link rel="alternate" href="https://example.com/changelog/orders"/>
    <id>tag:example.com,2026:orders</id>
    <updated>2026-11-02T10:00:00Z</updated>
    <content type="html">&lt;p&gt;Added &lt;code&gt;POST /orders&lt;/code&gt;.&lt;/p&gt;</content>
  </entry>
  <entry>
    <title>Off-domain link</title>
    <link href="https://evil.example.net/x"/>
    <id>tag:2</id>
    <published>2026-11-01</published>
    <summary>Summary text</summary>
  </entry>
</feed>`;
    const source = { id: 'ex-atom', type: 'rss' as const, url: 'https://example.com/feed.atom' };
    const out = await parse (source, atom);
    assert.equal (out.entries.length, 2);
    assert.equal (out.entries[0].title, 'New orders endpoint');
    assert.equal (out.entries[0].body, 'Added `POST /orders`.');
    assert.equal (out.entries[0].link, 'https://example.com/changelog/orders');
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.equal (entries[0].publishedAt, '2026-11-02');
    assert.equal (entries[1].url, 'https://example.com/feed.atom', 'off-domain link falls back to the source link');
    assert.ok (entries[1].tags.includes ('link-rewritten'));
});

test ('non-feed body is a parse error', async () => {
    await assert.rejects (async () => parse (KALSHI, '<html><body>hello</body></html>'), /not an RSS\/Atom document/);
});

test ('rss anchors: undated fragments and fragments equal to pubDate add no effective date', async () => {
    const feed = `<rss version="2.0"><channel><title>c</title>
      <item><title>TBD item</title><link>https://example.com/changelog#tbd</link><guid>a</guid><pubDate>Fri, 06 Nov 2026 10:00:00 GMT</pubDate><description>x</description></item>
      <item><title>Same day</title><link>https://example.com/changelog#nov-6-2026</link><guid>b</guid><pubDate>Fri, 06 Nov 2026 10:00:00 GMT</pubDate><description>y</description></item>
      <item><title>Scheduled</title><link>https://example.com/changelog#december-1-2026</link><guid>c</guid><pubDate>Fri, 06 Nov 2026 10:00:00 GMT</pubDate><description>z</description></item>
    </channel></rss>`;
    const source = { id: 'ex-rss', type: 'rss' as const, url: 'https://example.com/rss.xml' };
    const out = await parse (source, feed);
    assert.deepEqual (out.entries.map ((e) => e.anchor), [ 'tbd', 'nov-6-2026', 'december-1-2026' ]);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => [ e.publishedAt, e.effectiveDate ?? null, e.dateKind ]), [
        [ '2026-11-06', null, 'published' ],
        [ '2026-11-06', null, 'published' ],
        [ '2026-11-06', '2026-12-01', 'effective' ],
    ]);
});
