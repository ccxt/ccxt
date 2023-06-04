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

$version = '3.1.21';

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

    const VERSION = '3.1.21';

    private static $base58_alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    private static $base58_encoder = null;
    private static $base58_decoder = null;

    public $defined_rest_api = array();

    public $curl = null;
    public $curl_options = array(); // overrideable by user, empty by default
    public $curl_reset = true;
    public $curl_close = false;

    public $id = null;

    public $validateServerSsl = true;
    public $validateClientSsl = false;
    public $curlopt_interface = null;
    public $timeout = 10000; // in milliseconds
    public $proxy = '';
    public $origin = '*'; // CORS origin
    public $headers = array();
    public $hostname = null; // in case of inaccessibility of the "main" domain

    public $options = array(); // exchange-specific options if any

    public $skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway
    public $quoteJsonNumbers = true; // treat numbers in json as quoted precise strings

    public $name = null;
    public $countries = null;
    public $version = null;
    public $certified = false; // if certified by the CCXT dev team
    public $pro = false; // if it is integrated with CCXT Pro for WebSocket support
    public $alias = false; // whether this exchange is an alias to another exchange

    public $urls = array();
    public $api = array();
    public $comment = null;

    public $markets = null;
    public $symbols = null;
    public $codes = null;
    public $ids = null;
    public $currencies = array();
    public $base_currencies = null;
    public $quote_currencies = null;
    public $balance = array();
    public $orderbooks = array();
    public $tickers = array();
    public $fees = array('trading' => array(), 'funding' => array());
    public $precision = array();
    public $orders = null;
    public $myTrades = null;
    public $trades = array();
    public $transactions = array();
    public $positions = array();
    public $ohlcvs = array();
    public $exceptions = array();
    public $accounts = array();
    public $status = array('status' => 'ok', 'updated' => null, 'eta' => null, 'url' => null);
    public $limits = array(
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
        'leverage' => array(
            'min' => null,
            'max' => null,
        ),
    );
    public $httpExceptions = array(
        '422' => 'ExchangeError',
        '418' => 'DDoSProtection',
        '429' => 'RateLimitExceeded',
        '404' => 'ExchangeNotAvailable',
        '409' => 'ExchangeNotAvailable',
        '410' => 'ExchangeNotAvailable',
        '451' => 'ExchangeNotAvailable',
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
        '407' => 'AuthenticationError',
        '511' => 'AuthenticationError',
    );
    public $verbose = false;
    public $apiKey = '';
    public $secret = '';
    public $password = '';
    public $login = '';
    public $uid = '';
    public $privateKey = '';
    public $walletAddress = '';
    public $token = ''; // reserved for HTTP auth in some cases

    public $twofa = null;
    public $markets_by_id = null;
    public $currencies_by_id = null;
    public $userAgent = null; // 'ccxt/' . $this::VERSION . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
    public $userAgents = array(
        'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        'chrome100' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    );
    public $minFundingAddressLength = 1; // used in check_address
    public $substituteCommonCurrencyCodes = true;

    // whether fees should be summed by currency code
    public $reduceFees = true;

    public $timeframes = null;

    public $requiredCredentials = array(
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
    public $has = array(
        'publicAPI' => true,
        'privateAPI' => true,
        'CORS' => null,
        'spot' => null,
        'margin' => null,
        'swap' => null,
        'future' => null,
        'option' => null,
        'addMargin' => null,
        'cancelAllOrders' => null,
        'cancelOrder' => true,
        'cancelOrders' => null,
        'createDepositAddress' => null,
        'createLimitOrder' => true,
        'createMarketOrder' => true,
        'createOrder' => true,
        'createPostOnlyOrder' => null,
        'createReduceOnlyOrder' => null,
        'createStopOrder' => null,
        'editOrder' => 'emulated',
        'fetchAccounts' => null,
        'fetchBalance' => true,
        'fetchBidsAsks' => null,
        'fetchBorrowInterest' => null,
        'fetchBorrowRate' => null,
        'fetchBorrowRateHistory' => null,
        'fetchBorrowRatesPerSymbol' => null,
        'fetchBorrowRates' => null,
        'fetchCanceledOrders' => null,
        'fetchClosedOrder' => null,
        'fetchClosedOrders' => null,
        'fetchCurrencies' => 'emulated',
        'fetchDeposit' => null,
        'fetchDepositAddress' => null,
        'fetchDepositAddresses' => null,
        'fetchDepositAddressesByNetwork' => null,
        'fetchDeposits' => null,
        'fetchFundingFee' => null,
        'fetchFundingFees' => null,
        'fetchFundingHistory' => null,
        'fetchFundingRate' => null,
        'fetchFundingRateHistory' => null,
        'fetchFundingRates' => null,
        'fetchIndexOHLCV' => null,
        'fetchL2OrderBook' => true,
        'fetchLedger' => null,
        'fetchLedgerEntry' => null,
        'fetchLeverageTiers' => null,
        'fetchMarketLeverageTiers' => null,
        'fetchMarkets' => true,
        'fetchMarkOHLCV' => null,
        'fetchMyTrades' => null,
        'fetchOHLCV' => 'emulated',
        'fetchOpenOrder' => null,
        'fetchOpenOrders' => null,
        'fetchOrder' => null,
        'fetchOrderBook' => true,
        'fetchOrderBooks' => null,
        'fetchOrders' => null,
        'fetchOrderTrades' => null,
        'fetchPermissions' => null,
        'fetchPosition' => null,
        'fetchPositions' => null,
        'fetchPositionsRisk' => null,
        'fetchPremiumIndexOHLCV' => null,
        'fetchStatus' => 'emulated',
        'fetchTicker' => true,
        'fetchTickers' => null,
        'fetchTime' => null,
        'fetchTrades' => true,
        'fetchTradingFee' => null,
        'fetchTradingFees' => null,
        'fetchTradingLimits' => null,
        'fetchTransactions' => null,
        'fetchTransfers' => null,
        'fetchWithdrawal' => null,
        'fetchWithdrawals' => null,
        'reduceMargin' => null,
        'setLeverage' => null,
        'setMargin' => null,
        'setMarginMode' => null,
        'setPositionMode' => null,
        'signIn' => null,
        'transfer' => null,
        'withdraw' => null,
    );

    public $precisionMode = DECIMAL_PLACES;
    public $paddingMode = NO_PADDING;
    public $number = 'floatval';
    public $handleContentTypeApplicationZip = false;

    public $lastRestRequestTimestamp = 0;
    public $lastRestPollTimestamp = 0;
    public $restRequestQueue = null;
    public $restPollerLoopIsRunning = false;
    public $enableRateLimit = true;
    public $enableLastJsonResponse = true;
    public $enableLastHttpResponse = true;
    public $enableLastResponseHeaders = true;
    public $last_http_response = null;
    public $last_json_response = null;
    public $last_response_headers = null;

    public $requiresWeb3 = false;
    public $requiresEddsa = false;
    public $rateLimit = 2000;

    public $commonCurrencies = array(
        'XBT' => 'BTC',
        'BCC' => 'BCH',
        'BCHABC' => 'BCH',
        'BCHSV' => 'BSV',
    );

    public $urlencode_glue = '&'; // ini_get('arg_separator.output'); // can be overrided by exchange constructor params
    public $urlencode_glue_warning = true;

    public $tokenBucket = null; /* array(
        'delay' => 0.001,
        'capacity' => 1.0,
        'cost' => 1.0,
        'maxCapacity' => 1000,
        'refillRate' => ($this->rateLimit > 0) ? 1.0 / $this->rateLimit : PHP_INT_MAX,
    ); */

    public $baseCurrencies = null;
    public $quoteCurrencies = null;

    public static $exchanges = array(
        'ace',
        'alpaca',
        'ascendex',
        'bequant',
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
        'bitopro',
        'bitpanda',
        'bitrue',
        'bitso',
        'bitstamp',
        'bitstamp1',
        'bittrex',
        'bitvavo',
        'bkex',
        'bl3p',
        'blockchaincom',
        'btcalpha',
        'btcbox',
        'btcex',
        'btcmarkets',
        'btctradeua',
        'btcturk',
        'bybit',
        'cex',
        'coinbase',
        'coinbaseprime',
        'coinbasepro',
        'coincheck',
        'coinex',
        'coinfalcon',
        'coinmate',
        'coinone',
        'coinsph',
        'coinspot',
        'cryptocom',
        'currencycom',
        'delta',
        'deribit',
        'digifinex',
        'exmo',
        'fmfwio',
        'gate',
        'gateio',
        'gemini',
        'hitbtc',
        'hitbtc3',
        'hollaex',
        'huobi',
        'huobijp',
        'huobipro',
        'idex',
        'independentreserve',
        'indodax',
        'kraken',
        'krakenfutures',
        'kucoin',
        'kucoinfutures',
        'kuna',
        'latoken',
        'lbank',
        'lbank2',
        'luno',
        'lykke',
        'mercado',
        'mexc',
        'mexc3',
        'ndax',
        'novadax',
        'oceanex',
        'okcoin',
        'okex',
        'okex5',
        'okx',
        'paymium',
        'phemex',
        'poloniex',
        'poloniexfutures',
        'probit',
        'tidex',
        'timex',
        'tokocrypto',
        'upbit',
        'wavesexchange',
        'wazirx',
        'whitebit',
        'woo',
        'xt',
        'yobit',
        'zaif',
        'zonda',
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

    public static function valid_string($string) {
        return isset($string) && $string !== '';
    }

    public static function valid_object_value($object, $key) {
        return isset($object[$key]) && $object[$key] !== '' && is_scalar($object[$key]);
    }

    public static function safe_float($object, $key, $default_value = null) {
        return (isset($object[$key]) && is_numeric($object[$key])) ? floatval($object[$key]) : $default_value;
    }

    public static function safe_string($object, $key, $default_value = null) {
        return static::valid_object_value($object, $key) ? strval($object[$key]) : $default_value;
    }

    public static function safe_string_lower($object, $key, $default_value = null) {
        if (static::valid_object_value($object, $key)) {
            return strtolower(strval($object[$key]));
        } else if ($default_value === null) {
            return $default_value;
        } else {
            return strtolower($default_value);
        }
    }

    public static function safe_string_upper($object, $key, $default_value = null) {
        if (static::valid_object_value($object, $key)) {
            return strtoupper(strval($object[$key]));
        } else if ($default_value === null) {
            return $default_value;
        } else {
            return strtoupper($default_value);
        }
        return static::valid_object_value($object, $key) ? strtoupper(strval($object[$key])) : $default_value;
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
        return isset($object[$key]) ? $object[$key] : $default_value;
    }

    // we're not using safe_floats with a list argument as we're trying to save some cycles here
    // we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    public static function safe_float_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_float($object, $key1);
        return isset($value) ? $value : static::safe_float($object, $key2, $default_value);
    }

    public static function safe_string_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string($object, $key1);
        return static::valid_string($value) ? $value : static::safe_string($object, $key2, $default_value);
    }

    public static function safe_string_lower_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string_lower($object, $key1);
        return static::valid_string($value) ? $value : static::safe_string_lower($object, $key2, $default_value);
    }

    public static function safe_string_upper_2($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string_upper($object, $key1);
        return static::valid_string($value) ? $value : static::safe_string_upper($object, $key2, $default_value);
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

    // safe_method_n family
    public static function safe_float_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        return (isset($value) && is_numeric($value)) ? floatval($value) : $default_value;
    }

    public static function safe_string_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        return (static::valid_string($value) && is_scalar($value)) ? strval($value) : $default_value;
    }

    public static function safe_string_lower_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        if (static::valid_string($value) && is_scalar($value)) {
            return strtolower(strval($value));
        } else if ($default_value === null) {
            return $default_value;
        } else {
            return strtolower($default_value);
        }
    }

    public static function safe_string_upper_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        if (static::valid_string($value) && is_scalar($value)) {
            return strtoupper(strval($value));
        } else if ($default_value === null) {
            return $default_value;
        } else {
            return strtoupper($default_value);
        }
    }

    public static function safe_integer_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        return (isset($value) && is_numeric($value)) ? intval($value) : $default_value;
    }

    public static function safe_integer_product_n($object, $array, $factor, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        return (isset($value) && is_numeric($value)) ? (intval($value * $factor)) : $default_value;
    }

    public static function safe_timestamp_n($object, $array, $default_value = null) {
        return static::safe_integer_product_n($object, $array, 1000, $default_value);
    }

    public static function safe_value_n($object, $array, $default_value = null) {
        $value = static::get_object_value_from_key_array($object, $array);
        return isset($value) ? $value : $default_value;
    }

    public static function get_object_value_from_key_array($object, $array) {
        foreach($array as $key) {
            if (isset($object[$key]) && $object[$key] !== '') {
                return $object[$key];
            }
        }
        return null;
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
        $result = array();
        foreach ($array as $element) {
            if (isset($key, $element) && ($element[$key] == $value)) {
                $result[] = $element;
            }
        }
        return $result;
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

    public static function sort_by_2($arrayOfArrays, $key1, $key2, $descending = false) {
        $descending = $descending ? -1 : 1;
        usort($arrayOfArrays, function ($a, $b) use ($key1, $key2, $descending) {
            if ($a[$key1] == $b[$key1]) {
                if ($a[$key2] == $b[$key2]) {
                    return 0;
                }
                return $a[$key2] < $b[$key2] ? -$descending : $descending;
            }
            return $a[$key1] < $b[$key1] ? -$descending : $descending;
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
        if ($object instanceof \JsonSerializable) {
            $object = $object->jsonSerialize();
        }
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

    public static function deep_extend() {
        //
        //     extend associative dictionaries only, replace everything else
        //
        $out = null;
        $args = func_get_args();
        foreach ($args as $arg) {
            if (static::is_associative($arg) || (is_array($arg) && (count($arg) === 0))) {
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

    public function urlencode_nested($array) {
        // we don't have to implement this method in PHP
        // https://github.com/ccxt/ccxt/issues/12872
        // https://github.com/ccxt/ccxt/issues/12900
        return $this->urlencode($array);
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

    public static function ymd($timestamp, $infix = '-', $fullYear = true) {
        $yearFormat = $fullYear ? 'Y' : 'y';
        return gmdate($yearFormat . $infix . 'm' . $infix . 'd', (int) round($timestamp / 1000));
    }

    public static function yymmdd($timestamp, $infix = '') {
        return static::ymd($timestamp, $infix, false);
    }

    public static function yyyymmdd($timestamp, $infix = '-') {
        return static::ymd($timestamp, $infix, true);
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
        $flags = JSON_UNESCAPED_SLASHES;
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

    public function check_address($address) {
        if (empty($address) || !is_string($address)) {
            throw new InvalidAddress($this->id . ' address is null');
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

        $this->options = $this->get_default_options();

        $this->urlencode_glue = ini_get('arg_separator.output'); // can be overrided by exchange constructor params

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
                throw new ExchangeError($this->id . ' warning! The glue symbol for HTTP queries ' .
                    ' is changed from its default value & to ' . $this->urlencode_glue . ' in php.ini' .
                    ' (arg_separator.output) or with a call to ini_set prior to this message. If that' .
                    ' was the intent, you can acknowledge this warning and silence it by setting' .
                    " 'urlencode_glue_warning' => false or 'urlencode_glue' => '&' with exchange constructor params");
            }
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

    public static function underscore($camelcase) {
        // conversion fooBar10OHLCV2Candles → foo_bar10_ohlcv2_candles
        $underscore = preg_replace_callback('/[a-z0-9][A-Z]/m', function ($x) {
            return $x[0][0] . '_' . $x[0][1];
        }, $camelcase);
        return strtolower($underscore);
    }

    public function camelcase($underscore) {
        // todo: write conversion foo_bar10_ohlcv2_candles → fooBar10OHLCV2Candles
        throw new NotSupported($this->id . ' camelcase() is not supported yet');
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

    public static function jwt($request, $secret, $algorithm = 'sha256', $is_rsa = false) {
        $alg = ($is_rsa ? 'RS' : 'HS') . mb_substr($algorithm, 3, 3);
        $encodedHeader = static::urlencodeBase64(json_encode(array('alg' => $alg, 'typ' => 'JWT')));
        $encodedData = static::urlencodeBase64(json_encode($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        if ($is_rsa) {
            $signature = \base64_decode(static::rsa($token, $secret, $algorithm));
        } else {
            $signature =  static::hmac($token, $secret, $algorithm, 'binary');
        }
        return $token . '.' . static::urlencodeBase64($signature);
    }

    public static function rsa($request, $secret, $alg = 'sha256') {
        $algorithms = array(
            'sha256' => \OPENSSL_ALGO_SHA256,
            'sha384' => \OPENSSL_ALGO_SHA384,
            'sha512' => \OPENSSL_ALGO_SHA512,
        );
        if (!array_key_exists($alg, $algorithms)) {
            throw new ExchangeError($alg . ' is not a supported rsa signing algorithm.');
        }
        $algName = $algorithms[$alg];
        $signature = null;
        \openssl_sign($request, $signature, $secret, $algName);
        return \base64_encode($signature);
    }

    public static function ecdsa($request, $secret, $algorithm = 'p256', $hash = null, $fixedLength = false) {
        $digest = $request;
        if ($hash !== null) {
            $digest = static::hash($request, $hash, 'hex');
        }
        $ec = new EC(strtolower($algorithm));
        $key = $ec->keyFromPrivate(ltrim($secret, '0x'));
        $ellipticSignature = $key->sign($digest, 'hex', array('canonical' => true));
        $count = new BN('0');
        $minimumSize = (new BN('1'))->shln(8 * 31)->sub(new BN('1'));
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
        $curve = new EdDSA($algorithm);
        $signature = $curve->signModified($request, $secret);
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

        $headers = $this->set_headers($headers);

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
            } elseif ($this->curl_reset) {
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
        if (!$this->validateClientSsl) {
            curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
        }
        if (!$this->validateServerSsl) {
            curl_setopt($this->curl, CURLOPT_SSL_VERIFYHOST, false);
        }

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
            print_r(array('fetch Request:', $this->id, $method, $url, 'RequestHeaders:', $verbose_headers, 'RequestBody:', $body));
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
            print_r(array('fetch Response:', $this->id, $method, $url, $http_status_code, $curl_error, 'ResponseHeaders:', $response_headers, 'ResponseBody:', $result));
        }

        if ($result === false) {
            if ($curl_errno == 28) { // CURLE_OPERATION_TIMEDOUT
                throw new RequestTimeout($this->id . ' ' . implode(' ', array($url, $method, $curl_errno, $curl_error)));
            }

            // all sorts of SSL problems, accessibility
            throw new ExchangeNotAvailable($this->id . ' ' . implode(' ', array($url, $method, $curl_errno, $curl_error)));
        }

        $skip_further_error_handling = $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $result ? $result : null, $json_response, $headers, $body);
        if (!$skip_further_error_handling) {
            $this->handle_http_status_code($http_status_code, $http_status_text, $url, $method, $result);
        }
        // check if $curl_errno is not zero
        if ($curl_errno) {
            throw new NetworkError($this->id . ' unknown error: ' . strval($curl_errno) . ' ' . $curl_error);
        }

        return isset($json_response) ? $json_response : $result;
    }

    public function load_markets($reload = false, $params = array()) {
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets($this->markets);
            }
            return $this->markets;
        }
        $currencies = null;
        if (array_key_exists('fetchCurrencies', $this->has) && $this->has['fetchCurrencies'] === true) {
            $currencies = $this->fetch_currencies();
        }
        $markets = $this->fetch_markets($params);
        return $this->set_markets($markets, $currencies);
    }

    public function number($n) {
        return call_user_func($this->number, $n);
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

    public function precision_from_string($str) {
        // support string formats like '1e-4'
        if (strpos($str, 'e') > -1) {
            $numStr = preg_replace ('/\de/', '', $str);
            return ((int)$numStr) * -1;
        }
        // support integer formats (without dot) like '1', '10' etc [Note: bug in decimalToPrecision, so this should not be used atm]
        // if (strpos($str, '.') === -1) {
        //     return strlen(str) * -1;
        // }
        // default strings like '0.0001'
        $parts = explode('.', preg_replace('/0+$/', '', $str));
        return (count($parts) > 1) ? strlen($parts[1]) : 0;
    }

    public function __call($function, $params) {
        if (!preg_match('/^[A-Z0-9_]+$/', $function)) {
            $underscore = static::underscore($function);
            if (method_exists($this, $underscore)) {
                return call_user_func_array(array($this, $underscore), $params);
            }
        }
        /* handle errors */
        throw new ExchangeError($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
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
        $parts = explode('.', preg_replace('/0+$/', '', $x));
        if (count($parts) > 1) {
            return strlen($parts[1]);
        } else {
            return 0;
        }
    }

    public static function decimal_to_precision($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        if ($countingMode === TICK_SIZE) {
            if (!(is_float($numPrecisionDigits) || is_int($numPrecisionDigits) || is_string($numPrecisionDigits) ))
                throw new BaseError('Precision must be an integer or float or string for TICK_SIZE');
        } else {
            if (!is_int($numPrecisionDigits)) {
                throw new BaseError('Precision must be an integer');
            }
        }

        if (is_string($numPrecisionDigits)) {
            $numPrecisionDigits = (float) $numPrecisionDigits;
        }

        if (!is_numeric($x)) {
            throw new BaseError('Invalid number');
        }

        assert(($roundingMode === ROUND) || ($roundingMode === TRUNCATE));

        $result = '';

        // Special handling for negative precision
        if ($numPrecisionDigits < 0) {
            if ($countingMode === TICK_SIZE) {
                throw new BaseError('TICK_SIZE cant be used with negative numPrecisionDigits');
            }
            $toNearest = pow(10, abs($numPrecisionDigits));
            if ($roundingMode === ROUND) {
                $result = (string) ($toNearest * static::decimal_to_precision($x / $toNearest, $roundingMode, 0, DECIMAL_PLACES, $paddingMode));
            }
            if ($roundingMode === TRUNCATE) {
                $result = static::decimal_to_precision($x - ( (int) $x % $toNearest), $roundingMode, 0, DECIMAL_PLACES, $paddingMode);
            }
            return $result;
        }

        if ($countingMode === TICK_SIZE) {
            $precisionDigitsString = static::decimal_to_precision($numPrecisionDigits, ROUND, 100, DECIMAL_PLACES, NO_PADDING);
            $newNumPrecisionDigits = static::precisionFromString($precisionDigitsString);
            $missing = fmod($x, $numPrecisionDigits);
            $missing = floatval(static::decimal_to_precision($missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING));
            // See: https://github.com/ccxt/ccxt/pull/6486
            $fpError = static::decimal_to_precision($missing / $numPrecisionDigits, ROUND, max($newNumPrecisionDigits, 8), DECIMAL_PLACES, NO_PADDING);
            if(static::precisionFromString($fpError) !== 0) {
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
                } elseif (TRUNCATE === $roundingMode) {
                    $x = $x - $missing;
                }
            }
            return static::decimal_to_precision($x, ROUND, $newNumPrecisionDigits, DECIMAL_PLACES, $paddingMode);
        }


        if ($roundingMode === ROUND) {
            if ($countingMode === DECIMAL_PLACES) {
                // Requested precision of 100 digits was truncated to PHP maximum of 53 digits
                $numPrecisionDigits = min(14, $numPrecisionDigits);
                $result = number_format(round($x, $numPrecisionDigits, PHP_ROUND_HALF_UP), $numPrecisionDigits, '.', '');
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                $significantPosition = ((int) log( abs($x), 10)) % 10;
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
        if ($x === null) {
            return null;
        }
        $type = gettype($x);
        $s = (string) $x;
        if (($type !== 'integer') && ($type !== 'double')) {
            return $s;
        }
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

    public static function check_required_version($required_version, $error = true) {
        global $version;
        $result = true;
        $required = explode('.', $required_version);
        $current = explode('.', $version);
        $intMajor1 = intval($required[0]);
        $intMinor1 = intval($required[1]);
        $intPatch1 = intval($required[2]);
        $intMajor2 = intval($current[0]);
        $intMinor2 = intval($current[1]);
        $intPatch2 = intval($current[2]);
        if ($intMajor1 > $intMajor2) {
            $result = false;
        }
        if ($intMajor1 === $intMajor2) {
            if ($intMinor1 > $intMinor2) {
                $result = false;
            } elseif ($intMinor1 === $intMinor2 && $intPatch1 > $intPatch2) {
                $result = false;
            }
        }
        if (!$result) {
            if ($error) {
                throw new NotSupported('Your current version of CCXT is ' . $version . ', a newer version ' . $required_version . ' is required, please, upgrade your version of CCXT');
            } else {
                return $error;
            }
        }
        return $result;
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
        $n = new BN($n);
        return array_reduce(array_map('chr', $n->toArray('be', $padding)), 'static::binary_concat');
    }

    public static function number_to_le($n, $padding) {
        $n = new BN($n);
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
        $fromBase = new BN(0x100);
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

    public function omit_zero($string_number) {
        if ($string_number === null || $string_number === '') {
            return null;
        }
        if (floatval($string_number) === 0.0) {
            return null;
        }
        return $string_number;
    }

    public function sleep($milliseconds) {
        sleep($milliseconds / 1000);
    }

    public function check_order_arguments ($market, $type, $side, $amount, $price, $params) {
        if ($price === null) {
            if ($type === 'limit') {
                  throw new ArgumentsRequired ($this->id + ' create_order() requires a price argument for a limit order');
             }
        }
        if ($amount <= 0) {
            throw new ArgumentsRequired ($this->id + ' create_order() amount should be above 0');
        }
    }

    public function handle_http_status_code($http_status_code, $status_text, $url, $method, $body) {
        $string_code = (string) $http_status_code;
        if (array_key_exists($string_code, $this->httpExceptions)) {
            $error_class = $this->httpExceptions[$string_code];
            if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                $error_class = '\\ccxt\\' . $error_class;
            }
            throw new $error_class($this->id . ' ' . implode(' ', array($this->id, $url, $method, $http_status_code, $body)));
        }
    }

    public static function crc32($string, $signed = false) {
        $unsigned = \crc32($string);
        if ($signed && ($unsigned >= 0x80000000)) {
            return $unsigned - 0x100000000;
        } else {
            return $unsigned;
        }
    }

    function find_timeframe($timeframe, $timeframes = null) {
        $timeframes = $timeframes ? $timeframes : $this->timeframes;
        $keys = array_keys($timeframes);
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($timeframes[$key] === $timeframe) {
                return $key;
            }
        }
        return null;
    }

    function parse_to_big_int($value) {
        return intval($value);
    }

    function valueIsDefined($value){
        return isset($value) && !is_null($value);
    }

    function arraySlice($array, $first, $second = null){
        if ($second === null) {
            return array_slice($array, $first);
        } else {
            return array_slice($array, $first, $second);
        }
    }

    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    public function find_message_hashes($client, string $element) {
        $result = array();
        $messageHashes = is_array($client->futures) ? array_keys($client->futures) : array();
        for ($i = 0; $i < count($messageHashes); $i++) {
            $messageHash = $messageHashes[$i];
            if (mb_strpos($messageHash, $element) !== false) {
                $result[] = $messageHash;
            }
        }
        return $result;
    }

    public function filter_by_limit(mixed $array, ?int $limit = null, int|string $key = 'timestamp') {
        if ($this->valueIsDefined ($limit)) {
            $arrayLength = count($array);
            if ($arrayLength > 0) {
                $ascending = true;
                if ((is_array($array[0]) && array_key_exists($key, $array[0]))) {
                    $first = $array[0][$key];
                    $last = $array[$arrayLength - 1][$key];
                    if ($first !== null && $last !== null) {
                        $ascending = $first <= $last;  // true if $array is sorted in $ascending order based on 'timestamp'
                    }
                }
                $array = $ascending ? $this->arraySlice ($array, -$limit) : $this->arraySlice ($array, 0, $limit);
            }
        }
        return $array;
    }

    public function filter_by_since_limit(mixed $array, ?int $since = null, ?int $limit = null, int|string $key = 'timestamp', $tail = false) {
        $sinceIsDefined = $this->valueIsDefined ($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        if ($sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                if ($entry[$key] >= $since) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail) {
            return mb_substr($result, -$limit);
        }
        return $this->filter_by_limit($result, $limit, $key);
    }

    public function filter_by_value_since_limit(mixed $array, int|string $field, $value = null, ?int $since = null, ?int $limit = null, $key = 'timestamp', $tail = false) {
        $valueIsDefined = $this->valueIsDefined ($value);
        $sinceIsDefined = $this->valueIsDefined ($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        // single-pass filter for both symbol and $since
        if ($valueIsDefined || $sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                $entryFiledEqualValue = $entry[$field] === $value;
                $firstCondition = $valueIsDefined ? $entryFiledEqualValue : true;
                $entryKeyGESince = $entry[$key] && $since && ($entry[$key] >= $since);
                $secondCondition = $sinceIsDefined ? $entryKeyGESince : true;
                if ($firstCondition && $secondCondition) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail) {
            return mb_substr($result, -$limit);
        }
        return $this->filter_by_limit($result, $limit, $key);
    }

    public function sign($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null) {
        return array();
    }

    public function fetch_accounts($params = array ()) {
        throw new NotSupported($this->id . ' fetchAccounts() is not supported yet');
    }

    public function fetch_trades(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTrades() is not supported yet');
    }

    public function watch_trades(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTrades() is not supported yet');
    }

    public function fetch_deposit_addresses(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddresses() is not supported yet');
    }

    public function fetch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBook() is not supported yet');
    }

    public function watch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrderBook() is not supported yet');
    }

    public function fetch_time($params = array ()) {
        throw new NotSupported($this->id . ' fetchTime() is not supported yet');
    }

    public function fetch_trading_limits(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingLimits() is not supported yet');
    }

    public function parse_ticker(array $ticker, $market = null) {
        throw new NotSupported($this->id . ' parseTicker() is not supported yet');
    }

    public function parse_deposit_address($depositAddress, $currency = null) {
        throw new NotSupported($this->id . ' parseDepositAddress() is not supported yet');
    }

    public function parse_trade(array $trade, $market = null) {
        throw new NotSupported($this->id . ' parseTrade() is not supported yet');
    }

    public function parse_transaction($transaction, $currency = null) {
        throw new NotSupported($this->id . ' parseTransaction() is not supported yet');
    }

    public function parse_transfer($transfer, $currency = null) {
        throw new NotSupported($this->id . ' parseTransfer() is not supported yet');
    }

    public function parse_account($account) {
        throw new NotSupported($this->id . ' parseAccount() is not supported yet');
    }

    public function parse_ledger_entry($item, $currency = null) {
        throw new NotSupported($this->id . ' parseLedgerEntry() is not supported yet');
    }

    public function parse_order($order, $market = null) {
        throw new NotSupported($this->id . ' parseOrder() is not supported yet');
    }

    public function fetch_borrow_rates($params = array ()) {
        throw new NotSupported($this->id . ' fetchBorrowRates() is not supported yet');
    }

    public function parse_market_leverage_tiers($info, $market = null) {
        throw new NotSupported($this->id . ' parseMarketLeverageTiers() is not supported yet');
    }

    public function fetch_leverage_tiers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLeverageTiers() is not supported yet');
    }

    public function parse_position($position, $market = null) {
        throw new NotSupported($this->id . ' parsePosition() is not supported yet');
    }

    public function parse_funding_rate_history($info, $market = null) {
        throw new NotSupported($this->id . ' parseFundingRateHistory() is not supported yet');
    }

    public function parse_borrow_interest($info, $market = null) {
        throw new NotSupported($this->id . ' parseBorrowInterest() is not supported yet');
    }

    public function fetch_funding_rates(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingRates() is not supported yet');
    }

    public function transfer(string $code, $amount, $fromAccount, $toAccount, $params = array ()) {
        throw new NotSupported($this->id . ' transfer() is not supported yet');
    }

    public function withdraw(string $code, $amount, $address, $tag = null, $params = array ()) {
        throw new NotSupported($this->id . ' withdraw() is not supported yet');
    }

    public function create_deposit_address(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' createDepositAddress() is not supported yet');
    }

    public function set_leverage($leverage, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setLeverage() is not supported yet');
    }

    public function parse_to_int($number) {
        // Solve Common intvalmisuse ex => intval((since / (string) 1000))
        // using a $number which is not valid in ts
        $stringifiedNumber = (string) $number;
        $convertedNumber = floatval($stringifiedNumber);
        return intval($convertedNumber);
    }

    public function get_default_options() {
        return array(
            'defaultNetworkCodeReplacements' => array(
                'ETH' => array( 'ERC20' => 'ETH' ),
                'TRX' => array( 'TRC20' => 'TRX' ),
                'CRO' => array( 'CRC20' => 'CRONOS' ),
            ),
        );
    }

    public function safe_ledger_entry(array $entry, ?array $currency = null) {
        $currency = $this->safe_currency(null, $currency);
        $direction = $this->safe_string($entry, 'direction');
        $before = $this->safe_string($entry, 'before');
        $after = $this->safe_string($entry, 'after');
        $amount = $this->safe_string($entry, 'amount');
        if ($amount !== null) {
            if ($before === null && $after !== null) {
                $before = Precise::string_sub($after, $amount);
            } elseif ($before !== null && $after === null) {
                $after = Precise::string_add($before, $amount);
            }
        }
        if ($before !== null && $after !== null) {
            if ($direction === null) {
                if (Precise::string_gt($before, $after)) {
                    $direction = 'out';
                }
                if (Precise::string_gt($after, $before)) {
                    $direction = 'in';
                }
            }
        }
        $fee = $this->safe_value($entry, 'fee');
        if ($fee !== null) {
            $fee['cost'] = $this->safe_number($fee, 'cost');
        }
        $timestamp = $this->safe_integer($entry, 'timestamp');
        return array(
            'id' => $this->safe_string($entry, 'id'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'direction' => $direction,
            'account' => $this->safe_string($entry, 'account'),
            'referenceId' => $this->safe_string($entry, 'referenceId'),
            'referenceAccount' => $this->safe_string($entry, 'referenceAccount'),
            'type' => $this->safe_string($entry, 'type'),
            'currency' => $currency['code'],
            'amount' => $this->parse_number($amount),
            'before' => $this->parse_number($before),
            'after' => $this->parse_number($after),
            'status' => $this->safe_string($entry, 'status'),
            'fee' => $fee,
            'info' => $entry,
        );
    }

    public function safe_currency_structure(array $currency) {
        return array_merge(array(
            'info' => null,
            'id' => null,
            'numericId' => null,
            'code' => null,
            'precision' => null,
            'type' => null,
            'name' => null,
            'active' => null,
            'deposit' => null,
            'withdraw' => null,
            'fee' => null,
            'fees' => array(),
            'networks' => array(),
            'limits' => array(
                'deposit' => array(
                    'min' => null,
                    'max' => null,
                ),
                'withdraw' => array(
                    'min' => null,
                    'max' => null,
                ),
            ),
        ), $currency);
    }

    public function set_markets($markets, $currencies = null) {
        $values = array();
        $this->markets_by_id = array();
        // handle marketId conflicts
        // we insert spot $markets first
        $marketValues = $this->sort_by($this->to_array($markets), 'spot', true);
        for ($i = 0; $i < count($marketValues); $i++) {
            $value = $marketValues[$i];
            if (is_array($this->markets_by_id) && array_key_exists($value['id'], $this->markets_by_id)) {
                ($this->markets_by_id[$value['id']])[] = $value;
            } else {
                $this->markets_by_id[$value['id']] = array( $value );
            }
            $market = $this->deep_extend($this->safe_market(), array(
                'precision' => $this->precision,
                'limits' => $this->limits,
            ), $this->fees['trading'], $value);
            $values[] = $market;
        }
        $this->markets = $this->index_by($values, 'symbol');
        $marketsSortedBySymbol = $this->keysort ($this->markets);
        $marketsSortedById = $this->keysort ($this->markets_by_id);
        $this->symbols = is_array($marketsSortedBySymbol) ? array_keys($marketsSortedBySymbol) : array();
        $this->ids = is_array($marketsSortedById) ? array_keys($marketsSortedById) : array();
        if ($currencies !== null) {
            // $currencies is always null when called in constructor but not when called from loadMarkets
            $this->currencies = $this->deep_extend($this->currencies, $currencies);
        } else {
            $baseCurrencies = array();
            $quoteCurrencies = array();
            for ($i = 0; $i < count($values); $i++) {
                $market = $values[$i];
                $defaultCurrencyPrecision = ($this->precisionMode === DECIMAL_PLACES) ? 8 : $this->parse_number('1e-8');
                $marketPrecision = $this->safe_value($market, 'precision', array());
                if (is_array($market) && array_key_exists('base', $market)) {
                    $currency = $this->safe_currency_structure(array(
                        'id' => $this->safe_string_2($market, 'baseId', 'base'),
                        'numericId' => $this->safe_integer($market, 'baseNumericId'),
                        'code' => $this->safe_string($market, 'base'),
                        'precision' => $this->safe_value_2($marketPrecision, 'base', 'amount', $defaultCurrencyPrecision),
                    ));
                    $baseCurrencies[] = $currency;
                }
                if (is_array($market) && array_key_exists('quote', $market)) {
                    $currency = $this->safe_currency_structure(array(
                        'id' => $this->safe_string_2($market, 'quoteId', 'quote'),
                        'numericId' => $this->safe_integer($market, 'quoteNumericId'),
                        'code' => $this->safe_string($market, 'quote'),
                        'precision' => $this->safe_value_2($marketPrecision, 'quote', 'price', $defaultCurrencyPrecision),
                    ));
                    $quoteCurrencies[] = $currency;
                }
            }
            $baseCurrencies = $this->sort_by($baseCurrencies, 'code');
            $quoteCurrencies = $this->sort_by($quoteCurrencies, 'code');
            $this->baseCurrencies = $this->index_by($baseCurrencies, 'code');
            $this->quoteCurrencies = $this->index_by($quoteCurrencies, 'code');
            $allCurrencies = $this->array_concat($baseCurrencies, $quoteCurrencies);
            $groupedCurrencies = $this->group_by($allCurrencies, 'code');
            $codes = is_array($groupedCurrencies) ? array_keys($groupedCurrencies) : array();
            $resultingCurrencies = array();
            for ($i = 0; $i < count($codes); $i++) {
                $code = $codes[$i];
                $groupedCurrenciesCode = $this->safe_value($groupedCurrencies, $code, array());
                $highestPrecisionCurrency = $this->safe_value($groupedCurrenciesCode, 0);
                for ($j = 1; $j < count($groupedCurrenciesCode); $j++) {
                    $currentCurrency = $groupedCurrenciesCode[$j];
                    if ($this->precisionMode === TICK_SIZE) {
                        $highestPrecisionCurrency = ($currentCurrency['precision'] < $highestPrecisionCurrency['precision']) ? $currentCurrency : $highestPrecisionCurrency;
                    } else {
                        $highestPrecisionCurrency = ($currentCurrency['precision'] > $highestPrecisionCurrency['precision']) ? $currentCurrency : $highestPrecisionCurrency;
                    }
                }
                $resultingCurrencies[] = $highestPrecisionCurrency;
            }
            $sortedCurrencies = $this->sort_by($resultingCurrencies, 'code');
            $this->currencies = $this->deep_extend($this->currencies, $this->index_by($sortedCurrencies, 'code'));
        }
        $this->currencies_by_id = $this->index_by($this->currencies, 'id');
        $currenciesSortedByCode = $this->keysort ($this->currencies);
        $this->codes = is_array($currenciesSortedByCode) ? array_keys($currenciesSortedByCode) : array();
        return $this->markets;
    }

    public function safe_balance(array $balance) {
        $balances = $this->omit ($balance, array( 'info', 'timestamp', 'datetime', 'free', 'used', 'total' ));
        $codes = is_array($balances) ? array_keys($balances) : array();
        $balance['free'] = array();
        $balance['used'] = array();
        $balance['total'] = array();
        $debtBalance = array();
        for ($i = 0; $i < count($codes); $i++) {
            $code = $codes[$i];
            $total = $this->safe_string($balance[$code], 'total');
            $free = $this->safe_string($balance[$code], 'free');
            $used = $this->safe_string($balance[$code], 'used');
            $debt = $this->safe_string($balance[$code], 'debt');
            if (($total === null) && ($free !== null) && ($used !== null)) {
                $total = Precise::string_add($free, $used);
            }
            if (($free === null) && ($total !== null) && ($used !== null)) {
                $free = Precise::string_sub($total, $used);
            }
            if (($used === null) && ($total !== null) && ($free !== null)) {
                $used = Precise::string_sub($total, $free);
            }
            $balance[$code]['free'] = $this->parse_number($free);
            $balance[$code]['used'] = $this->parse_number($used);
            $balance[$code]['total'] = $this->parse_number($total);
            $balance['free'][$code] = $balance[$code]['free'];
            $balance['used'][$code] = $balance[$code]['used'];
            $balance['total'][$code] = $balance[$code]['total'];
            if ($debt !== null) {
                $balance[$code]['debt'] = $this->parse_number($debt);
                $debtBalance[$code] = $balance[$code]['debt'];
            }
        }
        $debtBalanceArray = is_array($debtBalance) ? array_keys($debtBalance) : array();
        $length = count($debtBalanceArray);
        if ($length) {
            $balance['debt'] = $debtBalance;
        }
        return $balance;
    }

    public function safe_order(array $order, ?array $market = null) {
        // parses numbers
        // * it is important pass the $trades $rawTrades
        $amount = $this->omit_zero($this->safe_string($order, 'amount'));
        $remaining = $this->safe_string($order, 'remaining');
        $filled = $this->safe_string($order, 'filled');
        $cost = $this->safe_string($order, 'cost');
        $average = $this->omit_zero($this->safe_string($order, 'average'));
        $price = $this->omit_zero($this->safe_string($order, 'price'));
        $lastTradeTimeTimestamp = $this->safe_integer($order, 'lastTradeTimestamp');
        $symbol = $this->safe_string($order, 'symbol');
        $side = $this->safe_string($order, 'side');
        $parseFilled = ($filled === null);
        $parseCost = ($cost === null);
        $parseLastTradeTimeTimestamp = ($lastTradeTimeTimestamp === null);
        $fee = $this->safe_value($order, 'fee');
        $parseFee = ($fee === null);
        $parseFees = $this->safe_value($order, 'fees') === null;
        $parseSymbol = $symbol === null;
        $parseSide = $side === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = $this->safe_value($order, 'fees', array());
        $trades = array();
        if ($parseFilled || $parseCost || $shouldParseFees) {
            $rawTrades = $this->safe_value($order, 'trades', $trades);
            $oldNumber = $this->number;
            // we parse $trades here!
            $this->number = 'strval';
            $trades = $this->parse_trades($rawTrades, $market);
            $this->number = $oldNumber;
            $tradesLength = 0;
            $isArray = gettype($trades) === 'array' && array_keys($trades) === array_keys(array_keys($trades));
            if ($isArray) {
                $tradesLength = count($trades);
            }
            if ($isArray && ($tradesLength > 0)) {
                // move properties that are defined in $trades up into the $order
                if ($order['symbol'] === null) {
                    $order['symbol'] = $trades[0]['symbol'];
                }
                if ($order['side'] === null) {
                    $order['side'] = $trades[0]['side'];
                }
                if ($order['type'] === null) {
                    $order['type'] = $trades[0]['type'];
                }
                if ($order['id'] === null) {
                    $order['id'] = $trades[0]['order'];
                }
                if ($parseFilled) {
                    $filled = '0';
                }
                if ($parseCost) {
                    $cost = '0';
                }
                for ($i = 0; $i < count($trades); $i++) {
                    $trade = $trades[$i];
                    $tradeAmount = $this->safe_string($trade, 'amount');
                    if ($parseFilled && ($tradeAmount !== null)) {
                        $filled = Precise::string_add($filled, $tradeAmount);
                    }
                    $tradeCost = $this->safe_string($trade, 'cost');
                    if ($parseCost && ($tradeCost !== null)) {
                        $cost = Precise::string_add($cost, $tradeCost);
                    }
                    if ($parseSymbol) {
                        $symbol = $this->safe_string($trade, 'symbol');
                    }
                    if ($parseSide) {
                        $side = $this->safe_string($trade, 'side');
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
            $reducedLength = count($reducedFees);
            for ($i = 0; $i < $reducedLength; $i++) {
                $reducedFees[$i]['cost'] = $this->safe_number($reducedFees[$i], 'cost');
                if (is_array($reducedFees[$i]) && array_key_exists('rate', $reducedFees[$i])) {
                    $reducedFees[$i]['rate'] = $this->safe_number($reducedFees[$i], 'rate');
                }
            }
            if (!$parseFee && ($reducedLength === 0)) {
                $fee['cost'] = $this->safe_number($fee, 'cost');
                if (is_array($fee) && array_key_exists('rate', $fee)) {
                    $fee['rate'] = $this->safe_number($fee, 'rate');
                }
                $reducedFees[] = $fee;
            }
            $order['fees'] = $reducedFees;
            if ($parseFee && ($reducedLength === 1)) {
                $order['fee'] = $reducedFees[0];
            }
        }
        if ($amount === null) {
            // ensure $amount = $filled . $remaining
            if ($filled !== null && $remaining !== null) {
                $amount = Precise::string_add($filled, $remaining);
            } elseif ($this->safe_string($order, 'status') === 'closed') {
                $amount = $filled;
            }
        }
        if ($filled === null) {
            if ($amount !== null && $remaining !== null) {
                $filled = Precise::string_sub($amount, $remaining);
            }
        }
        if ($remaining === null) {
            if ($amount !== null && $filled !== null) {
                $remaining = Precise::string_sub($amount, $filled);
            }
        }
        // ensure that the $average field is calculated correctly
        $inverse = $this->safe_value($market, 'inverse', false);
        $contractSize = $this->number_to_string($this->safe_value($market, 'contractSize', 1));
        // $inverse
        // $price = $filled * contract size / $cost
        //
        // linear
        // $price = $cost / ($filled * contract size)
        if ($average === null) {
            if (($filled !== null) && ($cost !== null) && Precise::string_gt($filled, '0')) {
                $filledTimesContractSize = Precise::string_mul($filled, $contractSize);
                if ($inverse) {
                    $average = Precise::string_div($filledTimesContractSize, $cost);
                } else {
                    $average = Precise::string_div($cost, $filledTimesContractSize);
                }
            }
        }
        // similarly
        // $inverse
        // $cost = $filled * contract size / $price
        //
        // linear
        // $cost = $filled * contract size * $price
        $costPriceExists = ($average !== null) || ($price !== null);
        if ($parseCost && ($filled !== null) && $costPriceExists) {
            $multiplyPrice = null;
            if ($average === null) {
                $multiplyPrice = $price;
            } else {
                $multiplyPrice = $average;
            }
            // contract trading
            $filledTimesContractSize = Precise::string_mul($filled, $contractSize);
            if ($inverse) {
                $cost = Precise::string_div($filledTimesContractSize, $multiplyPrice);
            } else {
                $cost = Precise::string_mul($filledTimesContractSize, $multiplyPrice);
            }
        }
        // support for $market orders
        $orderType = $this->safe_value($order, 'type');
        $emptyPrice = ($price === null) || Precise::string_equals($price, '0');
        if ($emptyPrice && ($orderType === 'market')) {
            $price = $average;
        }
        // we have $trades with string values at this point so we will mutate them
        for ($i = 0; $i < count($trades); $i++) {
            $entry = $trades[$i];
            $entry['amount'] = $this->safe_number($entry, 'amount');
            $entry['price'] = $this->safe_number($entry, 'price');
            $entry['cost'] = $this->safe_number($entry, 'cost');
            $fee = $this->safe_value($entry, 'fee', array());
            $fee['cost'] = $this->safe_number($fee, 'cost');
            if (is_array($fee) && array_key_exists('rate', $fee)) {
                $fee['rate'] = $this->safe_number($fee, 'rate');
            }
            $entry['fee'] = $fee;
        }
        $timeInForce = $this->safe_string($order, 'timeInForce');
        $postOnly = $this->safe_value($order, 'postOnly');
        // timeInForceHandling
        if ($timeInForce === null) {
            if ($this->safe_string($order, 'type') === 'market') {
                $timeInForce = 'IOC';
            }
            // allow $postOnly override
            if ($postOnly) {
                $timeInForce = 'PO';
            }
        } elseif ($postOnly === null) {
            // $timeInForce is not null here
            $postOnly = $timeInForce === 'PO';
        }
        $timestamp = $this->safe_integer($order, 'timestamp');
        $datetime = $this->safe_string($order, 'datetime');
        if ($datetime === null) {
            $datetime = $this->iso8601 ($timestamp);
        }
        $triggerPrice = $this->parse_number($this->safe_string_2($order, 'triggerPrice', 'stopPrice'));
        return array_merge($order, array(
            'amount' => $this->parse_number($amount),
            'average' => $this->parse_number($average),
            'clientOrderId' => $this->safe_string($order, 'clientOrderId'),
            'cost' => $this->parse_number($cost),
            'datetime' => $datetime,
            'fee' => $this->safe_value($order, 'fee'),
            'filled' => $this->parse_number($filled),
            'id' => $this->safe_string($order, 'id'),
            'lastTradeTimestamp' => $lastTradeTimeTimestamp,
            'postOnly' => $postOnly,
            'price' => $this->parse_number($price),
            'reduceOnly' => $this->safe_value($order, 'reduceOnly'),
            'remaining' => $this->parse_number($remaining),
            'side' => $side,
            'status' => $this->safe_string($order, 'status'),
            'stopPrice' => $triggerPrice, // ! deprecated, use $triggerPrice instead
            'symbol' => $symbol,
            'timeInForce' => $timeInForce,
            'timestamp' => $timestamp,
            'trades' => $trades,
            'triggerPrice' => $triggerPrice,
            'type' => $this->safe_string($order, 'type'),
        ));
    }

    public function parse_orders(array $orders, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        //
        // the value of $orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1' => array( ... ),
        //         'id2' => array( ... ),
        //         'id3' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'id' => 'id1', ... ),
        //         array( 'id' => 'id2', ... ),
        //         array( 'id' => 'id3', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($orders) === 'array' && array_keys($orders) === array_keys(array_keys($orders))) {
            for ($i = 0; $i < count($orders); $i++) {
                $order = array_merge($this->parse_order($orders[$i], $market), $params);
                $results[] = $order;
            }
        } else {
            $ids = is_array($orders) ? array_keys($orders) : array();
            for ($i = 0; $i < count($ids); $i++) {
                $id = $ids[$i];
                $order = array_merge($this->parse_order(array_merge(array( 'id' => $id ), $orders[$id]), $market), $params);
                $results[] = $order;
            }
        }
        $results = $this->sort_by($results, 'timestamp');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($results, $symbol, $since, $limit);
    }

    public function calculate_fee(string $symbol, string $type, string $side, float $amount, float $price, $takerOrMaker = 'taker', $params = array ()) {
        if ($type === 'market' && $takerOrMaker === 'maker') {
            throw new ArgumentsRequired($this->id . ' calculateFee() - you have provided incompatible arguments - "market" $type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.');
        }
        $market = $this->markets[$symbol];
        $feeSide = $this->safe_string($market, 'feeSide', 'quote');
        $useQuote = null;
        if ($feeSide === 'get') {
            // the fee is always in the currency you get
            $useQuote = $side === 'sell';
        } elseif ($feeSide === 'give') {
            // the fee is always in the currency you give
            $useQuote = $side === 'buy';
        } else {
            // the fee is always in $feeSide currency
            $useQuote = $feeSide === 'quote';
        }
        $cost = $this->number_to_string($amount);
        $key = null;
        if ($useQuote) {
            $priceString = $this->number_to_string($price);
            $cost = Precise::string_mul($cost, $priceString);
            $key = 'quote';
        } else {
            $key = 'base';
        }
        // for derivatives, the fee is in 'settle' currency
        if (!$market['spot']) {
            $key = 'settle';
        }
        // even if `$takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if ($type === 'market') {
            $takerOrMaker = 'taker';
        }
        $rate = $this->safe_string($market, $takerOrMaker);
        $cost = Precise::string_mul($cost, $rate);
        return array(
            'cost' => $this->parse_number($cost),
            'currency' => $market[$key],
            'rate' => $this->parse_number($rate),
            'type' => $takerOrMaker,
        );
    }

    public function safe_trade(array $trade, ?array $market = null) {
        $amount = $this->safe_string($trade, 'amount');
        $price = $this->safe_string($trade, 'price');
        $cost = $this->safe_string($trade, 'cost');
        if ($cost === null) {
            // contract trading
            $contractSize = $this->safe_string($market, 'contractSize');
            $multiplyPrice = $price;
            if ($contractSize !== null) {
                $inverse = $this->safe_value($market, 'inverse', false);
                if ($inverse) {
                    $multiplyPrice = Precise::string_div('1', $price);
                }
                $multiplyPrice = Precise::string_mul($multiplyPrice, $contractSize);
            }
            $cost = Precise::string_mul($multiplyPrice, $amount);
        }
        $parseFee = $this->safe_value($trade, 'fee') === null;
        $parseFees = $this->safe_value($trade, 'fees') === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = array();
        $fee = $this->safe_value($trade, 'fee');
        if ($shouldParseFees) {
            $reducedFees = $this->reduceFees ? $this->reduce_fees_by_currency($fees) : $fees;
            $reducedLength = count($reducedFees);
            for ($i = 0; $i < $reducedLength; $i++) {
                $reducedFees[$i]['cost'] = $this->safe_number($reducedFees[$i], 'cost');
                if (is_array($reducedFees[$i]) && array_key_exists('rate', $reducedFees[$i])) {
                    $reducedFees[$i]['rate'] = $this->safe_number($reducedFees[$i], 'rate');
                }
            }
            if (!$parseFee && ($reducedLength === 0)) {
                $fee['cost'] = $this->safe_number($fee, 'cost');
                if (is_array($fee) && array_key_exists('rate', $fee)) {
                    $fee['rate'] = $this->safe_number($fee, 'rate');
                }
                $reducedFees[] = $fee;
            }
            if ($parseFees) {
                $trade['fees'] = $reducedFees;
            }
            if ($parseFee && ($reducedLength === 1)) {
                $trade['fee'] = $reducedFees[0];
            }
            $tradeFee = $this->safe_value($trade, 'fee');
            if ($tradeFee !== null) {
                $tradeFee['cost'] = $this->safe_number($tradeFee, 'cost');
                if (is_array($tradeFee) && array_key_exists('rate', $tradeFee)) {
                    $tradeFee['rate'] = $this->safe_number($tradeFee, 'rate');
                }
                $trade['fee'] = $tradeFee;
            }
        }
        $trade['amount'] = $this->parse_number($amount);
        $trade['cost'] = $this->parse_number($cost);
        $trade['price'] = $this->parse_number($price);
        return $trade;
    }

    public function reduce_fees_by_currency($fees) {
        //
        // this function takes a list of $fee structures having the following format
        //
        //     string = true
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => '0.1' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.2'  ),
        //         array( 'currency' => 'BTC', 'cost' => '0.2', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.4', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.5', 'rate' => '0.00456' ),
        //         array( 'currency' => 'USDT', 'cost' => '12.3456' ),
        //     )
        //
        //     string = false
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => 0.1 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.2 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.2, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.4, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.5, 'rate' => 0.00456 ),
        //         array( 'currency' => 'USDT', 'cost' => 12.3456 ),
        //     )
        //
        // and returns a $reduced $fee list, where $fees are summed per currency and $rate (if any)
        //
        //     string = true
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => '0.3'  ),
        //         array( 'currency' => 'BTC', 'cost' => '0.6', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.5', 'rate' => '0.00456' ),
        //         array( 'currency' => 'USDT', 'cost' => '12.3456' ),
        //     )
        //
        //     string  = false
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => 0.3  ),
        //         array( 'currency' => 'BTC', 'cost' => 0.6, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.5, 'rate' => 0.00456 ),
        //         array( 'currency' => 'USDT', 'cost' => 12.3456 ),
        //     )
        //
        $reduced = array();
        for ($i = 0; $i < count($fees); $i++) {
            $fee = $fees[$i];
            $feeCurrencyCode = $this->safe_string($fee, 'currency');
            if ($feeCurrencyCode !== null) {
                $rate = $this->safe_string($fee, 'rate');
                $cost = $this->safe_value($fee, 'cost');
                if (Precise::string_eq($cost, '0')) {
                    // omit zero $cost $fees
                    continue;
                }
                if (!(is_array($reduced) && array_key_exists($feeCurrencyCode, $reduced))) {
                    $reduced[$feeCurrencyCode] = array();
                }
                $rateKey = ($rate === null) ? '' : $rate;
                if (is_array($reduced[$feeCurrencyCode]) && array_key_exists($rateKey, $reduced[$feeCurrencyCode])) {
                    $reduced[$feeCurrencyCode][$rateKey]['cost'] = Precise::string_add($reduced[$feeCurrencyCode][$rateKey]['cost'], $cost);
                } else {
                    $reduced[$feeCurrencyCode][$rateKey] = array(
                        'cost' => $cost,
                        'currency' => $feeCurrencyCode,
                    );
                    if ($rate !== null) {
                        $reduced[$feeCurrencyCode][$rateKey]['rate'] = $rate;
                    }
                }
            }
        }
        $result = array();
        $feeValues = is_array($reduced) ? array_values($reduced) : array();
        for ($i = 0; $i < count($feeValues); $i++) {
            $reducedFeeValues = is_array($feeValues[$i]) ? array_values($feeValues[$i]) : array();
            $result = $this->array_concat($result, $reducedFeeValues);
        }
        return $result;
    }

    public function safe_ticker(array $ticker, $market = null) {
        $open = $this->safe_value($ticker, 'open');
        $close = $this->safe_value($ticker, 'close');
        $last = $this->safe_value($ticker, 'last');
        $change = $this->safe_value($ticker, 'change');
        $percentage = $this->safe_value($ticker, 'percentage');
        $average = $this->safe_value($ticker, 'average');
        $vwap = $this->safe_value($ticker, 'vwap');
        $baseVolume = $this->safe_value($ticker, 'baseVolume');
        $quoteVolume = $this->safe_value($ticker, 'quoteVolume');
        if ($vwap === null) {
            $vwap = Precise::string_div($quoteVolume, $baseVolume);
        }
        if (($last !== null) && ($close === null)) {
            $close = $last;
        } elseif (($last === null) && ($close !== null)) {
            $last = $close;
        }
        if (($last !== null) && ($open !== null)) {
            if ($change === null) {
                $change = Precise::string_sub($last, $open);
            }
            if ($average === null) {
                $average = Precise::string_div(Precise::string_add($last, $open), '2');
            }
        }
        if (($percentage === null) && ($change !== null) && ($open !== null) && Precise::string_gt($open, '0')) {
            $percentage = Precise::string_mul(Precise::string_div($change, $open), '100');
        }
        if (($change === null) && ($percentage !== null) && ($open !== null)) {
            $change = Precise::string_div(Precise::string_mul($percentage, $open), '100');
        }
        if (($open === null) && ($last !== null) && ($change !== null)) {
            $open = Precise::string_sub($last, $change);
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        return array_merge($ticker, array(
            'ask' => $this->omit_zero($this->safe_number($ticker, 'ask')),
            'askVolume' => $this->safe_number($ticker, 'askVolume'),
            'average' => $this->omit_zero($this->parse_number($average)),
            'baseVolume' => $this->parse_number($baseVolume),
            'bid' => $this->omit_zero($this->safe_number($ticker, 'bid')),
            'bidVolume' => $this->safe_number($ticker, 'bidVolume'),
            'change' => $this->parse_number($change),
            'close' => $this->omit_zero($this->parse_number($close)),
            'high' => $this->omit_zero($this->safe_number($ticker, 'high')),
            'last' => $this->omit_zero($this->parse_number($last)),
            'low' => $this->omit_zero($this->safe_number($ticker, 'low')),
            'open' => $this->omit_zero($this->parse_number($open)),
            'percentage' => $this->parse_number($percentage),
            'previousClose' => $this->safe_number($ticker, 'previousClose'),
            'quoteVolume' => $this->parse_number($quoteVolume),
            'vwap' => $this->omit_zero($this->parse_number($vwap)),
        ));
    }

    public function fetch_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        if (!$this->has['fetchTrades']) {
            throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet');
        }
        $trades = $this->fetchTrades ($symbol, $since, $limit, $params);
        $ohlcvc = $this->build_ohlcvc($trades, $timeframe, $since, $limit);
        $result = array();
        for ($i = 0; $i < count($ohlcvc); $i++) {
            $result[] = [
                $this->safe_integer($ohlcvc[$i], 0),
                $this->safe_number($ohlcvc[$i], 1),
                $this->safe_number($ohlcvc[$i], 2),
                $this->safe_number($ohlcvc[$i], 3),
                $this->safe_number($ohlcvc[$i], 4),
                $this->safe_number($ohlcvc[$i], 5),
            ];
        }
        return $result;
    }

    public function watch_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOHLCV() is not supported yet');
    }

    public function convert_trading_view_to_ohlcv($ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $timestamps = $this->safe_value($ohlcvs, $timestamp, array());
        $opens = $this->safe_value($ohlcvs, $open, array());
        $highs = $this->safe_value($ohlcvs, $high, array());
        $lows = $this->safe_value($ohlcvs, $low, array());
        $closes = $this->safe_value($ohlcvs, $close, array());
        $volumes = $this->safe_value($ohlcvs, $volume, array());
        for ($i = 0; $i < count($timestamps); $i++) {
            $result[] = array(
                $ms ? $this->safe_integer($timestamps, $i) : $this->safe_timestamp($timestamps, $i),
                $this->safe_value($opens, $i),
                $this->safe_value($highs, $i),
                $this->safe_value($lows, $i),
                $this->safe_value($closes, $i),
                $this->safe_value($volumes, $i),
            );
        }
        return $result;
    }

    public function convert_ohlcv_to_trading_view($ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $result[$close] = array();
        $result[$high] = array();
        $result[$low] = array();
        $result[$open] = array();
        $result[$timestamp] = array();
        $result[$volume] = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $ts = $ms ? $ohlcvs[$i][0] : $this->parseToInt ($ohlcvs[$i][0] / 1000);
            $result[$timestamp][] = $ts;
            $result[$open][] = $ohlcvs[$i][1];
            $result[$high][] = $ohlcvs[$i][2];
            $result[$low][] = $ohlcvs[$i][3];
            $result[$close][] = $ohlcvs[$i][4];
            $result[$volume][] = $ohlcvs[$i][5];
        }
        return $result;
    }

    public function market_ids($symbols) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $result[] = $this->market_id($symbols[$i]);
        }
        return $result;
    }

    public function market_symbols($symbols, ?string $type = null) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $market = $this->market ($symbols[$i]);
            if ($type !== null && $market['type'] !== $type) {
                throw new BadRequest($this->id . ' $symbols must be of same $type ' . $type . '. If the $type is incorrect you can change it in options or the params of the request');
            }
            $symbol = $this->safe_string($market, 'symbol', $symbols[$i]);
            $result[] = $symbol;
        }
        return $result;
    }

    public function market_codes($codes) {
        if ($codes === null) {
            return $codes;
        }
        $result = array();
        for ($i = 0; $i < count($codes); $i++) {
            $result[] = $this->common_currency_code($codes[$i]);
        }
        return $result;
    }

    public function parse_bids_asks($bidasks, int|string $priceKey = 0, int|string $amountKey = 1) {
        $bidasks = $this->to_array($bidasks);
        $result = array();
        for ($i = 0; $i < count($bidasks); $i++) {
            $result[] = $this->parse_bid_ask($bidasks[$i], $priceKey, $amountKey);
        }
        return $result;
    }

    public function fetch_l2_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        $orderbook = $this->fetch_order_book($symbol, $limit, $params);
        return array_merge($orderbook, array(
            'asks' => $this->sort_by($this->aggregate ($orderbook['asks']), 0),
            'bids' => $this->sort_by($this->aggregate ($orderbook['bids']), 0, true),
        ));
    }

    public function filter_by_symbol($objects, ?string $symbol = null) {
        if ($symbol === null) {
            return $objects;
        }
        $result = array();
        for ($i = 0; $i < count($objects); $i++) {
            $objectSymbol = $this->safe_string($objects[$i], 'symbol');
            if ($objectSymbol === $symbol) {
                $result[] = $objects[$i];
            }
        }
        return $result;
    }

    public function parse_ohlcv($ohlcv, $market = null) {
        if (gettype($ohlcv) === 'array' && array_keys($ohlcv) === array_keys(array_keys($ohlcv))) {
            return array(
                $this->safe_integer($ohlcv, 0), // timestamp
                $this->safe_number($ohlcv, 1), // open
                $this->safe_number($ohlcv, 2), // high
                $this->safe_number($ohlcv, 3), // low
                $this->safe_number($ohlcv, 4), // close
                $this->safe_number($ohlcv, 5), // volume
            );
        }
        return $ohlcv;
    }

    public function get_network(string $network, string $code) {
        $network = strtoupper($network);
        $aliases = array(
            'AVALANCHE' => 'AVAX',
            'AVAX' => 'AVAX',
            'BEP20' => 'BSC',
            'BSC' => 'BSC',
            'CHZ' => 'CHZ',
            'EOS' => 'EOS',
            'ERC20' => 'ETH',
            'ETH' => 'ETH',
            'ETHER' => 'ETH',
            'ETHEREUM' => 'ETH',
            'HECO' => 'HT',
            'HRC20' => 'HT',
            'LUNA' => 'LUNA',
            'MATIC' => 'MATIC',
            'NEO' => 'NEO',
            'ONT' => 'ONT',
            'POLYGON' => 'MATIC',
            'QTUM' => 'QTUM',
            'RON' => 'RON',
            'SOL' => 'SOL',
            'SPL' => 'SOL',
            'TERRA' => 'LUNA',
            'TRC20' => 'TRX',
            'TRON' => 'TRX',
            'TRX' => 'TRX',
            'WAVES' => 'WAVES',
        );
        if ($network === $code) {
            return $network;
        } elseif (is_array($aliases) && array_key_exists($network, $aliases)) {
            return $aliases[$network];
        } else {
            throw new NotSupported($this->id . ' $network ' . $network . ' is not yet supported');
        }
    }

    public function network_code_to_id($networkCode, $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided $networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} $networkCode unified network code
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {[string|null]} exchange-specific network id
         */
        $networkIdsByCodes = $this->safe_value($this->options, 'networks', array());
        $networkId = $this->safe_string($networkIdsByCodes, $networkCode);
        // for example, if 'ETH' is passed for $networkCode, but 'ETH' $key not defined in `options->networks` object
        if ($networkId === null) {
            if ($currencyCode === null) {
                // if $currencyCode was not provided, then we just set passed $value to $networkId
                $networkId = $networkCode;
            } else {
                // if $currencyCode was provided, then we try to find if that $currencyCode has a replacement ($i->e. ERC20 for ETH)
                $defaultNetworkCodeReplacements = $this->safe_value($this->options, 'defaultNetworkCodeReplacements', array());
                if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                    // if there is a replacement for the passed $networkCode, then we use it to find network-id in `options->networks` object
                    $replacementObject = $defaultNetworkCodeReplacements[$currencyCode]; // $i->e. array( 'ERC20' => 'ETH' )
                    $keys = is_array($replacementObject) ? array_keys($replacementObject) : array();
                    for ($i = 0; $i < count($keys); $i++) {
                        $key = $keys[$i];
                        $value = $replacementObject[$key];
                        // if $value matches to provided unified $networkCode, then we use it's $key to find network-id in `options->networks` object
                        if ($value === $networkCode) {
                            $networkId = $this->safe_string($networkIdsByCodes, $key);
                            break;
                        }
                    }
                }
                // if it wasn't found, we just set the provided $value to network-id
                if ($networkId === null) {
                    $networkId = $networkCode;
                }
            }
        }
        return $networkId;
    }

    public function network_id_to_code($networkId, $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided exchange-specific $networkId to an unified network Code. In order to achieve this, derived class needs to have 'options->networksById' defined.
         * @param {string} $networkId unified network code
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {[string|null]} unified network code
         */
        $networkCodesByIds = $this->safe_value($this->options, 'networksById', array());
        $networkCode = $this->safe_string($networkCodesByIds, $networkId, $networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if ($currencyCode !== null) {
            $defaultNetworkCodeReplacements = $this->safe_value($this->options, 'defaultNetworkCodeReplacements', array());
            if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                $replacementObject = $this->safe_value($defaultNetworkCodeReplacements, $currencyCode, array());
                $networkCode = $this->safe_string($replacementObject, $networkCode, $networkCode);
            }
        }
        return $networkCode;
    }

    public function handle_network_code_and_params($params) {
        $networkCodeInParams = $this->safe_string_2($params, 'networkCode', 'network');
        if ($networkCodeInParams !== null) {
            $params = $this->omit ($params, array( 'networkCode', 'network' ));
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return array( $networkCodeInParams, $params );
    }

    public function default_network_code($currencyCode) {
        $defaultNetworkCode = null;
        $defaultNetworks = $this->safe_value($this->options, 'defaultNetworks', array());
        if (is_array($defaultNetworks) && array_key_exists($currencyCode, $defaultNetworks)) {
            // if currency had set its network in "defaultNetworks", use it
            $defaultNetworkCode = $defaultNetworks[$currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            $defaultNetwork = $this->safe_value($this->options, 'defaultNetwork');
            if ($defaultNetwork !== null) {
                $defaultNetworkCode = $defaultNetwork;
            }
        }
        return $defaultNetworkCode;
    }

    public function select_network_code_from_unified_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->selectNetworkKeyFromNetworks ($currencyCode, $networkCode, $indexedNetworkEntries, true);
    }

    public function select_network_id_from_raw_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->selectNetworkKeyFromNetworks ($currencyCode, $networkCode, $indexedNetworkEntries, false);
    }

    public function select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, $isIndexedByUnifiedNetworkCode = false) {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        $chosenNetworkId = null;
        $availableNetworkIds = is_array($indexedNetworkEntries) ? array_keys($indexedNetworkEntries) : array();
        $responseNetworksLength = count($availableNetworkIds);
        if ($networkCode !== null) {
            if ($responseNetworksLength === 0) {
                throw new NotSupported($this->id . ' - ' . $networkCode . ' network did not return any result for ' . $currencyCode);
            } else {
                // if $networkCode was provided by user, we should check it after response, referenced exchange doesn't support network-code during request
                $networkId = $isIndexedByUnifiedNetworkCode ? $networkCode : $this->networkCodeToId ($networkCode, $currencyCode);
                if (is_array($indexedNetworkEntries) && array_key_exists($networkId, $indexedNetworkEntries)) {
                    $chosenNetworkId = $networkId;
                } else {
                    throw new NotSupported($this->id . ' - ' . $networkId . ' network was not found for ' . $currencyCode . ', use one of ' . implode(', ', $availableNetworkIds));
                }
            }
        } else {
            if ($responseNetworksLength === 0) {
                throw new NotSupported($this->id . ' - no networks were returned for ' . $currencyCode);
            } else {
                // if $networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                $defaultNetworkCode = $this->defaultNetworkCode ($currencyCode);
                $defaultNetworkId = $isIndexedByUnifiedNetworkCode ? $defaultNetworkCode : $this->networkCodeToId ($defaultNetworkCode, $currencyCode);
                $chosenNetworkId = (is_array($indexedNetworkEntries) && array_key_exists($defaultNetworkId, $indexedNetworkEntries)) ? $defaultNetworkId : $availableNetworkIds[0];
            }
        }
        return $chosenNetworkId;
    }

    public function safe_number_2($dictionary, $key1, $key2, $d = null) {
        $value = $this->safe_string_2($dictionary, $key1, $key2);
        return $this->parse_number($value, $d);
    }

    public function parse_order_book(array $orderbook, string $symbol, ?float $timestamp = null, $bidsKey = 'bids', $asksKey = 'asks', int|string $priceKey = 0, int|string $amountKey = 1) {
        $bids = $this->parse_bids_asks($this->safe_value($orderbook, $bidsKey, array()), $priceKey, $amountKey);
        $asks = $this->parse_bids_asks($this->safe_value($orderbook, $asksKey, array()), $priceKey, $amountKey);
        return array(
            'asks' => $this->sort_by($asks, 0),
            'bids' => $this->sort_by($bids, 0, true),
            'datetime' => $this->iso8601 ($timestamp),
            'nonce' => null,
            'symbol' => $symbol,
            'timestamp' => $timestamp,
        );
    }

    public function parse_ohlcvs(mixed $ohlcvs, mixed $market = null, string $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($results, 0);
        return $this->filter_by_since_limit($sorted, $since, $limit, 0);
    }

    public function parse_leverage_tiers($response, ?array $symbols = null, $marketIdKey = null) {
        // $marketIdKey should only be null when $response is a dictionary
        $symbols = $this->market_symbols($symbols);
        $tiers = array();
        for ($i = 0; $i < count($response); $i++) {
            $item = $response[$i];
            $id = $this->safe_string($item, $marketIdKey);
            $market = $this->safe_market($id, null, null, $this->safe_string($this->options, 'defaultType'));
            $symbol = $market['symbol'];
            $contract = $this->safe_value($market, 'contract', false);
            if ($contract && (($symbols === null) || $this->in_array($symbol, $symbols))) {
                $tiers[$symbol] = $this->parse_market_leverage_tiers($item, $market);
            }
        }
        return $tiers;
    }

    public function load_trading_limits(?array $symbols = null, $reload = false, $params = array ()) {
        if ($this->has['fetchTradingLimits']) {
            if ($reload || !(is_array($this->options) && array_key_exists('limitsLoaded', $this->options))) {
                $response = $this->fetch_trading_limits($symbols);
                for ($i = 0; $i < count($symbols); $i++) {
                    $symbol = $symbols[$i];
                    $this->markets[$symbol] = $this->deep_extend($this->markets[$symbol], $response[$symbol]);
                }
                $this->options['limitsLoaded'] = $this->milliseconds ();
            }
        }
        return $this->markets;
    }

    public function safe_position($position) {
        // simplified version of => /pull/12765/
        $unrealizedPnlString = $this->safe_string($position, 'unrealisedPnl');
        $initialMarginString = $this->safe_string($position, 'initialMargin');
        //
        // PERCENTAGE
        //
        $percentage = $this->safe_value($position, 'percentage');
        if (($percentage === null) && ($unrealizedPnlString !== null) && ($initialMarginString !== null)) {
            // was done in all implementations ( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            $percentageString = Precise::string_mul(Precise::string_div($unrealizedPnlString, $initialMarginString, 4), '100');
            $position['percentage'] = $this->parse_number($percentageString);
        }
        return $position;
    }

    public function parse_positions($positions, ?array $symbols = null, $params = array ()) {
        $symbols = $this->market_symbols($symbols);
        $positions = $this->to_array($positions);
        $result = array();
        for ($i = 0; $i < count($positions); $i++) {
            $position = array_merge($this->parse_position($positions[$i], null), $params);
            $result[] = $position;
        }
        return $this->filter_by_array($result, 'symbol', $symbols, false);
    }

    public function parse_accounts($accounts, $params = array ()) {
        $accounts = $this->to_array($accounts);
        $result = array();
        for ($i = 0; $i < count($accounts); $i++) {
            $account = array_merge($this->parse_account($accounts[$i]), $params);
            $result[] = $account;
        }
        return $result;
    }

    public function parse_trades($trades, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $trades = $this->to_array($trades);
        $result = array();
        for ($i = 0; $i < count($trades); $i++) {
            $trade = array_merge($this->parse_trade($trades[$i], $market), $params);
            $result[] = $trade;
        }
        $result = $this->sort_by_2($result, 'timestamp', 'id');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit);
    }

    public function parse_transactions($transactions, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transactions = $this->to_array($transactions);
        $result = array();
        for ($i = 0; $i < count($transactions); $i++) {
            $transaction = array_merge($this->parse_transaction($transactions[$i], $currency), $params);
            $result[] = $transaction;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parse_transfers($transfers, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transfers = $this->to_array($transfers);
        $result = array();
        for ($i = 0; $i < count($transfers); $i++) {
            $transfer = array_merge($this->parse_transfer($transfers[$i], $currency), $params);
            $result[] = $transfer;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parse_ledger($data, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $result = array();
        $arrayData = $this->to_array($data);
        for ($i = 0; $i < count($arrayData); $i++) {
            $itemOrItems = $this->parse_ledger_entry($arrayData[$i], $currency);
            if (gettype($itemOrItems) === 'array' && array_keys($itemOrItems) === array_keys(array_keys($itemOrItems))) {
                for ($j = 0; $j < count($itemOrItems); $j++) {
                    $result[] = array_merge($itemOrItems[$j], $params);
                }
            } else {
                $result[] = array_merge($itemOrItems, $params);
            }
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function nonce() {
        return $this->seconds ();
    }

    public function set_headers($headers) {
        return $headers;
    }

    public function market_id(string $symbol) {
        $market = $this->market ($symbol);
        if ($market !== null) {
            return $market['id'];
        }
        return $symbol;
    }

    public function symbol(string $symbol) {
        $market = $this->market ($symbol);
        return $this->safe_string($market, 'symbol', $symbol);
    }

    public function resolve_path($path, $params) {
        return array(
            $this->implode_params($path, $params),
            $this->omit ($params, $this->extract_params($path)),
        );
    }

    public function filter_by_array($objects, int|string $key, $values = null, $indexed = true) {
        $objects = $this->to_array($objects);
        // return all of them if no $values were passed
        if ($values === null || !$values) {
            return $indexed ? $this->index_by($objects, $key) : $objects;
        }
        $results = array();
        for ($i = 0; $i < count($objects); $i++) {
            if ($this->in_array($objects[$i][$key], $values)) {
                $results[] = $objects[$i];
            }
        }
        return $indexed ? $this->index_by($results, $key) : $results;
    }

    public function fetch2($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        if ($this->enableRateLimit) {
            $cost = $this->calculate_rate_limiter_cost($api, $method, $path, $params, $config);
            $this->throttle ($cost);
        }
        $this->lastRestRequestTimestamp = $this->milliseconds ();
        $request = $this->sign ($path, $api, $method, $params, $headers, $body);
        return $this->fetch ($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function request($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        return $this->fetch2 ($path, $api, $method, $params, $headers, $body, $config);
    }

    public function load_accounts($reload = false, $params = array ()) {
        if ($reload) {
            $this->accounts = $this->fetch_accounts($params);
        } else {
            if ($this->accounts) {
                return $this->accounts;
            } else {
                $this->accounts = $this->fetch_accounts($params);
            }
        }
        $this->accountsById = $this->index_by($this->accounts, 'id');
        return $this->accounts;
    }

    public function build_ohlcvc(array $trades, string $timeframe = '1m', float $since = 0, float $limit = 2147483647) {
        // given a sorted arrays of $trades (recent last) and a $timeframe builds an array of OHLCV candles
        // note, default $limit value (2147483647) is max int32 value
        $ms = $this->parse_timeframe($timeframe) * 1000;
        $ohlcvs = array();
        $i_timestamp = 0;
        // $open = 1;
        $i_high = 2;
        $i_low = 3;
        $i_close = 4;
        $i_volume = 5;
        $i_count = 6;
        $tradesLength = count($trades);
        $oldest = min ($tradesLength, $limit);
        for ($i = 0; $i < $oldest; $i++) {
            $trade = $trades[$i];
            $ts = $trade['timestamp'];
            if ($ts < $since) {
                continue;
            }
            $openingTime = (int) floor($ts / $ms) * $ms; // shift to the edge of m/h/d (but not M)
            if ($openingTime < $since) { // we don't need bars, that have opening time earlier than requested
                continue;
            }
            $ohlcv_length = count($ohlcvs);
            $candle = $ohlcv_length - 1;
            if (($candle === -1) || ($openingTime >= $this->sum ($ohlcvs[$candle][$i_timestamp], $ms))) {
                // moved to a new $timeframe -> create a new $candle from opening $trade
                $ohlcvs[] = [
                    $openingTime, // timestamp
                    $trade['price'], // O
                    $trade['price'], // H
                    $trade['price'], // L
                    $trade['price'], // C
                    $trade['amount'], // V
                    1, // count
                ];
            } else {
                // still processing the same $timeframe -> update opening $trade
                $ohlcvs[$candle][$i_high] = max ($ohlcvs[$candle][$i_high], $trade['price']);
                $ohlcvs[$candle][$i_low] = min ($ohlcvs[$candle][$i_low], $trade['price']);
                $ohlcvs[$candle][$i_close] = $trade['price'];
                $ohlcvs[$candle][$i_volume] = $this->sum ($ohlcvs[$candle][$i_volume], $trade['amount']);
                $ohlcvs[$candle][$i_count] = $this->sum ($ohlcvs[$candle][$i_count], 1);
            }
        }
        return $ohlcvs;
    }

    public function fetch_ohlcvc($symbol, $timeframe = '1m', mixed $since = null, ?int $limit = null, $params = array ()) {
        if (!$this->has['fetchTrades']) {
            throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet');
        }
        $this->load_markets();
        $trades = $this->fetchTrades ($symbol, $since, $limit, $params);
        return $this->build_ohlcvc($trades, $timeframe, $since, $limit);
    }

    public function parse_trading_view_ohlcv($ohlcvs, $market = null, $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function edit_limit_buy_order($id, $symbol, $amount, $price = null, $params = array ()) {
        return $this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order($id, $symbol, $amount, $price = null, $params = array ()) {
        return $this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order($id, $symbol, $side, $amount, $price = null, $params = array ()) {
        return $this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function edit_order(string $id, $symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->cancelOrder ($id, $symbol);
        return $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function fetch_permissions($params = array ()) {
        throw new NotSupported($this->id . ' fetchPermissions() is not supported yet');
    }

    public function fetch_position(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function fetch_positions(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositions() is not supported yet');
    }

    public function fetch_positions_risk(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionsRisk() is not supported yet');
    }

    public function fetch_bids_asks(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBidsAsks() is not supported yet');
    }

    public function parse_bid_ask($bidask, int|string $priceKey = 0, int|string $amountKey = 1) {
        $price = $this->safe_number($bidask, $priceKey);
        $amount = $this->safe_number($bidask, $amountKey);
        return array( $price, $amount );
    }

    public function safe_currency(?string $currencyId, mixed $currency = null) {
        if (($currencyId === null) && ($currency !== null)) {
            return $currency;
        }
        if (($this->currencies_by_id !== null) && (is_array($this->currencies_by_id) && array_key_exists($currencyId, $this->currencies_by_id)) && ($this->currencies_by_id[$currencyId] !== null)) {
            return $this->currencies_by_id[$currencyId];
        }
        $code = $currencyId;
        if ($currencyId !== null) {
            $code = $this->common_currency_code(strtoupper($currencyId));
        }
        return array(
            'id' => $currencyId,
            'code' => $code,
        );
    }

    public function safe_market($marketId = null, $market = null, $delimiter = null, $marketType = null) {
        $result = array(
            'active' => null,
            'base' => null,
            'baseId' => null,
            'contract' => false,
            'contractSize' => null,
            'expiry' => null,
            'expiryDatetime' => null,
            'future' => false,
            'id' => $marketId,
            'info' => null,
            'inverse' => null,
            'limits' => array(
                'amount' => array(
                    'min' => null,
                    'max' => null,
                ),
                'cost' => array(
                    'min' => null,
                    'max' => null,
                ),
                'price' => array(
                    'min' => null,
                    'max' => null,
                ),
            ),
            'linear' => null,
            'margin' => false,
            'option' => false,
            'optionType' => null,
            'precision' => array(
                'amount' => null,
                'price' => null,
            ),
            'quote' => null,
            'quoteId' => null,
            'settle' => null,
            'settleId' => null,
            'spot' => false,
            'strike' => null,
            'swap' => false,
            'symbol' => $marketId,
            'type' => null,
        );
        if ($marketId !== null) {
            if (($this->markets_by_id !== null) && (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id))) {
                $markets = $this->markets_by_id[$marketId];
                $numMarkets = count($markets);
                if ($numMarkets === 1) {
                    return $markets[0];
                } else {
                    if (($marketType === null) && ($market === null)) {
                        throw new ArgumentsRequired($this->id . ' safeMarket() requires a fourth argument for ' . $marketId . ' to disambiguate between different $markets with the same $market id');
                    }
                    $inferredMarketType = ($marketType === null) ? $market['type'] : $marketType;
                    for ($i = 0; $i < count($markets); $i++) {
                        $market = $markets[$i];
                        if ($market[$inferredMarketType]) {
                            return $market;
                        }
                    }
                }
            } elseif ($delimiter !== null) {
                $parts = explode($delimiter, $marketId);
                $partsLength = count($parts);
                if ($partsLength === 2) {
                    $result['baseId'] = $this->safe_string($parts, 0);
                    $result['quoteId'] = $this->safe_string($parts, 1);
                    $result['base'] = $this->safe_currency_code($result['baseId']);
                    $result['quote'] = $this->safe_currency_code($result['quoteId']);
                    $result['symbol'] = $result['base'] . '/' . $result['quote'];
                    return $result;
                } else {
                    return $result;
                }
            }
        }
        if ($market !== null) {
            return $market;
        }
        return $result;
    }

    public function check_required_credentials($error = true) {
        $keys = is_array($this->requiredCredentials) ? array_keys($this->requiredCredentials) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($this->requiredCredentials[$key] && !$this->$key) {
                if ($error) {
                    throw new AuthenticationError($this->id . ' requires "' . $key . '" credential');
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    public function oath() {
        if ($this->twofa !== null) {
            return $this->totp($this->twofa);
        } else {
            throw new ExchangeError($this->id . ' exchange.twofa has not been set for 2FA Two-Factor Authentication');
        }
    }

    public function fetch_balance($params = array ()) {
        throw new NotSupported($this->id . ' fetchBalance() is not supported yet');
    }

    public function watch_balance($params = array ()) {
        throw new NotSupported($this->id . ' watchBalance() is not supported yet');
    }

    public function fetch_partial_balance($part, $params = array ()) {
        $balance = $this->fetch_balance($params);
        return $balance[$part];
    }

    public function fetch_free_balance($params = array ()) {
        return $this->fetch_partial_balance('free', $params);
    }

    public function fetch_used_balance($params = array ()) {
        return $this->fetch_partial_balance('used', $params);
    }

    public function fetch_total_balance($params = array ()) {
        return $this->fetch_partial_balance('total', $params);
    }

    public function fetch_status($params = array ()) {
        if ($this->has['fetchTime']) {
            $time = $this->fetchTime ($params);
            $this->status = array_merge($this->status, array(
                'updated' => $time,
                'info' => $time,
            ));
        }
        if (!(is_array($this->status) && array_key_exists('info', $this->status))) {
            $this->status['info'] = null;
        }
        return $this->status;
    }

    public function fetch_funding_fee(string $code, $params = array ()) {
        $warnOnFetchFundingFee = $this->safe_value($this->options, 'warnOnFetchFundingFee', true);
        if ($warnOnFetchFundingFee) {
            throw new NotSupported($this->id . ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = false to suppress this warning');
        }
        return $this->fetch_transaction_fee($code, $params);
    }

    public function fetch_funding_fees(?array $codes = null, $params = array ()) {
        $warnOnFetchFundingFees = $this->safe_value($this->options, 'warnOnFetchFundingFees', true);
        if ($warnOnFetchFundingFees) {
            throw new NotSupported($this->id . ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = false to suppress this warning');
        }
        return $this->fetch_transaction_fees($codes, $params);
    }

    public function fetch_transaction_fee(string $code, $params = array ()) {
        if (!$this->has['fetchTransactionFees']) {
            throw new NotSupported($this->id . ' fetchTransactionFee() is not supported yet');
        }
        return $this->fetch_transaction_fees(array( $code ), $params);
    }

    public function fetch_transaction_fees(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTransactionFees() is not supported yet');
    }

    public function fetch_deposit_withdraw_fees(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositWithdrawFees() is not supported yet');
    }

    public function fetch_deposit_withdraw_fee(string $code, $params = array ()) {
        if (!$this->has['fetchDepositWithdrawFees']) {
            throw new NotSupported($this->id . ' fetchDepositWithdrawFee() is not supported yet');
        }
        $fees = $this->fetchDepositWithdrawFees (array( $code ), $params);
        return $this->safe_value($fees, $code);
    }

    public function get_supported_mapping($key, $mapping = array ()) {
        if (is_array($mapping) && array_key_exists($key, $mapping)) {
            return $mapping[$key];
        } else {
            throw new NotSupported($this->id . ' ' . $key . ' does not have a value in mapping');
        }
    }

    public function fetch_borrow_rate(string $code, $params = array ()) {
        $this->load_markets();
        if (!$this->has['fetchBorrowRates']) {
            throw new NotSupported($this->id . ' fetchBorrowRate() is not supported yet');
        }
        $borrowRates = $this->fetch_borrow_rates($params);
        $rate = $this->safe_value($borrowRates, $code);
        if ($rate === null) {
            throw new ExchangeError($this->id . ' fetchBorrowRate() could not find the borrow $rate for currency $code ' . $code);
        }
        return $rate;
    }

    public function handle_option_and_params($params, $methodName, $optionName, $defaultValue = null) {
        // This method can be used to obtain method specific properties, i.e => $this->handleOptionAndParams ($params, 'fetchPosition', 'marginMode', 'isolated')
        $defaultOptionName = 'default' . $this->capitalize ($optionName); // we also need to check the 'defaultXyzWhatever'
        // check if $params contain the key
        $value = $this->safe_value_2($params, $optionName, $defaultOptionName);
        if ($value !== null) {
            $params = $this->omit ($params, array( $optionName, $defaultOptionName ));
        } else {
            // check if exchange has properties for this method
            $exchangeWideMethodOptions = $this->safe_value($this->options, $methodName);
            if ($exchangeWideMethodOptions !== null) {
                // check if the option is defined in this method's props
                $value = $this->safe_value_2($exchangeWideMethodOptions, $optionName, $defaultOptionName);
            }
            if ($value === null) {
                // if it's still null, check if global exchange-wide option exists
                $value = $this->safe_value_2($this->options, $optionName, $defaultOptionName);
            }
            // if it's still null, use the default $value
            $value = ($value !== null) ? $value : $defaultValue;
        }
        return array( $value, $params );
    }

    public function handle_option($methodName, $optionName, $defaultValue = null) {
        // eslint-disable-next-line no-unused-vars
        list($result, $empty) = $this->handleOptionAndParams (array(), $methodName, $optionName, $defaultValue);
        return $result;
    }

    public function handle_market_type_and_params($methodName, $market = null, $params = array ()) {
        $defaultType = $this->safe_string_2($this->options, 'defaultType', 'type', 'spot');
        $methodOptions = $this->safe_value($this->options, $methodName);
        $methodType = $defaultType;
        if ($methodOptions !== null) {
            if (gettype($methodOptions) === 'string') {
                $methodType = $methodOptions;
            } else {
                $methodType = $this->safe_string_2($methodOptions, 'defaultType', 'type', $methodType);
            }
        }
        $marketType = ($market === null) ? $methodType : $market['type'];
        $type = $this->safe_string_2($params, 'defaultType', 'type', $marketType);
        $params = $this->omit ($params, array( 'defaultType', 'type' ));
        return array( $type, $params );
    }

    public function handle_sub_type_and_params($methodName, $market = null, $params = array (), $defaultValue = null) {
        $subType = null;
        // if set in $params, it takes precedence
        $subTypeInParams = $this->safe_string_2($params, 'subType', 'defaultSubType');
        // avoid omitting if it's not present
        if ($subTypeInParams !== null) {
            $subType = $subTypeInParams;
            $params = $this->omit ($params, array( 'subType', 'defaultSubType' ));
        } else {
            // at first, check from $market object
            if ($market !== null) {
                if ($market['linear']) {
                    $subType = 'linear';
                } elseif ($market['inverse']) {
                    $subType = 'inverse';
                }
            }
            // if it was not defined in $market object
            if ($subType === null) {
                $values = $this->handleOptionAndParams (null, $methodName, 'subType', $defaultValue); // no need to re-test $params here
                $subType = $values[0];
            }
        }
        return array( $subType, $params );
    }

    public function handle_margin_mode_and_params($methodName, $params = array (), $defaultValue = null) {
        /**
         * @ignore
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return array([string|null, object]) the marginMode in lowercase by $params["marginMode"], $params["defaultMarginMode"] $this->options["marginMode"] or $this->options["defaultMarginMode"]
         */
        return $this->handleOptionAndParams ($params, $methodName, 'marginMode', $defaultValue);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
        if (is_array($exact) && array_key_exists($string, $exact)) {
            throw new $exact[$string]($message);
        }
    }

    public function throw_broadly_matched_exception($broad, $string, $message) {
        $broadKey = $this->find_broadly_matched_key($broad, $string);
        if ($broadKey !== null) {
            throw new $broad[$broadKey]($message);
        }
    }

    public function find_broadly_matched_key($broad, $string) {
        // a helper for matching error strings exactly vs broadly
        $keys = is_array($broad) ? array_keys($broad) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($string !== null) { // #issues/12698
                if (mb_strpos($string, $key) !== false) {
                    return $key;
                }
            }
        }
        return null;
    }

    public function handle_errors($statusCode, $statusText, $url, $method, $responseHeaders, $responseBody, $response, $requestHeaders, $requestBody) {
        // it is a stub $method that must be overrided in the derived exchange classes
        // throw new NotSupported($this->id . ' handleErrors() not implemented yet');
        return null;
    }

    public function calculate_rate_limiter_cost($api, $method, $path, $params, $config = array ()) {
        return $this->safe_value($config, 'cost', 1);
    }

    public function fetch_ticker(string $symbol, $params = array ()) {
        if ($this->has['fetchTickers']) {
            $this->load_markets();
            $market = $this->market ($symbol);
            $symbol = $market['symbol'];
            $tickers = $this->fetch_tickers(array( $symbol ), $params);
            $ticker = $this->safe_value($tickers, $symbol);
            if ($ticker === null) {
                throw new NullResponse($this->id . ' fetchTickers() could not find a $ticker for ' . $symbol);
            } else {
                return $ticker;
            }
        } else {
            throw new NotSupported($this->id . ' fetchTicker() is not supported yet');
        }
    }

    public function watch_ticker(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' watchTicker() is not supported yet');
    }

    public function fetch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTickers() is not supported yet');
    }

    public function watch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTickers() is not supported yet');
    }

    public function fetch_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrder() is not supported yet');
    }

    public function fetch_order_status(string $id, ?string $symbol = null, $params = array ()) {
        // TODO => TypeScript => change method signature by replacing
        // Promise<string> with Promise<Order['status']>.
        $order = $this->fetch_order($id, $symbol, $params);
        return $order['status'];
    }

    public function fetch_unified_order($order, $params = array ()) {
        return $this->fetch_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function create_order(string $symbol, string $type, string $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrder() is not supported yet');
    }

    public function cancel_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrder() is not supported yet');
    }

    public function cancel_all_orders(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrders() is not supported yet');
    }

    public function cancel_unified_order($order, $params = array ()) {
        return $this->cancelOrder ($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function fetch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrders() is not supported yet');
    }

    public function fetch_order_trades(string $id, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderTrades() is not supported yet');
    }

    public function watch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrders() is not supported yet');
    }

    public function fetch_open_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenOrders() is not supported yet');
    }

    public function fetch_closed_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchClosedOrders() is not supported yet');
    }

    public function fetch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTrades() is not supported yet');
    }

    public function watch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyTrades() is not supported yet');
    }

    public function fetch_transactions(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTransactions() is not supported yet');
    }

    public function fetch_deposits(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDeposits() is not supported yet');
    }

    public function fetch_withdrawals(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawals() is not supported yet');
    }

    public function parse_last_price($price, $market = null) {
        throw new NotSupported($this->id . ' parseLastPrice() is not supported yet');
    }

    public function fetch_deposit_address(string $code, $params = array ()) {
        if ($this->has['fetchDepositAddresses']) {
            $depositAddresses = $this->fetchDepositAddresses (array( $code ), $params);
            $depositAddress = $this->safe_value($depositAddresses, $code);
            if ($depositAddress === null) {
                throw new InvalidAddress($this->id . ' fetchDepositAddress() could not find a deposit address for ' . $code . ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
            } else {
                return $depositAddress;
            }
        } else {
            throw new NotSupported($this->id . ' fetchDepositAddress() is not supported yet');
        }
    }

    public function account(): array {
        return array(
            'free' => null,
            'used' => null,
            'total' => null,
        );
    }

    public function common_currency_code(string $currency) {
        if (!$this->substituteCommonCurrencyCodes) {
            return $currency;
        }
        return $this->safe_string($this->commonCurrencies, $currency, $currency);
    }

    public function currency($code) {
        if ($this->currencies === null) {
            throw new ExchangeError($this->id . ' currencies not loaded');
        }
        if (gettype($code) === 'string') {
            if (is_array($this->currencies) && array_key_exists($code, $this->currencies)) {
                return $this->currencies[$code];
            } elseif (is_array($this->currencies_by_id) && array_key_exists($code, $this->currencies_by_id)) {
                return $this->currencies_by_id[$code];
            }
        }
        throw new ExchangeError($this->id . ' does not have currency $code ' . $code);
    }

    public function market(string $symbol) {
        if ($this->markets === null) {
            throw new ExchangeError($this->id . ' $markets not loaded');
        }
        if (gettype($symbol) === 'string') {
            if (is_array($this->markets) && array_key_exists($symbol, $this->markets)) {
                return $this->markets[$symbol];
            } elseif (is_array($this->markets_by_id) && array_key_exists($symbol, $this->markets_by_id)) {
                $markets = $this->markets_by_id[$symbol];
                $defaultType = $this->safe_string_2($this->options, 'defaultType', 'defaultSubType', 'spot');
                for ($i = 0; $i < count($markets); $i++) {
                    $market = $markets[$i];
                    if ($market[$defaultType]) {
                        return $market;
                    }
                }
                return $markets[0];
            }
        }
        throw new BadSymbol($this->id . ' does not have $market $symbol ' . $symbol);
    }

    public function handle_withdraw_tag_and_params($tag, $params) {
        if (gettype($tag) === 'array') {
            $params = array_merge($tag, $params);
            $tag = null;
        }
        if ($tag === null) {
            $tag = $this->safe_string($params, 'tag');
            if ($tag !== null) {
                $params = $this->omit ($params, 'tag');
            }
        }
        return array( $tag, $params );
    }

    public function create_limit_order(string $symbol, string $side, $amount, $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order(string $symbol, string $side, $amount, $price = null, $params = array ()) {
        return $this->create_order($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_limit_buy_order(string $symbol, $amount, $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', 'buy', $amount, $price, $params);
    }

    public function create_limit_sell_order(string $symbol, $amount, $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order(string $symbol, $amount, $params = array ()) {
        return $this->create_order($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order(string $symbol, $amount, $params = array ()) {
        return $this->create_order($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function cost_to_precision(string $symbol, $cost) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($cost, TRUNCATE, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function price_to_precision(string $symbol, $price) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($price, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new ArgumentsRequired($this->id . ' $price of ' . $market['symbol'] . ' must be greater than minimum $price precision of ' . $this->number_to_string($market['precision']['price']));
        }
        return $result;
    }

    public function amount_to_precision(string $symbol, $amount) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($amount, TRUNCATE, $market['precision']['amount'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new ArgumentsRequired($this->id . ' $amount of ' . $market['symbol'] . ' must be greater than minimum $amount precision of ' . $this->number_to_string($market['precision']['amount']));
        }
        return $result;
    }

    public function fee_to_precision(string $symbol, $fee) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($fee, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function currency_to_precision(string $code, $fee, $networkCode = null) {
        $currency = $this->currencies[$code];
        $precision = $this->safe_value($currency, 'precision');
        if ($networkCode !== null) {
            $networks = $this->safe_value($currency, 'networks', array());
            $networkItem = $this->safe_value($networks, $networkCode, array());
            $precision = $this->safe_value($networkItem, 'precision', $precision);
        }
        if ($precision === null) {
            return $fee;
        } else {
            return $this->decimal_to_precision($fee, ROUND, $precision, $this->precisionMode, $this->paddingMode);
        }
    }

    public function is_tick_precision() {
        return $this->precisionMode === TICK_SIZE;
    }

    public function is_decimal_precision() {
        return $this->precisionMode === DECIMAL_PLACES;
    }

    public function is_significant_precision() {
        return $this->precisionMode === SIGNIFICANT_DIGITS;
    }

    public function safe_number(array $obj, int|string $key, ?float $defaultNumber = null) {
        $value = $this->safe_string($obj, $key);
        return $this->parse_number($value, $defaultNumber);
    }

    public function safe_number_n(array $obj, array $arr, ?float $defaultNumber = null) {
        $value = $this->safe_string_n($obj, $arr);
        return $this->parse_number($value, $defaultNumber);
    }

    public function parse_precision(?string $precision) {
        /**
         * @ignore
         * @param {string} $precision The number of digits to the right of the decimal
         * @return {string} a string number equal to 1e-$precision
         */
        if ($precision === null) {
            return null;
        }
        $precisionNumber = intval($precision);
        if ($precisionNumber === 0) {
            return '1';
        }
        $parsedPrecision = '0.';
        for ($i = 0; $i < $precisionNumber - 1; $i++) {
            $parsedPrecision = $parsedPrecision . '0';
        }
        return $parsedPrecision . '1';
    }

    public function load_time_difference($params = array ()) {
        $serverTime = $this->fetchTime ($params);
        $after = $this->milliseconds ();
        $this->options['timeDifference'] = $after - $serverTime;
        return $this->options['timeDifference'];
    }

    public function implode_hostname(string $url) {
        return $this->implode_params($url, array( 'hostname' => $this->hostname ));
    }

    public function fetch_market_leverage_tiers(string $symbol, $params = array ()) {
        if ($this->has['fetchLeverageTiers']) {
            $market = $this->market ($symbol);
            if (!$market['contract']) {
                throw new BadSymbol($this->id . ' fetchMarketLeverageTiers() supports contract markets only');
            }
            $tiers = $this->fetch_leverage_tiers(array( $symbol ));
            return $this->safe_value($tiers, $symbol);
        } else {
            throw new NotSupported($this->id . ' fetchMarketLeverageTiers() is not supported yet');
        }
    }

    public function create_post_only_order(string $symbol, string $type, string $side, $amount, $price, $params = array ()) {
        if (!$this->has['createPostOnlyOrder']) {
            throw new NotSupported($this->id . 'createPostOnlyOrder() is not supported yet');
        }
        $query = array_merge($params, array( 'postOnly' => true ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_reduce_only_order(string $symbol, string $type, string $side, $amount, $price, $params = array ()) {
        if (!$this->has['createReduceOnlyOrder']) {
            throw new NotSupported($this->id . 'createReduceOnlyOrder() is not supported yet');
        }
        $query = array_merge($params, array( 'reduceOnly' => true ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_stop_order(string $symbol, string $type, string $side, $amount, $price = null, $stopPrice = null, $params = array ()) {
        if (!$this->has['createStopOrder']) {
            throw new NotSupported($this->id . ' createStopOrder() is not supported yet');
        }
        if ($stopPrice === null) {
            throw new ArgumentsRequired($this->id . ' create_stop_order() requires a $stopPrice argument');
        }
        $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_stop_limit_order(string $symbol, string $side, $amount, $price, $stopPrice, $params = array ()) {
        if (!$this->has['createStopLimitOrder']) {
            throw new NotSupported($this->id . ' createStopLimitOrder() is not supported yet');
        }
        $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
        return $this->create_order($symbol, 'limit', $side, $amount, $price, $query);
    }

    public function create_stop_market_order(string $symbol, string $side, $amount, $stopPrice, $params = array ()) {
        if (!$this->has['createStopMarketOrder']) {
            throw new NotSupported($this->id . ' createStopMarketOrder() is not supported yet');
        }
        $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
        return $this->create_order($symbol, 'market', $side, $amount, null, $query);
    }

    public function safe_currency_code(?string $currencyId, mixed $currency = null) {
        $currency = $this->safe_currency($currencyId, $currency);
        return $currency['code'];
    }

    public function filter_by_symbol_since_limit($array, ?string $symbol = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_currency_since_limit($array, $code = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit, 'timestamp', $tail);
    }

    public function parse_last_prices($pricesData, ?array $symbols = null, $params = array ()) {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1' => array( ... ),
        //         'marketId2' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'market' => 'marketId1', ... ),
        //         array( 'market' => 'marketId2', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($pricesData) === 'array' && array_keys($pricesData) === array_keys(array_keys($pricesData))) {
            for ($i = 0; $i < count($pricesData); $i++) {
                $priceData = array_merge($this->parseLastPrice ($pricesData[$i]), $params);
                $results[] = $priceData;
            }
        } else {
            $marketIds = is_array($pricesData) ? array_keys($pricesData) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $priceData = array_merge($this->parseLastPrice ($pricesData[$marketId], $market), $params);
                $results[] = $priceData;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_tickers($tickers, ?array $symbols = null, $params = array ()) {
        //
        // the value of $tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1' => array( ... ),
        //         'marketId2' => array( ... ),
        //         'marketId3' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'market' => 'marketId1', ... ),
        //         array( 'market' => 'marketId2', ... ),
        //         array( 'market' => 'marketId3', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($tickers) === 'array' && array_keys($tickers) === array_keys(array_keys($tickers))) {
            for ($i = 0; $i < count($tickers); $i++) {
                $ticker = array_merge($this->parse_ticker($tickers[$i]), $params);
                $results[] = $ticker;
            }
        } else {
            $marketIds = is_array($tickers) ? array_keys($tickers) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $ticker = array_merge($this->parse_ticker($tickers[$marketId], $market), $params);
                $results[] = $ticker;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_deposit_addresses($addresses, ?array $codes = null, $indexed = true, $params = array ()) {
        $result = array();
        for ($i = 0; $i < count($addresses); $i++) {
            $address = array_merge($this->parse_deposit_address($addresses[$i]), $params);
            $result[] = $address;
        }
        if ($codes !== null) {
            $result = $this->filter_by_array($result, 'currency', $codes, false);
        }
        if ($indexed) {
            return $this->index_by($result, 'currency');
        }
        return $result;
    }

    public function parse_borrow_interests($response, $market = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $row = $response[$i];
            $interests[] = $this->parse_borrow_interest($row, $market);
        }
        return $interests;
    }

    public function parse_funding_rate_histories($response, $market = null, ?int $since = null, ?int $limit = null) {
        $rates = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $rates[] = $this->parse_funding_rate_history($entry, $market);
        }
        $sorted = $this->sort_by($rates, 'timestamp');
        $symbol = ($market === null) ? null : $market['symbol'];
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function safe_symbol($marketId, $market = null, $delimiter = null, $marketType = null) {
        $market = $this->safe_market($marketId, $market, $delimiter, $marketType);
        return $market['symbol'];
    }

    public function parse_funding_rate(string $contract, $market = null) {
        throw new NotSupported($this->id . ' parseFundingRate() is not supported yet');
    }

    public function parse_funding_rates($response, $market = null) {
        $result = array();
        for ($i = 0; $i < count($response); $i++) {
            $parsed = $this->parse_funding_rate($response[$i], $market);
            $result[$parsed['symbol']] = $parsed;
        }
        return $result;
    }

    public function is_trigger_order($params) {
        $isTrigger = $this->safe_value_2($params, 'trigger', 'stop');
        if ($isTrigger) {
            $params = $this->omit ($params, array( 'trigger', 'stop' ));
        }
        return array( $isTrigger, $params );
    }

    public function is_post_only(bool $isMarketOrder, $exchangeSpecificParam, $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} $exchangeSpecificParam exchange specific $postOnly
         * @param {array} $params exchange specific $params
         * @return {boolean} true if a post only order, false otherwise
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_value_2($params, 'postOnly', 'post_only', false);
        // we assume $timeInForce is uppercase from safeStringUpper ($params, 'timeInForce')
        $ioc = $timeInForce === 'IOC';
        $fok = $timeInForce === 'FOK';
        $timeInForcePostOnly = $timeInForce === 'PO';
        $postOnly = $postOnly || $timeInForcePostOnly || $exchangeSpecificParam;
        if ($postOnly) {
            if ($ioc || $fok) {
                throw new InvalidOrder($this->id . ' $postOnly orders cannot have $timeInForce equal to ' . $timeInForce);
            } elseif ($isMarketOrder) {
                throw new InvalidOrder($this->id . ' market orders cannot be postOnly');
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    public function handle_post_only(bool $isMarketOrder, bool $exchangeSpecificPostOnlyOption, mixed $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} exchangeSpecificBoolean exchange specific $postOnly
         * @param {array} $params exchange specific $params
         * @return array([boolean, $params])
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_value($params, 'postOnly', false);
        $ioc = $timeInForce === 'IOC';
        $fok = $timeInForce === 'FOK';
        $po = $timeInForce === 'PO';
        $postOnly = $postOnly || $po || $exchangeSpecificPostOnlyOption;
        if ($postOnly) {
            if ($ioc || $fok) {
                throw new InvalidOrder($this->id . ' $postOnly orders cannot have $timeInForce equal to ' . $timeInForce);
            } elseif ($isMarketOrder) {
                throw new InvalidOrder($this->id . ' market orders cannot be postOnly');
            } else {
                if ($po) {
                    $params = $this->omit ($params, 'timeInForce');
                }
                $params = $this->omit ($params, 'postOnly');
                return array( true, $params );
            }
        }
        return array( false, $params );
    }

    public function fetch_last_prices(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLastPrices() is not supported yet');
    }

    public function fetch_trading_fees($params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingFees() is not supported yet');
    }

    public function fetch_trading_fee(string $symbol, $params = array ()) {
        if (!$this->has['fetchTradingFees']) {
            throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
        }
        return $this->fetch_trading_fees($params);
    }

    public function parse_open_interest($interest, $market = null) {
        throw new NotSupported($this->id . ' parseOpenInterest () is not supported yet');
    }

    public function parse_open_interests($response, $market = null, ?int $since = null, ?int $limit = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $interest = $this->parse_open_interest($entry, $market);
            $interests[] = $interest;
        }
        $sorted = $this->sort_by($interests, 'timestamp');
        $symbol = $this->safe_string($market, 'symbol');
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function fetch_funding_rate(string $symbol, $params = array ()) {
        if ($this->has['fetchFundingRates']) {
            $this->load_markets();
            $market = $this->market ($symbol);
            if (!$market['contract']) {
                throw new BadSymbol($this->id . ' fetchFundingRate() supports contract markets only');
            }
            $rates = $this->fetchFundingRates (array( $symbol ), $params);
            $rate = $this->safe_value($rates, $symbol);
            if ($rate === null) {
                throw new NullResponse($this->id . ' fetchFundingRate () returned no data for ' . $symbol);
            } else {
                return $rate;
            }
        } else {
            throw new NotSupported($this->id . ' fetchFundingRate () is not supported yet');
        }
    }

    public function fetch_mark_ohlcv($symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical mark price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int|null} $since timestamp in ms of the earliest candle to fetch
         * @param {int|null} $limit the maximum amount of candles to fetch
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {[[int|float]]} A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchMarkOHLCV']) {
            $request = array(
                'price' => 'mark',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchMarkOHLCV () is not supported yet');
        }
    }

    public function fetch_index_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int|null} $since timestamp in ms of the earliest candle to fetch
         * @param {int|null} $limit the maximum amount of candles to fetch
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {[[int|float]]} A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchIndexOHLCV']) {
            $request = array(
                'price' => 'index',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchIndexOHLCV () is not supported yet');
        }
    }

    public function fetch_premium_index_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int|null} $since timestamp in ms of the earliest candle to fetch
         * @param {int|null} $limit the maximum amount of candles to fetch
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {[[int|float]]} A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchPremiumIndexOHLCV']) {
            $request = array(
                'price' => 'premiumIndex',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchPremiumIndexOHLCV () is not supported yet');
        }
    }

    public function handle_time_in_force($params = array ()) {
        /**
         * @ignore
         * * Must add $timeInForce to $this->options to use this method
         * @return {string} returns the exchange specific value for $timeInForce
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce'); // supported values GTC, IOC, PO
        if ($timeInForce !== null) {
            $exchangeValue = $this->safe_string($this->options['timeInForce'], $timeInForce);
            if ($exchangeValue === null) {
                throw new ExchangeError($this->id . ' does not support $timeInForce "' . $timeInForce . '"');
            }
            return $exchangeValue;
        }
        return null;
    }

    public function convert_type_to_account($account) {
        /**
         * @ignore
         * * Must add $accountsByType to $this->options to use this method
         * @param {string} $account key for $account name in $this->options['accountsByType']
         * @return the exchange specific $account name or the isolated margin id for transfers
         */
        $accountsByType = $this->safe_value($this->options, 'accountsByType', array());
        $lowercaseAccount = strtolower($account);
        if (is_array($accountsByType) && array_key_exists($lowercaseAccount, $accountsByType)) {
            return $accountsByType[$lowercaseAccount];
        } elseif ((is_array($this->markets) && array_key_exists($account, $this->markets)) || (is_array($this->markets_by_id) && array_key_exists($account, $this->markets_by_id))) {
            $market = $this->market ($account);
            return $market['id'];
        } else {
            return $account;
        }
    }

    public function check_required_argument($methodName, $argument, $argumentName, $options = []) {
        /**
         * @ignore
         * @param {string} $argument the $argument to check
         * @param {string} $argumentName the name of the $argument to check
         * @param {string} $methodName the name of the method that the $argument is being checked for
         * @param {[string]} $options a list of $options that the $argument can be
         * @return {null}
         */
        $optionsLength = count($options);
        if (($argument === null) || (($optionsLength > 0) && (!($this->in_array($argument, $options))))) {
            $messageOptions = implode(', ', $options);
            $message = $this->id . ' ' . $methodName . '() requires a ' . $argumentName . ' argument';
            if ($messageOptions !== '') {
                $message .= ', one of ' . '(' . $messageOptions . ')';
            }
            throw new ArgumentsRequired($message);
        }
    }

    public function check_required_margin_argument(string $methodName, string $symbol, string $marginMode) {
        /**
         * @ignore
         * @param {string} $symbol unified $symbol of the market
         * @param {string} $methodName name of the method that requires a $symbol
         * @param {string} $marginMode is either 'isolated' or 'cross'
         */
        if (($marginMode === 'isolated') && ($symbol === null)) {
            throw new ArgumentsRequired($this->id . ' ' . $methodName . '() requires a $symbol argument for isolated margin');
        } elseif (($marginMode === 'cross') && ($symbol !== null)) {
            throw new ArgumentsRequired($this->id . ' ' . $methodName . '() cannot have a $symbol argument for cross margin');
        }
    }

    public function check_required_symbol(string $methodName, string $symbol) {
        /**
         * @ignore
         * @param {string} $symbol unified $symbol of the market
         * @param {string} $methodName name of the method that requires a $symbol
         */
        $this->check_required_argument($methodName, $symbol, 'symbol');
    }

    public function parse_deposit_withdraw_fees($response, ?array $codes = null, $currencyIdKey = null) {
        /**
         * @ignore
         * @param {[object]|array} $response unparsed $response from the exchange
         * @param {[string]|null} $codes the unified $currency $codes to fetch transactions fees for, returns all currencies when null
         * @param {str|null} $currencyIdKey *should only be null when $response is a $dictionary* the object key that corresponds to the $currency id
         * @return {array} objects with withdraw and deposit fees, indexed by $currency $codes
         */
        $depositWithdrawFees = array();
        $codes = $this->marketCodes ($codes);
        $isArray = gettype($response) === 'array' && array_keys($response) === array_keys(array_keys($response));
        $responseKeys = $response;
        if (!$isArray) {
            $responseKeys = is_array($response) ? array_keys($response) : array();
        }
        for ($i = 0; $i < count($responseKeys); $i++) {
            $entry = $responseKeys[$i];
            $dictionary = $isArray ? $entry : $response[$entry];
            $currencyId = $isArray ? $this->safe_string($dictionary, $currencyIdKey) : $entry;
            $currency = $this->safe_value($this->currencies_by_id, $currencyId);
            $code = $this->safe_string($currency, 'code', $currencyId);
            if (($codes === null) || ($this->in_array($code, $codes))) {
                $depositWithdrawFees[$code] = $this->parseDepositWithdrawFee ($dictionary, $currency);
            }
        }
        return $depositWithdrawFees;
    }

    public function parse_deposit_withdraw_fee($fee, $currency = null) {
        throw new NotSupported($this->id . ' parseDepositWithdrawFee() is not supported yet');
    }

    public function deposit_withdraw_fee($info) {
        return array(
            'deposit' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'info' => $info,
            'networks' => array(),
            'withdraw' => array(
                'fee' => null,
                'percentage' => null,
            ),
        );
    }

    public function assign_default_deposit_withdraw_fees($fee, $currency = null) {
        /**
         * @ignore
         * Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {array} $fee A deposit withdraw $fee structure
         * @param {array} $currency A $currency structure, the response from $this->currency ()
         * @return {array} A deposit withdraw $fee structure
         */
        $networkKeys = is_array($fee['networks']) ? array_keys($fee['networks']) : array();
        $numNetworks = count($networkKeys);
        if ($numNetworks === 1) {
            $fee['withdraw'] = $fee['networks'][$networkKeys[0]]['withdraw'];
            $fee['deposit'] = $fee['networks'][$networkKeys[0]]['deposit'];
            return $fee;
        }
        $currencyCode = $this->safe_string($currency, 'code');
        for ($i = 0; $i < $numNetworks; $i++) {
            $network = $networkKeys[$i];
            if ($network === $currencyCode) {
                $fee['deposit'] = $fee['networks'][$networkKeys[$i]]['deposit'];
                $fee['withdraw'] = $fee['networks'][$networkKeys[$i]]['withdraw'];
            }
        }
        return $fee;
    }

    public function parse_income($info, $market = null) {
        throw new NotSupported($this->id . ' parseIncome () is not supported yet');
    }

    public function parse_incomes($incomes, $market = null, ?int $since = null, ?int $limit = null) {
        /**
         * @ignore
         * parses funding fee info from exchange response
         * @param {[array]} $incomes each item describes once instance of currency being received or paid
         * @param {array|null} $market ccxt $market
         * @param {int|null} $since when defined, the response items are filtered to only include items after this timestamp
         * @param {int|null} $limit limits the number of items in the response
         * @return {[array]} an array of ~@link https://docs.ccxt.com/#/?id=funding-history-structure funding history structures~
         */
        $result = array();
        for ($i = 0; $i < count($incomes); $i++) {
            $entry = $incomes[$i];
            $parsed = $this->parse_income($entry, $market);
            $result[] = $parsed;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        return $this->filter_by_since_limit($sorted, $since, $limit);
    }

    public function get_market_from_symbols(?array $symbols = null) {
        if ($symbols === null) {
            return null;
        }
        $firstMarket = $this->safe_string($symbols, 0);
        $market = $this->market ($firstMarket);
        return $market;
    }
}
