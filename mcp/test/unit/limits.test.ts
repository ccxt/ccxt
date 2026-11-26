import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limitClamped, limitClampedNotice, withLimitClamped, sinceGapNotice, tradesSinceTolerance, timeframeMs } from '../../ts/tools/common.js';

test ('limitClamped: reported only when the applied limit differs from the requested one', () => {
    assert.equal (limitClamped (undefined, 50), undefined);
    assert.equal (limitClamped (10, 10), undefined);
    assert.deepEqual (limitClamped (1000, 500), { 'requested': 1000, 'applied': 500 });
    assert.equal (limitClampedNotice (undefined), undefined);
    assert.equal (limitClampedNotice ({ 'requested': 1000, 'applied': 500 }), 'limit 1000 was clamped to 500 (the max for this tool)');
    const meta = withLimitClamped ({ 'count': 1, 'notice': 'other' }, { 'requested': 300, 'applied': 200 });
    assert.deepEqual (meta.limitClamped, { 'requested': 300, 'applied': 200 });
    assert.equal (meta.notice, 'limit 300 was clamped to 200 (the max for this tool) | other');
    const untouched = { 'count': 1 };
    assert.equal (withLimitClamped (untouched, undefined), untouched);
});

test ('timeframeMs: ccxt timeframe lengths', () => {
    assert.equal (timeframeMs ('1m'), 60000);
    assert.equal (timeframeMs ('4h'), 4 * 3600000);
    assert.equal (timeframeMs ('1d'), 86400000);
    assert.equal (timeframeMs ('1w'), 7 * 86400000);
    assert.equal (timeframeMs ('1M'), 30 * 86400000);
    assert.equal (timeframeMs ('weird'), undefined);
});

test ('sinceGapNotice: speaks only when since was given and the earliest item is past the tolerance', () => {
    const since = Date.UTC (2026, 10, 25);
    const later = since + 40 * 3600000;
    assert.equal (sinceGapNotice ('okx', undefined, [ later ], 60000, 'trade'), undefined);
    assert.equal (sinceGapNotice ('okx', since, [], 60000, 'trade'), undefined);
    assert.equal (sinceGapNotice ('okx', since, [ since + 30000 ], 60000, 'trade'), undefined);
    assert.equal (sinceGapNotice ('okx', since, [ later ], undefined, 'candle'), undefined, 'unknown tolerance: no claim');
    assert.equal (sinceGapNotice ('okx', since, [ since - 5000 ], 60000, 'trade'), undefined, 'items before since');
    const notice = sinceGapNotice ('okx', since, [ later + 5, later, null, 'x' ], 60000, 'trade');
    assert.equal (notice, 'the earliest trade returned is at 2026-11-26T16:00:00.000Z, 40 hours after the requested since (2026-11-25T00:00:00.000Z): okx did not return data from since — its endpoint may serve only recent data, or there is none in between. Do not present this as the range starting at since');
});

test ('tradesSinceTolerance: a minute, or the span of the page when it is wider', () => {
    assert.equal (tradesSinceTolerance ([]), 60000);
    assert.equal (tradesSinceTolerance ([ 1000, 2000 ]), 60000);
    assert.equal (tradesSinceTolerance ([ 0, 3600000, undefined ]), 3600000);
});
