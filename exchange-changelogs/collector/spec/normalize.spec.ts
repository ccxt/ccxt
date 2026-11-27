import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanBody, cleanTitle, LIMITS, makeExcerpt, stripAgentFooters } from '../src/normalize.ts';
import { htmlToText } from '../src/htmltext.ts';
import { ruleTags } from '../src/tags.ts';
import { entryHash, entryId, entryKey } from '../src/ids.ts';

test ('strips GitBook agent instruction footers', () => {
    const text = '## 2026-11-01\nAdded endpoint.\n\n---\n\n# Agent Instructions\nThis documentation is published with GitBook.\nPerform an HTTP GET request on ...';
    assert.equal (stripAgentFooters (text).trim (), '## 2026-11-01\nAdded endpoint.');
});

test ('sanitizes html and truncates', () => {
    assert.equal (cleanTitle ('<b>New</b> &amp; improved   endpoint'), 'New & improved endpoint');
    const long = 'word '.repeat (2000);
    assert.ok (cleanBody (long).length <= LIMITS.body);
    assert.ok (cleanTitle (long).length <= LIMITS.title);
    assert.ok (makeExcerpt (long).length <= LIMITS.excerpt);
    assert.equal (makeExcerpt ('### REST API\n- Add `GET /x` **now**'), 'REST API Add GET /x now');
});

test ('html to light markdown keeps lists, code, tables and drops links/scripts', () => {
    const html = '<p>Use <code>GET /v5/x</code> <a href="javascript:alert(1)">here</a>.</p><script>evil()</script><ul><li>one<ul><li>nested</li></ul></li><li>two</li></ul><table><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></table><pre>line1\nline2</pre>';
    assert.equal (htmlToText (html), 'Use `GET /v5/x` here.\n\n- one\n  - nested\n- two\n\n| a | b |\n| 1 | 2 |\n\n```\nline1\nline2\n```');
});

test ('rule tags', () => {
    assert.deepEqual (ruleTags ('Deprecation of v3 endpoints', 'Will be removed on 2026-12-01'), [ 'deprecation', 'breaking' ]);
    assert.deepEqual (ruleTags ('Get Instrument Summary [NEW]', 'Add `GET /v5/market/instrument-summary`'), [ 'new-endpoint' ]);
    assert.deepEqual (ruleTags ('Rate limit change', 'The request weight of /x is now 5'), [ 'rate-limit' ]);
    assert.deepEqual (ruleTags ('Scheduled maintenance', 'Downtime of 30 minutes'), [ 'maintenance' ]);
    assert.ok (ruleTags ('Signature update', 'HMAC SHA256 replaced by Ed25519 keys').includes ('auth'));
    assert.ok (ruleTags ('WebSocket orders channel', '').includes ('websocket'));
    assert.ok (ruleTags ('Deposit records', 'Add response field `requestId`').includes ('param-change'));
});

test ('ids follow the types.ts contract', () => {
    assert.equal (entryKey ('bybit-v5', undefined, '2026-11-05', ' 2026-11-05 '), 'bybit-v5|2026-11-05|2026-11-05');
    assert.equal (entryKey ('kalshi-changelog', 'abc', '2026-11-05', 'T'), 'kalshi-changelog|abc');
    assert.match (entryId ('x'), /^[0-9a-f]{64}$/);
    assert.equal (entryHash ('Title', 'body\n\n\n'), entryHash ('title', 'body'));
});

test ('negated phrasings do not tag breaking/deprecation', () => {
    for (const text of [ 'No removed endpoints, routes, or fields.', 'There are no breaking changes.', 'The field is not removed.', 'A non-breaking change.', 'The v1 API will not be deprecated.' ]) {
        const tags = ruleTags ('Update', text);
        assert.ok (!tags.includes ('breaking') && !tags.includes ('deprecation'), `${text} -> ${tags}`);
    }
    assert.ok (ruleTags ('Update', 'No breaking changes. The /v1/x endpoint was removed.').includes ('breaking'), 'a later affirmative still fires');
    assert.ok (ruleTags ('Update', 'GET /a is no longer supported').includes ('breaking'), '"no longer" is not a negation');
    assert.ok (ruleTags ('Update', 'Editing is no longer supported and the flag was removed').includes ('breaking'), '"no longer ... removed" stays affirmative');
    assert.ok (!ruleTags ('Update', 'Additive; no existing FIX Market Data fields are modified or removed.').includes ('breaking'), 'eight words between');
    assert.ok (ruleTags ('Update', 'No change to X. Field Y was removed.').includes ('breaking'), 'a sentence end stops the negation');
    assert.ok (ruleTags ('Update', 'No impact on clients, but field Z has been removed').includes ('breaking'), '"but" stops the negation');
});

