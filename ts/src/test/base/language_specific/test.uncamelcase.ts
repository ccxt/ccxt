// @ts-nocheck

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../../ccxt.js';

const { index, aggregate, unCamelCase } = functions;

const equal = strictEqual;

function testUnCamelCase () {
    equal (unCamelCase ('parseOHLCVs'), 'parse_ohlcvs');
    equal (unCamelCase ('safeString2'), 'safe_string_2');
    equal (unCamelCase ('safeStringN'), 'safe_string_n');
    equal (unCamelCase ('convertOHLCVToTradingView'), 'convert_ohlcv_to_trading_view');
    equal (unCamelCase ('fetchL2OrderBook'), 'fetch_l2_order_book');
    equal (unCamelCase ('stringToBase64'), 'string_to_base64');
    equal (unCamelCase ('base64ToString'), 'base64_to_string');
    equal (unCamelCase ('parseHTTPResponse'), 'parse_http_response');
    equal (unCamelCase ('hasFetchOHLCV'), 'has_fetch_ohlcv');
}

export default testUnCamelCase;
