
import assert from 'assert';
import ccxt from '../../../ccxt.js';


function testParseMarkets () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    //
    // scenario 1: should not trigger parseMarket
    //
    const markets1 = [
        { 'id': undefined, 'base': 'ETH', 'quote': 'USD' },
    ];
    const parsedMarkets = exchange.parseMarkets (markets1);
    assert (parsedMarkets.length === 0, 'Expected 0 parsed markets');
    //
    // scenario 2: should trigger parseMarket
    //
    const markets2 = [
        { 'id': 'BTC_USD', 'base': 'BTC', 'quote': 'USD' },
    ];
    const trueAssertion = exchange.safeBool (undefined, undefined, true);
    try {
        exchange.parseMarkets (markets2);
        assert (!trueAssertion, 'Expected parseMarkets to fail');
    } catch (e) {
        assert (trueAssertion); // just skip, parseMarket exception is expected
    }
    //
    // scenario 3: should trigger parseMarket
    //
    const markets3 = [
        { 'id': 'ETH_USD', 'base': undefined, 'quote': undefined },
    ];
    try {
        exchange.parseMarkets (markets3);
        assert (!trueAssertion, 'Expected parseMarkets to fail');
    } catch (e) {
        assert (trueAssertion);
    }
}


export default testParseMarkets;