test ('market tag needs a listing change, not a product word', () => {
    for (const text of [ 'null for non-perpetual instrument types', 'contract lifecycle events', 'Coin-M Contract Information', 'scoped to USDT-margined perpetual contracts', 'UDP Market Data: documented fields', 'New instrument fields', 'subscriptions that list the market in market_tickers', 'GET /x for listing Maker Rebate payouts', 'a table listing the e value', 'The API changes are listed below.', 'whether a newly listed contract uses the mark price' ]) {
        assert.ok (!ruleTags ('Update', text).includes ('market'), text);
    }
    for (const text of [ 'New symbols: usdchf and usdmxn join price.equity', 'Affected Crypto-USD spot instruments have been delisted', 'USD1 collateral listing', 'Launched new USDC perpetual contracts', 'Added new trading pairs', 'coin listing/delisting' ]) {
        assert.ok (ruleTags ('Update', text).includes ('market'), text);
    }
});

test ('maintenance needs the word, not maintenance margin or shutdownTime', () => {
    for (const text of [ '`ServerShutdownEvent`: new field `shutdownTime`', 'Add maintenance_rate field in GET /futures/{settle}/contracts', 'tiered maintenance margin calculation' ]) {
        assert.ok (!ruleTags ('Update', text).includes ('maintenance'), text);
    }
    assert.ok (ruleTags ('Sep 6th, 2026 (Scheduled Maintenance)', '').includes ('maintenance'));
});

test ('[Remove] markers are breaking; "Add <name> field" is a param change', () => {
    assert.ok (ruleTags ('2026.10.21: [Remove] Classic REST Get Loan Market', '').includes ('breaking'));
    assert.ok (ruleTags ('v4.106.48', 'Update Currency model: add category field').includes ('param-change'));
    assert.ok (ruleTags ('Sep 28, 2026', 'New optional fields: rows from GET /v2/resolutions can carry x').includes ('param-change'));
    assert.ok (ruleTags ('v4.104.2', 'Add `settlement_size` field in GET /futures/{settle}/my_trades response').includes ('param-change'));
});

test ('titles drop markdown emphasis, alert markers and zero-width characters', () => {
    assert.equal (cleanTitle ('**Prediction Markets** - __Liquidity__ *Rewards* `GET /x`'), 'Prediction Markets - Liquidity Rewards GET /x');
    assert.equal (cleanTitle ('> [!WARNING] Breaking change'), 'Breaking change');
    assert.equal (cleanTitle ('API​ Parameter﻿ Rules'), 'API Parameter Rules');
    assert.equal (cleanTitle ('get_order_book and a*b*c stay'), 'get_order_book and a*b*c stay');
    assert.equal (makeExcerpt ('> [!NOTE]\n> Heads up\n\n---\n\n- *one*'), 'Heads up one');
    assert.equal (makeExcerpt ('Dear developers, this is Upbit Developer Center team. Upbit is updating the smp_type field.'), 'Upbit is updating the smp_type field.');
    assert.equal (makeExcerpt ('Dear developers, The Upbit SDKs are being updated.'), 'The Upbit SDKs are being updated.');
    assert.equal (makeExcerpt ('안녕하세요. 업비트 개발자센터입니다. 업비트 SDK가 업데이트됩니다.'), '업비트 SDK가 업데이트됩니다.');
    assert.equal (makeExcerpt ('Dear developers,'), 'Dear developers,', 'nothing else left: keep it');
    assert.equal (cleanBody ('a\n\n---\n\nb\n***\n| x |\n|---|'), 'a\n\nb\n\n| x |\n|---|');
});
