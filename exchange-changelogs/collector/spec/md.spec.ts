import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bodySummary, buildEntries } from '../src/entries.ts';
import { BYBIT, fixture, NOW, parse, venueOf } from './helpers.ts';

const bybitVenue = venueOf ('bybit', [ 'bybit.com', 'bybit-exchange.github.io' ], [ BYBIT ]);

test ('bybit v5.mdx fixture (Docusaurus changelog)', async () => {
    const out = await parse (BYBIT, fixture ('bybit-v5.mdx'));
    assert.equal (out.entries.length, 8);
    assert.deepEqual (out.entries.map ((e) => e.title).slice (0, 3), [ '2026-11-09', '2026-11-05', '2026-11-04' ]);
    const first = out.entries[0];
    assert.match (first.body, /^### REST API\n- Set Auto Repay Mode \[UPDATE\]/);
    assert.ok (!first.body.includes ('../v5/'), 'relative markdown links are reduced to their text');
    assert.ok (!out.snapshot.includes ('title: V5'), 'front matter is dropped');
    const entries = buildEntries (out.entries, { venue: bybitVenue, source: BYBIT, affects: [ 'bybit' ], now: NOW, firstRun: true });
    // 2026-11-09 is after "today" (2026-11-08): scheduled change
    assert.equal (entries[0].publishedAt, null);
    assert.equal (entries[0].effectiveDate, '2026-11-09');
    assert.equal (entries[0].dateKind, 'effective');
    assert.equal (entries[1].publishedAt, '2026-11-05');
    assert.equal (entries[1].url, 'https://bybit-exchange.github.io/docs/changelog/v5#2026-11-05');
    assert.ok (entries[4].tags.includes ('new-endpoint'));
    assert.ok (entries.every ((e) => e.backfill));
});

test ('slice.from/to, code fences, nested headings and context dates', async () => {
    const text = [
        '# Docs',
        'intro',
        '## Changelog',
        '### 2026-10-02',
        'Added `GET /a`.',
        '```',
        '### 2026-01-01 not a heading inside a fence',
        '```',
        '#### Details',
        'more',
        '### 2026-10-01',
        'Fixed stuff.',
        '## Fixes',
        '### Something without a date',
        'body',
        '## Appendix',
        '### 2020-01-01',
    ].join ('\n');
    const source = { id: 'ex-md', type: 'md' as const, url: 'https://example.com/CHANGELOG.md', slice: { from: '^## Changelog', to: '^## Appendix' }, split: { heading: '^###\\s' } };
    const out = await parse (source, text);
    assert.deepEqual (out.entries.map ((e) => e.title), [ '2026-10-02', '2026-10-01', 'Something without a date' ]);
    assert.match (out.entries[0].body, /not a heading inside a fence/);
    assert.match (out.entries[0].body, /#### Details\nmore/);
    assert.equal (out.entries[2].context, 'Fixes');
    await assert.rejects (parse ({ ...source, slice: { from: '^## Nope' } }, text), /slice.from/);
});

test ('a dated parent heading dates its undated children', async () => {
    const text = '## 2026-10-05\n### REST\n- a\n### WebSocket\n- b\n## 2026-10-01\n### REST\n- c';
    const source = { id: 'ex-md2', type: 'md' as const, url: 'https://example.com/c.md', split: { heading: '^###\\s' } };
    const out = await parse (source, text);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    // a generic section label ("REST") is displayed with a summary of its body
    assert.deepEqual (entries.map ((e) => [ e.title, e.publishedAt ]), [ [ 'REST: a', '2026-10-05' ], [ 'WebSocket: b', '2026-10-05' ], [ 'REST: c', '2026-10-01' ] ]);
    assert.equal (new Set (entries.map ((e) => e.id)).size, 3, 'same title on different dates -> different ids');
});

test ('date-only headings get a summary title; the id still uses the raw heading', async () => {
    const out = await parse (BYBIT, fixture ('bybit-v5.mdx'));
    const entries = buildEntries (out.entries, { venue: bybitVenue, source: BYBIT, affects: [ 'bybit' ], now: NOW, firstRun: true });
    assert.equal (entries[1].title, 'Get Strategy List [UPDATE]', 'the first bullet only, without the date of the day heading');
    const again = buildEntries (out.entries.map ((e, i) => (i === 1 ? { ...e, body: e.body + '\n- Another [NEW]' } : e)), { venue: bybitVenue, source: BYBIT, affects: [ 'bybit' ], now: NOW, firstRun: false });
    assert.equal (again[1].id, entries[1].id);
    assert.notEqual (again[1].hash, entries[1].hash);
});

test ('summary titles: heading-like lead paragraph, rollout schedule bullets skipped', () => {
    // Deribit RSS: a short heading-like paragraph, prose, then the bullets
    assert.equal (bodySummary ('Delayed publication of large Block RFQ trades\n\nDelayed publication is enabled on request.\n\n- BTC: 1,000 BTC per trade.'), 'Delayed publication of large Block RFQ trades');
    // a sentence or a label before the list is not a title: the first bullet is
    assert.equal (bodySummary ('No removed endpoints, routes, or fields. Two behaviour changes.\n\n- Withdrawals and internal transfers.'), 'Withdrawals and internal transfers.');
    assert.equal (bodySummary ('REST and WebSocket API:\n\n- Reminder that SBE 3:3 schema will be retired.'), 'Reminder that SBE 3:3 schema will be retired.');
    assert.equal (bodySummary ('**Notice: The changes in this section will be gradually rolled out starting from 2026-10-29 at**\n**00:00 UTC, and will take approximately 2 days to complete.**\n\n#### New Features\n\n- `userDataStream.subscribe` now accepts a filter'), 'userDataStream.subscribe now accepts a filter');
    // Orderly: "Testnet: <date>" / "Mainnet: <date>" bullets are the rollout, not the change
    assert.equal (bodySummary ('* Testnet: May 29th, 2026 06:00 UTC\n* **Mainnet:** Jun 2nd, 2026 06:00 UTC\n\n- FX PERPS support for HKD and KRW'), 'FX PERPS support for HKD and KRW');
    assert.equal (bodySummary ('* Testnet: May 29th, 2026 06:00 UTC'), 'Testnet: May 29th, 2026 06:00 UTC', 'only schedule lines: the first one');
    assert.equal (bodySummary ('2026-11-03\n\n- Add GET /stock/orders/deals'), 'Add GET /stock/orders/deals', 'a date line is not a heading');
    assert.equal (bodySummary ('The named MMP group limit of 16 now applies per currency pair.\n\nMore text.'), 'The named MMP group limit of 16 now applies per currency pair.');
});

test ('a future date read with date.pattern beats the first effective-date phrase (Bitget preview)', async () => {
    const text = '# Update Preview\n\n## Candlestick Channels: Snapshot Push Removed\n\n**Effective date:** demo trading on November 4, 2026; live trading expected on November 17, 2026\n\n- change\n\n## books50 Depth Channel\n\n**Live date:** December 1, 2026\n\n- change\n\n## Undated\n\n- nothing scheduled';
    const source = { id: 'ex-preview', type: 'md' as const, url: 'https://example.com/p.md', split: { heading: '^##\\s+' }, date: { from: 'body' as const, pattern: '(?:live date:\\W*|live trading (?:expected )?on\\s+)([^;\\n]{6,40})' }, minEntries: 0 };
    const out = await parse (source, text);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => [ e.publishedAt, e.effectiveDate ?? null ]), [ [ null, '2026-11-17' ], [ null, '2026-12-01' ], [ null, null ] ]);
});

