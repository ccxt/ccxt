// Golden set for the 'breaking' and 'deprecation' rule tags: 40 entries sampled from the collected
// data (fixtures/tags-golden.json: title as displayed, body as stored, the tags they had when the
// sample was taken, and a judged expectation with a note). `expect.<tag>: null` marks a judgment
// call that is not scored.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruleTags } from '../src/tags.ts';
import { fixture } from './helpers.ts';

interface GoldenCase {
    n: number;
    source: string;
    title: string;
    body: string;
    sampleTags: string[];
    expect: Record<'breaking' | 'deprecation', boolean | null>;
    note: string;
}

const CASES: GoldenCase[] = JSON.parse (fixture ('tags-golden.json'));
const SCORED = [ 'breaking', 'deprecation' ] as const;
const MIN_PRECISION = 0.85;
const MIN_RECALL = 0.75;

// Cases the rules still get wrong on purpose, with the reason. Keep this short.
const EXCEPTIONS: Record<string, string> = {
};

function score (tag: typeof SCORED[number]) {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    const wrong: string[] = [];
    for (const c of CASES) {
        const expected = c.expect[tag];
        if (expected === null) {
            continue;
        }
        const got = ruleTags (c.title, c.body).includes (tag);
        if (got && expected) {
            tp++;
        } else if (got) {
            fp++;
        } else if (expected) {
            fn++;
        }
        if (got !== expected) {
            wrong.push (`#${c.n} ${c.source}: ${c.title.slice (0, 60)} (${got ? 'false positive' : 'miss'})`);
        }
    }
    return { precision: tp / Math.max (1, tp + fp), recall: tp / Math.max (1, tp + fn), tp, fp, fn, wrong };
}

test ('golden set: 40 judged entries', () => {
    assert.equal (CASES.length, 40);
    for (const tag of SCORED) {
        assert.ok (CASES.some ((c) => c.expect[tag] === true), `${tag} has positives`);
    }
});

for (const tag of SCORED) {
    test (`golden set: ${tag} precision >= ${MIN_PRECISION} and recall >= ${MIN_RECALL}`, () => {
        const s = score (tag);
        const detail = `${tag}: tp ${s.tp} fp ${s.fp} fn ${s.fn}\n${s.wrong.join ('\n')}`;
        assert.ok (s.precision >= MIN_PRECISION, `precision ${s.precision.toFixed (2)}\n${detail}`);
        assert.ok (s.recall >= MIN_RECALL, `recall ${s.recall.toFixed (2)}\n${detail}`);
    });
}

test ('golden set: every sample false positive and miss is now right', () => {
    const still: string[] = [];
    for (const c of CASES) {
        const now = ruleTags (c.title, c.body);
        for (const tag of SCORED) {
            const expected = c.expect[tag];
            if (expected === null || c.sampleTags.includes (tag) === expected) {
                continue; // the sample had it right (or it is not scored)
            }
            const key = `${c.n}:${tag}`;
            if (now.includes (tag) !== expected && !(key in EXCEPTIONS)) {
                still.push (`#${c.n} ${tag} (${expected ? 'miss' : 'false positive'}): ${c.title.slice (0, 70)} — ${c.note}`);
            }
        }
    }
    assert.deepEqual (still, []);
});

test ('golden set: the sample errors this set was built around', () => {
    // false positives: "no longer sits", an API-key relaxation, a bug fix with "No action required",
    // a docs correction ("is removed"), "no longer be required", "(no API behavior changes)"
    const fps = CASES.filter ((c) => c.sampleTags.includes ('breaking') && c.expect.breaking === false).map ((c) => c.n);
    assert.deepEqual (fps, [ 0, 1, 13, 16, 20, 23 ]);
    // misses: "will result in an error", "Remove Launch APIs ... endpoints"
    const misses = CASES.filter ((c) => !c.sampleTags.includes ('breaking') && c.expect.breaking === true).map ((c) => c.n);
    assert.deepEqual (misses, [ 12, 18 ]);
});

test ('rules: "no longer" is breaking only when something is taken away', () => {
    const has = (text: string) => ruleTags ('Update', text).includes ('breaking');
    for (const text of [ 'The previous originator payload is no longer accepted.', '`estimated_liquidation_price` will no longer be returned', 'GET /a is no longer supported', 'Clients on TLS 1.1 will no longer be able to connect', 'It is no longer possible to derive the timestamp' ]) {
        assert.ok (has (text), text);
    }
    for (const text of [ 'Authentication will no longer be required.', '`symbol` is no longer mandatory', 'the object no longer sits at the top level', 'Liquidity no longer counts toward depth', 'Clients are no longer restricted to 3 reports' ]) {
        assert.ok (!has (text), text);
    }
});

test ('rules: a removal is breaking when it names an API object', () => {
    const has = (text: string) => ruleTags ('Update', text).includes ('breaking');
    for (const text of [ 'Remove Launch APIs from the public SDK, including LaunchPool and CandyDrop endpoints', 'Removed `GET /api/v1/x`', 'The return parameter removes the profit_real field', '`listenKey` for use on `wss://stream.binance.com` has been removed.', 'public/get_assets is removed', 'Market Data wildcard ticker subscription removed.', 'API: cookie-based authentication removed', '### Removed\n\n#### `future v1 api`', 'Removed: USDT-M Perp Futures (Swap Trading)', 'We are removing travel rule fields from `POST /withdrawals/crypto`' ]) {
        assert.ok (has (text), text);
    }
    for (const text of [ 'Earlier documentation said X; that statement was incorrect and is removed.', 'Removed API Key permission requirements from the public market data documentation.', 'removed the approximate 1.5 USDT minimum', 'Updated descriptions by removing the note about reaching out to support for access.', 'registering or removing a browser subscription (`POST` / `DELETE`)', 'Event contracts — remove authentication requirement from public data endpoints' ]) {
        assert.ok (!has (text), text);
    }
});

