<?php

/*

MIT License

Copyright (c) 2017 Igor Kroitor

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

$version = '1.14.6';

// rounding mode
const TRUNCATE = 0;
const ROUND = 1;

// digits counting mode
const DECIMAL_PLACES = 0;
const SIGNIFICANT_DIGITS = 1;

// padding mode
const NO_PADDING = 0;
const PAD_WITH_ZERO = 1;

abstract class Exchange {

    public static $exchanges = array (
        '_1broker',
        '_1btcxe',
        'acx',
        'allcoin',
        'anxpro',
        'bibox',
        'binance',
        'bit2c',
        'bitbank',
        'bitbay',
        'bitfinex',
        'bitfinex2',
        'bitflyer',
        'bithumb',
        'bitkk',
        'bitlish',
        'bitmarket',
        'bitmex',
        'bitso',
        'bitstamp',
        'bitstamp1',
        'bittrex',
        'bitz',
        'bl3p',
        'bleutrade',
        'braziliex',
        'btcbox',
        'btcchina',
        'btcexchange',
        'btcmarkets',
        'btctradeim',
        'btctradeua',
        'btcturk',
        'btcx',
        'bxinth',
        'ccex',
        'cex',
        'chbtc',
        'chilebit',
        'cobinhood',
        'coincheck',
        'coinegg',
        'coinex',
        'coinexchange',
        'coinfloor',
        'coingi',
        'coinmarketcap',
        'coinmate',
        'coinnest',
        'coinone',
        'coinsecure',
        'coinspot',
        'cointiger',
        'coolcoin',
        'cryptopia',
        'dsx',
        'ethfinex',
        'exmo',
        'exx',
        'flowbtc',
        'foxbit',
        'fybse',
        'fybsg',
        'gatecoin',
        'gateio',
        'gdax',
        'gemini',
        'getbtc',
        'hadax',
        'hitbtc',
        'hitbtc2',
        'huobi',
        'huobicny',
        'huobipro',
        'ice3x',
        'independentreserve',
        'indodax',
        'itbit',
        'jubi',
        'kraken',
        'kucoin',
        'kuna',
        'lakebtc',
        'lbank',
        'liqui',
        'livecoin',
        'luno',
        'lykke',
        'mercado',
        'mixcoins',
        'negociecoins',
        'nova',
        'okcoincny',
        'okcoinusd',
        'okex',
        'paymium',
        'poloniex',
        'qryptos',
        'quadrigacx',
        'quoinex',
        'southxchange',
        'surbitcoin',
        'therock',
        'tidebit',
        'tidex',
        'urdubit',
        'vaultoro',
        'vbtc',
        'virwox',
        'wex',
        'xbtce',
        'yobit',
        'yunbi',
        'zaif',
        'zb',
    );

    public static function split ($string, $delimiters = array (' ')) {
        return explode ($delimiters[0], str_replace ($delimiters, $delimiters[0], $string));
    }

    public static function decimal ($number) {
        return '' + $number;
    }

    public static function safe_float ($object, $key, $default_value = null) {
        return (isset ($object[$key]) && is_numeric ($object[$key])) ? floatval ($object[$key]) : $default_value;
    }

    public static function safe_string ($object, $key, $default_value = null) {
        return (isset ($object[$key]) && is_scalar ($object[$key])) ? strval ($object[$key]) : $default_value;
    }

    public static function safe_integer ($object, $key, $default_value = null) {
        return (isset ($object[$key]) && is_numeric ($object[$key])) ? intval ($object[$key]) : $default_value;
    }

    public static function safe_value ($object, $key, $default_value = null) {
        return (is_array ($object) && array_key_exists ($key, $object)) ? $object[$key] : $default_value;
    }

    public static function truncate ($number, $precision = 0) {
        $decimal_precision = pow (10, $precision);
        return floor(floatval ($number * $decimal_precision)) / $decimal_precision;
    }

    public static function truncate_to_string ($number, $precision = 0) {
        if ($precision > 0) {
            $string = sprintf ('%.' . ($precision + 1) . 'f', floatval ($number));
            list ($integer, $decimal) = explode ('.', $string);
            $decimal = trim ('.' . substr ($decimal, 0, $precision), '0');
            if (strlen ($decimal) < 2)
                $decimal = '.0';
            return $integer . $decimal;
        }
        return sprintf ('%d', floatval ($number));
    }

    public static function uuid () {

        return sprintf ('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',

            // 32 bits for "time_low"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),

            // 16 bits for "time_mid"
            mt_rand(0, 0xffff),

            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand(0, 0x0fff) | 0x4000,

            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand(0, 0x3fff) | 0x8000,

            // 48 bits for "node"
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public static function parse_timeframe ($timeframe) {
        $amount = substr ($timeframe, 0, -1);
        $unit = substr ($timeframe, -1);
        $scale = 1;
        if ($unit === 'y')
            $scale = 60 * 60 * 24 * 365;
        else if ($unit === 'M')
            $scale = 60 * 60 * 24 * 30;
        else if ($unit === 'w')
            $scale = 60 * 60 * 24 * 7;
        else if ($unit === 'd')
            $scale = 60 * 60 * 24;
        else if ($unit === 'h')
            $scale = 60 * 60;
        else
            $scale = 60;
        return $amount * $scale;
    }

    // given a sorted arrays of trades (recent first) and a timeframe builds an array of OHLCV candles
    public static function build_ohlcv ($trades, $timeframe = '1m', $since = PHP_INT_MIN, $limits = PHP_INT_MAX) {
        if (empty ($trades) || !is_array ($trades)) {
            return [];
        }
        if (!is_numeric ($since)) {
            $since = PHP_INT_MIN;
        }
        if (!is_numeric ($limits)) {
            $limits = PHP_INT_MAX;
        }
        $ms = static::parse_timeframe ($timeframe) * 1000;
        $ohlcvs = [];
        list(/* $timestamp */, /* $open */, $high, $low, $close, $volume) = [0, 1, 2, 3, 4, 5];
        for ($i = 0; $i < min (count($trades), $limits); $i++) {
            $trade = $trades[$i];
            if ($trade['timestamp'] < $since)
                continue;
            $openingTime = floor ($trade['timestamp'] / $ms) * $ms; // shift to the edge of m/h/d (but not M)
            $j = count($ohlcvs);

            if ($j == 0 || $openingTime >= $ohlcvs[$j-1][0] + $ms) {
                // moved to a new timeframe -> create a new candle from opening trade
                $ohlcvs[] = [
                    $openingTime,
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['amount']
                ];
            } else {
                // still processing the same timeframe -> update opening trade
                $ohlcvs[$j-1][$high] = max ($ohlcvs[$j-1][$high], $trade['price']);
                $ohlcvs[$j-1][$low] = min ($ohlcvs[$j-1][$low], $trade['price']);
                $ohlcvs[$j-1][$close] = $trade['price'];
                $ohlcvs[$j-1][$volume] += $trade['amount'];
            }
        }
        return $ohlcvs;
    }

    public static function capitalize ($string) {
        return mb_strtoupper (mb_substr ($string, 0, 1)) . mb_substr ($string, 1);
    }

    public static function omit ($array, $keys) {
        $result = $array;
        if (is_array ($keys))
            foreach ($keys as $key)
                unset ($result[$key]);
        else
            unset ($result[$keys]);
        return $result;
    }

    public static function unique ($array) {
        return array_unique ($array);
    }

    public static function pluck ($array, $key) {
        $result = [];
        foreach ($array as $element)
            if (isset ($key, $element))
                $result[] = $element[$key];
        return $result;
    }

    public function filter_by ($array, $key, $value = null) {
        if ($value) {
            $grouped = static::group_by ($array, $key);
            if (is_array ($grouped) && array_key_exists ($value, $grouped))
                return $grouped[$value];
            return array ();
        }
        return $array;
    }

    public static function group_by ($array, $key) {
        $result = array ();
        foreach ($array as $element) {
            if (isset ($element[$key]) && !is_null ($element[$key])) {
                if (!isset ($result[$element[$key]]))
                    $result[$element[$key]] = array ();
                $result[$element[$key]][] = $element;
            }
        }
        return $result;
    }

    public static function index_by ($array, $key) {
        $result = array ();
        foreach ($array as $element) {
            if (isset ($element[$key])) {
                $result[$element[$key]] = $element;
            }
        }
        return $result;
    }

    public static function sort_by ($arrayOfArrays, $key, $descending = false) {
        $descending = $descending ? -1 : 1;
        usort ($arrayOfArrays, function ($a, $b) use ($key, $descending) {
            if ($a[$key] == $b[$key])
                return 0;
            return $a[$key] < $b[$key] ? -$descending : $descending;
        });
        return $arrayOfArrays;
    }

    public static function flatten ($array) {
        return array_reduce ($array, function ($acc, $item) {
            return array_merge ($acc, is_array ($item) ? static::flatten ($item) : [$item]);
        }, []);
    }

    public static function array_concat () {
        return call_user_func_array ('array_merge', array_filter(func_get_args(), 'is_array'));
    }

    public static function in_array ($needle, $haystack) {
        return in_array ($needle, $haystack);
    }

    public static function to_array ($object) {
        return array_values ($object);
    }

    public static function keysort ($array) {
        $result = $array;
        ksort ($result);
        return $result;
    }

    public static function extract_params ($string) {
        if (preg_match_all ('/{([\w-]+)}/u', $string, $matches))
            return $matches[1];
    }

    public static function implode_params ($string, $params) {
        foreach ($params as $key => $value)
            $string = implode ($value, mb_split ('{' . $key . '}', $string));
        return $string;
    }

    public static function indexBy ($arrayOfArrays, $key) {
        return static::index_by ($arrayOfArrays, $key);
    }

    public static function sortBy ($arrayOfArrays, $key, $descending = false) {
        return static::sort_by ($arrayOfArrays, $key, $descending);
    }

    public static function filterBy ($arrayOfArrays, $key, $descending = false) {
        return static::filter_by ($arrayOfArrays, $key, $descending);
    }

    public static function groupBy ($arrayOfArrays, $key, $descending = false) {
        return static::group_by ($arrayOfArrays, $key, $descending);
    }

    public static function sum () {
        return array_sum (array_filter (func_get_args (), function ($x) { return isset ($x) ? $x : 0; }));
    }

    public static function extractParams ($string) {
        return static::extract_params ($string);
    }

    public static function implodeParams ($string, $params) {
        return static::implode_params ($string, $params);
    }

    public static function ordered ($array) { // for Python OrderedDicts, does nothing in PHP and JS
        return $array;
    }

    public function aggregate ($bidasks) {

        $result = array ();

        foreach ($bidasks as $bidask) {
            if ($bidask[1] > 0) {
                $price = (string) $bidask[0];
                $result[$price] = array_key_exists ($price, $result) ? $result[$price] : 0;
                $result[$price] += $bidask[1];
            }
        }

        $output = array ();

        foreach ($result as $key => $value) {
            $output[] = array (floatval ($key), floatval ($value));
        }

        return $output;
    }

    public static function urlencodeBase64 ($string) {
        return preg_replace (array ('#[=]+$#u', '#\+#u', '#\\/#'), array ('', '-', '_'), base64_encode ($string));
    }

    public static function urlencode ($string) {
        return http_build_query ($string);
    }

    public static function rawencode ($string) {
        return urldecode (http_build_query ($string));
    }

    public static function encode_uri_component ($string) {
        return urlencode ($string);
    }

    public static function url ($path, $params = array ()) {
        $result = static::implode_params ($path, $params);
        $query = static::omit ($params, static::extract_params ($path));
        if ($query)
            $result .= '?' . static::urlencode ($query);
        return $result;
    }

    public function seconds () {
        return time ();
    }

    public function milliseconds () {
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . substr ($msec, 2, 3);
    }

    public function microseconds () {
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . str_pad (substr ($msec, 2, 6), 6, '0');
    }

    public static function iso8601 ($timestamp) {
        if (!isset ($timestamp))
            return $timestamp;
        $result = date ('c', (int) round ($timestamp / 1000));
        $msec = (int) $timestamp % 1000;
        return str_replace ('+', sprintf (".%03d+", $msec), $result);
    }

    public static function parse_date ($timestamp) {
        if (!isset ($timestamp))
            return $timestamp;
        if (strstr ($timestamp, 'GMT'))
            return strtotime ($timestamp) * 1000;
        return static::parse8601 ($timestamp);
    }

    public static function parse8601 ($timestamp) {
        $time = strtotime ($timestamp) * 1000;
        if (preg_match ('/\.(?<milliseconds>[0-9]{1,3})/', $timestamp, $match)) {
            $time += (int) str_pad($match['milliseconds'], 3, '0', STR_PAD_RIGHT);
        }
        return $time;
    }

    public static function ymd ($timestamp, $infix = ' ') {
        return gmdate ('Y-m-d', (int) round ($timestamp / 1000));
    }

    public static function ymdhms ($timestamp, $infix = ' ') {
        return gmdate ('Y-m-d\\' . $infix . 'H:i:s', (int) round ($timestamp / 1000));
    }

    public static function binary_concat () {
        return implode ('', func_get_args ());
    }

    public function binary_to_string ($binary) {
        return $binary;
    }

    public static function json ($data, $params = array ()) {
        $options = array (
            'convertArraysToObjects' => JSON_FORCE_OBJECT,
            // other flags if needed...
        );
        $flags = 0;
        foreach ($options as $key => $value)
            if (array_key_exists ($key, $params) && $params[$key])
                $flags |= $options[$key];
        return json_encode ($data, $flags);
    }

    public static function encode ($input) {
        return $input;
    }

    public static function decode ($input) {
        return $input;
    }

    public function nonce () {
        return $this->seconds ();
    }

    public function check_required_credentials () {
        $keys = array_keys ($this->requiredCredentials);
        foreach ($this->requiredCredentials as $key => $value) {
            if ($value && (!$this->$key)) {
                throw new AuthenticationError ($this->id . ' requires `' . $key . '`');
            }
        }
    }

    public function check_address ($address) {

        if (empty ($address) || !is_string ($address)) {
            throw new InvalidAddress ($this->id . ' address is undefined');
        }

        if ((count (array_unique (str_split ($address))) === 1)    ||
            (strlen ($address) < $this->minFundingAddressLength) ||
            (strpos ($address, ' ') !== false)) {

            throw new InvalidAddress ($this->id . ' address is invalid or has less than ' . strval ($this->minFundingAddressLength) . ' characters: "' . strval ($address) . '"');
        }

        return $address;
    }

    public function checkAddress ($address) {
        return $this->check_address ($address);
    }

    public function describe () {
        return array ();
    }

    public function __construct ($options = array ()) {

        $this->curl         = curl_init ();
        $this->curl_options = array (); // overrideable by user, empty by default

        $this->id           = null;

        // rate limiter params
        $this->rateLimit   = 2000;
        $this->tokenBucket = array (
            'refillRate' => 1.0 / $this->rateLimit,
            'delay' => 1.0,
            'capacity' => 1.0,
            'defaultCost' => 1.0,
            'maxCapacity' => 1000,
        );
        $this->timeout     = 10000; // in milliseconds
        $this->proxy       = '';
        $this->origin      = '*'; // CORS origin
        $this->headers     = array ();
        $this->curlopt_interface = null;

        $this->options     = array (); // exchange-specific options if any

        $this->skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway

        $this->name      = null;
        $this->countries = null;
        $this->version   = null;
        $this->urls      = array ();
        $this->api       = array ();
        $this->comment   = null;

        $this->markets     = null;
        $this->symbols     = null;
        $this->ids         = null;
        $this->currencies  = array ();
        $this->balance     = array ();
        $this->orderbooks  = array ();
        $this->fees        = array ('trading' => array (), 'funding' => array ());
        $this->precision   = array ();
        $this->limits      = array ();
        $this->orders      = array ();
        $this->trades      = array ();
        $this->exceptions  = array ();
        $this->verbose     = false;
        $this->apiKey      = '';
        $this->secret      = '';
        $this->password    = '';
        $this->uid         = '';
        $this->twofa       = false;
        $this->marketsById = null;
        $this->markets_by_id = null;
        $this->currencies_by_id = null;
        $this->userAgent   = null; // 'ccxt/' . $version . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
        $this->userAgents = array (
            'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        );
        $this->minFundingAddressLength = 1; // used in check_address
        $this->substituteCommonCurrencyCodes = true;
        $this->timeframes = null;
        $this->parseJsonResponse = true;

        $this->requiredCredentials = array (
            'apiKey' => true,
            'secret' => true,
            'uid' => false,
            'login' => false,
            'password' => false,
            'twofa' => false, // 2-factor authentication (one-time password key)
        );

        // API methods metainfo
        $this->has = array (
            'CORS' => false,
            'publicAPI' => true,
            'privateAPI' => true,
            'cancelOrder' => true,
            'cancelOrders' => false,
            'createDepositAddress' => false,
            'createOrder' => true,
            'createMarketOrder' => true,
            'createLimitOrder' => true,
            'deposit' => false,
            'fetchBalance' => true,
            'fetchClosedOrders' => false,
            'fetchCurrencies' => false,
            'fetchDepositAddress' => false,
            'fetchFundingFees' => false,
            'fetchL2OrderBook' => true,
            'fetchMarkets' => true,
            'fetchMyTrades' => false,
            'fetchOHLCV' => 'emulated',
            'fetchOpenOrders' => false,
            'fetchOrder' => false,
            'fetchOrderBook' => true,
            'fetchOrderBooks' => false,
            'fetchOrders' => false,
            'fetchTicker' => true,
            'fetchTickers' => false,
            'fetchTrades' => true,
            'fetchTradingFees' => false,
            'withdraw' => false,
        );

        $this->precisionMode = DECIMAL_PLACES;

        $this->lastRestRequestTimestamp = 0;
        $this->lastRestPollTimestamp    = 0;
        $this->restRequestQueue         = null;
        $this->restPollerLoopIsRunning  = false;
        $this->enableRateLimit          = false;
        $this->last_http_response = null;
        $this->last_json_response = null;
        $this->last_response_headers = null;

        $this->commonCurrencies = array (
            'XBT' => 'BTC',
            'BCC' => 'BCH',
            'DRK' => 'DASH'
        );

        $options = array_replace_recursive ($this->describe(), $options);

        if ($options)
            foreach ($options as $key => $value)
                $this->{$key} =
                    (property_exists ($this, $key) && is_array ($this->{$key}) && is_array ($value)) ?
                        array_replace_recursive ($this->{$key}, $value) :
                        $value;

        if ($this->api)
            $this->define_rest_api ($this->api, 'request');

        if ($this->markets)
            $this->set_markets ($this->markets);
    }

    public function define_rest_api ($api, $method_name, $options = array ()) {
        foreach ($api as $type => $methods)
            foreach ($methods as $http_method => $paths)
                foreach ($paths as $path) {

                    $splitPath = mb_split ('[^a-zA-Z0-9]', $path);

                    $uppercaseMethod  = mb_strtoupper ($http_method);
                    $lowercaseMethod  = mb_strtolower ($http_method);
                    $camelcaseMethod  = static::capitalize ($lowercaseMethod);
                    $camelcaseSuffix  = implode (array_map (get_called_class() . '::capitalize', $splitPath));
                    $lowercasePath    = array_map ('trim', array_map ('strtolower', $splitPath));
                    $underscoreSuffix = implode ('_', array_filter ($lowercasePath));

                    $camelcase  = $type . $camelcaseMethod . static::capitalize ($camelcaseSuffix);
                    $underscore = $type . '_' . $lowercaseMethod . '_' . mb_strtolower ($underscoreSuffix);

                    if (array_key_exists ('suffixes', $options)) {
                        if (array_key_exists ('camelcase', $options['suffixes']))
                            $camelcase .= $options['suffixes']['camelcase'];
                        if (array_key_exists ('underscore', $options['suffixes']))
                            $underscore .= $options['suffixes']['underscore'];
                    }

                    $partial = function ($params = array ()) use ($path, $type, $uppercaseMethod, $method_name) {
                        return call_user_func (array ($this, $method_name), $path, $type, $uppercaseMethod, $params);
                    };

                    $this->$camelcase  = $partial;
                    $this->$underscore = $partial;
                }
    }

    public function hash ($request, $type = 'md5', $digest = 'hex') {
        $base64 = ($digest === 'base64');
        $binary = ($digest === 'binary');
        $hash = hash ($type, $request, ($binary || $base64) ? true : false);
        if ($base64)
            $hash = base64_encode ($hash);
        return $hash;
    }

    public function hmac ($request, $secret, $type = 'sha256', $digest = 'hex') {
        $base64 = ($digest === 'base64');
        $binary = ($digest === 'binary');
        $hmac = hash_hmac ($type, $request, $secret, ($binary || $base64) ? true : false);
        if ($base64)
            $hmac = base64_encode ($hmac);
        return $hmac;
    }

    public function jwt ($request, $secret, $alg = 'HS256', $hash = 'sha256') {
        $encodedHeader = $this->urlencodeBase64 (json_encode (array ('alg' => $alg, 'typ' => 'JWT')));
        $encodedData = $this->urlencodeBase64 (json_encode ($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        $signature = $this->urlencodeBase64 ($this->hmac ($token, $secret, $hash, 'binary'));
        return $token . '.' . $signature;
    }

    public function raise_error ($exception_type, $url, $method = 'GET', $error = null, $details = null) {
        $exception_class = __NAMESPACE__ . '\\' . $exception_type;
        throw new $exception_class (implode (' ', array (
            $this->id,
            $method,
            $url,
            $error,
            $details,
        )));
    }

    // this method is experimental
    public function throttle () {
        $now = $this->milliseconds ();
        $elapsed = $now - $this->lastRestRequestTimestamp;
        if ($elapsed < $this->rateLimit) {
            $delay = $this->rateLimit - $elapsed;
              usleep ((int)($delay * 1000.0));
        }
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        throw new NotSupported ($this->id . ' sign() not implemented yet');
    }

    public function fetch2 ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->sign ($path, $api, $method, $params, $headers, $body);
        return $this->fetch ($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        return $this->fetch2 ($path, $api, $method, $params, $headers, $body);
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        // it's a stub function, does nothing in base code
    }

    public function fetch ($url, $method = 'GET', $headers = null, $body = null) {

        if ($this->enableRateLimit)
            $this->throttle ();

        $headers = array_merge ($this->headers, $headers ? $headers : array ());

        if (strlen ($this->proxy))
            $headers['Origin'] = $this->origin;

        if (!$headers)
            $headers = array ();
        elseif (is_array ($headers)) {
            $tmp = $headers;
            $headers = array ();
            foreach ($tmp as $key => $value)
                $headers[] = $key . ': ' . $value;
        }

        // this name for the proxy string is deprecated
        // we should rename it to $this->cors everywhere
        $url = $this->proxy . $url;

        $verbose_headers = $headers;

        curl_setopt ($this->curl, CURLOPT_URL, $url);

        if ($this->timeout) {
            curl_setopt ($this->curl, CURLOPT_CONNECTTIMEOUT_MS, (int)($this->timeout));
            curl_setopt ($this->curl, CURLOPT_TIMEOUT_MS, (int)($this->timeout));
        }

        curl_setopt ($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt ($this->curl, CURLOPT_SSL_VERIFYPEER, false);

        if ($this->userAgent)
            if (gettype ($this->userAgent) == 'string') {
                curl_setopt ($this->curl, CURLOPT_USERAGENT, $this->userAgent);
                $verbose_headers = array_merge ($verbose_headers, array ('User-Agent' => $this->userAgent));
            } else if ((gettype ($this->userAgent) == 'array') && array_key_exists ('User-Agent', $this->userAgent)) {
                curl_setopt ($this->curl, CURLOPT_USERAGENT, $this->userAgent['User-Agent']);
                $verbose_headers = array_merge ($verbose_headers, $this->userAgent);
            }

        curl_setopt ($this->curl, CURLOPT_ENCODING, '');

        if ($method == 'GET') {

            curl_setopt ($this->curl, CURLOPT_HTTPGET, true);

        } else if ($method == 'POST') {

            curl_setopt ($this->curl, CURLOPT_POST, true);
            curl_setopt ($this->curl, CURLOPT_POSTFIELDS, $body);

        } else if ($method == 'PUT') {

            curl_setopt ($this->curl, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt ($this->curl, CURLOPT_PUT, true);
            curl_setopt ($this->curl, CURLOPT_POSTFIELDS, $body);

            $headers[] = 'X-HTTP-Method-Override: PUT';

        } else if ($method == 'DELETE') {

            curl_setopt ($this->curl, CURLOPT_CUSTOMREQUEST, "DELETE");
            curl_setopt ($this->curl, CURLOPT_POSTFIELDS, $body);

            $headers[] = 'X-HTTP-Method-Override: DELETE';
        }

        if ($headers)
            curl_setopt ($this->curl, CURLOPT_HTTPHEADER, $headers);

        if ($this->verbose) {
            print_r ("\nRequest:\n");
            print_r (array ($method, $url, $verbose_headers, $body));
        }

        // we probably only need to set it once on startup
        if ($this->curlopt_interface) {
			curl_setopt ($this->curl, CURLOPT_INTERFACE, $this->curlopt_interface);
        }

        /*

        // this is currently not integrated, reserved for future
        if ($this->proxy) {
            curl_setopt ($this->curl, CURLOPT_PROXY, $this->proxy);
        }

        */

        curl_setopt ($this->curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt ($this->curl, CURLOPT_FAILONERROR, false);

        $response_headers = array ();

        // this function is called by curl for each header received
        curl_setopt ($this->curl, CURLOPT_HEADERFUNCTION,
            function ($curl, $header) use (&$response_headers) {
                $length = strlen ($header);
                $header = explode (':', $header, 2);
                if (count ($header) < 2) // ignore invalid headers
                    return $length;
                $name = strtolower (trim ($header[0]));
                if (!array_key_exists ($name, $response_headers))
                    $response_headers[$name] = [trim ($header[1])];
                else
                    $response_headers[$name][] = trim ($header[1]);
                return $length;
            }
        );

        // user-defined cURL options (if any)
        if (!empty($this->curl_options))
            curl_setopt_array ($this->curl, $this->curl_options);

        $result = curl_exec ($this->curl);

        $this->lastRestRequestTimestamp = $this->milliseconds ();
        $this->last_http_response = $result;
        $this->last_response_headers = $response_headers;

        if ($this->parseJsonResponse) {

            $this->last_json_response =
                ((gettype ($result) == 'string') &&  (strlen ($result) > 1)) ?
                    json_decode ($result, $as_associative_array = true) : null;

        }


        $curl_errno = curl_errno ($this->curl);
        $curl_error = curl_error ($this->curl);
        $http_status_code = curl_getinfo ($this->curl, CURLINFO_HTTP_CODE);

        // Reset curl opts
        curl_reset ($this->curl);

        if ($this->verbose) {
            print_r ("\nResponse:\n");
            print_r (array ($method, $url, $http_status_code, $curl_error, $response_headers, $result));
        }

        $this->handle_errors ($http_status_code, $curl_error, $url, $method, $response_headers, $result ? $result : null);

        if ($result === false) {

            if ($curl_errno == 28) // CURLE_OPERATION_TIMEDOUT
                $this->raise_error ('RequestTimeout', $url, $method, $curl_errno, $curl_error);

            // var_dump ($result);

            // all sorts of SSL problems, accessibility
            $this->raise_error ('ExchangeNotAvailable', $url, $method, $curl_errno, $curl_error);
        }

        if (in_array ($http_status_code, array (418, 429))) {

            $this->raise_error ('DDoSProtection', $url, $method, $http_status_code,
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (404, 409, 500, 501, 502))) {

            $this->raise_error ('ExchangeNotAvailable', $url, $method, $http_status_code,
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (422))) {

            $this->raise_error ('ExchangeError', $url, $method, $http_status_code,
                'Unprocessable Entity');
        }

        if (in_array ($http_status_code, array (408, 504))) {

            $this->raise_error ('RequestTimeout', $url, $method, $http_status_code,
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (401, 511))) {

            $details = '(possible reasons: ' . implode (', ', array (
                'invalid API keys',
                'bad or old nonce',
                'exchange is down or offline',
                'on maintenance',
                'DDoS protection',
                'rate-limiting in effect',
            )) . ')';

            $this->raise_error ('AuthenticationError', $url, $method, $http_status_code,
                $this->last_http_response, $details);
        }

        if (in_array ($http_status_code, array (400, 403, 405, 503, 520, 521, 522, 525, 530))) {

            if (preg_match ('#cloudflare|incapsula|overload|ddos#i', $result)) {

                $this->raise_error ('DDoSProtection', $url, $method, $http_status_code,
                    'not accessible from this location at the moment');

            } else {

                $details = '(possible reasons: ' . implode (', ', array (
                    'invalid API keys',
                    'bad or old nonce',
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';

                $this->raise_error ('ExchangeNotAvailable', $url, $method, $http_status_code,
                    $this->last_http_response, $details);
            }
        }


        if ($this->parseJsonResponse && !$this->last_json_response) {

            if (preg_match ('#offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing#i', $result)) {

                $details = '(possible reasons: ' . implode (', ', array (
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';

                $this->raise_error ('ExchangeNotAvailable', $url, $method, $http_status_code,
                    'not accessible from this location at the moment', $details);
            }

            if (preg_match ('#cloudflare|incapsula#i', $result)) {
                $this->raise_error ('DDoSProtection', $url, $method, $http_status_code,
                    'not accessible from this location at the moment');
            }
        }

        return $this->parseJsonResponse ? $this->last_json_response : $result;
    }

    public function set_markets ($markets, $currencies = null) {
        $values = is_array ($markets) ? array_values ($markets) : array ();
        for ($i = 0; $i < count($values); $i++) {
            $values[$i] = array_merge (
                $this->fees['trading'],
                array ('precision' => $this->precision, 'limits' => $this->limits),
                $values[$i]
            );
        }
        $this->markets = $this->indexBy ($values, 'symbol');
        $this->markets_by_id = $this->indexBy ($values, 'id');
        $this->marketsById = $this->markets_by_id;
        $this->symbols = array_keys ($this->markets);
        sort ($this->symbols);
        $this->ids = array_keys ($this->markets_by_id);
        sort ($this->ids);
        if ($currencies) {
            $this->currencies = array_replace_recursive ($currencies, $this->currencies);
        } else {
            $base_currencies = array_map (function ($market) {
                return array (
                    'id' => array_key_exists ('baseId', $market) ? $market['baseId'] : $market['base'],
                    'numericId' => array_key_exists ('baseNumericId', $market) ? $market['baseNumericId'] : null,
                    'code' => $market['base'],
                    'precision' => array_key_exists ('precision', $market) ? (
                        array_key_exists ('base', $market['precision']) ? $market['precision']['base'] : (
                            array_key_exists ('amount', $market['precision']) ? $market['precision']['amount'] : null
                        )) : 8,
                );
            }, array_filter ($values, function ($market) {
                return array_key_exists ('base', $market);
            }));
            $quote_currencies = array_map (function ($market) {
                return array (
                    'id' => array_key_exists ('quoteId', $market) ? $market['quoteId'] : $market['quote'],
                    'numericId' => array_key_exists ('quoteNumericId', $market) ? $market['quoteNumericId'] : null,
                    'code' => $market['quote'],
                    'precision' => array_key_exists ('precision', $market) ? (
                        array_key_exists ('quote', $market['precision']) ? $market['precision']['quote'] : (
                            array_key_exists ('price', $market['precision']) ? $market['precision']['price'] : null
                        )) : 8,
                );
            }, array_filter ($values, function ($market) {
                return array_key_exists ('quote', $market);
            }));
            $currencies = $this->indexBy (array_merge ($base_currencies, $quote_currencies), 'code');
            $this->currencies = array_replace_recursive ($currencies, $this->currencies);
        }
        $this->currencies_by_id = $this->indexBy (array_values ($this->currencies), 'id');
        return $this->markets;
    }

    public function setMarkets ($markets) {
        return $this->set_markets ($markets);
    }

    public function loadMarkets ($reload = false) {
        return $this->load_markets ($reload);
    }

    public function load_markets ($reload = false) {
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets ($this->markets);
            }
            return $this->markets;
        }
        $markets = $this->fetch_markets ();
        $currencies = null;
        if (array_key_exists ('fetchCurrencies', $this->has) && $this->has['fetchCurrencies'])
            $currencies = $this->fetch_currencies ();
        return $this->set_markets ($markets, $currencies);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return (gettype ($ohlcv) === 'array' && count (array_filter (array_keys ($ohlcv), 'is_string')) == 0) ?
            array_slice ($ohlcv, 0, 6) : $ohlcv;
    }

    public function parseOHLCV ($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcv ($ohlcv, $market, $timeframe, $since, $limit);
    }

    public function parse_ohlcvs ($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        $ohlcvs = is_array ($ohlcvs) ? array_values ($ohlcvs) : array ();
        $result = array ();
        $num_ohlcvs = count ($ohlcvs);
        for ($i = 0; $i < $num_ohlcvs; $i++) {
            if ($limit && (count ($result) >= $limit))
                break;
            $ohlcv = $this->parse_ohlcv ($ohlcvs[$i], $market, $timeframe, $since, $limit);
            if ($since && ($ohlcv[0] < $since))
                continue;
            $result[] = $ohlcv;
        }
        return $result;
    }

    public function parseOHLCVs ($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_bid_ask ($bidask, $price_key = 0, $amount_key = 0) {
        return array (floatval ($bidask[$price_key]), floatval ($bidask[$amount_key]));
    }

    public function parse_bids_asks ($bidasks, $price_key = 0, $amount_key = 0) {
        $result = array ();
        $array = is_array ($bidasks) ? array_values ($bidasks) : array ();
        foreach ($array as $bidask)
            $result[] = $this->parse_bid_ask ($bidask, $price_key, $amount_key);
        return $result;
    }

    public function parseBidAsk ($bidask, $price_key = 0, $amount_key = 0) {
        return $this->parse_bid_ask ($bidask, $price_key, $amount_key);
    }

    public function parseBidsAsks ($bidasks, $price_key = 0, $amount_key = 0) {
        return $this->parse_bids_asks ($bidasks, $price_key, $amount_key);
    }

    public function fetch_l2_order_book ($symbol, $limit = null, $params = array ()) {
        $orderbook = $this->fetch_order_book ($symbol, $limit, $params);
        return array_merge ($orderbook, array (
            'bids' => $this->sort_by ($this->aggregate ($orderbook['bids']), 0, true),
            'asks' => $this->sort_by ($this->aggregate ($orderbook['asks']), 0),
        ));
    }

    public function fetchL2OrderBook ($symbol, $limit = null, $params = array ()) {
        return $this->fetch_l2_order_book ($symbol, $limit, $params);
    }

    public function parse_order_book ($orderbook, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        return array (
            'bids' => is_array ($orderbook) && array_key_exists ($bids_key, $orderbook) ?
                $this->parse_bids_asks ($orderbook[$bids_key], $price_key, $amount_key) :
                array (),
            'asks' => is_array ($orderbook) && array_key_exists ($asks_key, $orderbook) ?
                $this->parse_bids_asks ($orderbook[$asks_key], $price_key, $amount_key) :
                array (),
            'timestamp' => $timestamp,
            'datetime' => isset ($timestamp) ? $this->iso8601 ($timestamp) : null,
            'nonce' => null,
        );
    }

    public function parseOrderBook ($orderbook, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        return $this->parse_order_book ($orderbook, $timestamp, $bids_key, $asks_key, $price_key, $amount_key);
    }

    public function parse_balance ($balance) {
        $currencies = array_keys ($this->omit ($balance, 'info'));
        $accounts = array ('free', 'used', 'total');
        foreach ($accounts as $account) {
            $balance[$account] = array ();
            foreach ($currencies as $currency) {
                $balance[$account][$currency] = $balance[$currency][$account];
            }
        }
        return $balance;
    }

    public function parseBalance ($balance) {
        return $this->parse_balance ($balance);
    }

    public function fetch_partial_balance ($part, $params = array ()) {
        $balance = $this->fetch_balance ($params);
        return $balance[$part];
    }

    public function fetch_free_balance ($params = array ()) {
        return $this->fetch_partial_balance ('free', $params);
    }

    public function fetch_used_balance ($params = array ()) {
        return $this->fetch_partial_balance ('used', $params);
    }

    public function fetch_total_balance ($params = array ()) {
        return $this->fetch_partial_balance ('total', $params);
    }

    public function fetchFreeBalance ($params = array ()) {
        return $this->fetch_free_balance ($params);
    }

    public function fetchUsedBalance ($params = array ()) {
        return $this->fetch_used_balance ($params);
    }

    public function fetchTotalBalance ($params = array ()) {
        return $this->fetch_total_balance ($params);
    }

    public function filter_by_since_limit ($array, $since = null, $limit = null) {
        $result = array ();
        $array = array_values ($array);
        foreach ($array as $entry)
            if ($entry['timestamp'] > $since)
                $result[] = $entry;
        if ($limit)
            $result = array_slice ($result, 0, $limit);
        return $result;
    }

    public function filterBySinceLimit ($array, $since = null, $limit = null) {
        return $this->filter_by_since_limit ($array, $since, $limit);
    }

    public function parse_trades ($trades, $market = null, $since = null, $limit = null) {
        $array = is_array ($trades) ? array_values ($trades) : array ();
        $result = array ();
        foreach ($array as $trade)
            $result[] = $this->parse_trade ($trade, $market);
        $result = $this->sort_by ($result, 'timestamp');
        $symbol = isset ($market) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit ($result, $symbol, $since, $limit);
    }

    public function parseTrades ($trades, $market = null, $since = null, $limit = null) {
        return $this->parse_trades ($trades, $market, $since, $limit);
    }

    public function parse_orders ($orders, $market = null, $since = null, $limit = null) {
        $array = is_array ($orders) ? array_values ($orders) : array ();
        $result = array ();
        foreach ($array as $order)
            $result[] = $this->parse_order ($order, $market);
        $result = $this->sort_by ($result, 'timestamp');
        $symbol = isset ($market) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit ($result, $symbol, $since, $limit);
    }

    public function parseOrders ($orders, $market = null, $since = null, $limit = null) {
        return $this->parse_orders ($orders, $market, $since, $limit);
    }

    public function filter_by_symbol ($array, $symbol = null) {
        if ($symbol) {
            $grouped = $this->group_by ($array, 'symbol');
            if (is_array ($grouped) && array_key_exists ($symbol, $grouped))
                return $grouped[$symbol];
            return array ();
        }
        return $array;
    }

    public function filterBySymbol ($orders, $symbol = null) {
        return $this->filter_by_symbol ($orders, $symbol);
    }

    public function filter_by_symbol_since_limit ($array, $symbol = null, $since = null, $limit = null) {
        $array = array_values ($array);
        $symbolIsSet = isset ($symbol);
        $sinceIsSet = isset ($since);
        $array = array_filter ($array, function ($element) use ($symbolIsSet, $symbol, $sinceIsSet, $since) {
            return (($symbolIsSet ? ($element['symbol'] === $symbol)  : true) &&
                    ($sinceIsSet  ? ($element['timestamp'] >= $since) : true));
        });
        return array_slice ($array, 0, isset ($limit) ? $limit : count ($array));
    }

    public function filterBySymbolSinceLimit ($array, $symbol = null, $since = null, $limit = null) {
        return $this->filter_by_symbol_since_limit ($array, $symbol, $since, $limit);
    }

    public function filter_by_array ($objects, $key, $values = null, $indexed = true) {

        $objects = array_values ($objects);

        // return all of them if no $symbols were passed in the first argument
        if ($values === null)
            return $indexed ? $this->index_by ($objects, $key) : $objects;

        $result = array ();
        for ($i = 0; $i < count ($objects); $i++) {
            $value = isset ($objects[$i][$key]) ? $objects[$i][$key] : null;
            if (in_array ($value, $values))
                $result[] = $objects[$i];
        }

        return $indexed ? $this->index_by ($result, $key) : $result;
    }

    public function filterByArray ($objects, $key, $values = null, $indexed = true) {
        return $this->filter_by_array ($objects, $key, $values, $indexed);
    }

    public function fetch_bids_asks ($symbols, $params = array ()) { // stub
        throw new NotSupported ($this->id . ' API does not allow to fetch all prices at once with a single call to fetch_bids_asks () for now');
    }

    public function fetchBidsAsks ($symbols, $params = array ()) {
        return $this->fetch_bids_asks ($symbols, $params);
    }

    public function fetch_tickers ($symbols, $params = array ()) { // stub
        throw new NotSupported ($this->id . ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now');
    }

    public function fetchTickers ($symbols = null, $params = array ()) {
        return $this->fetch_tickers ($symbols, $params);
    }

    public function fetch_order_status ($id, $market = null) {
        $order = $this->fetch_order ($id);
        return $order['id'];
    }

    public function fetchOrderStatus ($id, $market = null) {
        return $this->fetch_order_status ($id);
    }

    public function purge_cached_orders ($before) {
        $this->orders = $this->index_by (array_filter ($this->orders, function ($order) use ($before) {
            return ($order['status'] === 'open') || ($order['timestamp'] >= $before);
        }), 'id');
        return $this->orders;
    }

    public function purgeCachesOrders ($before) {
        return $this->purge_cached_orders ($before);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_order() not implemented yet');
    }

    public function fetchOrder ($id, $symbol = null, $params = array ()) {
        return $this->fetch_order ($id, $symbol, $params);
    }

    public function fetch_order_trades ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_order_trades() not implemented yet');
    }

    public function fetchOrderTrades ($id, $symbol = null, $params = array ()) {
        return $this->fetch_order_trades ($id, $symbol, $params);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_orders() not implemented yet');
    }

    public function fetchOrders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_orders ($symbol, $since, $limit, $params);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_open_orders() not implemented yet');
    }

    public function fetchOpenOrders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_open_orders ($symbol, $since, $limit, $params);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_closed_orders() not implemented yet');
    }

    public function fetchClosedOrders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_closed_orders ($symbol, $since, $limit, $params);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_my_trades() not implemented yet');
    }

    public function fetchMyTrades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_my_trades ($symbol, $since, $limit, $params);
    }

    public function fetch_markets () {
        return $this->markets ? array_values ($this->markets) : array ();
    }

    public function fetchMarkets  () {
        return $this->fetch_markets ();
    }

    public function fetchBalance () {
        return $this->fetch_balance ();
    }

	public function fetch_balance ($params = array ()) {
		throw new NotSupported ($this->id . ' fetch_balance() not implemented yet');
	}

    public function fetchOrderBook ($symbol, $limit = null, $params = array ()) {
        return $this->fetch_order_book ($symbol, $limit, $params);
    }

    public function fetchTicker ($symbol, $params = array ()) {
        return $this->fetch_ticker ($symbol, $params);
    }

    public function fetchTrades ($symbol, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_trades ($symbol, $since, $limit, $params);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        if (!$this->has['fetchTrades'])
            throw new NotSupported ($this->$id . ' fetch_ohlcv() not implemented yet');
        $this->load_markets ();
        $trades = $this->fetch_trades ($symbol, $since, $limit, $params);
        return $this->build_ohlcv ($trades, $timeframe, $since, $limit);
    }

    public function fetchOHLCV ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return $this->fetch_ohlcv ($symbol, $timeframe, $since, $limit, $params);
    }

    public function convert_trading_view_to_ohlcv ($ohlcvs) {
        $result = array ();
        for ($i = 0; $i < count ($ohlcvs['t']); $i++) {
            $result[] = [
                $ohlcvs['t'][$i] * 1000,
                $ohlcvs['o'][$i],
                $ohlcvs['h'][$i],
                $ohlcvs['l'][$i],
                $ohlcvs['c'][$i],
                $ohlcvs['v'][$i],
            ];
        }
        return $result;
    }

    public function convert_ohlcv_to_trading_view ($ohlcvs) {
        $result = array (
            't' => array (),
            'o' => array (),
            'h' => array (),
            'l' => array (),
            'c' => array (),
            'v' => array (),
        );
        for ($i = 0; $i < count ($ohlcvs); $i++) {
            $result['t'][] = intval ($ohlcvs[$i][0] / 1000);
            $result['o'][] = $ohlcvs[$i][1];
            $result['h'][] = $ohlcvs[$i][2];
            $result['l'][] = $ohlcvs[$i][3];
            $result['c'][] = $ohlcvs[$i][4];
            $result['v'][] = $ohlcvs[$i][5];
        }
        return $result;
    }

    public function edit_limit_buy_order ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_order ($id, $symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_order ($id, $symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order ($id, $symbol, $side, $amount, $price, $params = array ()) {
        return $this->edit_order ($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' cancel_order() not supported or not implemented yet');
    }

    public function edit_order ($id, $symbol, $type, $side, $amount, $price, $params = array ()) {
        if (!$this->enableRateLimit) {
            throw new ExchangeError ($this->id . ' edit_order() requires enableRateLimit = true');
        }
        $this->cancel_order ($id, $symbol, $params);
        return $this->create_order ($symbol, $type, $side, $amount, $price, $params);
    }

    public function cancelOrder ($id, $symbol = null, $params = array ()) {
        return $this->cancel_order ($id, $symbol, $params);
    }

    public function editLimitBuyOrder ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_buy_order ($id, $symbol, $amount, $price, $params);
    }

    public function editLimitSellOrder ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_sell_order ($id, $symbol, $amount, $price, $params);
    }

    public function editLimitOrder ($id, $symbol, $side, $amount, $price, $params = array ()) {
        return $this->edit_limit_order ($id, $symbol, $side, $amount, $price, $params);
    }

    public function editOrder ($id, $symbol, $type, $side, $amount, $price, $params = array ()) {
        return $this->edit_order ($id, $symbol, $type, $side, $amount, $price, $params);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported ($this->id . ' create_order() not implemented yet');
    }

    public function create_limit_order ($symbol, $side, $amount, $price, $params = array ()) {
        return $this->create_order ($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order ($symbol, $side, $amount, $price = null, $params = array ()) {
        return $this->create_order ($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_limit_buy_order ($symbol, $amount, $price, $params = array ()) {
        return $this->create_order ($symbol, 'limit', 'buy',  $amount, $price, $params);
    }

    public function create_limit_sell_order ($symbol, $amount, $price, $params = array ()) {
        return $this->create_order ($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order ($symbol, $amount, $params = array ()) {
        return $this->create_order ($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order ($symbol, $amount, $params = array ()) {
        return $this->create_order ($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function createLimitBuyOrder ($symbol, $amount, $price, $params = array ()) {
        return $this->create_limit_buy_order ($symbol, $amount, $price, $params);
    }

    public function createLimitSellOrder ($symbol, $amount, $price, $params = array ()) {
        return $this->create_limit_sell_order ($symbol, $amount, $price, $params);
    }

    public function createMarketBuyOrder ($symbol, $amount, $params = array ()) {
        return $this->create_market_buy_order ($symbol, $amount, $params);
    }

    public function createMarketSellOrder ($symbol, $amount, $params = array ()) {
        return $this->create_market_sell_order ($symbol, $amount, $params);
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision ($symbol, $amount * $price));
        return array (
            'type' => $takerOrMaker,
            'currency' => $market['quote'],
            'rate' => $rate,
            'cost' => floatval ($this->fee_to_precision ($symbol, $rate * $cost)),
        );
    }

    public function createFee ($symbol, $type, $side, $amount, $price, $fee = 'taker', $params = array ()) {
        return $this->calculate_fee ($symbol, $type, $side, $amount, $price, $fee, $params);
    }

    public static function account () {
        return array (
            'free' => 0.0,
            'used' => 0.0,
            'total' => 0.0,
        );
    }

    public function common_currency_code ($currency) {
        if (!$this->substituteCommonCurrencyCodes)
            return $currency;
        return $this->safe_string($this->commonCurrencies, $currency, $currency);
    }

    public function currency_id ($commonCode) {
        $currencyIds = array ();
        $distinct = is_array ($this->commonCurrencies) ? array_keys ($this->commonCurrencies) : array ();
        for ($i = 0; $i < count ($distinct); $i++) {
            $k = $distinct[$i];
            $currencyIds[$this->commonCurrencies[$k]] = $k;
        }
        return $this->safe_string($currencyIds, $commonCode, $commonCode);
    }

    public function precision_from_string ($string) {
        $parts = explode ('.', preg_replace ('/0+$/', '', $string));
        return (count ($parts) > 1) ? strlen ($parts[1]) : 0;
    }

    public function cost_to_precision ($symbol, $cost) {
        return sprintf ('%.' . $this->markets[$symbol]['precision']['price'] . 'f', floatval ($cost));
    }

    public function costToPrecision ($symbol, $cost) {
        return $this->price_to_precision ($symbol, $cost);
    }

    public function price_to_precision ($symbol, $price) {
        return sprintf ('%.' . $this->markets[$symbol]['precision']['price'] . 'f', floatval ($price));
    }

    public function priceToPrecision ($symbol, $price) {
        return $this->price_to_precision ($symbol, $price);
    }

    public function amount_to_precision ($symbol, $amount) {
        return $this->truncate (floatval ($amount), $this->markets[$symbol]['precision']['amount']);
    }

    public function amount_to_string ($symbol, $amount) {
        return $this->truncate_to_string (floatval ($amount), $this->markets[$symbol]['precision']['amount']);
    }

    public function amount_to_lots ($symbol, $amount) {
        $lot = $this->markets[$symbol]['lot'];
        return $this->amount_to_precision ($symbol, floor (floatval ($amount) / $lot) * $lot);
    }

    public function amountToPrecision ($symbol, $amount) {
        return $this->amount_to_precision ($symbol, $amount);
    }

    public function amountToString ($symbol, $amount) {
        return $this->amount_to_string ($symbol, $amount);
    }

    public function amountToLots ($symbol, $amount) {
        return $this->amount_to_lots ($symbol, $amount);
    }

    public function fee_to_precision ($symbol, $fee) {
        return sprintf ('%.' . $this->markets[$symbol]['precision']['price'] . 'f', floatval ($fee));
    }

    public function feeToPrecision ($symbol, $fee) {
        return $this->fee_to_precision ($symbol, $fee);
    }

    public function commonCurrencyCode ($currency) {
        return $this->common_currency_code ($currency);
    }

    public function currencyId ($commonCode) {
        return $this->currency_id ($commonCode);
    }

    public function currency ($code) {
        return ((gettype ($code) === 'string') &&
                   isset ($this->currencies) &&
                   isset ($this->currencies[$code])) ?
                        $this->currencies[$code] : $code;
    }

    public function find_market ($string) {

        if (!isset ($this->markets))
            throw new ExchangeError ($this->id . ' markets not loaded');

        if (gettype ($string) === 'string') {

            if (isset ($this->markets_by_id[$string]))
                return $this->markets_by_id[$string];

            if (isset ($this->markets[$string]))
                return $this->markets[$string];
        }

        return $string;

    }

    public function find_symbol ($string, $market = null) {

        if (!isset ($market))
            $market = $this->find_market ($string);

        if (gettype ($market) === 'array' && count (array_filter (array_keys ($market), 'is_string')) !== 0)
            return $market['symbol'];

        return $string;
    }

    public function market ($symbol) {

        if (!isset ($this->markets))
            throw new ExchangeError ($this->id . ' markets not loaded');

        if ((gettype ($symbol) === 'string') && isset ($this->markets[$symbol]))
            return $this->markets[$symbol];

        throw new ExchangeError ($this->id . ' does not have market symbol ' . $symbol);
    }

    public function market_ids ($symbols) {
        return array_map (array ($this, 'market_id'), $symbols);
    }

    public function marketIds ($symbols) {
        return $this->market_ids ($symbols);
    }

    public function market_id ($symbol) {
        return (is_array ($market = $this->market ($symbol))) ? $market['id'] : $symbol;
    }

    public function marketId ($symbol) {
        return $this->market_id ($symbol);
    }

    public function __call ($function, $params) {
        if (array_key_exists ($function, $this))
            return call_user_func_array ($this->$function, $params);
        else {
            /* handle errors */
            throw new ExchangeError ($function . ' not found');
        }
    }

    public function __sleep () {
        $return = array_keys (array_filter (get_object_vars ($this), function ($var) {
            return !(is_object ($var) || is_resource ($var) || is_callable ($var));
        }));
        return $return;
    }

    public function __wakeup () {
        $this->curl = curl_init ();
        if ($this->api)
            $this->define_rest_api ($this->api, 'request');
    }

    public function has ($feature) {
        $feature = strtolower ($feature);
        $new_feature_map = array_change_key_case ($this->has, CASE_LOWER);
        if (array_key_exists ($feature, $new_feature_map)) {
            return $new_feature_map[$feature];
        }

        $old_feature_map = array_change_key_case (array_filter (get_object_vars ($this), function ($key) {
            return strpos($key, 'has') !== false && $key !== 'has';
        }, ARRAY_FILTER_USE_KEY), CASE_LOWER);

        $old_feature = "has{$feature}";
        return array_key_exists ($old_feature, $old_feature_map) ? $old_feature_map[$old_feature] : false;
    }

    public static function decimalToPrecision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        return static::decimal_to_precision ($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);
    }

    public static function decimal_to_precision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        if ($numPrecisionDigits < 0) {
            throw new BaseError ('Negative precision is not yet supported');
        }

        if (!is_int ($numPrecisionDigits)) {
            throw new BaseError ('Precision must be an integer');
        }

        if (!is_numeric ($x)) {
            throw new BaseError ('Invalid number');
        }

        $result = '';
        if ($roundingMode === ROUND) {
            if ($countingMode === DECIMAL_PLACES) {
                $result = (string) round ($x, $numPrecisionDigits, PHP_ROUND_HALF_EVEN);
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                $significantPosition = log (abs ($x), 10) % 10;
                if ($significantPosition > 0) {
                    $significantPosition += 1;
                }
                $result = (string) round ($x, $numPrecisionDigits - $significantPosition, PHP_ROUND_HALF_EVEN);
            }
        } elseif ($roundingMode === TRUNCATE) {
            $dotPosition = strpos ($x, '.') ?: 0;
            if ($countingMode === DECIMAL_PLACES) {
                $result = substr ($x, 0, ($dotPosition ? $dotPosition + 1 : 0) + $numPrecisionDigits);
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                $significantPosition = log (abs ($x), 10) % 10;
                $start = $dotPosition - $significantPosition;
                $end   = $start + $numPrecisionDigits;
                if ($dotPosition >= $end) {
                    $end -= 1;
                }
                if ($significantPosition < 0) {
                    $end += 1;
                }
                $result = str_pad (substr ($x, 0, $end), $dotPosition, '0');
            }
        }

        $hasDot = strpos ($result, '.') !== false;
        if ($paddingMode === NO_PADDING) {
            if ($hasDot) {
                $result = rtrim ($result, '0.');
            }
        } elseif ($paddingMode === PAD_WITH_ZERO) {
            if ($hasDot) {
                if ($countingMode === DECIMAL_PLACES) {
                    list ($before, $after) = explode ('.', $result, 2);
                    $result = $before . '.' . str_pad ($after, $numPrecisionDigits, '0');
                } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                    if ($result < 1) {
                        $result = str_pad ($result, strcspn ($result, '123456789') + $numPrecisionDigits, '0');
                    }
                }
            } else {
                if ($countingMode === DECIMAL_PLACES) {
                    if ($numPrecisionDigits > 0) {
                        $result = $result . '.' . str_repeat ('0', $numPrecisionDigits);
                    }
                } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                    if ($numPrecisionDigits > strlen ($result)) {
                        $result = $result . '.' . str_repeat ('0', ($numPrecisionDigits - strlen ($result)));
                    }
                }
            }
        }

        return $result;
    }

}
