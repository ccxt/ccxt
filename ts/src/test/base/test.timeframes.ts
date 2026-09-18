
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import {  ROUND_DOWN, ROUND_UP } from '../../base/functions/number.js';



function testRoundTimeframe () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testDate = exchange.parse8601 ('2019-08-12 13:22:08');
    if (testDate === undefined) {
        return;
    }
    assert (exchange.roundTimeframe ('5m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:20:00'));
    assert (exchange.roundTimeframe ('10m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:20:00'));
    assert (exchange.roundTimeframe ('30m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:00:00'));
    assert (exchange.roundTimeframe ('1d', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 00:00:00'));

    assert (exchange.roundTimeframe ('5m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:25:00'));
    assert (exchange.roundTimeframe ('10m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:30:00'));
    assert (exchange.roundTimeframe ('30m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:30:00'));
    assert (exchange.roundTimeframe ('1h', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 14:00:00'));
    assert (exchange.roundTimeframe ('1d', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-13 00:00:00'));
    const calendarDate = exchange.parse8601 ('2026-09-02T00:00:00Z');
    if (calendarDate === undefined) {
        return;
    }
    assert (exchange.roundTimeframe ('1w', calendarDate, ROUND_DOWN) === exchange.parse8601 ('2026-08-31T00:00:00Z'));
    assert (exchange.roundTimeframe ('1M', calendarDate, ROUND_DOWN) === exchange.parse8601 ('2026-09-01T00:00:00Z'));
    assert (exchange.roundTimeframe ('1y', calendarDate, ROUND_DOWN) === exchange.parse8601 ('2026-01-01T00:00:00Z'));
    assert (exchange.roundTimeframe ('1w', calendarDate, ROUND_UP) === exchange.parse8601 ('2026-09-07T00:00:00Z'));
    assert (exchange.roundTimeframe ('1M', calendarDate, ROUND_UP) === exchange.parse8601 ('2026-10-01T00:00:00Z'));
    assert (exchange.roundTimeframe ('1y', calendarDate, ROUND_UP) === exchange.parse8601 ('2027-01-01T00:00:00Z'));
    assert (exchange.roundTimeframe ('2w', calendarDate, ROUND_DOWN) === exchange.parse8601 ('2026-08-31T00:00:00Z'));
    assert (exchange.roundTimeframe ('3M', calendarDate, ROUND_DOWN) === exchange.parse8601 ('2026-07-01T00:00:00Z'));
    assert (exchange.roundTimeframe ('2w', calendarDate, ROUND_UP) === exchange.parse8601 ('2026-09-14T00:00:00Z'));
    assert (exchange.roundTimeframe ('3M', calendarDate, ROUND_UP) === exchange.parse8601 ('2026-10-01T00:00:00Z'));
    const preEpochDate = exchange.parse8601 ('1960-06-15T00:00:00Z');
    if (preEpochDate === undefined) {
        return;
    }
    assert (exchange.roundTimeframe ('2w', preEpochDate, ROUND_DOWN) === exchange.parse8601 ('1960-06-06T00:00:00Z'));
    assert (exchange.roundTimeframe ('2w', preEpochDate, ROUND_UP) === exchange.parse8601 ('1960-06-20T00:00:00Z'));
}

function testParseTimeframe () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    assert (exchange.parseTimeframe ('1m') === 60);
    assert (exchange.parseTimeframe ('5m') === 300);
    assert (exchange.parseTimeframe ('1h') === 3600);
    assert (exchange.parseTimeframe ('1d') === 86400);
    assert (exchange.parseTimeframe ('1w') === 604800);
    assert (exchange.parseTimeframe ('1M') === 2592000); // todo: just approx
    assert (exchange.parseTimeframe ('1y') === 31536000); // todo: just approx
}


function testTimeframes () {
    testRoundTimeframe ();
    testParseTimeframe ();
}


export default testTimeframes;
