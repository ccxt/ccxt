import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDate, findDate, findEffectiveDate } from '../src/dates.ts';

const now = new Date ('2026-11-08T00:00:00Z');

test ('parses the common date formats', () => {
    const cases: [string, string | null, ('ymd' | 'mdy' | 'dmy')?][] = [
        [ '2026-11-05T10:00:00Z', '2026-11-05' ],
        [ '## 2026-11-05', '2026-11-05' ],
        [ '2026/11/05', '2026-11-05' ],
        [ '2026.11.05', '2026-11-05' ],
        [ 'Release 05.11.2026', '2026-11-05' ],
        [ '11/05/2026', '2026-11-05' ],
        [ '11/05/2026', '2026-05-11', 'dmy' ],
        [ '25/10/2026', '2026-10-25' ],
        [ 'Nov 5, 2026', '2026-11-05' ],
        [ 'Nov. 5 2026', '2026-11-05' ],
        [ '5 Nov 2026', '2026-11-05' ],
        [ 'November 5th, 2026', '2026-11-05' ],
        [ 'September 30, 2026', '2026-09-30' ],
        [ 'Sept 3, 2026', '2026-09-03' ],
        [ '2026年11月5日 更新', '2026-11-05' ],
        [ 'Fri, 06 Nov 2026 18:45:46 GMT', '2026-11-06' ],
        [ 'no date here', null ],
        [ 'version 1.2.3', null ],
    ];
    for (const [ text, expected, order ] of cases) {
        assert.equal (findDate (text, order, now), expected, text);
    }
});

test ('rejects impossible dates and years outside 2015..now+1', () => {
    assert.equal (findDate ('2014-05-01', undefined, now), null);
    assert.equal (findDate ('2028-01-01', undefined, now), null);
    assert.equal (findDate ('2027-01-01', undefined, now), '2027-01-01');
    assert.equal (findDate ('2026-02-30', undefined, now), null);
    assert.equal (findDate ('2026-13-01', undefined, now), null);
});

test ('returns the first date in the text', () => {
    assert.equal (findDate ('Updated 2026-10-01, originally Nov 5, 2025', undefined, now), '2026-10-01');
    assert.equal (findDate ('Nov 5, 2025 then 2026-10-01', undefined, now), '2025-11-05');
});

test ('extractDate honors a capture-group pattern', () => {
    assert.equal (extractDate ('2026-10-27-new-bbo-channel', '^(\\d{4}-\\d{2}-\\d{2})', undefined, now), '2026-10-27');
    assert.equal (extractDate ('upcoming-changes-port', '^(\\d{4}-\\d{2}-\\d{2})', undefined, now), null);
    assert.equal (extractDate ('v1.2 (released 03/04/2026)', 'released ([^)]+)', 'dmy', now), '2026-04-03');
});

test ('detects effective dates', () => {
    assert.equal (findEffectiveDate ('Effective date: 2026-11-20', undefined, now), '2026-11-20');
    assert.equal (findEffectiveDate ('The change will take effect on Nov 20, 2026 at 08:00 UTC', undefined, now), '2026-11-20');
    assert.equal (findEffectiveDate ('effective from 20.11.2026', undefined, now), '2026-11-20');
    assert.equal (findEffectiveDate ('Release 10.11.2026', undefined, now), '2026-11-10');
    assert.equal (findEffectiveDate ('Published 2026-11-01. Nothing scheduled.', undefined, now), null);
    assert.equal (findEffectiveDate ('effective immediately; see the 2026-11-01 notes from the team blog about many things', undefined, now), null);
});

test ('mixed separators and YYYY-Mon-DD', () => {
    assert.equal (findDate ('2026.05-12', undefined, now), '2026-05-12');
    assert.equal (findDate ('2026/05-12', undefined, now), '2026-05-12');
    assert.equal (findDate ('### 2026-OCT-01', undefined, now), '2026-10-01');
    assert.equal (findDate ('2025-Aug-14', undefined, now), '2025-08-14');
    assert.equal (findDate ('2026-Mar-9 notes', undefined, now), '2026-03-09');
    assert.equal (findDate ('v4.106.179', undefined, now), null);
    assert.equal (findDate ('2014-OCT-01', undefined, now), null, 'year sanity still applies');
    assert.equal (findDate ('2028-Jan-01', undefined, now), null);
});

