
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';
import {  ROUND_DOWN, ROUND_UP } from '../../base/functions/number.js';



function testRoundTimeframe () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const testDate = exchange.parse8601 ('2019-08-12 13:22:08');
    assert (exchange.roundTimeframe ('5m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:20:00'));
    assert (exchange.roundTimeframe ('10m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:20:00'));
    assert (exchange.roundTimeframe ('30m', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 13:00:00'));
    assert (exchange.roundTimeframe ('1d', testDate, ROUND_DOWN) === exchange.parse8601 ('2019-08-12 00:00:00'));

    assert (exchange.roundTimeframe ('5m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:25:00'));
    assert (exchange.roundTimeframe ('10m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:30:00'));
    assert (exchange.roundTimeframe ('30m', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 13:30:00'));
    assert (exchange.roundTimeframe ('1h', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-12 14:00:00'));
    assert (exchange.roundTimeframe ('1d', testDate, ROUND_UP) === exchange.parse8601 ('2019-08-13 00:00:00'));

    // todo:
    // $this->assertSame(null, Exchange::iso8601(null));
    // $this->assertSame(null, Exchange::iso8601(false));
    // $this->assertSame(null, Exchange::iso8601([]));
    // $this->assertSame(null, Exchange::iso8601('abracadabra'));
    // $this->assertSame(null, Exchange::iso8601('1.2'));
    // $this->assertSame(null, Exchange::iso8601(-1));
    // $this->assertSame(null, Exchange::iso8601('-1'));
    // $this->assertSame('1970-01-01T00:00:00.000+00:00', Exchange::iso8601(0));
    // $this->assertSame('1970-01-01T00:00:00.000+00:00', Exchange::iso8601('0'));
    // $this->assertSame('1986-04-25T21:23:47.000+00:00', Exchange::iso8601(514848227000));
    // $this->assertSame('1986-04-25T21:23:47.000+00:00', Exchange::iso8601('514848227000'));

    // $this->assertSame(null, Exchange::parse_date(null));
    // $this->assertSame(null, Exchange::parse_date(0));
    // $this->assertSame(null, Exchange::parse_date('0'));
    // $this->assertSame(null, Exchange::parse_date('+1 day'));
    // $this->assertSame(null, Exchange::parse_date('1986-04-25T21:23:47+00:00 + 1 week'));
    // $this->assertSame(null, Exchange::parse_date('1 february'));
    // $this->assertSame(null, Exchange::parse_date('1986-04-26'));
    // $this->assertSame(0, Exchange::parse_date('1970-01-01T00:00:00.000+00:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('1986-04-25T21:23:47+00:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('1986-04-26T01:23:47+04:00'));
    // $this->assertSame(514848227000, Exchange::parse_date('25 Apr 1986 21:23:47 GMT'));
    // $this->assertSame(514862627000, Exchange::parse_date('1986-04-26T01:23:47.000Z'));
    // $this->assertSame(514862627123, Exchange::parse_date('1986-04-26T01:23:47.123Z'));
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
