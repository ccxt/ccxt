import assert from 'assert';
import Precise from '../../../base/Precise.js';
import testSharedMethods from './test.sharedMethods.js';
function testTicker(exchange, skippedProperties, method, entry, symbol) {
    const format = {
        'info': {},
        'symbol': 'ETH/BTC',
        'timestamp': 1502962946216,
        'datetime': '2017-09-01T00:00:00',
        'high': exchange.parseNumber('1.234'),
        'low': exchange.parseNumber('1.234'),
        'bid': exchange.parseNumber('1.234'),
        'bidVolume': exchange.parseNumber('1.234'),
        'ask': exchange.parseNumber('1.234'),
        'askVolume': exchange.parseNumber('1.234'),
        'vwap': exchange.parseNumber('1.234'),
        'open': exchange.parseNumber('1.234'),
        'close': exchange.parseNumber('1.234'),
        'last': exchange.parseNumber('1.234'),
        'previousClose': exchange.parseNumber('1.234'),
        'change': exchange.parseNumber('1.234'),
        'percentage': exchange.parseNumber('1.234'),
        'average': exchange.parseNumber('1.234'),
        'baseVolume': exchange.parseNumber('1.234'),
        'quoteVolume': exchange.parseNumber('1.234'), // volume of quote currency
    };
    // todo: atm, many exchanges fail, so temporarily decrease stict mode
    const emptyAllowedFor = ['timestamp', 'datetime', 'open', 'high', 'low', 'close', 'last', 'baseVolume', 'quoteVolume', 'previousClose', 'bidVolume', 'askVolume', 'vwap', 'change', 'percentage', 'average'];
    // trick csharp-transpiler for string
    if (!(method.toString().includes('BidsAsks'))) {
        emptyAllowedFor.push('bid');
        emptyAllowedFor.push('ask');
    }
    testSharedMethods.assertStructure(exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime(exchange, skippedProperties, method, entry);
    const logText = testSharedMethods.logTemplate(exchange, method, entry);
    // check market
    let market = undefined;
    const symbolForMarket = (symbol !== undefined) ? symbol : exchange.safeString(entry, 'symbol');
    if (symbolForMarket !== undefined && (symbolForMarket in exchange.markets)) {
        market = exchange.market(symbolForMarket);
    }
    // temp todo: skip inactive markets for now, as they sometimes have weird values and causing issues:
    if (!('checkInactiveMarkets' in skippedProperties)) {
        if (market !== undefined && market['active'] === false) {
            return;
        }
    }
    if ('skipNonActiveMarkets' in skippedProperties) {
        if (market === undefined || !market['active']) {
            return;
        }
    }
    // only check "above zero" values if exchange is not supposed to have exotic index markets
    const isStandardMarket = (market !== undefined && exchange.inArray(market['type'], ['spot', 'swap', 'future', 'option']));
    const valuesShouldBePositive = isStandardMarket; // || (market === undefined) atm, no check for index markets
    if (valuesShouldBePositive && !('positiveValues' in skippedProperties)) {
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'open', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'high', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'low', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'close', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'ask', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'bid', '0');
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'average', '0');
        testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'vwap', '0');
    }
    // volume can not be negative
    testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'askVolume', '0');
    testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'bidVolume', '0');
    testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'baseVolume', '0');
    testSharedMethods.assertGreaterOrEqual(exchange, skippedProperties, method, entry, 'quoteVolume', '0');
    //
    // close price
    //
    const lastString = exchange.safeString(entry, 'last');
    const closeString = exchange.safeString(entry, 'close');
    assert(((closeString === undefined) && (lastString === undefined)) || Precise.stringEq(lastString, closeString), '`last` != `close`' + logText);
    const openPrice = exchange.safeString(entry, 'open');
    //
    // base & quote volumes
    //
    const baseVolume = exchange.omitZero(exchange.safeString(entry, 'baseVolume'));
    const quoteVolume = exchange.omitZero(exchange.safeString(entry, 'quoteVolume'));
    const high = exchange.omitZero(exchange.safeString(entry, 'high'));
    const low = exchange.omitZero(exchange.safeString(entry, 'low'));
    const open = exchange.omitZero(exchange.safeString(entry, 'open'));
    const close = exchange.omitZero(exchange.safeString(entry, 'close'));
    if (!('compareQuoteVolumeBaseVolume' in skippedProperties)) {
        // assert (baseVolumeDefined === quoteVolumeDefined, 'baseVolume or quoteVolume should be either both defined or both undefined' + logText); // No, exchanges might not report both values
        if ((baseVolume !== undefined) && (quoteVolume !== undefined) && (high !== undefined) && (low !== undefined)) {
            let baseLow = Precise.stringMul(baseVolume, low);
            let baseHigh = Precise.stringMul(baseVolume, high);
            // to avoid abnormal long precision issues (like https://discord.com/channels/690203284119617602/1338828283902689280/1338846071278927912 )
            const mPrecision = exchange.safeDict(market, 'precision');
            const amountPrecision = exchange.safeString(mPrecision, 'amount');
            const tolerance = '1.0001';
            if (amountPrecision !== undefined) {
                baseLow = Precise.stringMul(Precise.stringSub(baseVolume, amountPrecision), low);
                baseHigh = Precise.stringMul(Precise.stringAdd(baseVolume, amountPrecision), high);
            }
            else {
                // if nothing found, as an exclusion, just add 0.001%
                baseLow = Precise.stringMul(Precise.stringDiv(baseVolume, tolerance), low);
                baseHigh = Precise.stringMul(Precise.stringMul(baseVolume, tolerance), high);
            }
            // because of exchange engines might not rounding numbers propertly, we add some tolerance of calculated 24hr high/low
            baseLow = Precise.stringDiv(baseLow, tolerance);
            baseHigh = Precise.stringMul(baseHigh, tolerance);
            assert(Precise.stringGe(quoteVolume, baseLow), 'quoteVolume should be => baseVolume * low' + logText);
            assert(Precise.stringLe(quoteVolume, baseHigh), 'quoteVolume should be <= baseVolume * high' + logText);
        }
    }
    // open and close should be between High & Low
    if (high !== undefined && low !== undefined && !('compareOHLC' in skippedProperties)) {
        if (open !== undefined) {
            assert(Precise.stringGe(open, low), 'open should be >= low' + logText);
            assert(Precise.stringLe(open, high), 'open should be <= high' + logText);
        }
        if (close !== undefined) {
            assert(Precise.stringGe(close, low), 'close should be >= low' + logText);
            assert(Precise.stringLe(close, high), 'close should be <= high' + logText);
        }
    }
    //
    // vwap
    //
    const vwap = exchange.safeString(entry, 'vwap');
    if (vwap !== undefined) {
        // todo
        // assert (high !== undefined, 'vwap is defined, but high is not' + logText);
        // assert (low !== undefined, 'vwap is defined, but low is not' + logText);
        // assert (vwap >= low && vwap <= high)
        // todo: calc compare
        assert(!valuesShouldBePositive || Precise.stringGe(vwap, '0'), 'vwap is not greater than zero' + logText);
        if (baseVolume !== undefined) {
            assert(quoteVolume !== undefined, 'baseVolume & vwap is defined, but quoteVolume is not' + logText);
        }
        if (quoteVolume !== undefined) {
            assert(baseVolume !== undefined, 'quoteVolume & vwap is defined, but baseVolume is not' + logText);
        }
    }
    const askString = exchange.safeString(entry, 'ask');
    const bidString = exchange.safeString(entry, 'bid');
    if ((askString !== undefined) && (bidString !== undefined) && !('spread' in skippedProperties)) {
        testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'ask', exchange.safeString(entry, 'bid'));
    }
    const percentage = exchange.safeString(entry, 'percentage');
    const change = exchange.safeString(entry, 'change');
    if (!('maxIncrease' in skippedProperties)) {
        //
        // percentage
        //
        const maxIncrease = '100'; // for testing purposes, if "increased" value is more than 100x, tests should break as implementation might be wrong. however, if something rarest event happens and some coin really had that huge increase, the tests will shortly recover in few hours, as new 24-hour cycle would stabilize tests)
        if (percentage !== undefined) {
            // - should be above -100 and below MAX
            assert(Precise.stringGe(percentage, '-100'), 'percentage should be above -100% ' + logText);
            assert(Precise.stringLe(percentage, Precise.stringMul('+100', maxIncrease)), 'percentage should be below ' + maxIncrease + '00% ' + logText);
        }
        //
        // change
        //
        const approxValue = exchange.safeStringN(entry, ['open', 'close', 'average', 'bid', 'ask', 'vwap', 'previousClose']);
        if (change !== undefined) {
            // - should be between -price & +price*100
            assert(Precise.stringGe(change, Precise.stringNeg(approxValue)), 'change should be above -price ' + logText);
            assert(Precise.stringLe(change, Precise.stringMul(approxValue, maxIncrease)), 'change should be below ' + maxIncrease + 'x price ' + logText);
        }
    }
    //
    // ensure all expected values are defined
    //
    if (lastString !== undefined) {
        if (percentage !== undefined) {
            // if one knows 'last' and 'percentage' values, then 'change', 'open' and 'average' values should be determinable.
            assert(openPrice !== undefined && change !== undefined, 'open & change should be defined if last & percentage are defined' + logText); // todo : add average price too
        }
        else if (change !== undefined) {
            // if one knows 'last' and 'change' values, then 'percentage', 'open' and 'average' values should be determinable.
            assert(openPrice !== undefined && percentage !== undefined, 'open & percentage should be defined if last & change are defined' + logText); // todo : add average price too
        }
    }
    else if (openPrice !== undefined) {
        if (percentage !== undefined) {
            // if one knows 'open' and 'percentage' values, then 'last', 'change' and 'average' values should be determinable.
            assert(lastString !== undefined && change !== undefined, 'last & change should be defined if open & percentage are defined' + logText); // todo : add average price too
        }
        else if (change !== undefined) {
            // if one knows 'open' and 'change' values, then 'last', 'percentage' and 'average' values should be determinable.
            assert(lastString !== undefined && percentage !== undefined, 'last & percentage should be defined if open & change are defined' + logText); // todo : add average price too
        }
    }
    //
    // todo: rethink about this
    // else {
    //    assert ((askString === undefined) && (bidString === undefined), 'ask & bid should be both defined or both undefined' + logText);
    // }
    testSharedMethods.assertSymbol(exchange, skippedProperties, method, entry, 'symbol', symbol);
}
export default testTicker;