test ('rules: weak breaking signals yield to "No action required"', () => {
    assert.ok (ruleTags ('Update', 'Orders that sweep the book now fail.').includes ('breaking'));
    assert.ok (ruleTags ('Update', 'Requests containing duplicate slashes will result in an error.').includes ('breaking'));
    assert.ok (ruleTags ('Update', 'Calls without a filter will be rejected.').includes ('breaking'));
    assert.ok (!ruleTags ('Update', 'The depth parameter will be changed to a string. These changes will not affect your existing API calls.').includes ('breaking'));
    assert.ok (!ruleTags ('Bug fix', 'Some legs now fail to quote.\n* No action required.').includes ('breaking'));
    assert.ok (ruleTags ('Update', 'Breaking change: `foo` was removed. No action required for REST users.').includes ('breaking'), 'a strong signal is not overridden');
});

test ('rules: auth negations, no "listed" for market, CJK keywords', () => {
    assert.ok (!ruleTags ('Public portfolio', 'This endpoint does not require authentication.').includes ('auth'));
    assert.ok (!ruleTags ('Update', 'Public endpoints are called without an API key.').includes ('auth'));
    assert.ok (!ruleTags ('Profiles', '`POST /profiles/x` (authenticated) takes a body').includes ('auth'));
    assert.ok (ruleTags ('Update', 'The signature now covers the body.').includes ('auth'));
    assert.ok (!ruleTags ('Update', 'The API changes are listed below.').includes ('market'));
    assert.ok (ruleTags ('[일정 변경] 2026년 11월 13일 Private WebSocket v1 지원 종료', '').includes ('deprecation'));
    assert.ok (!ruleTags ('Update', '거래지원 종료 또는 지원 범위 변경 등으로 구독 중인 데이터가').includes ('deprecation'), 'a market delisting policy line');
    assert.ok (ruleTags ('旧APIの廃止について', '').includes ('deprecation'));
    assert.ok (ruleTags ('v1 接口下线通知', '').includes ('deprecation'));
    assert.ok (ruleTags ('关于停止支持旧版接口', '').includes ('deprecation'));
    assert.ok (ruleTags ('【重要】全サービスの一時停止およびメンテナンス実施のお知らせ', '').includes ('maintenance'));
    assert.ok (ruleTags ('정기 점검 안내', '').includes ('maintenance'));
    assert.ok (!ruleTags ('[중요] API Path 형식 및 오류 처리 방식 점검 안내', '').includes ('maintenance'), '"점검" alone is a check, not maintenance');
    assert.ok (ruleTags ('系统维护公告', '').includes ('maintenance'));
});

test ('rules: relaxed requirements, reassurance scope, auth windows, Korean delisting forms', () => {
    for (const text of [ 'The rate limit on the /orders endpoint has been removed.', 'The IP whitelist requirement for sub_account keys has been removed.', 'The 3 concurrent report restriction was removed for the reports endpoint.' ]) {
        assert.ok (!ruleTags ('Update', text).includes ('breaking'), text);
    }
    assert.ok (ruleTags ('Update', 'The `limit` parameter was removed.').includes ('breaking'), 'a backticked limit parameter is an API object');
    assert.ok (ruleTags ('Update', 'The v1 endpoint is backward compatible. The v0 endpoint is no longer supported.').includes ('breaking'), '"backward compatible" covers its own sentence only');
    assert.ok (ruleTags ('Update', 'Response `data` no longer includes `amount`.\n\nNo action needed to stay on v1.').includes ('breaking'), 'a qualified "no action needed to ..." is local');
    assert.ok (!ruleTags ('Update', 'Response `data` no longer includes `amount`.\n\n**Breaking Changes:** No').includes ('breaking'), 'the author says it is not breaking');
    assert.ok (!ruleTags ('No action required', 'The v0 endpoint is no longer supported.').includes ('breaking'), 'a reassurance in the title covers the entry');
    assert.ok (ruleTags ('Withdrawal', 'Withdrawal of non-tradable assets requires that the API Key must be bound to an IP').includes ('auth'));
    assert.ok (ruleTags ('Affiliate REST', 'Paths (no `/0` prefix) and requires permission to query referrals').includes ('auth'));
    assert.ok (!ruleTags ('Update', 'Public endpoints do not need a signature.').includes ('auth'));
    assert.ok (!ruleTags ('Update', 'non-authenticated endpoints return cached data').includes ('auth'));
    assert.ok (!ruleTags ('Update', 'Cancel now works. No breaking changes to order placement, authentication, or market data.').includes ('auth'));
    assert.ok (!ruleTags ('거래 지원 종료 안내', '').includes ('deprecation'), 'spaced 거래 지원 종료 is a delisting');
    for (const title of [ '거래지원 종료 예정 안내', '서버 점검 종료 예정', '이벤트 종료 예정' ]) {
        assert.ok (!ruleTags (title, '').includes ('deprecation'), title);
    }
    assert.ok (ruleTags ('구 API 서비스 종료 안내', '').includes ('deprecation'));
});
