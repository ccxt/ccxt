<?php
namespace ccxt;

// hand-written php-only test: __call maps a camelCase method name to the snake_case name the transpiler gave it,
// so underscore() has to agree with unCamelCase in ts/src/base/functions/string.ts
function test_underscore() {
    $cases = array(
        'parseOHLCVs' => 'parse_ohlcvs',
        'safeString2' => 'safe_string_2',
        'safeStringN' => 'safe_string_n',
        'convertOHLCVToTradingView' => 'convert_ohlcv_to_trading_view',
        'fetchL2OrderBook' => 'fetch_l2_order_book',
        'stringToBase64' => 'string_to_base64',
        'base64ToString' => 'base64_to_string',
        'parseHTTPResponse' => 'parse_http_response',
        'hasFetchOHLCV' => 'has_fetch_ohlcv',
        'watchOHLCVForSymbols' => 'watch_ohlcv_for_symbols',
        'unWatchOHLCVForSymbols' => 'un_watch_ohlcv_for_symbols',
        'fetchADLRank' => 'fetch_adl_rank',
        'fetchPositionsADLRank' => 'fetch_positions_adl_rank',
        'fetchOHLCVWs' => 'fetch_ohlcv_ws',
        'fetchTicker' => 'fetch_ticker',
        'fetch_ticker' => 'fetch_ticker',
    );
    foreach ($cases as $camelcase => $expected) {
        assert(Exchange::underscore($camelcase) === $expected, $camelcase . ' → ' . Exchange::underscore($camelcase) . ', expected ' . $expected);
    }
    $exchange = new \ccxt\Exchange(array(
        'id' => 'sampleexchange',
    ));
    assert($exchange->safeString2(array('b' => 'x'), 'a', 'b') === 'x');
    $message = null;
    try {
        $exchange->unWatchOHLCVForSymbols(array(array('BTC/USDT', '1m')));
    } catch (\ccxt\ExchangeError $e) {
        $message = $e->getMessage();
    }
    assert($message === 'sampleexchange unWatchOHLCVForSymbols() is not supported yet', 'unexpected: ' . $message);
}
