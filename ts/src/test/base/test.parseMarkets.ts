
import assert from 'assert';
import ccxt from '../../../ccxt.js';


function testParseMarkets () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    // we don't check empty base or quote inside parseMarkets
    const markets = [
        { 'id': 'BTC_USD', 'base': 'BTC', 'quote': 'USD' },
        { 'id': undefined, 'base': 'ETH', 'quote': 'USD' },
        { 'id': 'ETH_USD', 'base': undefined, 'quote': 'USD' },
        { 'id': 'ETH_USD', 'base': 'ETH', 'quote': undefined },
    ];
    const parsedMarkets = exchange.parseMarkets (markets);
    assert (parsedMarkets.length === 2, 'Expected 3 parsed markets');
    assert (parsedMarkets[0] !== undefined && parsedMarkets[0]['base'] === 'BTC', 'Expected BTC as base for the first market');
}

export default testParseMarkets;
