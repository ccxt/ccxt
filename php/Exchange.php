<?php

/*

MIT License

Copyright (c) 2017 CCXT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//-----------------------------------------------------------------------------

namespace ccxt;

use kornrunner\Keccak;
use Elliptic\EC;
use Elliptic\EdDSA;
use BN\BN;
use Exception;

$version = '1.55.42';

// rounding mode
const TRUNCATE = 0;
const ROUND = 1;
const ROUND_UP = 2;
const ROUND_DOWN = 3;

// digits counting mode
const DECIMAL_PLACES = 0;
const SIGNIFICANT_DIGITS = 1;
const TICK_SIZE = 2;

// padding mode
const NO_PADDING = 0;
const PAD_WITH_ZERO = 1;

class Exchange {

    const VERSION = '1.55.42';

    private static $base58_alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    private static $base58_encoder = null;
    private static $base58_decoder = null;

    public static $exchanges = array(
        'aax',
        'aofex',
        'ascendex',
        'bequant',
        'bibox',
        'bigone',
        'binance',
        'binancecoinm',
        'binanceus',
        'binanceusdm',
        'bit2c',
        'bitbank',
        'bitbay',
        'bitbns',
        'bitcoincom',
        'bitfinex',
        'bitfinex2',
        'bitflyer',
        'bitforex',
        'bitget',
        'bithumb',
        'bitmart',
        'bitmex',
        'bitpanda',
        'bitso',
        'bitstamp',
        'bitstamp1',
        'bittrex',
        'bitvavo',
        'bitz',
        'bl3p',
        'braziliex',
        'btcalpha',
        'btcbox',
        'btcmarkets',
        'btctradeua',
        'btcturk',
        'buda',
        'bw',
        'bybit',
        'cdax',
        'cex',
        'coinbase',
        'coinbaseprime',
        'coinbasepro',
        'coincheck',
        'coinegg',
        'coinex',
        'coinfalcon',
        'coinfloor',
        'coinmarketcap',
        'coinmate',
        'coinone',
        'coinspot',
        'crex24',
        'currencycom',
        'delta',
        'deribit',
        'digifinex',
        'eqonex',
        'equos',
        'exmo',
        'exx',
        'flowbtc',
        'ftx',
        'gateio',
        'gemini',
        'gopax',
        'hbtc',
        'hitbtc',
        'hollaex',
        'huobi',
        'huobijp',
        'huobipro',
        'idex',
        'independentreserve',
        'indodax',
        'itbit',
        'kraken',
        'kucoin',
        'kuna',
        'latoken',
        'lbank',
        'liquid',
        'luno',
        'lykke',
        'mercado',
        'mixcoins',
        'ndax',
        'novadax',
        'oceanex',
        'okcoin',
        'okex',
        'okex3',
        'okex5',
        'paymium',
        'phemex',
        'poloniex',
        'probit',
        'qtrade',
        'ripio',
        'stex',
        'therock',
        'tidebit',
        'tidex',
        'timex',
        'upbit',
        'vcc',
        'wavesexchange',
        'whitebit',
        'xena',
        'yobit',
        'zaif',
        'zb',
    );

    public static $camelcase_methods = array(
        'defaultFetch' => 'default_fetch',
        'arrayConcat' => 'array_concat',
        'inArray' => 'in_array',
        'toArray' => 'to_array',
        'isEmpty' => 'is_empty',
        'indexBy' => 'index_by',
        'groupBy' => 'group_by',
        'filterBy' => 'filter_by',
        'sortBy' => 'sort_by',
        'deepExtend' => 'deep_extend',
        'unCamelCase' => 'un_camel_case',
        'isNumber' => 'is_number',
        'isInteger' => 'is_integer',
        'isArray' => 'is_array',
        'isObject' => 'is_object',
        'isString' => 'is_string',
        'isStringCoercible' => 'is_string_coercible',
        'isDictionary' => 'is_dictionary',
        'hasProps' => 'has_props',
        'asFloat' => 'as_float',
        'asInteger' => 'as_integer',
        'safeFloat' => 'safe_float',
        'safeInteger' => 'safe_integer',
        'safeIntegerProduct' => 'safe_integer_product',
        'safeTimestamp' => 'safe_timestamp',
        'safeValue' => 'safe_value',
        'safeString' => 'safe_string',
        'safeStringLower' => 'safe_string_lower',
        'safeStringUpper' => 'safe_string_upper',
        'safeFloat2' => 'safe_float2',
        'safeInteger2' => 'safe_integer2',
        'safeIntegerProduct2' => 'safe_integer_product2',
        'safeTimestamp2' => 'safe_timestamp2',
        'safeValue2' => 'safe_value2',
        'safeString2' => 'safe_string2',
        'safeStringLower2' => 'safe_string_lower2',
        'safeStringUpper2' => 'safe_string_upper2',
        'numberToString' => 'number_to_string',
        'precisionFromString' => 'precision_from_string',
        'decimalToPrecision' => 'decimal_to_precision',
        'omitZero' => 'omit_zero',
        'isJsonEncodedObject' => 'is_json_encoded_object',
        'stringToBinary' => 'string_to_binary',
        'stringToBase64' => 'string_to_base64',
        'base64ToBinary' => 'base64_to_binary',
        'base64ToString' => 'base64_to_string',
        'binaryToBase64' => 'binary_to_base64',
        'base16ToBinary' => 'base16_to_binary',
        'binaryToBase16' => 'binary_to_base16',
        'binaryConcat' => 'binary_concat',
        'binaryConcatArray' => 'binary_concat_array',
        'urlencodeWithArrayRepeat' => 'urlencode_with_array_repeat',
        'urlencodeBase64' => 'urlencode_base64',
        'numberToLE' => 'number_to_le',
        'numberToBE' => 'number_to_be',
        'base58ToBinary' => 'base58_to_binary',
        'binaryToBase58' => 'binary_to_base58',
        'byteArrayToWordArray' => 'byte_array_to_word_array',
        'parseDate' => 'parse_date',
        'setTimeout_safe' => 'set_timeout_safe',
        'TimedOut' => 'timed_out',
        'parseTimeframe' => 'parse_timeframe',
        'roundTimeframe' => 'round_timeframe',
        'buildOHLCVC' => 'build_ohlcvc',
        'implodeParams' => 'implode_params',
        'extractParams' => 'extract_params',
        'fetchImplementation' => 'fetch_implementation',
        'executeRestRequest' => 'execute_rest_request',
        'encodeURIComponent' => 'encode_uri_component',
        'checkRequiredCredentials' => 'check_required_credentials',
        'checkAddress' => 'check_address',
        'initRestRateLimiter' => 'init_rest_rate_limiter',
        'setSandboxMode' => 'set_sandbox_mode',
        'defineRestApiEndpoint' => 'define_rest_api_endpoint',
        'defineRestApi' => 'define_rest_api',
        'setHeaders' => 'set_headers',
        'calculateRateLimiterCost' => 'calculate_rate_limiter_cost',
        'parseJson' => 'parse_json',
        'throwExactlyMatchedException' => 'throw_exactly_matched_exception',
        'throwBroadlyMatchedException' => 'throw_broadly_matched_exception',
        'findBroadlyMatchedKey' => 'find_broadly_matched_key',
        'handleErrors' => 'handle_errors',
        'handleHttpStatusCode' => 'handle_http_status_code',
        'getResponseHeaders' => 'get_response_headers',
        'handleRestResponse' => 'handle_rest_response',
        'onRestResponse' => 'on_rest_response',
        'onJsonResponse' => 'on_json_response',
        'setMarkets' => 'set_markets',
        'loadMarketsHelper' => 'load_markets_helper',
        'loadMarkets' => 'load_markets',
        'loadAccounts' => 'load_accounts',
        'fetchBidsAsks' => 'fetch_bids_asks',
        'fetchOHLCVC' => 'fetch_ohlcvc',
        'fetchOHLCV' => 'fetch_ohlcv',
        'parseTradingViewOHLCV' => 'parse_trading_view_ohlcv',
        'convertTradingViewToOHLCV' => 'convert_trading_view_to_ohlcv',
        'convertOHLCVToTradingView' => 'convert_ohlcv_to_trading_view',
        'fetchTicker' => 'fetch_ticker',
        'fetchTickers' => 'fetch_tickers',
        'fetchOrder' => 'fetch_order',
        'fetchUnifiedOrder' => 'fetch_unified_order',
        'createOrder' => 'create_order',
        'cancelOrder' => 'cancel_order',
        'cancelUnifiedOrder' => 'cancel_unified_order',
        'fetchOrders' => 'fetch_orders',
        'fetchOpenOrders' => 'fetch_open_orders',
        'fetchClosedOrders' => 'fetch_closed_orders',
        'fetchMyTrades' => 'fetch_my_trades',
        'fetchTransactions' => 'fetch_transactions',
        'fetchDeposits' => 'fetch_deposits',
        'fetchWithdrawals' => 'fetch_withdrawals',
        'fetchDepositAddress' => 'fetch_deposit_address',
        'fetchCurrencies' => 'fetch_currencies',
        'fetchMarkets' => 'fetch_markets',
        'fetchOrderStatus' => 'fetch_order_status',
        'commonCurrencyCode' => 'common_currency_code',
        'marketId' => 'market_id',
        'marketIds' => 'market_ids',
        'implodeHostname' => 'implode_hostname',
        'parseBidAsk' => 'parse_bid_ask',
        'parseBidsAsks' => 'parse_bids_asks',
        'fetchL2OrderBook' => 'fetch_l2_order_book',
        'parseOrderBook' => 'parse_order_book',
        'parseBalance' => 'parse_balance',
        'fetchBalance' => 'fetch_balance',
        'fetchPartialBalance' => 'fetch_partial_balance',
        'fetchFreeBalance' => 'fetch_free_balance',
        'fetchUsedBalance' => 'fetch_used_balance',
        'fetchTotalBalance' => 'fetch_total_balance',
        'fetchStatus' => 'fetch_status',
        'fetchTradingFees' => 'fetch_trading_fees',
        'fetchTradingFee' => 'fetch_trading_fee',
        'loadTradingLimits' => 'load_trading_limits',
        'filterBySinceLimit' => 'filter_by_since_limit',
        'filterByValueSinceLimit' => 'filter_by_value_since_limit',
        'filterBySymbolSinceLimit' => 'filter_by_symbol_since_limit',
        'filterByCurrencySinceLimit' => 'filter_by_currency_since_limit',
        'filterByArray' => 'filter_by_array',
        'safeTicker' => 'safe_ticker',
        'parseTickers' => 'parse_tickers',
        'parseDepositAddresses' => 'parse_deposit_addresses',
        'parseTrades' => 'parse_trades',
        'parseTransactions' => 'parse_transactions',
        'parseTransfers' => 'parse_transfers',
        'parseLedger' => 'parse_ledger',
        'parseOrders' => 'parse_orders',
        'safeCurrency' => 'safe_currency',
        'safeCurrencyCode' => 'safe_currency_code',
        'safeMarket' => 'safe_market',
        'safeSymbol' => 'safe_symbol',
        'filterBySymbol' => 'filter_by_symbol',
        'parseOHLCV' => 'parse_ohlcv',
        'parseOHLCVs' => 'parse_ohlc_vs',
        'editLimitBuyOrder' => 'edit_limit_buy_order',
        'editLimitSellOrder' => 'edit_limit_sell_order',
        'editLimitOrder' => 'edit_limit_order',
        'editOrder' => 'edit_order',
        'createLimitOrder' => 'create_limit_order',
        'createMarketOrder' => 'create_market_order',
        'createLimitBuyOrder' => 'create_limit_buy_order',
        'createLimitSellOrder' => 'create_limit_sell_order',
        'createMarketBuyOrder' => 'create_market_buy_order',
        'createMarketSellOrder' => 'create_market_sell_order',
        'costToPrecision' => 'cost_to_precision',
        'priceToPrecision' => 'price_to_precision',
        'amountToPrecision' => 'amount_to_precision',
        'feeToPrecision' => 'fee_to_precision',
        'currencyToPrecision' => 'currency_to_precision',
        'calculateFee' => 'calculate_fee',
        'checkRequiredDependencies' => 'check_required_dependencies',
        'remove0xPrefix' => 'remove0x_prefix',
        'hashMessage' => 'hash_message',
        'signHash' => 'sign_hash',
        'signMessage' => 'sign_message',
        'signMessageString' => 'sign_message_string',
        'reduceFeesByCurrency' => 'reduce_fees_by_currency',
        'safeOrder' => 'safe_order',
        'parseNumber' => 'parse_number',
        'safeNumber' => 'safe_number',
        'safeNumber2' => 'safe_number2',
        'parsePrecision' => 'parse_precision',
    );

    public static function split($string, $delimiters = array(' ')) {
        return explode($delimiters[0], str_replace($delimiters, $delimiters[0], $string));
    }

    public static function strip($string) {
        return trim($string);
    }

    public static function decimal($number) {
        return '' + $number;
    }

    public static function safe_float($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_numeric($object[$key])) ? floatval($object[$key]) : $default_value;
    }

    public static function safe_string($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_scalar($object[$key])) ? strval($object[$key]) : $default_value;
    }

    public static function safe_string_lower($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_scalar($object[$key])) ? strtolower(strval($object[$key])) : $default_value;
    }

    public static function safe_string_upper($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_scalar($object[$key])) ? strtoupper(strval($object[$key])) : $default_value;
    }

    public static function safe_integer($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_numeric($object[$key])) ? intval($object[$key]) : $default_value;
    }

    public static function safe_integer_product($object, $key, $factor, $default_value = null) {
        return (isset($object[$key]) && is_numeric($object[$key])) ? (intval($object[$key] * $factor)) : $default_value;
    }

    public static function safe_timestamp($object, $key, $default_value = null) {
        return static::safe_integer_product($object, $key, 1000, $default_value);
    }

    public static function safe_value($object, $key, $default_value = null) {
        return (is_array($object) && array_key_exists($key, $object)) ? $object[$key] : $default_value;
    }

    // we're not using safe_floats with a list argument as we're trying to save some cycles here
    // we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    public static function safe_float_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_float($object, $key1);
        return isset($value) ? $value : static::safe_float($object, $key2, $default_value);
    }

    public static function safe_string_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string($object, $key1);
        return isset($value) ? $value : static::safe_string($object, $key2, $default_value);
    }

    public static function safe_string_lower_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string_lower($object, $key1);
        return isset($value) ? $value : static::safe_string_lower($object, $key2, $default_value);
    }

    public static function safe_string_upper_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string_upper($object, $key1);
        return isset($value) ? $value : static::safe_string_upper($object, $key2, $default_value);
    }

    public static function safe_integer_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_integer($object, $key1);
        return isset($value) ? $value : static::safe_integer($object, $key2, $default_value);
    }

    public static function safe_integer_product_2($object, $key1, $key2, $factor, $default_value = null) {
        $value = static::safe_integer_product($object, $key1, $factor);
        return isset($value) ? $value : static::safe_integer_product($object, $key2, $factor, $default_value);
    }

    public static function safe_timestamp_2($object, $key1, $key2, $default_value = null) {
        return static::safe_integer_product_2($object, $key1, $key2, 1000, $default_value);
    }

    public static function safe_value_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_value($object, $key1);
        return isset($value) ? $value : static::safe_value($object, $key2, $default_value);
    }

    public static function truncate($number, $precision = 0) {
        $decimal_precision = pow(10, $precision);
        return floor(floatval($number * $decimal_precision)) / $decimal_precision;
    }

    public static function truncate_to_string($number, $precision = 0) {
        if ($precision > 0) {
            $string = sprintf('%.' . ($precision + 1) . 'F', floatval($number));
            list($integer, $decimal) = explode('.', $string);
            $decimal = trim('.' . substr($decimal, 0, $precision), '0');
            if (strlen($decimal) < 2) {
                $decimal = '.0';
            }
            return $integer . $decimal;
        }
        return sprintf('%d', floatval($number));
    }

    public static function uuid16($length = 16) {
        return bin2hex(random_bytes(intval($length / 2)));
    }

    public static function uuid22($length = 22) {
        return bin2hex(random_bytes(intval($length / 2)));
    }

    public static function uuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            // 32 bits for "time_low"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),

            // 16 bits for "time_mid"
            mt_rand(0, 0xffff),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand(0, 0x0fff) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res", 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand(0, 0x3fff) | 0x8000,

            // 48 bits for "node"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public static function uuidv1() {
        $biasSeconds = 12219292800;  // seconds from 15th Oct 1572 to Jan 1st 1970
        $bias = $biasSeconds * 10000000;  // in hundreds of nanoseconds
        $time = static::microseconds() * 10 + $bias;
        $timeHex = dechex($time);
        $arranged = substr($timeHex, 7, 8) . substr($timeHex, 3, 4) . '1' . substr($timeHex, 0, 3);
        $clockId = '9696';
        $macAddress = 'ffffffffffff';
        return $arranged . $clockId . $macAddress;
    }

    public static function parse_timeframe($timeframe) {
        $amount = substr($timeframe, 0, -1);
        $unit = substr($timeframe, -1);
        $scale = 1;
        if ($unit === 'y') {
            $scale = 60 * 60 * 24 * 365;
        } elseif ($unit === 'M') {
            $scale = 60 * 60 * 24 * 30;
        } elseif ($unit === 'w') {
            $scale = 60 * 60 * 24 * 7;
        } elseif ($unit === 'd') {
            $scale = 60 * 60 * 24;
        } elseif ($unit === 'h') {
            $scale = 60 * 60;
        } elseif ($unit === 'm') {
            $scale = 60;
        } elseif ($unit === 's') {
            $scale = 1;
        } else {
            throw new NotSupported('timeframe unit ' . $unit . ' is not supported');
        }
        return $amount * $scale;
    }

    public static function round_timeframe($timeframe, $timestamp, $direction=ROUND_DOWN) {
        $ms = static::parse_timeframe($timeframe) * 1000;
        // Get offset based on timeframe in milliseconds
        $offset = $timestamp % $ms;
        return $timestamp - $offset + (($direction === ROUND_UP) ? $ms : 0);
    }

    // given a sorted arrays of trades (recent first) and a timeframe builds an array of OHLCV candles
    public static function build_ohlcv($trades, $timeframe = '1m', $since = PHP_INT_MIN, $limits = PHP_INT_MAX) {
        if (empty($trades) || !is_array($trades)) {
            return array();
        }
        if (!is_numeric($since)) {
            $since = PHP_INT_MIN;
        }
        if (!is_numeric($limits)) {
            $limits = PHP_INT_MAX;
        }
        $ms = static::parse_timeframe($timeframe) * 1000;
        $ohlcvs = array();
        list(/* $timestamp */, /* $open */, $high, $low, $close, $volume) = array(0, 1, 2, 3, 4, 5);
        for ($i = 0; $i < min(count($trades), $limits); $i++) {
            $trade = $trades[$i];
            if ($trade['timestamp'] < $since) {
                continue;
            }
            $openingTime = floor($trade['timestamp'] / $ms) * $ms; // shift to the edge of m/h/d (but not M)
            $j = count($ohlcvs);

            if (($j == 0) || ($openingTime >= $ohlcvs[$j - 1][0] + $ms)) {
                // moved to a new timeframe -> create a new candle from opening trade
                $ohlcvs[] = array(
                    $openingTime,
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['amount'],
                );
            } else {
                // still processing the same timeframe -> update opening trade
                $ohlcvs[$j - 1][$high] = max($ohlcvs[$j - 1][$high], $trade['price']);
                $ohlcvs[$j - 1][$low] = min($ohlcvs[$j - 1][$low], $trade['price']);
                $ohlcvs[$j - 1][$close] = $trade['price'];
                $ohlcvs[$j - 1][$volume] += $trade['amount'];
            }
        }
        return $ohlcvs;
    }

    public static function capitalize($string) {
        return mb_strtoupper(mb_substr($string, 0, 1)) . mb_substr($string, 1);
    }

    public static function is_associative($array) {
        return is_array($array) && (count(array_filter(array_keys($array), 'is_string')) > 0);
    }

    public static function omit($array, $keys) {
        if (static::is_associative($array)) {
            $result = $array;
            if (is_array($keys)) {
                foreach ($keys as $key) {
                    unset($result[$key]);
                }
            } else {
                unset($result[$keys]);
            }
            return $result;
        }
        return $array;
    }

    public static function unique($array) {
        return array_unique($array);
    }

    public static function pluck($array, $key) {
        $result = array();
        foreach ($array as $element) {
            if (isset($key, $element)) {
                $result[] = $element[$key];
            }
        }
        return $result;
    }

    public function filter_by($array, $key, $value = null) {
        $grouped = static::group_by($array, $key);
        if (is_array($grouped) && array_key_exists($value, $grouped)) {
            return $grouped[$value];
        }
        return array();
    }

    public static function group_by($array, $key) {
        $result = array();
        foreach ($array as $element) {
            if (isset($element[$key]) && !is_null($element[$key])) {
                if (!isset($result[$element[$key]])) {
                    $result[$element[$key]] = array();
                }
                $result[$element[$key]][] = $element;
            }
        }
        return $result;
    }

    public static function index_by($array, $key) {
        $result = array();
        foreach ($array as $element) {
            if (isset($element[$key])) {
                $result[$element[$key]] = $element;
            }
        }
        return $result;
    }

    public static function sort_by($arrayOfArrays, $key, $descending = false) {
        $descending = $descending ? -1 : 1;
        usort($arrayOfArrays, function ($a, $b) use ($key, $descending) {
            if ($a[$key] == $b[$key]) {
                return 0;
            }
            return $a[$key] < $b[$key] ? -$descending : $descending;
        });
        return $arrayOfArrays;
    }

    public static function flatten($array) {
        return array_reduce($array, function ($acc, $item) {
            return array_merge($acc, is_array($item) ? static::flatten($item) : array($item));
        }, array());
    }

    public static function array_concat() {
        return call_user_func_array('array_merge', array_filter(func_get_args(), 'is_array'));
    }

    public static function in_array($needle, $haystack) {
        return in_array($needle, $haystack);
    }

    public static function to_array($object) {
        return array_values($object);
    }

    public static function is_empty($object) {
        return empty($object);
    }

    public static function keysort($array) {
        $result = $array;
        ksort($result);
        return $result;
    }

    public static function extract_params($string) {
        if (preg_match_all('/{([\w-]+)}/u', $string, $matches)) {
            return $matches[1];
        }
    }

    public static function implode_params($string, $params) {
        if (static::is_associative($params)) {
            foreach ($params as $key => $value) {
                if (gettype($value) !== 'array') {
                    $string = implode($value, mb_split('{' . preg_quote($key) . '}', $string));
                }
            }
        }
        return $string;
    }

    public function implode_hostname($url) {
        return static::implode_params($url, array('hostname' => $this->hostname));
    }

    public static function deep_extend() {
        //
        //     extend associative dictionaries only, replace everything else
        //
        $out = null;
        $args = func_get_args();
        foreach ($args as $arg) {
            if (static::is_associative($arg) || (is_array ($arg) && (count($arg) === 0))) {
                if (!static::is_associative($out)) {
                    $out = array();
                }
                foreach ($arg as $k => $v) {
                    $out[$k] = static::deep_extend(isset($out[$k]) ? $out[$k] : array(), $v);
                }
            } else {
                $out = $arg;
            }
        }
        return $out;
    }

    public static function sum() {
        return array_sum(array_filter(func_get_args(), function ($x) {
            return isset($x) ? $x : 0;
        }));
    }

    public static function ordered($array) { // for Python OrderedDicts, does nothing in PHP and JS
        return $array;
    }

    public function aggregate($bidasks) {
        $result = array();

        foreach ($bidasks as $bidask) {
            if ($bidask[1] > 0) {
                $price = (string) $bidask[0];
                $result[$price] = array_key_exists($price, $result) ? $result[$price] : 0;
                $result[$price] += $bidask[1];
            }
        }

        $output = array();

        foreach ($result as $key => $value) {
            $output[] = array(floatval($key), floatval($value));
        }

        return $output;
    }

    public static function urlencodeBase64($string) {
        return preg_replace(array('#[=]+$#u', '#\+#u', '#\\/#'), array('', '-', '_'), \base64_encode($string));
    }

    public function urlencode($array) {
        foreach ($array as $key => $value) {
            if (is_bool($value)) {
                $array[$key] = var_export($value, true);
            }
        }
        return http_build_query($array, '', $this->urlencode_glue);
    }

    public function urlencode_with_array_repeat($array) {
        return preg_replace('/%5B\d*%5D/', '', $this->urlencode($array));
    }

    public function rawencode($array) {
        return urldecode($this->urlencode($array));
    }

    public static function encode_uri_component($string) {
        return urlencode($string);
    }

    public static function url($path, $params = array()) {
        $result = static::implode_params($path, $params);
        $query = static::omit($params, static::extract_params($path));
        if ($query) {
            $result .= '?' . static::urlencode($query);
        }
        return $result;
    }

    public static function seconds() {
        return time();
    }

    public static function milliseconds() {
        if (PHP_INT_SIZE == 4) {
            return static::milliseconds32();
        } else {
            return static::milliseconds64();
        }
    }

    public static function milliseconds32() {
        list($msec, $sec) = explode(' ', microtime());
        // raspbian 32-bit integer workaround
        // https://github.com/ccxt/ccxt/issues/5978
        // return (int) ($sec . substr($msec, 2, 3));
        return $sec . substr($msec, 2, 3);
    }

    public static function milliseconds64() {
        list($msec, $sec) = explode(' ', microtime());
        // this method will not work on 32-bit raspbian
        return (int) ($sec . substr($msec, 2, 3));
    }

    public static function microseconds() {
        list($msec, $sec) = explode(' ', microtime());
        return $sec . str_pad(substr($msec, 2, 6), 6, '0');
    }

    public static function iso8601($timestamp = null) {
        if (!isset($timestamp)) {
            return null;
        }
        if (!is_numeric($timestamp) || intval($timestamp) != $timestamp) {
            return null;
        }
        $timestamp = (int) $timestamp;
        if ($timestamp < 0) {
            return null;
        }
        $result = gmdate('c', (int) floor($timestamp / 1000));
        $msec = (int) $timestamp % 1000;
        $result = str_replace('+00:00', sprintf('.%03dZ', $msec), $result);
        return $result;
    }

    public static function parse_date($timestamp) {
        return static::parse8601($timestamp);
    }

    public static function parse8601($timestamp = null) {
        if (!isset($timestamp)) {
            return null;
        }
        if (!$timestamp || !is_string($timestamp)) {
            return null;
        }
        $timedata = date_parse($timestamp);
        if (!$timedata || $timedata['error_count'] > 0 || $timedata['warning_count'] > 0 || (isset($timedata['relative']) && count($timedata['relative']) > 0)) {
            return null;
        }
        if (($timedata['hour'] === false) ||
            ($timedata['minute'] === false) ||
            ($timedata['second'] === false) ||
            ($timedata['year'] === false) ||
            ($timedata['month'] === false) ||
            ($timedata['day'] === false)) {
            return null;
        }
        $time = strtotime($timestamp);
        if ($time === false) {
            return null;
        }
        $time *= 1000;
        if (preg_match('/\.(?<milliseconds>[0-9]{1,3})/', $timestamp, $match)) {
            $time += (int) str_pad($match['milliseconds'], 3, '0', STR_PAD_RIGHT);
        }
        return $time;
    }

    public static function rfc2616($timestamp) {
        if (!$timestamp) {
            $timestamp = static::milliseconds();
        }
        return gmdate('D, d M Y H:i:s T', (int) round($timestamp / 1000));
    }

    public static function dmy($timestamp, $infix = '-') {
        return gmdate('m' . $infix . 'd' . $infix . 'Y', (int) round($timestamp / 1000));
    }

    public static function ymd($timestamp, $infix = '-') {
        return gmdate('Y' . $infix . 'm' . $infix . 'd', (int) round($timestamp / 1000));
    }

    public static function ymdhms($timestamp, $infix = ' ') {
        return gmdate('Y-m-d\\' . $infix . 'H:i:s', (int) round($timestamp / 1000));
    }

    public static function binary_concat() {
        return implode('', func_get_args());
    }

    public static function binary_concat_array($arr) {
        return implode('', $arr);
    }

    public static function binary_to_base64($binary) {
        return \base64_encode($binary);
    }

    public static function base16_to_binary($data) {
        return hex2bin($data);
    }

    public static function json($data, $params = array()) {
        $options = array(
            'convertArraysToObjects' => JSON_FORCE_OBJECT,
            // other flags if needed...
        );
        $flags = 0;
        foreach ($options as $key => $value) {
            if (array_key_exists($key, $params) && $params[$key]) {
                $flags |= $options[$key];
            }
        }
        return json_encode($data, $flags);
    }

    public static function is_json_encoded_object($input) {
        return ('string' === gettype($input)) &&
                (strlen($input) >= 2) &&
                (('{' === $input[0]) || ('[' === $input[0]));
    }

    public static function encode($input) {
        return $input;
    }

    public static function decode($input) {
        return $input;
    }

    public function nonce() {
        return $this->seconds();
    }

    public function check_required_credentials($error = true) {
        foreach ($this->requiredCredentials as $key => $value) {
            if ($value && (!$this->$key)) {
                if ($error) {
                    throw new AuthenticationError($this->id . ' requires `' . $key . '`');
                } else {
                    return $error;
                }
            }
        }
        return true;
    }

    public function check_address($address) {
        if (empty($address) || !is_string($address)) {
            throw new InvalidAddress($this->id . ' address is undefined');
        }

        if ((count(array_unique(str_split($address))) === 1) ||
            (strlen($address) < $this->minFundingAddressLength) ||
            (strpos($address, ' ') !== false)) {
            throw new InvalidAddress($this->id . ' address is invalid or has less than ' . strval($this->minFundingAddressLength) . ' characters: "' . strval($address) . '"');
        }

        return $address;
    }

    public function describe() {
        return array();
    }

    public function __construct($options = array()) {

        // todo auto-camelcasing for methods in PHP
        // $method_names = get_class_methods ($this);
        // foreach ($method_names as $method_name) {
        //     if ($method_name) {
        //         if (($method_name[0] != '_') && ($method_name[-1] != '_') && (mb_strpos ($method_name, '_') !== false)) {
        //             $parts = explode ('_', $method_name);
        //             $camelcase = $parts[0];
        //             for ($i = 1; $i < count ($parts); $i++) {
        //                 $camelcase .= static::capitalize ($parts[$i]);
        //             }
        //             // $this->$camelcase = $this->$method_name;
        //             // echo $method_name . " " . method_exists ($this, $method_name) . " " . $camelcase . " " . method_exists ($this, $camelcase) . "\n";
        //         }
        //     }
        // }

        $this->defined_rest_api = array();
        $this->curl = null;
        $this->curl_options = array(); // overrideable by user, empty by default
        $this->curl_reset = true;
        $this->curl_close = false;

        $this->id = null;

        $this->curlopt_interface = null;
        $this->timeout = 10000; // in milliseconds
        $this->proxy = '';
        $this->origin = '*'; // CORS origin
        $this->headers = array();
        $this->hostname = null; // in case of inaccessibility of the "main" domain

        $this->options = array(); // exchange-specific options if any

        $this->skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway
        $this->quoteJsonNumbers = true; // treat numbers in json as quoted precise strings

        $this->name = null;
        $this->countries = null;
        $this->version = null;
        $this->certified = false;
        $this->pro = false;
        $this->urls = array();
        $this->api = array();
        $this->comment = null;

        $this->markets = null;
        $this->symbols = null;
        $this->codes = null;
        $this->ids = null;
        $this->currencies = array();
        $this->base_currencies = null;
        $this->quote_currencies = null;
        $this->balance = array();
        $this->orderbooks = array();
        $this->tickers = array();
        $this->fees = array('trading' => array(), 'funding' => array());
        $this->precision = array();
        $this->orders = null;
        $this->myTrades = null;
        $this->trades = array();
        $this->transactions = array();
        $this->positions = array();
        $this->ohlcvs = array();
        $this->exceptions = array();
        $this->accounts = array();
        $this->status = array('status' => 'ok', 'updated' => null, 'eta' => null, 'url' => null);
        $this->limits = array(
            'cost' => array(
                'min' => null,
                'max' => null,
            ),
            'price' => array(
                'min' => null,
                'max' => null,
            ),
            'amount' => array(
                'min' => null,
                'max' => null,
            ),
        );
        $this->httpExceptions = array(
            '422' => 'ExchangeError',
            '418' => 'DDoSProtection',
            '429' => 'RateLimitExceeded',
            '404' => 'ExchangeNotAvailable',
            '409' => 'ExchangeNotAvailable',
            '410' => 'ExchangeNotAvailable',
            '500' => 'ExchangeNotAvailable',
            '501' => 'ExchangeNotAvailable',
            '502' => 'ExchangeNotAvailable',
            '520' => 'ExchangeNotAvailable',
            '521' => 'ExchangeNotAvailable',
            '522' => 'ExchangeNotAvailable',
            '525' => 'ExchangeNotAvailable',
            '526' => 'ExchangeNotAvailable',
            '400' => 'ExchangeNotAvailable',
            '403' => 'ExchangeNotAvailable',
            '405' => 'ExchangeNotAvailable',
            '503' => 'ExchangeNotAvailable',
            '530' => 'ExchangeNotAvailable',
            '408' => 'RequestTimeout',
            '504' => 'RequestTimeout',
            '401' => 'AuthenticationError',
            '511' => 'AuthenticationError',
        );
        $this->verbose = false;
        $this->apiKey = '';
        $this->secret = '';
        $this->password = '';
        $this->uid = '';
        $this->privateKey = '';
        $this->walletAddress = '';
        $this->token = ''; // reserved for HTTP auth in some cases

        $this->twofa = null;
        $this->markets_by_id = null;
        $this->currencies_by_id = null;
        $this->userAgent = null; // 'ccxt/' . $this::VERSION . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
        $this->userAgents = array(
            'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        );
        $this->minFundingAddressLength = 1; // used in check_address
        $this->substituteCommonCurrencyCodes = true;

        // whether fees should be summed by currency code
        $this->reduceFees = true;

        $this->timeframes = null;

        $this->requiredCredentials = array(
            'apiKey' => true,
            'secret' => true,
            'uid' => false,
            'login' => false,
            'password' => false,
            'twofa' => false, // 2-factor authentication (one-time password key)
            'privateKey' => false,
            'walletAddress' => false,
            'token' => false, // reserved for HTTP auth in some cases
        );

        // API methods metainfo
        $this->has = array(
            'loadMarkets' => true,
            'cancelAllOrders' => false,
            'cancelOrder' => true,
            'cancelOrders' => false,
            'CORS' => false,
            'createDepositAddress' => false,
            'createLimitOrder' => true,
            'createMarketOrder' => true,
            'createOrder' => true,
            'deposit' => false,
            'fetchBalance' => true,
            'fetchClosedOrders' => false,
            'fetchCurrencies' => false,
            'fetchDepositAddress' => false,
            'fetchDeposits' => false,
            'fetchFundingFees' => false,
            'fetchL2OrderBook' => true,
            'fetchLedger' => false,
            'fetchMarkets' => true,
            'fetchMyTrades' => false,
            'fetchOHLCV' => 'emulated',
            'fetchOpenOrders' => false,
            'fetchOrder' => false,
            'fetchOrderTrades' => false,
            'fetchOrderBook' => true,
            'fetchOrderBooks' => false,
            'fetchOrders' => false,
            'fetchStatus' => 'emulated',
            'fetchTicker' => true,
            'fetchTickers' => false,
            'fetchTime' => false,
            'fetchTrades' => true,
            'fetchTradingFee' => false,
            'fetchTradingFees' => false,
            'fetchTradingLimits' => false,
            'fetchTransactions' => false,
            'fetchWithdrawals' => false,
            'privateAPI' => true,
            'publicAPI' => true,
            'signIn' => false,
            'withdraw' => false,
        );

        $this->precisionMode = DECIMAL_PLACES;
        $this->paddingMode = NO_PADDING;
        $this->number = 'floatval';

        $this->lastRestRequestTimestamp = 0;
        $this->lastRestPollTimestamp = 0;
        $this->restRequestQueue = null;
        $this->restPollerLoopIsRunning = false;
        $this->enableRateLimit = true;
        $this->enableLastJsonResponse = true;
        $this->enableLastHttpResponse = true;
        $this->enableLastResponseHeaders = true;
        $this->last_http_response = null;
        $this->last_json_response = null;
        $this->last_response_headers = null;

        $this->requiresWeb3 = false;
        $this->requiresEddsa = false;
        $this->rateLimit = 2000;

        $this->commonCurrencies = array(
            'XBT' => 'BTC',
            'BCC' => 'BCH',
            'DRK' => 'DASH',
            'BCHABC' => 'BCH',
            'BCHSV' => 'BSV',
        );

        $this->urlencode_glue = ini_get('arg_separator.output'); // can be overrided by exchange constructor params
        $this->urlencode_glue_warning = true;

        $options = array_replace_recursive($this->describe(), $options);
        if ($options) {
            foreach ($options as $key => $value) {
                $this->{$key} =
                    (property_exists($this, $key) && is_array($this->{$key}) && is_array($value)) ?
                        array_replace_recursive($this->{$key}, $value) :
                        $value;
            }
        }

        $this->tokenBucket = array(
            'delay' => 0.001,
            'capacity' => 1.0,
            'cost' => 1.0,
            'maxCapacity' => 1000,
            'refillRate' => ($this->rateLimit > 0) ? 1.0 / $this->rateLimit : PHP_INT_MAX,
        );

        if ($this->urlencode_glue !== '&') {
            if ($this->urlencode_glue_warning) {
                throw new ExchangeError(this . id . ' warning! The glue symbol for HTTP queries ' .
                    ' is changed from its default value & to ' . $this->urlencode_glue . ' in php.ini' .
                    ' (arg_separator.output) or with a call to ini_set prior to this message. If that' .
                    ' was the intent, you can acknowledge this warning and silence it by setting' .
                    " 'urlencode_glue_warning' => false or 'urlencode_glue' => '&' with exchange constructor params");
            }
        }

        if ($this->api) {
            $this->define_rest_api($this->api, 'request');
        }

        if ($this->markets) {
            $this->set_markets($this->markets);
        }
    }

    public function set_sandbox_mode($enabled) {
        if ($enabled) {
            if (array_key_exists('test', $this->urls)) {
                $this->urls['apiBackup'] = $this->urls['api'];
                $this->urls['api'] = $this->urls['test'];
            } else {
                throw new NotSupported($this->id . ' does not have a sandbox URL');
            }
        } elseif (array_key_exists('apiBackup', $this->urls)) {
            $this->urls['api'] = $this->urls['apiBackup'];
            unset($this->urls['apiBackup']);
        }
    }

    public function define_rest_api_endpoint ($method_name, $uppercase_method, $lowercase_method, $camelcase_method, $path, $paths, $config = array()) {
        $split_path = mb_split('[^a-zA-Z0-9]', $path);
        $camelcase_suffix = implode(array_map(get_called_class() . '::capitalize', $split_path));
        $lowercase_path = array_map('trim', array_map('strtolower', $split_path));
        $underscore_suffix = implode('_', array_filter($lowercase_path));
        $camelcase_prefix = implode('', array_merge(
            array($paths[0]),
            array_map(get_called_class() . '::capitalize', array_slice($paths, 1))
        ));
        $underscore_prefix = implode('_', array_merge(
            array($paths[0]),
            array_filter(array_map('trim', array_slice($paths, 1)))
        ));
        $camelcase = $underscore_prefix . $camelcase_method . static::capitalize($camelcase_suffix);
        $underscore = $underscore_prefix . '_' . $lowercase_method . '_' . mb_strtolower($underscore_suffix);
        $api_argument = (count($paths) > 1) ? $paths : $paths[0];
        $this->defined_rest_api[$camelcase] = array($path, $api_argument, $uppercase_method, $method_name, $config);
        $this->defined_rest_api[$underscore] = array($path, $api_argument, $uppercase_method, $method_name, $config);
    }

    public function define_rest_api($api, $method_name, $paths = array()) {
        foreach ($api as $key => $value) {
            $uppercase_method = mb_strtoupper($key);
            $lowercase_method = mb_strtolower($key);
            $camelcase_method = static::capitalize($lowercase_method);
            if (static::is_associative($value)) {
                if (preg_match('/^(?:get|post|put|delete|options|head)$/i', $key)) {
                    foreach ($value as $endpoint => $config) {
                        $path = trim($endpoint);
                        if (static::is_associative($config)) {
                            $this->define_rest_api_endpoint($method_name, $uppercase_method, $lowercase_method, $camelcase_method, $path, $paths, $config);
                        } else if (is_numeric($config)) {
                            $this->define_rest_api_endpoint($method_name, $uppercase_method, $lowercase_method, $camelcase_method, $path, $paths, array('cost' => $config));
                        } else {
                            throw new NotSupported($this->id . ' define_rest_api() API format not supported, API leafs must strings, objects or numbers');
                        }
                    }
                } else {
                    $copy = $paths;
                    array_push ($copy, $key);
                    $this->define_rest_api($value, $method_name, $copy);
                }
            } else {
                foreach ($value as $path) {
                    $this->define_rest_api_endpoint($method_name, $uppercase_method, $lowercase_method, $camelcase_method, $path, $paths);
                }
            }
        }
    }

    public function underscore($camelcase) {
        // todo: write conversion fooBar10OHLCV2Candles → foo_bar10_ohlcv2_candles
        throw new NotSupported($this->id . ' underscore() not supported yet');
    }

    public function camelcase($underscore) {
        // todo: write conversion foo_bar10_ohlcv2_candles → fooBar10OHLCV2Candles
        throw new NotSupported($this->id . ' camelcase() not supported yet');
    }

    public static function hash($request, $type = 'md5', $digest = 'hex') {
        $base64 = ('base64' === $digest);
        $binary = ('binary' === $digest);
        $raw_output = ($binary || $base64) ? true : false;
        if ($type === 'keccak') {
            $hash = Keccak::hash($request, 256, $raw_output);
        } else {
            $hash = \hash($type, $request, $raw_output);
        }
        if ($base64) {
            $hash = \base64_encode($hash);
        }
        return $hash;
    }

    public static function hmac($request, $secret, $type = 'sha256', $digest = 'hex') {
        $base64 = ('base64' === $digest);
        $binary = ('binary' === $digest);
        $hmac = \hash_hmac($type, $request, $secret, ($binary || $base64) ? true : false);
        if ($base64) {
            $hmac = \base64_encode($hmac);
        }
        return $hmac;
    }

    public static function jwt($request, $secret, $alg = 'HS256') {
        $algorithms = array(
            'HS256' => 'sha256',
            'HS384' => 'sha384',
            'HS512' => 'sha512',
        );
        $encodedHeader = static::urlencodeBase64(json_encode(array('alg' => $alg, 'typ' => 'JWT')));
        $encodedData = static::urlencodeBase64(json_encode($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        $algoType = substr($alg, 0, 2);

        if ($algoType === 'HS') {
            $algName = $algorithms[$alg];
            if (!array_key_exists($alg, $algorithms)) {
                throw new ExchangeError($alg . ' is not a supported jwt algorithm.');
            }
            $signature =  static::hmac($token, $secret, $algName, 'binary');
        } elseif ($algoType === 'RS') {
            $signature = static::rsa($token, $secret, $alg);
        }
        return $token . '.' . static::urlencodeBase64($signature);
    }

    public static function rsa($request, $secret, $alg = 'RS256') {
        $algorithms = array(
            'RS256' => \OPENSSL_ALGO_SHA256,
            'RS384' => \OPENSSL_ALGO_SHA384,
            'RS512' => \OPENSSL_ALGO_SHA512,
        );
        if (!array_key_exists($alg, $algorithms)) {
            throw new ExchangeError($alg . ' is not a supported rsa signing algorithm.');
        }
        $algName = $algorithms[$alg];
        $signature = null;
        \openssl_sign($request, $signature, $secret, $algName);
        return $signature;
    }

    public static function ecdsa($request, $secret, $algorithm = 'p256', $hash = null, $fixedLength = false) {
        $digest = $request;
        if ($hash !== null) {
            $digest = static::hash($request, $hash, 'hex');
        }
        $ec = new EC(strtolower($algorithm));
        $key = $ec->keyFromPrivate(ltrim($secret, '0x'));
        $ellipticSignature = $key->sign($digest, 'hex', array('canonical' => true));
        $count = new BN ('0');
        $minimumSize = (new BN ('1'))->shln (8 * 31)->sub (new BN ('1'));
        while ($fixedLength && ($ellipticSignature->r->gt($ec->nh) || $ellipticSignature->r->lte($minimumSize) || $ellipticSignature->s->lte($minimumSize))) {
            $ellipticSignature = $key->sign($digest, 'hex', array('canonical' => true, 'extraEntropy' => $count->toArray('le', 32)));
            $count = $count->add(new BN('1'));
        }
        $signature = array(
            'r' =>  $ellipticSignature->r->bi->toHex(),
            's' => $ellipticSignature->s->bi->toHex(),
            'v' => $ellipticSignature->recoveryParam,
        );
        return $signature;
    }

    public static function eddsa($request, $secret, $algorithm = 'ed25519') {
        // this method is experimental ( ͡° ͜ʖ ͡°)
        $curve = new EdDSA ($algorithm);
        $signature = $curve->signModified ($request, $secret);
        return static::binary_to_base58(static::base16_to_binary($signature->toHex()));
    }

    public function throttle($cost = null) {
        // TODO: use a token bucket here
        $now = $this->milliseconds();
        $elapsed = $now - $this->lastRestRequestTimestamp;
        $cost = ($cost === null) ? 1 : $cost;
        $sleep_time = $this->rateLimit * $cost;
        if ($elapsed < $sleep_time) {
            $delay = $sleep_time - $elapsed;
            usleep((int) ($delay * 1000.0));
        }
    }

    public function sign($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) {
        throw new NotSupported($this->id . ' sign() not supported yet');
    }

    public function calculate_rate_limiter_cost($api, $method, $path, $params, $config = array(), $context = array()) {
        return 1;
    }

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null, $config = array(), $context = array()) {
        if ($this->enableRateLimit) {
            $cost = $this->calculate_rate_limiter_cost($api, $method, $path, $params, $config, $context);
            $this->throttle($cost);
        }
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        return $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function request($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null, $config = array(), $context = array ()) {
        return $this->fetch2($path, $api, $method, $params, $headers, $body, $config, $context);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
        if (isset($exact[$string])) {
            throw new $exact[$string]($message);
        }
    }

    public function throw_broadly_matched_exception($broad, $string, $message) {
        $broad_key = $this->find_broadly_matched_key($broad, $string);
        if ($broad_key !== null) {
            throw new $broad[$broad_key]($message);
        }
    }

    public function find_broadly_matched_key($broad, $string) {
        $keys = is_array($broad) ? array_keys($broad) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if (mb_strpos($string, $key) !== false) {
                return $key;
            }
        }
        return null;
    }

    public function parse_json($json_string, $as_associative_array = true) {
        return json_decode($this->on_json_response($json_string), $as_associative_array);
    }

    public function log() {
        $args = func_get_args();
        if (is_array($args)) {
            $array = array();
            foreach ($args as $arg) {
                $array[] = is_string($arg) ? $arg : json_encode($arg, JSON_PRETTY_PRINT);
            }
            echo implode(' ', $array), "\n";
        }
    }

    public function set_headers($headers) {
        return $headers;
    }

    public function handle_errors($code, $reason, $url, $method, $headers, $body, $response, $request_headers, $request_body) {
        // it's a stub function, does nothing in base code
    }

    public function on_rest_response($code, $reason, $url, $method, $response_headers, $response_body, $request_headers, $request_body) {
        return is_string($response_body) ? trim($response_body) : $response_body;
    }

    public function on_json_response($response_body) {
        return (is_string($response_body) && $this->quoteJsonNumbers) ? preg_replace('/":([+.0-9eE-]+)([,}])/', '":"$1"$2', $response_body) : $response_body;
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {

        $headers = array_merge($this->headers, $headers ? $headers : array());

        if (strlen($this->proxy)) {
            $headers['Origin'] = $this->origin;
        }

        $headers = $this->set_headers ($headers);

        $verbose_headers = $headers;

        if (!$headers) {
            $headers = array();
        } elseif (is_array($headers)) {
            $tmp = $headers;
            $headers = array();
            foreach ($tmp as $key => $value) {
                $headers[] = $key . ': ' . $value;
            }
        }

        // this name for the proxy string is deprecated
        // we should rename it to $this->cors everywhere
        $url = $this->proxy . $url;

        // https://github.com/ccxt/ccxt/issues/5914
        if ($this->curl) {
            if ($this->curl_close) {
                curl_close($this->curl); // we properly close the curl channel here to save cookies
                $this->curl = curl_init();
            } else if ($this->curl_reset) {
                curl_reset($this->curl); // this is the default
            }
        } else {
            $this->curl = curl_init();
        }

        curl_setopt($this->curl, CURLOPT_URL, $url);

        if ($this->timeout) {
            curl_setopt($this->curl, CURLOPT_CONNECTTIMEOUT_MS, (int) ($this->timeout));
            curl_setopt($this->curl, CURLOPT_TIMEOUT_MS, (int) ($this->timeout));
        }

        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);

        if ($this->userAgent) {
            if (gettype($this->userAgent) == 'string') {
                curl_setopt($this->curl, CURLOPT_USERAGENT, $this->userAgent);
                $verbose_headers = array_merge($verbose_headers, array('User-Agent' => $this->userAgent));
            } elseif ((gettype($this->userAgent) == 'array') && array_key_exists('User-Agent', $this->userAgent)) {
                curl_setopt($this->curl, CURLOPT_USERAGENT, $this->userAgent['User-Agent']);
                $verbose_headers = array_merge($verbose_headers, $this->userAgent);
            }
        }

        curl_setopt($this->curl, CURLOPT_ENCODING, '');

        if ($method == 'GET') {
            curl_setopt($this->curl, CURLOPT_HTTPGET, true);
        } elseif ($method == 'POST') {
            curl_setopt($this->curl, CURLOPT_POST, true);
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, $body);
        } elseif ($method == 'PUT') {
            curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, $body);
            $headers[] = 'X-HTTP-Method-Override: PUT';
        } elseif ($method == 'PATCH') {
            curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, 'PATCH');
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, $body);
        } elseif ($method === 'DELETE') {
            curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, $body);

            $headers[] = 'X-HTTP-Method-Override: DELETE';
        }

        if ($headers) {
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $headers);
        }

        if ($this->verbose) {
            print_r(array('Request:', $method, $url, $verbose_headers, $body));
        }

        // we probably only need to set it once on startup
        if ($this->curlopt_interface) {
            curl_setopt($this->curl, CURLOPT_INTERFACE, $this->curlopt_interface);
        }

        /*

        // this is currently not integrated, reserved for future
        if ($this->proxy) {
            curl_setopt ($this->curl, CURLOPT_PROXY, $this->proxy);
        }

        */

        curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($this->curl, CURLOPT_FAILONERROR, false);

        curl_setopt($this->curl, CURLOPT_HEADER, 1);
        // match the same http version as python and js
        curl_setopt($this->curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);

        // user-defined cURL options (if any)
        if (!empty($this->curl_options)) {
            curl_setopt_array($this->curl, $this->curl_options);
        }

        $response_headers = array();

        $response = curl_exec($this->curl);

        $headers_length = curl_getinfo($this->curl, CURLINFO_HEADER_SIZE);

        $raw_headers = mb_substr($response, 0, $headers_length);

        $raw_headers_array = explode("\r\n", trim($raw_headers));
        $status_line = $raw_headers_array[0];
        $parts = explode(' ', $status_line);
        $http_status_text = count($parts) === 3 ? $parts[2] : null;
        $raw_headers = array_slice($raw_headers_array, 1);
        foreach ($raw_headers as $raw_header) {
            if (strlen($raw_header)) {
                $exploded = explode(': ', $raw_header);
                if (count($exploded) > 1) {
                    list($key, $value) = $exploded;
                    // don't overwrite headers
                    // https://stackoverflow.com/a/4371395/4802441
                    if (array_key_exists($key, $response_headers)) {
                        $response_headers[$key] = $response_headers[$key] . ', ' . $value;
                    } else {
                        $response_headers[$key] = $value;
                    }
                }
            }
        }
        $result = mb_substr($response, $headers_length);

        $curl_errno = curl_errno($this->curl);
        $curl_error = curl_error($this->curl);
        $http_status_code = curl_getinfo($this->curl, CURLINFO_HTTP_CODE);

        $result = $this->on_rest_response($http_status_code, $http_status_text, $url, $method, $response_headers, $result, $headers, $body);

        $this->lastRestRequestTimestamp = $this->milliseconds();

        if ($this->enableLastHttpResponse) {
            $this->last_http_response = $result;
        }

        if ($this->enableLastResponseHeaders) {
            $this->last_response_headers = $response_headers;
        }

        $json_response = null;
        $is_json_encoded_response = $this->is_json_encoded_object($result);

        if ($is_json_encoded_response) {
            $json_response = $this->parse_json($result);
            if ($this->enableLastJsonResponse) {
                $this->last_json_response = $json_response;
            }
        }

        if ($this->verbose) {
            print_r(array('Response:', $method, $url, $http_status_code, $curl_error, $response_headers, $result));
        }

        if ($result === false) {
            if ($curl_errno == 28) { // CURLE_OPERATION_TIMEDOUT
                throw new RequestTimeout(implode(' ', array($url, $method, $curl_errno, $curl_error)));
            }

            // all sorts of SSL problems, accessibility
            throw new ExchangeNotAvailable(implode(' ', array($url, $method, $curl_errno, $curl_error)));
        }

        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $result ? $result : null, $json_response, $headers, $body);
        $this->handle_http_status_code($http_status_code, $http_status_text, $url, $method, $result);

        return isset($json_response) ? $json_response : $result;
    }

    public function handle_http_status_code($http_status_code, $status_text, $url, $method, $body) {
        $string_code = (string) $http_status_code;
        if (array_key_exists($string_code, $this->httpExceptions)) {
            $error_class = $this->httpExceptions[$string_code];
            if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                $error_class = '\\ccxt\\' . $error_class;
            }
            throw new $error_class(implode(' ', array($this->id, $url, $method, $http_status_code, $body)));
        }
    }

    public function set_markets($markets, $currencies = null) {
        $values = is_array($markets) ? array_values($markets) : array();
        for ($i = 0; $i < count($values); $i++) {
            $values[$i] = array_replace_recursive(
                $this->fees['trading'],
                array('precision' => $this->precision, 'limits' => $this->limits),
                $values[$i]
            );
        }
        $this->markets = static::index_by($values, 'symbol');
        $this->markets_by_id = static::index_by($values, 'id');
        $this->symbols = array_keys($this->markets);
        sort($this->symbols);
        $this->ids = array_keys($this->markets_by_id);
        sort($this->ids);
        if ($currencies) {
            $this->currencies = array_replace_recursive($currencies, $this->currencies);
        } else {
            $base_currencies = array_map(function ($market) {
                return array(
                    'id' => isset($market['baseId']) ? $market['baseId'] : $market['base'],
                    'numericId' => array_key_exists('baseNumericId', $market) ? $market['baseNumericId'] : null,
                    'code' => $market['base'],
                    'precision' => array_key_exists('precision', $market) ? (
                        array_key_exists('base', $market['precision']) ? $market['precision']['base'] : (
                            array_key_exists('amount', $market['precision']) ? $market['precision']['amount'] : null
                        )) : 8,
                );
            }, array_filter($values, function ($market) {
                return array_key_exists('base', $market);
            }));
            $quote_currencies = array_map(function ($market) {
                return array(
                    'id' => isset($market['quoteId']) ? $market['quoteId'] : $market['quote'],
                    'numericId' => array_key_exists('quoteNumericId', $market) ? $market['quoteNumericId'] : null,
                    'code' => $market['quote'],
                    'precision' => array_key_exists('precision', $market) ? (
                        array_key_exists('quote', $market['precision']) ? $market['precision']['quote'] : (
                            array_key_exists('price', $market['precision']) ? $market['precision']['price'] : null
                        )) : 8,
                );
            }, array_filter($values, function ($market) {
                return array_key_exists('quote', $market);
            }));
            $base_currencies = static::sort_by($base_currencies, 'code');
            $quote_currencies = static::sort_by($quote_currencies, 'code');
            $this->base_currencies = static::index_by($base_currencies, 'code');
            $this->quote_currencies = static::index_by($quote_currencies, 'code');
            $currencies = array_merge($this->base_currencies, $this->quote_currencies);
            $this->currencies = array_replace_recursive($currencies, $this->currencies);
        }
        $this->currencies_by_id = static::index_by(array_values($this->currencies), 'id');
        $this->codes = array_keys($this->currencies);
        sort($this->codes);
        return $this->markets;
    }

    public function load_markets($reload = false, $params = array()) {
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets($this->markets);
            }
            return $this->markets;
        }
        $currencies = null;
        if (array_key_exists('fetchCurrencies', $this->has) && $this->has['fetchCurrencies']) {
            $currencies = $this->fetch_currencies();
        }
        $markets = $this->fetch_markets($params);
        return $this->set_markets($markets, $currencies);
    }

    public function load_accounts($reload = false, $params = array()) {
        if ($reload) {
            $this->accounts = $this->fetch_accounts($params);
        } else {
            if ($this->accounts) {
                return $this->accounts;
            } else {
                $this->accounts = $this->fetch_accounts($params);
            }
        }
        $this->accountsById = static::index_by($this->accounts, 'id');
        return $this->accounts;
    }

    public function parse_ohlcv($ohlcv, $market = null) {
        return ('array' === gettype($ohlcv) && !static::is_associative($ohlcv)) ? array_slice($ohlcv, 0, 6) : $ohlcv;
    }

    public function parse_ohlcvs($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        $ohlcvs = is_array($ohlcvs) ? array_values($ohlcvs) : array();
        $parsed = array();
        foreach ($ohlcvs as $ohlcv) {
            $parsed[] = $this->parse_ohlcv($ohlcv, $market);
        }
        $sorted = $this->sort_by($parsed, 0);
        $tail = $since === null;
        return $this->filter_by_since_limit($sorted, $since, $limit, 0, $tail);
    }

    public function number($n) {
        return call_user_func($this->number, $n);
    }

    public function parse_bid_ask($bidask, $price_key = 0, $amount_key = 1) {
        $price = $this->safe_number($bidask, $price_key);
        $amount = $this->safe_number($bidask, $amount_key);
        return array($price, $amount);
    }

    public function parse_bids_asks($bidasks, $price_key = 0, $amount_key = 1) {
        $result = array();
        $array = is_array($bidasks) ? array_values($bidasks) : array();
        foreach ($array as $bidask) {
            $result[] = $this->parse_bid_ask($bidask, $price_key, $amount_key);
        }
        return $result;
    }

    public function fetch_l2_order_book($symbol, $limit = null, $params = array()) {
        $orderbook = $this->fetch_order_book($symbol, $limit, $params);
        return array_merge($orderbook, array(
            'bids' => $this->sort_by($this->aggregate($orderbook['bids']), 0, true),
            'asks' => $this->sort_by($this->aggregate($orderbook['asks']), 0),
        ));
    }

    public function parse_order_book($orderbook, $symbol, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        return array(
            'symbol' => $symbol,
            'bids' => $this->sort_by(
                is_array($orderbook) && array_key_exists($bids_key, $orderbook) ?
                    $this->parse_bids_asks($orderbook[$bids_key], $price_key, $amount_key) : array(),
                0, true),
            'asks' => $this->sort_by(
                is_array($orderbook) && array_key_exists($asks_key, $orderbook) ?
                    $this->parse_bids_asks($orderbook[$asks_key], $price_key, $amount_key) : array(),
                0),
            'timestamp' => $timestamp,
            'datetime' => isset($timestamp) ? $this->iso8601($timestamp) : null,
            'nonce' => null,
        );
    }

    public function parse_balance($balance, $legacy = false) {
        $currencies = $this->omit($balance, array('info', 'timestamp', 'datetime', 'free', 'used', 'total'));

        $balance['free'] = array();
        $balance['used'] = array();
        $balance['total'] = array();

        foreach ($currencies as $code => $value) {
            if (!isset($value['total'])) {
                if (isset($value['free']) && isset($value['used'])) {
                    if ($legacy) {
                        $balance[$code]['total'] = static::sum($value['free'], $value['used']);
                    } else {
                        $balance[$code]['total'] = Precise::string_add($value['free'], $value['used']);
                    }
                }
            }
            if (!isset($value['used'])) {
                if (isset($value['total']) && isset($value['free'])) {
                    if ($legacy) {
                        $balance[$code]['used'] = static::sum($value['total'], -$value['free']);
                    } else {
                        $balance[$code]['used'] = Precise::string_sub($value['total'], $value['free']);
                    }
                }
            }
            if (!isset($value['free'])) {
                if (isset($value['total']) && isset($value['used'])) {
                    if ($legacy) {
                        $balance[$code]['free'] = static::sum($value['total'], -$value['used']);
                    } else {
                        $balance[$code]['free'] = Precise::string_sub($value['total'], $value['used']);
                    }
                }
            }
            $balance[$code]['free'] = $this->parse_number($balance[$code]['free']);
            $balance[$code]['used'] = $this->parse_number($balance[$code]['used']);
            $balance[$code]['total'] = $this->parse_number($balance[$code]['total']);
            $balance['free'][$code] = $balance[$code]['free'];
            $balance['used'][$code] = $balance[$code]['used'];
            $balance['total'][$code] = $balance[$code]['total'];
        }
        return $balance;
    }

    public function fetch_partial_balance($part, $params = array()) {
        $balance = $this->fetch_balance($params);
        return $balance[$part];
    }

    public function fetch_free_balance($params = array()) {
        return $this->fetch_partial_balance('free', $params);
    }

    public function fetch_used_balance($params = array()) {
        return $this->fetch_partial_balance('used', $params);
    }

    public function fetch_total_balance($params = array()) {
        return $this->fetch_partial_balance('total', $params);
    }

    public function fetch_trading_fees($params = array()) {
        throw new NotSupported($this->id . ' fetch_trading_fees not supported yet');
    }

    public function fetch_trading_fee($symbol, $params = array()) {
        if (!$this->has['fetchTradingFees']) {
            throw new NotSupported($this->id . ' fetch_trading_fee not supported yet');
        }
        return $this->fetch_trading_fees($params);
    }

    public function load_trading_limits($symbols = null, $reload = false, $params = array()) {
        if ($this->has['fetchTradingLimits']) {
            if ($reload || !(is_array($this->options) && array_key_exists('limitsLoaded', $this->options))) {
                $response = $this->fetch_trading_limits($symbols);
                // $limits = $response['limits'];
                // $keys = is_array ($limits) ? array_keys ($limits) : array ();
                for ($i = 0; $i < count($symbols); $i++) {
                    $symbol = $symbols[$i];
                    $this->markets[$symbol] = array_replace_recursive($this->markets[$symbol], $response[$symbol]);
                }
                $this->options['limitsLoaded'] = $this->milliseconds();
            }
        }
        return $this->markets;
    }

    public function filter_by_since_limit($array, $since = null, $limit = null, $key = 'timestamp', $tail = false) {
        $result = array();
        $since_is_set = isset($since);
        if ($since_is_set) {
            foreach ($array as $entry) {
                if ($entry[$key] > $since) {
                    $result[] = $entry;
                }
            }
        } else {
            $result = $array;
        }
        if (isset($limit)) {
            if (is_array($result)) {
                $result = $tail ? array_slice($result, -$limit) : array_slice($result, 0, $limit);
            } else {
                $length = count($result);
                if ($tail) {
                    $start = max($length - $limit, 0);
                } else {
                    $start = 0;
                }
                $end = min($start + $limit, $length);
                $result_copy = array();
                for ($i = $start; $i < $end; $i++) {
                    $result_copy[] = $result[$i];
                }
                $result = $result_copy;
            }
        }
        return $result;
    }

    public function safe_ticker($ticker, $market = null) {
        $symbol = $this->safe_value($ticker, 'symbol');
        if ($symbol === null) {
            $ticker['symbol'] = $this->safe_symbol(null, $market);
        }
        $timestamp = $this->safe_integer($ticker, 'timestamp');
        if ($timestamp !== null) {
            $ticker['timestamp'] = $timestamp;
            $ticker['datetime'] = $this->iso8601($timestamp);
        }
        $baseVolume = $this->safe_value($ticker, 'baseVolume');
        $quoteVolume = $this->safe_value($ticker, 'quoteVolume');
        $vwap = $this->safe_value($ticker, 'vwap');
        if ($vwap === null) {
            $ticker['vwap'] = $this->vwap($baseVolume, $quoteVolume);
        }
        $close = $this->safe_value($ticker, 'close');
        $last = $this->safe_value($ticker, 'last');
        if (($close === null) && ($last !== null)) {
            $ticker['close'] = $last;
        } else if (($last === null) && ($close !== null)) {
            $ticker['last'] = $close;
        }
        return $ticker;
    }

    public function parse_tickers($tickers, $symbols = null, $params = array()) {
        $result = array();
        $values = is_array($tickers) ? array_values($tickers) : array();
        for ($i = 0; $i < count($values); $i++) {
            $result[] = array_merge($this->parse_ticker($values[$i]), $params);
        }
        return $this->filter_by_array($result, 'symbol', $symbols);
    }

    public function parse_deposit_addresses($addresses, $codes = null) {
        $result = array();
        for ($i = 0; $i < count($addresses); $i++) {
            $address = $this->parse_deposit_address($addresses[$i]);
            $result[] = $address;
        }
        if ($codes) {
            $result = $this->filter_by_array($result, 'currency', $codes);
        }
        return $this->index_by($result, 'currency');
    }

    public function parse_trades($trades, $market = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($trades) ? array_values($trades) : array();
        $result = array();
        foreach ($array as $trade) {
            $result[] = array_merge($this->parse_trade($trade, $market), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $symbol = isset($market) ? $market['symbol'] : null;
        $tail = $since === null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit, $tail);
    }

    public function parse_transactions($transactions, $currency = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($transactions) ? array_values($transactions) : array();
        $result = array();
        foreach ($array as $transaction) {
            $result[] = array_replace_recursive($this->parse_transaction($transaction, $currency), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = isset($currency) ? $currency['code'] : null;
        $tail = $since === null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function parse_transfers($transfers, $currency = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($transfers) ? array_values($transfers) : array();
        $result = array();
        foreach ($array as $transfer) {
            $result[] = array_replace_recursive($this->parse_transfer($transfer, $currency), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = isset($currency) ? $currency['code'] : null;
        $tail = $since === null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function parse_ledger($items, $currency = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($items) ? array_values($items) : array();
        $result = array();
        foreach ($array as $item) {
            $entry = $this->parse_ledger_entry($item, $currency);
            if (gettype ($entry) === 'array' && count (array_filter (array_keys ($entry), 'is_string')) == 0) {
                foreach ($entry as $i) {
                    $result[] = array_replace_recursive($i, $params);
                }
            } else {
                $result[] = array_replace_recursive($entry, $params);
            }
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = isset($currency) ? $currency['code'] : null;
        $tail = $since === null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function parse_orders($orders, $market = null, $since = null, $limit = null, $params = array()) {
        $result = array();
        if (count(array_filter(array_keys($orders), 'is_string')) == 0) {
            foreach ($orders as $order) {
                $result[] = array_replace_recursive($this->parse_order($order, $market), $params);
            }
        } else {
            foreach ($orders as $id => $order) {
                $result[] = array_replace_recursive($this->parse_order(array_replace_recursive(array('id' => $id), $order), $market), $params);
            }
        }
        $result = $this->sort_by($result, 'timestamp');
        $symbol = isset($market) ? $market['symbol'] : null;
        $tail = $since === null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit, $tail);
    }

    public function safe_market($marketId, $market = null, $delimiter = null) {
        if ($marketId !== null) {
            if (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id)) {
                $market = $this->markets_by_id[$marketId];
            } else if ($delimiter !== null) {
                list($baseId, $quoteId) = explode($delimiter, $marketId);
                $base = $this->safe_currency_code($baseId);
                $quote = $this->safe_currency_code($quoteId);
                $symbol = $base . '/' . $quote;
                return array(
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                );
            }
        }
        if ($market !== null) {
            return $market;
        }
        return array(
            'symbol' => $marketId,
            'base' => null,
            'quote' => null,
            'baseId' => null,
            'quoteId' => null,
        );
    }

    public function safe_symbol($marketId, $market = null, $delimiter = null) {
        $market = $this->safe_market($marketId, $market, $delimiter);
        return $market['symbol'];
    }

    public function safe_currency($currency_id, $currency = null) {
        if (($currency_id === null) && ($currency !== null)) {
            return $currency;
        }
        if (($this->currencies_by_id !== null) && array_key_exists($currency_id, $this->currencies_by_id)) {
            return $this->currencies_by_id[$currency_id];
        }
        return array(
            'id' => $currency_id,
            'code' => ($currency_id === null) ? $currency_id : $this->common_currency_code(mb_strtoupper($currency_id)),
        );
    }

    public function safe_currency_code($currency_id, $currency = null) {
        $currency = $this->safe_currency($currency_id, $currency);
        return $currency['code'];
    }

    public function filter_by_symbol($array, $symbol = null) {
        if ($symbol) {
            $grouped = $this->group_by($array, 'symbol');
            if (is_array($grouped) && array_key_exists($symbol, $grouped)) {
                return $grouped[$symbol];
            }
            return array();
        }
        return $array;
    }

    public function filter_by_value_since_limit($array, $field, $value = null, $since = null, $limit = null, $key = 'timestamp', $tail = false) {
        $valueIsSet = isset($value);
        $sinceIsSet = isset($since);
        $result = array();
        foreach ($array as $k => $v) {
            if (($valueIsSet ? ($v[$field] === $value) : true) && ($sinceIsSet ? ($v[$key] >= $since) : true)) {
                $result[] = $v;
            }
        }
        if (isset($limit)) {
            return $tail ? array_slice($result, -$limit) : array_slice($result, 0, $limit);
        }
        return $result;
    }

    public function filter_by_symbol_since_limit($array, $symbol = null, $since = null, $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_currency_since_limit($array, $code = null, $since = null, $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_array($objects, $key, $values = null, $indexed = true) {
        $objects = array_values($objects);

        // return all of them if no $symbols were passed in the first argument
        if ($values === null) {
            return $indexed ? static::index_by($objects, $key) : $objects;
        }

        $result = array();
        for ($i = 0; $i < count($objects); $i++) {
            $value = isset($objects[$i][$key]) ? $objects[$i][$key] : null;
            if (in_array($value, $values)) {
                $result[] = $objects[$i];
            }
        }

        return $indexed ? static::index_by($result, $key) : $result;
    }

    public function fetch_bids_asks($symbols, $params = array()) { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all prices at once with a single call to fetch_bids_asks () for now');
    }

    public function fetch_ticker($symbol, $params = array ()) {
        if ($this->has['fetchTickers']) {
            $tickers = $this->fetch_tickers(array( $symbol ), $params);
            $ticker = $this->safe_value($tickers, $symbol);
            if ($ticker === null) {
                throw new BadSymbol($this->id . ' fetchTickers could not find a $ticker for ' . $symbol);
            } else {
                return $ticker;
            }
        } else {
            throw new NotSupported($this->id . ' fetchTicker not supported yet');
        }
    }

    public function fetch_tickers($symbols, $params = array()) { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now');
    }

    public function fetch_order_status($id, $symbol = null, $params = array()) {
        $order = $this->fetch_order($id, $symbol, $params);
        return $order['status'];
    }

    public function fetch_order($id, $symbol = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_order() not supported yet');
    }

    public function fetch_unified_order($order, $params = array ()) {
        return $this->fetch_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function fetch_order_trades($id, $symbol = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_order_trades() not supported yet');
    }

    public function fetch_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_orders() not supported yet');
    }

    public function fetch_open_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_open_orders() not supported yet');
    }

    public function fetch_closed_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_closed_orders() not supported yet');
    }

    public function fetch_my_trades($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_my_trades() not supported yet');
    }

    public function fetch_transactions($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_transactions() not supported yet');
    }

    public function fetch_deposits($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_deposits() not supported yet');
    }

    public function fetch_withdrawals($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_withdrawals() not supported yet');
    }

    // public function fetch_deposit_address($code, $params = array()) {
    //     throw new NotSupported($this->id . ' fetch_deposit_address() not supported yet');
    // }

    public function fetch_deposit_address($code, $params = array()) {
        if ($this->has['fetchDepositAddresses']) {
            $deposit_addresses = $this->fetch_deposit_addresses(array($code), $params);
            $deposit_address = $this->safe_value($deposit_addresses, $code);
            if ($deposit_address === null) {
                throw new InvalidAddress($this->id . ' fetchDepositAddress could not find a deposit address for ' . $code . ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
            } else {
                return $deposit_address;
            }
        } else {
            throw new NotSupported ($this->id + ' fetchDepositAddress not supported yet');
        }
    }

    public function fetch_markets($params = array()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->markets ? array_values($this->markets) : array();
    }

    public function fetch_currencies($params = array()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->currencies ? $this->currencies : array();
    }

    public function fetch_balance($params = array()) {
        throw new NotSupported($this->id . ' fetch_balance() not supported yet');
    }


    public function fetch_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array()) {
        if (!$this->has['fetchTrades']) {
            throw new NotSupported($this->$id . ' fetch_ohlcv() not supported yet');
        }
        $this->load_markets();
        $trades = $this->fetch_trades($symbol, $since, $limit, $params);
        return $this->build_ohlcv($trades, $timeframe, $since, $limit);
    }

    public function fetchStatus($params = array()) {
        return $this->fetch_status($params);
    }

    public function fetch_status($params = array()) {
        if ($this->has['fetchTime']) {
            $time = $this->fetch_time($params);
            $this->status = array_merge($this->status, array(
                'updated' => $time,
            ));
        }
        return $this->status;
    }

    public function parse_trading_view_ohlcv($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function convert_trading_view_to_ohlcv($ohlcvs, $t = 't', $o = 'o', $h = 'h', $l = 'l', $c = 'c', $v = 'v', $ms = false) {
        $result = array();
        for ($i = 0; $i < count($ohlcvs[$t]); $i++) {
            $result[] = array(
                $ms ? $ohlcvs[$t][$i] : ($ohlcvs[$t][$i] * 1000),
                $ohlcvs[$o][$i],
                $ohlcvs[$h][$i],
                $ohlcvs[$l][$i],
                $ohlcvs[$c][$i],
                $ohlcvs[$v][$i],
            );
        }
        return $result;
    }

    public function convert_ohlcv_to_trading_view($ohlcvs, $t = 't', $o = 'o', $h = 'h', $l = 'l', $c = 'c', $v = 'v', $ms = false) {
        $result = array();
        $result[$t] = array();
        $result[$o] = array();
        $result[$h] = array();
        $result[$l] = array();
        $result[$c] = array();
        $result[$v] = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $result[$t][] = $ms ? $ohlcvs[$i][0] : intval($ohlcvs[$i][0] / 1000);
            $result[$o][] = $ohlcvs[$i][1];
            $result[$h][] = $ohlcvs[$i][2];
            $result[$l][] = $ohlcvs[$i][3];
            $result[$c][] = $ohlcvs[$i][4];
            $result[$v][] = $ohlcvs[$i][5];
        }
        return $result;
    }

    public function edit_limit_buy_order($id, $symbol, $amount, $price, $params = array()) {
        return $this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order($id, $symbol, $amount, $price, $params = array()) {
        return $this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order($id, $symbol, $side, $amount, $price, $params = array()) {
        return $this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function cancel_order($id, $symbol = null, $params = array()) {
        throw new NotSupported($this->id . ' cancel_order() not supported or not supported yet');
    }

    public function edit_order($id, $symbol, $type, $side, $amount, $price = null, $params = array()) {
        if (!$this->enableRateLimit) {
            throw new ExchangeError($this->id . ' edit_order() requires enableRateLimit = true');
        }
        $this->cancel_order($id, $symbol, $params);
        return $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function cancel_unified_order($order, $params = array ()) {
        return $this->cancel_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function create_order($symbol, $type, $side, $amount, $price = null, $params = array()) {
        throw new NotSupported($this->id . ' create_order() not supported yet');
    }

    public function create_limit_order($symbol, $side, $amount, $price, $params = array()) {
        return $this->create_order($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order($symbol, $side, $amount, $price = null, $params = array()) {
        return $this->create_order($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_limit_buy_order($symbol, $amount, $price, $params = array()) {
        return $this->create_order($symbol, 'limit', 'buy', $amount, $price, $params);
    }

    public function create_limit_sell_order($symbol, $amount, $price, $params = array()) {
        return $this->create_order($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order($symbol, $amount, $params = array()) {
        return $this->create_order($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order($symbol, $amount, $params = array()) {
        return $this->create_order($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function calculate_fee($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $feeSide = $this->safe_string($market, 'feeSide', 'quote');
        $key = 'quote';
        $cost = null;
        if ($feeSide === 'quote') {
            // the fee is always in quote currency
            $cost = $amount * $price;
        } else if ($feeSide === 'base') {
            // the fee is always in base currency
            $cost = $amount;
        } else if ($feeSide === 'get') {
            // the fee is always in the currency you get
            $cost = $amount;
            if ($side === 'sell') {
                $cost *= $price;
            } else {
                $key = 'base';
            }
        } else if ($feeSide === 'give') {
            // the fee is always in the currency you give
            $cost = $amount;
            if ($side === 'buy') {
                $cost *= $price;
            } else {
                $key = 'base';
            }
        }
        $rate = $market[$takerOrMaker];
        if ($cost !== null) {
            $cost *= $rate;
        }
        return array(
            'type' => $takerOrMaker,
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => $cost,
        );
    }

    public static function account() {
        return array(
            'free' => null,
            'used' => null,
            'total' => null,
        );
    }

    public function common_currency_code($currency) {
        if (!$this->substituteCommonCurrencyCodes) {
            return $currency;
        }
        return $this->safe_string($this->commonCurrencies, $currency, $currency);
    }

    public function precision_from_string($string) {
        $parts = explode('.', preg_replace('/0+$/', '', $string));
        return (count($parts) > 1) ? strlen($parts[1]) : 0;
    }

    public function cost_to_precision($symbol, $cost) {
        return self::decimal_to_precision($cost, TRUNCATE, $this->markets[$symbol]['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function price_to_precision($symbol, $price) {
        return self::decimal_to_precision($price, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function amount_to_precision($symbol, $amount) {
        return self::decimal_to_precision($amount, TRUNCATE, $this->markets[$symbol]['precision']['amount'], $this->precisionMode, $this->paddingMode);
    }

    public function fee_to_precision($symbol, $fee) {
        return self::decimalToPrecision($fee, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function currency_to_precision($currency, $fee) {
        return self::decimal_to_precision($fee, ROUND, $this->currencies[$currency]['precision'], $this->precisionMode, $this->paddingMode);
    }

    public function currency($code) {
        return (('string' === gettype($code)) &&
                   isset($this->currencies) &&
                   isset($this->currencies[$code])) ?
                        $this->currencies[$code] : $code;
    }

    public function market($symbol) {
        if (!isset($this->markets)) {
            throw new ExchangeError($this->id . ' markets not loaded');
        }
        if (gettype($symbol) === 'string') {
            if (isset($this->markets[$symbol])) {
                return $this->markets[$symbol];
            } elseif (isset($this->markets_by_id)) {
                return $this->markets_by_id[$symbol];
            }
        }

        throw new BadSymbol($this->id . ' does not have market symbol ' . $symbol);
    }

    public function market_ids($symbols) {
        return array_map(array($this, 'market_id'), $symbols);
    }

    public function market_id($symbol) {
        return (is_array($market = $this->market($symbol))) ? $market['id'] : $symbol;
    }

    public function __call($function, $params) {
        if (array_key_exists($function, $this->defined_rest_api)) {
            $partial = $this->defined_rest_api[$function];
            $entry = $partial[3];
            $config = $partial[4];
            $partial[3] = $params ? $params[0] : $params;
            $partial[4] = null;
            $partial[5] = null;
            $partial[6] = $config;
            $partial[7] = ($params && (count($params) > 1)) ? $params[1] : array();
            return call_user_func_array(array($this, $entry), $partial);
        } else if (array_key_exists($function, static::$camelcase_methods)) {
            $underscore = static::$camelcase_methods[$function];
            return call_user_func_array(array($this, $underscore), $params);
        } else {
            /* handle errors */
            throw new ExchangeError($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
        }
    }

    public function __sleep() {
        $return = array_keys(array_filter(get_object_vars($this), function ($var) {
            return !(is_object($var) || is_resource($var) || is_callable($var));
        }));
        return $return;
    }

    public function __wakeup() {
        $this->curl = curl_init();
        if ($this->api) {
            $this->define_rest_api($this->api, 'request');
        }
    }

    public function __destruct() {
        if ($this->curl !== null) {
            curl_close($this->curl);
        }
    }

    public function has($feature = null) {
        if (!$feature) {
            return $this->has;
        }
        $feature = strtolower($feature);
        $new_feature_map = array_change_key_case($this->has, CASE_LOWER);
        if (array_key_exists($feature, $new_feature_map)) {
            return $new_feature_map[$feature];
        }

        // PHP 5.6+ only:
        // $old_feature_map = array_change_key_case (array_filter (get_object_vars ($this), function ($key) {
        //     return strpos($key, 'has') !== false && $key !== 'has';
        // }, ARRAY_FILTER_USE_KEY), CASE_LOWER);

        // the above rewritten for PHP 5.4+
        $nonfiltered = get_object_vars($this);
        $filtered = array();
        foreach ($nonfiltered as $key => $value) {
            if ((strpos($key, 'has') !== false) && ($key !== 'has')) {
                $filtered[$key] = $value;
            }
        }
        $old_feature_map = array_change_key_case($filtered, CASE_LOWER);

        $old_feature = "has{$feature}";
        return array_key_exists($old_feature, $old_feature_map) ? $old_feature_map[$old_feature] : false;
    }

    public static function precisionFromString($x) {
        $parts = explode ('.', preg_replace ('/0+$/', '', $x));
        if (count ($parts) > 1) {
            return strlen ($parts[1]);
        } else {
            return 0;
        }
    }

    public static function decimal_to_precision($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        if ($countingMode === TICK_SIZE) {
            if (!(is_float ($numPrecisionDigits) || is_int($numPrecisionDigits)))
                throw new BaseError('Precision must be an integer or float for TICK_SIZE');
        } else {
            if (!is_int($numPrecisionDigits)) {
                throw new BaseError('Precision must be an integer');
            }
        }

        if (!is_numeric($x)) {
            throw new BaseError('Invalid number');
        }

        assert(($roundingMode === ROUND) || ($roundingMode === TRUNCATE));

        $result = '';

        // Special handling for negative precision
        if ($numPrecisionDigits < 0) {
            if ($countingMode === TICK_SIZE) {
                throw new BaseError ('TICK_SIZE cant be used with negative numPrecisionDigits');
            }
            $toNearest = pow(10, abs($numPrecisionDigits));
            if ($roundingMode === ROUND) {
                $result = (string) ($toNearest * static::decimal_to_precision($x / $toNearest, $roundingMode, 0, DECIMAL_PLACES, $paddingMode));
            }
            if ($roundingMode === TRUNCATE) {
                $result = static::decimal_to_precision($x - $x % $toNearest, $roundingMode, 0, DECIMAL_PLACES, $paddingMode);
            }
            return $result;
        }

        if ($countingMode === TICK_SIZE) {
            $precisionDigitsString = static::decimal_to_precision ($numPrecisionDigits, ROUND, 100, DECIMAL_PLACES, NO_PADDING);
            $newNumPrecisionDigits = static::precisionFromString ($precisionDigitsString);
            $missing = fmod($x, $numPrecisionDigits);
            $missing = floatval(static::decimal_to_precision ($missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING));
            // See: https://github.com/ccxt/ccxt/pull/6486
            $fpError = static::decimal_to_precision ($missing / $numPrecisionDigits, ROUND, max($newNumPrecisionDigits, 8), DECIMAL_PLACES, NO_PADDING);
            if (static::precisionFromString ($fpError) !== 0) {
                if ($roundingMode === ROUND) {
                    if ($x > 0) {
                        if ($missing >= $numPrecisionDigits / 2) {
                            $x = $x - $missing + $numPrecisionDigits;
                        } else {
                            $x = $x - $missing;
                        }
                    } else {
                        if ($missing >= $numPrecisionDigits / 2) {
                            $x = $x - $missing;
                        } else {
                            $x = $x - $missing - $numPrecisionDigits;
                        }
                    }
                } else if (TRUNCATE === $roundingMode) {
                    $x = $x - $missing;
                }
            }
            return static::decimal_to_precision ($x, ROUND, $newNumPrecisionDigits, DECIMAL_PLACES, $paddingMode);
        }


        if ($roundingMode === ROUND) {
            if ($countingMode === DECIMAL_PLACES) {
                // Requested precision of 100 digits was truncated to PHP maximum of 53 digits
                $numPrecisionDigits = min(14, $numPrecisionDigits);
                $result = number_format(round($x, $numPrecisionDigits, PHP_ROUND_HALF_UP), $numPrecisionDigits, '.', '');
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                $significantPosition = log(abs($x), 10) % 10;
                if ($significantPosition > 0) {
                    ++$significantPosition;
                }
                $result = static::number_to_string(round($x, $numPrecisionDigits - $significantPosition, PHP_ROUND_HALF_UP));
            }
        } elseif ($roundingMode === TRUNCATE) {
            $dotIndex = strpos($x, '.');
            $dotPosition = $dotIndex ?: strlen($x);
            if ($countingMode === DECIMAL_PLACES) {
                if ($dotIndex) {
                    list($before, $after) = explode('.', static::number_to_string($x));
                    $result = $before . '.' . substr($after, 0, $numPrecisionDigits);
                } else {
                    $result = $x;
                }
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                if ($numPrecisionDigits === 0) {
                    return '0';
                }
                $significantPosition = (int) log(abs($x), 10);
                $start = $dotPosition - $significantPosition;
                $end = $start + $numPrecisionDigits;
                if ($dotPosition >= $end) {
                    --$end;
                }
                if ($numPrecisionDigits >= (strlen($x) - ($dotPosition ? 1 : 0))) {
                    $result = (string) $x;
                } else {
                    if ($significantPosition < 0) {
                        ++$end;
                    }
                    $result = str_pad(substr($x, 0, $end), $dotPosition, '0');
                }
            }
            $result = rtrim($result, '.');
        }

        $hasDot = (false !== strpos($result, '.'));
        if ($paddingMode === NO_PADDING) {
            if (($result === '')  && ($numPrecisionDigits === 0)) {
                return '0';
            }
            if ($hasDot) {
                $result = rtrim($result, '0');
                $result = rtrim($result, '.');
            }
        } elseif ($paddingMode === PAD_WITH_ZERO) {
            if ($hasDot) {
                if ($countingMode === DECIMAL_PLACES) {
                    list($before, $after) = explode('.', $result, 2);
                    $result = $before . '.' . str_pad($after, $numPrecisionDigits, '0');
                } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                    if ($result < 1) {
                        $result = str_pad($result, strcspn($result, '123456789') + $numPrecisionDigits, '0');
                    }
                }
            } else {
                if ($countingMode === DECIMAL_PLACES) {
                    if ($numPrecisionDigits > 0) {
                        $result = $result . '.' . str_repeat('0', $numPrecisionDigits);
                    }
                } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                    if ($numPrecisionDigits > strlen($result)) {
                        $result = $result . '.' . str_repeat('0', ($numPrecisionDigits - strlen($result)));
                    }
                }
            }
        }
        if (($result === '-0') || ($result === '-0.' . str_repeat('0', max(strlen($result) - 3, 0)))) {
            $result = substr($result, 1);
        }
        return $result;
    }

    public static function number_to_string($x) {
        // avoids scientific notation for too large and too small numbers
        $s = (string) $x;
        if (strpos($x, 'E') === false) {
            return $s;
        }
        $splitted = explode('E', $s);
        $number = rtrim(rtrim($splitted[0], '0'), '.');
        $exp = (int) $splitted[1];
        $len_after_dot = 0;
        if (strpos($number, '.') !== false) {
            $splitted = explode('.', $number);
            $len_after_dot = strlen($splitted[1]);
        }
        $number = str_replace(array('.', '-'), '', $number);
        $sign = ($x < 0) ? '-' : '';
        if ($exp > 0) {
            $zeros = str_repeat('0', abs($exp) - $len_after_dot);
            $s = $sign . $number . $zeros;
        } else {
            $zeros = str_repeat('0', abs($exp) - 1);
            $s = $sign . '0.' . $zeros . $number;
        }
        return $s;
    }

    public function vwap($baseVolume, $quoteVolume) {
        return (($quoteVolume !== null) && ($baseVolume !== null) && ($baseVolume > 0)) ? ($quoteVolume / $baseVolume) : null;
    }

    // ------------------------------------------------------------------------
    // web3 / 0x methods

    public static function has_web3() {
        // PHP version of this function does nothing, as most of its
        // dependencies are lightweight and don't eat a lot
        return true;
    }

    public function check_required_dependencies() {
        if (!static::has_web3()) {
            throw new ExchangeError($this->id . ' requires web3 dependencies');
        }
    }

    public static function hashMessage($message) {
        $trimmed = ltrim($message, '0x');
        $buffer = unpack('C*', hex2bin($trimmed));
        $prefix = bin2hex("\u{0019}Ethereum Signed Message:\n" . sizeof($buffer));
        return '0x' . Keccak::hash(hex2bin($prefix . $trimmed), 256);
    }

    public static function signHash($hash, $privateKey) {
        $signature = static::ecdsa($hash, $privateKey, 'secp256k1', null);
        return array(
            'r' => '0x' . $signature['r'],
            's' => '0x' . $signature['s'],
            'v' => 27 + $signature['v'],
        );
    }

    public static function signMessage($message, $privateKey) {
        return static::signHash(static::hashMessage($message), $privateKey);
    }

    public function sign_message_string($message, $privateKey) {
        $signature = static::signMessage($message, $privateKey);
        return $signature['r'] . $this->remove0x_prefix($signature['s']) . dechex($signature['v']);
    }

    public function oath() {
        if ($this->twofa) {
            return $this->totp($this->twofa);
        } else {
            throw new ExchangeError($this->id . ' requires a non-empty value in $this->twofa property');
        }
    }

    public static function base32_decode($s) {
        static $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $tmp = '';
        foreach (str_split($s) as $c) {
            if (($v = strpos($alphabet, $c)) === false) {
                $v = 0;
            }
            $tmp .= sprintf('%05b', $v);
        }
        $args = array_map('bindec', str_split($tmp, 8));
        array_unshift($args, 'C*');
        return rtrim(call_user_func_array('pack', $args), "\0");
    }

    public static function totp($key) {
        $noSpaceKey = str_replace(' ', '', $key);
        $encodedKey = static::base32_decode($noSpaceKey);
        $epoch = floor(time() / 30);
        $encodedEpoch = pack('J', $epoch);
        $hmacResult = static::hmac($encodedEpoch, $encodedKey, 'sha1', 'hex');
        $hmac = [];
        foreach (str_split($hmacResult, 2) as $hex) {
            $hmac[] = hexdec($hex);
        }
        $offset = $hmac[count($hmac) - 1] & 0xF;
        $code = ($hmac[$offset + 0] & 0x7F) << 24 | ($hmac[$offset + 1] & 0xFF) << 16 | ($hmac[$offset + 2] & 0xFF) << 8 | ($hmac[$offset + 3] & 0xFF);
        $otp = $code % pow(10, 6);
        return str_pad((string) $otp, 6, '0', STR_PAD_LEFT);
    }

    public static function number_to_be($n, $padding) {
        $n = new BN ($n);
        return array_reduce(array_map('chr', $n->toArray('be', $padding)), 'static::binary_concat');
    }

    public static function number_to_le($n, $padding) {
        $n = new BN ($n);
        return array_reduce(array_map('chr', $n->toArray('le', $padding)), 'static::binary_concat');
    }

    public static function base58_to_binary($s) {
        if (!self::$base58_decoder) {
            self::$base58_decoder = array();
            self::$base58_encoder = array();
            for ($i = 0; $i < strlen(self::$base58_alphabet); $i++) {
                $bigNum = new BN($i);
                self::$base58_decoder[self::$base58_alphabet[$i]] = $bigNum;
                self::$base58_encoder[$i] = self::$base58_alphabet[$i];
            }
        }
        $result = new BN(0);
        $base = new BN(58);
        for ($i = 0; $i < strlen($s); $i++) {
            $result->imul($base);
            $result->iadd(self::$base58_decoder[$s[$i]]);
        }
        return static::number_to_be($result, 0);
    }

    public static function binary_to_base58($b) {
        if (!self::$base58_encoder) {
            self::$base58_decoder = array();
            self::$base58_encoder = array();
            for ($i = 0; $i < strlen(self::$base58_alphabet); $i++) {
                $bigNum = new BN($i);
                self::$base58_decoder[self::$base58_alphabet[$i]] = $bigNum;
                self::$base58_encoder[$i] = self::$base58_alphabet[$i];
            }
        }
        // convert binary to decimal
        $result = new BN(0);
        $fromBase = new BN (0x100);
        $string = array();
        foreach (str_split($b) as $c) {
            $result->imul($fromBase);
            $result->iadd(new BN(ord($c)));
        }
        while (!$result->isZero()) {
            $next_character = $result->modn(58);
            $result->idivn(58);
            $string[] = self::$base58_encoder[$next_character];
        }
        return implode('', array_reverse($string));
    }

    public function remove0x_prefix($string) {
        return (substr($string, 0, 2) === '0x') ? substr($string, 2) : $string;
    }

    public function reduce_fees_by_currency($fees) {
        $reduced = array();
        for ($i = 0; $i < count($fees); $i++) {
            $fee = $fees[$i];
            $feeCurrencyCode = $this->safe_value($fee, 'currency');
            if ($feeCurrencyCode !== null) {
                if (is_array($reduced) && array_key_exists($feeCurrencyCode, $reduced)) {
                    $reduced[$feeCurrencyCode]['cost'] = $this->sum($reduced[$feeCurrencyCode]['cost'], $fee['cost']);
                } else {
                    $reduced[$feeCurrencyCode] = array(
                        'cost' => $fee['cost'],
                        'currency' => $feeCurrencyCode,
                    );
                }
            }
        }
        return is_array($reduced) ? array_values($reduced) : array();
    }

    public function safe_order($order) {
        // Cost
        // Remaining
        // Average
        // Price
        // Amount
        // Filled
        //
        // first we try to calculate the $order fields from the $trades
        $amount = $this->safe_value($order, 'amount');
        $remaining = $this->safe_value($order, 'remaining');
        $filled = $this->safe_value($order, 'filled');
        $cost = $this->safe_value($order, 'cost');
        $average = $this->safe_value($order, 'average');
        $price = $this->safe_value($order, 'price');
        $lastTradeTimeTimestamp = $this->safe_integer($order, 'lastTradeTimestamp');
        $parseFilled = ($filled === null);
        $parseCost = ($cost === null);
        $parseLastTradeTimeTimestamp = ($lastTradeTimeTimestamp === null);
        $parseFee = $this->safe_value($order, 'fee') === null;
        $parseFees = $this->safe_value($order, 'fees') === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = $this->safe_value($order, 'fees', array());
        if ($parseFilled || $parseCost || $shouldParseFees) {
            $trades = $this->safe_value($order, 'trades');
            if (is_array($trades)) {
                if ($parseFilled) {
                    $filled = 0;
                }
                if ($parseCost) {
                    $cost = 0;
                }
                for ($i = 0; $i < count($trades); $i++) {
                    $trade = $trades[$i];
                    $tradeAmount = $this->safe_value($trade, 'amount');
                    if ($parseFilled && ($tradeAmount !== null)) {
                        $filled = $this->sum($filled, $tradeAmount);
                    }
                    $tradeCost = $this->safe_value($trade, 'cost');
                    if ($parseCost && ($tradeCost !== null)) {
                        $cost = $this->sum($cost, $tradeCost);
                    }
                    $tradeTimestamp = $this->safe_value($trade, 'timestamp');
                    if ($parseLastTradeTimeTimestamp && ($tradeTimestamp !== null)) {
                        if ($lastTradeTimeTimestamp === null) {
                            $lastTradeTimeTimestamp = $tradeTimestamp;
                        } else {
                            $lastTradeTimeTimestamp = max ($lastTradeTimeTimestamp, $tradeTimestamp);
                        }
                    }
                    if ($shouldParseFees) {
                        $tradeFees = $this->safe_value($trade, 'fees');
                        if ($tradeFees !== null) {
                            for ($j = 0; $j < count($tradeFees); $j++) {
                                $tradeFee = $tradeFees[$j];
                                $fees[] = array_merge(array(), $tradeFee);
                            }
                        } else {
                            $tradeFee = $this->safe_value($trade, 'fee');
                            if ($tradeFee !== null) {
                                $fees[] = array_merge(array(), $tradeFee);
                            }
                        }
                    }
                }
            }
        }
        if ($shouldParseFees) {
            $reducedFees = $this->reduceFees ? $this->reduce_fees_by_currency($fees) : $fees;
            $reducedLength = is_array($reducedFees) ? count($reducedFees) : 0;
            if (!$parseFee && ($reducedLength === 0)) {
                array_push($reducedFees, $order['fee']);
            }
            if ($parseFees) {
                $order['fees'] = $reducedFees;
            }
            if ($parseFee && ($reducedLength === 1)) {
                $order['fee'] = $reducedFees[0];
            }
        }
        if ($amount === null) {
            // ensure $amount = $filled . $remaining
            if ($filled !== null && $remaining !== null) {
                $amount = $this->sum($filled, $remaining);
            } else if ($this->safe_string($order, 'status') === 'closed') {
                $amount = $filled;
            }
        }
        if ($filled === null) {
            if ($amount !== null && $remaining !== null) {
                $filled = max ($this->sum($amount, -$remaining), 0);
            }
        }
        if ($remaining === null) {
            if ($amount !== null && $filled !== null) {
                $remaining = max ($this->sum($amount, -$filled), 0);
            }
        }
        // ensure that the $average field is calculated correctly
        if ($average === null) {
            if (($filled !== null) && ($cost !== null) && ($filled > 0)) {
                $average = $cost / $filled;
            }
        }
        // also ensure the $cost field is calculated correctly
        $costPriceExists = ($average !== null) || ($price !== null);
        if ($parseCost && ($filled !== null) && $costPriceExists) {
            $cost = ($average === null) ? ($price * $filled) : ($average * $filled);
        }
        // support for market orders
        $orderType = $this->safe_value($order, 'type');
        $emptyPrice = ($price === null) || ($price === 0.0);
        if ($emptyPrice && ($orderType === 'market')) {
            $price = $average;
        }
        return array_merge($order, array(
            'lastTradeTimestamp' => $lastTradeTimeTimestamp,
            'price' => $price,
            'amount' => $amount,
            'cost' => $cost,
            'average' => $average,
            'filled' => $filled,
            'remaining' => $remaining,
        ));
    }

    public function parse_number($value, $default = null) {
        if ($value === null) {
            return $default;
        } else {
            try {
                return $this->number($value);
            } catch (Exception $e) {
                return $default;
            }
        }
    }

    public function safe_number($object, $key, $default = null) {
        $value = $this->safe_string($object, $key);
        return $this->parse_number($value, $default);
    }

    public function safe_number_2($object, $key1, $key2, $default = null) {
        $value = $this->safe_string_2($object, $key1, $key2);
        return $this->parse_number($value, $default);
    }

    public function parse_precision($precision) {
        if ($precision === null) {
            return null;
        }
        return '1e' . Precise::string_neg($precision);
    }

    public function omit_zero($string_number) {
        if ($string_number === null) {
            return null;
        }
        if (floatval($string_number) === 0.0) {
            return null;
        }
        return $string_number;
    }
}
