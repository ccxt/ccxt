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

use MessagePack\MessagePack;
use kornrunner\Keccak;
use Web3\Contracts\TypedDataEncoder;
use StarkNet\Crypto\Curve;
use StarkNet\Crypto\Key;
use StarkNet\Hash;
use StarkNet\TypedData;
use Elliptic\EC;
use Elliptic\EdDSA;
use BN\BN;
use Sop\ASN1\Type\UnspecifiedType;
use Exception;

$version = '4.5.6';

// rounding mode
const TRUNCATE = 0;
const ROUND = 1;
const ROUND_UP = 2;
const ROUND_DOWN = 3;

// digits counting mode
const DECIMAL_PLACES = 2;
const SIGNIFICANT_DIGITS = 3;
const TICK_SIZE = 4;

// padding mode
const NO_PADDING = 5;
const PAD_WITH_ZERO = 6;

class Exchange {

    const VERSION = '4.5.6';

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


    // PROXY & USER-AGENTS (see "examples/proxy-usage" file for explanation)
    public $proxy = null; // maintained for backwards compatibility, no-one should use it from now on
    public $proxyUrl = null;
    public $proxy_url = null;
    public $proxyUrlCallback = null;
    public $proxy_url_callback = null;
    public $httpProxy = null;
    public $http_proxy = null;
    public $httpProxyCallback = null;
    public $http_proxy_callback = null;
    public $httpsProxy = null;
    public $https_proxy = null;
    public $httpsProxyCallback = null;
    public $https_proxy_callback = null;
    public $socksProxy = null;
    public $socks_proxy = null;
    public $socksProxyCallback = null;
    public $socks_proxy_callback = null;
    public $userAgent = null; // 'ccxt/' . $this::VERSION . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
    public $user_agent = null;
    public $wsProxy = null;
    public $ws_proxy = null;
    public $wssProxy = null;
    public $wss_proxy = null;
    public $wsSocksProxy = null;
    public $ws_socks_proxy = null;
    //
    public $userAgents = array(
        'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        'chrome100' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    );
    public $headers = array();
    public $origin = '*'; // CORS origin
    public $returnResponseHeaders = false;
    public $MAX_VALUE = PHP_INT_MAX;
    //

    public $hostname = null; // in case of inaccessibility of the "main" domain

    public $options = array(); // exchange-specific options if any
    public $isSandboxModeEnabled = false;

    public $skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway
    public $quoteJsonNumbers = true; // treat numbers in json as quoted precise strings

    public $name = null;
    public $status = array(
        'status' => 'ok',
        'updated' => null,
        'eta' => null,
        'url' => null,
        'info' => null,
    );
    public $countries = null;
    public $version = null;
    public $certified = false; // if certified by the CCXT dev team
    public $pro = false; // if it is integrated with CCXT Pro for WebSocket support
    public $alias = false; // whether this exchange is an alias to another exchange
    public $dex = false;

    public $debug = false;

    public $urls = array(
        'logo'=> null,
        'api'=> null,
        'test'=> null,
        'www'=> null,
        'doc'=> null,
        'api_management'=> null,
        'fees'=> null,
        'referral'=> null,
    );
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
    public $fundingRates = array();

    public $tickers = array();
    public $bidsasks = array();
    public $fees = array(
        'trading'=> array(
            'tierBased'=> null,
            'percentage'=> null,
            'taker'=> null,
            'maker'=> null,
        ),
        'funding'=> array(
            'tierBased'=> null,
            'percentage'=> null,
            'withdraw'=> array(),
            'deposit'=> array(),
        ),
    );

    public $precision = array(
        'amount'=> null,
        'price'=> null,
        'cost'=> null,
        'base'=> null,
        'quote'=> null,
    );
    public $liquidations = array();
    public $orders = null;
    public $triggerOrders = null;
    public $myLiquidations = array();
    public $myTrades = null;
    public $trades = array();
    public $transactions = array();
    public $positions = null;
    public $ohlcvs = array();
    public $exceptions = array();
    public $accounts = array();
    public $accountsById = array();

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
    public $accountId = null;
    public $privateKey = '';
    public $walletAddress = '';
    public $token = ''; // reserved for HTTP auth in some cases

    public $twofa = null;
    public $markets_by_id = null;
    public $currencies_by_id = null;
    public $minFundingAddressLength = 1; // used in check_address
    public $substituteCommonCurrencyCodes = true;

    // whether fees should be summed by currency code
    public $reduceFees = true;

    public $timeframes = array();

    public $requiredCredentials = array(
        'apiKey' => true,
        'secret' => true,
        'uid' => false,
        'accountId' => false,
        'login' => false,
        'password' => false,
        'twofa' => false, // 2-factor authentication (one-time password key)
        'privateKey' => false, // "0x"-prefixed hexstring private key for a wallet
        'walletAddress' => false, // "0x"-prefixed hexstring of wallet address
        'token' => false, // reserved for HTTP auth in some cases
    );

    // API methods metainfo
    public $has = array();
    public $features = array();

    public $precisionMode = DECIMAL_PLACES;
    public $paddingMode = NO_PADDING;
    public $number = 'floatval';
    public $handleContentTypeApplicationZip = false;

    public $lastRestRequestTimestamp = 0;
    public $lastRestPollTimestamp = 0;
    public $restRequestQueue = null;
    public $restPollerLoopIsRunning = false;
    public $enableRateLimit = true;
    public $enableLastJsonResponse = false;
    public $enableLastHttpResponse = true;
    public $enableLastResponseHeaders = true;
    public $last_http_response = null;
    public $last_json_response = null;
    public $last_response_headers = null;
    public $last_request_headers = null;
    public $last_request_body = null;
    public $last_request_url = null;

    public $requiresWeb3 = false;
    public $requiresEddsa = false;
    public $rateLimit = 2000;

    public $commonCurrencies = array(
        'XBT' => 'BTC',
        'BCC' => 'BCH',
        'BCHSV' => 'BSV',
    );

    protected $overriden_methods = array();

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
        'alpaca',
        'apex',
        'ascendex',
        'backpack',
        'bequant',
        'bigone',
        'binance',
        'binancecoinm',
        'binanceus',
        'binanceusdm',
        'bingx',
        'bit2c',
        'bitbank',
        'bitbns',
        'bitfinex',
        'bitflyer',
        'bitget',
        'bithumb',
        'bitmart',
        'bitmex',
        'bitopro',
        'bitrue',
        'bitso',
        'bitstamp',
        'bitteam',
        'bittrade',
        'bitvavo',
        'blockchaincom',
        'blofin',
        'btcalpha',
        'btcbox',
        'btcmarkets',
        'btcturk',
        'bybit',
        'cex',
        'coinbase',
        'coinbaseadvanced',
        'coinbaseexchange',
        'coinbaseinternational',
        'coincatch',
        'coincheck',
        'coinex',
        'coinmate',
        'coinmetro',
        'coinone',
        'coinsph',
        'coinspot',
        'cryptocom',
        'cryptomus',
        'defx',
        'delta',
        'deribit',
        'derive',
        'digifinex',
        'exmo',
        'fmfwio',
        'foxbit',
        'gate',
        'gateio',
        'gemini',
        'hashkey',
        'hibachi',
        'hitbtc',
        'hollaex',
        'htx',
        'huobi',
        'hyperliquid',
        'independentreserve',
        'indodax',
        'kraken',
        'krakenfutures',
        'kucoin',
        'kucoinfutures',
        'latoken',
        'lbank',
        'luno',
        'mercado',
        'mexc',
        'modetrade',
        'myokx',
        'ndax',
        'novadax',
        'oceanex',
        'okcoin',
        'okx',
        'okxus',
        'onetrading',
        'oxfun',
        'p2b',
        'paradex',
        'paymium',
        'phemex',
        'poloniex',
        'probit',
        'timex',
        'tokocrypto',
        'toobit',
        'upbit',
        'wavesexchange',
        'whitebit',
        'woo',
        'woofipro',
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

     public static function map_to_safe_map($dictionary) {
        return $dictionary;  // wrapper for go
     }

    public static function safe_map_to_map($dictionary) {
        return $dictionary;  // wrapper for go
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
        // we can use `array_is_list` instead of old approach: (count(array_filter(array_keys($array), 'is_string')) > 0)
        return is_array($array) && !array_is_list($array);
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

    public static function index_by_safe($array, $key) {
        // wrapper for go
        return static::index_by($array, $key);
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

    public static function sort_by($arrayOfArrays, $key, $descending = false, $default = 0) {
        $descending = $descending ? -1 : 1;
        usort($arrayOfArrays, function ($a, $b) use ($key, $descending, $default) {
            $first = isset($a[$key]) ? $a[$key] : $default;
            $second = isset($b[$key]) ? $b[$key] : $default;
            if ($first == $second) {
                return 0;
            }
            return $first < $second ? -$descending : $descending;
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
        return in_array($needle, $haystack, true);
    }

    public static function to_array($object) {
        if ($object instanceof \JsonSerializable) {
            $object = $object->jsonSerialize();
        }
        return array_values($object);
    }

    public static function is_empty($object) {
        return empty($object) || count($object) === 0;
    }

    public static function keysort($array) {
        $result = $array;
        ksort($result);
        return $result;
    }

    public static function sort($array) {
        $result = $array;
        sort($result);
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

    public static function extend(...$args) {
        return array_merge (...$args);
    }

    public static function deep_extend() {
        // extend associative dictionaries only, replace everything else
        // (optimized: https://github.com/ccxt/ccxt/pull/26277)
        $out = null;
        $args = func_get_args();

        foreach ($args as $arg) {
            if (is_array($arg)) {
                if (empty($arg) || !array_is_list($arg)) {
                    // It's associative or empty
                    if (!is_array($out) || array_is_list($out)) {
                        $out = [];
                    }
                    foreach ($arg as $k => $v) {
                        $out[$k] = isset($out[$k]) && is_array($out[$k]) && is_array($v) && 
                                  (empty($v) || !array_is_list($v)) && (empty($out[$k]) || !array_is_list($out[$k]))
                            ? static::deep_extend($out[$k], $v)
                            : $v;
                    }
                } else {
                    $out = $arg;
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

    public static function urlencode_base64($string) {
        return preg_replace(array('#[=]+$#u', '#\+#u', '#\\/#'), array('', '-', '_'), \base64_encode($string));
    }

    public function urlencode($array, $sort = false) {
        foreach ($array as $key => $value) {
            if (is_bool($value)) {
                $array[$key] = var_export($value, true);
            }
        }
        return http_build_query($array, '', $this->urlencode_glue, PHP_QUERY_RFC3986);
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

    public function rawencode($array, $sort = false) {
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

    public static function int_to_base16($integer) {
        return dechex($integer);
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

        if ($this->urlencode_glue !== '&') {
            if ($this->urlencode_glue_warning) {
                throw new ExchangeError($this->id . ' warning! The glue symbol for HTTP queries ' .
                    ' is changed from its default value & to ' . $this->urlencode_glue . ' in php.ini' .
                    ' (arg_separator.output) or with a call to ini_set prior to this message. If that' .
                    ' was the intent, you can acknowledge this warning and silence it by setting' .
                    " 'urlencode_glue_warning' => false or 'urlencode_glue' => '&' with exchange constructor params");
            }
        }

        $this->after_construct();

        if ($this->safe_bool($options, 'sandbox') || $this->safe_bool($options, 'testnet')) {
            $this->set_sandbox_mode(true);
        }
    }

    public function init_throttler() {
        // stub in sync php
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

    public static function jwt($request, $secret, $algorithm = 'sha256', $is_rsa = false, $opts = []) {
        $alg = ($is_rsa ? 'RS' : 'HS') . mb_substr($algorithm, 3, 3);
        if (array_key_exists('alg', $opts)) {
            $alg = $opts['alg'];
        }
        $headerOptions = array(
            'alg' => $alg,
            'typ' => 'JWT',
        );
        if (array_key_exists('kid', $opts)) {
            $headerOptions['kid'] = $opts['kid'];
        }
        if (array_key_exists('nonce', $opts)) {
            $headerOptions['nonce'] = $opts['nonce'];
        }
        $encodedHeader = static::urlencode_base64(json_encode($headerOptions));
        $encodedData = static::urlencode_base64(json_encode($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        $algoType = mb_substr($alg, 0, 2);
        if ($is_rsa || $algoType === 'RS') {
            $signature = \base64_decode(static::rsa($token, $secret, $algorithm));
        } else if ($algoType === 'ES') {
            $signed = static::ecdsa($token, $secret, 'p256', $algorithm);
            $signature = hex2bin(str_pad($signed['r'], 64, '0', STR_PAD_LEFT) . str_pad($signed['s'], 64, '0', STR_PAD_LEFT));
        } else if ($algoType === 'Ed') {
            $signed = static::eddsa($token, $secret);
            $signature = static::base64_to_base64url($signed);
            return $token . '.' . $signature; // eddsa returns the value  already as a base64 string
        } else {
            $signature = static::hmac($token, $secret, $algorithm, 'binary');
        }
        return $token . '.' . static::urlencode_base64($signature);
    }

    public static function base64_to_base64url(string $base64, bool $stripPadding = true): string {
        $base64url = strtr($base64, '+/', '-_');

        if ($stripPadding) {
            $base64url = rtrim($base64url, '=');
        }

    return $base64url;
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
        if (preg_match('/^-----BEGIN EC PRIVATE KEY-----\s([\w\d+=\/\s]+)\s-----END EC PRIVATE KEY-----/', $secret, $match) >= 1) {
            $pemKey = $match[1];
            $decodedPemKey = UnspecifiedType::fromDER(base64_decode($pemKey))->asSequence();
            $secret = bin2hex($decodedPemKey->at(1)->asOctetString()->string());
            if ($decodedPemKey->hasTagged(0)) {
                $params = $decodedPemKey->getTagged(0)->asExplicit();
                $oid = $params->asObjectIdentifier()->oid();
                $supportedCurve = array(
                    '1.3.132.0.10' => 'secp256k1',
                    '1.2.840.10045.3.1.7' => 'p256',
                );
                if (!array_key_exists($oid, $supportedCurve)) throw new Exception('Unsupported curve');
                $algorithm = $supportedCurve[$oid];
            }
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

    public static function axolotl($request, $secret, $algorithm = 'ed25519') {
        // this method is experimental ( ͡° ͜ʖ ͡°)
        $curve = new EdDSA($algorithm);
        $signature = $curve->signModified($request, $secret);
        return static::binary_to_base58(static::base16_to_binary($signature->toHex()));
    }

    public static function eddsa($request, $secret, $algorithm = 'ed25519') {
        $curve = new EdDSA($algorithm);
        if (preg_match('/^-----BEGIN PRIVATE KEY-----\s(\S{64})\s-----END PRIVATE KEY-----$/', $secret, $match) >= 1) {
            // trim pem header from 48 bytes -> 32 bytes
            // in hex so 96 chars -> 64 chars
            $hex_secret = substr(bin2hex(base64_decode($match[1])), 32);
        } else {
            $hex_secret = bin2hex($secret);
        }
        $signature = $curve->sign(bin2hex(static::encode($request)), $hex_secret);
        return static::binary_to_base64(static::base16_to_binary($signature->toHex()));
    }

    public static function random_bytes($length) {
        return bin2hex(random_bytes($length));
    }

    public function eth_abi_encode($types, $args) {
        $typedDataEncoder = new TypedDataEncoder();
        $abiEncoder = $typedDataEncoder->ethabi;
        // workaround to replace array() with []
        $types = preg_replace('/array\(\)/', '[]', $types);
        return hex2bin(str_replace('0x', '', $abiEncoder->encodeParameters($types, $args)));
    }

    public function eth_encode_structured_data($domainData, $messageTypes, $messageData) {
        $typedDataEncoder = new TypedDataEncoder();
        return $this->binary_concat(
            hex2bin('1901'),
            hex2bin(str_replace('0x', '', $typedDataEncoder->hashDomain($domainData))),
            hex2bin(str_replace('0x', '', $typedDataEncoder->hashEIP712Message($messageTypes, $messageData)))
        );
    }

    public function retrieve_stark_account($signature, $accountClassHash, $accountProxyClassHash) {
        $privateKey = Key::ethSigToPrivate($signature);
        $publicKey = Key::getStarkKey($privateKey);
        $calldata = [
            $accountClassHash,
            Hash::getSelectorFromName("initialize"),
            2,
            $publicKey,
            0,
        ];

        $address = Hash::computeAddress(
            $accountProxyClassHash,
            $calldata,
            $publicKey,
        );
        return [
            'privateKey' => $privateKey,
            'publicKey' => $publicKey,
            'address' => $address
        ];
    }

    public function convert_to_big_int($strVal) {
        // floatval is not big number, we should return either phpseclib\Math\BigInteger or BN\BN in the future
        // for now return string (only used in derive)
        return $strVal;
    }

    public function starknet_encode_structured_data($domain, $messageTypes, $messageData, $address) {
        if (count($messageTypes) > 1) {
            throw new NotSupported ($this->id + 'starknetEncodeStructuredData only support single type');
        }
        $msgHash = TypedData::messageHash($domain, $messageTypes, $messageData, $address);
        return $msgHash;
    }

    public function starknet_sign($msg_hash, $pri) {
        # // TODO: unify to ecdsa
        $signature = Curve::sign ('0x' . $pri, $msg_hash);
        return $this->json($signature);
    }

    public function packb($data) {
        return MessagePack::pack($data);
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

    public function setProxyAgents($httpProxy, $httpsProxy, $socksProxy) {
        if ($httpProxy) {
            curl_setopt($this->curl, CURLOPT_PROXY, $httpProxy);
            curl_setopt($this->curl, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
        }  else if ($httpsProxy) {
            curl_setopt($this->curl, CURLOPT_PROXY, $httpsProxy);
            curl_setopt($this->curl, CURLOPT_PROXYTYPE, CURLPROXY_HTTPS);
            // atm we don't make as tunnel
            // curl_setopt($this->curl, CURLOPT_TUNNEL, 1);
            // curl_setopt($this->curl, CURLOPT_SUPPRESS_CONNECT_HEADERS, 1);
        } else if ($socksProxy) {
            curl_setopt($this->curl, CURLOPT_PROXY, $socksProxy);
            curl_setopt($this->curl, CURLOPT_PROXYTYPE, CURLPROXY_SOCKS5);
        }
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {

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

        $this->last_request_headers = $headers;

        // ##### PROXY & HEADERS #####
        $headers = array_merge($this->headers, $headers ? $headers : array());
        // proxy-url
        $proxyUrl = $this->check_proxy_url_settings($url, $method, $headers, $body);
        if ($proxyUrl !== null) {
            $headers['Origin'] = $this->origin;
            $url = $proxyUrl . $this->url_encoder_for_proxy_url($url);
        }
        // proxy agents
        [ $httpProxy, $httpsProxy, $socksProxy ] = $this->check_proxy_settings($url, $method, $headers, $body);
        $this->check_conflicting_proxies($httpProxy || $httpsProxy || $socksProxy, $proxyUrl);
        $this->setProxyAgents($httpProxy, $httpsProxy, $socksProxy);
        // user-agent
        $userAgent = ($this->userAgent !== null) ? $this->userAgent : $this->user_agent;
        if ($userAgent) {
            if (gettype($userAgent) == 'string') {
                curl_setopt($this->curl, CURLOPT_USERAGENT, $userAgent);
                $headers = array_merge(['User-Agent' => $userAgent], $headers);
            } elseif ((gettype($userAgent) == 'array') && array_key_exists('User-Agent', $userAgent)) {
                curl_setopt($this->curl, CURLOPT_USERAGENT, $userAgent['User-Agent']);
                $headers = array_merge($userAgent, $headers);
            }
        }
        // set final headers
        $headers = $this->set_headers($headers);
        // log
        if ($this->verbose) {
            print_r(array('fetch Request:', $this->id, $method, $url, 'RequestHeaders:', $headers, 'RequestBody:', $body));
        }
        // end of proxies & headers

        // reorganize headers for curl
        if (is_array($headers)) {
            $tmp = $headers;
            $headers = array();
            foreach ($tmp as $key => $value) {
                $headers[] = $key . ': ' . $value;
            }
        }

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
            print_r(array('fetch Request:', $this->id, $method, $url, 'RequestHeaders:', $headers, 'RequestBody:', $body));
        }

        // we probably only need to set it once on startup
        if ($this->curlopt_interface) {
            curl_setopt($this->curl, CURLOPT_INTERFACE, $this->curlopt_interface);
        }

        curl_setopt($this->curl, CURLOPT_URL, $url);
        // end of proxy settings

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
        $http_status_text = count($parts) === 3 ? $parts[2] : '';
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
            if ($json_response && !array_is_list($json_response) && $this->returnResponseHeaders) {
                $json_response['responseHeaders'] = $response_headers;
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
        $http_status_text =  $http_status_text ?  $http_status_text : '';
        $skip_further_error_handling = $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $result ? $result : '', $json_response, $headers, $body);
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
            $this->options['cachedCurrencies'] = $currencies;
        }
        $markets = $this->fetch_markets($params);
        unset($this->options['cachedCurrencies']);
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
        if (stripos($str, 'e') > -1) {
            $numStr = preg_replace ('/\d\.?\d*[eE]/', '', $str);
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
        // support camelCase & snake_case functions
        if (!preg_match('/^[A-Z0-9_]+$/', $function)) {
            $underscore = static::underscore($function);
            if (method_exists($this, $underscore)) {
                return call_user_func_array(array($this, $underscore), $params);
            }
        }
        /* handle errors */
        throw new ExchangeError($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
    }

    public function add_method($function_name, $callback) {
        $function_name = strtolower($function_name);
        $this->overriden_methods[$function_name] = $callback;
    }

    public function call_method($function_name, $params = []) {
        $function_name = strtolower($function_name);
        if (is_callable($this->overriden_methods[$function_name])) {
            return call_user_func_array($this->overriden_methods[$function_name], $params);
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
        assert($numPrecisionDigits !== null, 'numPrecisionDigits should not be null');
        
        if (is_string($numPrecisionDigits)) {
            $numPrecisionDigits = (float) $numPrecisionDigits;
        }
        assert(is_numeric($numPrecisionDigits), 'numPrecisionDigits has an invalid number');

        if ($countingMode === TICK_SIZE) {
            assert($numPrecisionDigits > 0, 'negative or zero numPrecisionDigits can not be used with TICK_SIZE precisionMode');
        } else {
            assert(is_int($numPrecisionDigits), 'numPrecisionDigits must be an integer with DECIMAL_PLACES or SIGNIFICANT_DIGITS precisionMode');
        }

        assert(($roundingMode === ROUND) || ($roundingMode === TRUNCATE), 'invalid roundingMode provided');
        assert($countingMode === DECIMAL_PLACES || $countingMode === SIGNIFICANT_DIGITS || $countingMode === TICK_SIZE, 'invalid countingMode provided');
        assert($paddingMode === NO_PADDING || $paddingMode === PAD_WITH_ZERO, 'invalid paddingMode provided');
        // end of checks

        // remove any leading zeros (eg. '01234'=> '1234')
        $result = '';
        if (is_string($x)) {
            $x = ltrim($x, '0');
            if ($x === '' || $x === '.') {
                $x = '0';
            } elseif ($x[0] === '.') {
                $x = '0' . $x;
            }
        }
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
            $precisionDigitsString = static::decimal_to_precision($numPrecisionDigits, ROUND, 100, DECIMAL_PLACES);
            $newNumPrecisionDigits = static::precisionFromString($precisionDigitsString);

            if ($roundingMode === TRUNCATE) {
                $xStr = static::number_to_string($x);
                $dotIndex = strpos($xStr, '.');
                if ($dotIndex && $newNumPrecisionDigits >= 0) {
                    list($before, $after) = explode('.', $xStr);
                    $truncatedX = $before . '.' . substr($after, 0, max(0, $newNumPrecisionDigits));
                } else {
                    $truncatedX = $xStr;
                }
                $scale = pow(10, $newNumPrecisionDigits);
                $xScaled = round(floatval($truncatedX) * $scale);
                $tickScaled = round($numPrecisionDigits * $scale);
                $ticks = intval($xScaled / $tickScaled); // PHP's intval truncates towards zero
                $x = ($ticks * $tickScaled) / $scale;
                if ($paddingMode === NO_PADDING) {
                    $formatted = number_format($x, $newNumPrecisionDigits, '.', '');
                    // Only remove trailing zeros after decimal point
                    if (strpos($formatted, '.') !== false) {
                        $formatted = rtrim($formatted, '0');
                        $formatted = rtrim($formatted, '.');
                    }
                    return $formatted;
                }
                return static::decimal_to_precision($x, ROUND, $newNumPrecisionDigits, DECIMAL_PLACES, $paddingMode);
            }
            $missing = fmod($x, $numPrecisionDigits);
            $missing = floatval(static::decimal_to_precision($missing, ROUND, 8, DECIMAL_PLACES));
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
                if ($x == 0) {
                    $result = '0';
                } else {
                    // Calculate the position of the most significant digit
                    $significantPosition = floor(log10(abs($x)));
                    
                    // Calculate decimal places needed for the desired significant digits
                    $decimalPlaces = $numPrecisionDigits - $significantPosition - 1;
                    
                    if ($decimalPlaces < 0) {
                        // Need to round to a power of 10
                        $factor = pow(10, -$decimalPlaces);
                        $result = static::number_to_string(round($x / $factor) * $factor);
                    } else {
                        // Normal rounding with decimal places
                        $result = static::number_to_string(round($x, $decimalPlaces));
                    }
                }
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
                
                $str = (string) $x;
                $negative = ($str[0] === '-');
                if ($negative) {
                    $str = substr($str, 1);
                }
                
                // Find first significant digit and dot position
                $firstSigDigit = strcspn($str, '123456789');
                $dotPos = strpos($str, '.');
                $totalLen = strlen($str);
                
                if ($firstSigDigit === $totalLen) {
                    return '0'; // No significant digits
                }
                
                // Count significant digits we need
                $sigCount = 0;
                $resultLen = 0;
                
                for ($i = $firstSigDigit; $i < $totalLen && $sigCount < $numPrecisionDigits; $i++) {
                    if ($str[$i] !== '.') {
                        $sigCount++;
                    }
                    $resultLen = $i + 1;
                }
                
                // Extract the significant part
                $result = substr($str, 0, $resultLen);
                
                // If we have a decimal point
                if ($dotPos !== false) {
                    // If we stopped before the decimal, pad to the decimal
                    if ($resultLen <= $dotPos) {
                        $result = str_pad($result, $dotPos, '0');
                    }
                } else {
                    // No decimal point - if we stopped early, pad with zeros to maintain magnitude
                    if ($resultLen < $totalLen) {
                        // Replace remaining digits with zeros
                        $result = str_pad($result, $totalLen, '0');
                    }
                }
                
                // Handle trailing dot
                if (substr($result, -1) === '.') {
                    $result = substr($result, 0, -1);
                }
                
                // Add negative sign back if needed
                if ($negative && $result !== '0') {
                    $result = '-' . $result;
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
        return array_reduce(array_map('chr', $n->toArray('be', $padding)),  [__CLASS__, 'binary_concat']);
    }

    public static function number_to_le($n, $padding) {
        $n = new BN($n);
        return array_reduce(array_map('chr', $n->toArray('le', $padding)),  [__CLASS__, 'binary_concat']);
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
        try {
            if ($string_number === null || $string_number === '') {
                return null;
            }
            if (floatval($string_number) === 0.0) {
                return null;
            }
            return $string_number;
        } catch (Exception $e) {
            return $string_number;
        }
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

    function clone($obj) {
        return is_array($obj) ? $obj : $this->deep_extend($obj);
    }

    function parse_to_big_int($value) {
        return intval($value);
    }

    public function string_to_chars_array ($value) {
        return str_split($value);
    }

    function value_is_defined($value){
        return isset($value) && !is_null($value);
    }

    function array_slice($array, $first, $second = null){
        if (is_string($array)) {
            // this is needed because we convert
            // base64ToBinary to base64_decode in php
            return substr($array, $first, $second);
        }
        if ($second === null) {
            return array_slice($array, $first);
        } else {
            return array_slice($array, $first, $second);
        }
    }

    function get_property($obj, $property, $defaultValue = null){
        return (property_exists($obj, $property) ? $obj->$property : $defaultValue);
    }

    function set_property($obj, $property, $defaultValue = null){
        $obj->$property = $defaultValue;
    }

    function un_camel_case($str){
        return self::underscore($str);
    }

    public function fix_stringified_json_members($content) {
        // when stringified json has members with their values also stringified, like:
        // 'array("code":0, "data":array("order":array("orderId":1742968678528512345,"symbol":"BTC-USDT", "takeProfit":"array(\"type\":\"TAKE_PROFIT\",\"stopPrice\":43320.1)","reduceOnly":false)))'
        // we can fix with below manipulations
        // @ts-ignore
        $modifiedContent = str_replace('\\', '', $content);
        $modifiedContent = str_replace('"{', '{', $modifiedContent);
        $modifiedContent = str_replace('}"', '}', $modifiedContent);
        return $modifiedContent;
    }

    public function extend_exchange_options($newOptions) {
        $this->options = array_merge($this->options, $newOptions);
    }

    public function create_safe_dictionary() {
        return array();
    }

    public function convert_to_safe_dictionary($dict) {
        return $dict;
    }

    public function rand_number($size) {
        $number = '';
        for ($i = 0; $i < $size; $i++) {
            $number .= mt_rand(0, 9);
        }
        return (int)$number;
    }

    public function binary_length($binary) {
        return strlen($binary);
    }

    public function get_zk_contract_signature_obj($seed, $params) {
         throw new NotSupported ('Apex currently does not support create order in PHP language');
         return "";
    }

    public function get_zk_transfer_signature_obj($seed, $params) {
         throw new NotSupported ('Apex currently does not support transfer asset in PHP language');
         return "";
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

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    public function describe(): mixed {
        return array(
            'id' => null,
            'name' => null,
            'countries' => null,
            'enableRateLimit' => true,
            'rateLimit' => 2000, // milliseconds = seconds * 1000
            'timeout' => $this->timeout, // milliseconds = seconds * 1000
            'certified' => false, // if certified by the CCXT dev team
            'pro' => false, // if it is integrated with CCXT Pro for WebSocket support
            'alias' => false, // whether this exchange is an alias to another exchange
            'dex' => false,
            'has' => array(
                'publicAPI' => true,
                'privateAPI' => true,
                'CORS' => null,
                'sandbox' => null,
                'spot' => null,
                'margin' => null,
                'swap' => null,
                'future' => null,
                'option' => null,
                'addMargin' => null,
                'borrowCrossMargin' => null,
                'borrowIsolatedMargin' => null,
                'borrowMargin' => null,
                'cancelAllOrders' => null,
                'cancelAllOrdersWs' => null,
                'cancelOrder' => true,
                'cancelOrderWs' => null,
                'cancelOrders' => null,
                'cancelOrdersWs' => null,
                'closeAllPositions' => null,
                'closePosition' => null,
                'createDepositAddress' => null,
                'createLimitBuyOrder' => null,
                'createLimitBuyOrderWs' => null,
                'createLimitOrder' => true,
                'createLimitOrderWs' => null,
                'createLimitSellOrder' => null,
                'createLimitSellOrderWs' => null,
                'createMarketBuyOrder' => null,
                'createMarketBuyOrderWs' => null,
                'createMarketBuyOrderWithCost' => null,
                'createMarketBuyOrderWithCostWs' => null,
                'createMarketOrder' => true,
                'createMarketOrderWs' => true,
                'createMarketOrderWithCost' => null,
                'createMarketOrderWithCostWs' => null,
                'createMarketSellOrder' => null,
                'createMarketSellOrderWs' => null,
                'createMarketSellOrderWithCost' => null,
                'createMarketSellOrderWithCostWs' => null,
                'createOrder' => true,
                'createOrderWs' => null,
                'createOrders' => null,
                'createOrderWithTakeProfitAndStopLoss' => null,
                'createOrderWithTakeProfitAndStopLossWs' => null,
                'createPostOnlyOrder' => null,
                'createPostOnlyOrderWs' => null,
                'createReduceOnlyOrder' => null,
                'createReduceOnlyOrderWs' => null,
                'createStopLimitOrder' => null,
                'createStopLimitOrderWs' => null,
                'createStopLossOrder' => null,
                'createStopLossOrderWs' => null,
                'createStopMarketOrder' => null,
                'createStopMarketOrderWs' => null,
                'createStopOrder' => null,
                'createStopOrderWs' => null,
                'createTakeProfitOrder' => null,
                'createTakeProfitOrderWs' => null,
                'createTrailingAmountOrder' => null,
                'createTrailingAmountOrderWs' => null,
                'createTrailingPercentOrder' => null,
                'createTrailingPercentOrderWs' => null,
                'createTriggerOrder' => null,
                'createTriggerOrderWs' => null,
                'deposit' => null,
                'editOrder' => 'emulated',
                'editOrders' => null,
                'editOrderWs' => null,
                'fetchAccounts' => null,
                'fetchBalance' => true,
                'fetchBalanceWs' => null,
                'fetchBidsAsks' => null,
                'fetchBorrowInterest' => null,
                'fetchBorrowRate' => null,
                'fetchBorrowRateHistories' => null,
                'fetchBorrowRateHistory' => null,
                'fetchBorrowRates' => null,
                'fetchBorrowRatesPerSymbol' => null,
                'fetchCanceledAndClosedOrders' => null,
                'fetchCanceledOrders' => null,
                'fetchClosedOrder' => null,
                'fetchClosedOrders' => null,
                'fetchClosedOrdersWs' => null,
                'fetchConvertCurrencies' => null,
                'fetchConvertQuote' => null,
                'fetchConvertTrade' => null,
                'fetchConvertTradeHistory' => null,
                'fetchCrossBorrowRate' => null,
                'fetchCrossBorrowRates' => null,
                'fetchCurrencies' => 'emulated',
                'fetchCurrenciesWs' => 'emulated',
                'fetchDeposit' => null,
                'fetchDepositAddress' => null,
                'fetchDepositAddresses' => null,
                'fetchDepositAddressesByNetwork' => null,
                'fetchDeposits' => null,
                'fetchDepositsWithdrawals' => null,
                'fetchDepositsWs' => null,
                'fetchDepositWithdrawFee' => null,
                'fetchDepositWithdrawFees' => null,
                'fetchFundingHistory' => null,
                'fetchFundingRate' => null,
                'fetchFundingRateHistory' => null,
                'fetchFundingInterval' => null,
                'fetchFundingIntervals' => null,
                'fetchFundingRates' => null,
                'fetchGreeks' => null,
                'fetchIndexOHLCV' => null,
                'fetchIsolatedBorrowRate' => null,
                'fetchIsolatedBorrowRates' => null,
                'fetchMarginAdjustmentHistory' => null,
                'fetchIsolatedPositions' => null,
                'fetchL2OrderBook' => true,
                'fetchL3OrderBook' => null,
                'fetchLastPrices' => null,
                'fetchLedger' => null,
                'fetchLedgerEntry' => null,
                'fetchLeverage' => null,
                'fetchLeverages' => null,
                'fetchLeverageTiers' => null,
                'fetchLiquidations' => null,
                'fetchLongShortRatio' => null,
                'fetchLongShortRatioHistory' => null,
                'fetchMarginMode' => null,
                'fetchMarginModes' => null,
                'fetchMarketLeverageTiers' => null,
                'fetchMarkets' => true,
                'fetchMarketsWs' => null,
                'fetchMarkOHLCV' => null,
                'fetchMyLiquidations' => null,
                'fetchMySettlementHistory' => null,
                'fetchMyTrades' => null,
                'fetchMyTradesWs' => null,
                'fetchOHLCV' => null,
                'fetchOHLCVWs' => null,
                'fetchOpenInterest' => null,
                'fetchOpenInterests' => null,
                'fetchOpenInterestHistory' => null,
                'fetchOpenOrder' => null,
                'fetchOpenOrders' => null,
                'fetchOpenOrdersWs' => null,
                'fetchOption' => null,
                'fetchOptionChain' => null,
                'fetchOrder' => null,
                'fetchOrderBook' => true,
                'fetchOrderBooks' => null,
                'fetchOrderBookWs' => null,
                'fetchOrders' => null,
                'fetchOrdersByStatus' => null,
                'fetchOrdersWs' => null,
                'fetchOrderTrades' => null,
                'fetchOrderWs' => null,
                'fetchPosition' => null,
                'fetchPositionHistory' => null,
                'fetchPositionsHistory' => null,
                'fetchPositionWs' => null,
                'fetchPositionMode' => null,
                'fetchPositions' => null,
                'fetchPositionsWs' => null,
                'fetchPositionsForSymbol' => null,
                'fetchPositionsForSymbolWs' => null,
                'fetchPositionsRisk' => null,
                'fetchPremiumIndexOHLCV' => null,
                'fetchSettlementHistory' => null,
                'fetchStatus' => null,
                'fetchTicker' => true,
                'fetchTickerWs' => null,
                'fetchTickers' => null,
                'fetchMarkPrices' => null,
                'fetchTickersWs' => null,
                'fetchTime' => null,
                'fetchTrades' => true,
                'fetchTradesWs' => null,
                'fetchTradingFee' => null,
                'fetchTradingFees' => null,
                'fetchTradingFeesWs' => null,
                'fetchTradingLimits' => null,
                'fetchTransactionFee' => null,
                'fetchTransactionFees' => null,
                'fetchTransactions' => null,
                'fetchTransfer' => null,
                'fetchTransfers' => null,
                'fetchUnderlyingAssets' => null,
                'fetchVolatilityHistory' => null,
                'fetchWithdrawAddresses' => null,
                'fetchWithdrawal' => null,
                'fetchWithdrawals' => null,
                'fetchWithdrawalsWs' => null,
                'fetchWithdrawalWhitelist' => null,
                'reduceMargin' => null,
                'repayCrossMargin' => null,
                'repayIsolatedMargin' => null,
                'setLeverage' => null,
                'setMargin' => null,
                'setMarginMode' => null,
                'setPositionMode' => null,
                'signIn' => null,
                'transfer' => null,
                'watchBalance' => null,
                'watchMyTrades' => null,
                'watchOHLCV' => null,
                'watchOHLCVForSymbols' => null,
                'watchOrderBook' => null,
                'watchBidsAsks' => null,
                'watchOrderBookForSymbols' => null,
                'watchOrders' => null,
                'watchOrdersForSymbols' => null,
                'watchPosition' => null,
                'watchPositions' => null,
                'watchStatus' => null,
                'watchTicker' => null,
                'watchTickers' => null,
                'watchTrades' => null,
                'watchTradesForSymbols' => null,
                'watchLiquidations' => null,
                'watchLiquidationsForSymbols' => null,
                'watchMyLiquidations' => null,
                'unWatchOrders' => null,
                'unWatchTrades' => null,
                'unWatchTradesForSymbols' => null,
                'unWatchOHLCVForSymbols' => null,
                'unWatchOrderBookForSymbols' => null,
                'unWatchPositions' => null,
                'unWatchOrderBook' => null,
                'unWatchTickers' => null,
                'unWatchMyTrades' => null,
                'unWatchTicker' => null,
                'unWatchOHLCV' => null,
                'watchMyLiquidationsForSymbols' => null,
                'withdraw' => null,
                'ws' => null,
            ),
            'urls' => array(
                'logo' => null,
                'api' => null,
                'www' => null,
                'doc' => null,
                'fees' => null,
            ),
            'api' => null,
            'requiredCredentials' => array(
                'apiKey' => true,
                'secret' => true,
                'uid' => false,
                'accountId' => false,
                'login' => false,
                'password' => false,
                'twofa' => false, // 2-factor authentication (one-time password key)
                'privateKey' => false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress' => false, // the wallet address "0x"-prefixed hexstring
                'token' => false, // reserved for HTTP auth in some cases
            ),
            'markets' => null, // to be filled manually or by fetchMarkets
            'currencies' => array(), // to be filled manually or by fetchMarkets
            'timeframes' => null, // redefine if the exchange has.fetchOHLCV
            'fees' => array(
                'trading' => array(
                    'tierBased' => null,
                    'percentage' => null,
                    'taker' => null,
                    'maker' => null,
                ),
                'funding' => array(
                    'tierBased' => null,
                    'percentage' => null,
                    'withdraw' => array(),
                    'deposit' => array(),
                ),
            ),
            'status' => array(
                'status' => 'ok',
                'updated' => null,
                'eta' => null,
                'url' => null,
            ),
            'exceptions' => null,
            'httpExceptions' => array(
                '422' => '\\ccxt\\ExchangeError',
                '418' => '\\ccxt\\DDoSProtection',
                '429' => '\\ccxt\\RateLimitExceeded',
                '404' => '\\ccxt\\ExchangeNotAvailable',
                '409' => '\\ccxt\\ExchangeNotAvailable',
                '410' => '\\ccxt\\ExchangeNotAvailable',
                '451' => '\\ccxt\\ExchangeNotAvailable',
                '500' => '\\ccxt\\ExchangeNotAvailable',
                '501' => '\\ccxt\\ExchangeNotAvailable',
                '502' => '\\ccxt\\ExchangeNotAvailable',
                '520' => '\\ccxt\\ExchangeNotAvailable',
                '521' => '\\ccxt\\ExchangeNotAvailable',
                '522' => '\\ccxt\\ExchangeNotAvailable',
                '525' => '\\ccxt\\ExchangeNotAvailable',
                '526' => '\\ccxt\\ExchangeNotAvailable',
                '400' => '\\ccxt\\ExchangeNotAvailable',
                '403' => '\\ccxt\\ExchangeNotAvailable',
                '405' => '\\ccxt\\ExchangeNotAvailable',
                '503' => '\\ccxt\\ExchangeNotAvailable',
                '530' => '\\ccxt\\ExchangeNotAvailable',
                '408' => '\\ccxt\\RequestTimeout',
                '504' => '\\ccxt\\RequestTimeout',
                '401' => '\\ccxt\\AuthenticationError',
                '407' => '\\ccxt\\AuthenticationError',
                '511' => '\\ccxt\\AuthenticationError',
            ),
            'commonCurrencies' => array(
                'XBT' => 'BTC',
                'BCHSV' => 'BSV',
            ),
            'precisionMode' => TICK_SIZE,
            'paddingMode' => NO_PADDING,
            'limits' => array(
                'leverage' => array( 'min' => null, 'max' => null ),
                'amount' => array( 'min' => null, 'max' => null ),
                'price' => array( 'min' => null, 'max' => null ),
                'cost' => array( 'min' => null, 'max' => null ),
            ),
        );
    }

    public function safe_bool_n($dictionaryOrList, array $keys, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean $value from dictionary or list
         * @return array(bool | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if (is_bool($value)) {
            return $value;
        }
        return $defaultValue;
    }

    public function safe_bool_2($dictionary, int|string $key1, int|string $key2, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean value from $dictionary or list
         * @return array(bool | null)
         */
        return $this->safe_bool_n($dictionary, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_bool($dictionary, int|string $key, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean value from $dictionary or list
         * @return array(bool | null)
         */
        return $this->safe_bool_n($dictionary, array( $key ), $defaultValue);
    }

    public function safe_dict_n($dictionaryOrList, array $keys, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a dictionary from dictionary or list
         * @return array(object | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if ($value === null) {
            return $defaultValue;
        }
        if ((gettype($value) === 'array')) {
            if (gettype($value) !== 'array' || array_keys($value) !== array_keys(array_keys($value))) {
                return $value;
            }
        }
        return $defaultValue;
    }

    public function safe_dict($dictionary, int|string $key, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a $dictionary from $dictionary or list
         * @return array(object | null)
         */
        return $this->safe_dict_n($dictionary, array( $key ), $defaultValue);
    }

    public function safe_dict_2($dictionary, int|string $key1, string $key2, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a $dictionary from $dictionary or list
         * @return array(object | null)
         */
        return $this->safe_dict_n($dictionary, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_list_n($dictionaryOrList, array $keys, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if ($value === null) {
            return $defaultValue;
        }
        if (gettype($value) === 'array' && array_keys($value) === array_keys(array_keys($value))) {
            return $value;
        }
        return $defaultValue;
    }

    public function safe_list_2($dictionaryOrList, int|string $key1, string $key2, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        return $this->safe_list_n($dictionaryOrList, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_list($dictionaryOrList, int|string $key, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        return $this->safe_list_n($dictionaryOrList, array( $key ), $defaultValue);
    }

    public function handle_deltas($orderbook, $deltas) {
        for ($i = 0; $i < count($deltas); $i++) {
            $this->handle_delta($orderbook, $deltas[$i]);
        }
    }

    public function handle_delta($bookside, $delta) {
        throw new NotSupported($this->id . ' handleDelta not supported yet');
    }

    public function handle_deltas_with_keys(mixed $bookSide, $deltas, int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        for ($i = 0; $i < count($deltas); $i++) {
            $bidAsk = $this->parse_bid_ask($deltas[$i], $priceKey, $amountKey, $countOrIdKey);
            $bookSide->storeArray ($bidAsk);
        }
    }

    public function get_cache_index($orderbook, $deltas) {
        // return the first index of the cache that can be applied to the $orderbook or -1 if not possible
        return -1;
    }

    public function arrays_concat(array $arraysOfArrays) {
        $result = array();
        for ($i = 0; $i < count($arraysOfArrays); $i++) {
            $result = $this->array_concat($result, $arraysOfArrays[$i]);
        }
        return $result;
    }

    public function find_timeframe($timeframe, $timeframes = null) {
        if ($timeframes === null) {
            $timeframes = $this->timeframes;
        }
        $keys = is_array($timeframes) ? array_keys($timeframes) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($timeframes[$key] === $timeframe) {
                return $key;
            }
        }
        return null;
    }

    public function check_proxy_url_settings(?string $url = null, ?string $method = null, $headers = null, $body = null) {
        $usedProxies = array();
        $proxyUrl = null;
        if ($this->proxyUrl !== null) {
            $usedProxies[] = 'proxyUrl';
            $proxyUrl = $this->proxyUrl;
        }
        if ($this->proxy_url !== null) {
            $usedProxies[] = 'proxy_url';
            $proxyUrl = $this->proxy_url;
        }
        if ($this->proxyUrlCallback !== null) {
            $usedProxies[] = 'proxyUrlCallback';
            $proxyUrl = $this->proxyUrlCallback ($url, $method, $headers, $body);
        }
        if ($this->proxy_url_callback !== null) {
            $usedProxies[] = 'proxy_url_callback';
            $proxyUrl = $this->proxy_url_callback ($url, $method, $headers, $body);
        }
        // backwards-compatibility
        if ($this->proxy !== null) {
            $usedProxies[] = 'proxy';
            if (is_callable($this->proxy)) {
                $proxyUrl = $this->proxy ($url, $method, $headers, $body);
            } else {
                $proxyUrl = $this->proxy;
            }
        }
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new InvalidProxySettings($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from : $proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback');
        }
        return $proxyUrl;
    }

    public function url_encoder_for_proxy_url(string $targetUrl) {
        // to be overriden
        $includesQuery = mb_strpos($targetUrl, '?') !== false;
        $finalUrl = $includesQuery ? $this->encode_uri_component($targetUrl) : $targetUrl;
        return $finalUrl;
    }

    public function check_proxy_settings(?string $url = null, ?string $method = null, $headers = null, $body = null) {
        $usedProxies = array();
        $httpProxy = null;
        $httpsProxy = null;
        $socksProxy = null;
        // $httpProxy
        $isHttpProxyDefined = $this->value_is_defined($this->httpProxy);
        $isHttp_proxy_defined = $this->value_is_defined($this->http_proxy);
        if ($isHttpProxyDefined || $isHttp_proxy_defined) {
            $usedProxies[] = 'httpProxy';
            $httpProxy = $isHttpProxyDefined ? $this->httpProxy : $this->http_proxy;
        }
        $ishttpProxyCallbackDefined = $this->value_is_defined($this->httpProxyCallback);
        $ishttp_proxy_callback_defined = $this->value_is_defined($this->http_proxy_callback);
        if ($ishttpProxyCallbackDefined || $ishttp_proxy_callback_defined) {
            $usedProxies[] = 'httpProxyCallback';
            $httpProxy = $ishttpProxyCallbackDefined ? $this->httpProxyCallback ($url, $method, $headers, $body) : $this->http_proxy_callback ($url, $method, $headers, $body);
        }
        // $httpsProxy
        $isHttpsProxyDefined = $this->value_is_defined($this->httpsProxy);
        $isHttps_proxy_defined = $this->value_is_defined($this->https_proxy);
        if ($isHttpsProxyDefined || $isHttps_proxy_defined) {
            $usedProxies[] = 'httpsProxy';
            $httpsProxy = $isHttpsProxyDefined ? $this->httpsProxy : $this->https_proxy;
        }
        $ishttpsProxyCallbackDefined = $this->value_is_defined($this->httpsProxyCallback);
        $ishttps_proxy_callback_defined = $this->value_is_defined($this->https_proxy_callback);
        if ($ishttpsProxyCallbackDefined || $ishttps_proxy_callback_defined) {
            $usedProxies[] = 'httpsProxyCallback';
            $httpsProxy = $ishttpsProxyCallbackDefined ? $this->httpsProxyCallback ($url, $method, $headers, $body) : $this->https_proxy_callback ($url, $method, $headers, $body);
        }
        // $socksProxy
        $isSocksProxyDefined = $this->value_is_defined($this->socksProxy);
        $isSocks_proxy_defined = $this->value_is_defined($this->socks_proxy);
        if ($isSocksProxyDefined || $isSocks_proxy_defined) {
            $usedProxies[] = 'socksProxy';
            $socksProxy = $isSocksProxyDefined ? $this->socksProxy : $this->socks_proxy;
        }
        $issocksProxyCallbackDefined = $this->value_is_defined($this->socksProxyCallback);
        $issocks_proxy_callback_defined = $this->value_is_defined($this->socks_proxy_callback);
        if ($issocksProxyCallbackDefined || $issocks_proxy_callback_defined) {
            $usedProxies[] = 'socksProxyCallback';
            $socksProxy = $issocksProxyCallbackDefined ? $this->socksProxyCallback ($url, $method, $headers, $body) : $this->socks_proxy_callback ($url, $method, $headers, $body);
        }
        // check
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new InvalidProxySettings($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from => $httpProxy, $httpsProxy, httpProxyCallback, httpsProxyCallback, $socksProxy, socksProxyCallback');
        }
        return array( $httpProxy, $httpsProxy, $socksProxy );
    }

    public function check_ws_proxy_settings() {
        $usedProxies = array();
        $wsProxy = null;
        $wssProxy = null;
        $wsSocksProxy = null;
        // ws proxy
        $isWsProxyDefined = $this->value_is_defined($this->wsProxy);
        $is_ws_proxy_defined = $this->value_is_defined($this->ws_proxy);
        if ($isWsProxyDefined || $is_ws_proxy_defined) {
            $usedProxies[] = 'wsProxy';
            $wsProxy = ($isWsProxyDefined) ? $this->wsProxy : $this->ws_proxy;
        }
        // wss proxy
        $isWssProxyDefined = $this->value_is_defined($this->wssProxy);
        $is_wss_proxy_defined = $this->value_is_defined($this->wss_proxy);
        if ($isWssProxyDefined || $is_wss_proxy_defined) {
            $usedProxies[] = 'wssProxy';
            $wssProxy = ($isWssProxyDefined) ? $this->wssProxy : $this->wss_proxy;
        }
        // ws socks proxy
        $isWsSocksProxyDefined = $this->value_is_defined($this->wsSocksProxy);
        $is_ws_socks_proxy_defined = $this->value_is_defined($this->ws_socks_proxy);
        if ($isWsSocksProxyDefined || $is_ws_socks_proxy_defined) {
            $usedProxies[] = 'wsSocksProxy';
            $wsSocksProxy = ($isWsSocksProxyDefined) ? $this->wsSocksProxy : $this->ws_socks_proxy;
        }
        // check
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new InvalidProxySettings($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from => $wsProxy, $wssProxy, wsSocksProxy');
        }
        return array( $wsProxy, $wssProxy, $wsSocksProxy );
    }

    public function check_conflicting_proxies($proxyAgentSet, $proxyUrlSet) {
        if ($proxyAgentSet && $proxyUrlSet) {
            throw new InvalidProxySettings($this->id . ' you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy');
        }
    }

    public function check_address(?string $address = null) {
        if ($address === null) {
            throw new InvalidAddress($this->id . ' $address is null');
        }
        // check the $address is not the same letter like 'aaaaa' nor too short nor has a space
        $uniqChars = ($this->unique($this->string_to_chars_array($address)));
        $length = count($uniqChars); // py transpiler trick
        if ($length === 1 || strlen($address) < $this->minFundingAddressLength || mb_strpos($address, ' ') > -1) {
            throw new InvalidAddress($this->id . ' $address is invalid or has less than ' . (string) $this->minFundingAddressLength . ' characters => "' . (string) $address . '"');
        }
        return $address;
    }

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

    public function filter_by_limit(mixed $array, ?int $limit = null, int|string $key = 'timestamp', bool $fromStart = false) {
        if ($this->value_is_defined($limit)) {
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
                if ($fromStart) {
                    if ($limit > $arrayLength) {
                        $limit = $arrayLength;
                    }
                    // $array = $ascending ? $this->array_slice($array, 0, $limit) : $this->array_slice($array, -$limit);
                    if ($ascending) {
                        $array = $this->array_slice($array, 0, $limit);
                    } else {
                        $array = $this->array_slice($array, -$limit);
                    }
                } else {
                    // $array = $ascending ? $this->array_slice($array, -$limit) : $this->array_slice($array, 0, $limit);
                    if ($ascending) {
                        $array = $this->array_slice($array, -$limit);
                    } else {
                        $array = $this->array_slice($array, 0, $limit);
                    }
                }
            }
        }
        return $array;
    }

    public function filter_by_since_limit(mixed $array, ?int $since = null, ?int $limit = null, int|string $key = 'timestamp', $tail = false) {
        $sinceIsDefined = $this->value_is_defined($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        if ($sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                $value = $this->safe_value($entry, $key);
                if ($value && ($value >= $since)) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail && $limit !== null) {
            return $this->array_slice($result, -$limit);
        }
        // if the user provided a 'since' argument
        // we want to $limit the $result starting from the 'since'
        $shouldFilterFromStart = !$tail && $sinceIsDefined;
        return $this->filter_by_limit($result, $limit, $key, $shouldFilterFromStart);
    }

    public function filter_by_value_since_limit(mixed $array, int|string $field, $value = null, ?int $since = null, ?int $limit = null, $key = 'timestamp', $tail = false) {
        $valueIsDefined = $this->value_is_defined($value);
        $sinceIsDefined = $this->value_is_defined($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        // single-pass filter for both symbol and $since
        if ($valueIsDefined || $sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                $entryFiledEqualValue = $entry[$field] === $value;
                $firstCondition = $valueIsDefined ? $entryFiledEqualValue : true;
                $entryKeyValue = $this->safe_value($entry, $key);
                $entryKeyGESince = ($entryKeyValue) && ($since !== null) && ($entryKeyValue >= $since);
                $secondCondition = $sinceIsDefined ? $entryKeyGESince : true;
                if ($firstCondition && $secondCondition) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail && $limit !== null) {
            return $this->array_slice($result, -$limit);
        }
        return $this->filter_by_limit($result, $limit, $key, $sinceIsDefined);
    }

    public function set_sandbox_mode(bool $enabled) {
        /**
         * set the sandbox mode for the exchange
         * @param {boolean} $enabled true to enable sandbox mode, false to disable it
         */
        if ($enabled) {
            if (is_array($this->urls) && array_key_exists('test', $this->urls)) {
                if (gettype($this->urls['api']) === 'string') {
                    $this->urls['apiBackup'] = $this->urls['api'];
                    $this->urls['api'] = $this->urls['test'];
                } else {
                    $this->urls['apiBackup'] = $this->clone($this->urls['api']);
                    $this->urls['api'] = $this->clone($this->urls['test']);
                }
            } else {
                throw new NotSupported($this->id . ' does not have a sandbox URL');
            }
            // set flag
            $this->isSandboxModeEnabled = true;
        } elseif (is_array($this->urls) && array_key_exists('apiBackup', $this->urls)) {
            if (gettype($this->urls['api']) === 'string') {
                $this->urls['api'] = $this->urls['apiBackup'];
            } else {
                $this->urls['api'] = $this->clone($this->urls['apiBackup']);
            }
            $newUrls = $this->omit($this->urls, 'apiBackup');
            $this->urls = $newUrls;
            // set flag
            $this->isSandboxModeEnabled = false;
        }
    }

    public function enable_demo_trading(bool $enable) {
        /**
         * enables or disables demo trading mode
         * @param {boolean} [$enable] true if demo trading should be enabled, false otherwise
         */
        if ($this->isSandboxModeEnabled) {
            throw new NotSupported($this->id . ' demo trading does not support in sandbox environment. Please check https://www.binance.com/en/support/faq/detail/9be58f73e5e14338809e3b705b9687dd to see the differences');
        }
        if ($enable) {
            $this->urls['apiBackupDemoTrading'] = $this->urls['api'];
            $this->urls['api'] = $this->urls['demo'];
        } elseif (is_array($this->urls) && array_key_exists('apiBackupDemoTrading', $this->urls)) {
            $this->urls['api'] = $this->urls['apiBackupDemoTrading'];
            $newUrls = $this->omit($this->urls, 'apiBackupDemoTrading');
            $this->urls = $newUrls;
        }
        $this->options['enableDemoTrading'] = $enable;
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

    public function fetch_trades_ws(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTradesWs() is not supported yet');
    }

    public function watch_liquidations(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['watchLiquidationsForSymbols']) {
            return $this->watch_liquidations_for_symbols(array( $symbol ), $since, $limit, $params);
        }
        throw new NotSupported($this->id . ' watchLiquidations() is not supported yet');
    }

    public function watch_liquidations_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchLiquidationsForSymbols() is not supported yet');
    }

    public function watch_my_liquidations(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['watchMyLiquidationsForSymbols']) {
            return $this->watch_my_liquidations_for_symbols(array( $symbol ), $since, $limit, $params);
        }
        throw new NotSupported($this->id . ' watchMyLiquidations() is not supported yet');
    }

    public function watch_my_liquidations_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyLiquidationsForSymbols() is not supported yet');
    }

    public function watch_trades(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTrades() is not supported yet');
    }

    public function un_watch_orders(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchOrders() is not supported yet');
    }

    public function un_watch_trades(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchTrades() is not supported yet');
    }

    public function watch_trades_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTradesForSymbols() is not supported yet');
    }

    public function un_watch_trades_for_symbols(array $symbols, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchTradesForSymbols() is not supported yet');
    }

    public function watch_my_trades_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyTradesForSymbols() is not supported yet');
    }

    public function watch_orders_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrdersForSymbols() is not supported yet');
    }

    public function watch_ohlcv_for_symbols(array $symbolsAndTimeframes, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOHLCVForSymbols() is not supported yet');
    }

    public function un_watch_ohlcv_for_symbols(array $symbolsAndTimeframes, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchOHLCVForSymbols() is not supported yet');
    }

    public function watch_order_book_for_symbols(array $symbols, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrderBookForSymbols() is not supported yet');
    }

    public function un_watch_order_book_for_symbols(array $symbols, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchOrderBookForSymbols() is not supported yet');
    }

    public function un_watch_positions(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchPositions() is not supported yet');
    }

    public function un_watch_ticker(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchTicker() is not supported yet');
    }

    public function fetch_deposit_addresses(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddresses() is not supported yet');
    }

    public function fetch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBook() is not supported yet');
    }

    public function fetch_order_book_ws(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBookWs() is not supported yet');
    }

    public function fetch_margin_mode(string $symbol, $params = array ()) {
        if ($this->has['fetchMarginModes']) {
            $marginModes = $this->fetch_margin_modes(array( $symbol ), $params);
            return $this->safe_dict($marginModes, $symbol);
        } else {
            throw new NotSupported($this->id . ' fetchMarginMode() is not supported yet');
        }
    }

    public function fetch_margin_modes(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMarginModes () is not supported yet');
    }

    public function fetch_rest_order_book_safe($symbol, $limit = null, $params = array ()) {
        $fetchSnapshotMaxRetries = $this->handle_option('watchOrderBook', 'maxRetries', 3);
        for ($i = 0; $i < $fetchSnapshotMaxRetries; $i++) {
            try {
                $orderBook = $this->fetch_order_book($symbol, $limit, $params);
                return $orderBook;
            } catch (Exception $e) {
                if (($i + 1) === $fetchSnapshotMaxRetries) {
                    throw $e;
                }
            }
        }
        return null;
    }

    public function watch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrderBook() is not supported yet');
    }

    public function un_watch_order_book(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchOrderBook() is not supported yet');
    }

    public function fetch_time($params = array ()) {
        throw new NotSupported($this->id . ' fetchTime() is not supported yet');
    }

    public function fetch_trading_limits(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingLimits() is not supported yet');
    }

    public function parse_currency(array $rawCurrency) {
        throw new NotSupported($this->id . ' parseCurrency() is not supported yet');
    }

    public function parse_currencies($rawCurrencies) {
        $result = array();
        $arr = $this->to_array($rawCurrencies);
        for ($i = 0; $i < count($arr); $i++) {
            $parsed = $this->parse_currency($arr[$i]);
            $code = $parsed['code'];
            $result[$code] = $parsed;
        }
        return $result;
    }

    public function parse_market(array $market) {
        throw new NotSupported($this->id . ' parseMarket() is not supported yet');
    }

    public function parse_markets($markets) {
        $result = array();
        for ($i = 0; $i < count($markets); $i++) {
            $result[] = $this->parse_market($markets[$i]);
        }
        return $result;
    }

    public function parse_ticker(array $ticker, ?array $market = null) {
        throw new NotSupported($this->id . ' parseTicker() is not supported yet');
    }

    public function parse_deposit_address($depositAddress, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseDepositAddress() is not supported yet');
    }

    public function parse_trade(array $trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseTrade() is not supported yet');
    }

    public function parse_transaction(array $transaction, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseTransaction() is not supported yet');
    }

    public function parse_transfer(array $transfer, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseTransfer() is not supported yet');
    }

    public function parse_account(array $account) {
        throw new NotSupported($this->id . ' parseAccount() is not supported yet');
    }

    public function parse_ledger_entry(array $item, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseLedgerEntry() is not supported yet');
    }

    public function parse_order(array $order, ?array $market = null) {
        throw new NotSupported($this->id . ' parseOrder() is not supported yet');
    }

    public function fetch_cross_borrow_rates($params = array ()) {
        throw new NotSupported($this->id . ' fetchCrossBorrowRates() is not supported yet');
    }

    public function fetch_isolated_borrow_rates($params = array ()) {
        throw new NotSupported($this->id . ' fetchIsolatedBorrowRates() is not supported yet');
    }

    public function parse_market_leverage_tiers($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseMarketLeverageTiers() is not supported yet');
    }

    public function fetch_leverage_tiers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLeverageTiers() is not supported yet');
    }

    public function parse_position(array $position, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePosition() is not supported yet');
    }

    public function parse_funding_rate_history($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseFundingRateHistory() is not supported yet');
    }

    public function parse_borrow_interest(array $info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseBorrowInterest() is not supported yet');
    }

    public function parse_isolated_borrow_rate(array $info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseIsolatedBorrowRate() is not supported yet');
    }

    public function parse_ws_trade(array $trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsTrade() is not supported yet');
    }

    public function parse_ws_order(array $order, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsOrder() is not supported yet');
    }

    public function parse_ws_order_trade(array $trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsOrderTrade() is not supported yet');
    }

    public function parse_ws_ohlcv($ohlcv, ?array $market = null) {
        return $this->parse_ohlcv($ohlcv, $market);
    }

    public function fetch_funding_rates(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingRates() is not supported yet');
    }

    public function fetch_funding_intervals(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingIntervals() is not supported yet');
    }

    public function watch_funding_rate(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' watchFundingRate() is not supported yet');
    }

    public function watch_funding_rates(array $symbols, $params = array ()) {
        throw new NotSupported($this->id . ' watchFundingRates() is not supported yet');
    }

    public function watch_funding_rates_for_symbols(array $symbols, $params = array ()) {
        return $this->watch_funding_rates($symbols, $params);
    }

    public function transfer(string $code, float $amount, string $fromAccount, string $toAccount, $params = array ()) {
        throw new NotSupported($this->id . ' transfer() is not supported yet');
    }

    public function withdraw(string $code, float $amount, string $address, ?string $tag = null, $params = array ()) {
        throw new NotSupported($this->id . ' withdraw() is not supported yet');
    }

    public function create_deposit_address(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' createDepositAddress() is not supported yet');
    }

    public function set_leverage(int $leverage, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setLeverage() is not supported yet');
    }

    public function fetch_leverage(string $symbol, $params = array ()) {
        if ($this->has['fetchLeverages']) {
            $leverages = $this->fetch_leverages(array( $symbol ), $params);
            return $this->safe_dict($leverages, $symbol);
        } else {
            throw new NotSupported($this->id . ' fetchLeverage() is not supported yet');
        }
    }

    public function fetch_leverages(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLeverages() is not supported yet');
    }

    public function set_position_mode(bool $hedged, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setPositionMode() is not supported yet');
    }

    public function add_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' addMargin() is not supported yet');
    }

    public function reduce_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' reduceMargin() is not supported yet');
    }

    public function set_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' setMargin() is not supported yet');
    }

    public function fetch_long_short_ratio(string $symbol, ?string $timeframe = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLongShortRatio() is not supported yet');
    }

    public function fetch_long_short_ratio_history(?string $symbol = null, ?string $timeframe = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLongShortRatioHistory() is not supported yet');
    }

    public function fetch_margin_adjustment_history(?string $symbol = null, ?string $type = null, ?float $since = null, ?float $limit = null, $params = array ()) {
        /**
         * fetches the history of margin added or reduced from contract isolated positions
         * @param {string} [$symbol] unified market $symbol
         * @param {string} [$type] "add" or "reduce"
         * @param {int} [$since] timestamp in ms of the earliest change to fetch
         * @param {int} [$limit] the maximum amount of changes to fetch
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=margin-loan-structure margin structures~
         */
        throw new NotSupported($this->id . ' fetchMarginAdjustmentHistory() is not supported yet');
    }

    public function set_margin_mode(string $marginMode, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setMarginMode() is not supported yet');
    }

    public function fetch_deposit_addresses_by_network(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddressesByNetwork() is not supported yet');
    }

    public function fetch_open_interest_history(string $symbol, string $timeframe = '1h', ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenInterestHistory() is not supported yet');
    }

    public function fetch_open_interest(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenInterest() is not supported yet');
    }

    public function fetch_open_interests(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenInterests() is not supported yet');
    }

    public function sign_in($params = array ()) {
        throw new NotSupported($this->id . ' signIn() is not supported yet');
    }

    public function fetch_payment_methods($params = array ()) {
        throw new NotSupported($this->id . ' fetchPaymentMethods() is not supported yet');
    }

    public function parse_to_int($number) {
        // Solve Common intvalmisuse ex => intval((since / (string) 1000))
        // using a $number which is not valid in ts
        $stringifiedNumber = $this->number_to_string($number);
        $convertedNumber = floatval($stringifiedNumber);
        return intval($convertedNumber);
    }

    public function parse_to_numeric($number) {
        $stringVersion = $this->number_to_string($number); // this will convert 1.0 and 1 to "1" and 1.1 to "1.1"
        // keep this in mind:
        // in JS =>     1 === 1.0 is true
        // in Python => 1 == 1.0 is true
        // in PHP =>    1 == 1.0 is true, but 1 === 1.0 is false.
        if (mb_strpos($stringVersion, '.') !== false) {
            return floatval($stringVersion);
        }
        return intval($stringVersion);
    }

    public function is_round_number(float $value) {
        // this method is similar to isInteger, but this is more loyal and does not check for types.
        // i.e. isRoundNumber(1.000) returns true, while isInteger(1.000) returns false
        $res = $this->parse_to_numeric((fmod($value, 1)));
        return $res === 0;
    }

    public function safe_number_omit_zero(array $obj, int|string $key, ?float $defaultValue = null) {
        $value = $this->safe_string($obj, $key);
        $final = $this->parse_number($this->omit_zero($value));
        return ($final === null) ? $defaultValue : $final;
    }

    public function safe_integer_omit_zero(array $obj, int|string $key, ?int $defaultValue = null) {
        $timestamp = $this->safe_integer($obj, $key, $defaultValue);
        if ($timestamp === null || $timestamp === 0) {
            return null;
        }
        return $timestamp;
    }

    public function after_construct() {
        // networks
        $this->create_networks_by_id_object();
        $this->features_generator();
        // init predefined markets if any
        if ($this->markets) {
            $this->set_markets($this->markets);
        }
        // init the request rate limiter
        $this->init_rest_rate_limiter();
        // sanbox mode
        $isSandbox = $this->safe_bool_2($this->options, 'sandbox', 'testnet', false);
        if ($isSandbox) {
            $this->set_sandbox_mode($isSandbox);
        }
    }

    public function init_rest_rate_limiter() {
        if ($this->rateLimit === null || ($this->id !== null && $this->rateLimit === -1)) {
            throw new ExchangeError($this->id . '.rateLimit property is not configured');
        }
        $refillRate = $this->MAX_VALUE;
        if ($this->rateLimit > 0) {
            $refillRate = 1 / $this->rateLimit;
        }
        $defaultBucket = array(
            'delay' => 0.001,
            'capacity' => 1,
            'cost' => 1,
            'maxCapacity' => 1000,
            'refillRate' => $refillRate,
        );
        $existingBucket = ($this->tokenBucket === null) ? array() : $this->tokenBucket;
        $this->tokenBucket = $this->extend($defaultBucket, $existingBucket);
        $this->init_throttler();
    }

    public function features_generator() {
        //
        // in the exchange-specific features can be something like this, where we support 'string' aliases too:
        //
        //     {
        //         'my' : array(
        //             'createOrder' : array(...),
        //         ),
        //         'swap' => array(
        //             'linear' => array(
        //                 'extends' => my',
        //             ),
        //         ),
        //     }
        //
        if ($this->features === null) {
            return;
        }
        // reconstruct
        $initialFeatures = $this->features;
        $this->features = array();
        $unifiedMarketTypes = array( 'spot', 'swap', 'future', 'option' );
        $subTypes = array( 'linear', 'inverse' );
        // atm only support basic methods, eg => 'createOrder', 'fetchOrder', 'fetchOrders', 'fetchMyTrades'
        for ($i = 0; $i < count($unifiedMarketTypes); $i++) {
            $marketType = $unifiedMarketTypes[$i];
            // if $marketType is not filled for this exchange, don't add that in `features`
            if (!(is_array($initialFeatures) && array_key_exists($marketType, $initialFeatures))) {
                $this->features[$marketType] = null;
            } else {
                if ($marketType === 'spot') {
                    $this->features[$marketType] = $this->features_mapper($initialFeatures, $marketType, null);
                } else {
                    $this->features[$marketType] = array();
                    for ($j = 0; $j < count($subTypes); $j++) {
                        $subType = $subTypes[$j];
                        $this->features[$marketType][$subType] = $this->features_mapper($initialFeatures, $marketType, $subType);
                    }
                }
            }
        }
    }

    public function features_mapper(mixed $initialFeatures, ?string $marketType, ?string $subType = null) {
        $featuresObj = ($subType !== null) ? $initialFeatures[$marketType][$subType] : $initialFeatures[$marketType];
        // if exchange does not have that market-type (eg. future>inverse)
        if ($featuresObj === null) {
            return null;
        }
        $extendsStr = $this->safe_string($featuresObj, 'extends');
        if ($extendsStr !== null) {
            $featuresObj = $this->omit($featuresObj, 'extends');
            $extendObj = $this->features_mapper($initialFeatures, $extendsStr);
            $featuresObj = $this->deep_extend($extendObj, $featuresObj);
        }
        //
        // ### corrections ###
        //
        // createOrder
        if (is_array($featuresObj) && array_key_exists('createOrder', $featuresObj)) {
            $value = $this->safe_dict($featuresObj['createOrder'], 'attachedStopLossTakeProfit');
            $featuresObj['createOrder']['stopLoss'] = $value;
            $featuresObj['createOrder']['takeProfit'] = $value;
            if ($marketType === 'spot') {
                // default 'hedged' => false
                $featuresObj['createOrder']['hedged'] = false;
                // default 'leverage' => false
                if (!(is_array($featuresObj['createOrder']) && array_key_exists('leverage', $featuresObj['createOrder']))) {
                    $featuresObj['createOrder']['leverage'] = false;
                }
            }
            // default 'GTC' to true
            if ($this->safe_bool($featuresObj['createOrder']['timeInForce'], 'GTC') === null) {
                $featuresObj['createOrder']['timeInForce']['GTC'] = true;
            }
        }
        // other methods
        $keys = is_array($featuresObj) ? array_keys($featuresObj) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $featureBlock = $featuresObj[$key];
            if (!$this->in_array($key, array( 'sandbox' )) && $featureBlock !== null) {
                // default "symbolRequired" to false to all methods (except `createOrder`)
                if (!(is_array($featureBlock) && array_key_exists('symbolRequired', $featureBlock))) {
                    $featureBlock['symbolRequired'] = $this->in_array($key, array( 'createOrder', 'createOrders', 'fetchOHLCV' ));
                }
            }
        }
        return $featuresObj;
    }

    public function feature_value(string $symbol, ?string $methodName = null, ?string $paramName = null, ?string $subParamName = null, mixed $defaultValue = null) {
        /**
         * this method is a very deterministic to help users to know what feature is supported by the exchange
         * @param {string} [$symbol] unified $symbol
         * @param {string} [$methodName] view currently supported methods => https://docs.ccxt.com/#/README?id=features
         * @param {string} [$paramName] unified param value (check docs for supported param names)
         * @param {string} [$subParamName] unified sub-param value (eg. stopLoss->triggerPriceType)
         * @param {array} [$defaultValue] return default value if no result found
         * @return {array} returns feature value
         */
        $market = $this->market($symbol);
        return $this->feature_value_by_type($market['type'], $market['subType'], $methodName, $paramName, $subParamName, $defaultValue);
    }

    public function feature_value_by_type(string $marketType, ?string $subType, ?string $methodName = null, ?string $paramName = null, ?string $subParamName = null, mixed $defaultValue = null) {
        /**
         * this method is a very deterministic to help users to know what feature is supported by the exchange
         * @param {string} [$marketType] supported only => "spot", "swap", "future"
         * @param {string} [$subType] supported only => "linear", "inverse"
         * @param {string} [$methodName] view currently supported methods => https://docs.ccxt.com/#/README?id=features
         * @param {string} [$paramName] unified param value (check docs for supported param names)
         * @param {string} [$subParamName] unified sub-param value (eg. stopLoss->triggerPriceType)
         * @param {array} [$defaultValue] return default value if no result found
         * @return {array} returns feature value
         */
        // if exchange does not yet have features manually implemented
        if ($this->features === null) {
            return $defaultValue;
        }
        // if $marketType (e.g. 'option') does not exist in features
        if (!(is_array($this->features) && array_key_exists($marketType, $this->features))) {
            return $defaultValue; // unsupported $marketType, check "exchange.features" for details
        }
        // if $marketType dict null
        if ($this->features[$marketType] === null) {
            return $defaultValue;
        }
        $methodsContainer = $this->features[$marketType];
        if ($subType === null) {
            if ($marketType !== 'spot') {
                return $defaultValue; // $subType is required for non-spot markets
            }
        } else {
            if (!(is_array($this->features[$marketType]) && array_key_exists($subType, $this->features[$marketType]))) {
                return $defaultValue; // unsupported $subType, check "exchange.features" for details
            }
            // if $subType dict null
            if ($this->features[$marketType][$subType] === null) {
                return $defaultValue;
            }
            $methodsContainer = $this->features[$marketType][$subType];
        }
        // if user wanted only $marketType and didn't provide $methodName, eg => featureIsSupported('spot')
        if ($methodName === null) {
            return $methodsContainer;
        }
        if (!(is_array($methodsContainer) && array_key_exists($methodName, $methodsContainer))) {
            return $defaultValue; // unsupported method, check "exchange.features" for details');
        }
        $methodDict = $methodsContainer[$methodName];
        if ($methodDict === null) {
            return $defaultValue;
        }
        // if user wanted only method and didn't provide `$paramName`, eg => featureIsSupported('swap', 'linear', 'createOrder')
        if ($paramName === null) {
            return $methodDict;
        }
        if (!(is_array($methodDict) && array_key_exists($paramName, $methodDict))) {
            return $defaultValue; // unsupported $paramName, check "exchange.features" for details');
        }
        $dictionary = $this->safe_dict($methodDict, $paramName);
        if ($dictionary === null) {
            // if the value is not $dictionary but a scalar value (or null), return
            return $methodDict[$paramName];
        } else {
            // return, when calling without `$subParamName` eg => featureValueByType('spot', null, 'createOrder', 'stopLoss')
            if ($subParamName === null) {
                return $methodDict[$paramName];
            }
            // throw an exception for unsupported $subParamName
            if (!(is_array($methodDict[$paramName]) && array_key_exists($subParamName, $methodDict[$paramName]))) {
                return $defaultValue; // unsupported $subParamName, check "exchange.features" for details
            }
            return $methodDict[$paramName][$subParamName];
        }
    }

    public function orderbook_checksum_message(?string $symbol) {
        return $symbol . '  = false';
    }

    public function create_networks_by_id_object() {
        // automatically generate network-id-to-code mappings
        $networkIdsToCodesGenerated = $this->invert_flat_string_dictionary($this->safe_value($this->options, 'networks', array())); // invert defined networks dictionary
        $this->options['networksById'] = $this->extend($networkIdsToCodesGenerated, $this->safe_value($this->options, 'networksById', array())); // support manually overriden "networksById" dictionary too
    }

    public function get_default_options() {
        return array(
            'defaultNetworkCodeReplacements' => array(
                'ETH' => array( 'ERC20' => 'ETH' ),
                'TRX' => array( 'TRC20' => 'TRX' ),
                'CRO' => array( 'CRC20' => 'CRONOS' ),
                'BRC20' => array( 'BRC20' => 'BTC' ),
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
        $info = $this->safe_dict($entry, 'info', array());
        return array(
            'id' => $this->safe_string($entry, 'id'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
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
            'info' => $info,
        );
    }

    public function safe_currency_structure(array $currency) {
        // derive data from $networks => $deposit, $withdraw, $active, $fee, $limits, $precision
        $networks = $this->safe_dict($currency, 'networks', array());
        $keys = is_array($networks) ? array_keys($networks) : array();
        $length = count($keys);
        if ($length !== 0) {
            for ($i = 0; $i < $length; $i++) {
                $key = $keys[$i];
                $network = $networks[$key];
                $deposit = $this->safe_bool($network, 'deposit');
                $currencyDeposit = $this->safe_bool($currency, 'deposit');
                if ($currencyDeposit === null || $deposit) {
                    $currency['deposit'] = $deposit;
                }
                $withdraw = $this->safe_bool($network, 'withdraw');
                $currencyWithdraw = $this->safe_bool($currency, 'withdraw');
                if ($currencyWithdraw === null || $withdraw) {
                    $currency['withdraw'] = $withdraw;
                }
                // set $network 'active' to false if D or W is disabled
                $active = $this->safe_bool($network, 'active');
                if ($active === null) {
                    if ($deposit && $withdraw) {
                        $currency['networks'][$key]['active'] = true;
                    } elseif ($deposit !== null && $withdraw !== null) {
                        $currency['networks'][$key]['active'] = false;
                    }
                }
                $active = $this->safe_bool($currency['networks'][$key], 'active'); // dict might have been updated on above lines, so access directly instead of `$network` variable
                $currencyActive = $this->safe_bool($currency, 'active');
                if ($currencyActive === null || $active) {
                    $currency['active'] = $active;
                }
                // find lowest $fee (which is more desired)
                $fee = $this->safe_string($network, 'fee');
                $feeMain = $this->safe_string($currency, 'fee');
                if ($feeMain === null || Precise::string_lt($fee, $feeMain)) {
                    $currency['fee'] = $this->parse_number($fee);
                }
                // find lowest $precision (which is more desired)
                $precision = $this->safe_string($network, 'precision');
                $precisionMain = $this->safe_string($currency, 'precision');
                if ($precisionMain === null || Precise::string_gt($precision, $precisionMain)) {
                    $currency['precision'] = $this->parse_number($precision);
                }
                // $limits
                $limits = $this->safe_dict($network, 'limits');
                $limitsMain = $this->safe_dict($currency, 'limits');
                if ($limitsMain === null) {
                    $currency['limits'] = array();
                }
                // deposits
                $limitsDeposit = $this->safe_dict($limits, 'deposit');
                $limitsDepositMain = $this->safe_dict($limitsMain, 'deposit');
                if ($limitsDepositMain === null) {
                    $currency['limits']['deposit'] = array();
                }
                $limitsDepositMin = $this->safe_string($limitsDeposit, 'min');
                $limitsDepositMax = $this->safe_string($limitsDeposit, 'max');
                $limitsDepositMinMain = $this->safe_string($limitsDepositMain, 'min');
                $limitsDepositMaxMain = $this->safe_string($limitsDepositMain, 'max');
                // find min
                if ($limitsDepositMinMain === null || Precise::string_lt($limitsDepositMin, $limitsDepositMinMain)) {
                    $currency['limits']['deposit']['min'] = $this->parse_number($limitsDepositMin);
                }
                // find max
                if ($limitsDepositMaxMain === null || Precise::string_gt($limitsDepositMax, $limitsDepositMaxMain)) {
                    $currency['limits']['deposit']['max'] = $this->parse_number($limitsDepositMax);
                }
                // withdrawals
                $limitsWithdraw = $this->safe_dict($limits, 'withdraw');
                $limitsWithdrawMain = $this->safe_dict($limitsMain, 'withdraw');
                if ($limitsWithdrawMain === null) {
                    $currency['limits']['withdraw'] = array();
                }
                $limitsWithdrawMin = $this->safe_string($limitsWithdraw, 'min');
                $limitsWithdrawMax = $this->safe_string($limitsWithdraw, 'max');
                $limitsWithdrawMinMain = $this->safe_string($limitsWithdrawMain, 'min');
                $limitsWithdrawMaxMain = $this->safe_string($limitsWithdrawMain, 'max');
                // find min
                if ($limitsWithdrawMinMain === null || Precise::string_lt($limitsWithdrawMin, $limitsWithdrawMinMain)) {
                    $currency['limits']['withdraw']['min'] = $this->parse_number($limitsWithdrawMin);
                }
                // find max
                if ($limitsWithdrawMaxMain === null || Precise::string_gt($limitsWithdrawMax, $limitsWithdrawMaxMain)) {
                    $currency['limits']['withdraw']['max'] = $this->parse_number($limitsWithdrawMax);
                }
            }
        }
        return $this->extend(array(
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

    public function safe_market_structure(?array $market = null) {
        $cleanStructure = array(
            'id' => null,
            'lowercaseId' => null,
            'symbol' => null,
            'base' => null,
            'quote' => null,
            'settle' => null,
            'baseId' => null,
            'quoteId' => null,
            'settleId' => null,
            'type' => null,
            'spot' => null,
            'margin' => null,
            'swap' => null,
            'future' => null,
            'option' => null,
            'index' => null,
            'active' => null,
            'contract' => null,
            'linear' => null,
            'inverse' => null,
            'subType' => null,
            'taker' => null,
            'maker' => null,
            'contractSize' => null,
            'expiry' => null,
            'expiryDatetime' => null,
            'strike' => null,
            'optionType' => null,
            'precision' => array(
                'amount' => null,
                'price' => null,
                'cost' => null,
                'base' => null,
                'quote' => null,
            ),
            'limits' => array(
                'leverage' => array(
                    'min' => null,
                    'max' => null,
                ),
                'amount' => array(
                    'min' => null,
                    'max' => null,
                ),
                'price' => array(
                    'min' => null,
                    'max' => null,
                ),
                'cost' => array(
                    'min' => null,
                    'max' => null,
                ),
            ),
            'marginModes' => array(
                'cross' => null,
                'isolated' => null,
            ),
            'created' => null,
            'info' => null,
        );
        if ($market !== null) {
            $result = $this->extend($cleanStructure, $market);
            // set null swap/future/etc
            if ($result['spot']) {
                if ($result['contract'] === null) {
                    $result['contract'] = false;
                }
                if ($result['swap'] === null) {
                    $result['swap'] = false;
                }
                if ($result['future'] === null) {
                    $result['future'] = false;
                }
                if ($result['option'] === null) {
                    $result['option'] = false;
                }
                if ($result['index'] === null) {
                    $result['index'] = false;
                }
            }
            return $result;
        }
        return $cleanStructure;
    }

    public function set_markets($markets, $currencies = null) {
        $values = array();
        $this->markets_by_id = $this->create_safe_dictionary();
        // handle marketId conflicts
        // we insert spot $markets first
        $marketValues = $this->sort_by($this->to_array($markets), 'spot', true, true);
        for ($i = 0; $i < count($marketValues); $i++) {
            $value = $marketValues[$i];
            if (is_array($this->markets_by_id) && array_key_exists($value['id'], $this->markets_by_id)) {
                $marketsByIdArray = ($this->markets_by_id[$value['id']]);
                $marketsByIdArray[] = $value;
                $this->markets_by_id[$value['id']] = $marketsByIdArray;
            } else {
                $this->markets_by_id[$value['id']] = array( $value );
            }
            $market = $this->deep_extend($this->safe_market_structure(), array(
                'precision' => $this->precision,
                'limits' => $this->limits,
            ), $this->fees['trading'], $value);
            if ($market['linear']) {
                $market['subType'] = 'linear';
            } elseif ($market['inverse']) {
                $market['subType'] = 'inverse';
            } else {
                $market['subType'] = null;
            }
            $values[] = $market;
        }
        $this->markets = $this->map_to_safe_map($this->index_by($values, 'symbol'));
        $marketsSortedBySymbol = $this->keysort($this->markets);
        $marketsSortedById = $this->keysort($this->markets_by_id);
        $this->symbols = is_array($marketsSortedBySymbol) ? array_keys($marketsSortedBySymbol) : array();
        $this->ids = is_array($marketsSortedById) ? array_keys($marketsSortedById) : array();
        $numCurrencies = 0;
        if ($currencies !== null) {
            $keys = is_array($currencies) ? array_keys($currencies) : array();
            $numCurrencies = count($keys);
        }
        if ($numCurrencies > 0) {
            // $currencies is always null when called in constructor but not when called from loadMarkets
            $this->currencies = $this->map_to_safe_map($this->deep_extend($this->currencies, $currencies));
        } else {
            $baseCurrencies = array();
            $quoteCurrencies = array();
            for ($i = 0; $i < count($values); $i++) {
                $market = $values[$i];
                $defaultCurrencyPrecision = ($this->precisionMode === DECIMAL_PLACES) ? 8 : $this->parse_number('1e-8');
                $marketPrecision = $this->safe_dict($market, 'precision', array());
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
            $baseCurrencies = $this->sort_by($baseCurrencies, 'code', false, '');
            $quoteCurrencies = $this->sort_by($quoteCurrencies, 'code', false, '');
            $this->baseCurrencies = $this->map_to_safe_map($this->index_by($baseCurrencies, 'code'));
            $this->quoteCurrencies = $this->map_to_safe_map($this->index_by($quoteCurrencies, 'code'));
            $allCurrencies = $this->array_concat($baseCurrencies, $quoteCurrencies);
            $groupedCurrencies = $this->group_by($allCurrencies, 'code');
            $codes = is_array($groupedCurrencies) ? array_keys($groupedCurrencies) : array();
            $resultingCurrencies = array();
            for ($i = 0; $i < count($codes); $i++) {
                $code = $codes[$i];
                $groupedCurrenciesCode = $this->safe_list($groupedCurrencies, $code, array());
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
            $this->currencies = $this->map_to_safe_map($this->deep_extend($this->currencies, $this->index_by($sortedCurrencies, 'code')));
        }
        $this->currencies_by_id = $this->index_by_safe($this->currencies, 'id');
        $currenciesSortedByCode = $this->keysort($this->currencies);
        $this->codes = is_array($currenciesSortedByCode) ? array_keys($currenciesSortedByCode) : array();
        return $this->markets;
    }

    public function set_markets_from_exchange($sourceExchange) {
        // Validate that both exchanges are of the same type
        if ($this->id !== $sourceExchange->id) {
            throw new ArgumentsRequired($this->id . ' shareMarkets() can only share markets with exchanges of the same type (got ' . $sourceExchange['id'] . ')');
        }
        // Validate that source exchange has loaded markets
        if (!$sourceExchange->markets) {
            throw new ExchangeError('setMarketsFromExchange() source exchange must have loaded markets first. Can call by using loadMarkets function');
        }
        // Set all market-related data
        $this->markets = $sourceExchange->markets;
        $this->markets_by_id = $sourceExchange->markets_by_id;
        $this->symbols = $sourceExchange->symbols;
        $this->ids = $sourceExchange->ids;
        $this->currencies = $sourceExchange->currencies;
        $this->baseCurrencies = $sourceExchange->baseCurrencies;
        $this->quoteCurrencies = $sourceExchange->quoteCurrencies;
        $this->codes = $sourceExchange->codes;
        // check marketHelperProps
        $sourceExchangeHelpers = $this->safe_list($sourceExchange->options, 'marketHelperProps', array());
        for ($i = 0; $i < count($sourceExchangeHelpers); $i++) {
            $helper = $sourceExchangeHelpers[$i];
            if ($sourceExchange->options[$helper] !== null) {
                $this->options[$helper] = $sourceExchange->options[$helper];
            }
        }
        return $this;
    }

    public function get_describe_for_extended_ws_exchange(mixed $currentRestInstance, mixed $parentRestInstance, array $wsBaseDescribe) {
        $extendedRestDescribe = $this->deep_extend($parentRestInstance->describe (), $currentRestInstance->describe ());
        $superWithRestDescribe = $this->deep_extend($extendedRestDescribe, $wsBaseDescribe);
        return $superWithRestDescribe;
    }

    public function safe_balance(array $balance) {
        $balances = $this->omit($balance, array( 'info', 'timestamp', 'datetime', 'free', 'used', 'total' ));
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
        $status = $this->safe_string($order, 'status');
        $parseFilled = ($filled === null);
        $parseCost = ($cost === null);
        $parseLastTradeTimeTimestamp = ($lastTradeTimeTimestamp === null);
        $fee = $this->safe_value($order, 'fee');
        $parseFee = ($fee === null);
        $parseFees = $this->safe_value($order, 'fees') === null;
        $parseSymbol = $symbol === null;
        $parseSide = $side === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = $this->safe_list($order, 'fees', array());
        $trades = array();
        $isTriggerOrSLTpOrder = (($this->safe_string($order, 'triggerPrice') !== null || ($this->safe_string($order, 'stopLossPrice') !== null)) || ($this->safe_string($order, 'takeProfitPrice') !== null));
        if ($parseFilled || $parseCost || $shouldParseFees) {
            $rawTrades = $this->safe_value($order, 'trades', $trades);
            // $oldNumber = $this->number;
            // we parse $trades here!
            // $i don't think this is needed anymore
            // $this->number = 'strval';
            $firstTrade = $this->safe_value($rawTrades, 0);
            // parse $trades if they haven't already been parsed
            $tradesAreParsed = (($firstTrade !== null) && (is_array($firstTrade) && array_key_exists('info', $firstTrade)) && (is_array($firstTrade) && array_key_exists('id', $firstTrade)));
            if (!$tradesAreParsed) {
                $trades = $this->parse_trades($rawTrades, $market);
            } else {
                $trades = $rawTrades;
            }
            // $this->number = $oldNumber; why parse $trades if you read the value using `safeString` ?
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
                                $fees[] = $this->extend(array(), $tradeFee);
                            }
                        } else {
                            $tradeFee = $this->safe_value($trade, 'fee');
                            if ($tradeFee !== null) {
                                $fees[] = $this->extend(array(), $tradeFee);
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
                // copy $fee to avoid modification by reference
                $feeCopy = $this->deep_extend($fee);
                $feeCopy['cost'] = $this->safe_number($feeCopy, 'cost');
                if (is_array($feeCopy) && array_key_exists('rate', $feeCopy)) {
                    $feeCopy['rate'] = $this->safe_number($feeCopy, 'rate');
                }
                $reducedFees[] = $feeCopy;
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
            } elseif ($status === 'closed') {
                $amount = $filled;
            }
        }
        if ($filled === null) {
            if ($amount !== null && $remaining !== null) {
                $filled = Precise::string_sub($amount, $remaining);
            } elseif ($status === 'closed' && $amount !== null) {
                $filled = $amount;
            }
        }
        if ($remaining === null) {
            if ($amount !== null && $filled !== null) {
                $remaining = Precise::string_sub($amount, $filled);
            } elseif ($status === 'closed') {
                $remaining = '0';
            }
        }
        // ensure that the $average field is calculated correctly
        $inverse = $this->safe_bool($market, 'inverse', false);
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
            $tradeFee = $this->safe_dict($entry, 'fee', array());
            $tradeFee['cost'] = $this->safe_number($tradeFee, 'cost');
            if (is_array($tradeFee) && array_key_exists('rate', $tradeFee)) {
                $tradeFee['rate'] = $this->safe_number($tradeFee, 'rate');
            }
            $entryFees = $this->safe_list($entry, 'fees', array());
            for ($j = 0; $j < count($entryFees); $j++) {
                $entryFees[$j]['cost'] = $this->safe_number($entryFees[$j], 'cost');
            }
            $entry['fees'] = $entryFees;
            $entry['fee'] = $tradeFee;
        }
        $timeInForce = $this->safe_string($order, 'timeInForce');
        $postOnly = $this->safe_value($order, 'postOnly');
        // timeInForceHandling
        if ($timeInForce === null) {
            if (!$isTriggerOrSLTpOrder && ($this->safe_string($order, 'type') === 'market')) {
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
        $lastUpdateTimestamp = $this->safe_integer($order, 'lastUpdateTimestamp');
        $datetime = $this->safe_string($order, 'datetime');
        if ($datetime === null) {
            $datetime = $this->iso8601($timestamp);
        }
        $triggerPrice = $this->parse_number($this->safe_string_2($order, 'triggerPrice', 'stopPrice'));
        $takeProfitPrice = $this->parse_number($this->safe_string($order, 'takeProfitPrice'));
        $stopLossPrice = $this->parse_number($this->safe_string($order, 'stopLossPrice'));
        return $this->extend($order, array(
            'id' => $this->safe_string($order, 'id'),
            'clientOrderId' => $this->safe_string($order, 'clientOrderId'),
            'timestamp' => $timestamp,
            'datetime' => $datetime,
            'symbol' => $symbol,
            'type' => $this->safe_string($order, 'type'),
            'side' => $side,
            'lastTradeTimestamp' => $lastTradeTimeTimestamp,
            'lastUpdateTimestamp' => $lastUpdateTimestamp,
            'price' => $this->parse_number($price),
            'amount' => $this->parse_number($amount),
            'cost' => $this->parse_number($cost),
            'average' => $this->parse_number($average),
            'filled' => $this->parse_number($filled),
            'remaining' => $this->parse_number($remaining),
            'timeInForce' => $timeInForce,
            'postOnly' => $postOnly,
            'trades' => $trades,
            'reduceOnly' => $this->safe_value($order, 'reduceOnly'),
            'stopPrice' => $triggerPrice,  // ! deprecated, use $triggerPrice instead
            'triggerPrice' => $triggerPrice,
            'takeProfitPrice' => $takeProfitPrice,
            'stopLossPrice' => $stopLossPrice,
            'status' => $status,
            'fee' => $this->safe_value($order, 'fee'),
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
                $parsed = $this->parse_order($orders[$i], $market); // don't inline this call
                $order = $this->extend($parsed, $params);
                $results[] = $order;
            }
        } else {
            $ids = is_array($orders) ? array_keys($orders) : array();
            for ($i = 0; $i < count($ids); $i++) {
                $id = $ids[$i];
                $idExtended = $this->extend(array( 'id' => $id ), $orders[$id]);
                $parsedOrder = $this->parse_order($idExtended, $market); // don't  inline these calls
                $order = $this->extend($parsedOrder, $params);
                $results[] = $order;
            }
        }
        $results = $this->sort_by($results, 'timestamp');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($results, $symbol, $since, $limit);
    }

    public function calculate_fee_with_rate(string $symbol, string $type, string $side, float $amount, float $price, $takerOrMaker = 'taker', ?float $feeRate = null, $params = array ()) {
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
        $rate = ($feeRate !== null) ? $this->number_to_string($feeRate) : $this->safe_string($market, $takerOrMaker);
        $cost = Precise::string_mul($cost, $rate);
        return array(
            'type' => $takerOrMaker,
            'currency' => $market[$key],
            'rate' => $this->parse_number($rate),
            'cost' => $this->parse_number($cost),
        );
    }

    public function calculate_fee(string $symbol, string $type, string $side, float $amount, float $price, $takerOrMaker = 'taker', $params = array ()) {
        /**
         * calculates the presumptive fee that would be charged for an order
         * @param {string} $symbol unified market $symbol
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade, in units of the base currency on most exchanges, or number of contracts
         * @param {float} $price the $price for the order to be filled at, in units of the quote currency
         * @param {string} $takerOrMaker 'taker' or 'maker'
         * @param {array} $params
         * @return {array} contains the rate, the percentage multiplied to the order $amount to obtain the fee $amount, and cost, the total value of the fee in units of the quote currency, for the order
         */
        return $this->calculate_fee_with_rate($symbol, $type, $side, $amount, $price, $takerOrMaker, null, $params);
    }

    public function safe_liquidation(array $liquidation, ?array $market = null) {
        $contracts = $this->safe_string($liquidation, 'contracts');
        $contractSize = $this->safe_string($market, 'contractSize');
        $price = $this->safe_string($liquidation, 'price');
        $baseValue = $this->safe_string($liquidation, 'baseValue');
        $quoteValue = $this->safe_string($liquidation, 'quoteValue');
        if (($baseValue === null) && ($contracts !== null) && ($contractSize !== null) && ($price !== null)) {
            $baseValue = Precise::string_mul($contracts, $contractSize);
        }
        if (($quoteValue === null) && ($baseValue !== null) && ($price !== null)) {
            $quoteValue = Precise::string_mul($baseValue, $price);
        }
        $liquidation['contracts'] = $this->parse_number($contracts);
        $liquidation['contractSize'] = $this->parse_number($contractSize);
        $liquidation['price'] = $this->parse_number($price);
        $liquidation['baseValue'] = $this->parse_number($baseValue);
        $liquidation['quoteValue'] = $this->parse_number($quoteValue);
        return $liquidation;
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
                $inverse = $this->safe_bool($market, 'inverse', false);
                if ($inverse) {
                    $multiplyPrice = Precise::string_div('1', $price);
                }
                $multiplyPrice = Precise::string_mul($multiplyPrice, $contractSize);
            }
            $cost = Precise::string_mul($multiplyPrice, $amount);
        }
        list($resultFee, $resultFees) = $this->parsed_fee_and_fees($trade);
        $trade['fee'] = $resultFee;
        $trade['fees'] = $resultFees;
        $trade['amount'] = $this->parse_number($amount);
        $trade['price'] = $this->parse_number($price);
        $trade['cost'] = $this->parse_number($cost);
        return $trade;
    }

    public function create_ccxt_trade_id($timestamp = null, $side = null, $amount = null, $price = null, $takerOrMaker = null) {
        // this approach is being used by multiple exchanges (mexc, woo, coinsbit, dydx, ...)
        $id = null;
        if ($timestamp !== null) {
            $id = $this->number_to_string($timestamp);
            if ($side !== null) {
                $id .= '-' . $side;
            }
            if ($amount !== null) {
                $id .= '-' . $this->number_to_string($amount);
            }
            if ($price !== null) {
                $id .= '-' . $this->number_to_string($price);
            }
            if ($takerOrMaker !== null) {
                $id .= '-' . $takerOrMaker;
            }
        }
        return $id;
    }

    public function parsed_fee_and_fees(mixed $container) {
        $fee = $this->safe_dict($container, 'fee');
        $fees = $this->safe_list($container, 'fees');
        $feeDefined = $fee !== null;
        $feesDefined = $fees !== null;
        // parsing only if at least one of them is defined
        $shouldParseFees = ($feeDefined || $feesDefined);
        if ($shouldParseFees) {
            if ($feeDefined) {
                $fee = $this->parse_fee_numeric($fee);
            }
            if (!$feesDefined) {
                // just set it directly, no further processing needed
                $fees = array( $fee );
            }
            // 'fees' were set, so reparse them
            $reducedFees = $this->reduceFees ? $this->reduce_fees_by_currency($fees) : $fees;
            $reducedLength = count($reducedFees);
            for ($i = 0; $i < $reducedLength; $i++) {
                $reducedFees[$i] = $this->parse_fee_numeric($reducedFees[$i]);
            }
            $fees = $reducedFees;
            if ($reducedLength === 1) {
                $fee = $reducedFees[0];
            } elseif ($reducedLength === 0) {
                $fee = null;
            }
        }
        // in case `$fee & $fees` are null, set `$fees` array
        if ($fee === null) {
            $fee = array(
                'cost' => null,
                'currency' => null,
            );
        }
        if ($fees === null) {
            $fees = array();
        }
        return array( $fee, $fees );
    }

    public function parse_fee_numeric(mixed $fee) {
        $fee['cost'] = $this->safe_number($fee, 'cost'); // ensure numeric
        if (is_array($fee) && array_key_exists('rate', $fee)) {
            $fee['rate'] = $this->safe_number($fee, 'rate');
        }
        return $fee;
    }

    public function find_nearest_ceiling(array $arr, float $providedValue) {
        //  $i->e. findNearestCeiling ([ 10, 30, 50],  23) returns 30
        $length = count($arr);
        for ($i = 0; $i < $length; $i++) {
            $current = $arr[$i];
            if ($providedValue <= $current) {
                return $current;
            }
        }
        return $arr[$length - 1];
    }

    public function invert_flat_string_dictionary($dict) {
        $reversed = array();
        $keys = is_array($dict) ? array_keys($dict) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $value = $dict[$key];
            if (gettype($value) === 'string') {
                $reversed[$value] = $key;
            }
        }
        return $reversed;
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
        //         array( 'currency' => 'BTC', 'cost' => '0.4'  ),
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
            $code = $this->safe_string($fee, 'currency');
            $feeCurrencyCode = ($code !== null) ? $code : (string) $i;
            if ($feeCurrencyCode !== null) {
                $rate = $this->safe_string($fee, 'rate');
                $cost = $this->safe_string($fee, 'cost');
                if ($cost === null) {
                    // omit null $cost, does not make sense, however, don't omit '0' costs, still make sense
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
                        'currency' => $code,
                        'cost' => $cost,
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

    public function safe_ticker(array $ticker, ?array $market = null) {
        $open = $this->omit_zero($this->safe_string($ticker, 'open'));
        $close = $this->omit_zero($this->safe_string_2($ticker, 'close', 'last'));
        $change = $this->omit_zero($this->safe_string($ticker, 'change'));
        $percentage = $this->omit_zero($this->safe_string($ticker, 'percentage'));
        $average = $this->omit_zero($this->safe_string($ticker, 'average'));
        $vwap = $this->safe_string($ticker, 'vwap');
        $baseVolume = $this->safe_string($ticker, 'baseVolume');
        $quoteVolume = $this->safe_string($ticker, 'quoteVolume');
        if ($vwap === null) {
            $vwap = Precise::string_div($this->omit_zero($quoteVolume), $baseVolume);
        }
        // calculate $open
        if ($change !== null) {
            if ($close === null && $average !== null) {
                $close = Precise::string_add($average, Precise::string_div($change, '2'));
            }
            if ($open === null && $close !== null) {
                $open = Precise::string_sub($close, $change);
            }
        } elseif ($percentage !== null) {
            if ($close === null && $average !== null) {
                $openAddClose = Precise::string_mul($average, '2');
                // $openAddClose = $open * (1 . (100 . $percentage)/100)
                $denominator = Precise::string_add('2', Precise::string_div($percentage, '100'));
                $calcOpen = ($open !== null) ? $open : Precise::string_div($openAddClose, $denominator);
                $close = Precise::string_mul($calcOpen, Precise::string_add('1', Precise::string_div($percentage, '100')));
            }
            if ($open === null && $close !== null) {
                $open = Precise::string_div($close, Precise::string_add('1', Precise::string_div($percentage, '100')));
            }
        }
        // $change
        if ($change === null) {
            if ($close !== null && $open !== null) {
                $change = Precise::string_sub($close, $open);
            } elseif ($close !== null && $percentage !== null) {
                $change = Precise::string_mul(Precise::string_div($percentage, '100'), Precise::string_div($close, '100'));
            } elseif ($open !== null && $percentage !== null) {
                $change = Precise::string_mul($open, Precise::string_div($percentage, '100'));
            }
        }
        // calculate things according to "open" (similar can be done with "close")
        if ($open !== null) {
            // $percentage (using $change)
            if ($percentage === null && $change !== null) {
                $percentage = Precise::string_mul(Precise::string_div($change, $open), '100');
            }
            // $close (using $change)
            if ($close === null && $change !== null) {
                $close = Precise::string_add($open, $change);
            }
            // $close (using $average)
            if ($close === null && $average !== null) {
                $close = Precise::string_mul($average, '2');
            }
            // $average
            if ($average === null && $close !== null) {
                $precision = 18;
                if ($market !== null && $this->is_tick_precision()) {
                    $marketPrecision = $this->safe_dict($market, 'precision');
                    $precisionPrice = $this->safe_string($marketPrecision, 'price');
                    if ($precisionPrice !== null) {
                        $precision = $this->precision_from_string($precisionPrice);
                    }
                }
                $average = Precise::string_div(Precise::string_add($open, $close), '2', $precision);
            }
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        $closeParsed = $this->parse_number($this->omit_zero($close));
        return $this->extend($ticker, array(
            'bid' => $this->parse_number($this->omit_zero($this->safe_string($ticker, 'bid'))),
            'bidVolume' => $this->safe_number($ticker, 'bidVolume'),
            'ask' => $this->parse_number($this->omit_zero($this->safe_string($ticker, 'ask'))),
            'askVolume' => $this->safe_number($ticker, 'askVolume'),
            'high' => $this->parse_number($this->omit_zero($this->safe_string($ticker, 'high'))),
            'low' => $this->parse_number($this->omit_zero($this->safe_string($ticker, 'low'))),
            'open' => $this->parse_number($this->omit_zero($open)),
            'close' => $closeParsed,
            'last' => $closeParsed,
            'change' => $this->parse_number($change),
            'percentage' => $this->parse_number($percentage),
            'average' => $this->parse_number($average),
            'vwap' => $this->parse_number($vwap),
            'baseVolume' => $this->parse_number($baseVolume),
            'quoteVolume' => $this->parse_number($quoteVolume),
            'previousClose' => $this->safe_number($ticker, 'previousClose'),
            'indexPrice' => $this->safe_number($ticker, 'indexPrice'),
            'markPrice' => $this->safe_number($ticker, 'markPrice'),
        ));
    }

    public function fetch_borrow_rate(string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead');
    }

    public function repay_cross_margin(string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' repayCrossMargin is not support yet');
    }

    public function repay_isolated_margin(string $symbol, string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' repayIsolatedMargin is not support yet');
    }

    public function borrow_cross_margin(string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' borrowCrossMargin is not support yet');
    }

    public function borrow_isolated_margin(string $symbol, string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' borrowIsolatedMargin is not support yet');
    }

    public function borrow_margin(string $code, float $amount, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead');
    }

    public function repay_margin(string $code, float $amount, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead');
    }

    public function fetch_ohlcv(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        $message = '';
        if ($this->has['fetchTrades']) {
            $message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet' . $message);
    }

    public function fetch_ohlcv_ws(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        $message = '';
        if ($this->has['fetchTradesWs']) {
            $message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported($this->id . ' fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead.' . $message);
    }

    public function watch_ohlcv(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOHLCV() is not supported yet');
    }

    public function convert_trading_view_to_ohlcv(array $ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $timestamps = $this->safe_list($ohlcvs, $timestamp, array());
        $opens = $this->safe_list($ohlcvs, $open, array());
        $highs = $this->safe_list($ohlcvs, $high, array());
        $lows = $this->safe_list($ohlcvs, $low, array());
        $closes = $this->safe_list($ohlcvs, $close, array());
        $volumes = $this->safe_list($ohlcvs, $volume, array());
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

    public function convert_ohlcv_to_trading_view(array $ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $result[$timestamp] = array();
        $result[$open] = array();
        $result[$high] = array();
        $result[$low] = array();
        $result[$close] = array();
        $result[$volume] = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $ts = $ms ? $ohlcvs[$i][0] : $this->parse_to_int($ohlcvs[$i][0] / 1000);
            $resultTimestamp = $result[$timestamp];
            $resultTimestamp[] = $ts;
            $resultOpen = $result[$open];
            $resultOpen[] = $ohlcvs[$i][1];
            $resultHigh = $result[$high];
            $resultHigh[] = $ohlcvs[$i][2];
            $resultLow = $result[$low];
            $resultLow[] = $ohlcvs[$i][3];
            $resultClose = $result[$close];
            $resultClose[] = $ohlcvs[$i][4];
            $resultVolume = $result[$volume];
            $resultVolume[] = $ohlcvs[$i][5];
        }
        return $result;
    }

    public function fetch_web_endpoint($method, $endpointMethod, $returnAsJson, $startRegex = null, $endRegex = null) {
        $errorMessage = '';
        $options = $this->safe_value($this->options, $method, array());
        $muteOnFailure = $this->safe_bool($options, 'webApiMuteFailure', true);
        try {
            // if it was not explicitly disabled, then don't fetch
            if ($this->safe_bool($options, 'webApiEnable', true) !== true) {
                return null;
            }
            $maxRetries = $this->safe_value($options, 'webApiRetries', 10);
            $response = null;
            $retry = 0;
            $shouldBreak = false;
            while ($retry < $maxRetries) {
                try {
                    $response = $this->$endpointMethod (array());
                    $shouldBreak = true;
                    break;
                } catch (Exception $e) {
                    $retry = $retry + 1;
                    if ($retry === $maxRetries) {
                        throw $e;
                    }
                }
                if ($shouldBreak) {
                    break; // this is needed because of GO
                }
            }
            $content = $response;
            if ($startRegex !== null) {
                $splitted_by_start = explode($startRegex, $content);
                $content = $splitted_by_start[1]; // we need second part after start
            }
            if ($endRegex !== null) {
                $splitted_by_end = explode($endRegex, $content);
                $content = $splitted_by_end[0]; // we need first part after start
            }
            if ($returnAsJson && (gettype($content) === 'string')) {
                $jsoned = $this->parse_json(trim($content)); // $content should be trimmed before json parsing
                if ($jsoned) {
                    return $jsoned; // if parsing was not successfull, exception should be thrown
                } else {
                    throw new BadResponse('could not parse the $response into json');
                }
            } else {
                return $content;
            }
        } catch (Exception $e) {
            $errorMessage = $this->id . ' ' . $method . '() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.';
        }
        if ($muteOnFailure) {
            return null;
        } else {
            throw new BadResponse($errorMessage);
        }
    }

    public function market_ids(?array $symbols = null) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $result[] = $this->market_id($symbols[$i]);
        }
        return $result;
    }

    public function currency_ids(?array $codes = null) {
        if ($codes === null) {
            return $codes;
        }
        $result = array();
        for ($i = 0; $i < count($codes); $i++) {
            $result[] = $this->currency_id($codes[$i]);
        }
        return $result;
    }

    public function markets_for_symbols(?array $symbols = null) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $result[] = $this->market($symbols[$i]);
        }
        return $result;
    }

    public function market_symbols(?array $symbols = null, ?string $type = null, $allowEmpty = true, $sameTypeOnly = false, $sameSubTypeOnly = false) {
        if ($symbols === null) {
            if (!$allowEmpty) {
                throw new ArgumentsRequired($this->id . ' empty list of $symbols is not supported');
            }
            return $symbols;
        }
        $symbolsLength = count($symbols);
        if ($symbolsLength === 0) {
            if (!$allowEmpty) {
                throw new ArgumentsRequired($this->id . ' empty list of $symbols is not supported');
            }
            return $symbols;
        }
        $result = array();
        $marketType = null;
        $isLinearSubType = null;
        for ($i = 0; $i < count($symbols); $i++) {
            $market = $this->market($symbols[$i]);
            if ($sameTypeOnly && ($marketType !== null)) {
                if ($market['type'] !== $marketType) {
                    throw new BadRequest($this->id . ' $symbols must be of the same $type, either ' . $marketType . ' or ' . $market['type'] . '.');
                }
            }
            if ($sameSubTypeOnly && ($isLinearSubType !== null)) {
                if ($market['linear'] !== $isLinearSubType) {
                    throw new BadRequest($this->id . ' $symbols must be of the same subType, either linear or inverse.');
                }
            }
            if ($type !== null && $market['type'] !== $type) {
                throw new BadRequest($this->id . ' $symbols must be of the same $type ' . $type . '. If the $type is incorrect you can change it in options or the params of the request');
            }
            $marketType = $market['type'];
            if (!$market['spot']) {
                $isLinearSubType = $market['linear'];
            }
            $symbol = $this->safe_string($market, 'symbol', $symbols[$i]);
            $result[] = $symbol;
        }
        return $result;
    }

    public function market_codes(?array $codes = null) {
        if ($codes === null) {
            return $codes;
        }
        $result = array();
        for ($i = 0; $i < count($codes); $i++) {
            $result[] = $this->common_currency_code($codes[$i]);
        }
        return $result;
    }

    public function parse_bids_asks($bidasks, int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $bidasks = $this->to_array($bidasks);
        $result = array();
        for ($i = 0; $i < count($bidasks); $i++) {
            $result[] = $this->parse_bid_ask($bidasks[$i], $priceKey, $amountKey, $countOrIdKey);
        }
        return $result;
    }

    public function fetch_l2_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        $orderbook = $this->fetch_order_book($symbol, $limit, $params);
        return $this->extend($orderbook, array(
            'asks' => $this->sort_by($this->aggregate($orderbook['asks']), 0),
            'bids' => $this->sort_by($this->aggregate($orderbook['bids']), 0, true),
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

    public function parse_ohlcv($ohlcv, ?array $market = null): array {
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

    public function network_code_to_id(string $networkCode, ?string $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided $networkCode (which is expected to be an unified $network code) to a $network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} $networkCode unified $network code
         * @param {string} $currencyCode unified $currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {string|null} exchange-specific $network id
         */
        if ($networkCode === null) {
            return null;
        }
        $networkIdsByCodes = $this->safe_value($this->options, 'networks', array());
        $networkId = $this->safe_string($networkIdsByCodes, $networkCode);
        // for example, if 'ETH' is passed for $networkCode, but 'ETH' $key not defined in `options->networks` object
        if ($networkId === null) {
            if ($currencyCode === null) {
                $currencies = is_array($this->currencies) ? array_values($this->currencies) : array();
                for ($i = 0; $i < count($currencies); $i++) {
                    $currency = $currencies[$i];
                    $networks = $this->safe_dict($currency, 'networks');
                    $network = $this->safe_dict($networks, $networkCode);
                    $networkId = $this->safe_string($network, 'id');
                    if ($networkId !== null) {
                        break;
                    }
                }
            } else {
                // if $currencyCode was provided, then we try to find if that $currencyCode has a replacement ($i->e. ERC20 for ETH) or is in the $currency
                $defaultNetworkCodeReplacements = $this->safe_value($this->options, 'defaultNetworkCodeReplacements', array());
                if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                    // if there is a replacement for the passed $networkCode, then we use it to find $network-id in `options->networks` object
                    $replacementObject = $defaultNetworkCodeReplacements[$currencyCode]; // $i->e. array( 'ERC20' => 'ETH' )
                    $keys = is_array($replacementObject) ? array_keys($replacementObject) : array();
                    for ($i = 0; $i < count($keys); $i++) {
                        $key = $keys[$i];
                        $value = $replacementObject[$key];
                        // if $value matches to provided unified $networkCode, then we use it's $key to find $network-id in `options->networks` object
                        if ($value === $networkCode) {
                            $networkId = $this->safe_string($networkIdsByCodes, $key);
                            break;
                        }
                    }
                } else {
                    // serach for $network inside $currency
                    $currency = $this->safe_dict($this->currencies, $currencyCode);
                    $networks = $this->safe_dict($currency, 'networks');
                    $network = $this->safe_dict($networks, $networkCode);
                    $networkId = $this->safe_string($network, 'id');
                }
            }
            // if it wasn't found, we just set the provided $value to $network-id
            if ($networkId === null) {
                $networkId = $networkCode;
            }
        }
        return $networkId;
    }

    public function network_id_to_code(?string $networkId = null, ?string $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided exchange-specific $networkId to an unified network Code. In order to achieve this, derived class needs to have "options['networksById']" defined.
         * @param {string} $networkId exchange specific network id/title, like => TRON, Trc-20, usdt-erc20, etc
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {string|null} unified network code
         */
        if ($networkId === null) {
            return null;
        }
        $networkCodesByIds = $this->safe_dict($this->options, 'networksById', array());
        $networkCode = $this->safe_string($networkCodesByIds, $networkId, $networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if ($currencyCode !== null) {
            $defaultNetworkCodeReplacements = $this->safe_dict($this->options, 'defaultNetworkCodeReplacements', array());
            if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                $replacementObject = $this->safe_dict($defaultNetworkCodeReplacements, $currencyCode, array());
                $networkCode = $this->safe_string($replacementObject, $networkCode, $networkCode);
            }
        }
        return $networkCode;
    }

    public function handle_network_code_and_params($params) {
        $networkCodeInParams = $this->safe_string_2($params, 'networkCode', 'network');
        if ($networkCodeInParams !== null) {
            $params = $this->omit($params, array( 'networkCode', 'network' ));
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return array( $networkCodeInParams, $params );
    }

    public function default_network_code(string $currencyCode) {
        $defaultNetworkCode = null;
        $defaultNetworks = $this->safe_dict($this->options, 'defaultNetworks', array());
        if (is_array($defaultNetworks) && array_key_exists($currencyCode, $defaultNetworks)) {
            // if currency had set its network in "defaultNetworks", use it
            $defaultNetworkCode = $defaultNetworks[$currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            $defaultNetwork = $this->safe_string($this->options, 'defaultNetwork');
            if ($defaultNetwork !== null) {
                $defaultNetworkCode = $defaultNetwork;
            }
        }
        return $defaultNetworkCode;
    }

    public function select_network_code_from_unified_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, true);
    }

    public function select_network_id_from_raw_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, false);
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
                $networkIdOrCode = $isIndexedByUnifiedNetworkCode ? $networkCode : $this->network_code_to_id($networkCode, $currencyCode);
                if (is_array($indexedNetworkEntries) && array_key_exists($networkIdOrCode, $indexedNetworkEntries)) {
                    $chosenNetworkId = $networkIdOrCode;
                } else {
                    throw new NotSupported($this->id . ' - ' . $networkIdOrCode . ' network was not found for ' . $currencyCode . ', use one of ' . implode(', ', $availableNetworkIds));
                }
            }
        } else {
            if ($responseNetworksLength === 0) {
                throw new NotSupported($this->id . ' - no networks were returned for ' . $currencyCode);
            } else {
                // if $networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                $defaultNetworkCode = $this->default_network_code($currencyCode);
                $defaultNetworkId = $isIndexedByUnifiedNetworkCode ? $defaultNetworkCode : $this->network_code_to_id($defaultNetworkCode, $currencyCode);
                if (is_array($indexedNetworkEntries) && array_key_exists($defaultNetworkId, $indexedNetworkEntries)) {
                    return $defaultNetworkId;
                }
                throw new NotSupported($this->id . ' - can not determine the default network, please pass param["network"] one from : ' . implode(', ', $availableNetworkIds));
            }
        }
        return $chosenNetworkId;
    }

    public function safe_number_2(array $dictionary, int|string $key1, int|string $key2, $d = null) {
        $value = $this->safe_string_2($dictionary, $key1, $key2);
        return $this->parse_number($value, $d);
    }

    public function parse_order_book(array $orderbook, string $symbol, ?int $timestamp = null, $bidsKey = 'bids', $asksKey = 'asks', int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $bids = $this->parse_bids_asks($this->safe_value($orderbook, $bidsKey, array()), $priceKey, $amountKey, $countOrIdKey);
        $asks = $this->parse_bids_asks($this->safe_value($orderbook, $asksKey, array()), $priceKey, $amountKey, $countOrIdKey);
        return array(
            'symbol' => $symbol,
            'bids' => $this->sort_by($bids, 0, true),
            'asks' => $this->sort_by($asks, 0),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601($timestamp),
            'nonce' => null,
        );
    }

    public function parse_ohlcvs(mixed $ohlcvs, mixed $market = null, string $timeframe = '1m', ?int $since = null, ?int $limit = null, Bool $tail = false) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($results, 0);
        return $this->filter_by_since_limit($sorted, $since, $limit, 0, $tail);
    }

    public function parse_leverage_tiers(mixed $response, ?array $symbols = null, $marketIdKey = null) {
        // $marketIdKey should only be null when $response is a dictionary.
        $symbols = $this->market_symbols($symbols);
        $tiers = array();
        $symbolsLength = 0;
        if ($symbols !== null) {
            $symbolsLength = count($symbols);
        }
        $noSymbols = ($symbols === null) || ($symbolsLength === 0);
        if (gettype($response) === 'array' && array_keys($response) === array_keys(array_keys($response))) {
            for ($i = 0; $i < count($response); $i++) {
                $item = $response[$i];
                $id = $this->safe_string($item, $marketIdKey);
                $market = $this->safe_market($id, null, null, 'swap');
                $symbol = $market['symbol'];
                $contract = $this->safe_bool($market, 'contract', false);
                if ($contract && ($noSymbols || $this->in_array($symbol, $symbols))) {
                    $tiers[$symbol] = $this->parse_market_leverage_tiers($item, $market);
                }
            }
        } else {
            $keys = is_array($response) ? array_keys($response) : array();
            for ($i = 0; $i < count($keys); $i++) {
                $marketId = $keys[$i];
                $item = $response[$marketId];
                $market = $this->safe_market($marketId, null, null, 'swap');
                $symbol = $market['symbol'];
                $contract = $this->safe_bool($market, 'contract', false);
                if ($contract && ($noSymbols || $this->in_array($symbol, $symbols))) {
                    $tiers[$symbol] = $this->parse_market_leverage_tiers($item, $market);
                }
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
                $this->options['limitsLoaded'] = $this->milliseconds();
            }
        }
        return $this->markets;
    }

    public function safe_position(array $position) {
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
        // if $contractSize is null get from $market
        $contractSize = $this->safe_number($position, 'contractSize');
        $symbol = $this->safe_string($position, 'symbol');
        $market = null;
        if ($symbol !== null) {
            $market = $this->safe_value($this->markets, $symbol);
        }
        if ($contractSize === null && $market !== null) {
            $contractSize = $this->safe_number($market, 'contractSize');
            $position['contractSize'] = $contractSize;
        }
        return $position;
    }

    public function parse_positions(array $positions, ?array $symbols = null, $params = array ()) {
        $symbols = $this->market_symbols($symbols);
        $positions = $this->to_array($positions);
        $result = array();
        for ($i = 0; $i < count($positions); $i++) {
            $position = $this->extend($this->parse_position($positions[$i], null), $params);
            $result[] = $position;
        }
        return $this->filter_by_array_positions($result, 'symbol', $symbols, false);
    }

    public function parse_accounts(array $accounts, $params = array ()) {
        $accounts = $this->to_array($accounts);
        $result = array();
        for ($i = 0; $i < count($accounts); $i++) {
            $account = $this->extend($this->parse_account($accounts[$i]), $params);
            $result[] = $account;
        }
        return $result;
    }

    public function parse_trades_helper(bool $isWs, array $trades, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $trades = $this->to_array($trades);
        $result = array();
        for ($i = 0; $i < count($trades); $i++) {
            $parsed = null;
            if ($isWs) {
                $parsed = $this->parse_ws_trade($trades[$i], $market);
            } else {
                $parsed = $this->parse_trade($trades[$i], $market);
            }
            $trade = $this->extend($parsed, $params);
            $result[] = $trade;
        }
        $result = $this->sort_by_2($result, 'timestamp', 'id');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit);
    }

    public function parse_trades(array $trades, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return $this->parse_trades_helper(false, $trades, $market, $since, $limit, $params);
    }

    public function parse_ws_trades(array $trades, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return $this->parse_trades_helper(true, $trades, $market, $since, $limit, $params);
    }

    public function parse_transactions(array $transactions, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transactions = $this->to_array($transactions);
        $result = array();
        for ($i = 0; $i < count($transactions); $i++) {
            $transaction = $this->extend($this->parse_transaction($transactions[$i], $currency), $params);
            $result[] = $transaction;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parse_transfers(array $transfers, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transfers = $this->to_array($transfers);
        $result = array();
        for ($i = 0; $i < count($transfers); $i++) {
            $transfer = $this->extend($this->parse_transfer($transfers[$i], $currency), $params);
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
                    $result[] = $this->extend($itemOrItems[$j], $params);
                }
            } else {
                $result[] = $this->extend($itemOrItems, $params);
            }
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function nonce() {
        return $this->seconds();
    }

    public function set_headers($headers) {
        return $headers;
    }

    public function currency_id(string $code) {
        $currency = $this->safe_dict($this->currencies, $code);
        if ($currency === null) {
            $currency = $this->safe_currency($code);
        }
        if ($currency !== null) {
            return $currency['id'];
        }
        return $code;
    }

    public function market_id(string $symbol) {
        $market = $this->market($symbol);
        if ($market !== null) {
            return $market['id'];
        }
        return $symbol;
    }

    public function symbol(string $symbol) {
        $market = $this->market($symbol);
        return $this->safe_string($market, 'symbol', $symbol);
    }

    public function handle_param_string(array $params, string $paramName, ?string $defaultValue = null) {
        $value = $this->safe_string($params, $paramName, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, $paramName);
        }
        return array( $value, $params );
    }

    public function handle_param_string_2(array $params, string $paramName1, string $paramName2, ?string $defaultValue = null) {
        $value = $this->safe_string_2($params, $paramName1, $paramName2, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, array( $paramName1, $paramName2 ));
        }
        return array( $value, $params );
    }

    public function handle_param_integer(array $params, string $paramName, ?int $defaultValue = null) {
        $value = $this->safe_integer($params, $paramName, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, $paramName);
        }
        return array( $value, $params );
    }

    public function handle_param_integer_2(array $params, string $paramName1, string $paramName2, ?int $defaultValue = null) {
        $value = $this->safe_integer_2($params, $paramName1, $paramName2, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, array( $paramName1, $paramName2 ));
        }
        return array( $value, $params );
    }

    public function handle_param_bool(array $params, string $paramName, ?Bool $defaultValue = null) {
        $value = $this->safe_bool($params, $paramName, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, $paramName);
        }
        return array( $value, $params );
    }

    public function handle_param_bool_2(array $params, string $paramName1, string $paramName2, ?Bool $defaultValue = null) {
        $value = $this->safe_bool_2($params, $paramName1, $paramName2, $defaultValue);
        if ($value !== null) {
            $params = $this->omit($params, array( $paramName1, $paramName2 ));
        }
        return array( $value, $params );
    }

    public function handle_request_network(array $params, array $request, string $exchangeSpecificKey, ?string $currencyCode = null, bool $isRequired = false) {
        /**
         * @param {array} $params - extra parameters
         * @param {array} $request - existing dictionary of $request
         * @param {string} $exchangeSpecificKey - the key for chain id to be set in $request
         * @param {array} $currencyCode - (optional) existing dictionary of $request
         * @param {boolean} $isRequired - (optional) whether that param is required to be present
         * @return {array[]} - returns [$request, $params] where $request is the modified $request object and $params is the modified $params object
         */
        $networkCode = null;
        list($networkCode, $params) = $this->handle_network_code_and_params($params);
        if ($networkCode !== null) {
            $request[$exchangeSpecificKey] = $this->network_code_to_id($networkCode, $currencyCode);
        } elseif ($isRequired) {
            throw new ArgumentsRequired($this->id . ' - "network" param is required for this request');
        }
        return array( $request, $params );
    }

    public function resolve_path($path, $params) {
        return array(
            $this->implode_params($path, $params),
            $this->omit($params, $this->extract_params($path)),
        );
    }

    public function get_list_from_object_values($objects, int|string $key) {
        $newArray = $objects;
        if (gettype($objects) !== 'array' || array_keys($objects) !== array_keys(array_keys($objects))) {
            $newArray = $this->to_array($objects);
        }
        $results = array();
        for ($i = 0; $i < count($newArray); $i++) {
            $results[] = $newArray[$i][$key];
        }
        return $results;
    }

    public function get_symbols_for_market_type(?string $marketType = null, ?string $subType = null, bool $symbolWithActiveStatus = true, bool $symbolWithUnknownStatus = true) {
        $filteredMarkets = $this->markets;
        if ($marketType !== null) {
            $filteredMarkets = $this->filter_by($filteredMarkets, 'type', $marketType);
        }
        if ($subType !== null) {
            $this->check_required_argument('getSymbolsForMarketType', $subType, 'subType', array( 'linear', 'inverse', 'quanto' ));
            $filteredMarkets = $this->filter_by($filteredMarkets, 'subType', $subType);
        }
        $activeStatuses = array();
        if ($symbolWithActiveStatus) {
            $activeStatuses[] = true;
        }
        if ($symbolWithUnknownStatus) {
            $activeStatuses[] = null;
        }
        $filteredMarkets = $this->filter_by_array($filteredMarkets, 'active', $activeStatuses, false);
        return $this->get_list_from_object_values($filteredMarkets, 'symbol');
    }

    public function filter_by_array($objects, int|string $key, $values = null, $indexed = true) {
        $objects = $this->to_array($objects);
        // return all of them if no $values were passed
        if ($values === null || !$values) {
            // return $indexed ? $this->index_by($objects, $key) : $objects;
            if ($indexed) {
                return $this->index_by($objects, $key);
            } else {
                return $objects;
            }
        }
        $results = array();
        for ($i = 0; $i < count($objects); $i++) {
            if ($this->in_array($objects[$i][$key], $values)) {
                $results[] = $objects[$i];
            }
        }
        // return $indexed ? $this->index_by($results, $key) : $results;
        if ($indexed) {
            return $this->index_by($results, $key);
        }
        return $results;
    }

    public function fetch2($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        if ($this->enableRateLimit) {
            $cost = $this->calculate_rate_limiter_cost($api, $method, $path, $params, $config);
            $this->throttle($cost);
        }
        $retries = null;
        list($retries, $params) = $this->handle_option_and_params($params, $path, 'maxRetriesOnFailure', 0);
        $retryDelay = null;
        list($retryDelay, $params) = $this->handle_option_and_params($params, $path, 'maxRetriesOnFailureDelay', 0);
        $this->lastRestRequestTimestamp = $this->milliseconds();
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        $this->last_request_headers = $request['headers'];
        $this->last_request_body = $request['body'];
        $this->last_request_url = $request['url'];
        for ($i = 0; $i < $retries + 1; $i++) {
            try {
                return $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
            } catch (Exception $e) {
                if ($e instanceof OperationFailed) {
                    if ($i < $retries) {
                        if ($this->verbose) {
                            $this->log('Request failed with the error => ' . (string) $e . ', retrying ' . ($i . (string) 1) . ' of ' . (string) $retries . '...');
                        }
                        if (($retryDelay !== null) && ($retryDelay !== 0)) {
                            $this->sleep($retryDelay);
                        }
                    } else {
                        throw $e;
                    }
                } else {
                    throw $e;
                }
            }
        }
        return null; // this line is never reached, but exists for c# value return requirement
    }

    public function request($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        return $this->fetch2($path, $api, $method, $params, $headers, $body, $config);
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
            if (($candle === -1) || ($openingTime >= $this->sum($ohlcvs[$candle][$i_timestamp], $ms))) {
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
                $ohlcvs[$candle][$i_volume] = $this->sum($ohlcvs[$candle][$i_volume], $trade['amount']);
                $ohlcvs[$candle][$i_count] = $this->sum($ohlcvs[$candle][$i_count], 1);
            }
        }
        return $ohlcvs;
    }

    public function parse_trading_view_ohlcv($ohlcvs, $market = null, $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function edit_limit_buy_order(string $id, string $symbol, float $amount, ?float $price = null, $params = array ()) {
        return $this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order(string $id, string $symbol, float $amount, ?float $price = null, $params = array ()) {
        return $this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order(string $id, string $symbol, string $side, float $amount, ?float $price = null, $params = array ()) {
        return $this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function edit_order(string $id, string $symbol, string $type, string $side, ?float $amount = null, ?float $price = null, $params = array ()) {
        $this->cancel_order($id, $symbol);
        return $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function edit_order_ws(string $id, string $symbol, string $type, string $side, ?float $amount = null, ?float $price = null, $params = array ()) {
        $this->cancel_order_ws($id, $symbol);
        return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
    }

    public function fetch_position(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function fetch_position_ws(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionWs() is not supported yet');
    }

    public function watch_position(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchPosition() is not supported yet');
    }

    public function watch_positions(?array $symbols = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchPositions() is not supported yet');
    }

    public function watch_position_for_symbols(?array $symbols = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return $this->watch_positions($symbols, $since, $limit, $params);
    }

    public function fetch_positions_for_symbol(string $symbol, $params = array ()) {
        /**
         * fetches all open positions for specific $symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} $symbol unified market $symbol
         * @param {array} $params extra parameters specific to the endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=position-structure position structure~ with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        throw new NotSupported($this->id . ' fetchPositionsForSymbol() is not supported yet');
    }

    public function fetch_positions_for_symbol_ws(string $symbol, $params = array ()) {
        /**
         * fetches all open positions for specific $symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} $symbol unified market $symbol
         * @param {array} $params extra parameters specific to the endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=position-structure position structure~ with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        throw new NotSupported($this->id . ' fetchPositionsForSymbol() is not supported yet');
    }

    public function fetch_positions(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositions() is not supported yet');
    }

    public function fetch_positions_ws(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositions() is not supported yet');
    }

    public function fetch_positions_risk(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionsRisk() is not supported yet');
    }

    public function fetch_bids_asks(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBidsAsks() is not supported yet');
    }

    public function fetch_borrow_interest(?string $code = null, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBorrowInterest() is not supported yet');
    }

    public function fetch_ledger(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLedger() is not supported yet');
    }

    public function fetch_ledger_entry(string $id, ?string $code = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLedgerEntry() is not supported yet');
    }

    public function parse_bid_ask($bidask, int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $price = $this->safe_number($bidask, $priceKey);
        $amount = $this->safe_number($bidask, $amountKey);
        $countOrId = $this->safe_integer($bidask, $countOrIdKey);
        $bidAsk = array( $price, $amount );
        if ($countOrId !== null) {
            $bidAsk[] = $countOrId;
        }
        return $bidAsk;
    }

    public function safe_currency(?string $currencyId, ?array $currency = null) {
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
        return $this->safe_currency_structure(array(
            'id' => $currencyId,
            'code' => $code,
            'precision' => null,
        ));
    }

    public function safe_market(?string $marketId = null, ?array $market = null, ?string $delimiter = null, ?string $marketType = null) {
        $result = $this->safe_market_structure(array(
            'symbol' => $marketId,
            'marketId' => $marketId,
        ));
        if ($marketId !== null) {
            if (($this->markets_by_id !== null) && (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id))) {
                $markets = $this->markets_by_id[$marketId];
                $numMarkets = count($markets);
                if ($numMarkets === 1) {
                    return $markets[0];
                } else {
                    if ($marketType === null) {
                        if ($market === null) {
                            throw new ArgumentsRequired($this->id . ' safeMarket() requires a fourth argument for ' . $marketId . ' to disambiguate between different $markets with the same $market id');
                        } else {
                            $marketType = $market['type'];
                        }
                    }
                    for ($i = 0; $i < count($markets); $i++) {
                        $currentMarket = $markets[$i];
                        if ($currentMarket[$marketType]) {
                            return $currentMarket;
                        }
                    }
                }
            } elseif ($delimiter !== null && $delimiter !== '') {
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

    public function market_or_null(string $symbol) {
        if ($symbol === null) {
            return null;
        }
        return $this->market($symbol);
    }

    public function check_required_credentials($error = true) {
        /**
         * @ignore
         * @param {boolean} $error throw an $error that a credential is required if true
         * @return {boolean} true if all required credentials have been set, otherwise false or an $error is thrown is param $error=true
         */
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

    public function fetch_balance_ws($params = array ()) {
        throw new NotSupported($this->id . ' fetchBalanceWs() is not supported yet');
    }

    public function parse_balance($response) {
        throw new NotSupported($this->id . ' parseBalance() is not supported yet');
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
        throw new NotSupported($this->id . ' fetchStatus() is not supported yet');
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
        $fees = $this->fetch_deposit_withdraw_fees(array( $code ), $params);
        return $this->safe_value($fees, $code);
    }

    public function get_supported_mapping($key, $mapping = array ()) {
        if (is_array($mapping) && array_key_exists($key, $mapping)) {
            return $mapping[$key];
        } else {
            throw new NotSupported($this->id . ' ' . $key . ' does not have a value in mapping');
        }
    }

    public function fetch_cross_borrow_rate(string $code, $params = array ()) {
        $this->load_markets();
        if (!$this->has['fetchBorrowRates']) {
            throw new NotSupported($this->id . ' fetchCrossBorrowRate() is not supported yet');
        }
        $borrowRates = $this->fetch_cross_borrow_rates($params);
        $rate = $this->safe_value($borrowRates, $code);
        if ($rate === null) {
            throw new ExchangeError($this->id . ' fetchCrossBorrowRate() could not find the borrow $rate for currency $code ' . $code);
        }
        return $rate;
    }

    public function fetch_isolated_borrow_rate(string $symbol, $params = array ()) {
        $this->load_markets();
        if (!$this->has['fetchBorrowRates']) {
            throw new NotSupported($this->id . ' fetchIsolatedBorrowRate() is not supported yet');
        }
        $borrowRates = $this->fetch_isolated_borrow_rates($params);
        $rate = $this->safe_dict($borrowRates, $symbol);
        if ($rate === null) {
            throw new ExchangeError($this->id . ' fetchIsolatedBorrowRate() could not find the borrow $rate for market $symbol ' . $symbol);
        }
        return $rate;
    }

    public function handle_option_and_params(array $params, string $methodName, string $optionName, $defaultValue = null) {
        // This method can be used to obtain method specific properties, i.e => $this->handle_option_and_params($params, 'fetchPosition', 'marginMode', 'isolated')
        $defaultOptionName = 'default' . $this->capitalize($optionName); // we also need to check the 'defaultXyzWhatever'
        // check if $params contain the key
        $value = $this->safe_value_2($params, $optionName, $defaultOptionName);
        if ($value !== null) {
            $params = $this->omit($params, array( $optionName, $defaultOptionName ));
        } else {
            // handle routed methods like "watchTrades > watchTradesForSymbols" (or "watchTicker > watchTickers")
            list($methodName, $params) = $this->handle_param_string($params, 'callerMethodName', $methodName);
            // check if exchange has properties for this method
            $exchangeWideMethodOptions = $this->safe_value($this->options, $methodName);
            if ($exchangeWideMethodOptions !== null) {
                // check if the option is defined inside this method's props
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

    public function handle_option_and_params_2(array $params, string $methodName1, string $optionName1, string $optionName2, $defaultValue = null) {
        $value = null;
        list($value, $params) = $this->handle_option_and_params($params, $methodName1, $optionName1);
        if ($value !== null) {
            // omit $optionName2 too from $params
            $params = $this->omit($params, $optionName2);
            return array( $value, $params );
        }
        // if still null, try $optionName2
        $value2 = null;
        list($value2, $params) = $this->handle_option_and_params($params, $methodName1, $optionName2, $defaultValue);
        return array( $value2, $params );
    }

    public function handle_option(string $methodName, string $optionName, $defaultValue = null) {
        $res = $this->handle_option_and_params(array(), $methodName, $optionName, $defaultValue);
        return $this->safe_value($res, 0);
    }

    public function handle_market_type_and_params(string $methodName, ?array $market = null, $params = array (), $defaultValue = null) {
        /**
         * @ignore
         * @param $methodName the method calling handleMarketTypeAndParams
         * @param {Market} $market
         * @param {array} $params
         * @param {string} [$params->type] $type assigned by user
         * @param {string} [$params->defaultType] same.type
         * @param {string} [$defaultValue] assigned programatically in the method calling handleMarketTypeAndParams
         * @return array([string, object]) the $market $type and $params with $type and $defaultType omitted
         */
        // $type from param
        $type = $this->safe_string_2($params, 'defaultType', 'type');
        if ($type !== null) {
            $params = $this->omit($params, array( 'defaultType', 'type' ));
            return array( $type, $params );
        }
        // $type from $market
        if ($market !== null) {
            return [ $market['type'], $params ];
        }
        // $type from default-argument
        if ($defaultValue !== null) {
            return array( $defaultValue, $params );
        }
        $methodOptions = $this->safe_dict($this->options, $methodName);
        if ($methodOptions !== null) {
            if (gettype($methodOptions) === 'string') {
                return array( $methodOptions, $params );
            } else {
                $typeFromMethod = $this->safe_string_2($methodOptions, 'defaultType', 'type');
                if ($typeFromMethod !== null) {
                    return array( $typeFromMethod, $params );
                }
            }
        }
        $defaultType = $this->safe_string_2($this->options, 'defaultType', 'type', 'spot');
        return array( $defaultType, $params );
    }

    public function handle_sub_type_and_params(string $methodName, $market = null, $params = array (), $defaultValue = null) {
        $subType = null;
        // if set in $params, it takes precedence
        $subTypeInParams = $this->safe_string_2($params, 'subType', 'defaultSubType');
        // avoid omitting if it's not present
        if ($subTypeInParams !== null) {
            $subType = $subTypeInParams;
            $params = $this->omit($params, array( 'subType', 'defaultSubType' ));
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
                $values = $this->handle_option_and_params(array(), $methodName, 'subType', $defaultValue); // no need to re-test $params here
                $subType = $values[0];
            }
        }
        return array( $subType, $params );
    }

    public function handle_margin_mode_and_params(string $methodName, $params = array (), $defaultValue = null) {
        /**
         * @ignore
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {Array} the marginMode in lowercase by $params["marginMode"], $params["defaultMarginMode"] $this->options["marginMode"] or $this->options["defaultMarginMode"]
         */
        return $this->handle_option_and_params($params, $methodName, 'marginMode', $defaultValue);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
        if ($string === null) {
            return;
        }
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

    public function handle_errors(int $statusCode, string $statusText, string $url, string $method, array $responseHeaders, string $responseBody, $response, $requestHeaders, $requestBody) {
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
            $market = $this->market($symbol);
            $symbol = $market['symbol'];
            $tickers = $this->fetch_tickers(array( $symbol ), $params);
            $ticker = $this->safe_dict($tickers, $symbol);
            if ($ticker === null) {
                throw new NullResponse($this->id . ' fetchTickers() could not find a $ticker for ' . $symbol);
            } else {
                return $ticker;
            }
        } else {
            throw new NotSupported($this->id . ' fetchTicker() is not supported yet');
        }
    }

    public function fetch_mark_price(string $symbol, $params = array ()) {
        if ($this->has['fetchMarkPrices']) {
            $this->load_markets();
            $market = $this->market($symbol);
            $symbol = $market['symbol'];
            $tickers = $this->fetch_mark_prices(array( $symbol ), $params);
            $ticker = $this->safe_dict($tickers, $symbol);
            if ($ticker === null) {
                throw new NullResponse($this->id . ' fetchMarkPrices() could not find a $ticker for ' . $symbol);
            } else {
                return $ticker;
            }
        } else {
            throw new NotSupported($this->id . ' fetchMarkPrices() is not supported yet');
        }
    }

    public function fetch_ticker_ws(string $symbol, $params = array ()) {
        if ($this->has['fetchTickersWs']) {
            $this->load_markets();
            $market = $this->market($symbol);
            $symbol = $market['symbol'];
            $tickers = $this->fetch_tickers_ws(array( $symbol ), $params);
            $ticker = $this->safe_dict($tickers, $symbol);
            if ($ticker === null) {
                throw new NullResponse($this->id . ' fetchTickerWs() could not find a $ticker for ' . $symbol);
            } else {
                return $ticker;
            }
        } else {
            throw new NotSupported($this->id . ' fetchTickerWs() is not supported yet');
        }
    }

    public function watch_ticker(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' watchTicker() is not supported yet');
    }

    public function fetch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTickers() is not supported yet');
    }

    public function fetch_mark_prices(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMarkPrices() is not supported yet');
    }

    public function fetch_tickers_ws(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTickers() is not supported yet');
    }

    public function fetch_order_books(?array $symbols = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBooks() is not supported yet');
    }

    public function watch_bids_asks(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchBidsAsks() is not supported yet');
    }

    public function watch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTickers() is not supported yet');
    }

    public function un_watch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' unWatchTickers() is not supported yet');
    }

    public function fetch_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrder() is not supported yet');
    }

    public function fetch_order_ws(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderWs() is not supported yet');
    }

    public function fetch_order_status(string $id, ?string $symbol = null, $params = array ()) {
        // TODO => TypeScript => change method signature by replacing
        // Promise<string> with Promise<Order['status']>.
        $order = $this->fetch_order($id, $symbol, $params);
        return $order['status'];
    }

    public function fetch_unified_order($order, $params = array ()) {
        return $this->fetch_order($this->safe_string($order, 'id'), $this->safe_string($order, 'symbol'), $params);
    }

    public function create_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrder() is not supported yet');
    }

    public function create_convert_trade(string $id, string $fromCode, string $toCode, ?float $amount = null, $params = array ()) {
        throw new NotSupported($this->id . ' createConvertTrade() is not supported yet');
    }

    public function fetch_convert_trade(string $id, ?string $code = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchConvertTrade() is not supported yet');
    }

    public function fetch_convert_trade_history(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchConvertTradeHistory() is not supported yet');
    }

    public function fetch_position_mode(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionMode() is not supported yet');
    }

    public function create_trailing_amount_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $trailingAmount = null, ?float $trailingTriggerPrice = null, $params = array ()) {
        /**
         * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingAmount
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} $trailingAmount the quote $amount to trail away from the current market $price
         * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($trailingAmount === null) {
            throw new ArgumentsRequired($this->id . ' createTrailingAmountOrder() requires a $trailingAmount argument');
        }
        $params['trailingAmount'] = $trailingAmount;
        if ($trailingTriggerPrice !== null) {
            $params['trailingTriggerPrice'] = $trailingTriggerPrice;
        }
        if ($this->has['createTrailingAmountOrder']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTrailingAmountOrder() is not supported yet');
    }

    public function create_trailing_amount_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $trailingAmount = null, ?float $trailingTriggerPrice = null, $params = array ()) {
        /**
         * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingAmount
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} $trailingAmount the quote $amount to trail away from the current market $price
         * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($trailingAmount === null) {
            throw new ArgumentsRequired($this->id . ' createTrailingAmountOrderWs() requires a $trailingAmount argument');
        }
        $params['trailingAmount'] = $trailingAmount;
        if ($trailingTriggerPrice !== null) {
            $params['trailingTriggerPrice'] = $trailingTriggerPrice;
        }
        if ($this->has['createTrailingAmountOrderWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTrailingAmountOrderWs() is not supported yet');
    }

    public function create_trailing_percent_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $trailingPercent = null, ?float $trailingTriggerPrice = null, $params = array ()) {
        /**
         * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingPercent
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} $trailingPercent the percent to trail away from the current market $price
         * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($trailingPercent === null) {
            throw new ArgumentsRequired($this->id . ' createTrailingPercentOrder() requires a $trailingPercent argument');
        }
        $params['trailingPercent'] = $trailingPercent;
        if ($trailingTriggerPrice !== null) {
            $params['trailingTriggerPrice'] = $trailingTriggerPrice;
        }
        if ($this->has['createTrailingPercentOrder']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTrailingPercentOrder() is not supported yet');
    }

    public function create_trailing_percent_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $trailingPercent = null, ?float $trailingTriggerPrice = null, $params = array ()) {
        /**
         * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingPercent
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} $trailingPercent the percent to trail away from the current market $price
         * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($trailingPercent === null) {
            throw new ArgumentsRequired($this->id . ' createTrailingPercentOrderWs() requires a $trailingPercent argument');
        }
        $params['trailingPercent'] = $trailingPercent;
        if ($trailingTriggerPrice !== null) {
            $params['trailingTriggerPrice'] = $trailingTriggerPrice;
        }
        if ($this->has['createTrailingPercentOrderWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTrailingPercentOrderWs() is not supported yet');
    }

    public function create_market_order_with_cost(string $symbol, string $side, float $cost, $params = array ()) {
        /**
         * create a market order by providing the $symbol, $side and $cost
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $cost how much you want to trade in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($this->has['createMarketOrderWithCost'] || ($this->has['createMarketBuyOrderWithCost'] && $this->has['createMarketSellOrderWithCost'])) {
            return $this->create_order($symbol, 'market', $side, $cost, 1, $params);
        }
        throw new NotSupported($this->id . ' createMarketOrderWithCost() is not supported yet');
    }

    public function create_market_buy_order_with_cost(string $symbol, float $cost, $params = array ()) {
        /**
         * create a market buy order by providing the $symbol and $cost
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {float} $cost how much you want to trade in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($this->options['createMarketBuyOrderRequiresPrice'] || $this->has['createMarketBuyOrderWithCost']) {
            return $this->create_order($symbol, 'market', 'buy', $cost, 1, $params);
        }
        throw new NotSupported($this->id . ' createMarketBuyOrderWithCost() is not supported yet');
    }

    public function create_market_sell_order_with_cost(string $symbol, float $cost, $params = array ()) {
        /**
         * create a market sell order by providing the $symbol and $cost
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {float} $cost how much you want to trade in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($this->options['createMarketSellOrderRequiresPrice'] || $this->has['createMarketSellOrderWithCost']) {
            return $this->create_order($symbol, 'market', 'sell', $cost, 1, $params);
        }
        throw new NotSupported($this->id . ' createMarketSellOrderWithCost() is not supported yet');
    }

    public function create_market_order_with_cost_ws(string $symbol, string $side, float $cost, $params = array ()) {
        /**
         * create a market order by providing the $symbol, $side and $cost
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $cost how much you want to trade in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($this->has['createMarketOrderWithCostWs'] || ($this->has['createMarketBuyOrderWithCostWs'] && $this->has['createMarketSellOrderWithCostWs'])) {
            return $this->create_order_ws($symbol, 'market', $side, $cost, 1, $params);
        }
        throw new NotSupported($this->id . ' createMarketOrderWithCostWs() is not supported yet');
    }

    public function create_trigger_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $triggerPrice = null, $params = array ()) {
        /**
         * create a trigger stop order ($type 1)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $triggerPrice the $price to trigger the stop order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($triggerPrice === null) {
            throw new ArgumentsRequired($this->id . ' createTriggerOrder() requires a $triggerPrice argument');
        }
        $params['triggerPrice'] = $triggerPrice;
        if ($this->has['createTriggerOrder']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTriggerOrder() is not supported yet');
    }

    public function create_trigger_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $triggerPrice = null, $params = array ()) {
        /**
         * create a trigger stop order ($type 1)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $triggerPrice the $price to trigger the stop order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($triggerPrice === null) {
            throw new ArgumentsRequired($this->id . ' createTriggerOrderWs() requires a $triggerPrice argument');
        }
        $params['triggerPrice'] = $triggerPrice;
        if ($this->has['createTriggerOrderWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTriggerOrderWs() is not supported yet');
    }

    public function create_stop_loss_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $stopLossPrice = null, $params = array ()) {
        /**
         * create a trigger stop loss order ($type 2)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $stopLossPrice the $price to trigger the stop loss order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($stopLossPrice === null) {
            throw new ArgumentsRequired($this->id . ' createStopLossOrder() requires a $stopLossPrice argument');
        }
        $params['stopLossPrice'] = $stopLossPrice;
        if ($this->has['createStopLossOrder']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createStopLossOrder() is not supported yet');
    }

    public function create_stop_loss_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $stopLossPrice = null, $params = array ()) {
        /**
         * create a trigger stop loss order ($type 2)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $stopLossPrice the $price to trigger the stop loss order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($stopLossPrice === null) {
            throw new ArgumentsRequired($this->id . ' createStopLossOrderWs() requires a $stopLossPrice argument');
        }
        $params['stopLossPrice'] = $stopLossPrice;
        if ($this->has['createStopLossOrderWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createStopLossOrderWs() is not supported yet');
    }

    public function create_take_profit_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfitPrice = null, $params = array ()) {
        /**
         * create a trigger take profit order ($type 2)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $takeProfitPrice the $price to trigger the take profit order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($takeProfitPrice === null) {
            throw new ArgumentsRequired($this->id . ' createTakeProfitOrder() requires a $takeProfitPrice argument');
        }
        $params['takeProfitPrice'] = $takeProfitPrice;
        if ($this->has['createTakeProfitOrder']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTakeProfitOrder() is not supported yet');
    }

    public function create_take_profit_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfitPrice = null, $params = array ()) {
        /**
         * create a trigger take profit order ($type 2)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} $takeProfitPrice the $price to trigger the take profit order, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        if ($takeProfitPrice === null) {
            throw new ArgumentsRequired($this->id . ' createTakeProfitOrderWs() requires a $takeProfitPrice argument');
        }
        $params['takeProfitPrice'] = $takeProfitPrice;
        if ($this->has['createTakeProfitOrderWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createTakeProfitOrderWs() is not supported yet');
    }

    public function create_order_with_take_profit_and_stop_loss(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfit = null, ?float $stopLoss = null, $params = array ()) {
        /**
         * create an order with a stop loss or take profit attached ($type 3)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} [$takeProfit] the take profit $price, in units of the quote currency
         * @param {float} [$stopLoss] the stop loss $price, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @param {string} [$params->takeProfitType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [$params->stopLossType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [$params->takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {string} [$params->stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {float} [$params->takeProfitLimitPrice] *not available on all exchanges* limit $price for a limit take profit order
         * @param {float} [$params->stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
         * @param {float} [$params->takeProfitAmount] *not available on all exchanges* the $amount for a take profit
         * @param {float} [$params->stopLossAmount] *not available on all exchanges* the $amount for a stop loss
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        $params = $this->set_take_profit_and_stop_loss_params($symbol, $type, $side, $amount, $price, $takeProfit, $stopLoss, $params);
        if ($this->has['createOrderWithTakeProfitAndStopLoss']) {
            return $this->create_order($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createOrderWithTakeProfitAndStopLoss() is not supported yet');
    }

    public function set_take_profit_and_stop_loss_params(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfit = null, ?float $stopLoss = null, $params = array ()) {
        if (($takeProfit === null) && ($stopLoss === null)) {
            throw new ArgumentsRequired($this->id . ' createOrderWithTakeProfitAndStopLoss() requires either a $takeProfit or $stopLoss argument');
        }
        if ($takeProfit !== null) {
            $params['takeProfit'] = array(
                'triggerPrice' => $takeProfit,
            );
        }
        if ($stopLoss !== null) {
            $params['stopLoss'] = array(
                'triggerPrice' => $stopLoss,
            );
        }
        $takeProfitType = $this->safe_string($params, 'takeProfitType');
        $takeProfitPriceType = $this->safe_string($params, 'takeProfitPriceType');
        $takeProfitLimitPrice = $this->safe_string($params, 'takeProfitLimitPrice');
        $takeProfitAmount = $this->safe_string($params, 'takeProfitAmount');
        $stopLossType = $this->safe_string($params, 'stopLossType');
        $stopLossPriceType = $this->safe_string($params, 'stopLossPriceType');
        $stopLossLimitPrice = $this->safe_string($params, 'stopLossLimitPrice');
        $stopLossAmount = $this->safe_string($params, 'stopLossAmount');
        if ($takeProfitType !== null) {
            $params['takeProfit']['type'] = $takeProfitType;
        }
        if ($takeProfitPriceType !== null) {
            $params['takeProfit']['priceType'] = $takeProfitPriceType;
        }
        if ($takeProfitLimitPrice !== null) {
            $params['takeProfit']['price'] = $this->parse_to_numeric($takeProfitLimitPrice);
        }
        if ($takeProfitAmount !== null) {
            $params['takeProfit']['amount'] = $this->parse_to_numeric($takeProfitAmount);
        }
        if ($stopLossType !== null) {
            $params['stopLoss']['type'] = $stopLossType;
        }
        if ($stopLossPriceType !== null) {
            $params['stopLoss']['priceType'] = $stopLossPriceType;
        }
        if ($stopLossLimitPrice !== null) {
            $params['stopLoss']['price'] = $this->parse_to_numeric($stopLossLimitPrice);
        }
        if ($stopLossAmount !== null) {
            $params['stopLoss']['amount'] = $this->parse_to_numeric($stopLossAmount);
        }
        $params = $this->omit($params, array( 'takeProfitType', 'takeProfitPriceType', 'takeProfitLimitPrice', 'takeProfitAmount', 'stopLossType', 'stopLossPriceType', 'stopLossLimitPrice', 'stopLossAmount' ));
        return $params;
    }

    public function create_order_with_take_profit_and_stop_loss_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfit = null, ?float $stopLoss = null, $params = array ()) {
        /**
         * create an order with a stop loss or take profit attached ($type 3)
         * @param {string} $symbol unified $symbol of the market to create an order in
         * @param {string} $type 'market' or 'limit'
         * @param {string} $side 'buy' or 'sell'
         * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
         * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
         * @param {float} [$takeProfit] the take profit $price, in units of the quote currency
         * @param {float} [$stopLoss] the stop loss $price, in units of the quote currency
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @param {string} [$params->takeProfitType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [$params->stopLossType] *not available on all exchanges* 'limit' or 'market'
         * @param {string} [$params->takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {string} [$params->stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
         * @param {float} [$params->takeProfitLimitPrice] *not available on all exchanges* limit $price for a limit take profit order
         * @param {float} [$params->stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
         * @param {float} [$params->takeProfitAmount] *not available on all exchanges* the $amount for a take profit
         * @param {float} [$params->stopLossAmount] *not available on all exchanges* the $amount for a stop loss
         * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
         */
        $params = $this->set_take_profit_and_stop_loss_params($symbol, $type, $side, $amount, $price, $takeProfit, $stopLoss, $params);
        if ($this->has['createOrderWithTakeProfitAndStopLossWs']) {
            return $this->create_order_ws($symbol, $type, $side, $amount, $price, $params);
        }
        throw new NotSupported($this->id . ' createOrderWithTakeProfitAndStopLossWs() is not supported yet');
    }

    public function create_orders(array $orders, $params = array ()) {
        throw new NotSupported($this->id . ' createOrders() is not supported yet');
    }

    public function edit_orders(array $orders, $params = array ()) {
        throw new NotSupported($this->id . ' editOrders() is not supported yet');
    }

    public function create_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrderWs() is not supported yet');
    }

    public function cancel_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrder() is not supported yet');
    }

    public function cancel_order_ws(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrderWs() is not supported yet');
    }

    public function cancel_orders_ws(array $ids, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrdersWs() is not supported yet');
    }

    public function cancel_all_orders(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrders() is not supported yet');
    }

    public function cancel_all_orders_after(?int $timeout, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrdersAfter() is not supported yet');
    }

    public function cancel_orders_for_symbols(array $orders, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrdersForSymbols() is not supported yet');
    }

    public function cancel_all_orders_ws(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrdersWs() is not supported yet');
    }

    public function cancel_unified_order($order, $params = array ()) {
        return $this->cancel_order($this->safe_string($order, 'id'), $this->safe_string($order, 'symbol'), $params);
    }

    public function fetch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOpenOrders'] && $this->has['fetchClosedOrders']) {
            throw new NotSupported($this->id . ' fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead');
        }
        throw new NotSupported($this->id . ' fetchOrders() is not supported yet');
    }

    public function fetch_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrdersWs() is not supported yet');
    }

    public function fetch_order_trades(string $id, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderTrades() is not supported yet');
    }

    public function watch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrders() is not supported yet');
    }

    public function fetch_open_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOrders']) {
            $orders = $this->fetch_orders($symbol, $since, $limit, $params);
            return $this->filter_by($orders, 'status', 'open');
        }
        throw new NotSupported($this->id . ' fetchOpenOrders() is not supported yet');
    }

    public function fetch_open_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOrdersWs']) {
            $orders = $this->fetch_orders_ws($symbol, $since, $limit, $params);
            return $this->filter_by($orders, 'status', 'open');
        }
        throw new NotSupported($this->id . ' fetchOpenOrdersWs() is not supported yet');
    }

    public function fetch_closed_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOrders']) {
            $orders = $this->fetch_orders($symbol, $since, $limit, $params);
            return $this->filter_by($orders, 'status', 'closed');
        }
        throw new NotSupported($this->id . ' fetchClosedOrders() is not supported yet');
    }

    public function fetch_canceled_and_closed_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchCanceledAndClosedOrders() is not supported yet');
    }

    public function fetch_closed_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOrdersWs']) {
            $orders = $this->fetch_orders_ws($symbol, $since, $limit, $params);
            return $this->filter_by($orders, 'status', 'closed');
        }
        throw new NotSupported($this->id . ' fetchClosedOrdersWs() is not supported yet');
    }

    public function fetch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTrades() is not supported yet');
    }

    public function fetch_my_liquidations(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyLiquidations() is not supported yet');
    }

    public function fetch_liquidations(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLiquidations() is not supported yet');
    }

    public function fetch_my_trades_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTradesWs() is not supported yet');
    }

    public function watch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyTrades() is not supported yet');
    }

    public function fetch_greeks(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchGreeks() is not supported yet');
    }

    public function fetch_all_greeks(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchAllGreeks() is not supported yet');
    }

    public function fetch_option_chain(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOptionChain() is not supported yet');
    }

    public function fetch_option(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOption() is not supported yet');
    }

    public function fetch_convert_quote(string $fromCode, string $toCode, ?float $amount = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchConvertQuote() is not supported yet');
    }

    public function fetch_deposits_withdrawals(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetch history of deposits and withdrawals
         * @param {string} [$code] unified currency $code for the currency of the deposit/withdrawals, default is null
         * @param {int} [$since] timestamp in ms of the earliest deposit/withdrawal, default is null
         * @param {int} [$limit] max number of deposit/withdrawals to return, default is null
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} a list of ~@link https://docs.ccxt.com/#/?id=transaction-structure transaction structures~
         */
        throw new NotSupported($this->id . ' fetchDepositsWithdrawals() is not supported yet');
    }

    public function fetch_deposits(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDeposits() is not supported yet');
    }

    public function fetch_withdrawals(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawals() is not supported yet');
    }

    public function fetch_deposits_ws(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositsWs() is not supported yet');
    }

    public function fetch_withdrawals_ws(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawalsWs() is not supported yet');
    }

    public function fetch_funding_rate_history(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingRateHistory() is not supported yet');
    }

    public function fetch_funding_history(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingHistory() is not supported yet');
    }

    public function close_position(string $symbol, ?string $side = null, $params = array ()) {
        throw new NotSupported($this->id . ' closePosition() is not supported yet');
    }

    public function close_all_positions($params = array ()) {
        throw new NotSupported($this->id . ' closeAllPositions() is not supported yet');
    }

    public function fetch_l3_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new BadRequest($this->id . ' fetchL3OrderBook() is not supported yet');
    }

    public function parse_last_price($price, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLastPrice() is not supported yet');
    }

    public function fetch_deposit_address(string $code, $params = array ()) {
        if ($this->has['fetchDepositAddresses']) {
            $depositAddresses = $this->fetch_deposit_addresses(array( $code ), $params);
            $depositAddress = $this->safe_value($depositAddresses, $code);
            if ($depositAddress === null) {
                throw new InvalidAddress($this->id . ' fetchDepositAddress() could not find a deposit address for ' . $code . ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
            } else {
                return $depositAddress;
            }
        } elseif ($this->has['fetchDepositAddressesByNetwork']) {
            $network = $this->safe_string($params, 'network');
            $params = $this->omit($params, 'network');
            $addressStructures = $this->fetch_deposit_addresses_by_network($code, $params);
            if ($network !== null) {
                return $this->safe_dict($addressStructures, $network);
            } else {
                $keys = is_array($addressStructures) ? array_keys($addressStructures) : array();
                $key = $this->safe_string($keys, 0);
                return $this->safe_dict($addressStructures, $key);
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

    public function common_currency_code(string $code) {
        if (!$this->substituteCommonCurrencyCodes) {
            return $code;
        }
        return $this->safe_string($this->commonCurrencies, $code, $code);
    }

    public function currency(string $code) {
        $keys = is_array($this->currencies) ? array_keys($this->currencies) : array();
        $numCurrencies = count($keys);
        if ($numCurrencies === 0) {
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
        } elseif ((str_ends_with($symbol, '-C')) || (str_ends_with($symbol, '-P')) || (str_starts_with($symbol, 'C-')) || (str_starts_with($symbol, 'P-'))) {
            return $this->create_expired_option_market($symbol);
        }
        throw new BadSymbol($this->id . ' does not have $market $symbol ' . $symbol);
    }

    public function create_expired_option_market(string $symbol) {
        throw new NotSupported($this->id . ' createExpiredOptionMarket () is not supported yet');
    }

    public function is_leveraged_currency($currencyCode, Bool $checkBaseCoin = false, ?array $existingCurrencies = null) {
        $leverageSuffixes = array(
            '2L', '2S', '3L', '3S', '4L', '4S', '5L', '5S', // Leveraged Tokens (LT)
            'UP', 'DOWN', // exchange-specific (e.g. BLVT)
            'BULL', 'BEAR', // similar
        );
        for ($i = 0; $i < count($leverageSuffixes); $i++) {
            $leverageSuffix = $leverageSuffixes[$i];
            if (str_ends_with($currencyCode, $leverageSuffix)) {
                if (!$checkBaseCoin) {
                    return true;
                } else {
                    // check if base currency is inside dict
                    $baseCurrencyCode = str_replace($leverageSuffix, '', $currencyCode);
                    if (is_array($existingCurrencies) && array_key_exists($baseCurrencyCode, $existingCurrencies)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public function handle_withdraw_tag_and_params($tag, $params) {
        if (($tag !== null) && (gettype($tag) === 'array')) {
            $params = $this->extend($tag, $params);
            $tag = null;
        }
        if ($tag === null) {
            $tag = $this->safe_string($params, 'tag');
            if ($tag !== null) {
                $params = $this->omit($params, 'tag');
            }
        }
        return array( $tag, $params );
    }

    public function create_limit_order(string $symbol, string $side, float $amount, float $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_limit_order_ws(string $symbol, string $side, float $amount, float $price, $params = array ()) {
        return $this->create_order_ws($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order(string $symbol, string $side, float $amount, ?float $price = null, $params = array ()) {
        return $this->create_order($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_market_order_ws(string $symbol, string $side, float $amount, ?float $price = null, $params = array ()) {
        return $this->create_order_ws($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_limit_buy_order(string $symbol, float $amount, float $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', 'buy', $amount, $price, $params);
    }

    public function create_limit_buy_order_ws(string $symbol, float $amount, float $price, $params = array ()) {
        return $this->create_order_ws($symbol, 'limit', 'buy', $amount, $price, $params);
    }

    public function create_limit_sell_order(string $symbol, float $amount, float $price, $params = array ()) {
        return $this->create_order($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_limit_sell_order_ws(string $symbol, float $amount, float $price, $params = array ()) {
        return $this->create_order_ws($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order(string $symbol, float $amount, $params = array ()) {
        return $this->create_order($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_buy_order_ws(string $symbol, float $amount, $params = array ()) {
        return $this->create_order_ws($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order(string $symbol, float $amount, $params = array ()) {
        return $this->create_order($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function create_market_sell_order_ws(string $symbol, float $amount, $params = array ()) {
        return $this->create_order_ws($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function cost_to_precision(string $symbol, $cost) {
        if ($cost === null) {
            return null;
        }
        $market = $this->market($symbol);
        return $this->decimal_to_precision($cost, TRUNCATE, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function price_to_precision(string $symbol, $price) {
        if ($price === null) {
            return null;
        }
        $market = $this->market($symbol);
        $result = $this->decimal_to_precision($price, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new InvalidOrder($this->id . ' $price of ' . $market['symbol'] . ' must be greater than minimum $price precision of ' . $this->number_to_string($market['precision']['price']));
        }
        return $result;
    }

    public function amount_to_precision(string $symbol, $amount) {
        if ($amount === null) {
            return null;
        }
        $market = $this->market($symbol);
        $result = $this->decimal_to_precision($amount, TRUNCATE, $market['precision']['amount'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new InvalidOrder($this->id . ' $amount of ' . $market['symbol'] . ' must be greater than minimum $amount precision of ' . $this->number_to_string($market['precision']['amount']));
        }
        return $result;
    }

    public function fee_to_precision(string $symbol, $fee) {
        if ($fee === null) {
            return null;
        }
        $market = $this->market($symbol);
        return $this->decimal_to_precision($fee, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function currency_to_precision(string $code, $fee, $networkCode = null) {
        $currency = $this->currencies[$code];
        $precision = $this->safe_value($currency, 'precision');
        if ($networkCode !== null) {
            $networks = $this->safe_dict($currency, 'networks', array());
            $networkItem = $this->safe_dict($networks, $networkCode, array());
            $precision = $this->safe_value($networkItem, 'precision', $precision);
        }
        if ($precision === null) {
            return $this->force_string($fee);
        } else {
            $roundingMode = $this->safe_integer($this->options, 'currencyToPrecisionRoundingMode', ROUND);
            return $this->decimal_to_precision($fee, $roundingMode, $precision, $this->precisionMode, $this->paddingMode);
        }
    }

    public function force_string($value) {
        if (gettype($value) !== 'string') {
            return $this->number_to_string($value);
        }
        return $value;
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

    public function safe_number($obj, int|string $key, ?float $defaultNumber = null) {
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
        if ($precisionNumber > 0) {
            $parsedPrecision = '0.';
            for ($i = 0; $i < $precisionNumber - 1; $i++) {
                $parsedPrecision = $parsedPrecision . '0';
            }
            return $parsedPrecision . '1';
        } else {
            $parsedPrecision = '1';
            for ($i = 0; $i < $precisionNumber * -1 - 1; $i++) {
                $parsedPrecision = $parsedPrecision . '0';
            }
            return $parsedPrecision . '0';
        }
    }

    public function integer_precision_to_amount(?string $precision) {
        /**
         * @ignore
         * handles positive & negative numbers too. parsePrecision() does not handle negative numbers, but this method handles
         * @param {string} $precision The number of digits to the right of the decimal
         * @return {string} a string number equal to 1e-$precision
         */
        if ($precision === null) {
            return null;
        }
        if (Precise::string_ge($precision, '0')) {
            return $this->parse_precision($precision);
        } else {
            $positivePrecisionString = Precise::string_abs($precision);
            $positivePrecision = intval($positivePrecisionString);
            $parsedPrecision = '1';
            for ($i = 0; $i < $positivePrecision - 1; $i++) {
                $parsedPrecision = $parsedPrecision . '0';
            }
            return $parsedPrecision . '0';
        }
    }

    public function load_time_difference($params = array ()) {
        $serverTime = $this->fetch_time($params);
        $after = $this->milliseconds();
        $this->options['timeDifference'] = $after - $serverTime;
        return $this->options['timeDifference'];
    }

    public function implode_hostname(string $url) {
        return $this->implode_params($url, array( 'hostname' => $this->hostname ));
    }

    public function fetch_market_leverage_tiers(string $symbol, $params = array ()) {
        if ($this->has['fetchLeverageTiers']) {
            $market = $this->market($symbol);
            if (!$market['contract']) {
                throw new BadSymbol($this->id . ' fetchMarketLeverageTiers() supports contract markets only');
            }
            $tiers = $this->fetch_leverage_tiers(array( $symbol ));
            return $this->safe_value($tiers, $symbol);
        } else {
            throw new NotSupported($this->id . ' fetchMarketLeverageTiers() is not supported yet');
        }
    }

    public function create_post_only_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        if (!$this->has['createPostOnlyOrder']) {
            throw new NotSupported($this->id . ' createPostOnlyOrder() is not supported yet');
        }
        $query = $this->extend($params, array( 'postOnly' => true ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_post_only_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        if (!$this->has['createPostOnlyOrderWs']) {
            throw new NotSupported($this->id . ' createPostOnlyOrderWs() is not supported yet');
        }
        $query = $this->extend($params, array( 'postOnly' => true ));
        return $this->create_order_ws($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_reduce_only_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        if (!$this->has['createReduceOnlyOrder']) {
            throw new NotSupported($this->id . ' createReduceOnlyOrder() is not supported yet');
        }
        $query = $this->extend($params, array( 'reduceOnly' => true ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_reduce_only_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        if (!$this->has['createReduceOnlyOrderWs']) {
            throw new NotSupported($this->id . ' createReduceOnlyOrderWs() is not supported yet');
        }
        $query = $this->extend($params, array( 'reduceOnly' => true ));
        return $this->create_order_ws($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_stop_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $triggerPrice = null, $params = array ()) {
        if (!$this->has['createStopOrder']) {
            throw new NotSupported($this->id . ' createStopOrder() is not supported yet');
        }
        if ($triggerPrice === null) {
            throw new ArgumentsRequired($this->id . ' create_stop_order() requires a stopPrice argument');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_stop_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $triggerPrice = null, $params = array ()) {
        if (!$this->has['createStopOrderWs']) {
            throw new NotSupported($this->id . ' createStopOrderWs() is not supported yet');
        }
        if ($triggerPrice === null) {
            throw new ArgumentsRequired($this->id . ' createStopOrderWs() requires a stopPrice argument');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order_ws($symbol, $type, $side, $amount, $price, $query);
    }

    public function create_stop_limit_order(string $symbol, string $side, float $amount, float $price, float $triggerPrice, $params = array ()) {
        if (!$this->has['createStopLimitOrder']) {
            throw new NotSupported($this->id . ' createStopLimitOrder() is not supported yet');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order($symbol, 'limit', $side, $amount, $price, $query);
    }

    public function create_stop_limit_order_ws(string $symbol, string $side, float $amount, float $price, float $triggerPrice, $params = array ()) {
        if (!$this->has['createStopLimitOrderWs']) {
            throw new NotSupported($this->id . ' createStopLimitOrderWs() is not supported yet');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order_ws($symbol, 'limit', $side, $amount, $price, $query);
    }

    public function create_stop_market_order(string $symbol, string $side, float $amount, float $triggerPrice, $params = array ()) {
        if (!$this->has['createStopMarketOrder']) {
            throw new NotSupported($this->id . ' createStopMarketOrder() is not supported yet');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order($symbol, 'market', $side, $amount, null, $query);
    }

    public function create_stop_market_order_ws(string $symbol, string $side, float $amount, float $triggerPrice, $params = array ()) {
        if (!$this->has['createStopMarketOrderWs']) {
            throw new NotSupported($this->id . ' createStopMarketOrderWs() is not supported yet');
        }
        $query = $this->extend($params, array( 'stopPrice' => $triggerPrice ));
        return $this->create_order_ws($symbol, 'market', $side, $amount, null, $query);
    }

    public function safe_currency_code(?string $currencyId, ?array $currency = null) {
        $currency = $this->safe_currency($currencyId, $currency);
        return $currency['code'];
    }

    public function filter_by_symbol_since_limit($array, ?string $symbol = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_currency_since_limit($array, $code = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_symbols_since_limit($array, ?array $symbols = null, ?int $since = null, ?int $limit = null, $tail = false) {
        $result = $this->filter_by_array($array, 'symbol', $symbols, false);
        return $this->filter_by_since_limit($result, $since, $limit, 'timestamp', $tail);
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
                $priceData = $this->extend($this->parse_last_price($pricesData[$i]), $params);
                $results[] = $priceData;
            }
        } else {
            $marketIds = is_array($pricesData) ? array_keys($pricesData) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $priceData = $this->extend($this->parse_last_price($pricesData[$marketId], $market), $params);
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
                $parsedTicker = $this->parse_ticker($tickers[$i]);
                $ticker = $this->extend($parsedTicker, $params);
                $results[] = $ticker;
            }
        } else {
            $marketIds = is_array($tickers) ? array_keys($tickers) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $parsed = $this->parse_ticker($tickers[$marketId], $market);
                $ticker = $this->extend($parsed, $params);
                $results[] = $ticker;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_deposit_addresses($addresses, ?array $codes = null, $indexed = true, $params = array ()) {
        $result = array();
        for ($i = 0; $i < count($addresses); $i++) {
            $address = $this->extend($this->parse_deposit_address($addresses[$i]), $params);
            $result[] = $address;
        }
        if ($codes !== null) {
            $result = $this->filter_by_array($result, 'currency', $codes, false);
        }
        if ($indexed) {
            $result = $this->filter_by_array($result, 'currency', null, $indexed);
        }
        return $result;
    }

    public function parse_borrow_interests($response, ?array $market = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $row = $response[$i];
            $interests[] = $this->parse_borrow_interest($row, $market);
        }
        return $interests;
    }

    public function parse_borrow_rate($info, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseBorrowRate() is not supported yet');
    }

    public function parse_borrow_rate_history($response, ?string $code, ?int $since, ?int $limit) {
        $result = array();
        for ($i = 0; $i < count($response); $i++) {
            $item = $response[$i];
            $borrowRate = $this->parse_borrow_rate($item);
            $result[] = $borrowRate;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        return $this->filter_by_currency_since_limit($sorted, $code, $since, $limit);
    }

    public function parse_isolated_borrow_rates(mixed $info) {
        $result = array();
        for ($i = 0; $i < count($info); $i++) {
            $item = $info[$i];
            $borrowRate = $this->parse_isolated_borrow_rate($item);
            $symbol = $this->safe_string($borrowRate, 'symbol');
            $result[$symbol] = $borrowRate;
        }
        return $result;
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

    public function safe_symbol(?string $marketId, ?array $market = null, ?string $delimiter = null, ?string $marketType = null) {
        $market = $this->safe_market($marketId, $market, $delimiter, $marketType);
        return $market['symbol'];
    }

    public function parse_funding_rate(string $contract, ?array $market = null) {
        throw new NotSupported($this->id . ' parseFundingRate() is not supported yet');
    }

    public function parse_funding_rates($response, ?array $symbols = null) {
        $fundingRates = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $parsed = $this->parse_funding_rate($entry);
            $fundingRates[$parsed['symbol']] = $parsed;
        }
        return $this->filter_by_array($fundingRates, 'symbol', $symbols);
    }

    public function parse_long_short_ratio(array $info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLongShortRatio() is not supported yet');
    }

    public function parse_long_short_ratio_history($response, $market = null, ?int $since = null, ?int $limit = null) {
        $rates = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $rates[] = $this->parse_long_short_ratio($entry, $market);
        }
        $sorted = $this->sort_by($rates, 'timestamp');
        $symbol = ($market === null) ? null : $market['symbol'];
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function handle_trigger_prices_and_params($symbol, $params, $omitParams = true) {
        //
        $triggerPrice = $this->safe_string_2($params, 'triggerPrice', 'stopPrice');
        $triggerPriceStr = null;
        $stopLossPrice = $this->safe_string($params, 'stopLossPrice');
        $stopLossPriceStr = null;
        $takeProfitPrice = $this->safe_string($params, 'takeProfitPrice');
        $takeProfitPriceStr = null;
        //
        if ($triggerPrice !== null) {
            if ($omitParams) {
                $params = $this->omit($params, array( 'triggerPrice', 'stopPrice' ));
            }
            $triggerPriceStr = $this->price_to_precision($symbol, floatval($triggerPrice));
        }
        if ($stopLossPrice !== null) {
            if ($omitParams) {
                $params = $this->omit($params, 'stopLossPrice');
            }
            $stopLossPriceStr = $this->price_to_precision($symbol, floatval($stopLossPrice));
        }
        if ($takeProfitPrice !== null) {
            if ($omitParams) {
                $params = $this->omit($params, 'takeProfitPrice');
            }
            $takeProfitPriceStr = $this->price_to_precision($symbol, floatval($takeProfitPrice));
        }
        return array( $triggerPriceStr, $stopLossPriceStr, $takeProfitPriceStr, $params );
    }

    public function handle_trigger_direction_and_params($params, ?string $exchangeSpecificKey = null, Bool $allowEmpty = false) {
        /**
         * @ignore
         * @return array([string, object]) the trigger-direction value and omited $params
         */
        $triggerDirection = $this->safe_string($params, 'triggerDirection');
        $exchangeSpecificDefined = ($exchangeSpecificKey !== null) && (is_array($params) && array_key_exists($exchangeSpecificKey, $params));
        if ($triggerDirection !== null) {
            $params = $this->omit($params, 'triggerDirection');
        }
        // throw exception if:
        // A) if provided value is not unified (support old "up/down" strings too)
        // B) if exchange specific "trigger direction key" (eg. "stopPriceSide") was not provided
        if (!$this->in_array($triggerDirection, array( 'ascending', 'descending', 'up', 'down', 'above', 'below' )) && !$exchangeSpecificDefined && !$allowEmpty) {
            throw new ArgumentsRequired($this->id . ' createOrder() : trigger orders require $params["triggerDirection"] to be either "ascending" or "descending"');
        }
        // if old format was provided, overwrite to new
        if ($triggerDirection === 'up' || $triggerDirection === 'above') {
            $triggerDirection = 'ascending';
        } elseif ($triggerDirection === 'down' || $triggerDirection === 'below') {
            $triggerDirection = 'descending';
        }
        return array( $triggerDirection, $params );
    }

    public function handle_trigger_and_params($params) {
        $isTrigger = $this->safe_bool_2($params, 'trigger', 'stop');
        if ($isTrigger) {
            $params = $this->omit($params, array( 'trigger', 'stop' ));
        }
        return array( $isTrigger, $params );
    }

    public function is_trigger_order($params) {
        // for backwards compatibility
        return $this->handle_trigger_and_params($params);
    }

    public function is_post_only(bool $isMarketOrder, $exchangeSpecificParam, $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} $exchangeSpecificParam exchange specific $postOnly
         * @param {array} [$params] exchange specific $params
         * @return {boolean} true if a post only order, false otherwise
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_bool_2($params, 'postOnly', 'post_only', false);
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
         * @param {array} [$params] exchange specific $params
         * @return {Array}
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_bool($params, 'postOnly', false);
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
                    $params = $this->omit($params, 'timeInForce');
                }
                $params = $this->omit($params, 'postOnly');
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

    public function fetch_trading_fees_ws($params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingFeesWs() is not supported yet');
    }

    public function fetch_trading_fee(string $symbol, $params = array ()) {
        if (!$this->has['fetchTradingFees']) {
            throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
        }
        $fees = $this->fetch_trading_fees($params);
        return $this->safe_dict($fees, $symbol);
    }

    public function fetch_convert_currencies($params = array ()) {
        throw new NotSupported($this->id . ' fetchConvertCurrencies() is not supported yet');
    }

    public function parse_open_interest($interest, ?array $market = null) {
        throw new NotSupported($this->id . ' parseOpenInterest () is not supported yet');
    }

    public function parse_open_interests($response, ?array $symbols = null) {
        $result = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $parsed = $this->parse_open_interest($entry);
            $result[$parsed['symbol']] = $parsed;
        }
        return $this->filter_by_array($result, 'symbol', $symbols);
    }

    public function parse_open_interests_history($response, $market = null, ?int $since = null, ?int $limit = null) {
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
            $market = $this->market($symbol);
            $symbol = $market['symbol'];
            if (!$market['contract']) {
                throw new BadSymbol($this->id . ' fetchFundingRate() supports contract markets only');
            }
            $rates = $this->fetch_funding_rates(array( $symbol ), $params);
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

    public function fetch_funding_interval(string $symbol, $params = array ()) {
        if ($this->has['fetchFundingIntervals']) {
            $this->load_markets();
            $market = $this->market($symbol);
            $symbol = $market['symbol'];
            if (!$market['contract']) {
                throw new BadSymbol($this->id . ' fetchFundingInterval() supports contract markets only');
            }
            $rates = $this->fetch_funding_intervals(array( $symbol ), $params);
            $rate = $this->safe_value($rates, $symbol);
            if ($rate === null) {
                throw new NullResponse($this->id . ' fetchFundingInterval() returned no data for ' . $symbol);
            } else {
                return $rate;
            }
        } else {
            throw new NotSupported($this->id . ' fetchFundingInterval() is not supported yet');
        }
    }

    public function fetch_mark_ohlcv(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical mark price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int} [$since] timestamp in ms of the earliest candle to fetch
         * @param {int} [$limit] the maximum amount of candles to fetch
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {float[][]} A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchMarkOHLCV']) {
            $request = array(
                'price' => 'mark',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, $this->extend($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchMarkOHLCV () is not supported yet');
        }
    }

    public function fetch_index_ohlcv(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int} [$since] timestamp in ms of the earliest candle to fetch
         * @param {int} [$limit] the maximum amount of candles to fetch
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return array() A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchIndexOHLCV']) {
            $request = array(
                'price' => 'index',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, $this->extend($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchIndexOHLCV () is not supported yet');
        }
    }

    public function fetch_premium_index_ohlcv(string $symbol, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
         * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
         * @param {string} $timeframe the length of time each candle represents
         * @param {int} [$since] timestamp in ms of the earliest candle to fetch
         * @param {int} [$limit] the maximum amount of candles to fetch
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {float[][]} A list of candles ordered, open, high, low, close, null
         */
        if ($this->has['fetchPremiumIndexOHLCV']) {
            $request = array(
                'price' => 'premiumIndex',
            );
            return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, $this->extend($request, $params));
        } else {
            throw new NotSupported($this->id . ' fetchPremiumIndexOHLCV () is not supported yet');
        }
    }

    public function handle_time_in_force($params = array ()) {
        /**
         * @ignore
         * Must add $timeInForce to $this->options to use this method
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
         * Must add $accountsByType to $this->options to use this method
         * @param {string} $account key for $account name in $this->options['accountsByType']
         * @return the exchange specific $account name or the isolated margin id for transfers
         */
        $accountsByType = $this->safe_dict($this->options, 'accountsByType', array());
        $lowercaseAccount = strtolower($account);
        if (is_array($accountsByType) && array_key_exists($lowercaseAccount, $accountsByType)) {
            return $accountsByType[$lowercaseAccount];
        } elseif ((is_array($this->markets) && array_key_exists($account, $this->markets)) || (is_array($this->markets_by_id) && array_key_exists($account, $this->markets_by_id))) {
            $market = $this->market($account);
            return $market['id'];
        } else {
            return $account;
        }
    }

    public function check_required_argument(string $methodName, $argument, $argumentName, $options = []) {
        /**
         * @ignore
         * @param {string} $methodName the name of the method that the $argument is being checked for
         * @param {string} $argument the argument's actual value provided
         * @param {string} $argumentName the name of the $argument being checked (for logging purposes)
         * @param {string[]} $options a list of $options that the $argument can be
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

    public function check_required_margin_argument(string $methodName, ?string $symbol, string $marginMode) {
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

    public function parse_deposit_withdraw_fees($response, ?array $codes = null, $currencyIdKey = null) {
        /**
         * @ignore
         * @param {object[]|array} $response unparsed $response from the exchange
         * @param {string[]|null} $codes the unified $currency $codes to fetch transactions fees for, returns all currencies when null
         * @param {str} $currencyIdKey *should only be null when $response is a $dictionary* the object key that corresponds to the $currency id
         * @return {array} objects with withdraw and deposit fees, indexed by $currency $codes
         */
        $depositWithdrawFees = array();
        $isArray = gettype($response) === 'array' && array_keys($response) === array_keys(array_keys($response));
        $responseKeys = $response;
        if (!$isArray) {
            $responseKeys = is_array($response) ? array_keys($response) : array();
        }
        for ($i = 0; $i < count($responseKeys); $i++) {
            $entry = $responseKeys[$i];
            $dictionary = $isArray ? $entry : $response[$entry];
            $currencyId = $isArray ? $this->safe_string($dictionary, $currencyIdKey) : $entry;
            $currency = $this->safe_currency($currencyId);
            $code = $this->safe_string($currency, 'code');
            if (($codes === null) || ($this->in_array($code, $codes))) {
                $depositWithdrawFees[$code] = $this->parse_deposit_withdraw_fee($dictionary, $currency);
            }
        }
        return $depositWithdrawFees;
    }

    public function parse_deposit_withdraw_fee($fee, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseDepositWithdrawFee() is not supported yet');
    }

    public function deposit_withdraw_fee($info) {
        return array(
            'info' => $info,
            'withdraw' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'deposit' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'networks' => array(),
        );
    }

    public function assign_default_deposit_withdraw_fees($fee, $currency = null) {
        /**
         * @ignore
         * Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {array} $fee A deposit withdraw $fee structure
         * @param {array} $currency A $currency structure, the response from $this->currency()
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
                $fee['withdraw'] = $fee['networks'][$networkKeys[$i]]['withdraw'];
                $fee['deposit'] = $fee['networks'][$networkKeys[$i]]['deposit'];
            }
        }
        return $fee;
    }

    public function parse_income($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseIncome () is not supported yet');
    }

    public function parse_incomes($incomes, $market = null, ?int $since = null, ?int $limit = null) {
        /**
         * @ignore
         * parses funding fee info from exchange response
         * @param {array[]} $incomes each item describes once instance of currency being received or paid
         * @param {array} $market ccxt $market
         * @param {int} [$since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [$limit] limits the number of items in the response
         * @return {array[]} an array of ~@link https://docs.ccxt.com/#/?id=funding-history-structure funding history structures~
         */
        $result = array();
        for ($i = 0; $i < count($incomes); $i++) {
            $entry = $incomes[$i];
            $parsed = $this->parse_income($entry, $market);
            $result[] = $parsed;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        $symbol = $this->safe_string($market, 'symbol');
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function get_market_from_symbols(?array $symbols = null) {
        if ($symbols === null) {
            return null;
        }
        $firstMarket = $this->safe_string($symbols, 0);
        $market = $this->market($firstMarket);
        return $market;
    }

    public function parse_ws_ohlcvs(mixed $ohlcvs, mixed $market = null, string $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ws_ohlcv($ohlcvs[$i], $market);
        }
        return $results;
    }

    public function fetch_transactions(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * @deprecated
         * *DEPRECATED* use fetchDepositsWithdrawals instead
         * @param {string} $code unified currency $code for the currency of the deposit/withdrawals, default is null
         * @param {int} [$since] timestamp in ms of the earliest deposit/withdrawal, default is null
         * @param {int} [$limit] max number of deposit/withdrawals to return, default is null
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} a list of ~@link https://docs.ccxt.com/#/?id=transaction-structure transaction structures~
         */
        if ($this->has['fetchDepositsWithdrawals']) {
            return $this->fetch_deposits_withdrawals($code, $since, $limit, $params);
        } else {
            throw new NotSupported($this->id . ' fetchTransactions () is not supported yet');
        }
    }

    public function filter_by_array_positions($objects, int|string $key, $values = null, $indexed = true) {
        /**
         * @ignore
         * Typed wrapper for filterByArray that returns a list of positions
         */
        return $this->filter_by_array($objects, $key, $values, $indexed);
    }

    public function filter_by_array_tickers($objects, int|string $key, $values = null, $indexed = true) {
        /**
         * @ignore
         * Typed wrapper for filterByArray that returns a dictionary of tickers
         */
        return $this->filter_by_array($objects, $key, $values, $indexed);
    }

    public function create_ohlcv_object(string $symbol, string $timeframe, $data) {
        $res = array();
        $res[$symbol] = array();
        $res[$symbol][$timeframe] = $data;
        return $res;
    }

    public function handle_max_entries_per_request_and_params(string $method, ?int $maxEntriesPerRequest = null, $params = array ()) {
        $newMaxEntriesPerRequest = null;
        list($newMaxEntriesPerRequest, $params) = $this->handle_option_and_params($params, $method, 'maxEntriesPerRequest');
        if (($newMaxEntriesPerRequest !== null) && ($newMaxEntriesPerRequest !== $maxEntriesPerRequest)) {
            $maxEntriesPerRequest = $newMaxEntriesPerRequest;
        }
        if ($maxEntriesPerRequest === null) {
            $maxEntriesPerRequest = 1000; // default to 1000
        }
        return array( $maxEntriesPerRequest, $params );
    }

    public function fetch_paginated_call_dynamic(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array (), ?int $maxEntriesPerRequest = null, $removeRepeated = true) {
        $maxCalls = null;
        list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
        $maxRetries = null;
        list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
        $paginationDirection = null;
        list($paginationDirection, $params) = $this->handle_option_and_params($params, $method, 'paginationDirection', 'backward');
        $paginationTimestamp = null;
        $removeRepeatedOption = $removeRepeated;
        list($removeRepeatedOption, $params) = $this->handle_option_and_params($params, $method, 'removeRepeated', $removeRepeated);
        $calls = 0;
        $result = array();
        $errors = 0;
        $until = $this->safe_integer_n($params, array( 'until', 'untill', 'till' )); // do not omit it from $params here
        list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
        if (($paginationDirection === 'forward')) {
            if ($since === null) {
                throw new ArgumentsRequired($this->id . ' pagination requires a $since argument when $paginationDirection set to forward');
            }
            $paginationTimestamp = $since;
        }
        while (($calls < $maxCalls)) {
            $calls += 1;
            try {
                if ($paginationDirection === 'backward') {
                    // do it backwards, starting from the $last
                    // UNTIL filtering is required in order to work
                    if ($paginationTimestamp !== null) {
                        $params['until'] = $paginationTimestamp - 1;
                    }
                    $response = $this->$method ($symbol, null, $maxEntriesPerRequest, $params);
                    $responseLength = count($response);
                    if ($this->verbose) {
                        $backwardMessage = 'Dynamic pagination call ' . $this->number_to_string($calls) . ' $method ' . $method . ' $response length ' . $this->number_to_string($responseLength);
                        if ($paginationTimestamp !== null) {
                            $backwardMessage .= ' timestamp ' . $this->number_to_string($paginationTimestamp);
                        }
                        $this->log($backwardMessage);
                    }
                    if ($responseLength === 0) {
                        break;
                    }
                    $errors = 0;
                    $result = $this->array_concat($result, $response);
                    $firstElement = $this->safe_value($response, 0);
                    $paginationTimestamp = $this->safe_integer_2($firstElement, 'timestamp', 0);
                    if (($since !== null) && ($paginationTimestamp <= $since)) {
                        break;
                    }
                } else {
                    // do it forwards, starting from the $since
                    $response = $this->$method ($symbol, $paginationTimestamp, $maxEntriesPerRequest, $params);
                    $responseLength = count($response);
                    if ($this->verbose) {
                        $forwardMessage = 'Dynamic pagination call ' . $this->number_to_string($calls) . ' $method ' . $method . ' $response length ' . $this->number_to_string($responseLength);
                        if ($paginationTimestamp !== null) {
                            $forwardMessage .= ' timestamp ' . $this->number_to_string($paginationTimestamp);
                        }
                        $this->log($forwardMessage);
                    }
                    if ($responseLength === 0) {
                        break;
                    }
                    $errors = 0;
                    $result = $this->array_concat($result, $response);
                    $last = $this->safe_value($response, $responseLength - 1);
                    $paginationTimestamp = $this->safe_integer($last, 'timestamp') + 1;
                    if (($until !== null) && ($paginationTimestamp >= $until)) {
                        break;
                    }
                }
            } catch (Exception $e) {
                $errors += 1;
                if ($errors > $maxRetries) {
                    throw $e;
                }
            }
        }
        $uniqueResults = $result;
        if ($removeRepeatedOption) {
            $uniqueResults = $this->remove_repeated_elements_from_array($result);
        }
        $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
        return $this->filter_by_since_limit($uniqueResults, $since, $limit, $key);
    }

    public function safe_deterministic_call(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, ?string $timeframe = null, $params = array ()) {
        $maxRetries = null;
        list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
        $errors = 0;
        while ($errors <= $maxRetries) {
            try {
                if ($timeframe && $method !== 'fetchFundingRateHistory') {
                    return $this->$method ($symbol, $timeframe, $since, $limit, $params);
                } else {
                    return $this->$method ($symbol, $since, $limit, $params);
                }
            } catch (Exception $e) {
                if ($e instanceof RateLimitExceeded) {
                    throw $e; // if we are rate limited, we should not retry and fail fast
                }
                $errors += 1;
                if ($errors > $maxRetries) {
                    throw $e;
                }
            }
        }
        return array();
    }

    public function fetch_paginated_call_deterministic(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, ?string $timeframe = null, $params = array (), $maxEntriesPerRequest = null) {
        $maxCalls = null;
        list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
        list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
        $current = $this->milliseconds();
        $tasks = array();
        $time = $this->parse_timeframe($timeframe) * 1000;
        $step = $time * $maxEntriesPerRequest;
        $currentSince = $current - ($maxCalls * $step) - 1;
        if ($since !== null) {
            $currentSince = max ($currentSince, $since);
        } else {
            $currentSince = max ($currentSince, 1241440531000); // avoid timestamps older than 2009
        }
        $until = $this->safe_integer_2($params, 'until', 'till'); // do not omit it here
        if ($until !== null) {
            $requiredCalls = (int) ceil(($until - $since) / $step);
            if ($requiredCalls > $maxCalls) {
                throw new BadRequest($this->id . ' the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the $since-$until gap. Current paginationCalls $limit is ' . (string) $maxCalls . ' required calls is ' . (string) $requiredCalls);
            }
        }
        for ($i = 0; $i < $maxCalls; $i++) {
            if (($until !== null) && ($currentSince >= $until)) {
                break;
            }
            if ($currentSince >= $current) {
                break;
            }
            $tasks[] = $this->safe_deterministic_call($method, $symbol, $currentSince, $maxEntriesPerRequest, $timeframe, $params);
            $currentSince = $this->sum($currentSince, $step) - 1;
        }
        $results = $tasks;
        $result = array();
        for ($i = 0; $i < count($results); $i++) {
            $result = $this->array_concat($result, $results[$i]);
        }
        $uniqueResults = $this->remove_repeated_elements_from_array($result);
        $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
        return $this->filter_by_since_limit($uniqueResults, $since, $limit, $key);
    }

    public function fetch_paginated_call_cursor(string $method, ?string $symbol = null, $since = null, $limit = null, $params = array (), $cursorReceived = null, $cursorSent = null, $cursorIncrement = null, $maxEntriesPerRequest = null) {
        $maxCalls = null;
        list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
        $maxRetries = null;
        list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
        list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
        $cursorValue = null;
        $i = 0;
        $errors = 0;
        $result = array();
        $timeframe = $this->safe_string($params, 'timeframe');
        $params = $this->omit($params, 'timeframe'); // reading the $timeframe from the $method arguments to avoid changing the signature
        while ($i < $maxCalls) {
            try {
                if ($cursorValue !== null) {
                    if ($cursorIncrement !== null) {
                        $cursorValue = $this->parse_to_int($cursorValue) . $cursorIncrement;
                    }
                    $params[$cursorSent] = $cursorValue;
                }
                $response = null;
                if ($method === 'fetchAccounts') {
                    $response = $this->$method ($params);
                } elseif ($method === 'getLeverageTiersPaginated' || $method === 'fetchPositions') {
                    $response = $this->$method ($symbol, $params);
                } elseif ($method === 'fetchOpenInterestHistory') {
                    $response = $this->$method ($symbol, $timeframe, $since, $maxEntriesPerRequest, $params);
                } else {
                    $response = $this->$method ($symbol, $since, $maxEntriesPerRequest, $params);
                }
                $errors = 0;
                $responseLength = count($response);
                if ($this->verbose) {
                    $cursorString = ($cursorValue === null) ? '' : $cursorValue;
                    $iteration = ($i + 1);
                    $cursorMessage = 'Cursor pagination call ' . (string) $iteration . ' $method ' . $method . ' $response length ' . (string) $responseLength . ' $cursor ' . $cursorString;
                    $this->log($cursorMessage);
                }
                if ($responseLength === 0) {
                    break;
                }
                $result = $this->array_concat($result, $response);
                $last = $this->safe_dict($response, $responseLength - 1);
                // $cursorValue = $this->safe_value($last['info'], $cursorReceived);
                $cursorValue = null; // search for the $cursor
                for ($j = 0; $j < $responseLength; $j++) {
                    $index = $responseLength - $j - 1;
                    $entry = $this->safe_dict($response, $index);
                    $info = $this->safe_dict($entry, 'info');
                    $cursor = $this->safe_value($info, $cursorReceived);
                    if ($cursor !== null) {
                        $cursorValue = $cursor;
                        break;
                    }
                }
                if ($cursorValue === null) {
                    break;
                }
                $lastTimestamp = $this->safe_integer($last, 'timestamp');
                if ($lastTimestamp !== null && $lastTimestamp < $since) {
                    break;
                }
            } catch (Exception $e) {
                $errors += 1;
                if ($errors > $maxRetries) {
                    throw $e;
                }
            }
            $i += 1;
        }
        $sorted = $this->sort_cursor_paginated_result($result);
        $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
        return $this->filter_by_since_limit($sorted, $since, $limit, $key);
    }

    public function fetch_paginated_call_incremental(string $method, ?string $symbol = null, $since = null, $limit = null, $params = array (), $pageKey = null, $maxEntriesPerRequest = null) {
        $maxCalls = null;
        list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
        $maxRetries = null;
        list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
        list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
        $i = 0;
        $errors = 0;
        $result = array();
        while ($i < $maxCalls) {
            try {
                $params[$pageKey] = $i + 1;
                $response = $this->$method ($symbol, $since, $maxEntriesPerRequest, $params);
                $errors = 0;
                $responseLength = count($response);
                if ($this->verbose) {
                    $iteration = ($i . (string) 1);
                    $incrementalMessage = 'Incremental pagination call ' . $iteration . ' $method ' . $method . ' $response length ' . (string) $responseLength;
                    $this->log($incrementalMessage);
                }
                if ($responseLength === 0) {
                    break;
                }
                $result = $this->array_concat($result, $response);
            } catch (Exception $e) {
                $errors += 1;
                if ($errors > $maxRetries) {
                    throw $e;
                }
            }
            $i += 1;
        }
        $sorted = $this->sort_cursor_paginated_result($result);
        $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
        return $this->filter_by_since_limit($sorted, $since, $limit, $key);
    }

    public function sort_cursor_paginated_result($result) {
        $first = $this->safe_value($result, 0);
        if ($first !== null) {
            if (is_array($first) && array_key_exists('timestamp', $first)) {
                return $this->sort_by($result, 'timestamp', true);
            }
            if (is_array($first) && array_key_exists('id', $first)) {
                return $this->sort_by($result, 'id', true);
            }
        }
        return $result;
    }

    public function remove_repeated_elements_from_array($input, bool $fallbackToTimestamp = true) {
        $uniqueDic = array();
        $uniqueResult = array();
        for ($i = 0; $i < count($input); $i++) {
            $entry = $input[$i];
            $uniqValue = $fallbackToTimestamp ? $this->safe_string_n($entry, array( 'id', 'timestamp', 0 )) : $this->safe_string($entry, 'id');
            if ($uniqValue !== null && !(is_array($uniqueDic) && array_key_exists($uniqValue, $uniqueDic))) {
                $uniqueDic[$uniqValue] = 1;
                $uniqueResult[] = $entry;
            }
        }
        $valuesLength = count($uniqueResult);
        if ($valuesLength > 0) {
            return $uniqueResult;
        }
        return $input;
    }

    public function remove_repeated_trades_from_array($input) {
        $uniqueResult = array();
        for ($i = 0; $i < count($input); $i++) {
            $entry = $input[$i];
            $id = $this->safe_string($entry, 'id');
            if ($id === null) {
                $price = $this->safe_string($entry, 'price');
                $amount = $this->safe_string($entry, 'amount');
                $timestamp = $this->safe_string($entry, 'timestamp');
                $side = $this->safe_string($entry, 'side');
                // unique trade identifier
                $id = 't_' . (string) $timestamp . '_' . $side . '_' . $price . '_' . $amount;
            }
            if ($id !== null && !(is_array($uniqueResult) && array_key_exists($id, $uniqueResult))) {
                $uniqueResult[$id] = $entry;
            }
        }
        $values = is_array($uniqueResult) ? array_values($uniqueResult) : array();
        return $values;
    }

    public function remove_keys_from_dict(array $dict, array $removeKeys) {
        $keys = is_array($dict) ? array_keys($dict) : array();
        $newDict = array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if (!$this->in_array($key, $removeKeys)) {
                $newDict[$key] = $dict[$key];
            }
        }
        return $newDict;
    }

    public function handle_until_option(string $key, $request, $params, $multiplier = 1) {
        $until = $this->safe_integer_2($params, 'until', 'till');
        if ($until !== null) {
            $request[$key] = $this->parse_to_int($until * $multiplier);
            $params = $this->omit($params, array( 'until', 'till' ));
        }
        return array( $request, $params );
    }

    public function safe_open_interest(array $interest, ?array $market = null) {
        $symbol = $this->safe_string($interest, 'symbol');
        if ($symbol === null) {
            $symbol = $this->safe_string($market, 'symbol');
        }
        return $this->extend($interest, array(
            'symbol' => $symbol,
            'baseVolume' => $this->safe_number($interest, 'baseVolume'), // deprecated
            'quoteVolume' => $this->safe_number($interest, 'quoteVolume'), // deprecated
            'openInterestAmount' => $this->safe_number($interest, 'openInterestAmount'),
            'openInterestValue' => $this->safe_number($interest, 'openInterestValue'),
            'timestamp' => $this->safe_integer($interest, 'timestamp'),
            'datetime' => $this->safe_string($interest, 'datetime'),
            'info' => $this->safe_value($interest, 'info'),
        ));
    }

    public function parse_liquidation($liquidation, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLiquidation () is not supported yet');
    }

    public function parse_liquidations(array $liquidations, ?array $market = null, ?int $since = null, ?int $limit = null) {
        /**
         * @ignore
         * parses liquidation info from the exchange response
         * @param {array[]} $liquidations each item describes an instance of a liquidation event
         * @param {array} $market ccxt $market
         * @param {int} [$since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [$limit] limits the number of items in the response
         * @return {array[]} an array of ~@link https://docs.ccxt.com/#/?id=liquidation-structure liquidation structures~
         */
        $result = array();
        for ($i = 0; $i < count($liquidations); $i++) {
            $entry = $liquidations[$i];
            $parsed = $this->parse_liquidation($entry, $market);
            $result[] = $parsed;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        $symbol = $this->safe_string($market, 'symbol');
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function parse_greeks(array $greeks, ?array $market = null) {
        throw new NotSupported($this->id . ' parseGreeks () is not supported yet');
    }

    public function parse_all_greeks($greeks, ?array $symbols = null, $params = array ()) {
        //
        // the value of $greeks is either a dict or a list
        //
        $results = array();
        if (gettype($greeks) === 'array' && array_keys($greeks) === array_keys(array_keys($greeks))) {
            for ($i = 0; $i < count($greeks); $i++) {
                $parsedTicker = $this->parse_greeks($greeks[$i]);
                $greek = $this->extend($parsedTicker, $params);
                $results[] = $greek;
            }
        } else {
            $marketIds = is_array($greeks) ? array_keys($greeks) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $parsed = $this->parse_greeks($greeks[$marketId], $market);
                $greek = $this->extend($parsed, $params);
                $results[] = $greek;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_option(array $chain, ?array $currency = null, ?array $market = null) {
        throw new NotSupported($this->id . ' parseOption () is not supported yet');
    }

    public function parse_option_chain(mixed $response, ?string $currencyKey = null, ?string $symbolKey = null) {
        $optionStructures = array();
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $currencyId = $this->safe_string($info, $currencyKey);
            $currency = $this->safe_currency($currencyId);
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, 'option');
            $optionStructures[$market['symbol']] = $this->parse_option($info, $currency, $market);
        }
        return $optionStructures;
    }

    public function parse_margin_modes(mixed $response, ?array $symbols = null, ?string $symbolKey = null, ?string $marketType = null) {
        $marginModeStructures = array();
        if ($marketType === null) {
            $marketType = 'swap'; // default to swap
        }
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, $marketType);
            if (($symbols === null) || $this->in_array($market['symbol'], $symbols)) {
                $marginModeStructures[$market['symbol']] = $this->parse_margin_mode($info, $market);
            }
        }
        return $marginModeStructures;
    }

    public function parse_margin_mode(array $marginMode, ?array $market = null) {
        throw new NotSupported($this->id . ' parseMarginMode () is not supported yet');
    }

    public function parse_leverages(mixed $response, ?array $symbols = null, ?string $symbolKey = null, ?string $marketType = null) {
        $leverageStructures = array();
        if ($marketType === null) {
            $marketType = 'swap'; // default to swap
        }
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, $marketType);
            if (($symbols === null) || $this->in_array($market['symbol'], $symbols)) {
                $leverageStructures[$market['symbol']] = $this->parse_leverage($info, $market);
            }
        }
        return $leverageStructures;
    }

    public function parse_leverage(array $leverage, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLeverage () is not supported yet');
    }

    public function parse_conversions(array $conversions, ?string $code = null, ?string $fromCurrencyKey = null, ?string $toCurrencyKey = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $conversions = $this->to_array($conversions);
        $result = array();
        $fromCurrency = null;
        $toCurrency = null;
        for ($i = 0; $i < count($conversions); $i++) {
            $entry = $conversions[$i];
            $fromId = $this->safe_string($entry, $fromCurrencyKey);
            $toId = $this->safe_string($entry, $toCurrencyKey);
            if ($fromId !== null) {
                $fromCurrency = $this->safe_currency($fromId);
            }
            if ($toId !== null) {
                $toCurrency = $this->safe_currency($toId);
            }
            $conversion = $this->extend($this->parse_conversion($entry, $fromCurrency, $toCurrency), $params);
            $result[] = $conversion;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        $currency = null;
        if ($code !== null) {
            $currency = $this->safe_currency($code);
            $code = $currency['code'];
        }
        if ($code === null) {
            return $this->filter_by_since_limit($sorted, $since, $limit);
        }
        $fromConversion = $this->filter_by($sorted, 'fromCurrency', $code);
        $toConversion = $this->filter_by($sorted, 'toCurrency', $code);
        $both = $this->array_concat($fromConversion, $toConversion);
        return $this->filter_by_since_limit($both, $since, $limit);
    }

    public function parse_conversion(array $conversion, ?array $fromCurrency = null, ?array $toCurrency = null) {
        throw new NotSupported($this->id . ' parseConversion () is not supported yet');
    }

    public function convert_expire_date(string $date) {
        // parse YYMMDD to datetime string
        $year = mb_substr($date, 0, 2 - 0);
        $month = mb_substr($date, 2, 4 - 2);
        $day = mb_substr($date, 4, 6 - 4);
        $reconstructedDate = '20' . $year . '-' . $month . '-' . $day . 'T00:00:00Z';
        return $reconstructedDate;
    }

    public function convert_expire_date_to_market_id_date(string $date) {
        // parse 240119 to 19JAN24
        $year = mb_substr($date, 0, 2 - 0);
        $monthRaw = mb_substr($date, 2, 4 - 2);
        $month = null;
        $day = mb_substr($date, 4, 6 - 4);
        if ($monthRaw === '01') {
            $month = 'JAN';
        } elseif ($monthRaw === '02') {
            $month = 'FEB';
        } elseif ($monthRaw === '03') {
            $month = 'MAR';
        } elseif ($monthRaw === '04') {
            $month = 'APR';
        } elseif ($monthRaw === '05') {
            $month = 'MAY';
        } elseif ($monthRaw === '06') {
            $month = 'JUN';
        } elseif ($monthRaw === '07') {
            $month = 'JUL';
        } elseif ($monthRaw === '08') {
            $month = 'AUG';
        } elseif ($monthRaw === '09') {
            $month = 'SEP';
        } elseif ($monthRaw === '10') {
            $month = 'OCT';
        } elseif ($monthRaw === '11') {
            $month = 'NOV';
        } elseif ($monthRaw === '12') {
            $month = 'DEC';
        }
        $reconstructedDate = $day . $month . $year;
        return $reconstructedDate;
    }

    public function convert_market_id_expire_date(string $date) {
        // parse 03JAN24 to 240103.
        $monthMappping = array(
            'JAN' => '01',
            'FEB' => '02',
            'MAR' => '03',
            'APR' => '04',
            'MAY' => '05',
            'JUN' => '06',
            'JUL' => '07',
            'AUG' => '08',
            'SEP' => '09',
            'OCT' => '10',
            'NOV' => '11',
            'DEC' => '12',
        );
        // if exchange omits first zero and provides i.e. '3JAN24' instead of '03JAN24'
        if (strlen($date) === 6) {
            $date = '0' . $date;
        }
        $year = mb_substr($date, 0, 2 - 0);
        $monthName = mb_substr($date, 2, 5 - 2);
        $month = $this->safe_string($monthMappping, $monthName);
        $day = mb_substr($date, 5, 7 - 5);
        $reconstructedDate = $day . $month . $year;
        return $reconstructedDate;
    }

    public function fetch_position_history(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches the history of margin added or reduced from contract isolated $positions
         * @param {string} [$symbol] unified market $symbol
         * @param {int} [$since] timestamp in ms of the position
         * @param {int} [$limit] the maximum amount of candles to fetch, default=1000
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=position-structure position structures~
         */
        if ($this->has['fetchPositionsHistory']) {
            $positions = $this->fetch_positions_history(array( $symbol ), $since, $limit, $params);
            return $positions;
        } else {
            throw new NotSupported($this->id . ' fetchPositionHistory () is not supported yet');
        }
    }

    public function fetch_positions_history(?array $symbols = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches the history of margin added or reduced from contract isolated positions
         * @param {string} [symbol] unified market symbol
         * @param {int} [$since] timestamp in ms of the position
         * @param {int} [$limit] the maximum amount of candles to fetch, default=1000
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=position-structure position structures~
         */
        throw new NotSupported($this->id . ' fetchPositionsHistory () is not supported yet');
    }

    public function parse_margin_modification(array $data, ?array $market = null) {
        throw new NotSupported($this->id . ' parseMarginModification() is not supported yet');
    }

    public function parse_margin_modifications(mixed $response, ?array $symbols = null, ?string $symbolKey = null, ?string $marketType = null) {
        $marginModifications = array();
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, $marketType);
            if (($symbols === null) || $this->in_array($market['symbol'], $symbols)) {
                $marginModifications[] = $this->parse_margin_modification($info, $market);
            }
        }
        return $marginModifications;
    }

    public function fetch_transfer(string $id, ?string $code = null, $params = array ()) {
        /**
         * fetches a transfer
         * @param {string} $id transfer $id
         * @param {[string]} $code unified currency $code
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {array} a ~@link https://docs.ccxt.com/#/?$id=transfer-structure transfer structure~
         */
        throw new NotSupported($this->id . ' fetchTransfer () is not supported yet');
    }

    public function fetch_transfers(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches a transfer
         * @param {string} id transfer id
         * @param {int} [$since] timestamp in ms of the earliest transfer to fetch
         * @param {int} [$limit] the maximum amount of transfers to fetch
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return {array} a ~@link https://docs.ccxt.com/#/?id=transfer-structure transfer structure~
         */
        throw new NotSupported($this->id . ' fetchTransfers () is not supported yet');
    }

    public function clean_unsubscription($client, string $subHash, string $unsubHash, $subHashIsPrefix = false) {
        if (is_array($client->subscriptions) && array_key_exists($unsubHash, $client->subscriptions)) {
            unset($client->subscriptions[$unsubHash]);
        }
        if (!$subHashIsPrefix) {
            if (is_array($client->subscriptions) && array_key_exists($subHash, $client->subscriptions)) {
                unset($client->subscriptions[$subHash]);
            }
            if (is_array($client->futures) && array_key_exists($subHash, $client->futures)) {
                $error = new UnsubscribeError ($this->id . ' ' . $subHash);
                $client->reject ($error, $subHash);
            }
        } else {
            $clientSubscriptions = is_array($client->subscriptions) ? array_keys($client->subscriptions) : array();
            for ($i = 0; $i < count($clientSubscriptions); $i++) {
                $sub = $clientSubscriptions[$i];
                if (str_starts_with($sub, $subHash)) {
                    unset($client->subscriptions[$sub]);
                }
            }
            $clientFutures = is_array($client->futures) ? array_keys($client->futures) : array();
            for ($i = 0; $i < count($clientFutures); $i++) {
                $future = $clientFutures[$i];
                if (str_starts_with($future, $subHash)) {
                    $error = new UnsubscribeError ($this->id . ' ' . $future);
                    $client->reject ($error, $future);
                }
            }
        }
        $client->resolve (true, $unsubHash);
    }

    public function clean_cache(array $subscription) {
        $topic = $this->safe_string($subscription, 'topic');
        $symbols = $this->safe_list($subscription, 'symbols', array());
        $symbolsLength = count($symbols);
        if ($topic === 'ohlcv') {
            $symbolsAndTimeFrames = $this->safe_list($subscription, 'symbolsAndTimeframes', array());
            for ($i = 0; $i < count($symbolsAndTimeFrames); $i++) {
                $symbolAndTimeFrame = $symbolsAndTimeFrames[$i];
                $symbol = $this->safe_string($symbolAndTimeFrame, 0);
                $timeframe = $this->safe_string($symbolAndTimeFrame, 1);
                if (($this->ohlcvs !== null) && (is_array($this->ohlcvs) && array_key_exists($symbol, $this->ohlcvs))) {
                    if (is_array($this->ohlcvs[$symbol]) && array_key_exists($timeframe, $this->ohlcvs[$symbol])) {
                        unset($this->ohlcvs[$symbol][$timeframe]);
                    }
                }
            }
        } elseif ($symbolsLength > 0) {
            for ($i = 0; $i < count($symbols); $i++) {
                $symbol = $symbols[$i];
                if ($topic === 'trades') {
                    if (is_array($this->trades) && array_key_exists($symbol, $this->trades)) {
                        unset($this->trades[$symbol]);
                    }
                } elseif ($topic === 'orderbook') {
                    if (is_array($this->orderbooks) && array_key_exists($symbol, $this->orderbooks)) {
                        unset($this->orderbooks[$symbol]);
                    }
                } elseif ($topic === 'ticker') {
                    if (is_array($this->tickers) && array_key_exists($symbol, $this->tickers)) {
                        unset($this->tickers[$symbol]);
                    }
                }
            }
        } else {
            if ($topic === 'myTrades' && ($this->myTrades !== null)) {
                $this->myTrades = null;
            } elseif ($topic === 'orders' && ($this->orders !== null)) {
                $this->orders = null;
            } elseif ($topic === 'positions' && ($this->positions !== null)) {
                $this->positions = null;
                $clients = is_array($this->clients) ? array_values($this->clients) : array();
                for ($i = 0; $i < count($clients); $i++) {
                    $client = $clients[$i];
                    $futures = $client->futures;
                    if (($futures !== null) && (is_array($futures) && array_key_exists('fetchPositionsSnapshot', $futures))) {
                        unset($futures['fetchPositionsSnapshot']);
                    }
                }
            } elseif ($topic === 'ticker' && ($this->tickers !== null)) {
                $tickerSymbols = is_array($this->tickers) ? array_keys($this->tickers) : array();
                for ($i = 0; $i < count($tickerSymbols); $i++) {
                    $tickerSymbol = $tickerSymbols[$i];
                    if (is_array($this->tickers) && array_key_exists($tickerSymbol, $this->tickers)) {
                        unset($this->tickers[$tickerSymbol]);
                    }
                }
            }
        }
    }
}
