// Display and date rules added after the venue audits: markdown escapes and anchors, summary
// titles past labels and section headings, table-row titles, negated labels, Korean and month-only
// dates, Mintlify paragraphs, section filters, and reparse runs (registry or parser change).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ChangelogEntry, SourceConfig } from '../src/types.ts';
import { anchorFragment, bodySummary, buildEntries, displayTitle, sectionBody, tableRowTitle } from '../src/entries.ts';
import { headingAnchors, lightMarkdown, unescapeMarkdown } from '../src/adapters/md.ts';
import { findDate, findEffectiveDate } from '../src/dates.ts';
import { htmlToText } from '../src/htmltext.ts';
import { makeExcerpt } from '../src/normalize.ts';
import { ruleTags } from '../src/tags.ts';
import { mergeEntries } from '../src/merge.ts';
import { collect, rssRemovalScope, type Fetcher } from '../src/collect.ts';
import { makeRegistry } from '../src/registry.ts';
import { Store } from '../src/store.ts';
import derive from '../src/mappers/derive.ts';
import { NOW, parse, venueOf } from './helpers.ts';

test ('markdown escapes, hard breaks and autolinks become plain text outside code', () => {
    assert.equal (unescapeMarkdown ('Added transfer\\_id and \\[NEW] PUT /address-book/\\{id}'), 'Added transfer_id and [NEW] PUT /address-book/{id}');
    assert.equal (unescapeMarkdown ('keep `a\\_b` in code\\'), 'keep `a\\_b` in code');
    assert.equal (lightMarkdown ([ 'Upgrade rest end point: <https://api.example.com/v2/audit> (<https://docs.example.com/x>)\\', 'Fields: COLLATERAL\\_MIN' ]),
        'Upgrade rest end point: https://api.example.com/v2/audit (https://docs.example.com/x)\nFields: COLLATERAL_MIN');
    assert.equal (lightMarkdown ([ '```', 'a\\_b', '```' ]), '```\na\\_b\n```', 'fenced code is left alone');
});

test ('anchors keep "_" (github-slugger) and "/" on Mintlify exports', () => {
    const lines = [ '## Added transfer\\_id to the [Transfer funds)](https://x/y.md) REST endpoint response', '## Adding new PUT /address-book/\\{id} REST endpoint' ];
    assert.deepEqual ([ ...headingAnchors (lines).values () ], [ 'added-transfer_id-to-the-transfer-funds-rest-endpoint-response', 'adding-new-put-address-bookid-rest-endpoint' ]);
    assert.deepEqual ([ ...headingAnchors (lines, { keepSlash: true }).values () ][1], 'adding-new-put-/address-book/id-rest-endpoint');
});

test ('md: Mintlify preamble switches the slug style', async () => {
    const source: SourceConfig = { id: 'x-up', type: 'md', url: 'https://example.com/up.md', split: { heading: '^##\\s+' } };
    const body = '> ## Documentation Index\n> Fetch the complete documentation index at: https://example.com/llms.txt\n\n# Upcoming\n\n## Adding new PUT /address-book/\\{id} REST endpoint\n\nAdded: 2025-Jan-8\n';
    const out = await parse (source, body);
    assert.equal (out.entries[0].anchor, 'adding-new-put-/address-book/id-rest-endpoint');
    assert.equal (out.entries[0].title, 'Adding new PUT /address-book/{id} REST endpoint');
});

