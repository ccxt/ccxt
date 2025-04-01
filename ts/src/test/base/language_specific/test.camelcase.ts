// @ts-nocheck

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../../ccxt.js';

const { index, aggregate, unCamelCase } = functions;

const equal = strictEqual;

function testCamelCasePropertyConversion () {

    const exchange = new ccxt.Exchange ({ 'id': 'mock' });

    const propsSeenBefore = index (
        [ "isNode", "empty", "keys", "values", "extend", "clone", "index", "ordered", "unique", "keysort", "indexBy", "groupBy", "filterBy", "sortBy", "flatten", "pluck", "omit", "sum", "deepExtend", "uuid", "unCamelCase", "capitalize", "isNumber", "isArray", "isObject", "isString", "isStringCoercible", "isDictionary", "hasProps", "prop", "asFloat", "asInteger", "safeFloat", "safeInteger", "safeValue", "safeString", "decimal", "toFixed", "truncate", "truncateToString", "precisionFromString", "stringToBinary", "stringToBase64", "base64ToBinary", "base64ToString", "binaryToString", "binaryConcat", "urlencode", "rawencode", "urlencodeBase64", "hash", "hmac", "jwt", "time", "setTimeout_safe", "sleep", "TimedOut", "timeout", "throttle", "json", "aggregate", "is_node", "index_by", "group_by", "filter_by", "sort_by", "deep_extend", "un_camel_case", "is_number", "is_array", "is_object", "is_string", "is_string_coercible", "is_dictionary", "has_props", "as_float", "as_integer", "safe_float", "safe_integer", "safe_value", "safe_string", "to_fixed", "truncate_to_string", "precision_from_string", "string_to_binary", "string_to_base64", "utf16To_base64", "base64To_binary", "base64To_string", "binary_to_string", "binary_concat", "urlencode_base64", "set_timeout_safe", "Timed_out", "encode", "decode", "userAgents", "headers", "proxy", "origin", "iso8601", "parse8601", "milliseconds", "microseconds", "seconds", "id", "enableRateLimit", "rateLimit", "parseJsonResponse", "substituteCommonCurrencyCodes", "verbose", "debug", "journal", "userAgent", "twofa", "timeframes", "hasPublicAPI", "hasPrivateAPI", "hasCORS", "hasDeposit", "hasFetchBalance", "hasFetchClosedOrders", "hasFetchCurrencies", "hasFetchMyTrades", "hasFetchOHLCV", "hasFetchOpenOrders", "hasFetchOrder", "hasFetchOrderBook", "hasFetchOrders", "hasFetchTicker", "hasFetchTickers", "hasFetchBidsAsks", "hasFetchTrades", "hasWithdraw", "hasCreateOrder", "hasCancelOrder", "apiKey", "secret", "uid", "login", "password", "requiredCredentials", "exceptions", "balance", "orderbooks", "tickers", "fees", "orders", "trades", "currencies", "last_http_response", "last_json_response", "arrayConcat", "market_id", "market_ids", "array_concat", "implode_params", "extract_params", "fetch_balance", "fetch_free_balance", "fetch_used_balance", "fetch_total_balance", "fetch_l2_order_book", "fetch_order_book", "fetch_bids_asks", "fetch_tickers", "fetch_ticker", "fetch_trades", "fetch_order", "fetch_orders", "fetch_open_orders", "fetch_closed_orders", "fetch_order_status", "fetch_markets", "load_markets", "set_markets", "parse_balance", "parse_bid_ask", "parse_bids_asks", "parse_order_book", "parse_trades", "parse_orders", "parse_ohlcv", "parse_ohlcvs", "edit_limit_buy_order", "edit_limit_sell_order", "edit_limit_order", "edit_order", "create_limit_buy_order", "create_limit_sell_order", "create_market_buy_order", "create_market_sell_order", "create_order", "calculate_fee", "common_currency_code", "price_to_precision", "amount_to_precision", "amount_to_string", "fee_to_precision", "cost_to_precision", "constructor", "getMarket", "describe", "defaults", "nonce", "encodeURIComponent", "checkRequiredCredentials", "initRestRateLimiter", "defineRestApi", "fetch", "fetch2", "request", "handleErrors", "defaultErrorHandler", "handleRestErrors", "handleRestResponse", "setMarkets", "loadMarkets", "fetchBidsAsks", "fetchTickers", "fetchOrder", "fetchOrders", "fetchOpenOrders", "fetchClosedOrders", "fetchMyTrades", "fetchCurrencies", "fetchMarkets", "fetchOrderStatus", "account", "commonCurrencyCode", "currency", "market", "marketId", "marketIds", "symbol", "extractParams", "implodeParams", "url", "parseBidAsk", "parseBidsAsks", "fetchL2OrderBook", "parseOrderBook", "safeBalance", "fetchPartialBalance", "fetchFreeBalance", "fetchUsedBalance", "fetchTotalBalance", "filterBySinceLimit", "parseTrades", "parseOrders", "filterOrdersBySymbol", "parseOHLCV", "parseOHLCVs", "editLimitBuyOrder", "editLimitSellOrder", "editLimitOrder", "editOrder", "createLimitBuyOrder", "createLimitSellOrder", "createMarketBuyOrder", "createMarketSellOrder", "costToPrecision", "priceToPrecision", "amountToPrecision", "amountToLots", "feeToPrecision", "calculateFee", "Ymd", "YmdHMS" ]
    );

    const props = index (Object.getOwnPropertyNames (exchange).concat (Object.getOwnPropertyNames (exchange.constructor.prototype)));

    // eslint-disable-next-line no-restricted-syntax
    for (const k of Array.from (propsSeenBefore)) {
        if (exchange[k] && !props.has (k)) {
            throw new Error (`missing prop: ${k}`);
        }
    }

    // for (const k of Array.from (props)) {
    //     if (!propsSeenBefore.has (k)) {
    //         log.magenta.noLocate (`+ ${k}`)
    //     }
    // }

}

function testCamelCasePropertyConversion2 () {
    class Derived extends Exchange {}
    const derived = new Derived ();
    equal (typeof derived.load_markets, 'function');
}

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

function testCamelCase () {
    testUnCamelCase ();
    testCamelCasePropertyConversion ();
    testCamelCasePropertyConversion2 ();
}

export default testCamelCase;
