


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import {  ROUND_DOWN, ROUND_UP } from '../../base/functions/number.js';

function testIso8601 () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.iso8601 (514862627000) === '1986-04-26T01:23:47.000Z');
    assert (exchange.iso8601 (514862627559) === '1986-04-26T01:23:47.559Z');
    assert (exchange.iso8601 (514862627062) === '1986-04-26T01:23:47.062Z');

    assert (exchange.iso8601 (1) === '1970-01-01T00:00:00.001Z');

    assert (exchange.iso8601 (-1) === undefined);
    // assert (exchange.iso8601 () === undefined);
    // todo: assert (exchange.iso8601 () === undefined);
    assert (exchange.iso8601 (undefined) === undefined);
    assert (exchange.iso8601 ('') === undefined);
    assert (exchange.iso8601 ('a') === undefined);
    assert (exchange.iso8601 ({}) === undefined);
}

function testParse8601 () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.parse8601 ('1986-04-26T01:23:47.000Z') === 514862627000);
    assert (exchange.parse8601 ('1986-04-26T01:23:47.559Z') === 514862627559);
    assert (exchange.parse8601 ('1986-04-26T01:23:47.062Z') === 514862627062);

    assert (exchange.parse8601 ('1986-04-26T01:23:47.06Z') === 514862627060);
    assert (exchange.parse8601 ('1986-04-26T01:23:47.6Z') === 514862627600);

    assert (exchange.parse8601 ('1977-13-13T00:00:00.000Z') === undefined);
    assert (exchange.parse8601 ('1986-04-26T25:71:47.000Z') === undefined);

    assert (exchange.parse8601 ('3333') === undefined);
    assert (exchange.parse8601 ('Sr90') === undefined);
    assert (exchange.parse8601 ('') === undefined);
    // assert (exchange.parse8601 () === undefined);
    // todo: assert (exchange.parse8601 () === undefined);
    assert (exchange.parse8601 (undefined) === undefined);
    assert (exchange.parse8601 ({}) === undefined);
    assert (exchange.parse8601 (33) === undefined);

    // ----------------------------------------------------------------------------
}


function testParseDate () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    assert (exchange.parseDate ('1986-04-26 00:00:00') === 514857600000);
    assert (exchange.parseDate ('1986-04-26T01:23:47.000Z') === 514862627000);
    assert (exchange.parseDate ('1986-13-13 00:00:00') === undefined);
    // GMT formats (todo: bugs in php)
    // assert (exchange.parseDate ('Mon, 29 Apr 2024 14:00:17 GMT') === 1714399217000);
    // assert (exchange.parseDate ('Mon, 29 Apr 2024 14:09:17 GMT') === 1714399757000);
    // assert (exchange.parseDate ('Sun, 29 Dec 2024 01:01:10 GMT') === 1735434070000);
    // assert (exchange.parseDate ('Sun, 29 Dec 2024 02:11:10 GMT') === 1735438270000);
    // assert (exchange.parseDate ('Sun, 08 Dec 2024 02:03:04 GMT') === 1733623384000);
}

function testMicroseconds () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const value = exchange.microseconds ();
    const valueString: string = value.toString ();
    assert (value > 0);
    assert (valueString.length === 16);
}

function testMilliseconds () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const value = exchange.milliseconds ();
    const valueString: string  = value.toString ();
    assert (value > 0);
    assert (valueString.length === 13);
}

function testSeconds () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const value = exchange.seconds ();
    const valueString: string = value.toString ();
    assert (value > 0);
    assert (valueString.length === 10);
}

function testYymmdd () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testMs = 1750123456789; // 17 June 2025
    const value = exchange.yymmdd (testMs, '_');
    assert (value === '25_06_17');
    const value2: string = exchange.yymmdd (exchange.milliseconds ());
    assert (value2.length === 6);
    const intNum  = exchange.parseToInt (value2);
    assert (intNum > 260000 && intNum < 360000); // date between 2026 and 2036
}

function testYyyymmdd () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testMs = 1750123456789; // 17 June 2025
    const value = exchange.yyyymmdd (testMs, '_');
    assert (value === '2025_06_17');
    const value2: string = exchange.yyyymmdd (exchange.milliseconds ());
    assert (value2.length === 10);
    const intNum  = exchange.parseToInt ((value2.replace ('-', '')).replace ('-', ''));
    assert (intNum > 20260000 && intNum < 20360000); // date between 2026 and 2036
}

function testYmd () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testMs = 1750123456789; // 17 June 2025
    const value = exchange.ymd (testMs, '_');
    assert (value === '2025_06_17');
}

function testYmdhms () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testMs = 1750123456789; // 17 June 2025
    const value = exchange.ymdhms (testMs, '_');
    assert (value === '2025-06-17_01:24:16' || value === '2025-06-17_01:24:17'); // todo: php/py rounds up to 17
}

function testDatetime () {
    testIso8601 ();
    testParse8601 ();
    testParseDate ();
    testMicroseconds ();
    testMilliseconds ();
    testSeconds ();
    testYymmdd ();
    testYyyymmdd ();
    assert ("GO_SKIP_START");
    testYmd ();
    testYmdhms ();
    assert ("GO_SKIP_END");
}

export default testDatetime;