test ('bodySummary skips metadata labels, list labels and generic section headings', () => {
    const mudrex = '**Release Date:** September 23, 2026\n\n**Breaking Changes:** No\n\n**Deprecations:** No\n\n### Added\n\n#### Client order ID\n\n* Optional `client_order_id` on `POST /fapi/v2/futures/order`.';
    assert.equal (bodySummary (mudrex), 'Client order ID');
    const withNote = '**Release Date:** October 1, 2026\n\n> API changes live since September 30, 2026. Each change is labelled.\n\n### Added\n\n#### `position_id` on order responses — Non-breaking\n\n* **Endpoints:** `POST /x`';
    assert.equal (bodySummary (withNote), 'position_id on order responses — Non-breaking');
    assert.equal (bodySummary ('#### Underlying Security Type\n\nIntroducing new values.\n\n1. REST API\'s List instruments endpoint'), 'Underlying Security Type');
    assert.equal (bodySummary ('### Removed\n   #### `future v1 api`\n   #### `prediction api`'), 'future v1 api');
    assert.equal (bodySummary ('**Docs**\n\n* Error codes [UPDATE]\n  * Added codes 122-158'), 'Error codes [UPDATE]');
    assert.equal (bodySummary ('Authentication\n\n- Exchange API keys can now be self generated.'), 'Exchange API keys can now be self generated.');
    assert.equal (bodySummary ('* **REST API**\n* Added GET /orders'), 'Added GET /orders', 'a bold-only bullet is a label');
    assert.equal (bodySummary ('## Changed\n\n### Operator ID in Get trade history response\n\nThe response now returns operatorId.'), 'Operator ID in Get trade history response');
    assert.equal (bodySummary ('### Documentation (V1)\n- Account GET /api/v1/account: balances documented'), 'Account GET /api/v1/account: balances documented', 'a first heading above a list is a category');
    assert.equal (bodySummary ('**Notice:** FIX TLS Connectivity Update on 2026-06-08, starting from 03:00 UTC and will take\nabout 1 hour to complete.\n\n**Action Required:**'), 'Notice: FIX TLS Connectivity Update on 2026-06-08, starting from 03:00 UTC and will take about 1 hour to complete.');
    assert.equal (bodySummary ('Updated docs\n- Added 60020 error code in\n  - errors.md'), 'Added 60020 error code in errors.md');
    assert.equal (bodySummary ('- **REST**\n  - **New Feature** Documentation for Clearing Order List\n- **FIX Order Entry**'), 'New Feature Documentation for Clearing Order List');
    assert.equal (bodySummary ('2021-12-09\n\n1. Add options API\n2. Add detailed rate limiting rules'), 'Add options API');
    assert.equal (bodySummary ('### Added (16)\n\n#### batch_claim_partially_succeeded()\n\nNew stream event.'), 'batch_claim_partially_succeeded()');
    assert.equal (bodySummary ('Isolated-Only Markets\n\n- Added isolated_only field'), 'Isolated-Only Markets');
    assert.equal (bodySummary ('### REST API\n**Crypto Loan (Fixed-Term)**\n- Get Available Inventory [NEW]'), 'Crypto Loan (Fixed-Term)');
    assert.equal (bodySummary ('- Added an optional symbol parameter in:\n  - GET /api/3/margin/history/positions'), 'Added an optional symbol parameter in GET /api/3/margin/history/positions');
    assert.equal (bodySummary ('- The update speed will be changed from 25ms to 20ms:\n  - Diff Depth Streams'), 'The update speed will be changed from 25ms to 20ms');
});

test ('displayTitle: product-name titles get a summary, table rows lose their pipes', () => {
    assert.equal (displayTitle ('Exchange API', '## Changed\n\n### Operator ID in Get trade history response\n\nText.'), 'Exchange API: Operator ID in Get trade history response');
    assert.equal (displayTitle ('Changelog - v1.0.12', '**Release Date:** October 1, 2026\n\n### Added\n\n#### Position IDs\n\n* x'), 'Changelog - v1.0.12: Position IDs');
    assert.equal (displayTitle ('AWS PrivateLink', 'Text.'), 'AWS PrivateLink');
    assert.equal (tableRowTitle ('2026.07.13 18:00 | /v2/supplement/add_deposit_address.do | Added | User adds a new deposit address'), '/v2/supplement/add_deposit_address.do (Added): User adds a new deposit address');
    assert.equal (tableRowTitle ('2026-06-23 | * | New | The Copy Trading API has been launched.'), 'New: The Copy Trading API has been launched.');
    assert.equal (tableRowTitle ('Plain title'), null);
    assert.equal (makeExcerpt ('| 2026.03.18 | REST API | Update | Error codes. Field descriptions. |\n| :- | :- |'), '2026.03.18 · REST API · Update · Error codes. Field descriptions.');
    assert.equal (makeExcerpt (':warning: The response changes.'), 'The response changes.');
});