test ('effective-date phrases (English, Korean, Chinese)', () => {
    const cases: [string, string | null][] = [
        [ 'Effective Time: November 2, 2026 (UTC)', '2026-11-02' ],
        [ 'Effective date: Nov 20, 2026', '2026-11-20' ],
        [ 'Effective Apr 30, 2026', '2026-04-30' ],
        [ 'INTX endpoints go live on 2026-OCT-01', '2026-10-01' ],
        [ 'The v1 endpoint will be deprecated on 2026-12-01.', '2026-12-01' ],
        [ 'This field will be removed on Dec 15, 2026', '2026-12-15' ],
        [ 'will be retired on 15 December 2026', '2026-12-15' ],
        [ '적용 예정일 : 2026-11-09', '2026-11-09' ],
        [ '적용 일시: 2026.11.09 10:00 (KST)', '2026-11-09' ],
        [ '시행일: 2026-11-20', '2026-11-20' ],
        [ '生效时间：2026年11月20日 08:00', '2026-11-20' ],
        [ '生效时间: 2026-11-20', '2026-11-20' ],
        [ 'Effective date: 2031-01-01', null ],
    ];
    for (const [ text, expected ] of cases) {
        assert.equal (findEffectiveDate (text, undefined, now), expected, text);
    }
});

test ('effective dates: discontinuation, shutdown, "expected to launch", "stop accepting", sunset', () => {
    const cases: [string, string | null][] = [
        [ 'The v1 channel will be discontinued on 2026-12-01.', '2026-12-01' ],
        [ 'Discontinuation on: Dec 1, 2026', '2026-12-01' ],
        [ 'The endpoint is discontinued on 1 December 2026', '2026-12-01' ],
        [ 'The legacy host will be shut down on 2026-12-15.', '2026-12-15' ],
        [ 'v1 sunset on December 1, 2026', '2026-12-01' ],
        [ 'The new API is expected to launch on mainnet on November 20, 2026.', '2026-11-20' ],
        [ 'We will stop accepting orders on port 8443 on Nov 30, 2026.', '2026-11-30' ],
        [ 'Last update: October 22, 2026. Port 443 already works.', null ],
    ];
    for (const [ text, expected ] of cases) {
        assert.equal (findEffectiveDate (text, undefined, now), expected, text);
    }
});

test ('effective dates: the live date wins over a demo/testnet date', () => {
    // Bitget (bitget-classic and bitget-uta-preview carry the same line)
    assert.equal (findEffectiveDate ('**Effective date:** demo trading on November 4, 2026; live trading expected on November 17, 2026\n\nInterface:', undefined, now), '2026-11-17');
    assert.equal (findEffectiveDate ('Effective date: testnet 2026-11-10, mainnet 2026-11-20', undefined, now), '2026-11-20');
    // only a demo date and a production month: no effective day
    assert.equal (findEffectiveDate ('The services are expected to launch in the demo trading environment on November 11, 2026 and in the production environment in early December 2026.', undefined, now), null);
    // a testnet-only notice keeps its date
    assert.equal (findEffectiveDate ('Effective date: testnet on 2026-11-10', undefined, now), '2026-11-10');
});

test ('effective dates: rollout lines give the earliest live/production date', () => {
    // OKX "WebSocket port 8443 discontinuation"
    const okx = 'To support a network infrastructure upgrade, OKX will stop accepting WebSocket connections on port 8443, including Colo connections:\n\n- Public internet: October 31, 2026\n- Colo: November 16, 2026\n\nPort 443 already works on all affected domains.';
    assert.equal (findEffectiveDate (okx, undefined, now), '2026-10-31');
    assert.equal (findEffectiveDate ('* Testnet: May 29th, 2026 06:00 UTC\n* **Mainnet:** Jun 2nd, 2026 06:00 UTC', undefined, now), '2026-06-02');
    assert.equal (findEffectiveDate ('- Production, from November 20, 2026\n- Production (Colo), from November 12, 2026', undefined, now), '2026-11-12');
    assert.equal (findEffectiveDate ('- Testnet: May 29th, 2026 06:00 UTC', undefined, now), null, 'a testnet line alone is not the effective date');
});

test ('effective dates: an unaffected live environment does not cancel a testnet date', () => {
    assert.equal (findEffectiveDate ('The legacy testnet will be decommissioned on December 1, 2026; production is not affected.', undefined, now), '2026-12-01');
    assert.equal (findEffectiveDate ('Testnet will be shut down on 2026-12-01. Mainnet users are unaffected.', undefined, now), '2026-12-01');
});