test ('fences opened inside list items open and close by the same rule', async () => {
    const text = [
        '### 2026-10-30',
        '* New field in the response:',
        '  - ```json',
        '    {',
        '    ### not a heading',
        '    }',
        '    ```',
        '* Inline ```code``` in a list item is not a fence',
        '### 2026-10-27',
        '- b',
        '~~~',
        '### inside tilde fence',
        '```',
        '### still inside (a backtick line does not close ~~~)',
        '~~~',
        '### 2026-10-01',
        '- c',
    ].join ('\n');
    const source = { id: 'ex-fence', type: 'md' as const, url: 'https://example.com/c.md', split: { heading: '^###\\s+\\d{4}' } };
    const out = await parse (source, text);
    assert.deepEqual (out.entries.map ((e) => e.title), [ '2026-10-30', '2026-10-27', '2026-10-01' ]);
    assert.match (out.entries[1].body, /### still inside/);
});

test ('duplicate headings get GitHub-style unique anchors', async () => {
    const text = '## Intro\n## 2026-10-02\n### REST\n- a\n### REST\n- b\n## 2026-10-01\n### REST\n- c';
    const source = { id: 'ex-anchors', type: 'md' as const, url: 'https://example.com/c.md', link: 'https://example.com/c', split: { heading: '^###\\s' } };
    const out = await parse (source, text);
    assert.deepEqual (out.entries.map ((e) => e.anchor), [ 'rest', 'rest-1', 'rest-2' ]);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.deepEqual (entries.map ((e) => e.url), [ 'https://example.com/c#rest', 'https://example.com/c#rest-1', 'https://example.com/c#rest-2' ]);
});

test ('display titles: plain text, first full bullet, cut at a word boundary; no separators', async () => {
    const text = [
        '## 2026-10-28',
        '',
        '> [!WARNING]',
        '> Read this.',
        '',
        '- **Prediction Markets** - the `GET /v1/markets` response now',
        '  includes the settlement source for every market in the',
        '  list.',
        '- Second bullet',
        '',
        '---',
        '',
        '## 2026-07-27',
        '- Updated ' + 'very long words '.repeat (20),
        '## **Bold** heading with `code` here​',
        'text',
    ].join ('\n');
    const source = { id: 'ex-titles', type: 'md' as const, url: 'https://example.com/c.md' };
    const out = await parse (source, text);
    const entries = buildEntries (out.entries, { venue: venueOf ('ex', [ 'example.com' ], [ source ]), source, affects: [ 'ex' ], now: NOW, firstRun: false });
    assert.equal (entries[0].title, 'Prediction Markets - the GET /v1/markets response now includes the settlement source for every market in the list.');
    assert.ok (!entries[0].body!.includes ('---'), 'separator lines are dropped from bodies');
    assert.ok (!/---|\[!WARNING\]|\*\*|`/.test (entries[0].excerpt), entries[0].excerpt);
    assert.ok (entries[1].title.length <= 'Updated'.length + 12 + 140 && entries[1].title.endsWith ('words…'), entries[1].title);
    assert.equal (entries[2].title, 'Bold heading with code here');
});