test ('"Breaking Changes: No" and "Deprecations: No" do not tag', () => {
    assert.deepEqual (ruleTags ('v1.0.11', '**Release Date:** Sep 23, 2026\n\n**Breaking Changes:** No\n\n**Deprecations:** No\n\nAdded client order id.').filter ((t) => t === 'breaking' || t === 'deprecation'), []);
    assert.ok (ruleTags ('v1.0.12', '**Breaking Changes:** Yes — responses changed.').includes ('breaking'));
});

test ('effective dates: Korean trailing phrases, "to be released", "will be fully deprecated on"', () => {
    assert.equal (findEffectiveDate ('2026년 11월 13일 오전 11시 이후 적용될 예정입니다.', undefined, NOW), '2026-11-13');
    assert.equal (findEffectiveDate ('[일정 변경] 2026년 11월 13일 Private WebSocket v1 지원 종료', undefined, NOW), '2026-11-13');
    assert.equal (findEffectiveDate ('Added: 2026-Oct-1\nTo Be Released: 2026-Oct-13', undefined, NOW), '2026-10-13');
    assert.equal (findEffectiveDate ('These will be fully deprecated on 31th Oct 2026.', undefined, NOW), '2026-10-31');
    assert.equal (findDate ('2026년 10월 30일 공지', undefined, NOW), '2026-10-30');
});

test ('month-only headings date their entries; a month in prose does not', () => {
    assert.equal (findDate ('Changelog / Dec 2025', undefined, NOW), '2025-12-01');
    assert.equal (findDate ('November 2025', undefined, NOW), '2025-11-01');
    assert.equal (findDate ('Shipped in Nov 2025 for all users', undefined, NOW), null);
});

test ('Mintlify <span data-as="p"> paragraphs and <br> in table cells keep words apart', () => {
    assert.equal (htmlToText ('<div><span data-as="p">See API key permissions.</span><span data-as="p">Keys created before stay valid.</span></div>'), 'See API key permissions.\n\nKeys created before stay valid.');
    assert.equal (htmlToText ('<table><tr><td>descriptions.<br>Additional</td></tr></table>'), '| descriptions. Additional |');
});

