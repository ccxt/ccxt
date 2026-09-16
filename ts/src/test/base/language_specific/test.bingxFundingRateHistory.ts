// NO_AUTO_TRANSPILE
// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

async function testBingxFundingRateHistory () {
    const symbol = 'MTL/USDT:USDT';
    const start = 1700000000000;
    const hour = 3600000;
    const createExchange = (hours) => {
        const exchange = new ccxt.bingx ();
        exchange.markets = {
            [symbol]: { 'id': 'MTL-USDT', 'symbol': symbol, 'swap': true, 'inverse': false },
            'BTC/USD:BTC': { 'id': 'BTC-USD', 'symbol': 'BTC/USD:BTC', 'swap': true, 'inverse': true },
        };
        exchange.markets_by_id = { 'MTL-USDT': [ exchange.markets[symbol] ] };
        exchange.fetch = async () => { throw new Error ('unexpected network request'); };
        const rows = hours.map ((value) => ({ 'symbol': 'MTL-USDT', 'fundingRate': '0.0001', 'fundingTime': start + value * hour }));
        exchange.milliseconds = () => start + ((hours[hours.length - 1] ?? 0) + 1) * hour;
        const calls = [];
        exchange.swapV2PublicGetQuoteFundingRate = async (request) => {
            calls.push ({ ...request });
            for (const key of [ 'paginate', 'paginationCalls', 'paginationDirection', 'maxEntriesPerRequest', 'until', 'till' ]) {
                assert (!(key in request), 'pagination parameter leaked: ' + key);
            }
            const data = rows.filter ((row) => (request.startTime === undefined || row.fundingTime >= request.startTime) && (request.endTime === undefined || row.fundingTime <= request.endTime));
            return { 'code': 0, 'data': data.slice ().reverse ().slice (0, request.limit ?? 100) };
        };
        return { exchange, rows, calls };
    };
    const hourly = Array.from ({ length: 24 }, (_, i) => i);
    for (const hours of [ hourly, hourly.map ((i) => i * 2), hourly.map ((i) => i * 4), hourly.map ((i) => i * 8), [ 0, 8, 16, 17, 18, 19, 23, 27, 40, 48 ] ]) {
        const { exchange, rows, calls } = createExchange (hours);
        const params = { 'paginate': true, 'paginationCalls': 12, 'maxEntriesPerRequest': 2, 'until': rows[rows.length - 1].fundingTime };
        const original = { ...params };
        const result = await exchange.fetchFundingRateHistory (symbol, start, undefined, params);
        assert.deepStrictEqual (result.map ((row) => row.timestamp), rows.map ((row) => row.fundingTime));
        assert.deepStrictEqual (params, original, 'caller params must not be mutated');
        assert.strictEqual (calls.length, Math.ceil (rows.length / 2));
        for (let i = 1; i < calls.length; i++) {
            assert.strictEqual (calls[i].endTime, rows[rows.length - i * 2].fundingTime - 1);
        }
    }
    for (const boundaryKey of [ 'until', 'till', 'endTime' ]) {
        const { exchange, calls } = createExchange (hourly);
        const result = await exchange.fetchFundingRateHistory (symbol, start + 5 * hour, undefined, {
            'paginate': true, 'paginationCalls': 12, 'maxEntriesPerRequest': 2,
            [boundaryKey]: start + 10 * hour, 'paginationDirection': 'forward',
        });
        assert.deepStrictEqual (result.map ((row) => row.timestamp), hourly.slice (5, 11).map ((i) => start + i * hour));
        assert.strictEqual (calls.length, 3);
        assert.strictEqual (calls[0].endTime, start + 10 * hour);
    }
    const probe = createExchange (hourly);
    const capped = await probe.exchange.fetchFundingRateHistory (symbol, start, undefined, { 'paginate': true, 'paginationCalls': 2, 'maxEntriesPerRequest': 2 });
    assert.deepStrictEqual (capped.map ((row) => row.timestamp), hourly.slice (-4).map ((i) => start + i * hour));
    assert.strictEqual (probe.calls.length, 2);
    const limited = await probe.exchange.fetchFundingRateHistory (symbol, start, 3, { 'paginate': true, 'paginationCalls': 12, 'maxEntriesPerRequest': 2 });
    assert.deepStrictEqual (limited.map ((row) => row.timestamp), hourly.slice (0, 3).map ((i) => start + i * hour));
    const latest = await probe.exchange.fetchFundingRateHistory (symbol, undefined, 3, { 'paginate': true, 'paginationCalls': 12, 'maxEntriesPerRequest': 2 });
    assert.deepStrictEqual (latest.map ((row) => row.timestamp), hourly.slice (-3).map ((i) => start + i * hour));
    await probe.exchange.fetchFundingRateHistory (symbol, start, 2000, { 'until': start + 10 * hour });
    assert.deepStrictEqual (probe.calls[probe.calls.length - 1], { 'symbol': 'MTL-USDT', 'startTime': start, 'limit': 1000, 'endTime': start + 10 * hour });
    const empty = createExchange ([]);
    assert.deepStrictEqual (await empty.exchange.fetchFundingRateHistory (symbol, start, undefined, { 'paginate': true }), []);
    assert.strictEqual (empty.calls.length, 1);
    await assert.rejects (empty.exchange.fetchFundingRateHistory (undefined, start, undefined, { 'paginate': true }), ccxt.ArgumentsRequired);
    await assert.rejects (empty.exchange.fetchFundingRateHistory ('BTC/USD:BTC', start, undefined, { 'paginate': true }), ccxt.NotSupported);
    assert.strictEqual (empty.calls.length, 1);
}

export default testBingxFundingRateHistory;
