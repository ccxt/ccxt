import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

<<<<<<< HEAD
function testTrade (exchange, skippedProperties, method, entry, symbol, now, isPublicTrade) {
=======
function testTrade (exchange: Exchange, skippedProperties: object, method: string, entry: object, symbol: string, now: number) {
>>>>>>> e0f7ad0526268457c6f919972351c81d991580ed
    const format = {
        'info': { },
        'id': '12345-67890:09876/54321', // string trade id
        'timestamp': 1502962946216, // Unix timestamp in milliseconds
        'datetime': '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol': 'ETH/BTC', // symbol
        'order': '12345-67890:09876/54321', // string order id or undefined/None/null
        'side': 'buy', // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker', // string, 'taker' or 'maker'
        'price': exchange.parseNumber ('0.06917684'), // float price in quote currency
        'amount': exchange.parseNumber ('1.5'), // amount of base currency
        'cost': exchange.parseNumber ('0.10376526'), // total cost (including fees), `price * amount`
        'fees': [],
        'fee': {},
    };
    // todo: add takeOrMaker as mandatory (atm, many exchanges fail)
    const emptyAllowedFor = [ 'fees', 'fee', 'symbol', 'order', 'id', 'takerOrMaker', 'timestamp', 'datetime' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry, now);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', symbol);
    //
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'side', [ 'buy', 'sell' ]);
    if (isPublicTrade) {
        // for public trades (fetchTrades & watchTrades), it must be either 'taker' or undefined
        testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'takerOrMaker', [ 'taker', undefined ]);
    } else {
        // for private trades (fetchMyTrades & watchMyTrades), it can be any
        testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'takerOrMaker', [ 'taker', 'maker', undefined ]);
    }
    testSharedMethods.assertFeeStructure (exchange, skippedProperties, method, entry, 'fee');
    if (!('fees' in skippedProperties)) {
        // todo: remove undefined check and probably non-empty array check later
        if (entry['fees'] !== undefined) {
            for (let i = 0; i < entry['fees'].length; i++) {
                testSharedMethods.assertFeeStructure (exchange, skippedProperties, method, entry['fees'], i);
            }
        }
    }
}

export default testTrade;