test ('section: the body is cut to the matching sections; entries without one are dropped', async () => {
    const body = '## v1.170.7\n\n#### UI\n\n- Fixed the modal.\n\n#### API\n\n- Pro maker fees rise to 0.5 bps.\n\n## v1.170.6\n\n#### UI\n\n- Theme.';
    assert.equal (sectionBody (body, '^API$'), '#### API\n\n- Pro maker fees rise to 0.5 bps.');
    assert.equal (sectionBody ('#### UI\n\n- x', '^API$'), null);
    const source: SourceConfig = { id: 'x-rel', type: 'md', url: 'https://example.com/r.md', split: { heading: '^##\\s+' }, section: '^API$' };
    const out = await parse (source, '## November 6, 2026\n\n' + body.replace (/^## /gm, '### ') + '\n\n## November 3, 2026\n\n### v1.170.3\n\n#### UI\n\n- Only UI.');
    const entries = buildEntries (out.entries, { venue: venueOf ('x', [ 'example.com' ], [ source ]), source, affects: [ 'x' ], now: NOW, firstRun: false });
    assert.equal (entries.length, 1);
    assert.equal (entries[0].title, 'Pro maker fees rise to 0.5 bps.');
    assert.ok (!entries[0].body!.includes ('modal'));
});

test ('derive: a repeated date block gets Mintlify\'s numbered anchor', () => {
    const raw = '**September 17, 2026**\n\n## First change\n\ntext\n\n**September 17, 2026**\n\n## Perp margin rates are public again\n\ntext\n\n## Same block\n\nmore';
    const out = derive (undefined, raw, { source: { id: 'derive-changelog', type: 'json', url: 'https://docs.derive.xyz/changelog.md', mapper: 'derive' }, url: 'https://docs.derive.xyz/changelog.md', now: NOW });
    assert.deepEqual (out.map ((e) => e.anchor), [ 'september-17-2026', 'september-17-2026-2', 'september-17-2026-2' ]);
});

function entry (id: string, hash: string, title: string): ChangelogEntry {
    return {
        schemaVersion: 1, id, kind: 'exchange', exchange: 'x', affects: [ 'x' ], source: 's', sourceType: 'md', sourceLink: 'https://example.com', title, excerpt: title, url: 'https://example.com',
        publishedAt: '2026-11-01', dateKind: 'published', firstSeen: '2026-11-01T00:00:00Z', lastSeen: '2026-11-01T00:00:00Z', hash, backfill: false, tags: [], ccxt: { status: 'new' },
    };
}

test ('merge: same hash refreshes display fields; a reparse records no revision and removes re-keyed ids at once', () => {
    const store = new Map<string, ChangelogEntry> ([ [ 'a', entry ('a', 'h1', 'old title') ], [ 'b', entry ('b', 'h2', 'gone') ] ]);
    const base = { sourceId: 's', firstRun: false, trackRemovals: true, missingRuns: {}, now: '2026-11-08T00:00:00Z' };
    let res = mergeEntries (store, [ entry ('a', 'h1', 'new title') ], base);
    assert.equal (store.get ('a')!.title, 'new title');
    assert.equal (res.revised.length, 0);
    assert.equal (store.get ('b')!.removedAt, undefined, 'one missing run is not a removal');
    res = mergeEntries (store, [ entry ('a', 'h3', 'newer'), entry ('c', 'h4', 're-keyed') ], { ...base, missingRuns: res.missingRuns, reparse: true });
    assert.equal (res.revised.length, 0);
    assert.equal (store.get ('a')!.revisions, undefined);
    assert.equal (store.get ('a')!.hash, 'h3');
    assert.equal (store.get ('c')!.backfill, true);
    assert.equal (store.get ('b')!.removedAt, '2026-11-08T00:00:00Z');
});

test ('hash source: a strip change re-baselines instead of reporting a docs change', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'changelog-reparse-')));
    const src: SourceConfig = { id: 'x-api', type: 'hash', url: 'https://example.com/api', minChange: 0 };
    const reg = (s: SourceConfig) => makeRegistry ([ { id: 'x', kind: 'exchange', name: 'X', domains: [ 'example.com' ], sources: [ s ] } ]);
    let page = '<main><pre><span class="ln">1</span>{ "a": 1 }</pre><p>GET /a</p></main>';
    const fetcher: Fetcher = async () => ({ status: 'ok', httpStatus: 200, body: page, contentType: 'text/html' });
    const run = (s: SourceConfig, day: string) => collect ({ store, registry: reg (s), now: new Date (`2026-11-${day}T05:00:00Z`), venues: [], sources: [], fetcher });
    await run (src, '05');
    const stripped = { ...src, strip: [ '.ln' ] };
    let rows = await run (stripped, '06');
    assert.equal (rows[0].added, 0, 'the strip change alone is not a docs change');
    page = page.replace ('GET /a', 'GET /a</p><p>GET /b');
    rows = await run (stripped, '07');
    assert.equal (rows[0].added, 1, 'later page changes are reported again');
});

test ('fragments keep "/" (Mintlify ids) and encode the rest', () => {
    assert.equal (anchorFragment ('adding-new-put-/address-book/id-rest-endpoint'), 'adding-new-put-/address-book/id-rest-endpoint');
    assert.equal (anchorFragment ('일정 변경'), '%EC%9D%BC%EC%A0%95%20%EB%B3%80%EA%B2%BD');
});

test ('rss removal scope also counts items a filter dropped', () => {
    const store = new Map<string, ChangelogEntry> ([ [ 'n', { ...entry ('n', 'h', 'maintenance notice'), source: 'z-news', publishedAt: '2026-11-05' } ], [ 'o', { ...entry ('o', 'h', 'old'), source: 'z-news', publishedAt: '2026-01-01' } ] ]);
    assert.deepEqual ([ ...rssRemovalScope (store, 'z-news', []) ], [], 'no candidates and no feed dates: nothing can go missing');
    assert.deepEqual ([ ...rssRemovalScope (store, 'z-news', [], [ '2026-10-01', '2026-11-05' ]) ], [ 'n' ], 'items still in the feed but filtered out can go missing; older ones rolled off');
});
