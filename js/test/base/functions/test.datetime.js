'use strict'

const ccxt = require ('../../../../ccxt');
const assert = require ('assert');
const { ROUND_UP, ROUND_DOWN } = require ('../../../base/functions/misc');

const exchange = new ccxt.Exchange ({
    'id': 'regirock',
});

// ----------------------------------------------------------------------------

assert (exchange.iso8601 (514862627000) === '1986-04-26T01:23:47.000Z');
assert (exchange.iso8601 (514862627559) === '1986-04-26T01:23:47.559Z');
assert (exchange.iso8601 (514862627062) === '1986-04-26T01:23:47.062Z');

assert (exchange.iso8601 (0) === '1970-01-01T00:00:00.000Z');

assert (exchange.iso8601 (-1) === undefined);
assert (exchange.iso8601 () === undefined);
assert (exchange.iso8601 (undefined) === undefined);
assert (exchange.iso8601 ('') === undefined);
assert (exchange.iso8601 ('a') === undefined);
assert (exchange.iso8601 ({}) === undefined);

// ----------------------------------------------------------------------------

assert (exchange.parse8601 ('1986-04-26T01:23:47.000Z') === 514862627000);
assert (exchange.parse8601 ('1986-04-26T01:23:47.559Z') === 514862627559);
assert (exchange.parse8601 ('1986-04-26T01:23:47.062Z') === 514862627062);

assert (exchange.parse8601 ('1977-13-13T00:00:00.000Z') === undefined);
assert (exchange.parse8601 ('1986-04-26T25:71:47.000Z') === undefined);

assert (exchange.parse8601 ('3333') === undefined);
assert (exchange.parse8601 ('Sr90') === undefined);
assert (exchange.parse8601 ('') === undefined);
assert (exchange.parse8601 () === undefined);
assert (exchange.parse8601 (undefined) === undefined);
assert (exchange.parse8601 ({}) === undefined);
assert (exchange.parse8601 (33) === undefined);

// ----------------------------------------------------------------------------

assert (exchange.parseDate ('1986-04-26 00:00:00') === 514857600000);
assert (exchange.parseDate ('1986-04-26T01:23:47.000Z') === 514862627000);
assert (exchange.parseDate ('1986-13-13 00:00:00') === undefined);


assert (exchange.roundTimeframe('5m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:20:00'));
assert (exchange.roundTimeframe('10m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:20:00'));
assert (exchange.roundTimeframe('30m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 13:00:00'));
assert (exchange.roundTimeframe('1d', exchange.parse8601('2019-08-12 13:22:08'), ROUND_DOWN) === exchange.parse8601('2019-08-12 00:00:00'));

assert (exchange.roundTimeframe('5m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:25:00'));
assert (exchange.roundTimeframe('10m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:30:00'));
assert (exchange.roundTimeframe('30m', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 13:30:00'));
assert (exchange.roundTimeframe('1h', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-12 14:00:00'));
assert (exchange.roundTimeframe('1d', exchange.parse8601('2019-08-12 13:22:08'), ROUND_UP) === exchange.parse8601('2019-08-13 00:00:00'));
