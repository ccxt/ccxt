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
// This file is for PHP base code
// It contains the base exchange class, common functions and definitions
// See https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md for details
//-----------------------------------------------------------------------------

namespace ccxt;

class BaseError            extends \Exception    {}
class ExchangeError        extends BaseError     {}
class NotSupported         extends ExchangeError {}
class AuthenticationError  extends ExchangeError {}
class InsufficientFunds    extends ExchangeError {}
class InvalidOrder         extends ExchangeError {}
class OrderNotFound        extends InvalidOrder  {}
class OrderNotCached       extends InvalidOrder  {}
class NetworkError         extends BaseError     {}
class DDoSProtection       extends NetworkError  {}
class RequestTimeout       extends NetworkError  {}
class ExchangeNotAvailable extends NetworkError  {}

$version = '1.9.256';

$curl_errors = array (
    0 => 'CURLE_OK',
    1 => 'CURLE_UNSUPPORTED_PROTOCOL',
    2 => 'CURLE_FAILED_INIT',
    3 => 'CURLE_URL_MALFORMAT',
    4 => 'CURLE_NOT_BUILT_IN',
    5 => 'CURLE_COULDNT_RESOLVE_PROXY',
    6 => 'CURLE_COULDNT_RESOLVE_HOST',
    7 => 'CURLE_COULDNT_CONNECT',
    8 => 'CURLE_FTP_WEIRD_SERVER_REPLY',
    9 => 'CURLE_REMOTE_ACCESS_DENIED',
    10 => 'CURLE_FTP_ACCEPT_FAILED',
    11 => 'CURLE_FTP_WEIRD_PASS_REPLY',
    12 => 'CURLE_FTP_ACCEPT_TIMEOUT',
    13 => 'CURLE_FTP_WEIRD_PASV_REPLY',
    14 => 'CURLE_FTP_WEIRD_227_FORMAT',
    15 => 'CURLE_FTP_CANT_GET_HOST',
    16 => 'CURLE_HTTP2',
    17 => 'CURLE_FTP_COULDNT_SET_TYPE',
    18 => 'CURLE_PARTIAL_FILE',
    19 => 'CURLE_FTP_COULDNT_RETR_FILE',
    21 => 'CURLE_QUOTE_ERROR',
    22 => 'CURLE_HTTP_RETURNED_ERROR',
    23 => 'CURLE_WRITE_ERROR',
    25 => 'CURLE_UPLOAD_FAILED',
    26 => 'CURLE_READ_ERROR',
    27 => 'CURLE_OUT_OF_MEMORY',
    28 => 'CURLE_OPERATION_TIMEDOUT',
    30 => 'CURLE_FTP_PORT_FAILED',
    31 => 'CURLE_FTP_COULDNT_USE_REST',
    33 => 'CURLE_RANGE_ERROR',
    34 => 'CURLE_HTTP_POST_ERROR',
    35 => 'CURLE_SSL_CONNECT_ERROR',
    36 => 'CURLE_BAD_DOWNLOAD_RESUME',
    37 => 'CURLE_FILE_COULDNT_READ_FILE',
    38 => 'CURLE_LDAP_CANNOT_BIND',
    39 => 'CURLE_LDAP_SEARCH_FAILED',
    41 => 'CURLE_FUNCTION_NOT_FOUND',
    42 => 'CURLE_ABORTED_BY_CALLBACK',
    43 => 'CURLE_BAD_FUNCTION_ARGUMENT',
    45 => 'CURLE_INTERFACE_FAILED',
    47 => 'CURLE_TOO_MANY_REDIRECTS',
    48 => 'CURLE_UNKNOWN_OPTION',
    49 => 'CURLE_TELNET_OPTION_SYNTAX',
    51 => 'CURLE_PEER_FAILED_VERIFICATION',
    52 => 'CURLE_GOT_NOTHING',
    53 => 'CURLE_SSL_ENGINE_NOTFOUND',
    54 => 'CURLE_SSL_ENGINE_SETFAILED',
    55 => 'CURLE_SEND_ERROR',
    56 => 'CURLE_RECV_ERROR',
    58 => 'CURLE_SSL_CERTPROBLEM',
    59 => 'CURLE_SSL_CIPHER',
    60 => 'CURLE_SSL_CACERT',
    61 => 'CURLE_BAD_CONTENT_ENCODING',
    62 => 'CURLE_LDAP_INVALID_URL',
    63 => 'CURLE_FILESIZE_EXCEEDED',
    64 => 'CURLE_USE_SSL_FAILED',
    65 => 'CURLE_SEND_FAIL_REWIND',
    66 => 'CURLE_SSL_ENGINE_INITFAILED',
    67 => 'CURLE_LOGIN_DENIED',
    68 => 'CURLE_TFTP_NOTFOUND',
    69 => 'CURLE_TFTP_PERM',
    70 => 'CURLE_REMOTE_DISK_FULL',
    71 => 'CURLE_TFTP_ILLEGAL',
    72 => 'CURLE_TFTP_UNKNOWNID',
    73 => 'CURLE_REMOTE_FILE_EXISTS',
    74 => 'CURLE_TFTP_NOSUCHUSER',
    75 => 'CURLE_CONV_FAILED',
    76 => 'CURLE_CONV_REQD',
    77 => 'CURLE_SSL_CACERT_BADFILE',
    78 => 'CURLE_REMOTE_FILE_NOT_FOUND',
    79 => 'CURLE_SSH',
    80 => 'CURLE_SSL_SHUTDOWN_FAILED',
    81 => 'CURLE_AGAIN',
    82 => 'CURLE_SSL_CRL_BADFILE',
    83 => 'CURLE_SSL_ISSUER_ERROR',
    84 => 'CURLE_FTP_PRET_FAILED',
    85 => 'CURLE_RTSP_CSEQ_ERROR',
    86 => 'CURLE_RTSP_SESSION_ERROR',
    87 => 'CURLE_FTP_BAD_FILE_LIST',
    88 => 'CURLE_CHUNK_FAILED',
    89 => 'CURLE_NO_CONNECTION_AVAILABLE',
    90 => 'CURLE_SSL_PINNEDPUBKEYNOTMATCH',
    91 => 'CURLE_SSL_INVALIDCERTSTATUS',
    92 => 'CURLE_HTTP2_STREAM',
);

class Exchange {

    public static $exchanges = array (
        '_1broker',
        '_1btcxe',
        'acx',
        'allcoin',
        'anxpro',
        'binance',
        'bit2c',
        'bitbay',
        'bitcoincoid',
        'bitfinex',
        'bitfinex2',
        'bitflyer',
        'bithumb',
        'bitlish',
        'bitmarket',
        'bitmex',
        'bitso',
        'bitstamp1',
        'bitstamp',
        'bittrex',
        'bl3p',
        'bleutrade',
        'btcbox',
        'btcchina',
        'btcexchange',
        'btcmarkets',
        'btctradeua',
        'btcturk',
        'btcx',
        'bter',
        'bxinth',
        'ccex',
        'cex',
        'chbtc',
        'chilebit',
        'coincheck',
        'coinfloor',
        'coingi',
        'coinmarketcap',
        'coinmate',
        'coinsecure',
        'coinspot',
        'cryptopia',
        'dsx',
        'exmo',
        'flowbtc',
        'foxbit',
        'fybse',
        'fybsg',
        'gatecoin',
        'gateio',
        'gdax',
        'gemini',
        'hitbtc',
        'hitbtc2',
        'huobi',
        'huobicny',
        'huobipro',
        'independentreserve',
        'itbit',
        'jubi',
        'kraken',
        'kuna',
        'lakebtc',
        'livecoin',
        'liqui',
        'luno',
        'mercado',
        'mixcoins',
        'nova',
        'okcoincny',
        'okcoinusd',
        'okex',
        'paymium',
        'poloniex',
        'quadrigacx',
        'qryptos',
        'quoine',
        'southxchange',
        'surbitcoin',
        'tidex',
        'therock',
        'urdubit',
        'vaultoro',
        'vbtc',
        'virwox',
        'wex',
        'xbtce',
        'yobit',
        'yunbi',
        'zaif',
    );

    public static function split ($string, $delimiters = array (' ')) {
        return explode ($delimiters[0], str_replace ($delimiters, $delimiters[0], $string));
    }

    public static function decimal ($number) {
        return '' + $number;
    }

    public static function safe_float ($object, $key, $default_value = null) {
        return (array_key_exists ($key, $object) && $object[$key]) ? floatval ($object[$key]) : $default_value;
    }

    public static function safe_string ($object, $key, $default_value = null) {
        return (array_key_exists ($key, $object) && $object[$key]) ? strval ($object[$key]) : $default_value;
    }

    public static function safe_integer ($object, $key, $default_value = null) {
        return (array_key_exists ($key, $object) && $object[$key]) ? intval ($object[$key]) : $default_value;
    }

    public static function safe_value ($object, $key, $default_value = null) {
        return (array_key_exists ($key, $object) && $object[$key]) ? $object[$key] : $default_value;
    }

    public static function truncate ($number, $precision = 0) {
        $decimal_precision = pow (10, $precision);
        return floatval ($number * $decimal_precision) / $decimal_precision;
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

    public static function keysort ($array) {
        $result = $array;
        ksort ($result);
        return $result;
    }

    public static function extract_params ($string) {
        if (preg_match_all ('/{([a-z0-9_]+?)}/ui', $string, $matches))
            return $matches[1];
    }

    public static function implode_params ($string, $params) {
        foreach ($params as $key => $value)
            $string = implode ($value, mb_split ('{' . $key . '}', $string));
        return $string;
    }

    public static function indexBy ($arrayOfArrays, $key) {
        return Exchange::index_by ($arrayOfArrays, $key);
    }

    public static function sortBy ($arrayOfArrays, $key, $descending = false) {
        return Exchange::sort_by ($arrayOfArrays, $key, $descending);
    }

    public static function sum () {
        return array_sum (array_filter (func_get_args (), function ($x) { return isset ($x) ? $x : 0; }));
    }

    public static function extractParams ($string) {
        return Exchange::extract_params ($string);
    }

    public static function implodeParams ($string, $params) {
        return Exchange::implode_params ($string, $params);
    }

    public static function ordered ($array) { // for Python OrderedDicts, does nothing in PHP and JS
        return $array;
    }

    public function aggregate ($bidasks) {

        $result = array ();

        foreach ($bidasks as $bidask) {
            $price = (string) $bidask[0];
            $result[$price] = array_key_exists ($price, $result) ? $result[$price] : 0;
            $result[$price] += $bidask[1];
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
        $result = Exchange::implode_params ($path, $params);
        $query = Exchange::omit ($params, Exchange::extract_params ($path));
        if ($query)
            $result .= '?' . Exchange::urlencode ($query);
        return $result;
    }

    public static function seconds () {
        return time ();
    }

    public static function milliseconds () {
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . substr ($msec, 2, 3);
    }

    public static function microseconds () {
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . str_pad (substr ($msec, 2, 6), 6, '0');
    }

    public static function iso8601 ($timestamp) {
        $result = date ('c', (int) round ($timestamp / 1000));
        $msec = (int) $timestamp % 1000;
        return str_replace ('+', sprintf (".%03d+", $msec), $result);
    }

    public static function parse8601 ($timestamp) {
        $yyyy = '([0-9]{4})-?';
        $mm   = '([0-9]{2})-?';
        $dd   = '([0-9]{2})(?:T|[\s])?';
        $h    = '([0-9]{2}):?';
        $m    = '([0-9]{2}):?';
        $s    = '([0-9]{2})';
        $ms   = '(\.[0-9]{3})?';
        $tz = '(?:(\+|\-)([0-9]{2})\:?([0-9]{2})|Z)?';
        $regex = '/' . $yyyy . $mm . $dd . $h . $m . $s . $ms . $tz.'/';
        preg_match ($regex, $timestamp, $matches);
        array_shift ($matches);
        list ($yyyy, $mm, $dd, $h, $m, $s) = $matches;
        $ms = @$matches[6] ? $matches[6] : '.000';
        $sign = @$matches[7] ? $matches[7] : '';
        $sign = intval ($sign . '1');
        $hours = @$matches[8] ? intval ($matches[8]) * $sign : '';
        $minutes = @$matches[9] ? intval ($matches[9]) * $sign : '';
        // $ms = $ms or '.000';
        // $sign = $sign or '';
        // $sign = intval ($sign . '1');
        // $hours = (intval ($hours) or 0) * $sign;
        // $minutes = (intval ($minutes) or 0) * $sign;

        // is_dst parameter has been removed in PHP 7.0.0.
        // http://php.net/manual/en/function.mktime.php
        if (version_compare (PHP_VERSION, '7.0.0', '>=')) {
            $t = mktime ($h, $m, $s, $mm, $dd, $yyyy);
        } else {
            $t = mktime ($h, $m, $s, $mm, $dd, $yyyy, 0);
        }
        $t += $hours * 3600 + $minutes * 60;
        $t *= 1000;
        return $t;
    }

    public static function Ymd ($timestamp, $infix = ' ') {
        return gmdate ('Y-m-d', (int) round ($timestamp / 1000));
    }

    public static function YmdHMS ($timestamp, $infix = ' ') {
        return gmdate ('Y-m-d\\' . $infix . 'H:i:s', (int) round ($timestamp / 1000));
    }

    public static function binary_concat () {
        return implode ('', func_get_args ());
    }

    public function binary_to_string ($binary) {
        return $binary;
    }

    public static function json ($input) {
        return json_encode ($input, JSON_FORCE_OBJECT);
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

    public function __construct ($options) {

        global $version;

        $this->curl        = curl_init ();
        $this->id          = null;
        $this->rateLimit   = 2000;
        $this->timeout     = 10000; // in milliseconds
        $this->proxy       = '';
        $this->markets     = null;
        $this->symbols     = null;
        $this->ids         = null;
        $this->currencies  = null;
        $this->balance     = array ();
        $this->orderbooks  = array ();
        $this->fees        = array ('trading' => array (), 'funding' => array ());
        $this->precision   = array ();
        $this->limits      = array ();
        $this->orders      = array ();
        $this->trades      = array ();
        $this->verbose     = false;
        $this->apiKey      = '';
        $this->secret      = '';
        $this->password    = '';
        $this->uid         = '';
        $this->twofa       = false;
        $this->marketsById = null;
        $this->markets_by_id = null;
        $this->userAgent   = 'ccxt/' . $version . ' (+https://github.com/ccxt-dev/ccxt) PHP/' . PHP_VERSION;
        $this->substituteCommonCurrencyCodes = true;
        $this->timeframes = null;
        $this->hasPublicAPI         = true;
        $this->hasPrivateAPI        = true;
        $this->hasCORS              = false;
        $this->hasFetchTicker       = true;
        $this->hasFetchOrderBook    = true;
        $this->hasFetchTrades       = true;
        $this->hasFetchTickers      = false;
        $this->hasFetchOHLCV        = false;
        $this->hasDeposit           = false;
        $this->hasWithdraw          = false;
        $this->hasFetchBalance      = true;
        $this->hasFetchOrder        = false;
        $this->hasFetchOrders       = false;
        $this->hasFetchOpenOrders   = false;
        $this->hasFetchClosedOrders = false;
        $this->hasFetchMyTrades     = false;
        $this->hasCreateOrder       = $this->hasPrivateAPI;
        $this->hasCancelOrder       = $this->hasPrivateAPI;
        $this->lastRestRequestTimestamp = 0;
        $this->lastRestPollTimestamp    = 0;
        $this->restRequestQueue         = null;
        $this->restPollerLoopIsRunning  = false;
        $this->enableRateLimit          = false;
        $this->last_http_response = null;
        $this->last_json_response = null;

        if ($options)
            foreach ($options as $key => $value)
                $this->$key = $value;

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
                    $camelcaseMethod  = Exchange::capitalize ($lowercaseMethod);
                    $camelcaseSuffix  = implode (array_map ('\ccxt\Exchange::capitalize', $splitPath));
                    $lowercasePath    = array_map ('trim', array_map ('strtolower', $splitPath));
                    $underscoreSuffix = implode ('_', array_filter ($lowercasePath));

                    if (mb_stripos ($camelcaseSuffix, $camelcaseMethod) === 0)
                        $camelcaseSuffix = mb_substr ($camelcaseSuffix, mb_strlen ($camelcaseMethod));

                    if (mb_stripos ($underscoreSuffix, $lowercaseMethod) === 0)
                        $underscoreSuffix = trim (mb_substr ($underscoreSuffix, mb_strlen ($lowercaseMethod)), '_');

                    $camelcase  = $type . $camelcaseMethod . Exchange::capitalize ($camelcaseSuffix);
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
        $exception = '\\ccxt\\' . $exception_type;
        throw new $exception (implode (' ', array (
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
            usleep ($delay * 1000.0);
        }
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

        if (strlen ($this->proxy))
            $headers['Origin'] = '*';

        if (!$headers)
            $headers = array ();
        elseif (is_array ($headers)) {
            $tmp = $headers;
            $headers = array ();
            foreach ($tmp as $key => $value)
                $headers[] = $key . ': ' . $value;
        }

        $url = $this->proxy . $url;

        $verbose_headers = $headers;

        curl_setopt ($this->curl, CURLOPT_URL, $url);

        if ($this->timeout) {
            $seconds = intval ($this->timeout / 1000);
            curl_setopt ($this->curl, CURLOPT_CONNECTTIMEOUT, $seconds);
            curl_setopt ($this->curl, CURLOPT_TIMEOUT, $seconds);
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

        }

        if ($headers)
            curl_setopt ($this->curl, CURLOPT_HTTPHEADER, $headers);

        if ($this->verbose) {
            print_r ("\nRequest:\n");
            print_r (array ($method, $url, $verbose_headers, $body));
        }

        curl_setopt ($this->curl, CURLOPT_FAILONERROR, false);

        $response_headers = array ();

        // this function is called by curl for each header received
        curl_setopt ($this->curl, CURLOPT_HEADERFUNCTION,
            function ($curl, $header) use (&$response_headers) {
                $len = strlen ($header);
                $header = explode (':', $header, 2);
                if (count($header) < 2) // ignore invalid headers
                    return $len;
                $name = strtolower (trim ($header[0]));
                if (!array_key_exists ($name, $response_headers))
                    $response_headers[$name] = [trim ($header[1])];
                else
                    $response_headers[$name][] = trim ($header[1]);
                return $len;
            }
        );

        $result = curl_exec ($this->curl);

        $this->lastRestRequestTimestamp = $this->milliseconds ();

        $this->last_http_response = $result;

        $curl_errno = curl_errno ($this->curl);
        $curl_error = curl_error ($this->curl);

        if ($result === false) {

            if ($curl_errno == 28) // CURLE_OPERATION_TIMEDOUT
                $this->raise_error ('RequestTimeout', $url, $method, $curl_errno, $curl_error);

            // var_dump ($result);

            // all sorts of SSL problems, accessibility
            $this->raise_error ('ExchangeNotAvailable', $url, $method, $curl_errno, $curl_error);
        }

        $http_status_code = curl_getinfo ($this->curl, CURLINFO_HTTP_CODE);

        $this->handle_errors ($http_status_code, $curl_error, $url, $method, $response_headers, $result);

        if ($http_status_code == 429) {

            $this->raise_error ('DDoSProtection', $url, $method, $http_status_code,
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (404, 409, 422, 500, 501, 502))) {

            $this->raise_error ('ExchangeNotAvailable', $url, $method, $http_status_code,
                'not accessible from this location at the moment');
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
                'check your API keys', $details);
        }

        if (in_array ($http_status_code, array (400, 403, 405, 503, 520, 521, 522, 525, 530))) {

            if (preg_match ('#cloudflare|incapsula#i', $result)) {

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
                    'not accessible from this location at the moment', $details);
            }
        }

        $this->last_json_response =
            ((gettype ($result) == 'string') &&  (strlen ($result) > 1)) ?
                json_decode ($result, $as_associative_array = true) : null;

        if (!$this->last_json_response) {

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

        return $this->last_json_response;
    }

    public function set_markets ($markets) {
        $values = array_values ($markets);
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
        $base = $this->pluck (array_filter ($values, function ($market) {
            return array_key_exists ('base', $market);
        }), 'base');
        $quote = $this->pluck (array_filter ($values, function ($market) {
            return array_key_exists ('quote', $market);
        }), 'quote');
        $this->currencies = $this->unique (array_merge ($base, $quote));
        sort ($this->currencies);
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
        return $this->set_markets ($markets);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $ohlcv;
    }

    public function parseOHLCV ($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcv ($ohlcv, $market, $timeframe, $since, $limit);
    }

    public function parse_ohlcvs ($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        $result = array ();
        $array = array_values ($ohlcvs);
        foreach ($array as $ohlcv)
            $result[] = $this->parse_ohlcv ($ohlcv, $market, $timeframe, $since, $limit);
        return $result;
    }

    public function parseOHLCVs ($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_bidask ($bidask, $price_key = 0, $amount_key = 0) {
        return array (floatval ($bidask[$price_key]), floatval ($bidask[$amount_key]));
    }

    public function parse_bidasks ($bidasks, $price_key = 0, $amount_key = 0) {
        $result = array ();
        $array = array_values ($bidasks);
        foreach ($array as $bidask)
            $result[] = $this->parse_bidask ($bidask, $price_key, $amount_key);
        return $result;
    }

    public function parseBidAsk ($bidask, $price_key = 0, $amount_key = 0) {
        return $this->parse_bidask ($bidask, $price_key, $amount_key);
    }

    public function parseBidAsks ($bidasks, $price_key = 0, $amount_key = 0) {
        return $this->parse_bidasks ($bidasks, $price_key, $amount_key);
    }

    public function fetch_l2_order_book ($symbol, $params = array ()) {
        $orderbook = $this->fetch_order_book ($symbol, $params);
        return array_merge ($orderbook, array (
            'bids' => $this->sort_by ($this->aggregate ($orderbook['bids']), 0, true),
            'asks' => $this->sort_by ($this->aggregate ($orderbook['asks']), 0),
        ));
    }

    public function fetchL2OrderBook ($symbol, $params = array ()) {
        return $this->fetch_l2_order_book ($symbol, $params);
    }

    public function parse_order_book ($orderbook, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        $timestamp = $timestamp ? $timestamp : $this->milliseconds ();
        return array (
            'bids' => array_key_exists ($bids_key, $orderbook) ?
                $this->parse_bidasks ($orderbook[$bids_key], $price_key, $amount_key) :
                array (),
            'asks' => array_key_exists ($asks_key, $orderbook) ?
                $this->parse_bidasks ($orderbook[$asks_key], $price_key, $amount_key) :
                array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
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

    public function parse_trades ($trades, $market = null) {
        $result = array ();
        $array = array_values ($trades);
        foreach ($array as $trade)
            $result[] = $this->parse_trade ($trade, $market);
        return $result;
    }

    public function parseTrades ($trades, $market = null) {
        return $this->parse_trades ($trades, $market);
    }

    public function parse_orders ($orders, $market = null) {
        $result = array ();
        foreach ($orders as $order)
            $result[] = $this->parse_order ($order, $market);
        return $result;
    }

    public function parseOrders ($orders, $market = null) {
        return $this->parse_orders ($orders, $market);
    }

    public function filter_orders_by_symbol ($orders, $symbol = null) {
        if ($symbol) {
            $grouped = $this->group_by ($orders, 'symbol');
            if (array_key_exists ($symbol, $grouped))
                return $grouped[$symbol];
            return array ();
        }
        return $orders;
    }

    public function filterOrdersBySymbol ($orders, $symbol = null) {
        return $this->filter_orders_by_symbol ($orders, $symbol);
    }

    public function fetch_tickers ($symbols, $params = array ()) { // stub
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now');
    }

    public function fetchTickers ($symbols, $params = array ()) {
        return $this->fetch_tickers ($symbols, $params);
    }

    public function fetch_order_status ($id, $market = null) {
        $order = $this->fetch_order ($id);
        return $order['id'];
    }

    public function fetchOrderStatus ($id, $market = null) {
        return $this->fetch_order_status ($id);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' fetch_order() not implemented yet');
    }

    public function fetchOrder ($id, $symbol = null, $params = array ()) {
        return $this->fetch_order ($id, $symbol, $params);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' fetch_orders() not implemented yet');
    }

    public function fetchOrders ($symbol = null, $params = array ()) {
        return $this->fetch_orders ($symbol, $params);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' fetch_open_orders() not implemented yet');
    }

    public function fetchOpenOrders ($symbol = null, $params = array ()) {
        return $this->fetch_open_orders ($symbol, $params);
    }

    public function fetch_closed_orders ($symbol = null, $params = array ()) {
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' fetch_closed_orders() not implemented yet');
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        return $this->fetch_closed_orders ($symbol, $params);
    }

    public function fetch_markets () { // stub
        return $this->markets;
    }

    public function fetchMarkets  () {
        return $this->fetch_markets ();
    }

    public function fetchBalance () {
        return $this->fetch_balance ();
    }

    public function fetchOrderBook ($symbol, $params = array ()) {
        return $this->fetch_order_book ($symbol, $params);
    }

    public function fetchTicker ($symbol, $params = array ()) {
        return $this->fetch_ticker ($symbol, $params);
    }

    public function fetchTrades ($symbol, $params = array ()) {
        return $this->fetch_trades ($symbol, $params);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $exception = '\\ccxt\\NotSupported';
        throw new $exception ($this->id . ' fetch_ohlcv() not suported or not implemented yet');
    }

    public function fetchOHLCV ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return $this->fetch_ohlcv ($symbol, $timeframe, $since, $limit, $params);
    }

    public function edit_limit_buy_order ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_order ($symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order ($id, $symbol, $amount, $price, $params = array ()) {
        return $this->edit_limit_order ($symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order ($id, $symbol, $side, $amount, $price, $params = array ()) {
        return $this->edit_order ($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function edit_order ($id, $symbol, $type, $side, $amount, $price, $params = array ()) {
        if (!$this->enableRateLimit) {
            $exception = '\\ccxt\\ExchangeError';
            throw new $exception ($this->id . ' edit_order() requires enableRateLimit = true');
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

    public function calculate_fee_rate ($symbol, $type, $side, $amount, $price, $fee = 'taker', $params = array ()) {
        return array (
            'base' => 0.0,
            'quote' => $this->markets[$symbol][$fee],
        );
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $fee = 'taker', $params = array ()) {
        $rate = $this->calculate_fee_rate ($symbol, $type, $side, $amount, $price, $fee, $params);
        return array (
            'rate' => $rate,
            'cost' => array (
                'base' => $amount * $rate['base'],
                'quote' => $amount * $price * $rate['quote'],
            ),
        );
    }

    public function createFeeRate ($symbol, $type, $side, $amount, $price, $fee = 'taker', $params = array ()) {
        return $this->calculate_fee_rate ($symbol, $type, $side, $amount, $price, $fee, $params);
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
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        return $currency;
    }

    public function cost_to_precision ($symbol, $cost) {
        return sprintf ('%.' . $this->markets[$symbol]['precision']['price'] . 'f', floatval ($price));
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
        return sprintf ('%.' . $this->markets[$symbol]['precision']['amount'] . 'f', floatval ($amount));
    }

    public function amountToPrecision ($symbol, $amount) {
        return $this->amount_to_precision ($symbol, $amount);
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

    public function market ($symbol) {
        return ((gettype ($symbol) === 'string') &&
                   isset ($this->markets)        &&
                   isset ($this->markets[$symbol])) ?
                        $this->markets[$symbol] : $symbol;
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

    function __call ($function, $params) {

        if (array_key_exists ($function, $this))
            return call_user_func_array ($this->$function, $params);
        else {
            /* handle errors */
            echo $function . ' not found';
        }
    }
}

// =============================================================================

class _1broker extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => '_1broker',
            'name' => '1Broker',
            'countries' => 'US',
            'rateLimit' => 1500,
            'version' => 'v2',
            'hasPublicAPI' => false,
            'hasCORS' => true,
            'hasFetchTrades' => false,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '60',
                '15m' => '900',
                '1h' => '3600',
                '1d' => '86400',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
                'api' => 'https://1broker.com/api',
                'www' => 'https://1broker.com',
                'doc' => 'https://1broker.com/?c=en/content/api-documentation',
            ),
            'api' => array (
                'private' => array (
                    'get' => array (
                        'market/bars',
                        'market/categories',
                        'market/details',
                        'market/list',
                        'market/quotes',
                        'market/ticks',
                        'order/cancel',
                        'order/create',
                        'order/open',
                        'position/close',
                        'position/close_cancel',
                        'position/edit',
                        'position/history',
                        'position/open',
                        'position/shared/get',
                        'social/profile_statistics',
                        'social/profile_trades',
                        'user/bitcoin_deposit_address',
                        'user/details',
                        'user/overview',
                        'user/quota_status',
                        'user/transaction_log',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetchCategories () {
        $response = $this->privateGetMarketCategories ();
        // they return an empty string among their $categories, wtf?
        $categories = $response['response'];
        $result = array ();
        for ($i = 0; $i < count ($categories); $i++) {
            if ($categories[$i])
                $result[] = $categories[$i];
        }
        return $result;
    }

    public function fetch_markets () {
        $this_ = $this; // workaround for Babel bug (not passing `this` to _recursive() call)
        $categories = $this->fetchCategories ();
        $result = array ();
        for ($c = 0; $c < count ($categories); $c++) {
            $category = $categories[$c];
            $markets = $this_->privateGetMarketList (array (
                'category' => strtolower ($category),
            ));
            for ($p = 0; $p < count ($markets['response']); $p++) {
                $market = $markets['response'][$p];
                $id = $market['symbol'];
                $symbol = null;
                $base = null;
                $quote = null;
                if (($category == 'FOREX') || ($category == 'CRYPTO')) {
                    $symbol = $market['name'];
                    $parts = explode ('/', $symbol);
                    $base = $parts[0];
                    $quote = $parts[1];
                } else {
                    $base = $id;
                    $quote = 'USD';
                    $symbol = $base . '/' . $quote;
                }
                $base = $this_->common_currency_code ($base);
                $quote = $this_->common_currency_code ($quote);
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balance = $this->privateGetUserOverview ();
        $response = $balance['response'];
        $result = array (
            'info' => $response,
        );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $result[$currency] = $this->account ();
        }
        $total = floatval ($response['balance']);
        $result['BTC']['free'] = $total;
        $result['BTC']['total'] = $total;
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetMarketQuotes (array_merge (array (
            'symbols' => $this->market_id ($symbol),
        ), $params));
        $orderbook = $response['response'][0];
        $timestamp = $this->parse8601 ($orderbook['updated']);
        $bidPrice = floatval ($orderbook['bid']);
        $askPrice = floatval ($orderbook['ask']);
        $bid = array ($bidPrice, null);
        $ask = array ($askPrice, null);
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'bids' => array ($bid),
            'asks' => array ($ask),
        );
    }

    public function fetch_trades ($symbol) {
        throw new ExchangeError ($this->id . ' fetchTrades () method not implemented yet');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $result = $this->privateGetMarketBars (array_merge (array (
            'symbol' => $this->market_id ($symbol),
            'resolution' => 60,
            'limit' => 1,
        ), $params));
        $orderbook = $this->fetch_order_book ($symbol);
        $ticker = $result['response'][0];
        $timestamp = $this->parse8601 ($ticker['date']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['h']),
            'low' => floatval ($ticker['l']),
            'bid' => $orderbook['bids'][0][0],
            'ask' => $orderbook['asks'][0][0],
            'vwap' => null,
            'open' => floatval ($ticker['o']),
            'close' => floatval ($ticker['c']),
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => null,
        );
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $this->parse8601 ($ohlcv['date']),
            floatval ($ohlcv['o']),
            floatval ($ohlcv['h']),
            floatval ($ohlcv['l']),
            floatval ($ohlcv['c']),
            null,
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'resolution' => $this->timeframes[$timeframe],
        );
        if ($since)
            $request['date_start'] = $this->iso8601 ($since); // they also support date_end
        if ($limit)
            $request['limit'] = $limit;
        $result = $this->privateGetMarketBars (array_merge ($request, $params));
        return $this->parse_ohlcvs ($result['response'], $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'symbol' => $this->market_id ($symbol),
            'margin' => $amount,
            'direction' => ($side == 'sell') ? 'short' : 'long',
            'leverage' => 1,
            'type' => $side,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['type'] .= '_market';
        $result = $this->privateGetOrderCreate (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['response']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostOrderCancel (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests');
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path . '.php';
        $query = array_merge (array ( 'token' => $this->apiKey ), $params);
        $url .= '?' . $this->urlencode ($query);
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('warning', $response))
            if ($response['warning'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        if (array_key_exists ('error', $response))
            if ($response['error'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class cryptocapital extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'cryptocapital',
            'name' => 'Crypto Capital',
            'comment' => 'Crypto Capital API',
            'countries' => 'PA', // Panama
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1d' => '1year',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
                'www' => 'https://cryptocapital.co',
                'doc' => 'https://github.com/cryptocap',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'stats',
                        'historical-prices',
                        'order-book',
                        'transactions',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balances-and-info',
                        'open-orders',
                        'user-transactions',
                        'btc-deposit-address/get',
                        'btc-deposit-address/new',
                        'deposits/get',
                        'withdrawals/get',
                        'orders/new',
                        'orders/edit',
                        'orders/cancel',
                        'orders/status',
                        'withdrawals/new',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostBalancesAndInfo ();
        $balance = $response['balances-and-info'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            $account['free'] = $this->safe_float ($balance['available'], $currency, 0.0);
            $account['used'] = $this->safe_float ($balance['on_hold'], $currency, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetOrderBook (array_merge (array (
            'currency' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($response['order-book'], null, 'bid', 'ask', 'price', 'order_amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetStats (array_merge (array (
            'currency' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['stats'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['max']),
            'low' => floatval ($ticker['min']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => floatval ($ticker['daily_change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['total_btc_traded']),
        );
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        return [
            $this->parse8601 ($ohlcv['date'] . ' 00:00:00'),
            null,
            null,
            null,
            floatval ($ohlcv['price']),
            null,
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetHistoricalPrices (array_merge (array (
            'currency' => $market['id'],
            'timeframe' => $this->timeframes[$timeframe],
        ), $params));
        $ohlcvs = $this->omit ($response['historical-prices'], 'request_currency');
        return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['timestamp']) * 1000;
        return array (
            'id' => $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $trade['maker_type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        $trades = $this->omit ($response['transactions'], 'request_currency');
        return $this->parse_trades ($trades, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'side' => $side,
            'type' => $type,
            'currency' => $this->market_id ($symbol),
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limit_price'] = $price;
        $result = $this->privatePostOrdersNew (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result,
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostOrdersCancel (array ( 'id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostWithdrawalsNew (array_merge (array (
            'currency' => $currency,
            'amount' => floatval ($amount),
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'cryptocapital')
            throw new ExchangeError ($this->id . ' is an abstract base API for _1btcxe');
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $query = array_merge (array (
                'api_key' => $this->apiKey,
                'nonce' => $this->nonce (),
            ), $params);
            $request = $this->json ($query);
            $query['signature'] = $this->hmac ($this->encode ($request), $this->encode ($this->secret));
            $body = $this->json ($query);
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response)) {
            $errors = array ();
            for ($e = 0; $e < count ($response['errors']); $e++) {
                $error = $response['errors'][$e];
                $errors[] = $error['code'] . ' => ' . $error['message'];
            }
            $errors = implode (' ', $errors);
            throw new ExchangeError ($this->id . ' ' . $errors);
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class _1btcxe extends cryptocapital {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => '_1btcxe',
            'name' => '1BTCXE',
            'countries' => 'PA', // Panama
            'comment' => 'Crypto Capital API',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api' => 'https://1btcxe.com/api',
                'www' => 'https://1btcxe.com',
                'doc' => 'https://1btcxe.com/api-docs.php',
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/CNY' => array ( 'id' => 'CNY', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'BTC/RUB' => array ( 'id' => 'RUB', 'symbol' => 'BTC/RUB', 'base' => 'BTC', 'quote' => 'RUB' ),
                'BTC/CHF' => array ( 'id' => 'CHF', 'symbol' => 'BTC/CHF', 'base' => 'BTC', 'quote' => 'CHF' ),
                'BTC/JPY' => array ( 'id' => 'JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
                'BTC/GBP' => array ( 'id' => 'GBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP' ),
                'BTC/CAD' => array ( 'id' => 'CAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/AUD' => array ( 'id' => 'AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'BTC/AED' => array ( 'id' => 'AED', 'symbol' => 'BTC/AED', 'base' => 'BTC', 'quote' => 'AED' ),
                'BTC/BGN' => array ( 'id' => 'BGN', 'symbol' => 'BTC/BGN', 'base' => 'BTC', 'quote' => 'BGN' ),
                'BTC/CZK' => array ( 'id' => 'CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK' ),
                'BTC/DKK' => array ( 'id' => 'DKK', 'symbol' => 'BTC/DKK', 'base' => 'BTC', 'quote' => 'DKK' ),
                'BTC/HKD' => array ( 'id' => 'HKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD' ),
                'BTC/HRK' => array ( 'id' => 'HRK', 'symbol' => 'BTC/HRK', 'base' => 'BTC', 'quote' => 'HRK' ),
                'BTC/HUF' => array ( 'id' => 'HUF', 'symbol' => 'BTC/HUF', 'base' => 'BTC', 'quote' => 'HUF' ),
                'BTC/ILS' => array ( 'id' => 'ILS', 'symbol' => 'BTC/ILS', 'base' => 'BTC', 'quote' => 'ILS' ),
                'BTC/INR' => array ( 'id' => 'INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR' ),
                'BTC/MUR' => array ( 'id' => 'MUR', 'symbol' => 'BTC/MUR', 'base' => 'BTC', 'quote' => 'MUR' ),
                'BTC/MXN' => array ( 'id' => 'MXN', 'symbol' => 'BTC/MXN', 'base' => 'BTC', 'quote' => 'MXN' ),
                'BTC/NOK' => array ( 'id' => 'NOK', 'symbol' => 'BTC/NOK', 'base' => 'BTC', 'quote' => 'NOK' ),
                'BTC/NZD' => array ( 'id' => 'NZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD' ),
                'BTC/PLN' => array ( 'id' => 'PLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BTC/RON' => array ( 'id' => 'RON', 'symbol' => 'BTC/RON', 'base' => 'BTC', 'quote' => 'RON' ),
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK' ),
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/THB' => array ( 'id' => 'THB', 'symbol' => 'BTC/THB', 'base' => 'BTC', 'quote' => 'THB' ),
                'BTC/TRY' => array ( 'id' => 'TRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY' ),
                'BTC/ZAR' => array ( 'id' => 'ZAR', 'symbol' => 'BTC/ZAR', 'base' => 'BTC', 'quote' => 'ZAR' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class acx extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'acx',
            'name' => 'ACX',
            'countries' => 'AU',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '2h' => '120',
                '4h' => '240',
                '12h' => '720',
                '1d' => '1440',
                '3d' => '4320',
                '1w' => '10080',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg',
                'extension' => '.json',
                'api' => 'https://acx.io/api',
                'www' => 'https://acx.io',
                'doc' => 'https://acx.io/documents/api_v2',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets', // Get all available markets
                        'tickers', // Get ticker of all markets
                        'tickers/{market}', // Get ticker of specific market
                        'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                        'order_book', // Get the order book of specified market
                        'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                        'k', // Get OHLC(k line) of specific market
                        'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                        'timestamp', // Get server current time, in seconds since Unix epoch
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'members/me', // Get your profile and accounts info
                        'deposits', // Get your deposits history
                        'deposit', // Get details of specific deposit
                        'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                        'orders', // Get your orders, results is paginated
                        'order', // Get information of specified order
                        'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                        'withdraws', // Get your cryptocurrency withdraws
                        'withdraw', // Get your cryptocurrency withdraw
                    ),
                    'post' => array (
                        'orders', // Create a Sell/Buy order
                        'orders/multi', // Create multiple sell/buy orders
                        'orders/clear', // Cancel all my orders
                        'order/delete', // Cancel an order
                        'withdraw', // Create a withdraw
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['id'];
            $symbol = $market['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetMembersMe ();
        $balances = $response['accounts'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => floatval ($balance['balance']),
                'used' => floatval ($balance['locked']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'market' => $market['id'],
            'limit' => 300,
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        $result = $this->parse_order_book ($orderbook, $timestamp);
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['at'] * 1000;
        $ticker = $ticker['ticker'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high', null),
            'low' => $this->safe_float ($ticker, 'low', null),
            'bid' => $this->safe_float ($ticker, 'buy', null),
            'ask' => $this->safe_float ($ticker, 'sell', null),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last', null),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float ($ticker, 'vol', null),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTickers ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = null;
            $symbol = $id;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                $base = mb_substr ($id, 0, 3);
                $quote = mb_substr ($id, 3, 6);
                $base = strtoupper ($base);
                $quote = strtoupper ($quote);
                $base = $this->common_currency_code ($base);
                $quote = $this->common_currency_code ($quote);
                $symbol = $base . '/' . $quote;
            }
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTickersMarket (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_ticker ($response, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade['timestamp'] * 1000;
        $side = ($trade['type'] == 'bid') ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        // looks like they switched this endpoint off
        // it returns 503 Service Temporarily Unavailable always
        // return $this->parse_trades ($response, $market);
        return $response;
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[1],
            $ohlcv[2],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        if (!$limit)
            $limit = 500; // default is 30
        $request = array (
            'market' => $market['id'],
            'period' => $this->timeframes[$timeframe],
            'limit' => $limit,
        );
        if ($since)
            $request['timestamp'] = $since;
        $response = $this->publicGetK (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'market' => $this->market_id ($symbol),
            'side' => $side,
            'volume' => (string) $amount,
            'ord_type' => $type,
        );
        if ($type == 'limit') {
            $order['price'] = (string) $price;
        }
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostOrderDelete (array ( 'id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $result = $this->privatePostWithdraw (array_merge (array (
            'currency' => strtolower ($currency),
            'sum' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $result,
            'id' => null,
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/api' . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        if (array_key_exists ('extension', $this->urls))
            $request .= $this->urls['extension'];
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $query = $this->urlencode ($this->keysort (array_merge (array (
                'access_key' => $this->apiKey,
                'tonce' => $nonce,
            ), $params)));
            $auth = $method . '|' . $request . '|' . $query;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $suffix = $query . '&$signature=' . $signature;
            if ($method == 'GET') {
                $url .= '?' . $suffix;
            } else {
                $body = $suffix;
                $headers = array ( 'Content-Type' => 'application/x-www-form-urlencoded' );
            }
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class okcoin extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'version' => 'v1',
            'rateLimit' => 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'extension' => '.do', // appended to endpoint URL
            'timeframes' => array (
                '1m' => '1min',
                '3m' => '3min',
                '5m' => '5min',
                '15m' => '15min',
                '30m' => '30min',
                '1h' => '1hour',
                '2h' => '2hour',
                '4h' => '4hour',
                '6h' => '6hour',
                '12h' => '12hour',
                '1d' => '1day',
                '3d' => '3day',
                '1w' => '1week',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Depth';
        $orderbook = $this->$method (array_merge ($request, $params));
        $timestamp = $this->milliseconds ();
        return array (
            'bids' => $orderbook['bids'],
            'asks' => $this->sort_by ($orderbook['asks'], 0),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Ticker';
        $response = $this->$method (array_merge ($request, $params));
        $timestamp = intval ($response['date']) * 1000;
        $ticker = array_merge ($response['ticker'], array ( 'timestamp' => $timestamp ));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'info' => $trade,
            'timestamp' => $trade['date_ms'],
            'datetime' => $this->iso8601 ($trade['date_ms']),
            'symbol' => $symbol,
            'id' => $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Trades';
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_trades ($response, $market);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = 1440, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
            'type' => $this->timeframes[$timeframe],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Kline';
        if ($limit)
            $request['size'] = intval ($limit);
        if ($since) {
            $request['since'] = $since;
        } else {
            $request['since'] = $this->milliseconds () - 86400000; // last 24 hours
        }
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostUserinfo ();
        $balances = $response['info']['funds'];
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $account['free'] = $this->safe_float ($balances['free'], $lowercase, 0.0);
            $account['used'] = $this->safe_float ($balances['freezed'], $lowercase, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $order = array (
            'symbol' => $market['id'],
            'type' => $side,
        );
        if ($market['future']) {
            $method .= 'Future';
            $order = array_merge ($order, array (
                'contract_type' => 'this_week', // next_week, quarter
                'match_price' => 0, // match best counter party $price? 0 or 1, ignores $price if 1
                'lever_rate' => 10, // leverage rate value => 10 or 20 (10 by default)
                'price' => $price,
                'amount' => $amount,
            ));
        } else {
            if ($type == 'limit') {
                $order['price'] = $price;
                $order['amount'] = $amount;
            } else {
                $order['type'] .= '_market';
                if ($side == 'buy') {
                    $order['price'] = $this->safe_float ($params, 'cost');
                    if (!$order['price'])
                        throw new ExchangeError ($this->id . ' $market buy orders require an additional cost parameter, cost = $price * amount');
                } else {
                    $order['amount'] = $amount;
                }
            }
        }
        $params = $this->omit ($params, 'cost');
        $method .= 'Trade';
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder() requires a $symbol argument');
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'order_id' => $id,
        );
        $method = 'privatePost';
        if ($market['future']) {
            $method .= 'FutureCancel';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        } else {
            $method .= 'CancelOrder';
        }
        $response = $this->$method (array_merge ($request, $params));
        return $response;
    }

    public function getOrderStatus ($status) {
        if ($status == -1)
            return 'canceled';
        if ($status == 0)
            return 'open';
        if ($status == 1)
            return 'partial';
        if ($status == 2)
            return 'closed';
        if ($status == 4)
            return 'canceled';
        return $status;
    }

    public function parse_order ($order, $market = null) {
        $side = null;
        $type = null;
        if (array_key_exists ('type', $order)) {
            if (($order['type'] == 'buy') || ($order['type'] == 'sell')) {
                $side = $order['type'];
                $type = 'limit';
            } else {
                $side = ($order['type'] == 'buy_market') ? 'buy' : 'sell';
                $type = 'market';
            }
        }
        $status = $this->getOrderStatus ($order['status']);
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('symbol', $order))
                if (array_key_exists ($order['symbol'], $this->markets_by_id))
                    $market = $this->markets_by_id[$order['symbol']];
        }
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = null;
        if (array_key_exists ('create_date', $order))
            $timestamp = $order['create_date'];
        $amount = $order['amount'];
        $filled = $order['deal_amount'];
        $remaining = $amount - $filled;
        $average = $order['avg_price'];
        $cost = $average * $filled;
        $result = array (
            'info' => $order,
            'id' => $order['order_id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $order['price'],
            'average' => $average,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . 'fetchOrders requires a $symbol parameter');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $request = array (
            'order_id' => $id,
            'symbol' => $market['id'],
            // 'status' => 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page' => 1, // current page number
            // 'page_length' => 200, // number of orders returned per page, maximum 200
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'OrderInfo';
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_order ($response['orders'][0]);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . 'fetchOrders requires a $symbol parameter');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $request = array (
            'symbol' => $market['id'],
        );
        $order_id_in_params = (array_key_exists ('order_id', $params));
        if ($market['future']) {
            $method .= 'FutureOrdersInfo';
            $request['contract_type'] = 'this_week'; // next_week, quarter
            if (!$order_id_in_params)
                throw new ExchangeError ($this->id . ' fetchOrders() requires order_id param for futures $market ' . $symbol . ' (a string of one or more order ids, comma-separated)');
        } else {
            $type = $this->safe_value ($params, 'type');
            $status = $this->safe_value ($params, 'status');
            if ($type) {
                $status = $params['type'];
            } else if ($status) {
                $status = $params['status'];
            } else {
                throw new ExchangeError ($this->id . ' fetchOrders() requires $type param or $status param for spot $market ' . $symbol . ' (0 or "open" for unfilled orders, 1 or "closed" for filled orders)');
            }
            if ($status == 'open')
                $status = 0;
            if ($status == 'closed')
                $status = 1;
            if ($order_id_in_params) {
                $method .= 'OrdersInfo';
                $request = array_merge ($request, array (
                    'type' => $status,
                ));
            } else {
                $method .= 'OrderHistory';
                $request = array_merge ($request, array (
                    'status' => $status,
                    'current_page' => 1, // current page number
                    'page_length' => 200, // number of orders returned per page, maximum 200
                ));
            }
            $params = $this->omit ($params, array ('type', 'status'));
        }
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_orders ($response['orders'], $market);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $open = 0; // 0 for unfilled orders, 1 for filled orders
        return $this->fetch_orders ($symbol, array_merge (array (
            'status' => $open,
        ), $params));
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $closed = 1; // 0 for unfilled orders, 1 for filled orders
        return $this->fetch_orders ($symbol, array_merge (array (
            'status' => $closed,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/';
        if ($api != 'web')
            $url .= $this->version . '/';
        $url .= $path . $this->extension;
        if ($api == 'private') {
            $query = $this->keysort (array_merge (array (
                'api_key' => $this->apiKey,
            ), $params));
            // secret key must be at the end of $query
            $queryString = $this->rawencode ($query) . '&secret_key=' . $this->secret;
            $query['sign'] = strtoupper ($this->hash ($this->encode ($queryString)));
            $body = $this->urlencode ($query);
            $headers = array ( 'Content-Type' => 'application/x-www-form-urlencoded' );
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        $url = $this->urls['api'][$api] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if (!$response['result'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class allcoin extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'allcoin',
            'name' => 'Allcoin',
            'countries' => 'CA',
            'hasCORS' => false,
            'extension' => '',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
                'api' => array (
                    'web' => 'https://allcoin.com',
                    'public' => 'https://api.allcoin.com/api',
                    'private' => 'https://api.allcoin.com/api',
                ),
                'www' => 'https://allcoin.com',
                'doc' => 'https://allcoin.com/About/APIReference',
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'marketoverviews/',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'depth',
                        'kline',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'batch_trade',
                        'cancel_order',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'repayment',
                        'trade',
                        'trade_history',
                        'userinfo',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $currencies = array ('BTC', 'ETH', 'USD', 'QTUM');
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $response = $this->webGetMarketoverviews (array (
                'type' => 'full',
                'secondary' => $currency,
            ));
            $markets = $response['Markets'];
            for ($k = 0; $k < count ($markets); $k++) {
                $market = $markets[$k];
                $base = $market['Primary'];
                $quote = $market['Secondary'];
                $id = strtolower ($base) . '_' . strtolower ($quote);
                $symbol = $base . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'type' => 'spot',
                    'spot' => true,
                    'future' => false,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function getOrderStatus ($status) {
        if ($status == -1)
            return 'canceled';
        if ($status == 0)
            return 'open';
        if ($status == 1)
            return 'partial';
        if ($status == 2)
            return 'closed';
        if ($status == 10)
            return 'canceled';
        return $status;
    }
}

// -----------------------------------------------------------------------------

class anxpro extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'anxpro',
            'name' => 'ANXPro',
            'countries' => array ( 'JP', 'SG', 'HK', 'NZ' ),
            'version' => '2',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTrades' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api' => 'https://anxpro.com/api',
                'www' => 'https://anxpro.com',
                'doc' => array (
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ),
                ),
                'private' => array (
                    'post' => array (
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'BTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/HKD' => array ( 'id' => 'BTCHKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/CAD' => array ( 'id' => 'BTCCAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/AUD' => array ( 'id' => 'BTCAUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'BTC/SGD' => array ( 'id' => 'BTCSGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/JPY' => array ( 'id' => 'BTCJPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
                'BTC/GBP' => array ( 'id' => 'BTCGBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP' ),
                'BTC/NZD' => array ( 'id' => 'BTCNZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'DOGE/BTC' => array ( 'id' => 'DOGEBTC', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'STR/BTC' => array ( 'id' => 'STRBTC', 'symbol' => 'STR/BTC', 'base' => 'STR', 'quote' => 'BTC' ),
                'XRP/BTC' => array ( 'id' => 'XRPBTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostMoneyInfo ();
        $balance = $response['data'];
        $currencies = array_keys ($balance['Wallets']);
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance['Wallets'])) {
                $wallet = $balance['Wallets'][$currency];
                $account['free'] = floatval ($wallet['Available_Balance']['value']);
                $account['total'] = floatval ($wallet['Balance']['value']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetCurrencyPairMoneyDepthFull (array_merge (array (
            'currency_pair' => $this->market_id ($symbol),
        ), $params));
        $orderbook = $response['data'];
        $t = intval ($orderbook['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetCurrencyPairMoneyTicker (array_merge (array (
            'currency_pair' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['data'];
        $t = intval ($ticker['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        $bid = $this->safe_float ($ticker['buy'], 'value');
        $ask = $this->safe_float ($ticker['sell'], 'value');;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']['value']),
            'low' => floatval ($ticker['low']['value']),
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => floatval ($ticker['vwap']['value']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']['value']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['avg']['value']),
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']['value']),
        );
    }

    public function fetch_trades ($market, $params = array ()) {
        throw new ExchangeError ($this->id . ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/$market-data/currencypairmoneytradefetch-disabled');
        return $this->publicGetCurrencyPairMoneyTradeFetch (array_merge (array (
            'currency_pair' => $this->market_id ($market),
        ), $params));
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'currency_pair' => $this->market_id ($market),
            'amount_int' => intval ($amount * 100000000), // 10^8
            'type' => $side,
        );
        if ($type == 'limit')
            $order['price_int'] = intval ($price * 100000); // 10^5
        $result = $this->privatePostCurrencyPairOrderAdd (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['data']
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCurrencyPairOrderCancel (array ( 'oid' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostMoneyCurrencySendSimple (array_merge (array (
            'currency' => $currency,
            'amount_int' => intval ($amount * 100000000), // 10^8
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['data']['transactionId'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $query));
            $secret = base64_decode ($this->secret);
            $auth = $request . "\0" . $body;
            $signature = $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Rest-Key' => $this->apiKey,
                'Rest-Sign' => $this->decode ($signature),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] == 'success')
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class binance extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'binance',
            'name' => 'Binance',
            'countries' => 'CN', // China
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'hasFetchMyTrades' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'timeframes' => array (
                '1m' => '1m',
                '3m' => '3m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '2h' => '2h',
                '4h' => '4h',
                '6h' => '6h',
                '8h' => '8h',
                '12h' => '12h',
                '1d' => '1d',
                '3d' => '3d',
                '1w' => '1w',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api' => array (
                    'web' => 'https://www.binance.com',
                    'public' => 'https://www.binance.com/api',
                    'private' => 'https://www.binance.com/api',
                ),
                'www' => 'https://www.binance.com',
                'doc' => 'https://www.binance.com/restapipub.html',
                'fees' => 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'exchange/public/product',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ),
                    'post' => array (
                        'order',
                        'order/test',
                        'userDataStream',
                    ),
                    'put' => array (
                        'userDataStream'
                    ),
                    'delete' => array (
                        'order',
                        'userDataStream',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.001,
                    'maker' => 0.001,
                ),
                'funding' => array (
                    'withdraw' => array (
                        'BNB' => 1.0,
                        'BTC' => 0.0005,
                        'ETH' => 0.005,
                        'LTC' => 0.001,
                        'NEO' => 0.0,
                        'QTUM' => 0.1,
                        'SNT' => 1.0,
                        'EOS' => 0.1,
                        'BCC' => null,
                        'GAS' => 0.0,
                        'USDT' => 5.0,
                        'HSR' => 0.0001,
                        'OAX' => 0.1,
                        'DNT' => 1.0,
                        'MCO' => 0.1,
                        'ICN' => 0.1,
                        'WTC' => 0.1,
                        'OMG' => 0.1,
                        'ZRX' => 1.0,
                        'STRAT' => 0.1,
                        'SNGLS' => 1.0,
                        'BQX' => 1.0,
                    ),
                ),
            ),
            'precision' => array (
                'amount' => 6,
                'price' => 6,
            ),
            'markets' => array (
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BNB/BTC' => array ( 'id' => 'BNBBTC', 'symbol' => 'BNB/BTC', 'base' => 'BNB', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'NEO/BTC' => array ( 'id' => 'NEOBTC', 'symbol' => 'NEO/BTC', 'base' => 'NEO', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'GAS/BTC' => array ( 'id' => 'GASBTC', 'symbol' => 'GAS/BTC', 'base' => 'GAS', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BCC/BTC' => array ( 'id' => 'BCCBTC', 'symbol' => 'BCC/BTC', 'base' => 'BCC', 'quote' => 'BTC', 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'MCO/BTC' => array ( 'id' => 'MCOBTC', 'symbol' => 'MCO/BTC', 'base' => 'MCO', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'WTC/BTC' => array ( 'id' => 'WTCBTC', 'symbol' => 'WTC/BTC', 'base' => 'WTC', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'OMG/BTC' => array ( 'id' => 'OMGBTC', 'symbol' => 'OMG/BTC', 'base' => 'OMG', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'ZRX/BTC' => array ( 'id' => 'ZRXBTC', 'symbol' => 'ZRX/BTC', 'base' => 'ZRX', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BQX/BTC' => array ( 'id' => 'BQXBTC', 'symbol' => 'BQX/BTC', 'base' => 'BQX', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'KNC/BTC' => array ( 'id' => 'KNCBTC', 'symbol' => 'KNC/BTC', 'base' => 'KNC', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'FUN/BTC' => array ( 'id' => 'FUNBTC', 'symbol' => 'FUN/BTC', 'base' => 'FUN', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SNM/BTC' => array ( 'id' => 'SNMBTC', 'symbol' => 'SNM/BTC', 'base' => 'SNM', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'XVG/BTC' => array ( 'id' => 'XVGBTC', 'symbol' => 'XVG/BTC', 'base' => 'XVG', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'CTR/BTC' => array ( 'id' => 'CTRBTC', 'symbol' => 'CTR/BTC', 'base' => 'CTR', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BNB/ETH' => array ( 'id' => 'BNBETH', 'symbol' => 'BNB/ETH', 'base' => 'BNB', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNT/ETH' => array ( 'id' => 'SNTETH', 'symbol' => 'SNT/ETH', 'base' => 'SNT', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BNT/ETH' => array ( 'id' => 'BNTETH', 'symbol' => 'BNT/ETH', 'base' => 'BNT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'EOS/ETH' => array ( 'id' => 'EOSETH', 'symbol' => 'EOS/ETH', 'base' => 'EOS', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'OAX/ETH' => array ( 'id' => 'OAXETH', 'symbol' => 'OAX/ETH', 'base' => 'OAX', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'DNT/ETH' => array ( 'id' => 'DNTETH', 'symbol' => 'DNT/ETH', 'base' => 'DNT', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'MCO/ETH' => array ( 'id' => 'MCOETH', 'symbol' => 'MCO/ETH', 'base' => 'MCO', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'ICN/ETH' => array ( 'id' => 'ICNETH', 'symbol' => 'ICN/ETH', 'base' => 'ICN', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'WTC/ETH' => array ( 'id' => 'WTCETH', 'symbol' => 'WTC/ETH', 'base' => 'WTC', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'OMG/ETH' => array ( 'id' => 'OMGETH', 'symbol' => 'OMG/ETH', 'base' => 'OMG', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'ZRX/ETH' => array ( 'id' => 'ZRXETH', 'symbol' => 'ZRX/ETH', 'base' => 'ZRX', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BQX/ETH' => array ( 'id' => 'BQXETH', 'symbol' => 'BQX/ETH', 'base' => 'BQX', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'KNC/ETH' => array ( 'id' => 'KNCETH', 'symbol' => 'KNC/ETH', 'base' => 'KNC', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'FUN/ETH' => array ( 'id' => 'FUNETH', 'symbol' => 'FUN/ETH', 'base' => 'FUN', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNM/ETH' => array ( 'id' => 'SNMETH', 'symbol' => 'SNM/ETH', 'base' => 'SNM', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'NEO/ETH' => array ( 'id' => 'NEOETH', 'symbol' => 'NEO/ETH', 'base' => 'NEO', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'XVG/ETH' => array ( 'id' => 'XVGETH', 'symbol' => 'XVG/ETH', 'base' => 'XVG', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'CTR/ETH' => array ( 'id' => 'CTRETH', 'symbol' => 'CTR/ETH', 'base' => 'CTR', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'QTUM/BTC' => array ( 'id' => 'QTUMBTC', 'symbol' => 'QTUM/BTC', 'base' => 'QTUM', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'LINK/BTC' => array ( 'id' => 'LINKBTC', 'symbol' => 'LINK/BTC', 'base' => 'LINK', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SALT/BTC' => array ( 'id' => 'SALTBTC', 'symbol' => 'SALT/BTC', 'base' => 'SALT', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'IOTA/BTC' => array ( 'id' => 'IOTABTC', 'symbol' => 'IOTA/BTC', 'base' => 'IOTA', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'QTUM/ETH' => array ( 'id' => 'QTUMETH', 'symbol' => 'QTUM/ETH', 'base' => 'QTUM', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'LINK/ETH' => array ( 'id' => 'LINKETH', 'symbol' => 'LINK/ETH', 'base' => 'LINK', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SALT/ETH' => array ( 'id' => 'SALTETH', 'symbol' => 'SALT/ETH', 'base' => 'SALT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'IOTA/ETH' => array ( 'id' => 'IOTAETH', 'symbol' => 'IOTA/ETH', 'base' => 'IOTA', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BTC/USDT' => array ( 'id' => 'BTCUSDT', 'symbol' => 'BTC/USDT', 'base' => 'BTC', 'quote' => 'USDT', 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ), 'cost' => array ( 'min' => 1, 'max' => null ))),
                'ETH/USDT' => array ( 'id' => 'ETHUSDT', 'symbol' => 'ETH/USDT', 'base' => 'ETH', 'quote' => 'USDT', 'lot' => 0.00001, 'limits' => array ( 'amount' => array ( 'min' => 0.00001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ), 'cost' => array ( 'min' => 1, 'max' => null ))),
                'STRAT/ETH' => array ( 'id' => 'STRATETH', 'symbol' => 'STRAT/ETH', 'base' => 'STRAT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNGLS/ETH' => array ( 'id' => 'SNGLSETH', 'symbol' => 'SNGLS/ETH', 'base' => 'SNGLS', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'STRAT/BTC' => array ( 'id' => 'STRATBTC', 'symbol' => 'STRAT/BTC', 'base' => 'STRAT', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SNGLS/BTC' => array ( 'id' => 'SNGLSBTC', 'symbol' => 'SNGLS/BTC', 'base' => 'SNGLS', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
            ),
        ), $options));
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $key = 'quote';
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision ($symbol, $amount * $rate));
        if ($side == 'sell') {
            $cost *= $price;
        } else {
            $key = 'base';
        }
        return array (
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => floatval ($this->fee_to_precision ($symbol, $cost)),
        );
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetAccount ($params);
        $result = array ( 'info' => $response );
        $balances = $response['balances'];
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $asset = $balance['asset'];
            $currency = $this->common_currency_code ($asset);
            $account = array (
                'free' => floatval ($balance['free']),
                'used' => floatval ($balance['locked']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'symbol' => $market['id'],
            'limit' => 100, // default = maximum = 100
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market) {
        $timestamp = $ticker['closeTime'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['highPrice']),
            'low' => floatval ($ticker['lowPrice']),
            'bid' => floatval ($ticker['bidPrice']),
            'ask' => floatval ($ticker['askPrice']),
            'vwap' => floatval ($ticker['weightedAvgPrice']),
            'open' => floatval ($ticker['openPrice']),
            'close' => floatval ($ticker['prevClosePrice']),
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => floatval ($ticker['priceChangePercent']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => floatval ($ticker['quoteVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTicker24hr (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker ($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[5]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'interval' => $this->timeframes[$timeframe],
        );
        $request['limit'] = ($limit) ? $limit : 500; // default == max == 500
        if ($since)
            $request['startTime'] = $since;
        $response = $this->publicGetKlines (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestampField = (array_key_exists ('T', $trade)) ? 'T' : 'time';
        $timestamp = $trade[$timestampField];
        $priceField = (array_key_exists ('p', $trade)) ? 'p' : 'price';
        $price = floatval ($trade[$priceField]);
        $amountField = (array_key_exists ('q', $trade)) ? 'q' : 'qty';
        $amount = floatval ($trade[$amountField]);
        $idField = (array_key_exists ('a', $trade)) ? 'a' : 'id';
        $id = (string) $trade[$idField];
        $side = null;
        $order = null;
        if (array_key_exists ('orderId', $trade))
            $order = (string) $trade['orderId'];
        if (array_key_exists ('m', $trade)) {
            $side = 'sell';
            if ($trade['m'])
                $side = 'buy';
        } else {
            $side = ($trade['isBuyer']) ? 'buy' : 'sell';
        }
        $fee = null;
        if (array_key_exists ('commission', $trade)) {
            $fee = array (
                'cost' => floatval ($trade['commission']),
                'currency' => $trade['commissionAsset'],
            );
        }
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => $id,
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetAggTrades (array_merge (array (
            'symbol' => $market['id'],
            // 'fromId' => 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime' => 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime' => 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            'limit' => 500,        // default = maximum = 500
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function parse_order_status ($status) {
        if ($status == 'NEW')
            return 'open';
        if ($status == 'PARTIALLY_FILLED')
            return 'partial';
        if ($status == 'FILLED')
            return 'closed';
        if ($status == 'CANCELED')
            return 'canceled';
        return strtolower ($status);
    }

    public function parse_order ($order, $market = null) {
        $status = $this->parse_order_status ($order['status']);
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $id = $order['symbol'];
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
        }
        $timestamp = $order['time'];
        $price = floatval ($order['price']);
        $amount = floatval ($order['origQty']);
        $filled = $this->safe_float ($order, 'executedQty', 0.0);
        $remaining = max ($amount - $filled, 0.0);
        $result = array (
            'info' => $order,
            'id' => (string) $order['orderId'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => strtolower ($order['type']),
            'side' => strtolower ($order['side']),
            'price' => $price,
            'amount' => $amount,
            'cost' => $price * $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $order = array (
            'symbol' => $market['id'],
            'quantity' => $this->amount_to_precision ($symbol, $amount),
            'type' => strtoupper ($type),
            'side' => strtoupper ($side),
        );
        if ($type == 'limit') {
            $order = array_merge ($order, array (
                'price' => $this->price_to_precision ($symbol, $price),
                'timeInForce' => 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            ));
        }
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['orderId'],
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrder requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetOrder (array_merge (array (
            'symbol' => $market['id'],
            'orderId' => intval ($id),
        ), $params));
        return $this->parse_order ($response, $market);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetAllOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_orders ($response, $market);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetOpenOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_orders ($response, $market);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $symbol param');
        $market = $this->market ($symbol);
        $response = null;
        try {
            $response = $this->privateDeleteOrder (array_merge (array (
                'symbol' => $market['id'],
                'orderId' => intval ($id),
                // 'origClientOrderId' => $id,
            ), $params));
        } catch (Exception $e) {
            if (mb_strpos ($this->last_http_response, 'UNKNOWN_ORDER') !== false)
                throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            throw $e;
        }
        return $response;
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchMyTrades requires a symbol');
        $market = $this->market ($symbol);
        $response = $this->privateGetMyTrades (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api != 'web')
            $url .= '/' . $this->version;
        $url .= '/' . $path;
        if ($api == 'private') {
            $nonce = $this->nonce ();
            $query = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $auth = $this->secret . '|' . $query;
            $signature = $this->hash ($this->encode ($auth), 'sha256');
            $query .= '&' . 'signature=' . $signature;
            $headers = array (
                'X-MBX-APIKEY' => $this->apiKey,
            );
            if ($method == 'GET') {
                $url .= '?' . $query;
            } else {
                $body = $query;
                $headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('code', $response)) {
            if ($response['code'] < 0) {
                if ($response['code'] == -2010)
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                if ($response['code'] == -2011)
                    throw new OrderNotFound ($this->id . ' ' . $this->json ($response));
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bit2c extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bit2c',
            'name' => 'Bit2C',
            'countries' => 'IL', // Israel
            'rateLimit' => 3000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
                'api' => 'https://www.bit2c.co.il',
                'www' => 'https://www.bit2c.co.il',
                'doc' => array (
                    'https://www.bit2c.co.il/home/api',
                    'https://github.com/OferE/bit2c',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'Exchanges/{pair}/Ticker',
                        'Exchanges/{pair}/orderbook',
                        'Exchanges/{pair}/trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'Account/Balance',
                        'Account/Balance/v2',
                        'Merchant/CreateCheckout',
                        'Order/AccountHistory',
                        'Order/AddCoinFundsRequest',
                        'Order/AddFund',
                        'Order/AddOrder',
                        'Order/AddOrderMarketPriceBuy',
                        'Order/AddOrderMarketPriceSell',
                        'Order/CancelOrder',
                        'Order/MyOrders',
                        'Payment/GetMyId',
                        'Payment/Send',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/NIS' => array ( 'id' => 'BtcNis', 'symbol' => 'BTC/NIS', 'base' => 'BTC', 'quote' => 'NIS' ),
                'BCH/NIS' => array ( 'id' => 'BchNis', 'symbol' => 'BCH/NIS', 'base' => 'BCH', 'quote' => 'NIS' ),
                'LTC/NIS' => array ( 'id' => 'LtcNis', 'symbol' => 'LTC/NIS', 'base' => 'LTC', 'quote' => 'NIS' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostAccountBalanceV2 ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance)) {
                $available = 'AVAILABLE_' . $currency;
                $account['free'] = $balance[$available];
                $account['total'] = $balance[$currency];
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetExchangesPairOrderbook (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetExchangesPairTicker (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['h']),
            'ask' => floatval ($ticker['l']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['ll']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['av']),
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['a']),
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = intval ($trade['date']) * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetExchangesPairTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePostOrderAddOrder';
        $order = array (
            'Amount' => $amount,
            'Pair' => $this->market_id ($symbol),
        );
        if ($type == 'market') {
            $method .= 'MarketPrice' . $this->capitalize ($side);
        } else {
            $order['Price'] = $price;
            $order['Total'] = $amount * $price;
            $order['IsBid'] = ($side == 'buy');
        }
        $result = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['NewOrder']['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostOrderCancelOrder (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        if ($api == 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ( 'nonce' => $nonce ), $params);
            $body = $this->urlencode ($query);
            $signature = $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512', 'base64');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sign' => $this->decode ($signature),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bitbay extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitbay',
            'name' => 'BitBay',
            'countries' => array ( 'PL', 'EU' ), // Poland
            'rateLimit' => 1000,
            'hasCORS' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www' => 'https://bitbay.net',
                'api' => array (
                    'public' => 'https://bitbay.net/API/Public',
                    'private' => 'https://bitbay.net/API/Trading/tradingApi.php',
                ),
                'doc' => array (
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'BTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/PLN' => array ( 'id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'LTC/USD' => array ( 'id' => 'LTCUSD', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ( 'id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ( 'id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'ETHUSD', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETH/EUR' => array ( 'id' => 'ETHEUR', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR' ),
                'ETH/PLN' => array ( 'id' => 'ETHPLN', 'symbol' => 'ETH/PLN', 'base' => 'ETH', 'quote' => 'PLN' ),
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'LSK/USD' => array ( 'id' => 'LSKUSD', 'symbol' => 'LSK/USD', 'base' => 'LSK', 'quote' => 'USD' ),
                'LSK/EUR' => array ( 'id' => 'LSKEUR', 'symbol' => 'LSK/EUR', 'base' => 'LSK', 'quote' => 'EUR' ),
                'LSK/PLN' => array ( 'id' => 'LSKPLN', 'symbol' => 'LSK/PLN', 'base' => 'LSK', 'quote' => 'PLN' ),
                'LSK/BTC' => array ( 'id' => 'LSKBTC', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostInfo ();
        if (array_key_exists ('balances', $response)) {
            $balance = $response['balances'];
            $result = array ( 'info' => $balance );
            for ($c = 0; $c < count ($this->currencies); $c++) {
                $currency = $this->currencies[$c];
                $account = $this->account ();
                if (array_key_exists ($currency, $balance)) {
                    $account['free'] = floatval ($balance[$currency]['available']);
                    $account['used'] = floatval ($balance[$currency]['locked']);
                    $account['total'] = $this->sum ($account['free'], $account['used']);
                }
                $result[$currency] = $account;
            }
            return $this->parse_balance ($result);
        }
        throw new ExchangeError ($this->id . ' empty $balance $response ' . $this->json ($response));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetIdOrderbook (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetIdTicker (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['max']),
            'low' => floatval ($ticker['min']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['average']),
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        return $this->privatePostTrade (array_merge (array (
            'type' => $side,
            'currency' => $market['base'],
            'amount' => $amount,
            'payment_currency' => $market['quote'],
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function isFiat ($currency) {
        $fiatCurrencies = array (
            'USD' => true,
            'EUR' => true,
            'PLN' => true,
        );
        if (array_key_exists ($currency, $fiatCurrencies))
            return true;
        return false;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $method = null;
        $request = array (
            'currency' => $currency,
            'quantity' => $amount,
        );
        if ($this->isFiat ($currency)) {
            $method = 'privatePostWithdraw';
            // $request['account'] = $params['account']; // they demand an account number
            // $request['express'] = $params['express']; // whatever it means, they don't explain
            // $request['bic'] = '';
        } else {
            $method = 'privatePostTransfer';
            $request['address'] = $address;
        }
        $response = $this->$method (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params ($path, $params) . '.json';
        } else {
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'moment' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'API-Key' => $this->apiKey,
                'API-Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bitcoincoid extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitcoincoid',
            'name' => 'Bitcoin.co.id',
            'countries' => 'ID', // Indonesia
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api' => array (
                    'public' => 'https://vip.bitcoin.co.id/api',
                    'private' => 'https://vip.bitcoin.co.id/tapi',
                ),
                'www' => 'https://www.bitcoin.co.id',
                'doc' => array (
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                    'https://vip.bitcoin.co.id/trade_api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'openOrders',
                        'cancelOrder',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/IDR' => array ( 'id' => 'btc_idr', 'symbol' => 'BTC/IDR', 'base' => 'BTC', 'quote' => 'IDR', 'baseId' => 'btc', 'quoteId' => 'idr' ),
                'BCH/IDR' => array ( 'id' => 'bch_idr', 'symbol' => 'BCH/IDR', 'base' => 'BCH', 'quote' => 'IDR', 'baseId' => 'bch', 'quoteId' => 'idr' ),
                'ETH/IDR' => array ( 'id' => 'eth_idr', 'symbol' => 'ETH/IDR', 'base' => 'ETH', 'quote' => 'IDR', 'baseId' => 'eth', 'quoteId' => 'idr' ),
                'ETC/IDR' => array ( 'id' => 'etc_idr', 'symbol' => 'ETC/IDR', 'base' => 'ETC', 'quote' => 'IDR', 'baseId' => 'etc', 'quoteId' => 'idr' ),
                'XRP/IDR' => array ( 'id' => 'xrp_idr', 'symbol' => 'XRP/IDR', 'base' => 'XRP', 'quote' => 'IDR', 'baseId' => 'xrp', 'quoteId' => 'idr' ),
                'XZC/IDR' => array ( 'id' => 'xzc_idr', 'symbol' => 'XZC/IDR', 'base' => 'XZC', 'quote' => 'IDR', 'baseId' => 'xzc', 'quoteId' => 'idr' ),
                'BTS/BTC' => array ( 'id' => 'bts_btc', 'symbol' => 'BTS/BTC', 'base' => 'BTS', 'quote' => 'BTC', 'baseId' => 'bts', 'quoteId' => 'btc' ),
                'DASH/BTC' => array ( 'id' => 'drk_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC', 'baseId' => 'drk', 'quoteId' => 'btc' ),
                'DOGE/BTC' => array ( 'id' => 'doge_btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC', 'baseId' => 'doge', 'quoteId' => 'btc' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'baseId' => 'eth', 'quoteId' => 'btc' ),
                'LTC/BTC' => array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'baseId' => 'ltc', 'quoteId' => 'btc' ),
                'NXT/BTC' => array ( 'id' => 'nxt_btc', 'symbol' => 'NXT/BTC', 'base' => 'NXT', 'quote' => 'BTC', 'baseId' => 'nxt', 'quoteId' => 'btc' ),
                'XLM/BTC' => array ( 'id' => 'str_btc', 'symbol' => 'XLM/BTC', 'base' => 'XLM', 'quote' => 'BTC', 'baseId' => 'str', 'quoteId' => 'btc' ),
                'XEM/BTC' => array ( 'id' => 'nem_btc', 'symbol' => 'XEM/BTC', 'base' => 'XEM', 'quote' => 'BTC', 'baseId' => 'nem', 'quoteId' => 'btc' ),
                'XRP/BTC' => array ( 'id' => 'xrp_btc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC', 'baseId' => 'xrp', 'quoteId' => 'btc' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGetInfo ();
        $balance = $response['return'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $account['free'] = $this->safe_float ($balance['balance'], $lowercase, 0.0);
            $account['used'] = $this->safe_float ($balance['balance_hold'], $lowercase, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetPairDepth (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'buy', 'sell');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetPairTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = floatval ($ticker['server_time']) * 1000;
        $baseVolume = 'vol_' . strtolower ($market['baseId']);
        $quoteVolume = 'vol_' . strtolower ($market['quoteId']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker[$baseVolume]),
            'quoteVolume' => floatval ($ticker[$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetPairTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $order = array (
            'pair' => $market['id'],
            'type' => $side,
            'price' => $price,
        );
        $base = $market['baseId'];
        $order[$base] = $amount;
        $result = $this->privatePostTrade (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => (string) $result['return']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params ($path, $params);
        } else {
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $response['error']);
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bitfinex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitfinex',
            'name' => 'Bitfinex',
            'countries' => 'US',
            'version' => 'v1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'hasFetchTickers' => false,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '1m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '3h' => '3h',
                '6h' => '6h',
                '12h' => '12h',
                '1d' => '1D',
                '1w' => '7D',
                '2w' => '14D',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'doc' => array (
                    'https://bitfinex.readme.io/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ),
            ),
            'api' => array (
                'v2' => array (
                    'get' => array (
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'book/{symbol}',
                        // 'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'today',
                        'trades/{symbol}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'account_infos',
                        'balances',
                        'basket_manage',
                        'credits',
                        'deposit/new',
                        'funding/close',
                        'history',
                        'history/movements',
                        'key_info',
                        'margin_infos',
                        'mytrades',
                        'mytrades_funding',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'offers/hist',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'orders/hist',
                        'position/claim',
                        'positions',
                        'summary',
                        'taken_funds',
                        'total_taken_funds',
                        'transfer',
                        'unused_taken_funds',
                        'withdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        // issue #4 Bitfinex names Dash as DSH, instead of DASH
        if ($currency == 'DSH')
            return 'DASH';
        if ($currency == 'QTM')
            return 'QTUM';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbolsDetails ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = strtoupper ($market['pair']);
            $baseId = mb_substr ($id, 0, 3);
            $quoteId = mb_substr ($id, 3, 6);
            $base = $this->common_currency_code ($baseId);
            $quote = $this->common_currency_code ($quoteId);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'price' => $market['price_precision'],
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'info' => $market,
                'precision' => $precision,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostBalances ();
        $result = array ( 'info' => $balances );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            if ($balance['type'] == 'exchange') {
                $currency = $balance['currency'];
                $uppercase = strtoupper ($currency);
                $uppercase = $this->common_currency_code ($uppercase);
                $account = $this->account ();
                $account['free'] = floatval ($balance['available']);
                $account['total'] = floatval ($balance['amount']);
                $account['used'] = $account['total'] - $account['free'];
                $result[$uppercase] = $account;
            }
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $ticker = $this->publicGetPubtickerSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        $timestamp = floatval ($ticker['timestamp']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['mid']),
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['timestamp'] * 1000;
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $orderType = $type;
        if (($type == 'limit') || ($type == 'market'))
            $orderType = 'exchange ' . $type;
        $order = array (
            'symbol' => $this->market_id ($symbol),
            'amount' => (string) $amount,
            'side' => $side,
            'type' => $orderType,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        );
        if ($type == 'market') {
            $order['price'] = (string) $this->nonce ();
        } else {
            $order['price'] = (string) $price;
        }
        $result = $this->privatePostOrderNew (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => (string) $result['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostOrderCancel (array ( 'order_id' => intval ($id) ));
    }

    public function parse_order ($order, $market = null) {
        $side = $order['side'];
        $open = $order['is_live'];
        $canceled = $order['is_cancelled'];
        $status = null;
        if ($open) {
            $status = 'open';
        } else if ($canceled) {
            $status = 'canceled';
        } else {
            $status = 'closed';
        }
        $symbol = null;
        if (!$market) {
            $exchange = strtoupper ($order['symbol']);
            if (array_key_exists ($exchange, $this->markets_by_id)) {
                $market = $this->markets_by_id[$exchange];
            }
        }
        if ($market)
            $symbol = $market['symbol'];
        $orderType = $order['type'];
        $exchange = mb_strpos ($orderType, 'exchange ') !== false;
        if ($exchange) {
            list ($prefix, $orderType) = explode (' ', $order['type']);
        }
        $timestamp = intval (floatval ($order['timestamp']) * 1000);
        $result = array (
            'info' => $order,
            'id' => (string) $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $orderType,
            'side' => $side,
            'price' => floatval ($order['price']),
            'average' => floatval ($order['avg_execution_price']),
            'amount' => floatval ($order['original_amount']),
            'remaining' => floatval ($order['remaining_amount']),
            'filled' => floatval ($order['executed_amount']),
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOrders ($params);
        return $this->parse_orders ($response);
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOrdersHist (array_merge (array (
            'limit' => 100, // default 100
        ), $params));
        return $this->parse_orders ($response);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOrderStatus (array_merge (array (
            'order_id' => intval ($id),
        ), $params));
        return $this->parse_order ($response);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            $ohlcv[1],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[2],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $v2id = 't' . $market['id'];
        $request = array (
            'symbol' => $v2id,
            'timeframe' => $this->timeframes[$timeframe],
        );
        if ($limit)
            $request['limit'] = $limit;
        if ($since)
            $request['start'] = $since;
        $request = array_merge ($request, $params);
        $response = $this->v2GetCandlesTradeTimeframeSymbolHist ($request);
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function getCurrencyName ($currency) {
        if ($currency == 'BTC') {
            return 'bitcoin';
        } else if ($currency == 'LTC') {
            return 'litecoin';
        } else if ($currency == 'ETH') {
            return 'ethereum';
        } else if ($currency == 'ETC') {
            return 'ethereumc';
        } else if ($currency == 'OMNI') {
            return 'mastercoin'; // ???
        } else if ($currency == 'ZEC') {
            return 'zcash';
        } else if ($currency == 'XMR') {
            return 'monero';
        } else if ($currency == 'USD') {
            return 'wire';
        } else if ($currency == 'DASH') {
            return 'dash';
        } else if ($currency == 'XRP') {
            return 'ripple';
        } else if ($currency == 'EOS') {
            return 'eos';
        }
        throw new NotSupported ($this->id . ' ' . $currency . ' not supported for withdrawal');
    }

    public function deposit ($currency, $params = array ()) {
        $this->load_markets ();
        $name = $this->getCurrencyName ($currency);
        $request = array (
            'method' => $name,
            'wallet_name' => 'exchange',
            'renew' => 0, // a value of 1 will generate a new address
        );
        $response = $this->privatePostDepositNew (array_merge ($request, $params));
        return array (
            'info' => $response,
            'address' => $response['address'],
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $name = $this->getCurrencyName ($currency);
        $request = array (
            'withdraw_type' => $name,
            'walletselected' => 'exchange',
            'amount' => (string) $amount,
            'address' => $address,
        );
        $responses = $this->privatePostWithdraw (array_merge ($request, $params));
        $response = $responses[0];
        return array (
            'info' => $response,
            'id' => $response['withdrawal_id'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params ($path, $params);
        if ($api == 'v2') {
            $request = '/' . $api . $request;
        } else {
            $request = '/' . $this->version . $request;
        }
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'nonce' => (string) $nonce,
                'request' => $request,
            ), $query);
            $query = $this->json ($query);
            $query = $this->encode ($query);
            $payload = base64_encode ($query);
            $secret = $this->encode ($this->secret);
            $signature = $this->hmac ($payload, $secret, 'sha384');
            $headers = array (
                'X-BFX-APIKEY' => $this->apiKey,
                'X-BFX-PAYLOAD' => $this->decode ($payload),
                'X-BFX-SIGNATURE' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('message', $response)) {
            if (mb_strpos ($response['message'], 'not enough exchange balance') !== false)
                throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bitfinex2 extends bitfinex {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitfinex2',
            'name' => 'Bitfinex v2',
            'countries' => 'US',
            'version' => 'v2',
            'hasCORS' => true,
            'hasFetchTickers' => false, // true but at least one pair is required
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '1m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '3h' => '3h',
                '6h' => '6h',
                '12h' => '12h',
                '1d' => '1D',
                '1w' => '7D',
                '2w' => '14D',
                '1M' => '1M',
            ),
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'doc' => array (
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'platform/status',
                        'tickers', // replies with an empty list :\
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'symbols_details',
                        'stats1/{key}:{size}:{symbol}/{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/long/last',
                        'stats1/{key}:{size}:{symbol}/long/hist',
                        'stats1/{key}:{size}:{symbol}/short/last',
                        'stats1/{key}:{size}:{symbol}/short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ),
                    'post' => array (
                        'calc/trade/avg',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                    ),
                ),
            ),
            'markets' => array (
                'BCC/BTC' => array ( 'id' => 'tBCCBTC', 'symbol' => 'BCC/BTC', 'base' => 'BCC', 'quote' => 'BTC' ),
                'BCC/USD' => array ( 'id' => 'tBCCUSD', 'symbol' => 'BCC/USD', 'base' => 'BCC', 'quote' => 'USD' ),
                'BCH/BTC' => array ( 'id' => 'tBCHBTC', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC' ),
                'BCH/ETH' => array ( 'id' => 'tBCHETH', 'symbol' => 'BCH/ETH', 'base' => 'BCH', 'quote' => 'ETH' ),
                'BCH/USD' => array ( 'id' => 'tBCHUSD', 'symbol' => 'BCH/USD', 'base' => 'BCH', 'quote' => 'USD' ),
                'BCU/BTC' => array ( 'id' => 'tBCUBTC', 'symbol' => 'BCU/BTC', 'base' => 'BCU', 'quote' => 'BTC' ),
                'BCU/USD' => array ( 'id' => 'tBCUUSD', 'symbol' => 'BCU/USD', 'base' => 'BCU', 'quote' => 'USD' ),
                'BTC/USD' => array ( 'id' => 'tBTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'DASH/BTC' => array ( 'id' => 'tDSHBTC', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
                'DASH/USD' => array ( 'id' => 'tDSHUSD', 'symbol' => 'DASH/USD', 'base' => 'DASH', 'quote' => 'USD' ),
                'EOS/BTC' => array ( 'id' => 'tEOSBTC', 'symbol' => 'EOS/BTC', 'base' => 'EOS', 'quote' => 'BTC' ),
                'EOS/ETH' => array ( 'id' => 'tEOSETH', 'symbol' => 'EOS/ETH', 'base' => 'EOS', 'quote' => 'ETH' ),
                'EOS/USD' => array ( 'id' => 'tEOSUSD', 'symbol' => 'EOS/USD', 'base' => 'EOS', 'quote' => 'USD' ),
                'ETC/BTC' => array ( 'id' => 'tETCBTC', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC' ),
                'ETC/USD' => array ( 'id' => 'tETCUSD', 'symbol' => 'ETC/USD', 'base' => 'ETC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'tETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'tETHUSD', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'IOT/BTC' => array ( 'id' => 'tIOTBTC', 'symbol' => 'IOT/BTC', 'base' => 'IOT', 'quote' => 'BTC' ),
                'IOT/ETH' => array ( 'id' => 'tIOTETH', 'symbol' => 'IOT/ETH', 'base' => 'IOT', 'quote' => 'ETH' ),
                'IOT/USD' => array ( 'id' => 'tIOTUSD', 'symbol' => 'IOT/USD', 'base' => 'IOT', 'quote' => 'USD' ),
                'LTC/BTC' => array ( 'id' => 'tLTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LTC/USD' => array ( 'id' => 'tLTCUSD', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'OMG/BTC' => array ( 'id' => 'tOMGBTC', 'symbol' => 'OMG/BTC', 'base' => 'OMG', 'quote' => 'BTC' ),
                'OMG/ETH' => array ( 'id' => 'tOMGETH', 'symbol' => 'OMG/ETH', 'base' => 'OMG', 'quote' => 'ETH' ),
                'OMG/USD' => array ( 'id' => 'tOMGUSD', 'symbol' => 'OMG/USD', 'base' => 'OMG', 'quote' => 'USD' ),
                'RRT/BTC' => array ( 'id' => 'tRRTBTC', 'symbol' => 'RRT/BTC', 'base' => 'RRT', 'quote' => 'BTC' ),
                'RRT/USD' => array ( 'id' => 'tRRTUSD', 'symbol' => 'RRT/USD', 'base' => 'RRT', 'quote' => 'USD' ),
                'SAN/BTC' => array ( 'id' => 'tSANBTC', 'symbol' => 'SAN/BTC', 'base' => 'SAN', 'quote' => 'BTC' ),
                'SAN/ETH' => array ( 'id' => 'tSANETH', 'symbol' => 'SAN/ETH', 'base' => 'SAN', 'quote' => 'ETH' ),
                'SAN/USD' => array ( 'id' => 'tSANUSD', 'symbol' => 'SAN/USD', 'base' => 'SAN', 'quote' => 'USD' ),
                'XMR/BTC' => array ( 'id' => 'tXMRBTC', 'symbol' => 'XMR/BTC', 'base' => 'XMR', 'quote' => 'BTC' ),
                'XMR/USD' => array ( 'id' => 'tXMRUSD', 'symbol' => 'XMR/USD', 'base' => 'XMR', 'quote' => 'USD' ),
                'XRP/BTC' => array ( 'id' => 'tXRPBTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'XRP/USD' => array ( 'id' => 'tXRPUSD', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD' ),
                'ZEC/BTC' => array ( 'id' => 'tZECBTC', 'symbol' => 'ZEC/BTC', 'base' => 'ZEC', 'quote' => 'BTC' ),
                'ZEC/USD' => array ( 'id' => 'tZECUSD', 'symbol' => 'ZEC/USD', 'base' => 'ZEC', 'quote' => 'USD' ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        // issue #4 Bitfinex names Dash as DSH, instead of DASH
        if ($currency == 'DSH')
            return 'DASH';
        if ($currency == 'QTM')
            return 'QTUM';
        return $currency;
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostAuthRWallets ();
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($response); $b++) {
            $balance = $response[$b];
            list ($type, $currency, $total, $interest, $available) = $balance;
            if ($currency[0] == 't')
                $currency = mb_substr ($currency, 1);
            $uppercase = strtoupper ($currency);
            $uppercase = $this->common_currency_code ($uppercase);
            $account = $this->account ();
            $account['free'] = $available;
            $account['total'] = $total;
            if ($account['free'])
                $account['used'] = $account['total'] - $account['free'];
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetBookSymbolPrecision (array_merge (array (
            'symbol' => $this->market_id ($symbol),
            'precision' => 'R0',
        ), $params));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        for ($i = 0; $i < count ($orderbook); $i++) {
            $order = $orderbook[$i];
            $price = $order[1];
            $amount = $order[2];
            $side = ($amount > 0) ? 'bids' : 'asks';
            $amount = abs ($amount);
            $result[$side][] = array ($price, $amount);
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        list ($bid, $bidSize, $ask, $askSize, $change, $percentage, $last, $volume, $high, $low) = $ticker;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $high,
            'low' => $low,
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => $change,
            'percentage' => $percentage,
            'average' => null,
            'baseVolume' => $volume,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        list ($id, $timestamp, $amount, $price) = $trade;
        $side = ($amount < 0) ? 'sell' : 'buy';
        return array (
            'id' => (string) $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbolHist (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'timeframe' => $this->timeframes[$timeframe],
        );
        if ($limit)
            $request['limit'] = $limit;
        if ($since)
            $request['start'] = $since;
        $request = array_merge ($request, $params);
        $response = $this->publicGetCandlesTradeTimeframeSymbolHist ($request);
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported ($this->id . ' createOrder not implemented yet');
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' cancelOrder not implemented yet');
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetchOrder not implemented yet');
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        throw new NotSupported ($this->id . ' withdraw not implemented yet');
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . '/' . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->json ($query);
            $auth = '/api' . '/' . $request . $nonce . $body;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha384');
            $headers = array (
                'bfx-nonce' => $nonce,
                'bfx-apikey' => $this->apiKey,
                'bfx-signature' => $signature,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('message', $response)) {
            if (mb_strpos ($response['message'], 'not enough exchange balance') !== false)
                throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bitflyer extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitflyer',
            'name' => 'bitFlyer',
            'countries' => 'JP',
            'version' => 'v1',
            'rateLimit' => 500,
            'hasCORS' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api' => 'https://api.bitflyer.jp',
                'www' => 'https://bitflyer.jp',
                'doc' => 'https://bitflyer.jp/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'getmarkets',    // or 'markets'
                        'getboard',      // or 'board'
                        'getticker',     // or 'ticker'
                        'getexecutions', // or 'executions'
                        'gethealth',
                        'getchats',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'getpermissions',
                        'getbalance',
                        'getcollateral',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ),
                    'post' => array (
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['product_code'];
            $currencies = explode ('_', $id);
            $base = null;
            $quote = null;
            $symbol = $id;
            $numCurrencies = count ($currencies);
            if ($numCurrencies == 1) {
                $base = mb_substr ($symbol, 0, 3);
                $quote = mb_substr ($symbol, 3, 6);
            } else if ($numCurrencies == 2) {
                $base = $currencies[0];
                $quote = $currencies[1];
                $symbol = $base . '/' . $quote;
            } else {
                $base = $currencies[1];
                $quote = $currencies[2];
            }
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalance ();
        $balances = array ();
        for ($b = 0; $b < count ($response); $b++) {
            $account = $response[$b];
            $currency = $account['currency_code'];
            $balances[$currency] = $account;
        }
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balances)) {
                $account['total'] = $balances[$currency]['amount'];
                $account['free'] = $balances[$currency]['available'];
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetBoard (array_merge (array (
            'product_code' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'size');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $ticker = $this->publicGetTicker (array_merge (array (
            'product_code' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->parse8601 ($ticker['timestamp']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['best_bid']),
            'ask' => floatval ($ticker['best_ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['ltp']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_by_product']),
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $side = null;
        $order = null;
        if (array_key_exists ('side', $trade))
            if ($trade['side']) {
                $side = strtolower ($trade['side']);
                $id = $side . '_child_order_acceptance_id';
                if (array_key_exists ($id, $trade))
                    $order = $trade[$id];
            }
        $timestamp = $this->parse8601 ($trade['exec_date']);
        return array (
            'id' => (string) $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['size'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetExecutions (array_merge (array (
            'product_code' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'product_code' => $this->market_id ($symbol),
            'child_order_type' => strtoupper ($type),
            'side' => strtoupper ($side),
            'price' => $price,
            'size' => $amount,
        );
        $result = $this->privatePostSendchildorder (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['child_order_acceptance_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelchildorder (array_merge (array (
            'parent_order_id' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency_code' => $currency,
            'amount' => $amount,
            // 'bank_account_id' => 1234,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['message_id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->version . '/';
        if ($api == 'private')
            $request .= 'me/';
        $request .= $path;
        if ($method == 'GET') {
            if ($params)
                $request .= '?' . $this->urlencode ($params);
        }
        $url = $this->urls['api'] . $request;
        if ($api == 'private') {
            $nonce = (string) $this->nonce ();
            $body = $this->json ($params);
            $auth = implode ('', array ($nonce, $method, $request, $body));
            $headers = array (
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-TIMESTAMP' => $nonce,
                'ACCESS-SIGN' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret)),
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bithumb extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bithumb',
            'name' => 'Bithumb',
            'countries' => 'KR', // South Korea
            'rateLimit' => 500,
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api' => array (
                    'public' => 'https://api.bithumb.com/public',
                    'private' => 'https://api.bithumb.com',
                ),
                'www' => 'https://www.bithumb.com',
                'doc' => 'https://www.bithumb.com/u1/US127',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker/{currency}',
                        'ticker/all',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'recent_transactions/{currency}',
                        'recent_transactions/all',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'trade/place',
                        'info/order_detail',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/KRW' => array ( 'id' => 'BTC', 'symbol' => 'BTC/KRW', 'base' => 'BTC', 'quote' => 'KRW' ),
                'ETH/KRW' => array ( 'id' => 'ETH', 'symbol' => 'ETH/KRW', 'base' => 'ETH', 'quote' => 'KRW' ),
                'LTC/KRW' => array ( 'id' => 'LTC', 'symbol' => 'LTC/KRW', 'base' => 'LTC', 'quote' => 'KRW' ),
                'ETC/KRW' => array ( 'id' => 'ETC', 'symbol' => 'ETC/KRW', 'base' => 'ETC', 'quote' => 'KRW' ),
                'XRP/KRW' => array ( 'id' => 'XRP', 'symbol' => 'XRP/KRW', 'base' => 'XRP', 'quote' => 'KRW' ),
                'BCH/KRW' => array ( 'id' => 'BCH', 'symbol' => 'BCH/KRW', 'base' => 'BCH', 'quote' => 'KRW' ),
                'XMR/KRW' => array ( 'id' => 'XMR', 'symbol' => 'XMR/KRW', 'base' => 'XMR', 'quote' => 'KRW' ),
                'ZEC/KRW' => array ( 'id' => 'ZEC', 'symbol' => 'ZEC/KRW', 'base' => 'ZEC', 'quote' => 'KRW' ),
                'DASH/KRW' => array ( 'id' => 'DASH', 'symbol' => 'DASH/KRW', 'base' => 'DASH', 'quote' => 'KRW' ),
                'QTUM/KRW' => array ( 'id' => 'QTUM', 'symbol' => 'QTUM/KRW', 'base' => 'QTUM', 'quote' => 'KRW' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostInfoBalance (array_merge (array (
            'currency' => 'ALL',
        ), $params));
        $result = array ( 'info' => $response );
        $balances = $response['data'];
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            $lowercase = strtolower ($currency);
            $account['total'] = $this->safe_float ($balances, 'total_' . $lowercase);
            $account['used'] = $this->safe_float ($balances, 'in_use_' . $lowercase);
            $account['free'] = $this->safe_float ($balances, 'available_' . $lowercase);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetOrderbookCurrency (array_merge (array (
            'count' => 50, // max = 50
            'currency' => $market['base'],
        ), $params));
        $orderbook = $response['data'];
        $timestamp = intval ($orderbook['timestamp']);
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = intval ($ticker['date']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'max_price'),
            'low' => $this->safe_float ($ticker, 'min_price'),
            'bid' => $this->safe_float ($ticker, 'buy_price'),
            'ask' => $this->safe_float ($ticker, 'sell_price'),
            'vwap' => null,
            'open' => $this->safe_float ($ticker, 'opening_price'),
            'close' => $this->safe_float ($ticker, 'closing_price'),
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last_trade'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float ($ticker, 'average_price'),
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float ($ticker, 'volume_1day'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $response = $this->publicGetTickerAll ($params);
        $result = array ();
        $timestamp = $response['data']['date'];
        $tickers = $this->omit ($response['data'], 'date');
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $ticker['date'] = $timestamp;
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTickerCurrency (array_merge (array (
            'currency' => $market['base'],
        ), $params));
        return $this->parse_ticker ($response['data'], $market);
    }

    public function parse_trade ($trade, $market) {
        // a workaround for their bug in date format, hours are not 0-padded
        list ($transaction_date, $transaction_time) = explode (' ', $trade['transaction_date']);
        $transaction_time_short = strlen ($transaction_time) < 8;
        if ($transaction_time_short)
            $transaction_time = '0' . $transaction_time;
        $timestamp = $this->parse8601 ($transaction_date . ' ' . $transaction_time);
        $side = ($trade['type'] == 'ask') ? 'sell' : 'buy';
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['units_traded']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetRecentTransactionsCurrency (array_merge (array (
            'currency' => $market['base'],
            'count' => 100, // max = 100
        ), $params));
        return $this->parse_trades ($response['data'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported ($this->id . ' private API not implemented yet');
        //     $prefix = '';
        //     if ($type == 'market')
        //         $prefix = 'market_';
        //     $order = array (
        //         'pair' => $this->market_id ($symbol),
        //         'quantity' => $amount,
        //         'price' => $price || 0,
        //         'type' => $prefix . $side,
        //     );
        //     $response = $this->privatePostOrderCreate (array_merge ($order, $params));
        //     return array (
        //         'info' => $response,
        //         'id' => (string) $response['order_id'],
        //     );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $side = (array_key_exists ('side', $params));
        if (!$side)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $side parameter (sell or buy)');
        $side = ($side == 'buy') ? 'purchase' : 'sales';
        $currency = (array_key_exists ('currency', $params));
        if (!$currency)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $currency parameter');
        return $this->privatePostTradeCancel (array (
            'order_id' => $id,
            'type' => $params['side'],
            'currency' => $params['currency'],
        ));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $endpoint = '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'][$api] . $endpoint;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $body = $this->urlencode (array_merge (array (
                'endpoint' => $endpoint,
            ), $query));
            $nonce = (string) $this->nonce ();
            $auth = $endpoint . "\0" . $body . "\0" . $nonce;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512');
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Api-Sign' => base64_encode ($this->encode ($signature)),
                'Api-Nonce' => $nonce,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response)) {
            if ($response['status'] == '0000')
                return $response;
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bitlish extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitlish',
            'name' => 'bitlish',
            'countries' => array ( 'GB', 'EU', 'RU' ),
            'rateLimit' => 1500,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
                'api' => 'https://bitlish.com/api',
                'www' => 'https://bitlish.com',
                'doc' => 'https://bitlish.com/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ),
                    'post' => array (
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'accounts_operations',
                        'balance',
                        'cancel_trade',
                        'cancel_trades_by_ids',
                        'cancel_all_trades',
                        'create_bcode',
                        'create_template_wallet',
                        'create_trade',
                        'deposit',
                        'list_accounts_operations_from_ts',
                        'list_active_trades',
                        'list_bcodes',
                        'list_my_matches_from_ts',
                        'list_my_trades',
                        'list_my_trads_from_ts',
                        'list_payment_methods',
                        'list_payments',
                        'redeem_code',
                        'resign',
                        'signin',
                        'signout',
                        'trade_details',
                        'trade_options',
                        'withdraw',
                        'withdraw_by_id',
                    ),
                ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        if (!$this->substituteCommonCurrencyCodes)
            return $currency;
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        if ($currency == 'DSH')
            $currency = 'DASH';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetPairs ();
        $result = array ();
        $keys = array_keys ($markets);
        for ($p = 0; $p < count ($keys); $p++) {
            $market = $markets[$keys[$p]];
            $id = $market['id'];
            $symbol = $market['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function parse_ticker ($ticker, $market) {
        $timestamp = $this->milliseconds ();
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['max']),
            'low' => floatval ($ticker['min']),
            'bid' => floatval ($ticker['min']),
            'ask' => floatval ($ticker['max']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => floatval ($ticker['first']),
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTickers ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetTickers ($params);
        $ticker = $tickers[$market['id']];
        return $this->parse_ticker ($ticker, $market);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        // $market = $this->market ($symbol);
        $now = $this->seconds ();
        $start = $now - 86400 * 30; // last 30 days
        $interval = array ((string) $start, null);
        return $this->publicPostOhlcv (array_merge (array (
            'time_range' => $interval,
        ), $params));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetTradesDepth (array_merge (array (
            'pair_id' => $this->market_id ($symbol),
        ), $params));
        $timestamp = intval (intval ($orderbook['last']) / 1000);
        return $this->parse_order_book ($orderbook, $timestamp, 'bid', 'ask', 'price', 'volume');
    }

    public function parse_trade ($trade, $market = null) {
        $side = ($trade['dir'] == 'bid') ? 'buy' : 'sell';
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = intval ($trade['created'] / 1000);
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesHistory (array_merge (array (
            'pair_id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['list'], $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostBalance ();
        $result = array ( 'info' => $response );
        $currencies = array_keys ($response);
        $balance = array ();
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $account = $response[$currency];
            $currency = strtoupper ($currency);
            // issue #4 bitlish names Dash as DSH, instead of DASH
            if ($currency == 'DSH')
                $currency = 'DASH';
            $balance[$currency] = $account;
        }
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance)) {
                $account['free'] = floatval ($balance[$currency]['funds']);
                $account['used'] = floatval ($balance[$currency]['holded']);
                $account['total'] = $this->sum ($account['free'], $account['used']);
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function sign_in () {
        return $this->privatePostSignin (array (
            'login' => $this->login,
            'passwd' => $this->password,
        ));
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'pair_id' => $this->market_id ($symbol),
            'dir' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $result = $this->privatePostCreateTrade (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelTrade (array ( 'id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        if ($currency != 'BTC') {
            // they did not document other types...
            throw new NotSupported ($this->id . ' currently supports BTC withdrawals only, until they document other currencies...');
        }
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency' => strtolower ($currency),
            'amount' => floatval ($amount),
            'account' => $address,
            'payment_method' => 'bitcoin', // they did not document other types...
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['message_id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($method == 'GET') {
                if ($params)
                    $url .= '?' . $this->urlencode ($params);
            }
            else {
                $body = $this->json ($params);
                $headers = array ( 'Content-Type' => 'application/json' );
            }
        } else {
            $body = $this->json (array_merge (array ( 'token' => $this->apiKey ), $params));
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bitmarket extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitmarket',
            'name' => 'BitMarket',
            'countries' => array ( 'PL', 'EU' ),
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '90m' => '90m',
                '6h' => '6h',
                '1d' => '1d',
                '1w' => '7d',
                '1M' => '1m',
                '3M' => '3m',
                '6M' => '6m',
                '1y' => '1y',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api' => array (
                    'public' => 'https://www.bitmarket.net',
                    'private' => 'https://www.bitmarket.pl/api2/', // last slash is critical
                ),
                'www' => array (
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ),
                'doc' => array (
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/PLN' => array ( 'id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ( 'id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LiteMineX/BTC' => array ( 'id' => 'LiteMineXBTC', 'symbol' => 'LiteMineX/BTC', 'base' => 'LiteMineX', 'quote' => 'BTC' ),
                'PlnX/BTC' => array ( 'id' => 'PlnxBTC', 'symbol' => 'PlnX/BTC', 'base' => 'PlnX', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostInfo ();
        $data = $response['data'];
        $balance = $data['balances'];
        $result = array ( 'info' => $data );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance['available']))
                $account['free'] = $balance['available'][$currency];
            if (array_key_exists ($currency, $balance['blocked']))
                $account['used'] = $balance['blocked'][$currency];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetJsonMarketOrderbook (array_merge (array (
            'market' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetJsonMarketTicker (array_merge (array (
            'market' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $side = ($trade['type'] == 'bid') ? 'buy' : 'sell';
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetJsonMarketTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '90m', $since = null, $limit = null) {
        return [
            $ohlcv['time'] * 1000,
            floatval ($ohlcv['open']),
            floatval ($ohlcv['high']),
            floatval ($ohlcv['low']),
            floatval ($ohlcv['close']),
            floatval ($ohlcv['vol']),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '90m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $method = 'publicGetGraphsMarket' . $this->timeframes[$timeframe];
        $market = $this->market ($symbol);
        $response = $this->$method (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $response = $this->privatePostTrade (array_merge (array (
            'market' => $this->market_id ($symbol),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
        $result = array (
            'info' => $response,
        );
        if (array_key_exists ('id', $response['order']))
            $result['id'] = $response['id'];
        return $result;
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function isFiat ($currency) {
        if ($currency == 'EUR')
            return true;
        if ($currency == 'PLN')
            return true;
        return false;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $method = null;
        $request = array (
            'currency' => $currency,
            'quantity' => $amount,
        );
        if ($this->isFiat ($currency)) {
            $method = 'privatePostWithdrawFiat';
            if (array_key_exists ('account', $params)) {
                $request['account'] = $params['account']; // bank account code for withdrawal
            } else {
                throw new ExchangeError ($this->id . ' requires account parameter to withdraw fiat currency');
            }
            if (array_key_exists ('account2', $params)) {
                $request['account2'] = $params['account2']; // bank SWIFT code (EUR only)
            } else {
                if ($currency == 'EUR')
                    throw new ExchangeError ($this->id . ' requires account2 parameter to withdraw EUR');
            }
            if (array_key_exists ('withdrawal_note', $params)) {
                $request['withdrawal_note'] = $params['withdrawal_note']; // a 10-character user-specified withdrawal note (PLN only)
            } else {
                if ($currency == 'PLN')
                    throw new ExchangeError ($this->id . ' requires withdrawal_note parameter to withdraw PLN');
            }
        } else {
            $method = 'privatePostWithdraw';
            $request['address'] = $address;
        }
        $response = $this->$method (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params ($path . '.json', $params);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'tonce' => $nonce,
                'method' => $path,
            ), $params);
            $body = $this->urlencode ($query);
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bitmex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitmex',
            'name' => 'BitMEX',
            'countries' => 'SC', // Seychelles
            'version' => 'v1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1m' => '1m',
                '5m' => '5m',
                '1h' => '1h',
                '1d' => '1d',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api' => 'https://www.bitmex.com',
                'www' => 'https://www.bitmex.com',
                'doc' => array (
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ),
                    'post' => array (
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ),
                    'put' => array (
                        'order',
                        'order/bulk',
                        'user',
                    ),
                    'delete' => array (
                        'apiKey',
                        'order',
                        'order/all',
                    ),
                )
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetInstrumentActiveAndIndices ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['symbol'];
            $base = $market['underlying'];
            $quote = $market['quoteCurrency'];
            $isFuturesContract = $id != ($base . $quote);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $isFuturesContract ? $id : ($base . '/' . $quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetUserMargin (array ( 'currency' => 'all' ));
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($response); $b++) {
            $balance = $response[$b];
            $currency = strtoupper ($balance['currency']);
            $currency = $this->common_currency_code ($currency);
            $account = array (
                'free' => $balance['availableMargin'],
                'used' => 0.0,
                'total' => $balance['amount'],
            );
            if ($currency == 'BTC') {
                $account['free'] = $account['free'] * 0.00000001;
                $account['total'] = $account['total'] * 0.00000001;
            }
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderBookL2 (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        for ($o = 0; $o < count ($orderbook); $o++) {
            $order = $orderbook[$o];
            $side = ($order['side'] == 'Sell') ? 'asks' : 'bids';
            $amount = $order['size'];
            $price = $order['price'];
            $result[$side][] = array ($price, $amount);
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $request = array_merge (array (
            'symbol' => $this->market_id ($symbol),
            'binSize' => '1d',
            'partial' => true,
            'count' => 1,
            'reverse' => true,
        ), $params);
        $quotes = $this->publicGetQuoteBucketed ($request);
        $quotesLength = count ($quotes);
        $quote = $quotes[$quotesLength - 1];
        $tickers = $this->publicGetTradeBucketed ($request);
        $ticker = $tickers[0];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($quote['bidPrice']),
            'ask' => floatval ($quote['askPrice']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => floatval ($ticker['close']),
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['homeNotional']),
            'quoteVolume' => floatval ($ticker['foreignNotional']),
            'info' => $ticker,
        );
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['timestamp']);
        return [
            $timestamp,
            $ohlcv['open'],
            $ohlcv['high'],
            $ohlcv['low'],
            $ohlcv['close'],
            $ohlcv['volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        // send JSON key/value pairs, such as array ("key" => "value")
        // $filter by individual fields and do advanced queries on timestamps
        // $filter = array ( 'key' => 'value' );
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a $timeframe, e.g. XBU:monthly
        // timeframes => daily, weekly, monthly, quarterly, and biquarterly
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'binSize' => $this->timeframes[$timeframe],
            'partial' => true,     // true == include yet-incomplete current bins
            // 'filter' => $filter, // $filter by individual fields and do advanced queries
            // 'columns' => array (),    // will return all columns if omitted
            // 'start' => 0,       // starting point for results (wtf?)
            // 'reverse' => false, // true == newest first
            // 'endTime' => '',    // ending date $filter for results
        );
        if ($since)
            $request['startTime'] = $since; // starting date $filter for results
        if ($limit)
            $request['count'] = $limit; // default 100
        $response = $this->publicGetTradeBucketed (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['timestamp']);
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('symbol', $trade))
                $market = $this->markets_by_id[$trade['symbol']];
        }
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $trade['trdMatchID'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'order' => null,
            'type' => null,
            'side' => strtolower ($trade['side']),
            'price' => $trade['price'],
            'amount' => $trade['size'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrade (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'symbol' => $this->market_id ($symbol),
            'side' => $this->capitalize ($side),
            'orderQty' => $amount,
            'ordType' => $this->capitalize ($type),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['orderID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteOrder (array ( 'orderID' => $id ));
    }

    public function isFiat ($currency) {
        if ($currency == 'EUR')
            return true;
        if ($currency == 'PLN')
            return true;
        return false;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        if ($currency != 'BTC')
            throw new ExchangeError ($this->id . ' supoprts BTC withdrawals only, other currencies coming soon...');
        $request = array (
            'currency' => 'XBt', // temporarily
            'amount' => $amount,
            'address' => $address,
            // 'otpToken' => '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee' => 0.001, // bitcoin network fee
        );
        $response = $this->privatePostUserRequestWithdrawal (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response['transactID'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/api' . '/' . $this->version . '/' . $path;
        if ($params)
            $query .= '?' . $this->urlencode ($params);
        $url = $this->urls['api'] . $query;
        if ($api == 'private') {
            $nonce = (string) $this->nonce ();
            if ($method == 'POST')
                if ($params)
                    $body = $this->json ($params);
            $request = implode ('', array ($method, $query, $nonce, $body || ''));
            $headers = array (
                'Content-Type' => 'application/json',
                'api-nonce' => $nonce,
                'api-key' => $this->apiKey,
                'api-signature' => $this->hmac ($this->encode ($request), $this->encode ($this->secret)),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bitso extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitso',
            'name' => 'Bitso',
            'countries' => 'MX', // Mexico
            'rateLimit' => 2000, // 30 requests per minute
            'version' => 'v3',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api' => 'https://api.bitso.com',
                'www' => 'https://bitso.com',
                'doc' => 'https://bitso.com/api_info',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ),
                    'post' => array (
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ),
                    'delete' => array (
                        'orders/{oid}',
                        'orders/all',
                    ),
                )
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetAvailableBooks ();
        $result = array ();
        for ($p = 0; $p < count ($markets['payload']); $p++) {
            $market = $markets['payload'][$p];
            $id = $market['book'];
            $symbol = str_replace ('_', '/', strtoupper ($id));
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalance ();
        $balances = $response['payload']['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = strtoupper ($balance['currency']);
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['locked']),
                'total' => floatval ($balance['total']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetOrderBook (array_merge (array (
            'book' => $this->market_id ($symbol),
        ), $params));
        $orderbook = $response['payload'];
        $timestamp = $this->parse8601 ($orderbook['updated_at']);
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetTicker (array_merge (array (
            'book' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['payload'];
        $timestamp = $this->parse8601 ($ticker['created_at']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('book', $trade))
                $market = $this->markets_by_id[$trade['book']];
        }
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'order' => null,
            'type' => null,
            'side' => $trade['maker_side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'book' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['payload'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'book' => $this->market_id ($symbol),
            'side' => $side,
            'type' => $type,
            'major' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['payload']['oid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteOrders (array ( 'oid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $query;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            if ($params)
                $body = $this->json ($params);
            $nonce = (string) $this->nonce ();
            $request = implode ('', array ($nonce, $method, $query, $body || ''));
            $signature = $this->hmac ($this->encode ($request), $this->encode ($this->secret));
            $auth = $this->apiKey . ':' . $nonce . ':' . $signature;
            $headers = array ( 'Authorization' => "Bitso " . $auth );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class bitstamp1 extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitstamp1',
            'name' => 'Bitstamp v1',
            'countries' => 'GB',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api' => 'https://www.bitstamp.net/api',
                'www' => 'https://www.bitstamp.net',
                'doc' => 'https://www.bitstamp.net/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'ticker_hour',
                        'order_book',
                        'transactions',
                        'eur_usd',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance',
                        'user_transactions',
                        'open_orders',
                        'order_status',
                        'cancel_order',
                        'cancel_all_orders',
                        'buy',
                        'sell',
                        'bitcoin_deposit_address',
                        'unconfirmed_btc',
                        'ripple_withdrawal',
                        'ripple_address',
                        'withdrawal_requests',
                        'bitcoin_withdrawal',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btcusd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'btceur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'EUR/USD' => array ( 'id' => 'eurusd', 'symbol' => 'EUR/USD', 'base' => 'EUR', 'quote' => 'USD' ),
                'XRP/USD' => array ( 'id' => 'xrpusd', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD' ),
                'XRP/EUR' => array ( 'id' => 'xrpeur', 'symbol' => 'XRP/EUR', 'base' => 'XRP', 'quote' => 'EUR' ),
                'XRP/BTC' => array ( 'id' => 'xrpbtc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'LTC/USD' => array ( 'id' => 'ltcusd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ( 'id' => 'ltceur', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/BTC' => array ( 'id' => 'ltcbtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'ethusd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETH/EUR' => array ( 'id' => 'etheur', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR' ),
                'ETH/BTC' => array ( 'id' => 'ethbtc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        if ($symbol != 'BTC/USD')
            throw new ExchangeError ($this->id . ' ' . $this->version . " fetchOrderBook doesn't support " . $symbol . ', use it for BTC/USD only');
        $orderbook = $this->publicGetOrderBook ($params);
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        if ($symbol != 'BTC/USD')
            throw new ExchangeError ($this->id . ' ' . $this->version . " fetchTicker doesn't support " . $symbol . ', use it for BTC/USD only');
        $ticker = $this->publicGetTicker ($params);
        $timestamp = intval ($ticker['timestamp']) * 1000;
        $vwap = floatval ($ticker['vwap']);
        $baseVolume = floatval ($ticker['volume']);
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => $vwap,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        if (array_key_exists ('date', $trade)) {
            $timestamp = intval ($trade['date']) * 1000;
        } else if (array_key_exists ('datetime', $trade)) {
            // $timestamp = $this->parse8601 ($trade['datetime']);
            $timestamp = intval ($trade['datetime']) * 1000;
        }
        $side = ($trade['type'] == 0) ? 'buy' : 'sell';
        $order = null;
        if (array_key_exists ('order_id', $trade))
            $order = (string) $trade['order_id'];
        if (array_key_exists ('currency_pair', $trade)) {
            if (array_key_exists ($trade['currency_pair'], $this->markets_by_id))
                $market = $this->markets_by_id[$trade['currency_pair']];
        }
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        if ($symbol != 'BTC/USD')
            throw new ExchangeError ($this->id . ' ' . $this->version . " fetchTrades doesn't support " . $symbol . ', use it for BTC/USD only');
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'time' => 'minute',
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostBalance ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $total = $lowercase . '_balance';
            $free = $lowercase . '_available';
            $used = $lowercase . '_reserved';
            $account = $this->account ();
            $account['free'] = $this->safe_float ($balance, $free, 0.0);
            $account['used'] = $this->safe_float ($balance, $used, 0.0);
            $account['total'] = $this->safe_float ($balance, $total, 0.0);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type != 'limit')
            throw new ExchangeError ($this->id . ' ' . $this->version . ' accepts limit orders only');
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'id' => $this->market_id ($symbol),
            'amount' => $amount,
            'price' => $price,
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function parse_order_status ($order) {
        if (($order['status'] == 'Queue') || ($order['status'] == 'Open'))
            return 'open';
        if ($order['status'] == 'Finished')
            return 'closed';
        return $order['status'];
    }

    public function fetch_order_status ($id, $symbol = null) {
        $this->load_markets ();
        $response = $this->privatePostOrderStatus (array ( 'id' => $id ));
        return $this->parse_order_status ($response);
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        if ($symbol)
            $market = $this->market ($symbol);
        $pair = $market ? $market['id'] : 'all';
        $request = array_merge (array ( 'id' => $pair ), $params);
        $response = $this->privatePostOpenOrdersId ($request);
        return $this->parse_trades ($response, $market);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetchOrder is not implemented yet');
        $this->load_markets ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->encode ($this->hmac ($this->encode ($auth), $this->encode ($this->secret)));
            $query = array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bitstamp extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bitstamp',
            'name' => 'Bitstamp',
            'countries' => 'GB',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api' => 'https://www.bitstamp.net/api',
                'www' => 'https://www.bitstamp.net',
                'doc' => 'https://www.bitstamp.net/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance/',
                        'balance/{pair}/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ),
                ),
                'v1' => array (
                    'post' => array (
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                    )
                )
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btcusd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'btceur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'EUR/USD' => array ( 'id' => 'eurusd', 'symbol' => 'EUR/USD', 'base' => 'EUR', 'quote' => 'USD' ),
                'XRP/USD' => array ( 'id' => 'xrpusd', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD' ),
                'XRP/EUR' => array ( 'id' => 'xrpeur', 'symbol' => 'XRP/EUR', 'base' => 'XRP', 'quote' => 'EUR' ),
                'XRP/BTC' => array ( 'id' => 'xrpbtc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'LTC/USD' => array ( 'id' => 'ltcusd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ( 'id' => 'ltceur', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/BTC' => array ( 'id' => 'ltcbtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'ethusd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETH/EUR' => array ( 'id' => 'etheur', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR' ),
                'ETH/BTC' => array ( 'id' => 'ethbtc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderBookPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        $vwap = floatval ($ticker['vwap']);
        $baseVolume = floatval ($ticker['volume']);
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => $vwap,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        if (array_key_exists ('date', $trade)) {
            $timestamp = intval ($trade['date']) * 1000;
        } else if (array_key_exists ('datetime', $trade)) {
            // $timestamp = $this->parse8601 ($trade['datetime']);
            $timestamp = intval ($trade['datetime']) * 1000;
        }
        $side = ($trade['type'] == 0) ? 'buy' : 'sell';
        $order = null;
        if (array_key_exists ('order_id', $trade))
            $order = (string) $trade['order_id'];
        if (array_key_exists ('currency_pair', $trade)) {
            if (array_key_exists ($trade['currency_pair'], $this->markets_by_id))
                $market = $this->markets_by_id[$trade['currency_pair']];
        }
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactionsPair (array_merge (array (
            'pair' => $market['id'],
            'time' => 'minute',
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostBalance ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $total = $lowercase . '_balance';
            $free = $lowercase . '_available';
            $used = $lowercase . '_reserved';
            $account = $this->account ();
            if (array_key_exists ($free, $balance))
                $account['free'] = floatval ($balance[$free]);
            if (array_key_exists ($used, $balance))
                $account['used'] = floatval ($balance[$used]);
            if (array_key_exists ($total, $balance))
                $account['total'] = floatval ($balance[$total]);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'pair' => $this->market_id ($symbol),
            'amount' => $amount,
        );
        if ($type == 'market')
            $method .= 'Market';
        else
            $order['price'] = $price;
        $method .= 'Pair';
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function parse_order_status ($order) {
        if (($order['status'] == 'Queue') || ($order['status'] == 'Open'))
            return 'open';
        if ($order['status'] == 'Finished')
            return 'closed';
        return $order['status'];
    }

    public function fetch_order_status ($id, $symbol = null) {
        $this->load_markets ();
        $response = $this->privatePostOrderStatus (array ( 'id' => $id ));
        return $this->parse_order_status ($response);
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        if ($symbol)
            $market = $this->market ($symbol);
        $pair = $market ? $market['id'] : 'all';
        $request = array_merge (array ( 'pair' => $pair ), $params);
        $response = $this->privatePostOpenOrdersPair ($request);
        return $this->parse_trades ($response, $market);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostOrderStatus (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($api != 'v1')
            $url .= $this->version . '/';
        $url .= $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->encode ($this->hmac ($this->encode ($auth), $this->encode ($this->secret)));
            $query = array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bittrex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bittrex',
            'name' => 'Bittrex',
            'countries' => 'US',
            'version' => 'v1.1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchMyTrades' => false,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1m' => 'oneMin',
                '5m' => 'fiveMin',
                '30m' => 'thirtyMin',
                '1h' => 'hour',
                '1d' => 'day',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api' => array (
                    'public' => 'https://bittrex.com/api',
                    'account' => 'https://bittrex.com/api',
                    'market' => 'https://bittrex.com/api',
                    'v2' => 'https://bittrex.com/api/v2.0/pub',
                ),
                'www' => 'https://bittrex.com',
                'doc' => array (
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ),
                'fees' => array (
                    'https://bittrex.com/Fees',
                    'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ),
            ),
            'api' => array (
                'v2' => array (
                    'get' => array (
                        'currencies/GetBTCPrice',
                        'market/GetTicks',
                        'market/GetLatestTick',
                        'Markets/GetMarketSummaries',
                        'market/GetLatestTick',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ),
                ),
                'account' => array (
                    'get' => array (
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ),
                ),
                'market' => array (
                    'get' => array (
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0025,
                    'taker' => 0.0025,
                ),
            ),
        ), $options));
    }

    public function cost_to_precision ($symbol, $cost) {
        return $this->truncate (floatval ($cost), $this->markets[$symbol].precision.price);
    }

    public function fee_to_precision ($symbol, $fee) {
        return $this->truncate (floatval ($fee), $this->markets[$symbol]['precision']['price']);
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets['result']); $p++) {
            $market = $markets['result'][$p];
            $id = $market['MarketName'];
            $base = $market['MarketCurrency'];
            $quote = $market['BaseCurrency'];
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => 8,
                'price' => 8,
            );
            $amountLimits = array (
                'min' => $market['MinTradeSize'],
                'max' => null,
            );
            $priceLimits = array ( 'min' => null, 'max' => null );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'lot' => $amountLimits['min'],
                'precision' => $precision,
                'limits' => $limits,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->accountGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $indexed = $this->index_by ($balances, 'Currency');
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $indexed)) {
                $balance = $indexed[$currency];
                $free = floatval ($balance['Available']);
                $total = floatval ($balance['Balance']);
                $used = $total - $free;
                $account['free'] = $free;
                $account['used'] = $used;
                $account['total'] = $total;
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id ($symbol),
            'type' => 'both',
            'depth' => 50,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book ($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['TimeStamp']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['High']),
            'low' => floatval ($ticker['Low']),
            'bid' => floatval ($ticker['Bid']),
            'ask' => floatval ($ticker['Ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['Last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['Volume']),
            'quoteVolume' => floatval ($ticker['BaseVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetMarketsummaries ($params);
        $tickers = $response['result'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $id = $ticker['MarketName'];
            $market = null;
            $symbol = $id;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                list ($quote, $base) = explode ('-', $id);
                $base = $this->common_currency_code ($base);
                $quote = $this->common_currency_code ($quote);
                $symbol = $base . '/' . $quote;
            }
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketsummary (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $ticker = $response['result'][0];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['TimeStamp']);
        $side = null;
        if ($trade['OrderType'] == 'BUY') {
            $side = 'buy';
        } else if ($trade['OrderType'] == 'SELL') {
            $side = 'sell';
        }
        $id = null;
        if (array_key_exists ('Id', $trade))
            $id = (string) $trade['Id'];
        return array (
            'id' => $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => 'limit',
            'side' => $side,
            'price' => $trade['Price'],
            'amount' => $trade['Quantity'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarkethistory (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['result'], $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['T']);
        return [
            $timestamp,
            $ohlcv['O'],
            $ohlcv['H'],
            $ohlcv['L'],
            $ohlcv['C'],
            $ohlcv['V'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'tickInterval' => $this->timeframes[$timeframe],
            'marketName' => $market['id'],
        );
        $response = $this->v2GetMarketGetTicks (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response['result'], $market, $timeframe, $since, $limit);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['market'] = $market['id'];
        }
        $response = $this->marketGetOpenorders (array_merge ($request, $params));
        $orders = $this->parse_orders ($response['result'], $market);
        return $this->filter_orders_by_symbol ($orders, $symbol);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'marketGet' . $this->capitalize ($side) . $type;
        $order = array (
            'market' => $market['id'],
            'quantity' => $this->amount_to_precision ($symbol, $amount),
        );
        if ($type == 'limit')
            $order['rate'] = $this->price_to_precision ($symbol, $price);
        $response = $this->$method (array_merge ($order, $params));
        $result = array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
        return $result;
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $response = $this->marketGetCancel (array_merge (array (
                'uuid' => $id,
            ), $params));
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'message');
                if ($message == 'ORDER_NOT_OPEN')
                    throw new InvalidOrder ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
                if ($message == 'UUID_INVALID')
                    throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $side = null;
        if (array_key_exists ('OrderType', $order))
            $side = ($order['OrderType'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        if (array_key_exists ('Type', $order))
            $side = ($order['Type'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        $status = 'open';
        if ($order['Closed']) {
            $status = 'closed';
        } else if ($order['CancelInitiated']) {
            $status = 'canceled';
        }
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('Exchange', $order))
                if (array_key_exists ($order['Exchange'], $this->markets_by_id))
                    $market = $this->markets_by_id[$order['Exchange']];
        }
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = null;
        if (array_key_exists ('Opened', $order))
            $timestamp = $this->parse8601 ($order['Opened']);
        if (array_key_exists ('TimeStamp', $order))
            $timestamp = $this->parse8601 ($order['TimeStamp']);
        $fee = null;
        $commission = null;
        if (array_key_exists ('Commission', $order)) {
            $commission = 'Commission';
        } else if (array_key_exists ('CommissionPaid', $order)) {
            $commission = 'CommissionPaid';
        }
        if ($commission) {
            $fee = array (
                'cost' => floatval ($order[$commission]),
                'currency' => $market['quote'],
            );
        }
        $price = $this->safe_float ($order, 'Limit');
        $cost = $this->safe_float ($order, 'Price');
        $amount = $this->safe_float ($order, 'Quantity');
        $remaining = $this->safe_float ($order, 'QuantityRemaining', 0.0);
        $filled = $amount - $remaining;
        if (!$cost) {
            if ($price && $amount)
                $cost = $price * $amount;
        }
        if (!$price) {
            if ($cost && $filled)
                $price = $cost / $filled;
        }
        $average = $this->safe_float ($order, 'PricePerUnit');
        $result = array (
            'info' => $order,
            'id' => $order['OrderUuid'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => $side,
            'price' => $price,
            'cost' => $cost,
            'average' => $average,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => $fee,
        );
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $response = $this->accountGetOrder (array ( 'uuid' => $id ));
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'message');
                if ($message == 'UUID_INVALID')
                    throw new OrderNotFound ($this->id . ' fetchOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $this->parse_order ($response['result']);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['market'] = $market['id'];
        }
        $response = $this->accountGetOrderhistory (array_merge ($request, $params));
        $orders = $this->parse_orders ($response['result'], $market);
        return $this->filter_orders_by_symbol ($orders, $symbol);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->accountGetWithdraw (array_merge (array (
            'currency' => $currency,
            'quantity' => $amount,
            'address' => $address,
        ), $params));
        $id = null;
        if (array_key_exists ('result', $response)) {
            if (array_key_exists ('uuid', $response['result']))
                $id = $response['result']['uuid'];
        }
        return array (
            'info' => $response,
            'id' => $id,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/';
        if ($api != 'v2')
            $url .= $this->version . '/';
        if ($api == 'public') {
            $url .= $api . '/' . strtolower ($method) . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else if ($api == 'v2') {
            $url .= $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $url .= $api . '/';
            if ((($api == 'account') && ($path != 'withdraw')) || ($path == 'openorders'))
                $url .= strtolower ($method);
            $url .= $path . '?' . $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), $params));
            $signature = $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512');
            $headers = array ( 'apisign' => $signature );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        if (array_key_exists ('message', $response))
            if ($response['message'] == "INSUFFICIENT_FUNDS")
                throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class blinktrade extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'blinktrade',
            'name' => 'BlinkTrade',
            'countries' => array ( 'US', 'VE', 'VN', 'BR', 'PK', 'CL' ),
            'rateLimit' => 1000,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27990968-75d9c884-6470-11e7-9073-46756c8e7e8c.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://blinktrade.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{currency}/ticker',    // ?crypto_currency=BTC
                        '{currency}/orderbook', // ?crypto_currency=BTC
                        '{currency}/trades',    // ?crypto_currency=BTC&since=<TIMESTAMP>&limit=<NUMBER>
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'D',   // order
                        'F',   // cancel order
                        'U2',  // balance
                        'U4',  // my orders
                        'U6',  // withdraw
                        'U18', // deposit
                        'U24', // confirm withdrawal
                        'U26', // list withdrawals
                        'U30', // list deposits
                        'U34', // ledger
                        'U70', // cancel withdrawal
                    ),
                ),
            ),
            'markets' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin' ),
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC' ),
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit' ),
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit' ),
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        // todo parse balance
        return $this->privatePostU2 (array (
            'BalanceReqID' => $this->nonce (),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetCurrencyOrderbook (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $ticker = $this->publicGetCurrencyTicker (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        $timestamp = $this->milliseconds ();
        $lowercaseQuote = strtolower ($market['quote']);
        $quoteVolume = 'vol_' . $lowercaseQuote;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => floatval ($ticker[$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetCurrencyTrades (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $market = $this->market ($symbol);
        $order = array (
            'ClOrdID' => $this->nonce (),
            'Symbol' => $market['id'],
            'Side' => $this->capitalize ($side),
            'OrdType' => '2',
            'Price' => $price,
            'OrderQty' => $amount,
            'BrokerID' => $market['brokerId'],
        );
        $response = $this->privatePostD (array_merge ($order, $params));
        $indexed = $this->index_by ($response['Responses'], 'MsgType');
        $execution = $indexed['8'];
        return array (
            'info' => $response,
            'id' => $execution['OrderID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostF (array_merge (array (
            'ClOrdID' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $request = array_merge (array ( 'MsgType' => $path ), $query);
            $body = $this->json ($request);
            $headers = array (
                'APIKey' => $this->apiKey,
                'Nonce' => $nonce,
                'Signature' => $this->hmac ($this->encode ($nonce), $this->encode ($this->secret)),
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('Status', $response))
            if ($response['Status'] != 200)
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bl3p extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bl3p',
            'name' => 'BL3P',
            'countries' => array ( 'NL', 'EU' ), // Netherlands, EU
            'rateLimit' => 1000,
            'version' => '1',
            'comment' => 'An exchange market by BitonicNL',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api' => 'https://api.bl3p.eu',
                'www' => array (
                    'https://bl3p.eu',
                    'https://bitonic.nl',
                ),
                'doc' => array (
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                // 'LTC/EUR' => array ( 'id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGENMKTMoneyInfo ();
        $data = $response['data'];
        $balance = $data['wallets'];
        $result = array ( 'info' => $data );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance)) {
                if (array_key_exists ('available', $balance[$currency])) {
                    $account['free'] = floatval ($balance[$currency]['available']['value']);
                }
            }
            if (array_key_exists ($currency, $balance)) {
                if (array_key_exists ('balance', $balance[$currency])) {
                    $account['total'] = floatval ($balance[$currency]['balance']['value']);
                }
            }
            if ($account['total']) {
                if ($account['free']) {
                    $account['used'] = $account['total'] - $account['free'];
                }
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function parse_bidask ($bidask, $priceKey = 0, $amountKey = 0) {
        return [
            $bidask['price_int'] / 100000.0,
            $bidask['amount_int'] / 100000000.0,
        ];
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketOrderbook (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $orderbook = $response['data'];
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetMarketTicker (array_merge (array (
            'market' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']['24h']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        return array (
            'id' => $trade['trade_id'],
            'info' => $trade,
            'timestamp' => $trade['date'],
            'datetime' => $this->iso8601 ($trade['date']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price_int'] / 100000.0,
            'amount' => $trade['amount_int'] / 100000000.0,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $result = $this->parse_trades ($response['data']['trades'], $market);
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $order = array (
            'market' => $market['id'],
            'amount_int' => $amount,
            'fee_currency' => $market['quote'],
            'type' => ($side == 'buy') ? 'bid' : 'ask',
        );
        if ($type == 'limit')
            $order['price_int'] = $price;
        $response = $this->privatePostMarketMoneyOrderAdd (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostMarketMoneyOrderCancel (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params ($path, $params);
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $query));
            $secret = base64_decode ($this->secret);
            $auth = $request . "\0" . $body;
            $signature = $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Rest-Key' => $this->apiKey,
                'Rest-Sign' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class bleutrade extends bittrex {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bleutrade',
            'name' => 'Bleutrade',
            'countries' => 'BR', // Brazil
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api' => array (
                    'public' => 'https://bleutrade.com/api',
                    'account' => 'https://bleutrade.com/api',
                    'market' => 'https://bleutrade.com/api',
                ),
                'www' => 'https://bleutrade.com',
                'doc' => 'https://bleutrade.com/help/API',
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id ($symbol),
            'type' => 'ALL',
            'depth' => 50,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book ($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
    }
}

// -----------------------------------------------------------------------------

class asia extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'asia',
            'name' => 'Asia',
            'comment' => 'a common base API for several exchanges from China and Japan',
            'countries' => array ( 'JP', 'CN' ),
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOHLCV' => false,
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth',
                        'orders',
                        'ticker',
                        'allticker',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance',
                        'trade_add',
                        'trade_cancel',
                        'trade_list',
                        'trade_view',
                        'wallet',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            if ($lowercase == 'dash')
                $lowercase = 'drk';
            $account = $this->account ();
            $free = $lowercase . '_balance';
            $used = $lowercase . '_lock';
            if (array_key_exists ($free, $balances))
                $account['free'] = floatval ($balances[$free]);
            if (array_key_exists ($used, $balances))
                $account['used'] = floatval ($balances[$used]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $orderbook = $this->publicGetDepth (array_merge ($request, $params));
        $result = $this->parse_order_book ($orderbook);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'buy'),
            'ask' => $this->safe_float ($ticker, 'sell'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float ($ticker, 'vol'),
            'quoteVolume' => $this->safe_float ($ticker, 'volume'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetAllticker ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $ticker = $this->publicGetTicker (array_merge ($request, $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'id' => $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $response = $this->publicGetOrders (array_merge ($request, $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'amount' => $amount,
            'price' => $price,
            'type' => $side,
        );
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $response = $this->privatePostTradeAdd (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostTradeCancel (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
            ), $params);
            $request = $this->urlencode ($query);
            $secret = $this->hash ($this->encode ($this->secret));
            $query['signature'] = $this->hmac ($this->encode ($request), $this->encode ($secret));
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if (!$response['result'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class btcbox extends asia {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcbox',
            'name' => 'BtcBox',
            'countries' => 'JP',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
                'api' => 'https://www.btcbox.co.jp/api',
                'www' => 'https://www.btcbox.co.jp/',
                'doc' => 'https://www.btcbox.co.jp/help/asm',
            ),
            'markets' => array (
                'BTC/JPY' => array ( 'id' => 'BTC/JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class btcchina extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcchina',
            'name' => 'BTCChina',
            'countries' => 'CN',
            'rateLimit' => 1500,
            'version' => 'v1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
                'api' => array (
                    'plus' => 'https://plus-api.btcchina.com/market',
                    'public' => 'https://data.btcchina.com/data',
                    'private' => 'https://api.btcchina.com/api_trade_v1.php',
                ),
                'www' => 'https://www.btcchina.com',
                'doc' => 'https://www.btcchina.com/apidocs'
            ),
            'api' => array (
                'plus' => array (
                    'get' => array (
                        'orderbook',
                        'ticker',
                        'trade',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'historydata',
                        'orderbook',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'BuyIcebergOrder',
                        'BuyOrder',
                        'BuyOrder2',
                        'BuyStopOrder',
                        'CancelIcebergOrder',
                        'CancelOrder',
                        'CancelStopOrder',
                        'GetAccountInfo',
                        'getArchivedOrder',
                        'getArchivedOrders',
                        'GetDeposits',
                        'GetIcebergOrder',
                        'GetIcebergOrders',
                        'GetMarketDepth',
                        'GetMarketDepth2',
                        'GetOrder',
                        'GetOrders',
                        'GetStopOrder',
                        'GetStopOrders',
                        'GetTransactions',
                        'GetWithdrawal',
                        'GetWithdrawals',
                        'RequestWithdrawal',
                        'SellIcebergOrder',
                        'SellOrder',
                        'SellOrder2',
                        'SellStopOrder',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btccny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'api' => 'public', 'plus' => false ),
                'LTC/CNY' => array ( 'id' => 'ltccny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'api' => 'public', 'plus' => false ),
                'LTC/BTC' => array ( 'id' => 'ltcbtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'api' => 'public', 'plus' => false ),
                'BCH/CNY' => array ( 'id' => 'bcccny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY', 'api' => 'plus', 'plus' => true ),
                'ETH/CNY' => array ( 'id' => 'ethcny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY', 'api' => 'plus', 'plus' => true ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTicker (array (
            'market' => 'all',
        ));
        $result = array ();
        $keys = array_keys ($markets);
        for ($p = 0; $p < count ($keys); $p++) {
            $key = $keys[$p];
            $market = $markets[$key];
            $parts = explode ('_', $key);
            $id = $parts[1];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );

        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            if (array_key_exists ($lowercase, $balances['balance']))
                $account['total'] = floatval ($balances['balance'][$lowercase]['amount']);
            if (array_key_exists ($lowercase, $balances['frozen']))
                $account['used'] = floatval ($balances['frozen'][$lowercase]['amount']);
            $account['free'] = $account['total'] - $account['used'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function createMarketRequest ($market) {
        $request = array ();
        $field = ($market['plus']) ? 'symbol' : 'market';
        $request[$field] = $market['id'];
        return $request;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = $market['api'] . 'GetOrderbook';
        $request = $this->createMarketRequest ($market);
        $orderbook = $this->$method (array_merge ($request, $params));
        $timestamp = $orderbook['date'] * 1000;
        $result = $this->parse_order_book ($orderbook, $timestamp);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market) {
        $timestamp = $ticker['date'] * 1000;
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => floatval ($ticker['open']),
            'close' => floatval ($ticker['prev_close']),
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_tickerPlus ($ticker, $market) {
        $timestamp = $ticker['Timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['High']),
            'low' => floatval ($ticker['Low']),
            'bid' => floatval ($ticker['BidPrice']),
            'ask' => floatval ($ticker['AskPrice']),
            'vwap' => null,
            'open' => floatval ($ticker['Open']),
            'close' => floatval ($ticker['PrevCls']),
            'first' => null,
            'last' => floatval ($ticker['Last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['Volume24H']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = $market['api'] . 'GetTicker';
        $request = $this->createMarketRequest ($market);
        $tickers = $this->$method (array_merge ($request, $params));
        $ticker = $tickers['ticker'];
        if ($market['plus'])
            return $this->parse_tickerPlus ($ticker, $market);
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function parse_tradePlus ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['timestamp']);
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => strtolower ($trade['side']),
            'price' => $trade['price'],
            'amount' => $trade['size'],
        );
    }

    public function parse_tradesPlus ($trades, $market = null) {
        $result = array ();
        for ($i = 0; $i < count ($trades); $i++) {
            $result[] = $this->parse_tradePlus ($trades[$i], $market);
        }
        return $result;
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = $market['api'] . 'GetTrade';
        $request = $this->createMarketRequest ($market);
        if ($market['plus']) {
            $now = $this->milliseconds ();
            $request['start_time'] = $now - 86400 * 1000;
            $request['end_time'] = $now;
        } else {
            $method .= 's'; // trades vs trade
        }
        $response = $this->$method (array_merge ($request, $params));
        if ($market['plus']) {
            return $this->parse_tradesPlus ($response['trades'], $market);
        }
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'privatePost' . $this->capitalize ($side) . 'Order2';
        $order = array ();
        $id = strtoupper ($market['id']);
        if ($type == 'market') {
            $order['params'] = array (null, $amount, $id);
        } else {
            $order['params'] = array ($price, $amount, $id);
        }
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = $params['market']; // TODO fixme
        return $this->privatePostCancelOrder (array_merge (array (
            'params' => array ($id, $market),
        ), $params));
    }

    public function nonce () {
        return $this->microseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $path;
        if ($api == 'private') {
            if (!$this->apiKey)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.apiKey` property for authentication');
            if (!$this->secret)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.secret` property for authentication');
            $p = array ();
            if (array_key_exists ('params', $params))
                $p = $params['params'];
            $nonce = $this->nonce ();
            $request = array (
                'method' => $path,
                'id' => $nonce,
                'params' => $p,
            );
            $p = implode (',', $p);
            $body = $this->json ($request);
            $query = (
                'tonce=' . $nonce +
                '&accesskey=' . $this->apiKey +
                '&requestmethod=' . strtolower ($method) +
                '&id=' . $nonce +
                '&$method=' . $path +
                '&$params=' . $p
            );
            $signature = $this->hmac ($this->encode ($query), $this->encode ($this->secret), 'sha1');
            $auth = $this->apiKey . ':' . $signature;
            $headers = array (
                'Authorization' => 'Basic ' . base64_encode ($auth),
                'Json-Rpc-Tonce' => $nonce,
            );
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class btce extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btce',
            'name' => 'BTC-e',
            'comment' => 'Base API for many markets, including Liqui, WEX, Tidex, DSX, YoBit...',
            'version' => '3',
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchTickers' => true,
            'hasFetchMyTrades' => true,
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                ),
            ),
        ), $options));
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $key = 'quote';
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision ($symbol, $amount * $rate));
        if ($side == 'sell') {
            $cost *= $price;
        } else {
            $key = 'base';
        }
        return array (
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => $cost,
        );
    }

    public function common_currency_code ($currency) {
        if (!$this->substituteCommonCurrencyCodes)
            return $currency;
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        // they misspell DASH as dsh :/
        if ($currency == 'DSH')
            return 'DASH';
        return $currency;
    }

    public function getBaseQuoteFromMarketId ($id) {
        $uppercase = strtoupper ($id);
        list ($base, $quote) = explode ('_', $uppercase);
        $base = $this->common_currency_code ($base);
        $quote = $this->common_currency_code ($quote);
        return array ($base, $quote);
    }

    public function fetch_markets () {
        $response = $this->publicGetInfo ();
        $markets = $response['pairs'];
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $market = $markets[$id];
            list ($base, $quote) = $this->getBaseQuoteFromMarketId ($id);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $this->safe_integer ($market, 'decimal_places'),
                'price' => $this->safe_integer ($market, 'decimal_places'),
            );
            $amountLimits = array (
                'min' => $this->safe_float ($market, 'min_amount'),
                'max' => $this->safe_float ($market, 'max_amount'),
            );
            $priceLimits = array (
                'min' => $this->safe_float ($market, 'min_price'),
                'max' => $this->safe_float ($market, 'max_price'),
            );
            $costLimits = array (
                'min' => $this->safe_float ($market, 'min_total'),
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
                'cost' => $costLimits,
            );
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'taker' => $market['fee'] / 100,
                'lot' => $amountLimits['min'],
                'precision' => $precision,
                'limits' => $limits,
                'info' => $market,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $funds = $balances['funds'];
        $currencies = array_keys ($funds);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $uppercase = $this->common_currency_code ($uppercase);
            $total = null;
            $used = null;
            if ($balances['open_orders'] == 0) {
                $total = $funds[$currency];
                $used = 0.0;
            }
            $account = array (
                'free' => $funds[$currency],
                'used' => $used,
                'total' => $total,
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetDepthPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $market_id_in_reponse = (array_key_exists ($market['id'], $response));
        if (!$market_id_in_reponse)
            throw new ExchangeError ($this->id . ' ' . $market['symbol'] . ' order book is empty or not available');
        $orderbook = $response[$market['id']];
        $result = $this->parse_order_book ($orderbook);
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'buy'),
            'ask' => $this->safe_float ($ticker, 'sell'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float ($ticker, 'avg'),
            'baseVolume' => $this->safe_float ($ticker, 'vol_cur'),
            'quoteVolume' => $this->safe_float ($ticker, 'vol'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $ids = null;
        if (!$symbols) {
            $numIds = count ($this->ids);
            if ($numIds > 256)
                throw new ExchangeError ($this->id . ' fetchTickers() requires $symbols argument');
            $ids = $this->ids;
        } else {
            $ids = $this->market_ids ($symbols);
        }
        $tickers = $this->publicGetTickerPair (array_merge (array (
            'pair' => implode ('-', $ids),
        ), $params));
        $result = array ();
        $keys = array_keys ($tickers);
        for ($k = 0; $k < count ($keys); $k++) {
            $id = $keys[$k];
            $ticker = $tickers[$id];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $tickers = $this->fetch_tickers (array ($symbol), $params);
        return $tickers[$symbol];
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['timestamp'] * 1000;
        $side = $trade['type'];
        if ($side == 'ask')
            $side = 'sell';
        if ($side == 'bid')
            $side = 'buy';
        $price = $this->safe_float ($trade, 'price');
        if (array_key_exists ('rate', $trade))
            $price = $this->safe_float ($trade, 'rate');
        $id = $this->safe_string ($trade, 'tid');
        if (array_key_exists ('trade_id', $trade))
            $id = $this->safe_string ($trade, 'trade_id');
        $order = $this->safe_string ($trade, $this->getOrderIdKey ());
        $fee = null;
        return array (
            'id' => $id,
            'order' => $order,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => 'limit',
            'side' => $side,
            'price' => $price,
            'amount' => $trade['amount'],
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response[$market['id']], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
            'type' => $side,
            'amount' => $this->amount_to_precision ($symbol, $amount),
            'rate' => $this->price_to_precision ($symbol, $price),
        );
        $response = $this->privatePostTrade (array_merge ($request, $params));
        $id = $this->safe_string ($response['return'], $this->getOrderIdKey ());
        if (!$id)
            $id = $this->safe_string ($response['return'], 'init_order_id');
        $timestamp = $this->milliseconds ();
        $price = floatval ($price);
        $amount = floatval ($amount);
        $order = array (
            'id' => $id,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'remaining' => $amount,
            'filled' => 0.0,
            'fee' => null,
            // 'trades' => $this->parse_trades ($order['trades'], $market),
        );
        $this->orders[$id] = $order;
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function getOrderIdKey () {
        return 'order_id';
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $request = array ();
            $idKey = $this->getOrderIdKey ();
            $request[$idKey] = $id;
            $response = $this->privatePostCancelOrder (array_merge ($request, $params));
            if (array_key_exists ($id, $this->orders))
                $this->orders[$id]['status'] = 'canceled';
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'error');
                if (mb_strpos ($message, 'not found') !== false)
                    throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $id = (string) $order['id'];
        $status = $order['status'];
        if ($status == 0) {
            $status = 'open';
        } else if ($status == 1) {
            $status = 'closed';
        } else if (($status == 2) || ($status == 3)) {
            $status = 'canceled';
        }
        $timestamp = $order['timestamp_created'] * 1000;
        $symbol = null;
        if (!$market)
            $market = $this->markets_by_id[$order['pair']];
        if ($market)
            $symbol = $market['symbol'];
        $remaining = $this->safe_float ($order, 'amount');
        $amount = $this->safe_float ($order, 'start_amount', $remaining);
        if ($amount === null) {
            if (array_key_exists ($id, $this->orders)) {
                $amount = $this->safe_float ($this->orders[$id], 'amount');
            }
        }
        $price = $this->safe_float ($order, 'rate');
        $filled = null;
        $cost = null;
        if ($amount !== null) {
            $filled = $amount - $remaining;
            $cost = $price * $filled;
        }
        $fee = null;
        $result = array (
            'info' => $order,
            'id' => $id,
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'type' => 'limit',
            'side' => $order['type'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'remaining' => $remaining,
            'filled' => $filled,
            'status' => $status,
            'fee' => $fee,
        );
        return $result;
    }

    public function parse_orders ($orders, $market = null) {
        $ids = array_keys ($orders);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $order = $orders[$id];
            $extended = array_merge ($order, array ( 'id' => $id ));
            $result[] = $this->parse_order ($extended, $market);
        }
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOrderInfo (array_merge (array (
            'order_id' => intval ($id),
        ), $params));
        $order = $this->parse_order (array_merge (array ( 'id' => $id ), $response['return'][$id]));
        $this->orders[$id] = array_merge ($this->orders[$id], $order);
        return $order;
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a symbol');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array ( 'pair' => $market['id'] );
        $response = $this->privatePostActiveOrders (array_merge ($request, $params));
        $openOrders = array ();
        if (array_key_exists ('return', $response))
            $openOrders = $this->parse_orders ($response['return'], $market);
        for ($j = 0; $j < count ($openOrders); $j++) {
            $this->orders[$openOrders[$j]['id']] = $openOrders[$j];
        }
        $openOrdersIndexedById = $this->index_by ($openOrders, 'id');
        $cachedOrderIds = array_keys ($this->orders);
        $result = array ();
        for ($k = 0; $k < count ($cachedOrderIds); $k++) {
            $id = $cachedOrderIds[$k];
            if (array_key_exists ($id, $openOrdersIndexedById)) {
                $this->orders[$id] = array_merge ($this->orders[$id], $openOrdersIndexedById[$id]);
            } else {
                $order = $this->orders[$id];
                if ($order['status'] == 'open') {
                    $this->orders[$id] = array_merge ($order, array (
                        'status' => 'closed',
                        'cost' => $order['amount'] * $order['price'],
                        'filled' => $order['amount'],
                        'remaining' => 0.0,
                    ));
                }
            }
            $order = $this->orders[$id];
            if ($order['symbol'] == $symbol)
                $result[] = $order;
        }
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'open')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'closed')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array_merge (array (
            // 'from' => 123456789, // trade ID, from which the display starts numerical 0
            'count' => 1000, // the number of $trades for display numerical, default = 1000
            // 'from_id' => trade ID, from which the display starts numerical 0
            // 'end_id' => trade ID on which the display ends numerical ∞
            // 'order' => 'ASC', // sorting, default = DESC
            // 'since' => 1234567890, // UTC start time, default = 0
            // 'end' => 1234567890, // UTC end time, default = ∞
            // 'pair' => 'eth_btc', // default = all markets
        ), $params);
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['pair'] = $market['id'];
        }
        $response = $this->privatePostTradeHistory ($request);
        $trades = array ();
        if (array_key_exists ('return', $response))
            $trades = $response['return'];
        return $this->parse_trades ($trades, $market);
    }

    public function signBodyWithSecret ($body) {
        return $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512');
    }

    public function getVersionString () {
        return '/' . $this->version;
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'private') {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'method' => $path,
            ), $query));
            $signature = $this->signBodyWithSecret ($body);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $signature,
            );
        } else {
            $url .= $this->getVersionString () . '/' . $this->implode_params ($path, $params);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response)) {
            if (!$response['success']) {
                if (mb_strpos ($response['error'], 'Not enougth') !== false) { // not enougTh is a typo inside Liqui's own API...
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                } else if ($response['error'] == 'Requests too often') {
                    throw new DDoSProtection ($this->id . ' ' . $this->json ($response));
                } else if (($response['error'] == 'not available') || ($response['error'] == 'external service unavailable')) {
                    throw new DDoSProtection ($this->id . ' ' . $this->json ($response));
                } else {
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
                }
            }
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class btcmarkets extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcmarkets',
            'name' => 'BTC Markets',
            'countries' => 'AU', // Australia
            'rateLimit' => 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
                'api' => 'https://api.btcmarkets.net',
                'www' => 'https://btcmarkets.net/',
                'doc' => 'https://github.com/BTCMarkets/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'market/{id}/tick',
                        'market/{id}/orderbook',
                        'market/{id}/trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account/balance',
                        'account/{id}/tradingfee',
                    ),
                    'post' => array (
                        'fundtransfer/withdrawCrypto',
                        'fundtransfer/withdrawEFT',
                        'order/create',
                        'order/cancel',
                        'order/history',
                        'order/open',
                        'order/trade/history',
                        'order/createBatch', // they promise it's coming soon...
                        'order/detail',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/AUD' => array ( 'id' => 'BTC/AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'LTC/AUD' => array ( 'id' => 'LTC/AUD', 'symbol' => 'LTC/AUD', 'base' => 'LTC', 'quote' => 'AUD' ),
                'ETH/AUD' => array ( 'id' => 'ETH/AUD', 'symbol' => 'ETH/AUD', 'base' => 'ETH', 'quote' => 'AUD' ),
                'ETC/AUD' => array ( 'id' => 'ETC/AUD', 'symbol' => 'ETC/AUD', 'base' => 'ETC', 'quote' => 'AUD' ),
                'XRP/AUD' => array ( 'id' => 'XRP/AUD', 'symbol' => 'XRP/AUD', 'base' => 'XRP', 'quote' => 'AUD' ),
                'BCH/AUD' => array ( 'id' => 'BCH/AUD', 'symbol' => 'BCH/AUD', 'base' => 'BCH', 'quote' => 'AUD' ),
                'LTC/BTC' => array ( 'id' => 'LTC/BTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/BTC' => array ( 'id' => 'ETH/BTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETC/BTC' => array ( 'id' => 'ETC/BTC', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC' ),
                'XRP/BTC' => array ( 'id' => 'XRP/BTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'BCH/BTC' => array ( 'id' => 'BCH/BTC', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetAccountBalance ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $multiplier = 100000000;
            $free = floatval ($balance['balance'] / $multiplier);
            $used = floatval ($balance['pendingFunds'] / $multiplier);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $this->sum ($free, $used),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetMarketIdOrderbook (array_merge (array (
            'id' => $market['id'],
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bestBid']),
            'ask' => floatval ($ticker['bestAsk']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume24h']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetMarketIdTick (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketIdTrades (array_merge (array (
            // 'since' => 59868345231,
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $multiplier = 100000000; // for $price and volume
        // does BTC Markets support $market orders at all?
        $orderSide = ($side == 'buy') ? 'Bid' : 'Ask';
        $order = $this->ordered (array (
            'currency' => $market['quote'],
            'instrument' => $market['base'],
            'price' => $price * $multiplier,
            'volume' => $amount * $multiplier,
            'orderSide' => $orderSide,
            'ordertype' => $this->capitalize ($type),
            'clientRequestId' => (string) $this->nonce (),
        ));
        $response = $this->privatePostOrderCreate (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_orders ($ids) {
        $this->load_markets ();
        return $this->privatePostOrderCancel (array ( 'order_ids' => $ids ));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->cancelOrders (array ($id));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $uri = '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $uri;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $auth = $uri . "\n" . $nonce . "\n";
            $headers = array (
                'Content-Type' => 'application/json',
                'apikey' => $this->apiKey,
                'timestamp' => $nonce,
            );
            if ($method == 'POST') {
                $body = $this->urlencode ($query);
                $auth .= $body;
            }
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64');
            $headers['signature'] = $this->decode ($signature);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private') {
            if (array_key_exists ('success', $response))
                if (!$response['success'])
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            return $response;
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class btctrader extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btctrader',
            'name' => 'BTCTrader',
            'countries' => array ( 'TR', 'GR', 'PH' ), // Turkey, Greece, Philippines
            'rateLimit' => 1000,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1d' => '1d',
            ),
            'comment' => 'base API for BTCExchange, BTCTurk',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27992404-cda1e386-649c-11e7-8dc1-40bbd2897768.jpg',
                'api' => 'https://www.btctrader.com/api',
                'www' => 'https://www.btctrader.com',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ohlcdata', // ?last=COUNT
                        'orderbook',
                        'ticker',
                        'trades',   // ?last=COUNT (max 50)
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'balance',
                        'openOrders',
                        'userTransactions', // ?offset=0&limit=25&sort=asc
                    ),
                    'post' => array (
                        'buy',
                        'cancelOrder',
                        'sell',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetBalance ();
        $result = array ( 'info' => $response );
        $base = array (
            'free' => $response['bitcoin_available'],
            'used' => $response['bitcoin_reserved'],
            'total' => $response['bitcoin_balance'],
        );
        $quote = array (
            'free' => $response['money_available'],
            'used' => $response['money_reserved'],
            'total' => $response['money_balance'],
        );
        $symbol = $this->symbols[0];
        $market = $this->markets[$symbol];
        $result[$market['base']] = $base;
        $result[$market['quote']] = $quote;
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'pairSymbol' => $market['id'],
        ), $params));
        $timestamp = intval ($orderbook['timestamp'] * 1000);
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function parse_ticker ($ticker, $market = null) {
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['average']),
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTicker ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $symbol = $ticker['pair'];
            $market = null;
            if (array_key_exists ($symbol, $this->markets_by_id)) {
                $market = $this->markets_by_id[$symbol];
                $symbol = $market['symbol'];
            }
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->fetch_tickers ();
        $result = null;
        if (array_key_exists ($symbol, $tickers))
            $result = $tickers[$symbol];
        return $result;
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        // $maxCount = 50;
        $response = $this->publicGetTrades (array_merge (array (
            'pairSymbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['Time']);
        return [
            $timestamp,
            $ohlcv['Open'],
            $ohlcv['High'],
            $ohlcv['Low'],
            $ohlcv['Close'],
            $ohlcv['Volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array ();
        if ($limit)
            $request['last'] = $limit;
        $response = $this->publicGetOhlcdata (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'Type' => ($side == 'buy') ? 'BuyBtc' : 'SelBtc',
            'IsMarketOrder' => ($type == 'market') ? 1 : 0,
        );
        if ($type == 'market') {
            if ($side == 'buy')
                $order['Total'] = $amount;
            else
                $order['Amount'] = $amount;
        } else {
            $order['Price'] = $price;
            $order['Amount'] = $amount;
        }
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'btctrader')
            throw new ExchangeError ($this->id . ' is an abstract base API for BTCExchange, BTCTurk');
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ().toString;
            $body = $this->urlencode ($params);
            $secret = $this->base64ToString ($this->secret);
            $auth = $this->apiKey . $nonce;
            $headers = array (
                'X-PCK' => $this->apiKey,
                'X-Stamp' => (string) $nonce,
                'X-Signature' => $this->hmac ($this->encode ($auth), $secret, 'sha256', 'base64'),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class btcexchange extends btctrader {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcexchange',
            'name' => 'BTCExchange',
            'countries' => 'PH', // Philippines
            'rateLimit' => 1500,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api' => 'https://www.btcexchange.ph/api',
                'www' => 'https://www.btcexchange.ph',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'markets' => array (
                'BTC/PHP' => array ( 'id' => 'BTC/PHP', 'symbol' => 'BTC/PHP', 'base' => 'BTC', 'quote' => 'PHP' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class btctradeua extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btctradeua',
            'name' => 'BTC Trade UA',
            'countries' => 'UA', // Ukraine,
            'rateLimit' => 3000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
                'api' => 'https://btc-trade.com.ua/api',
                'www' => 'https://btc-trade.com.ua',
                'doc' => 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'deals/{symbol}',
                        'trades/sell/{symbol}',
                        'trades/buy/{symbol}',
                        'japan_stat/high/{symbol}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'auth',
                        'ask/{symbol}',
                        'balance',
                        'bid/{symbol}',
                        'buy/{symbol}',
                        'my_orders/{symbol}',
                        'order/status/{id}',
                        'remove/order/{id}',
                        'sell/{symbol}',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/UAH' => array ( 'id' => 'btc_uah', 'symbol' => 'BTC/UAH', 'base' => 'BTC', 'quote' => 'UAH' ),
                'ETH/UAH' => array ( 'id' => 'eth_uah', 'symbol' => 'ETH/UAH', 'base' => 'ETH', 'quote' => 'UAH' ),
                'LTC/UAH' => array ( 'id' => 'ltc_uah', 'symbol' => 'LTC/UAH', 'base' => 'LTC', 'quote' => 'UAH' ),
                'DOGE/UAH' => array ( 'id' => 'doge_uah', 'symbol' => 'DOGE/UAH', 'base' => 'DOGE', 'quote' => 'UAH' ),
                'DASH/UAH' => array ( 'id' => 'dash_uah', 'symbol' => 'DASH/UAH', 'base' => 'DASH', 'quote' => 'UAH' ),
                'SIB/UAH' => array ( 'id' => 'sib_uah', 'symbol' => 'SIB/UAH', 'base' => 'SIB', 'quote' => 'UAH' ),
                'KRB/UAH' => array ( 'id' => 'krb_uah', 'symbol' => 'KRB/UAH', 'base' => 'KRB', 'quote' => 'UAH' ),
                'NVC/UAH' => array ( 'id' => 'nvc_uah', 'symbol' => 'NVC/UAH', 'base' => 'NVC', 'quote' => 'UAH' ),
                'LTC/BTC' => array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'NVC/BTC' => array ( 'id' => 'nvc_btc', 'symbol' => 'NVC/BTC', 'base' => 'NVC', 'quote' => 'BTC' ),
                'ITI/UAH' => array ( 'id' => 'iti_uah', 'symbol' => 'ITI/UAH', 'base' => 'ITI', 'quote' => 'UAH' ),
                'DOGE/BTC' => array ( 'id' => 'doge_btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'DASH/BTC' => array ( 'id' => 'dash_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function sign_in () {
        return $this->privatePostAuth ();
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostBalance ();
        $result = array ( 'info' => $response );
        if (array_key_exists ('accounts', $response)) {
            $accounts = $response['accounts'];
            for ($b = 0; $b < count ($accounts); $b++) {
                $account = $accounts[$b];
                $currency = $account['currency'];
                $balance = floatval ($account['balance']);
                $result[$currency] = array (
                    'free' => $balance,
                    'used' => 0.0,
                    'total' => $balance,
                );
            }
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $bids = $this->publicGetTradesBuySymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $asks = $this->publicGetTradesSellSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $orderbook = array (
            'bids' => array (),
            'asks' => array (),
        );
        if ($bids) {
            if (array_key_exists ('list', $bids))
                $orderbook['bids'] = $bids['list'];
        }
        if ($asks) {
            if (array_key_exists ('list', $asks))
                $orderbook['asks'] = $asks['list'];
        }
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'currency_trade');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetJapanStatHighSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        $orderbook = $this->fetch_order_book ($symbol);
        $bid = null;
        $numBids = count ($orderbook['bids']);
        if ($numBids > 0)
            $bid = $orderbook['bids'][0][0];
        $ask = null;
        $numAsks = count ($orderbook['asks']);
        if ($numAsks > 0)
            $ask = $orderbook['asks'][0][0];
        $ticker = $response['trades'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => null,
            'info' => $ticker,
        );
        $tickerLength = count ($ticker);
        if ($tickerLength > 0) {
            $start = max ($tickerLength - 48, 0);
            for ($t = $start; $t < count ($ticker); $t++) {
                $candle = $ticker[$t];
                if ($result['open'] == null)
                    $result['open'] = $candle[1];
                if (($result['high'] == null) || ($result['high'] < $candle[2]))
                    $result['high'] = $candle[2];
                if (($result['low'] == null) || ($result['low'] > $candle[3]))
                    $result['low'] = $candle[3];
                if ($result['quoteVolume'] == null)
                    $result['quoteVolume'] = -$candle[5];
                else
                    $result['quoteVolume'] -= $candle[5];
            }
            $last = $tickerLength - 1;
            $result['close'] = $ticker[$last][4];
            $result['quoteVolume'] = -1 * $result['quoteVolume'];
        }
        return $result;
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->milliseconds (); // until we have a better solution for python
        return array (
            'id' => (string) $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amnt_trade']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetDealsSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $market = $this->market ($symbol);
        $method = 'privatePost' . $this->capitalize ($side) . 'Id';
        $order = array (
            'count' => $amount,
            'currency1' => $market['quote'],
            'currency' => $market['base'],
            'price' => $price,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostRemoveOrderId (array ( 'id' => $id ));
    }

    public function parse_order ($trade, $market) {
        $timestamp = $this->milliseconds;
        return array (
            'id' => $trade['id'],
            'timestamp' => $timestamp, // until they fix their $timestamp
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amnt_trade'],
            'filled' => 0,
            'remaining' => $trade['amnt_trade'],
            'trades' => null,
            'info' => $trade,
        );
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privatePostMyOrdersSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $orders = $response['your_open_orders'];
        return $this->parse_orders ($orders, $market);
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= $this->implode_params ($path, $query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'out_order_id' => $nonce,
                'nonce' => $nonce,
            ), $query));
            $auth = $body . $this->secret;
            $headers = array (
                'public-key' => $this->apiKey,
                'api-sign' => $this->hash ($this->encode ($auth), 'sha256'),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class btcturk extends btctrader {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcturk',
            'name' => 'BTCTurk',
            'countries' => 'TR', // Turkey
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api' => 'https://www.btcturk.com/api',
                'www' => 'https://www.btcturk.com',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'markets' => array (
                'BTC/TRY' => array ( 'id' => 'BTCTRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY' ),
                'ETH/TRY' => array ( 'id' => 'ETHTRY', 'symbol' => 'ETH/TRY', 'base' => 'ETH', 'quote' => 'TRY' ),
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class btcx extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'btcx',
            'name' => 'BTCX',
            'countries' => array ( 'IS', 'US', 'EU' ),
            'rateLimit' => 1500, // support in english is very poor, unable to tell rate limits
            'version' => 'v1',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg',
                'api' => 'https://btc-x.is/api',
                'www' => 'https://btc-x.is',
                'doc' => 'https://btc-x.is/custom/api-document.html',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth/{id}/{limit}',
                        'ticker/{id}',
                        'trade/{id}/{limit}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance',
                        'cancel',
                        'history',
                        'order',
                        'redeem',
                        'trade',
                        'withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btc/usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'btc/eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => $balances[$currency],
                'used' => 0.0,
                'total' => $balances[$currency],
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetDepthIdLimit (array_merge (array (
            'id' => $this->market_id ($symbol),
            'limit' => 1000,
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerId (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $ticker['time'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['sell']),
            'ask' => floatval ($ticker['buy']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        $side = ($trade['type'] == 'ask') ? 'sell' : 'buy';
        return array (
            'id' => $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTradeIdLimit (array_merge (array (
            'id' => $market['id'],
            'limit' => 1000,
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $response = $this->privatePostTrade (array_merge (array (
            'type' => strtoupper ($side),
            'market' => $this->market_id ($symbol),
            'amount' => $amount,
            'price' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['order']['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ( 'order' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/';
        if ($api == 'public') {
            $url .= $this->implode_params ($path, $params);
        } else {
            $nonce = $this->nonce ();
            $url .= $api;
            $body = $this->urlencode (array_merge (array (
                'Method' => strtoupper ($path),
                'Nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Signature' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bter extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bter',
            'name' => 'Bter',
            'countries' => array ( 'VG', 'CN' ), // British Virgin Islands, China
            'version' => '2',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27980479-cfa3188c-6387-11e7-8191-93fc4184ba5c.jpg',
                'api' => array (
                    'public' => 'https://data.bter.com/api',
                    'private' => 'https://api.bter.com/api',
                ),
                'www' => 'https://bter.com',
                'doc' => 'https://bter.com/api2',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'pairs',
                        'marketinfo',
                        'marketlist',
                        'tickers',
                        'ticker/{id}',
                        'orderBook/{id}',
                        'trade/{id}',
                        'tradeHistory/{id}',
                        'tradeHistory/{id}/{tid}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balances',
                        'depositAddress',
                        'newAddress',
                        'depositsWithdrawals',
                        'buy',
                        'sell',
                        'cancelOrder',
                        'cancelAllOrders',
                        'getOrder',
                        'openOrders',
                        'tradeHistory',
                        'withdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $response = $this->publicGetMarketinfo ();
        $markets = $response['pairs'];
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $keys = array_keys ($market);
            $id = $keys[0];
            $details = $market[$id];
            list ($base, $quote) = explode ('_', $id);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $details['decimal_places'],
                'price' => $details['decimal_places'],
            );
            $amountLimits = array (
                'min' => $details['min_amount'],
                'max' => null,
            );
            $priceLimits = array (
                'min' => null,
                'max' => null,
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'maker' => $details['fee'] / 100,
                'taker' => $details['fee'] / 100,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balance = $this->privatePostBalances ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $code = $this->common_currency_code ($currency);
            $account = $this->account ();
            if (array_key_exists ('available', $balance)) {
                if (array_key_exists ($currency, $balance['available'])) {
                    $account['free'] = floatval ($balance['available'][$currency]);
                }
            }
            if (array_key_exists ('locked', $balance)) {
                if (array_key_exists ($currency, $balance['locked'])) {
                    $account['used'] = floatval ($balance['locked'][$currency]);
                }
            }
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$code] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderBookId (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $result = $this->parse_order_book ($orderbook);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high24hr']),
            'low' => floatval ($ticker['low24hr']),
            'bid' => floatval ($ticker['highestBid']),
            'ask' => floatval ($ticker['lowestAsk']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => floatval ($ticker['percentChange']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['quoteVolume']),
            'quoteVolume' => floatval ($ticker['baseVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTickers ($params);
        $result = array ();
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            list ($baseId, $quoteId) = explode ('_', $id);
            $base = strtoupper ($baseId);
            $quote = strtoupper ($quoteId);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $ticker = $tickers[$id];
            $market = null;
            if (array_key_exists ($symbol, $this->markets))
                $market = $this->markets[$symbol];
            if (array_key_exists ($id, $this->markets_by_id))
                $market = $this->markets_by_id[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['date']);
        return array (
            'id' => $trade['tradeID'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['rate'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $this->load_markets ();
        $response = $this->publicGetTradeHistoryId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['data'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets ();
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'currencyPair' => $this->market_id ($symbol),
            'rate' => $price,
            'amount' => $amount,
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['orderNumber'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array ( 'orderNumber' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $prefix = ($api == 'private') ? ($api . '/') : '';
        $url = $this->urls['api'][$api] . $this->version . '/1/' . $prefix . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array ( 'nonce' => $nonce );
            $body = $this->urlencode (array_merge ($request, $query));
            $signature = $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512');
            $headers = array (
                'Key' => $this->apiKey,
                'Sign' => $signature,
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] != 'true')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class bxinth extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'bxinth',
            'name' => 'BX.in.th',
            'countries' => 'TH', // Thailand
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
                'api' => 'https://bx.in.th/api',
                'www' => 'https://bx.in.th',
                'doc' => 'https://bx.in.th/info/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '', // ticker
                        'options',
                        'optionbook',
                        'orderbook',
                        'pairing',
                        'trade',
                        'tradehistory',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance',
                        'biller',
                        'billgroup',
                        'billpay',
                        'cancel',
                        'deposit',
                        'getorders',
                        'history',
                        'option-issue',
                        'option-bid',
                        'option-sell',
                        'option-myissue',
                        'option-mybid',
                        'option-myoptions',
                        'option-exercise',
                        'option-cancel',
                        'option-history',
                        'order',
                        'withdrawal',
                        'withdrawal-history',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetPairing ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $market = $markets[$keys[$p]];
            $id = (string) $market['pairing_id'];
            $base = $market['secondary_currency']
            $quote = $market['primary_currency'];;
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function common_currency_code ($currency) {
        // why would they use three letters instead of four for $currency codes
        if ($currency == 'DAS')
            return 'DASH';
        if ($currency == 'DOG')
            return 'DOGE';
        return $currency;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostBalance ();
        $balance = $response['balance'];
        $result = array ( 'info' => $balance );
        $currencies = array_keys ($balance);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $code = $this->common_currency_code ($currency);
            $account = array (
                'free' => floatval ($balance[$currency]['available']),
                'used' => 0.0,
                'total' => floatval ($balance[$currency]['total']),
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$code] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'pairing' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['orderbook']['bids']['highbid']),
            'ask' => floatval ($ticker['orderbook']['asks']['highbid']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => floatval ($ticker['change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume_24hours']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGet ($params);
        $result = array ();
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $ticker = $tickers[$id];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $tickers = $this->publicGet (array_merge (array (
            'pairing' => $market['id'],
        ), $params));
        $id = (string) $market['id'];
        $ticker = $tickers[$id];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['trade_date']);
        return array (
            'id' => $trade['trade_id'],
            'info' => $trade,
            'order' => $trade['order_id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['trade_type'],
            'price' => floatval ($trade['rate']),
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrade (array_merge (array (
            'pairing' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOrder (array_merge (array (
            'pairing' => $this->market_id ($symbol),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $pairing = null; // TODO fixme
        return $this->privatePostCancel (array (
            'order_id' => $id,
            'pairing' => $pairing,
        ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($path)
            $url .= $path . '/';
        if ($params)
            $url .= '?' . $this->urlencode ($params);
        if ($api == 'private') {
            $nonce = $this->nonce ();
            $auth = $this->apiKey . (string) $nonce . $this->secret;
            $signature = $this->hash ($this->encode ($auth), 'sha256');
            $body = $this->urlencode (array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
                // twofa => $this->twofa,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'public')
            return $response;
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class ccex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'ccex',
            'name' => 'C-CEX',
            'countries' => array ( 'DE', 'EU' ),
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
                'api' => array (
                    'tickers' => 'https://c-cex.com/t',
                    'public' => 'https://c-cex.com/t/api_pub.html',
                    'private' => 'https://c-cex.com/t/api.html',
                ),
                'www' => 'https://c-cex.com',
                'doc' => 'https://c-cex.com/?id=api',
            ),
            'api' => array (
                'tickers' => array (
                    'get' => array (
                        'coinnames',
                        '{market}',
                        'pairs',
                        'prices',
                        'volume_{coin}',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'balancedistribution',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'orderbook',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'buylimit',
                        'cancel',
                        'getbalance',
                        'getbalances',
                        'getopenorders',
                        'getorder',
                        'getorderhistory',
                        'mytrades',
                        'selllimit',
                    ),
                ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'IOT')
            return 'IoTcoin';
        if ($currency == 'BLC')
            return 'Cryptobullcoin';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets['result']); $p++) {
            $market = $markets['result'][$p];
            $id = $market['MarketName'];
            $base = $market['MarketCurrency'];
            $quote = $market['BaseCurrency'];
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['Currency'];
            $currency = $this->common_currency_code ($code);
            $account = array (
                'free' => $balance['Available'],
                'used' => $balance['Pending'],
                'total' => $balance['Balance'],
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id ($symbol),
            'type' => 'both',
            'depth' => 100,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book ($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastprice']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['avg']),
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float ($ticker, 'buysupport'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->tickersGetPrices ($params);
        $result = array ( 'info' => $tickers );
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $ticker = $tickers[$id];
            $uppercase = strtoupper ($id);
            $market = null;
            $symbol = null;
            if (array_key_exists ($uppercase, $this->markets_by_id)) {
                $market = $this->markets_by_id[$uppercase];
                $symbol = $market['symbol'];
            } else {
                list ($base, $quote) = explode ('-', $uppercase);
                $base = $this->common_currency_code ($base);
                $quote = $this->common_currency_code ($quote);
                $symbol = $base . '/' . $quote;
            }
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->tickersGetMarket (array_merge (array (
            'market' => strtolower ($market['id']),
        ), $params));
        $ticker = $response['ticker'];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['TimeStamp']);
        return array (
            'id' => $trade['Id'],
            'info' => $trade,
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => strtolower ($trade['OrderType']),
            'price' => $trade['Price'],
            'amount' => $trade['Quantity'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarkethistory (array_merge (array (
            'market' => $market['id'],
            'type' => 'both',
            'depth' => 100,
        ), $params));
        return $this->parse_trades ($response['result'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $method = 'privateGet' . $this->capitalize ($side) . $type;
        $response = $this->$method (array_merge (array (
            'market' => $this->market_id ($symbol),
            'quantity' => $amount,
            'rate' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateGetCancel (array ( 'uuid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'private') {
            $nonce = (string) $this->nonce ();
            $query = $this->keysort (array_merge (array (
                'a' => $path,
                'apikey' => $this->apiKey,
                'nonce' => $nonce,
            ), $params));
            $url .= '?' . $this->urlencode ($query);
            $headers = array ( 'apisign' => $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512') );
        } else if ($api == 'public') {
            $url .= '?' . $this->urlencode (array_merge (array (
                'a' => 'get' . $path,
            ), $params));
        } else {
            $url .= '/' . $this->implode_params ($path, $params) . '.json';
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'tickers')
            return $response;
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class cex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'cex',
            'name' => 'CEX.IO',
            'countries' => array ( 'GB', 'EU', 'CY', 'RU' ),
            'rateLimit' => 1500,
            'hasCORS' => true,
            'hasFetchOHLCV' => true,
            'hasFetchTickers' => false,
            'hasFetchOpenOrders' => true,
            'timeframes' => array (
                '1m' => '1m',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api' => 'https://cex.io/api',
                'www' => 'https://cex.io',
                'doc' => 'https://cex.io/cex-api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency_limits/',
                        'last_price/{pair}/',
                        'last_prices/{currencies}/',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}/',
                        'ticker/{pair}/',
                        'tickers/{currencies}/',
                        'trade_history/{pair}/',
                    ),
                    'post' => array (
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'active_orders_status/',
                        'archived_orders/{pair}/',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}/',
                        'cancel_replace_order/{pair}/',
                        'close_position/{pair}/',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}/',
                        'open_orders/',
                        'open_position/{pair}/',
                        'open_positions/{pair}/',
                        'place_order/{pair}/',
                    ),
                )
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0,
                    'taker' => 0.2 / 100,
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetCurrencyLimits ();
        $result = array ();
        for ($p = 0; $p < count ($markets['data']['pairs']); $p++) {
            $market = $markets['data']['pairs'][$p];
            $id = $market['symbol1'] . '/' . $market['symbol2'];
            $symbol = $id;
            list ($base, $quote) = explode ('/', $symbol);
            $precision = array (
                'price' => 4,
                'amount' => -1 * log10 ($market['minLotSize']),
            );
            $amountLimits = array (
                'min' => $market['minLotSize'],
                'max' => $market['maxLotSize'],
            );
            $priceLimits = array (
                'min' => $market['minPrice'],
                'max' => $market['maxPrice'],
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'precision' => $precision,
                'limits' => $limits,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            if (array_key_exists ($currency, $balances)) {
                $account = array (
                    'free' => floatval ($balances[$currency]['available']),
                    'used' => floatval ($balances[$currency]['orders']),
                    'total' => 0.0,
                );
                $account['total'] = $this->sum ($account['free'], $account['used']);
                $result[$currency] = $account;
            }
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderBookPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[1],
            $ohlcv[2],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        if (!$since)
            $since = $this->milliseconds () - 86400000; // yesterday
        $ymd = $this->Ymd ($since);
        $ymd = explode ('-', $ymd);
        $ymd = implode ('', $ymd);
        $request = array (
            'pair' => $market['id'],
            'yyyymmdd' => $ymd,
        );
        $response = $this->publicGetOhlcvHdYyyymmddPair (array_merge ($request, $params));
        $key = 'data' . $this->timeframes[$timeframe];
        $ohlcvs = $this->unjson ($response[$key]);
        return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = null;
        $iso8601 = null;
        if (array_key_exists ('timestamp', $ticker)) {
            $timestamp = intval ($ticker['timestamp']) * 1000;
            $iso8601 = $this->iso8601 ($timestamp);
        }
        $volume = $this->safe_float ($ticker, 'volume');
        $high = $this->safe_float ($ticker, 'high');
        $low = $this->safe_float ($ticker, 'low');
        $bid = $this->safe_float ($ticker, 'bid');
        $ask = $this->safe_float ($ticker, 'ask');
        $last = $this->safe_float ($ticker, 'last');
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $iso8601,
            'high' => $high,
            'low' => $low,
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $volume,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $currencies = implode ('/', $this->currencies);
        $response = $this->publicGetTickersCurrencies (array_merge (array (
            'currencies' => $currencies,
        ), $params));
        $tickers = $response['data'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $symbol = str_replace (':', '/', $ticker['pair']);
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'id' => $trade['tid'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradeHistoryPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'pair' => $this->market_id ($symbol),
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['order_type'] = $type;
        $response = $this->privatePostPlaceOrderPair (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostGetOrder (array_merge (array (
            'id' => (string) $id,
        ), $params));
    }

    public function parse_order ($order, $market = null) {
        $timestamp = intval ($order['time']);
        $symbol = null;
        if (!$market) {
            $symbol = $order['symbol1'] . '/' . $order['symbol2'];
            if (array_key_exists ($symbol, $this->markets))
                $market = $this->market ($symbol);
        }
        $status = $order['status'];
        if ($status == 'cd') {
            $status = 'canceled';
        } else if ($status == 'c') {
            $status = 'canceled';
        } else if ($status == 'd') {
            $status = 'closed';
        }
        $price = $this->safe_float ($order, 'price');
        $amount = $this->safe_float ($order, 'amount');
        $remaining = $this->safe_float ($order, 'pending');
        if (!$remaining)
            $remaining = $this->safe_float ($order, 'remains');
        $filled = $amount - $remaining;
        $fee = null;
        $cost = null;
        if ($market) {
            $symbol = $market['symbol'];
            $cost = $this->safe_float ($order, 'ta:' . $market['quote']);
            $baseFee = 'fa:' . $market['base'];
            $quoteFee = 'fa:' . $market['quote'];
            $feeRate = $this->safe_float ($order, 'tradingFeeMaker');
            if (!$feeRate)
                $feeRate = $this->safe_float ($order, 'tradingFeeTaker', $feeRate);
            if ($feeRate)
                $feeRate /= 100.0; // convert to mathematically-correct percentage coefficients => 1.0 = 100%
            if (array_key_exists ($baseFee, $order)) {
                $fee = array (
                    'currency' => $market['base'],
                    'rate' => $feeRate,
                    'cost' => $this->safe_float ($order, $baseFee),
                );
            } else if (array_key_exists ($quoteFee, $order)) {
                $fee = array (
                    'currency' => $market['quote'],
                    'rate' => $feeRate,
                    'cost' => $this->safe_float ($order, $quoteFee),
                );
            }
        }
        if (!$cost)
            $cost = $price * $filled;
        return array (
            'id' => $order['id'],
            'datetime' => $this->iso8601 ($timestamp),
            'timestamp' => $timestamp,
            'status' => $status,
            'symbol' => $symbol,
            'type' => null,
            'side' => $order['type'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'trades' => null,
            'fee' => $fee,
            'info' => $order,
        );
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        $method = 'privatePostOpenOrders';
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['pair'] = $market['id'];
            $method .= 'Pair';
        }
        $orders = $this->$method (array_merge ($request, $params));
        for ($i = 0; $i < count ($orders); $i++) {
            $orders[$i] = array_merge ($orders[$i], array ( 'status' => 'open' ));
        }
        return $this->parse_orders ($orders, $market);
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->urlencode (array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (!$response) {
            throw new ExchangeError ($this->id . ' returned ' . $this->json ($response));
        } else if ($response == true) {
            return $response;
        } else if (array_key_exists ('e', $response)) {
            if (array_key_exists ('ok', $response))
                if ($response['ok'] == 'ok')
                    return $response;
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        } else if (array_key_exists ('error', $response)) {
            if ($response['error'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class chbtc extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'chbtc',
            'name' => 'CHBTC',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api' => array (
                    'public' => 'http://api.chbtc.com/data', // no https for public API
                    'private' => 'https://trade.chbtc.com/api',
                ),
                'www' => 'https://trade.chbtc.com/api',
                'doc' => 'https://www.chbtc.com/i/developer',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY' ),
                'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY' ),
                'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY' ),
                'BTS/CNY' => array ( 'id' => 'bts_cny', 'symbol' => 'BTS/CNY', 'base' => 'BTS', 'quote' => 'CNY' ),
                // 'EOS/CNY' => array ( 'id' => 'eos_cny', 'symbol' => 'EOS/CNY', 'base' => 'EOS', 'quote' => 'CNY' ),
                'BCH/CNY' => array ( 'id' => 'bcc_cny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY' ),
                'HSR/CNY' => array ( 'id' => 'hsr_cny', 'symbol' => 'HSR/CNY', 'base' => 'HSR', 'quote' => 'CNY' ),
                'QTUM/CNY' => array ( 'id' => 'qtum_cny', 'symbol' => 'QTUM/CNY', 'base' => 'QTUM', 'quote' => 'CNY' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balances['balance']))
                $account['free'] = floatval ($balances['balance'][$currency]['amount']);
            if (array_key_exists ($currency, $balances['frozen']))
                $account['used'] = floatval ($balances['frozen'][$currency]['amount']);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        $timestamp = $this->milliseconds ();
        $bids = null;
        $asks = null;
        if (array_key_exists ('bids', $orderbook))
            $bids = $orderbook['bids'];
        if (array_key_exists ('asks', $orderbook))
            $asks = $orderbook['asks'];
        $result = array (
            'bids' => $bids,
            'asks' => $asks,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        if ($result['bids'])
            $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        if ($result['asks'])
            $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetTicker (array_merge (array (
            'currency' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade['date'] * 1000;
        $side = ($trade['trade_type'] == 'bid') ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $paramString = '&$price=' . (string) $price;
        $paramString .= '&$amount=' . (string) $amount;
        $tradeType = ($side == 'buy') ? '1' : '0';
        $paramString .= '&$tradeType=' . $tradeType;
        $paramString .= '&currency=' . $this->market_id ($symbol);
        $response = $this->privatePostOrder ($paramString);
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $paramString = '&$id=' . (string) $id;
        if (array_key_exists ('currency', $params))
            $paramString .= '&currency=' . $params['currency'];
        return $this->privatePostCancelOrder ($paramString);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $paramString = '&$id=' . (string) $id;
        if (array_key_exists ('currency', $params))
            $paramString .= '&currency=' . $params['currency'];
        return $this->privatePostGetOrder ($paramString);
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->version . '/' . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $paramsLength = count ($params); // $params should be a string here
            $nonce = $this->nonce ();
            $auth = 'method=' . $path;
            $auth .= '&accesskey=' . $this->apiKey;
            $auth .= $paramsLength ? $params : '';
            $secret = $this->hash ($this->encode ($this->secret), 'sha1');
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($secret), 'md5');
            $suffix = 'sign=' . $signature . '&reqTime=' . (string) $nonce;
            $url .= '/' . $path . '?' . $auth . '&' . $suffix;
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private')
            if (array_key_exists ('code', $response))
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class chilebit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'chilebit',
            'name' => 'ChileBit',
            'countries' => 'CL',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://chilebit.net',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class coincheck extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coincheck',
            'name' => 'coincheck',
            'countries' => array ( 'JP', 'ID' ),
            'rateLimit' => 1500,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
                'api' => 'https://coincheck.com/api',
                'www' => 'https://coincheck.com',
                'doc' => 'https://coincheck.com/documents/exchange/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'exchange/orders/rate',
                        'order_books',
                        'rate/{pair}',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'accounts',
                        'accounts/balance',
                        'accounts/leverage_balance',
                        'bank_accounts',
                        'deposit_money',
                        'exchange/orders/opens',
                        'exchange/orders/transactions',
                        'exchange/orders/transactions_pagination',
                        'exchange/leverage/positions',
                        'lending/borrows/matches',
                        'send_money',
                        'withdraws',
                    ),
                    'post' => array (
                        'bank_accounts',
                        'deposit_money/{id}/fast',
                        'exchange/orders',
                        'exchange/transfers/to_leverage',
                        'exchange/transfers/from_leverage',
                        'lending/borrows',
                        'lending/borrows/{id}/repay',
                        'send_money',
                        'withdraws',
                    ),
                    'delete' => array (
                        'bank_accounts/{id}',
                        'exchange/orders/{id}',
                        'withdraws/{id}',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/JPY' => array ( 'id' => 'btc_jpy', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ), // the only real pair
                // 'ETH/JPY' => array ( 'id' => 'eth_jpy', 'symbol' => 'ETH/JPY', 'base' => 'ETH', 'quote' => 'JPY' ),
                // 'ETC/JPY' => array ( 'id' => 'etc_jpy', 'symbol' => 'ETC/JPY', 'base' => 'ETC', 'quote' => 'JPY' ),
                // 'DAO/JPY' => array ( 'id' => 'dao_jpy', 'symbol' => 'DAO/JPY', 'base' => 'DAO', 'quote' => 'JPY' ),
                // 'LSK/JPY' => array ( 'id' => 'lsk_jpy', 'symbol' => 'LSK/JPY', 'base' => 'LSK', 'quote' => 'JPY' ),
                // 'FCT/JPY' => array ( 'id' => 'fct_jpy', 'symbol' => 'FCT/JPY', 'base' => 'FCT', 'quote' => 'JPY' ),
                // 'XMR/JPY' => array ( 'id' => 'xmr_jpy', 'symbol' => 'XMR/JPY', 'base' => 'XMR', 'quote' => 'JPY' ),
                // 'REP/JPY' => array ( 'id' => 'rep_jpy', 'symbol' => 'REP/JPY', 'base' => 'REP', 'quote' => 'JPY' ),
                // 'XRP/JPY' => array ( 'id' => 'xrp_jpy', 'symbol' => 'XRP/JPY', 'base' => 'XRP', 'quote' => 'JPY' ),
                // 'ZEC/JPY' => array ( 'id' => 'zec_jpy', 'symbol' => 'ZEC/JPY', 'base' => 'ZEC', 'quote' => 'JPY' ),
                // 'XEM/JPY' => array ( 'id' => 'xem_jpy', 'symbol' => 'XEM/JPY', 'base' => 'XEM', 'quote' => 'JPY' ),
                // 'LTC/JPY' => array ( 'id' => 'ltc_jpy', 'symbol' => 'LTC/JPY', 'base' => 'LTC', 'quote' => 'JPY' ),
                // 'DASH/JPY' => array ( 'id' => 'dash_jpy', 'symbol' => 'DASH/JPY', 'base' => 'DASH', 'quote' => 'JPY' ),
                // 'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                // 'ETC/BTC' => array ( 'id' => 'etc_btc', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC' ),
                // 'LSK/BTC' => array ( 'id' => 'lsk_btc', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
                // 'FCT/BTC' => array ( 'id' => 'fct_btc', 'symbol' => 'FCT/BTC', 'base' => 'FCT', 'quote' => 'BTC' ),
                // 'XMR/BTC' => array ( 'id' => 'xmr_btc', 'symbol' => 'XMR/BTC', 'base' => 'XMR', 'quote' => 'BTC' ),
                // 'REP/BTC' => array ( 'id' => 'rep_btc', 'symbol' => 'REP/BTC', 'base' => 'REP', 'quote' => 'BTC' ),
                // 'XRP/BTC' => array ( 'id' => 'xrp_btc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                // 'ZEC/BTC' => array ( 'id' => 'zec_btc', 'symbol' => 'ZEC/BTC', 'base' => 'ZEC', 'quote' => 'BTC' ),
                // 'XEM/BTC' => array ( 'id' => 'xem_btc', 'symbol' => 'XEM/BTC', 'base' => 'XEM', 'quote' => 'BTC' ),
                // 'LTC/BTC' => array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                // 'DASH/BTC' => array ( 'id' => 'dash_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->privateGetAccountsBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            if (array_key_exists ($lowercase, $balances))
                $account['free'] = floatval ($balances[$lowercase]);
            $reserved = $lowercase . '_reserved';
            if (array_key_exists ($reserved, $balances))
                $account['used'] = floatval ($balances[$reserved]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        if ($symbol != 'BTC/JPY')
            throw new NotSupported ($this->id . ' fetchOrderBook () supports BTC/JPY only');
        $orderbook = $this->publicGetOrderBooks ($params);
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        if ($symbol != 'BTC/JPY')
            throw new NotSupported ($this->id . ' fetchTicker () supports BTC/JPY only');
        $ticker = $this->publicGetTicker ($params);
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        return array (
            'id' => (string) $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['order_type'],
            'price' => floatval ($trade['rate']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        if ($symbol != 'BTC/JPY')
            throw new NotSupported ($this->id . ' fetchTrades () supports BTC/JPY only');
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades ($params);
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $prefix = '';
        $order = array (
            'pair' => $this->market_id ($symbol),
        );
        if ($type == 'market') {
            $order_type = $type . '_' . $side;
            $order['order_type'] = $order_type;
            $prefix = ($side == 'buy') ? ($order_type . '_') : '';
            $order[$prefix . 'amount'] = $amount;
        } else {
            $order['order_type'] = $side;
            $order['rate'] = $price;
            $order['amount'] = $amount;
        }
        $response = $this->privatePostExchangeOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privateDeleteExchangeOrdersId (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = $this->urlencode ($this->keysort ($query));
            $auth = $nonce . $url . ($body || '');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-NONCE' => $nonce,
                'ACCESS-SIGNATURE' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret)),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'public')
            return $response;
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class coinfloor extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coinfloor',
            'name' => 'coinfloor',
            'rateLimit' => 1000,
            'countries' => 'UK',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg',
                'api' => 'https://webapi.coinfloor.co.uk:8090/bist',
                'www' => 'https://www.coinfloor.co.uk',
                'doc' => array (
                    'https://github.com/coinfloor/api',
                    'https://www.coinfloor.co.uk/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{id}/ticker/',
                        '{id}/order_book/',
                        '{id}/transactions/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        '{id}/balance/',
                        '{id}/user_transactions/',
                        '{id}/open_orders/',
                        '{id}/cancel_order/',
                        '{id}/buy/',
                        '{id}/sell/',
                        '{id}/buy_market/',
                        '{id}/sell_market/',
                        '{id}/estimate_sell_market/',
                        '{id}/estimate_buy_market/',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/GBP' => array ( 'id' => 'XBT/GBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP' ),
                'BTC/EUR' => array ( 'id' => 'XBT/EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/USD' => array ( 'id' => 'XBT/USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/PLN' => array ( 'id' => 'XBT/PLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BCH/GBP' => array ( 'id' => 'BCH/GBP', 'symbol' => 'BCH/GBP', 'base' => 'BCH', 'quote' => 'GBP' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $symbol = null;
        if (array_key_exists ('symbol', $params))
            $symbol = $params['symbol'];
        if (array_key_exists ('id', $params))
            $symbol = $params['id'];
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchBalance requires a $symbol param');
        // todo parse balance
        return $this->privatePostIdBalance (array (
            'id' => $this->market_id ($symbol),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetIdOrderBook (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        // rewrite to get the $timestamp from HTTP headers
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => $this->safe_float ($ticker, 'vwap'),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $ticker = $this->publicGetIdTicker (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetIdTransactions (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array ( 'id' => $this->market_id ($symbol) );
        $method = 'privatePostId' . $this->capitalize ($side);
        if ($type == 'market') {
            $order['quantity'] = $amount;
            $method .= 'Market';
        } else {
            $order['price'] = $price;
            $order['amount'] = $amount;
        }
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostIdCancelOrder (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        // curl -k -u '[User ID]/[API key]:[Passphrase]' https://webapi.coinfloor.co.uk:8090/bist/XBT/GBP/balance/
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $query));
            $auth = $this->uid . '/' . $this->apiKey . ':' . $this->password;
            $signature = base64_encode ($auth);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Authorization' => 'Basic ' . $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class coingi extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coingi',
            'name' => 'Coingi',
            'rateLimit' => 1000,
            'countries' => array ( 'PA', 'BG', 'CN', 'US' ), // Panama, Bulgaria, China, US
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api' => 'https://api.coingi.com',
                'www' => 'https://coingi.com',
                'doc' => 'http://docs.coingi.apiary.io/',
            ),
            'api' => array (
                'current' => array (
                    'get' => array (
                        'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                        'transactions/{pair}/{maxCount}',
                        '24hour-rolling-aggregation',
                    ),
                ),
                'user' => array (
                    'post' => array (
                        'balance',
                        'add-order',
                        'cancel-order',
                        'orders',
                        'transactions',
                        'create-crypto-withdrawal',
                    ),
                ),
            ),
            'markets' => array (
                'LTC/BTC' => array ( 'id' => 'ltc-btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'PPC/BTC' => array ( 'id' => 'ppc-btc', 'symbol' => 'PPC/BTC', 'base' => 'PPC', 'quote' => 'BTC' ),
                'DOGE/BTC' => array ( 'id' => 'doge-btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'VTC/BTC' => array ( 'id' => 'vtc-btc', 'symbol' => 'VTC/BTC', 'base' => 'VTC', 'quote' => 'BTC' ),
                'FTC/BTC' => array ( 'id' => 'ftc-btc', 'symbol' => 'FTC/BTC', 'base' => 'FTC', 'quote' => 'BTC' ),
                'NMC/BTC' => array ( 'id' => 'nmc-btc', 'symbol' => 'NMC/BTC', 'base' => 'NMC', 'quote' => 'BTC' ),
                'DASH/BTC' => array ( 'id' => 'dash-btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $currencies = array ();
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = strtolower ($this->currencies[$c]);
            $currencies[] = $currency;
        }
        $balances = $this->userPostBalance (array (
            'currencies' => implode (',', $currencies)
        ));
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency']['name'];
            $currency = strtoupper ($currency);
            $account = array (
                'free' => $balance['available'],
                'used' => $balance['blocked'] . $balance['inOrders'] . $balance['withdrawing'],
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->currentGetOrderBookPairAskCountBidCountDepth (array_merge (array (
            'pair' => $market['id'],
            'askCount' => 512, // maximum returned number of asks 1-512
            'bidCount' => 512, // maximum returned number of bids 1-512
            'depth' => 32, // maximum number of depth range steps 1-32
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'baseAmount');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => $ticker['highestBid'],
            'ask' => $ticker['lowestAsk'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $ticker['baseVolume'],
            'quoteVolume' => $ticker['counterVolume'],
            'info' => $ticker,
        );
        return $ticker;
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $response = $this->currentGet24hourRollingAggregation ($params);
        $result = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $base = strtoupper ($ticker['currencyPair']['base']);
            $quote = strtoupper ($ticker['currencyPair']['counter']);
            $symbol = $base . '/' . $quote;
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $tickers = $this->fetch_tickers (null, $params);
        if (array_key_exists ($symbol, $tickers))
            return $tickers[$symbol];
        throw new ExchangeError ($this->id . ' return did not contain ' . $symbol);
    }

    public function parse_trade ($trade, $market = null) {
        if (!$market)
            $market = $this->markets_by_id[$trade['currencyPair']];
        return array (
            'id' => $trade['id'],
            'info' => $trade,
            'timestamp' => $trade['timestamp'],
            'datetime' => $this->iso8601 ($trade['timestamp']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null, // type
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->currentGetTransactionsPairMaxCount (array_merge (array (
            'pair' => $market['id'],
            'maxCount' => 128,
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'currencyPair' => $this->market_id ($symbol),
            'volume' => $amount,
            'price' => $price,
            'orderType' => ($side == 'buy') ? 0 : 1,
        );
        $response = $this->userPostAddOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['result'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->userPostCancelOrder (array ( 'orderId' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $api . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'current') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array_merge (array (
                'token' => $this->apiKey,
                'nonce' => $nonce,
            ), $query);
            $auth = (string) $nonce . '$' . $this->apiKey;
            $request['signature'] = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->json ($request);
            $headers = array (
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class coinmarketcap extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coinmarketcap',
            'name' => 'CoinMarketCap',
            'rateLimit' => 10000,
            'version' => 'v1',
            'countries' => 'US',
            'hasCORS' => true,
            'hasPrivateAPI' => false,
            'hasCreateOrder' => false,
            'hasCancelOrder' => false,
            'hasFetchBalance' => false,
            'hasFetchOrderBook' => false,
            'hasFetchTrades' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api' => 'https://api.coinmarketcap.com',
                'www' => 'https://coinmarketcap.com',
                'doc' => 'https://coinmarketcap.com/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ),
                ),
            ),
            'currencies' => array (
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        throw new ExchangeError ('Fetching order books is not supported by the API of ' . $this->id);
    }

    public function fetch_markets () {
        $markets = $this->publicGetTicker ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            for ($c = 0; $c < count ($this->currencies); $c++) {
                $base = $market['symbol'];
                $baseId = $market['id'];
                $quote = $this->currencies[$c];
                $quoteId = strtolower ($quote);
                $symbol = $base . '/' . $quote;
                $id = $baseId . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function fetchGlobal ($currency = 'USD') {
        $this->load_markets ();
        $request = array ();
        if ($currency)
            $request['convert'] = $currency;
        return $this->publicGetGlobal ($request);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        if (array_key_exists ('last_updated', $ticker))
            if ($ticker['last_updated'])
                $timestamp = intval ($ticker['last_updated']) * 1000;
        $volume = null;
        $volumeKey = '24h_volume_' . $market['quoteId'];
        if (array_key_exists ($volumeKey, $ticker))
            $volume = floatval ($ticker[$volumeKey]);
        $price = 'price_' . $market['quoteId'];
        $change = null;
        $changeKey = 'percent_change_24h';
        if (array_key_exists ($changeKey, $ticker))
            $change = floatval ($ticker[$changeKey]);
        $last = null;
        if (array_key_exists ($price, $ticker))
            if ($ticker[$price])
                $last = floatval ($ticker[$price]);
        $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => null,
            'ask' => null,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => $change,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $volume,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($currency = 'USD', $params = array ()) {
        $this->load_markets ();
        $request = array ();
        if ($currency)
            $request['convert'] = $currency;
        $response = $this->publicGetTicker (array_merge ($request, $params));
        $tickers = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $id = $ticker['id'] . '/' . $currency;
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $tickers[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $tickers;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array_merge (array (
            'convert' => $market['quote'],
            'id' => $market['baseId'],
        ), $params);
        $response = $this->publicGetTickerId ($request);
        $ticker = $response[0];
        return $this->parse_ticker ($ticker, $market);
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        return $response;
    }
}

// -----------------------------------------------------------------------------

class coinmate extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coinmate',
            'name' => 'CoinMate',
            'countries' => array ( 'GB', 'CZ' ), // UK, Czech Republic
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg',
                'api' => 'https://coinmate.io/api',
                'www' => 'https://coinmate.io',
                'doc' => array (
                    'http://docs.coinmate.apiary.io',
                    'https://coinmate.io/developers',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'orderBook',
                        'ticker',
                        'transactions',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balances',
                        'bitcoinWithdrawal',
                        'bitcoinDepositAddresses',
                        'buyInstant',
                        'buyLimit',
                        'cancelOrder',
                        'cancelOrderWithInfo',
                        'createVoucher',
                        'openOrders',
                        'redeemVoucher',
                        'sellInstant',
                        'sellLimit',
                        'transactionHistory',
                        'unconfirmedBitcoinDeposits',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/EUR' => array ( 'id' => 'BTC_EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/CZK' => array ( 'id' => 'BTC_CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostBalances ();
        $balances = $response['data'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balances)) {
                $account['free'] = $balances[$currency]['available'];
                $account['used'] = $balances[$currency]['reserved'];
                $account['total'] = $balances[$currency]['balance'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetOrderBook (array_merge (array (
            'currencyPair' => $this->market_id ($symbol),
            'groupByPriceLimit' => 'False',
        ), $params));
        $orderbook = $response['data'];
        $timestamp = $orderbook['timestamp'] * 1000;
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetTicker (array_merge (array (
            'currencyPair' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['data'];
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['amount']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        if (!$market)
            $market = $this->markets_by_id[$trade['currencyPair']];
        return array (
            'id' => $trade['transactionId'],
            'info' => $trade,
            'timestamp' => $trade['timestamp'],
            'datetime' => $this->iso8601 ($trade['timestamp']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'currencyPair' => $market['id'],
            'minutesIntoHistory' => 10,
        ), $params));
        return $this->parse_trades ($response['data'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'currencyPair' => $this->market_id ($symbol),
        );
        if ($type == 'market') {
            if ($side == 'buy')
                $order['total'] = $amount; // $amount in fiat
            else
                $order['amount'] = $amount; // $amount in fiat
            $method .= 'Instant';
        } else {
            $order['amount'] = $amount; // $amount in crypto
            $order['price'] = $price;
            $method .= $this->capitalize ($type);
        }
        $response = $this->$method (self.extend ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['data'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'orderId' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->urlencode (array_merge (array (
                'clientId' => $this->uid,
                'nonce' => $nonce,
                'publicKey' => $this->apiKey,
                'signature' => strtoupper ($signature),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            if ($response['error'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class coinsecure extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coinsecure',
            'name' => 'Coinsecure',
            'countries' => 'IN', // India
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg',
                'api' => 'https://api.coinsecure.in',
                'www' => 'https://coinsecure.in',
                'doc' => array (
                    'https://api.coinsecure.in',
                    'https://github.com/coinsecure/plugins',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'bitcoin/search/confirmation/{txid}',
                        'exchange/ask/low',
                        'exchange/ask/orders',
                        'exchange/bid/high',
                        'exchange/bid/orders',
                        'exchange/lastTrade',
                        'exchange/max24Hr',
                        'exchange/min24Hr',
                        'exchange/ticker',
                        'exchange/trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'mfa/authy/call',
                        'mfa/authy/sms',
                        'netki/search/{netkiName}',
                        'user/bank/otp/{number}',
                        'user/kyc/otp/{number}',
                        'user/profile/phone/otp/{number}',
                        'user/wallet/coin/address/{id}',
                        'user/wallet/coin/deposit/confirmed/all',
                        'user/wallet/coin/deposit/confirmed/{id}',
                        'user/wallet/coin/deposit/unconfirmed/all',
                        'user/wallet/coin/deposit/unconfirmed/{id}',
                        'user/wallet/coin/wallets',
                        'user/exchange/bank/fiat/accounts',
                        'user/exchange/bank/fiat/balance/available',
                        'user/exchange/bank/fiat/balance/pending',
                        'user/exchange/bank/fiat/balance/total',
                        'user/exchange/bank/fiat/deposit/cancelled',
                        'user/exchange/bank/fiat/deposit/unverified',
                        'user/exchange/bank/fiat/deposit/verified',
                        'user/exchange/bank/fiat/withdraw/cancelled',
                        'user/exchange/bank/fiat/withdraw/completed',
                        'user/exchange/bank/fiat/withdraw/unverified',
                        'user/exchange/bank/fiat/withdraw/verified',
                        'user/exchange/ask/cancelled',
                        'user/exchange/ask/completed',
                        'user/exchange/ask/pending',
                        'user/exchange/bid/cancelled',
                        'user/exchange/bid/completed',
                        'user/exchange/bid/pending',
                        'user/exchange/bank/coin/addresses',
                        'user/exchange/bank/coin/balance/available',
                        'user/exchange/bank/coin/balance/pending',
                        'user/exchange/bank/coin/balance/total',
                        'user/exchange/bank/coin/deposit/cancelled',
                        'user/exchange/bank/coin/deposit/unverified',
                        'user/exchange/bank/coin/deposit/verified',
                        'user/exchange/bank/coin/withdraw/cancelled',
                        'user/exchange/bank/coin/withdraw/completed',
                        'user/exchange/bank/coin/withdraw/unverified',
                        'user/exchange/bank/coin/withdraw/verified',
                        'user/exchange/bank/summary',
                        'user/exchange/coin/fee',
                        'user/exchange/fiat/fee',
                        'user/exchange/kycs',
                        'user/exchange/referral/coin/paid',
                        'user/exchange/referral/coin/successful',
                        'user/exchange/referral/fiat/paid',
                        'user/exchange/referrals',
                        'user/exchange/trade/summary',
                        'user/login/token/{token}',
                        'user/summary',
                        'user/wallet/summary',
                        'wallet/coin/withdraw/cancelled',
                        'wallet/coin/withdraw/completed',
                        'wallet/coin/withdraw/unverified',
                        'wallet/coin/withdraw/verified',
                    ),
                    'post' => array (
                        'login',
                        'login/initiate',
                        'login/password/forgot',
                        'mfa/authy/initiate',
                        'mfa/ga/initiate',
                        'signup',
                        'user/netki/update',
                        'user/profile/image/update',
                        'user/exchange/bank/coin/withdraw/initiate',
                        'user/exchange/bank/coin/withdraw/newVerifycode',
                        'user/exchange/bank/fiat/withdraw/initiate',
                        'user/exchange/bank/fiat/withdraw/newVerifycode',
                        'user/password/change',
                        'user/password/reset',
                        'user/wallet/coin/withdraw/initiate',
                        'wallet/coin/withdraw/newVerifycode',
                    ),
                    'put' => array (
                        'signup/verify/{token}',
                        'user/exchange/kyc',
                        'user/exchange/bank/fiat/deposit/new',
                        'user/exchange/ask/new',
                        'user/exchange/bid/new',
                        'user/exchange/instant/buy',
                        'user/exchange/instant/sell',
                        'user/exchange/bank/coin/withdraw/verify',
                        'user/exchange/bank/fiat/account/new',
                        'user/exchange/bank/fiat/withdraw/verify',
                        'user/mfa/authy/initiate/enable',
                        'user/mfa/ga/initiate/enable',
                        'user/netki/create',
                        'user/profile/phone/new',
                        'user/wallet/coin/address/new',
                        'user/wallet/coin/new',
                        'user/wallet/coin/withdraw/sendToExchange',
                        'user/wallet/coin/withdraw/verify',
                    ),
                    'delete' => array (
                        'user/gcm/{code}',
                        'user/logout',
                        'user/exchange/bank/coin/withdraw/unverified/cancel/{withdrawID}',
                        'user/exchange/bank/fiat/deposit/cancel/{depositID}',
                        'user/exchange/ask/cancel/{orderID}',
                        'user/exchange/bid/cancel/{orderID}',
                        'user/exchange/bank/fiat/withdraw/unverified/cancel/{withdrawID}',
                        'user/mfa/authy/disable/{code}',
                        'user/mfa/ga/disable/{code}',
                        'user/profile/phone/delete',
                        'user/profile/image/delete/{netkiName}',
                        'user/wallet/coin/withdraw/unverified/cancel/{withdrawID}',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/INR' => array ( 'id' => 'BTC/INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetUserExchangeBankSummary ();
        $balance = $response['message'];
        $coin = array (
            'free' => $balance['availableCoinBalance'],
            'used' => $balance['pendingCoinBalance'],
            'total' => $balance['totalCoinBalance'],
        );
        $fiat = array (
            'free' => $balance['availableFiatBalance'],
            'used' => $balance['pendingFiatBalance'],
            'total' => $balance['totalFiatBalance'],
        );
        $result = array (
            'info' => $balance,
            'BTC' => $coin,
            'INR' => $fiat,
        );
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $bids = $this->publicGetExchangeBidOrders ($params);
        $asks = $this->publicGetExchangeAskOrders ($params);
        $orderbook = array (
            'bids' => $bids['message'],
            'asks' => $asks['message'],
        );
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'rate', 'vol');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetExchangeTicker ($params);
        $ticker = $response['message'];
        $timestamp = $ticker['timestamp'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['coinvolume']),
            'quoteVolume' => floatval ($ticker['fiatvolume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($market, $params = array ()) {
        return $this->publicGetExchangeTrades ($params);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePutUserExchange';
        $order = array ();
        if ($type == 'market') {
            $method .= 'Instant' . $this->capitalize ($side);
            if ($side == 'buy')
                $order['maxFiat'] = $amount;
            else
                $order['maxVol'] = $amount;
        } else {
            $direction = ($side == 'buy') ? 'Bid' : 'Ask';
            $method .= $direction . 'New';
            $order['rate'] = $price;
            $order['vol'] = $amount;
        }
        $response = $this->$method (self.extend ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['message']['orderID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        throw new ExchangeError ($this->id . ' cancelOrder () is not fully implemented yet');
        $method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        return $this->$method (array ( 'orderID' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'private') {
            $headers = array ( 'Authorization' => $this->apiKey );
            if ($query) {
                $body = $this->json ($query);
                $headers['Content-Type'] = 'application/json';
            }
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class coinspot extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'coinspot',
            'name' => 'CoinSpot',
            'countries' => 'AU', // Australia
            'rateLimit' => 1000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
                'api' => array (
                    'public' => 'https://www.coinspot.com.au/pubapi',
                    'private' => 'https://www.coinspot.com.au/api',
                ),
                'www' => 'https://www.coinspot.com.au',
                'doc' => 'https://www.coinspot.com.au/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'latest',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'orders',
                        'orders/history',
                        'my/coin/deposit',
                        'my/coin/send',
                        'quote/buy',
                        'quote/sell',
                        'my/balances',
                        'my/orders',
                        'my/buy',
                        'my/sell',
                        'my/buy/cancel',
                        'my/sell/cancel',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/AUD' => array ( 'id' => 'BTC', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'LTC/AUD' => array ( 'id' => 'LTC', 'symbol' => 'LTC/AUD', 'base' => 'LTC', 'quote' => 'AUD' ),
                'DOGE/AUD' => array ( 'id' => 'DOGE', 'symbol' => 'DOGE/AUD', 'base' => 'DOGE', 'quote' => 'AUD' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostMyBalances ();
        $result = array ( 'info' => $response );
        if (array_key_exists ('balance', $response)) {
            $balances = $response['balance'];
            $currencies = array_keys ($balances);
            for ($c = 0; $c < count ($currencies); $c++) {
                $currency = $currencies[$c];
                $uppercase = strtoupper ($currency);
                $account = array (
                    'free' => $balances[$currency],
                    'used' => 0.0,
                    'total' => $balances[$currency],
                );
                if ($uppercase == 'DRK')
                    $uppercase = 'DASH';
                $result[$uppercase] = $account;
            }
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->privatePostOrders (array_merge (array (
            'cointype' => $market['id'],
        ), $params));
        $result = $this->parse_order_book ($orderbook, null, 'buyorders', 'sellorders', 'rate', 'amount');
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetLatest ($params);
        $id = $this->market_id ($symbol);
        $id = strtolower ($id);
        $ticker = $response['prices'][$id];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_trades ($market, $params = array ()) {
        return $this->privatePostOrdersHistory (array_merge (array (
            'cointype' => $this->market_id ($market),
        ), $params));
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePostMy' . $this->capitalize ($side);
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $order = array (
            'cointype' => $this->market_id ($market),
            'amount' => $amount,
            'rate' => $price,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        throw new ExchangeError ($this->id . ' cancelOrder () is not fully implemented yet');
        $method = 'privatePostMyBuy';
        return $this->$method (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests');
        $url = $this->urls['api'][$api] . '/' . $path;
        if ($api == 'private') {
            $nonce = $this->nonce ();
            $body = $this->json (array_merge (array ( 'nonce' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/json',
                'key' => $this->apiKey,
                'sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class cryptopia extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'cryptopia',
            'name' => 'Cryptopia',
            'rateLimit' => 1500,
            'countries' => 'NZ', // New Zealand
            'hasFetchTickers' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchMyTrades' => true,
            'hasCORS' => false,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
                'api' => 'https://www.cryptopia.co.nz/api',
                'www' => 'https://www.cryptopia.co.nz',
                'doc' => array (
                    'https://www.cryptopia.co.nz/Forum/Thread/255',
                    'https://www.cryptopia.co.nz/Forum/Thread/256',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'GetCurrencies',
                        'GetTradePairs',
                        'GetMarkets',
                        'GetMarkets/{id}',
                        'GetMarkets/{hours}',
                        'GetMarkets/{id}/{hours}',
                        'GetMarket/{id}',
                        'GetMarket/{id}/{hours}',
                        'GetMarketHistory/{id}',
                        'GetMarketHistory/{id}/{hours}',
                        'GetMarketOrders/{id}',
                        'GetMarketOrders/{id}/{count}',
                        'GetMarketOrderGroups/{ids}/{count}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'CancelTrade',
                        'GetBalance',
                        'GetDepositAddress',
                        'GetOpenOrders',
                        'GetTradeHistory',
                        'GetTransactions',
                        'SubmitTip',
                        'SubmitTrade',
                        'SubmitTransfer',
                        'SubmitWithdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'CC')
            return 'CCX';
        if ($currency == 'FCN')
            return 'Facilecoin';
        if ($currency == 'NET')
            return 'NetCoin';
        if ($currency == 'BTG')
            return 'Bitgem';
        return $currency;
    }

    public function fetch_markets () {
        $response = $this->publicGetTradePairs ();
        $result = array ();
        $markets = $response['Data'];
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['Id'];
            $symbol = $market['Label'];
            list ($base, $quote) = explode ('/', $symbol);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => 8,
                'price' => 8,
            );
            $amountLimits = array (
                'min' => $market['MinimumTrade'],
                'max' => $market['MaximumTrade']
            );
            $priceLimits = array (
                'min' => $market['MinimumPrice'],
                'max' => $market['MaximumPrice'],
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'maker' => $market['TradeFee'] / 100,
                'taker' => $market['TradeFee'] / 100,
                'lot' => $amountLimits['min'],
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetMarketOrdersId (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $orderbook = $response['Data'];
        return $this->parse_order_book ($orderbook, null, 'Buy', 'Sell', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'info' => $ticker,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['High']),
            'low' => floatval ($ticker['Low']),
            'bid' => floatval ($ticker['BidPrice']),
            'ask' => floatval ($ticker['AskPrice']),
            'vwap' => null,
            'open' => floatval ($ticker['Open']),
            'close' => floatval ($ticker['Close']),
            'first' => null,
            'last' => floatval ($ticker['LastPrice']),
            'change' => floatval ($ticker['Change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['Volume']),
            'quoteVolume' => floatval ($ticker['BaseVolume']),
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        $ticker = $response['Data'];
        return $this->parse_ticker ($ticker, $market);
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetMarkets ($params);
        $result = array ();
        $tickers = $response['Data'];
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker['TradePairId'];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        if (array_key_exists ('Timestamp', $trade)) {
            $timestamp = $trade['Timestamp'] * 1000;
        } else if (array_key_exists ('TimeStamp', $trade)) {
            $timestamp = $this->parse8601 ($trade['TimeStamp']);
        }
        $price = $this->safe_float ($trade, 'Price');
        if (!$price)
            $price = $this->safe_float ($trade, 'Rate');
        $cost = $this->safe_float ($trade, 'Total');
        $id = $this->safe_string ($trade, 'TradeId');
        if (!$market) {
            if (array_key_exists ('TradePairId', $trade))
                if (array_key_exists ($trade['TradePairId'], $this->markets_by_id))
                    $market = $this->markets_by_id[$trade['TradePairId']];
        }
        $symbol = null;
        $fee = null;
        if ($market) {
            $symbol = $market['symbol'];
            if (array_key_exists ('Fee', $trade)) {
                $fee = array (
                    'currency' => $market['quote'],
                    'cost' => $trade['Fee'],
                );
            }
        }
        return array (
            'id' => $id,
            'info' => $trade,
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => strtolower ($trade['Type']),
            'price' => $price,
            'cost' => $cost,
            'amount' => $trade['Amount'],
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketHistoryIdHours (array_merge (array (
            'id' => $market['id'],
            'hours' => 24, // default
        ), $params));
        $trades = $response['Data'];
        return $this->parse_trades ($trades, $market);
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchMyTrades requires a symbol');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->privatePostGetTradeHistory (array_merge (array (
            // 'Market' => $market['id'],
            'TradePairId' => $market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count' => 10, // max = 100
        ), $params));
        return $this->parse_trades ($response['Data'], $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetBalance ();
        $balances = $response['Data'];
        $result = array ( 'info' => $response );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $code = $balance['Symbol'];
            $currency = $this->common_currency_code ($code);
            $account = array (
                'free' => $balance['Available'],
                'used' => 0.0,
                'total' => $balance['Total'],
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $price = floatval ($price);
        $amount = floatval ($amount);
        $request = array (
            'TradePairId' => $market['id'],
            'Type' => $this->capitalize ($side),
            'Rate' => $this->price_to_precision ($symbol, $price),
            'Amount' => $this->amount_to_precision ($symbol, $amount),
        );
        $response = $this->privatePostSubmitTrade (array_merge ($request, $params));
        if (!$response)
            throw new ExchangeError ($this->id . ' createOrder returned unknown error => ' . $this->json ($response));
        if (array_key_exists ('Data', $response)) {
            if (array_key_exists ('OrderId', $response['Data'])) {
                if (!$response['Data']['OrderId'])
                    throw new ExchangeError ($this->id . ' createOrder returned bad OrderId => ' . $this->json ($response));
            } else {
                throw new ExchangeError ($this->id . ' createOrder returned no OrderId in Data => ' . $this->json ($response));
            }
        } else {
            throw new ExchangeError ($this->id . ' createOrder returned no Data in $response => ' . $this->json ($response));
        }
        $id = (string) $response['Data']['OrderId'];
        $timestamp = $this->milliseconds ();
        $order = array (
            'id' => $id,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'remaining' => $amount,
            'filled' => 0.0,
            'fee' => null,
            // 'trades' => $this->parse_trades ($order['trades'], $market),
        );
        $this->orders[$id] = $order;
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $response = $this->privatePostCancelTrade (array_merge (array (
                'Type' => 'Trade',
                'OrderId' => $id,
            ), $params));
            if (array_key_exists ($id, $this->orders))
                $this->orders[$id]['status'] = 'canceled';
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'Error');
                if ($message) {
                    if (mb_strpos ($message, 'does not exist') !== false)
                        throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
                }
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else if (array_key_exists ('Market', $order)) {
            $id = $order['Market'];
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
        }
        $timestamp = $this->parse8601 ($order['TimeStamp']);
        $amount = $this->safe_float ($order, 'Amount');
        $remaining = $this->safe_float ($order, 'Remaining');
        $filled = $amount - $remaining;
        return array (
            'id' => (string) $order['OrderId'],
            'info' => $this->omit ($order, 'status'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => strtolower ($order['Type']),
            'price' => $this->safe_float ($order, 'Rate'),
            'cost' => $this->safe_float ($order, 'Total'),
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
            // 'trades' => $this->parse_trades ($order['trades'], $market),
        );
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a $symbol param');
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->privatePostGetOpenOrders (array (
            // 'Market' => $market['id'],
            'TradePairId' => $market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count' => 100, // default = 100
        ), $params);
        $orders = array ();
        for ($i = 0; $i < count ($response['Data']); $i++) {
            $orders[] = array_merge ($response['Data'][$i], array ( 'status' => 'open' ));
        }
        $openOrders = $this->parse_orders ($orders, $market);
        for ($j = 0; $j < count ($openOrders); $j++) {
            $this->orders[$openOrders[$j]['id']] = $openOrders[$j];
        }
        $openOrdersIndexedById = $this->index_by ($openOrders, 'id');
        $cachedOrderIds = array_keys ($this->orders);
        $result = array ();
        for ($k = 0; $k < count ($cachedOrderIds); $k++) {
            $id = $cachedOrderIds[$k];
            if (array_key_exists ($id, $openOrdersIndexedById)) {
                $this->orders[$id] = array_merge ($this->orders[$id], $openOrdersIndexedById[$id]);
            } else {
                $order = $this->orders[$id];
                if ($order['status'] == 'open') {
                    $this->orders[$id] = array_merge ($order, array (
                        'status' => 'closed',
                        'cost' => $order['amount'] * $order['price'],
                        'filled' => $order['amount'],
                        'remaining' => 0.0,
                    ));
                }
            }
            $order = $this->orders[$id];
            if ($order['symbol'] == $symbol)
                $result[] = $order;
        }
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $id = (string) $id;
        $orders = $this->fetch_orders ($symbol, $params);
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['id'] == $id)
                return $orders[$i];
        }
        throw new OrderNotCached ($this->id . ' order ' . $id . ' not found in cached .orders, fetchOrder requires .orders (de)serialization implemented for this method to work properly');
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'open')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'closed')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function deposit ($currency, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetDepositAddress (array_merge (array (
            'Currency' => $currency
        ), $params));
        $address = $this->safe_string ($response['Data'], 'BaseAddress');
        if (!$address)
            $address = $this->safe_string ($response['Data'], 'Address');
        return array (
            'info' => $response,
            'address' => $address,
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostSubmitWithdraw (array_merge (array (
            'Currency' => $currency,
            'Amount' => $amount,
            'Address' => $address, // Address must exist in you AddressBook in security settings
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['Data'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->json ($query);
            $hash = $this->hash ($this->encode ($body), 'md5', 'base64');
            $secret = base64_decode ($this->secret);
            $uri = $this->encode_uri_component ($url);
            $lowercase = strtolower ($uri);
            $payload = $this->apiKey . $method . $lowercase . $nonce . $this->binary_to_string ($hash);
            $signature = $this->hmac ($this->encode ($payload), $secret, 'sha256', 'base64');
            $auth = 'amx ' . $this->apiKey . ':' . $this->binary_to_string ($signature) . ':' . $nonce;
            $headers = array (
                'Content-Type' => 'application/json',
                'Authorization' => $auth,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($response) {
            if (array_key_exists ('Success', $response))
                if ($response['Success']) {
                    return $response;
                } else if (array_key_exists ('Error', $response)) {
                    if ($response['Error'] == 'Insufficient Funds.')
                        throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                }
        }
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class dsx extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'dsx',
            'name' => 'DSX',
            'countries' => 'UK',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchTickers' => true,
            'hasFetchMyTrades' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
                'api' => array (
                    'public' => 'https://dsx.uk/mapi', // market data
                    'private' => 'https://dsx.uk/tapi', // trading
                    'dwapi' => 'https://dsx.uk/dwapi', // deposit/withdraw
                ),
                'www' => 'https://dsx.uk',
                'doc' => array (
                    'https://api.dsx.uk',
                    'https://dsx.uk/api_docs/public',
                    'https://dsx.uk/api_docs/private',
                    '',
                ),
            ),
            'api' => array (
                // market data (public)
                'public' => array (
                    'get' => array (
                        'barsFromMoment/{id}/{period}/{start}', // empty reply :\
                        'depth/{pair}',
                        'info',
                        'lastBars/{id}/{period}/{amount}', // period is (m, h or d)
                        'periodBars/{id}/{period}/{start}/{end}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ),
                ),
                // trading (private)
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'TransHistory',
                        'TradeHistory',
                        'OrderHistory',
                        'ActiveOrders',
                        'Trade',
                        'CancelOrder',
                    ),
                ),
                // deposit / withdraw (private)
                'dwapi' => array (
                    'post' => array (
                        'getCryptoDepositAddress',
                        'cryptoWithdraw',
                        'fiatWithdraw',
                        'getTransactionStatus',
                        'getTransactions',
                    ),
                ),
            ),
        ), $options));
    }

    public function getBaseQuoteFromMarketId ($id) {
        $uppercase = strtoupper ($id);
        $base = mb_substr ($uppercase, 0, 3);
        $quote = mb_substr ($uppercase, 3, 6);
        $base = $this->common_currency_code ($base);
        $quote = $this->common_currency_code ($quote);
        return array ($base, $quote);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $funds = $balances['funds'];
        $currencies = array_keys ($funds);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $uppercase = $this->common_currency_code ($uppercase);
            $account = array (
                'free' => $funds[$currency],
                'used' => 0.0,
                'total' => $balances['total'][$currency],
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function getOrderIdKey () {
        return 'orderId';
    }

    public function signBodyWithSecret ($body) {
        return $this->decode ($this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512', 'base64'));
    }

    public function getVersionString () {
        return ''; // they don't prepend version number to public URLs as other BTC-e clones do
    }
}

// -----------------------------------------------------------------------------

class exmo extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'exmo',
            'name' => 'EXMO',
            'countries' => array ( 'ES', 'RU' ), // Spain, Russia
            'rateLimit' => 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api' => 'https://api.exmo.com',
                'www' => 'https://exmo.me',
                'doc' => array (
                    'https://exmo.me/ru/api_doc',
                    'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'required_amount',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'wallet_history',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetPairSettings ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $market = $markets[$id];
            $symbol = str_replace ('_', '/', $id);
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostUserInfo ();
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $response['balances']))
                $account['free'] = floatval ($response['balances'][$currency]);
            if (array_key_exists ($currency, $response['reserved']))
                $account['used'] = floatval ($response['reserved'][$currency]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetOrderBook (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $orderbook = $response[$market['id']];
        return $this->parse_order_book ($orderbook, null, 'bid', 'ask');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy_price']),
            'ask' => floatval ($ticker['sell_price']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_trade']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['avg']),
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => floatval ($ticker['vol_curr']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetTicker ($params);
        $result = array ();
        $ids = array_keys ($response);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $response[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetTicker ($params);
        $market = $this->market ($symbol);
        return $this->parse_ticker ($response[$market['id']], $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => (string) $trade['trade_id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response[$market['id']], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $prefix = '';
        if ($type == 'market')
            $prefix = 'market_';
        $order = array (
            'pair' => $this->market_id ($symbol),
            'quantity' => $amount,
            'price' => $price || 0,
            'type' => $prefix . $side,
        );
        $response = $this->privatePostOrderCreate (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostOrderCancel (array ( 'order_id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $result = $this->privatePostWithdrawCrypt (array_merge (array (
            'amount' => $amount,
            'currency' => $currency,
            'address' => $address,
        ), $params));
        return array (
            'info' => $result,
            'id' => $result['task_id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response)) {
            if ($response['result'])
                return $response;
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class flowbtc extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'flowbtc',
            'name' => 'flowBTC',
            'countries' => 'BR', // Brazil
            'version' => 'v1',
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
                'api' => 'https://api.flowbtc.com:8400/ajax',
                'www' => 'https://trader.flowbtc.com',
                'doc' => 'http://www.flowbtc.com.br/api/',
            ),
            'api' => array (
                'public' => array (
                    'post' => array (
                        'GetTicker',
                        'GetTrades',
                        'GetTradesByDate',
                        'GetOrderBook',
                        'GetProductPairs',
                        'GetProducts',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'CreateAccount',
                        'GetUserInfo',
                        'SetUserInfo',
                        'GetAccountInfo',
                        'GetAccountTrades',
                        'GetDepositAddresses',
                        'Withdraw',
                        'CreateOrder',
                        'ModifyOrder',
                        'CancelOrder',
                        'CancelAllOrders',
                        'GetAccountOpenOrders',
                        'GetOrderFee',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $response = $this->publicPostGetProductPairs ();
        $markets = $response['productPairs'];
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['name'];
            $base = $market['product1Label'];
            $quote = $market['product2Label'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['currencies'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['name'];
            $account = array (
                'free' => $balance['balance'],
                'used' => $balance['hold'],
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $orderbook = $this->publicPostGetOrderBook (array_merge (array (
            'productPair' => $market['id'],
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'px', 'qty');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicPostGetTicker (array_merge (array (
            'productPair' => $market['id'],
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume24hr']),
            'quoteVolume' => floatval ($ticker['volume24hrProduct2']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['unixtime'] * 1000;
        $side = ($trade['incomingOrderSide'] == 0) ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => $trade['px'],
            'amount' => $trade['qty'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicPostGetTrades (array_merge (array (
            'ins' => $market['id'],
            'startIndex' => -1,
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $orderType = ($type == 'market') ? 1 : 0;
        $order = array (
            'ins' => $this->market_id ($symbol),
            'side' => $side,
            'orderType' => $orderType,
            'qty' => $amount,
            'px' => $price,
        );
        $response = $this->privatePostCreateOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['serverOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        if (array_key_exists ('ins', $params)) {
            return $this->privatePostCancelOrder (array_merge (array (
                'serverOrderId' => $id,
            ), $params));
        }
        throw new ExchangeError ($this->id . ' requires `ins` $symbol parameter for cancelling an order');
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($params) {
                $body = $this->json ($params);
            }
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = $this->nonce ();
            $auth = (string) $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->json (array_merge (array (
                'apiKey' => $this->apiKey,
                'apiNonce' => $nonce,
                'apiSig' => strtoupper ($signature),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('isAccepted', $response))
            if ($response['isAccepted'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class foxbit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'foxbit',
            'name' => 'FoxBit',
            'countries' => 'BR',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://foxbit.exchange',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class fyb extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'rateLimit' => 1500,
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'tickerdetailed',
                        'orderbook',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'test',
                        'getaccinfo',
                        'getpendingorders',
                        'getorderhistory',
                        'cancelpendingorder',
                        'placeorder',
                        'withdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostGetaccinfo ();
        $btc = floatval ($balance['btcBal']);
        $symbol = $this->symbols[0];
        $quote = $this->markets[$symbol]['quote'];
        $lowercase = strtolower ($quote) . 'Bal';
        $fiat = floatval ($balance[$lowercase]);
        $crypto = array (
            'free' => $btc,
            'used' => 0.0,
            'total' => $btc,
        );
        $result = array ( 'BTC' => $crypto );
        $result[$quote] = array (
            'free' => $fiat,
            'used' => 0.0,
            'total' => $fiat,
        );
        $result['info'] = $balance;
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderbook ($params);
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerdetailed ($params);
        $timestamp = $this->milliseconds ();
        $last = null;
        $volume = null;
        if (array_key_exists ('last', $ticker))
            $last = floatval ($ticker['last']);
        if (array_key_exists ('vol', $ticker))
            $volume = floatval ($ticker['vol']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $volume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades ($params);
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $response = $this->privatePostPlaceorder (array_merge (array (
            'qty' => $amount,
            'price' => $price,
            'type' => strtoupper ($side[0])
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['pending_oid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelpendingorder (array ( 'orderNo' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sig' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha1')
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private')
            if (array_key_exists ('error', $response))
                if ($response['error'])
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class fybse extends fyb {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'fybse',
            'name' => 'FYB-SE',
            'countries' => 'SE', // Sweden
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api' => 'https://www.fybse.se/api/SEK',
                'www' => 'https://www.fybse.se',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'markets' => array (
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class fybsg extends fyb {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'fybsg',
            'name' => 'FYB-SG',
            'countries' => 'SG', // Singapore
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
                'api' => 'https://www.fybsg.com/api/SGD',
                'www' => 'https://www.fybsg.com',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'markets' => array (
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class gatecoin extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'gatecoin',
            'name' => 'Gatecoin',
            'rateLimit' => 2000,
            'countries' => 'HK', // Hong Kong
            'comment' => 'a regulated/licensed exchange',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '1m',
                '15m' => '15m',
                '1h' => '1h',
                '6h' => '6h',
                '1d' => '24h',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg',
                'api' => 'https://api.gatecoin.com',
                'www' => 'https://gatecoin.com',
                'doc' => array (
                    'https://gatecoin.com/api',
                    'https://github.com/Gatecoin/RESTful-API-Implementation',
                    'https://api.gatecoin.com/swagger-ui/index.html',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'Public/ExchangeRate', // Get the exchange rates
                        'Public/LiveTicker', // Get live ticker for all currency
                        'Public/LiveTicker/{CurrencyPair}', // Get live ticker by currency
                        'Public/LiveTickers', // Get live ticker for all currency
                        'Public/MarketDepth/{CurrencyPair}', // Gets prices and market depth for the currency pair.
                        'Public/NetworkStatistics/{DigiCurrency}', // Get the network status of a specific digital currency
                        'Public/StatisticHistory/{DigiCurrency}/{Typeofdata}', // Get the historical data of a specific digital currency
                        'Public/TickerHistory/{CurrencyPair}/{Timeframe}', // Get ticker history
                        'Public/Transactions/{CurrencyPair}', // Gets recent transactions
                        'Public/TransactionsHistory/{CurrencyPair}', // Gets all transactions
                        'Reference/BusinessNatureList', // Get the business nature list.
                        'Reference/Countries', // Get the country list.
                        'Reference/Currencies', // Get the currency list.
                        'Reference/CurrencyPairs', // Get the currency pair list.
                        'Reference/CurrentStatusList', // Get the current status list.
                        'Reference/IdentydocumentTypes', // Get the different types of identity documents possible.
                        'Reference/IncomeRangeList', // Get the income range list.
                        'Reference/IncomeSourceList', // Get the income source list.
                        'Reference/VerificationLevelList', // Get the verif level list.
                        'Stream/PublicChannel', // Get the public pubnub channel list
                    ),
                    'post' => array (
                        'Export/Transactions', // Request a export of all trades from based on currencypair, start date and end date
                        'Ping', // Post a string, then get it back.
                        'Public/Unsubscribe/{EmailCode}', // Lets the user unsubscribe from emails
                        'RegisterUser', // Initial trader registration.
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'Account/CorporateData', // Get corporate account data
                        'Account/DocumentAddress', // Check if residence proof uploaded
                        'Account/DocumentCorporation', // Check if registered document uploaded
                        'Account/DocumentID', // Check if ID document copy uploaded
                        'Account/DocumentInformation', // Get Step3 Data
                        'Account/Email', // Get user email
                        'Account/FeeRate', // Get fee rate of logged in user
                        'Account/Level', // Get verif level of logged in user
                        'Account/PersonalInformation', // Get Step1 Data
                        'Account/Phone', // Get user phone number
                        'Account/Profile', // Get trader profile
                        'Account/Questionnaire', // Fill the questionnaire
                        'Account/Referral', // Get referral information
                        'Account/ReferralCode', // Get the referral code of the logged in user
                        'Account/ReferralNames', // Get names of referred traders
                        'Account/ReferralReward', // Get referral reward information
                        'Account/ReferredCode', // Get referral code
                        'Account/ResidentInformation', // Get Step2 Data
                        'Account/SecuritySettings', // Get verif details of logged in user
                        'Account/User', // Get all user info
                        'APIKey/APIKey', // Get API Key for logged in user
                        'Auth/ConnectionHistory', // Gets connection history of logged in user
                        'Balance/Balances', // Gets the available balance for each currency for the logged in account.
                        'Balance/Balances/{Currency}', // Gets the available balance for s currency for the logged in account.
                        'Balance/Deposits', // Get all account deposits, including wire and digital currency, of the logged in user
                        'Balance/Withdrawals', // Get all account withdrawals, including wire and digital currency, of the logged in user
                        'Bank/Accounts/{Currency}/{Location}', // Get internal bank account for deposit
                        'Bank/Transactions', // Get all account transactions of the logged in user
                        'Bank/UserAccounts', // Gets all the bank accounts related to the logged in user.
                        'Bank/UserAccounts/{Currency}', // Gets all the bank accounts related to the logged in user.
                        'ElectronicWallet/DepositWallets', // Gets all crypto currency addresses related deposits to the logged in user.
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', // Gets all crypto currency addresses related deposits to the logged in user by currency.
                        'ElectronicWallet/Transactions', // Get all digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/{DigiCurrency}', // Get all digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets', // Gets all external digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Gets all external digital currency addresses related to the logged in user by currency.
                        'Info/ReferenceCurrency', // Get user's reference currency
                        'Info/ReferenceLanguage', // Get user's reference language
                        'Notification/Messages', // Get from oldest unread + 3 read message to newest messages
                        'Trade/Orders', // Gets open orders for the logged in trader.
                        'Trade/Orders/{OrderID}', // Gets an order for the logged in trader.
                        'Trade/StopOrders', // Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/StopOrdersHistory', // Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/Trades', // Gets all transactions of logged in user
                        'Trade/UserTrades', // Gets all transactions of logged in user
                    ),
                    'post' => array (
                        'Account/DocumentAddress', // Upload address proof document
                        'Account/DocumentCorporation', // Upload registered document document
                        'Account/DocumentID', // Upload ID document copy
                        'Account/Email/RequestVerify', // Request for verification email
                        'Account/Email/Verify', // Verification email
                        'Account/GoogleAuth', // Enable google auth
                        'Account/Level', // Request verif level of logged in user
                        'Account/Questionnaire', // Fill the questionnaire
                        'Account/Referral', // Post a referral email
                        'APIKey/APIKey', // Create a new API key for logged in user
                        'Auth/ChangePassword', // Change password.
                        'Auth/ForgotPassword', // Request reset password
                        'Auth/ForgotUserID', // Request user id
                        'Auth/Login', // Trader session log in.
                        'Auth/Logout', // Logout from the current session.
                        'Auth/LogoutOtherSessions', // Logout other sessions.
                        'Auth/ResetPassword', // Reset password
                        'Bank/Transactions', // Request a transfer from the traders account of the logged in user. This is only available for bank account
                        'Bank/UserAccounts', // Add an account the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', // Add an digital currency addresses to the logged in user.
                        'ElectronicWallet/Transactions/Deposits/{DigiCurrency}', // Get all internal digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/Withdrawals/{DigiCurrency}', // Get all external digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Add an external digital currency addresses to the logged in user.
                        'ElectronicWallet/Withdrawals/{DigiCurrency}', // Request a transfer from the traders account to an external address. This is only available for crypto currencies.
                        'Notification/Messages', // Mark all as read
                        'Notification/Messages/{ID}', // Mark as read
                        'Trade/Orders', // Place an order at the exchange.
                        'Trade/StopOrders', // Place a stop order at the exchange.
                    ),
                    'put' => array (
                        'Account/CorporateData', // Update user company data for corporate account
                        'Account/DocumentID', // Update ID document meta data
                        'Account/DocumentInformation', // Update Step3 Data
                        'Account/Email', // Update user email
                        'Account/PersonalInformation', // Update Step1 Data
                        'Account/Phone', // Update user phone number
                        'Account/Questionnaire', // update the questionnaire
                        'Account/ReferredCode', // Update referral code
                        'Account/ResidentInformation', // Update Step2 Data
                        'Account/SecuritySettings', // Update verif details of logged in user
                        'Account/User', // Update all user info
                        'Bank/UserAccounts', // Update the label of existing user bank accounnt
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Update the name of an address
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Update the name of an external address
                        'Info/ReferenceCurrency', // User's reference currency
                        'Info/ReferenceLanguage', // Update user's reference language
                    ),
                    'delete' => array (
                        'APIKey/APIKey/{PublicKey}', // Remove an API key
                        'Bank/Transactions/{RequestID}', // Delete pending account withdraw of the logged in user
                        'Bank/UserAccounts/{Currency}/{Label}', // Delete an account of the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Delete an digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}/{AddressName}', // Delete an external digital currency addresses related to the logged in user.
                        'Trade/Orders', // Cancels all existing order
                        'Trade/Orders/{OrderID}', // Cancels an existing order
                        'Trade/StopOrders', // Cancels all existing stop orders
                        'Trade/StopOrders/{ID}', // Cancels an existing stop order
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $response = $this->publicGetPublicLiveTickers ();
        $markets = $response['tickers'];
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['currencyPair'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalanceBalances ();
        $balances = $response['balances'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => $balance['availableBalance'],
                'used' => $this->sum (
                    $balance['pendingIncoming'],
                    $balance['pendingOutgoing'],
                    $balance['openOrder']),
                'total' => $balance['balance'],
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetPublicMarketDepthCurrencyPair (array_merge (array (
            'CurrencyPair' => $market['id'],
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = intval ($ticker['createDateTime']) * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetPublicLiveTickers ($params);
        $tickers = $response['tickers'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $id = $ticker['currencyPair'];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetPublicLiveTickerCurrencyPair (array_merge (array (
            'CurrencyPair' => $market['id'],
        ), $params));
        $ticker = $response['ticker'];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $side = null;
        $order = null;
        if (array_key_exists ('way', $trade)) {
            $side = ($trade['way'] == 'bid') ? 'buy' : 'sell';
            $orderId = $trade['way'] . 'OrderId';
            $order = $trade[$orderId];
        }
        $timestamp = intval ($trade['transactionTime']) * 1000;
        if (!$market)
            $market = $this->markets_by_id[$trade['currencyPair']];
        return array (
            'info' => $trade,
            'id' => (string) $trade['transactionId'],
            'order' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['quantity'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetPublicTransactionsCurrencyPair (array_merge (array (
            'CurrencyPair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['transactions'], $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            intval ($ohlcv['createDateTime']) * 1000,
            $ohlcv['open'],
            $ohlcv['high'],
            $ohlcv['low'],
            null,
            $ohlcv['volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'CurrencyPair' => $market['id'],
            'Timeframe' => $this->timeframes[$timeframe],
        );
        if ($limit)
            $request['Count'] = $limit;
        $request = array_merge ($request, $params);
        $response = $this->publicGetPublicTickerHistoryCurrencyPairTimeframe ($request);
        return $this->parse_ohlcvs ($response['tickers'], $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'Code' => $this->market_id ($symbol),
            'Way' => ($side == 'buy') ? 'Bid' : 'Ask',
            'Amount' => $amount,
        );
        if ($type == 'limit')
            $order['Price'] = $price;
        if ($this->twofa) {
            if (array_key_exists ('ValidationCode', $params))
                $order['ValidationCode'] = $params['ValidationCode'];
            else
                throw new AuthenticationError ($this->id . ' two-factor authentication requires a missing ValidationCode parameter');
        }
        $response = $this->privatePostTradeOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['clOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteTradeOrdersOrderID (array ( 'OrderID' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $contentType = ($method == 'GET') ? '' : 'application/json';
            $auth = $method . $url . $contentType . (string) $nonce;
            $auth = strtolower ($auth);
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha256', 'base64');
            $headers = array (
                'API_PUBLIC_KEY' => $this->apiKey,
                'API_REQUEST_SIGNATURE' => $signature,
                'API_REQUEST_DATE' => $nonce,
            );
            if ($method != 'GET') {
                $headers['Content-Type'] = $contentType;
                $body = $this->json (array_merge (array ( 'nonce' => $nonce ), $params));
            }
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('responseStatus', $response))
            if (array_key_exists ('message', $response['responseStatus']))
                if ($response['responseStatus']['message'] == 'OK')
                    return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class gateio extends bter {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'gateio',
            'name' => 'Gate.io',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api' => array (
                    'public' => 'https://data.gate.io/api',
                    'private' => 'https://data.gate.io/api',
                ),
                'www' => 'https://gate.io/',
                'doc' => 'https://gate.io/api2',
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class gdax extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'gdax',
            'name' => 'GDAX',
            'countries' => 'US',
            'rateLimit' => 1000,
            'hasCORS' => true,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'timeframes' => array (
                '1m' => 60,
                '5m' => 300,
                '15m' => 900,
                '30m' => 1800,
                '1h' => 3600,
                '2h' => 7200,
                '4h' => 14400,
                '12h' => 43200,
                '1d' => 86400,
                '1w' => 604800,
                '1M' => 2592000,
                '1y' => 31536000,
            ),
            'urls' => array (
                'test' => 'https://api-public.sandbox.gdax.com',
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api' => 'https://api.gdax.com',
                'www' => 'https://www.gdax.com',
                'doc' => 'https://docs.gdax.com',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currencies',
                        'products',
                        'products/{id}/book',
                        'products/{id}/candles',
                        'products/{id}/stats',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                        'time',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'accounts',
                        'accounts/{id}',
                        'accounts/{id}/holds',
                        'accounts/{id}/ledger',
                        'coinbase-accounts',
                        'fills',
                        'funding',
                        'orders',
                        'orders/{id}',
                        'payment-methods',
                        'position',
                        'reports/{id}',
                        'users/self/trailing-volume',
                    ),
                    'post' => array (
                        'deposits/coinbase-account',
                        'deposits/payment-method',
                        'funding/repay',
                        'orders',
                        'position/close',
                        'profiles/margin-transfer',
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ),
                    'delete' => array (
                        'orders',
                        'orders/{id}',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0,
                    'taker' => 0.25 / 100,
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetProducts ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['id'];
            $base = $market['base_currency'];
            $quote = $market['quote_currency'];
            $symbol = $base . '/' . $quote;
            $amountLimits = array (
                'min' => $market['base_min_size'],
                'max' => $market['base_max_size'],
            );
            $priceLimits = array (
                'min' => $market['quote_increment'],
                'max' => null,
            );
            $costLimits = array (
                'min' => $priceLimits['min'],
                'max' => null,
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
                'cost' => $costLimits,
            );
            $precision = array (
                'amount' => -log10 ($amountLimits['min']),
                'price' => -log10 ($priceLimits['min']),
            );
            $taker = $this->fees['trading']['taker'];
            if (($base == 'ETH') || ($base == 'LTC')) {
                $taker = 0.3;
            }
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'precision' => $precision,
                'limits' => $limits,
                'taker' => $taker,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetAccounts ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['hold']),
                'total' => floatval ($balance['balance']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetProductsIdBook (array_merge (array (
            'id' => $this->market_id ($symbol),
            'level' => 2, // 1 best bidask, 2 aggregated, 3 full
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array_merge (array (
            'id' => $market['id'],
        ), $params);
        $ticker = $this->publicGetProductsIdTicker ($request);
        $quote = $this->publicGetProductsIdStats ($request);
        $timestamp = $this->parse8601 ($ticker['time']);
        $bid = null;
        $ask = null;
        if (array_key_exists ('bid', $ticker))
            $bid = floatval ($ticker['bid']);
        if (array_key_exists ('ask', $ticker))
            $ask = floatval ($ticker['ask']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($quote['high']),
            'low' => floatval ($quote['low']),
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => floatval ($quote['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($quote['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 (['time']);
        // $type = null;
        return array (
            'id' => (string) $trade['trade_id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['size']),
        );
    }

    public function fetch_trades ($market, $params = array ()) {
        $this->load_markets ();
        return $this->publicGetProductsIdTrades (array_merge (array (
            'id' => $this->market_id ($market), // fixes issue #2
        ), $params));
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[3],
            $ohlcv[2],
            $ohlcv[1],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $granularity = $this->timeframes[$timeframe];
        $request = array (
            'id' => $market['id'],
            'granularity' => $granularity,
        );
        if ($since) {
            $request['start'] = $this->iso8601 ($since);
            if (!$limit)
                $limit = 200; // max = 200
            $request['end'] = $this->iso8601 ($limit * $granularity * 1000 . $since);
        }
        $response = $this->publicGetProductsIdCandles (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function fetchTime () {
        $response = $this->publicGetTime ();
        return $this->parse8601 ($response['iso']);
    }

    public function getOrderStatus ($status) {
        $statuses = array (
            'pending' => 'open',
            'active' => 'open',
            'open' => 'open',
            'done' => 'closed',
            'canceled' => 'canceled',
        );
        return $this->safe_string ($statuses, $status, $status);
    }

    public function parse_order ($order, $market = null) {
        $timestamp = $this->parse8601 ($order['created_at']);
        $symbol = null;
        if (!$market) {
            if (array_key_exists ($order['product_id'], $this->markets_by_id))
                $market = $this->markets_by_id[$order['product_id']];
        }
        $status = $this->getOrderStatus ($order['status']);
        $price = $this->safe_float ($order, 'price');
        $amount = $this->safe_float ($order, 'size');
        $filled = $this->safe_float ($order, 'filled_size');
        $remaining = $amount - $filled;
        $cost = $this->safe_float ($order, 'executed_value');
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $order['id'],
            'info' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $status,
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
        return $this->parse_order ($response);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array (
            'status' => 'all',
        );
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders ($response, $market);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders ($response, $market);
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $request = array (
            'status' => 'done',
        );
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders ($response, $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        // $oid = (string) $this->nonce ();
        $order = array (
            'product_id' => $this->market_id ($market),
            'side' => $side,
            'size' => $amount,
            'type' => $type,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteOrdersId (array ( 'id' => $id ));
    }

    public function getPaymentMethods () {
        $response = $this->privateGetPaymentMethods ();
        return $response;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = null;
        if (array_key_exists ('payment_method_id', $params)) {
            $response = $this->privatePostWithdrawalsPaymentMethod (array_merge (array (
                'currency' => $currency,
                'amount' => $amount,
            ), $params));
        } else {
            $response = $this->privatePostWithdrawalsCrypto (array_merge (array (
                'currency' => $currency,
                'amount' => $amount,
                'crypto_address' => $address,
            ), $params));
        }
        if (!$response)
            throw ExchangeError ($this->id . ' withdraw() error => ' . $this->json ($response));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($method == 'GET') {
            if ($query)
                $request .= '?' . $this->urlencode ($query);
        }
        $url = $this->urls['api'] . $request;
        if ($api == 'private') {
            if (!$this->apiKey)
                throw new AuthenticationError ($this->id . ' requires apiKey property for authentication and trading');
            if (!$this->secret)
                throw new AuthenticationError ($this->id . ' requires $secret property for authentication and trading');
            if (!$this->password)
                throw new AuthenticationError ($this->id . ' requires password property for authentication and trading');
            $nonce = (string) $this->nonce ();
            $payload = '';
            if ($method == 'POST') {
                if ($query)
                    $body = $this->json ($query);
                    $payload = $body;
            }
            // $payload = ($body) ? $body : '';
            $what = $nonce . $method . $request . $payload;
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($this->encode ($what), $secret, 'sha256', 'base64');
            $headers = array (
                'CB-ACCESS-KEY' => $this->apiKey,
                'CB-ACCESS-SIGN' => $this->decode ($signature),
                'CB-ACCESS-TIMESTAMP' => $nonce,
                'CB-ACCESS-PASSPHRASE' => $this->password,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('message', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class gemini extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'gemini',
            'name' => 'Gemini',
            'countries' => 'US',
            'rateLimit' => 1500, // 200 for private API
            'version' => 'v1',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api' => 'https://api.gemini.com',
                'www' => 'https://gemini.com',
                'doc' => 'https://docs.gemini.com/rest-api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'symbols',
                        'pubticker/{symbol}',
                        'book/{symbol}',
                        'trades/{symbol}',
                        'auction/{symbol}',
                        'auction/{symbol}/history',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'order/new',
                        'order/cancel',
                        'order/cancel/session',
                        'order/cancel/all',
                        'order/status',
                        'orders',
                        'mytrades',
                        'tradevolume',
                        'balances',
                        'deposit/{currency}/newAddress',
                        'withdraw/{currency}',
                        'heartbeat',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $id = $markets[$p];
            $market = $id;
            $uppercase = strtoupper ($market);
            $base = mb_substr ($uppercase, 0, 3);
            $quote = mb_substr ($uppercase, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetPubtickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $timestamp = $ticker['volume']['timestamp'];
        $baseVolume = $market['base'];
        $quoteVolume = $market['quote'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume'][$baseVolume]),
            'quoteVolume' => floatval ($ticker['volume'][$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['timestampms'];
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostBalances ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => 0.0,
                'total' => floatval ($balance['amount']),
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $order = array (
            'client_order_id' => $this->nonce (),
            'symbol' => $this->market_id ($symbol),
            'amount' => (string) $amount,
            'price' => (string) $price,
            'side' => $side,
            'type' => 'exchange limit', // gemini allows limit orders only
        );
        $response = $this->privatePostOrderNew (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array_merge (array (
                'request' => $url,
                'nonce' => $nonce,
            ), $query);
            $payload = $this->json ($request);
            $payload = base64_encode ($this->encode ($payload));
            $signature = $this->hmac ($payload, $this->encode ($this->secret), 'sha384');
            $headers = array (
                'Content-Type' => 'text/plain',
                'X-GEMINI-APIKEY' => $this->apiKey,
                'X-GEMINI-PAYLOAD' => $payload,
                'X-GEMINI-SIGNATURE' => $signature,
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class hitbtc extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'hitbtc',
            'name' => 'HitBTC',
            'countries' => 'HK', // Hong Kong
            'rateLimit' => 1500,
            'version' => '1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOrder' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api' => 'http://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'doc' => array (
                    'https://hitbtc.com/api',
                    'http://hitbtc-com.github.io/hitbtc-api',
                    'http://jsfiddle.net/bmknight/RqbYB',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time,'
                    ),
                ),
                'trading' => array (
                    'get' => array (
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ),
                    'post' => array (
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ),
                ),
                'payment' => array (
                    'get' => array (
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ),
                    'post' => array (
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ),
                )
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        if ($currency == 'CAT')
            return 'BitClave';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($markets['symbols']); $p++) {
            $market = $markets['symbols'][$p];
            $id = $market['symbol'];
            $base = $market['commodity'];
            $quote = $market['currency'];
            $lot = floatval ($market['lot']);
            $step = floatval ($market['step']);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'step' => $step,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $method = $this->safe_string ($params, 'type', 'trading');
        $method .= 'GetBalance';
        $query = $this->omit ($params, 'type');
        $response = $this->$method ($query);
        $balances = $response['balance'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['currency_code'];
            $currency = $this->common_currency_code ($code);
            $free = $this->safe_float ($balance, 'cash', 0.0);
            $free = $this->safe_float ($balance, 'balance', $free);
            $used = $this->safe_float ($balance, 'reserved', 0.0);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $this->sum ($free, $used),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetSymbolOrderbook (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'bid'),
            'ask' => $this->safe_float ($ticker, 'ask'),
            'vwap' => null,
            'open' => $this->safe_float ($ticker, 'open'),
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float ($ticker, 'volume'),
            'quoteVolume' => $this->safe_float ($ticker, 'volume_quote'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTicker ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetSymbolTicker (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        if (array_key_exists ('message', $ticker))
            throw new ExchangeError ($this->id . ' ' . $ticker['message']);
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        return array (
            'info' => $trade,
            'id' => $trade[0],
            'timestamp' => $trade[3],
            'datetime' => $this->iso8601 ($trade[3]),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade[4],
            'price' => floatval ($trade[1]),
            'amount' => floatval ($trade[2]),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetSymbolTrades (array_merge (array (
            'symbol' => $market['id'],
            // 'from' => 0,
            // 'till' => 100,
            // 'by' => 'ts', // or by trade_id
            // 'sort' => 'desc', // or asc
            // 'start_index' => 0,
            // 'max_results' => 1000,
            // 'format_item' => 'object',
            // 'format_price' => 'number',
            // 'format_amount' => 'number',
            // 'format_tid' => 'string',
            // 'format_timestamp' => 'millisecond',
            // 'format_wrap' => false,
            'side' => 'true',
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        // check if $amount can be evenly divided into lots
        // they want integer $quantity in lot units
        $quantity = floatval ($amount) / $market['lot'];
        $wholeLots = (int) round ($quantity);
        $difference = $quantity - $wholeLots;
        if (abs ($difference) > $market['step'])
            throw new ExchangeError ($this->id . ' $order $amount should be evenly divisible by lot unit size of ' . (string) $market['lot']);
        $clientOrderId = $this->milliseconds ();
        $order = array (
            'clientOrderId' => (string) $clientOrderId,
            'symbol' => $market['id'],
            'side' => $side,
            'quantity' => (string) $wholeLots, // $quantity in integer lot units
            'type' => $type,
        );
        if ($type == 'limit') {
            $order['price'] = sprintf ('%10f', $price);
        } else {
            $order['timeInForce'] = 'FOK';
        }
        $response = $this->tradingPostNewOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['ExecutionReport']['clientOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->tradingPostCancelOrder (array_merge (array (
            'clientOrderId' => $id,
        ), $params));
    }

    public function getOrderStatus ($status) {
        $statuses = array (
            'new' => 'open',
            'partiallyFilled' => 'partial',
            'filled' => 'closed',
            'canceled' => 'canceled',
            'rejected' => 'rejected',
            'expired' => 'expired',
        );
        return $this->safe_string ($statuses, $status);
    }

    public function parse_order ($order, $market = null) {
        $timestamp = intval ($order['lastTimestamp']);
        $symbol = null;
        if (!$market)
            $market = $this->markets_by_id[$order['symbol']];
        $status = $this->safe_string ($order, 'orderStatus');
        if ($status)
            $status = $this->getOrderStatus ($status);
        $averagePrice = $this->safe_float ($order, 'avgPrice', 0.0);
        $price = $this->safe_float ($order, 'orderPrice');
        $amount = $this->safe_float ($order, 'orderQuantity');
        $remaining = $this->safe_float ($order, 'quantityLeaves');
        $filled = null;
        $cost = null;
        if ($market) {
            $symbol = $market['symbol'];
            $amount *= $market['lot'];
            $remaining *= $market['lot'];
        }
        if ($amount && $remaining) {
            $filled = $amount - $remaining;
            $cost = $averagePrice * $filled;
        }
        return array (
            'id' => (string) $order['clientOrderId'],
            'info' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $status,
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->tradingGetOrder (array_merge (array (
            'client_order_id' => $id,
        ), $params));
        return $this->parse_order ($response['orders'][0]);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $statuses = array ('new', 'partiallyFiiled');
        $market = $this->market ($symbol);
        $request = array (
            'sort' => 'desc',
            'statuses' => implode (',', $statuses),
        );
        if ($market)
            $request['symbols'] = $market['id'];
        $response = $this->tradingGetOrdersActive (array_merge ($request, $params));
        return $this->parse_orders ($response['orders'], $market);
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $statuses = array ('filled', 'canceled', 'rejected', 'expired');
        $request = array (
            'sort' => 'desc',
            'statuses' => implode (',', $statuses),
            'max_results' => 1000,
        );
        if ($market)
            $request['symbols'] = $market['id'];
        $response = $this->tradingGetOrdersRecent (array_merge ($request, $params));
        return $this->parse_orders ($response['orders'], $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->paymentPostPayout (array_merge (array (
            'currency_code' => $currency,
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['transaction'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . 'api' . '/' . $this->version . '/' . $api . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $payload = array ( 'nonce' => $nonce, 'apikey' => $this->apiKey );
            $query = array_merge ($payload, $query);
            if ($method == 'GET')
                $url .= '?' . $this->urlencode ($query);
            else
                $url .= '?' . $this->urlencode ($payload);
            $auth = $url;
            if ($method == 'POST') {
                if ($query) {
                    $body = $this->urlencode ($query);
                    $auth .= $body;
                }
            }
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'X-Signature' => strtolower ($this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512')),
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('code', $response)) {
            if (array_key_exists ('ExecutionReport', $response)) {
                if ($response['ExecutionReport']['orderRejectReason'] == 'orderExceedsLimit')
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
            }
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class hitbtc2 extends hitbtc {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'hitbtc2',
            'name' => 'HitBTC v2',
            'countries' => 'HK', // Hong Kong
            'rateLimit' => 1500,
            'version' => '2',
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOrders' => false,
            'hasFetchOpenOrders' => false,
            'hasFetchClosedOrders' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api' => 'https://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'doc' => array (
                    'https://api.hitbtc.com/api/2/explore',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'symbol', // Available Currency Symbols
                        'symbol/{symbol}', // Get symbol info
                        'currency', // Available Currencies
                        'currency/{currency}', // Get currency info
                        'ticker', // Ticker list for all symbols
                        'ticker/{symbol}', // Ticker for symbol
                        'trades/{symbol}', // Trades
                        'orderbook/{symbol}', // Orderbook
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order', // List your current open orders
                        'order/{clientOrderId}', // Get a single order by clientOrderId
                        'trading/balance', // Get trading balance
                        'trading/fee/{symbol}', // Get trading fee rate
                        'history/trades', // Get historical trades
                        'history/order', // Get historical orders
                        'history/order/{id}/trades', // Get historical trades by specified order
                        'account/balance', // Get main acccount balance
                        'account/transactions', // Get account transactions
                        'account/transactions/{id}', // Get account transaction by id
                        'account/crypto/address/{currency}', // Get deposit crypro address
                    ),
                    'post' => array (
                        'order', // Create new order
                        'account/crypto/withdraw', // Withdraw crypro
                        'account/crypto/address/{currency}', // Create new deposit crypro address
                        'account/transfer', // Transfer amount to trading
                    ),
                    'put' => array (
                        'order/{clientOrderId}', // Create new order
                        'account/crypto/withdraw/{id}', // Commit withdraw crypro
                    ),
                    'delete' => array (
                        'order', // Cancel all open orders
                        'order/{clientOrderId}', // Cancel order
                        'account/crypto/withdraw/{id}', // Rollback withdraw crypro
                    ),
                    'patch' => array (
                        'order/{clientOrderId}', // Cancel Replace order
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0 / 100,
                    'taker' => 0.1 / 100,
                ),
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        if ($currency == 'CAT')
            return 'BitClave';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbol ();
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['id'];
            $base = $market['baseCurrency'];
            $quote = $market['quoteCurrency'];
            $lot = $market['quantityIncrement'];
            $step = floatval ($market['tickSize']);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'price' => 2,
                'amount' => -1 * log10($step),
            );
            $amountLimits = array ( 'min' => $lot );
            $limits = array ( 'amount' => $amountLimits );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'step' => $step,
                'info' => $market,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetTradingBalance ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['currency'];
            $currency = $this->common_currency_code ($code);
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['reserved']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderbookSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'bid', 'ask', 'price', 'size');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['timestamp']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'bid'),
            'ask' => $this->safe_float ($ticker, 'ask'),
            'vwap' => null,
            'open' => $this->safe_float ($ticker, 'open'),
            'close' => $this->safe_float ($ticker, 'close'),
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float ($ticker, 'volume'),
            'quoteVolume' => $this->safe_float ($ticker, 'volumeQuote'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTicker ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker['symbol'];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        if (array_key_exists ('message', $ticker))
            throw new ExchangeError ($this->id . ' ' . $ticker['message']);
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['timestamp']);
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['quantity']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $clientOrderId = $this->milliseconds ();
        $amount = floatval ($amount);
        $order = array (
            'clientOrderId' => (string) $clientOrderId,
            'symbol' => $market['id'],
            'side' => $side,
            'quantity' => (string) $amount,
            'type' => $type,
        );
        if ($type == 'limit') {
            $price = floatval ($price);
            $order['price'] = sprintf ('%10f', $price);
        } else {
            $order['timeInForce'] = 'FOK';
        }
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['clientOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteOrderClientOrderId (array_merge (array (
            'clientOrderId' => $id,
        ), $params));
    }

    public function parse_order ($order, $market = null) {
        $lastTime = $this->parse8601 ($order['updatedAt']);
        $timestamp = $lastTime.getTime();

        if (!$market)
            $market = $this->markets_by_id[$order['symbol']];
        $symbol = $market['symbol'];

        $amount = $order['quantity'];
        $filled = $order['cumQuantity'];
        $remaining = $amount - $filled;

        return array (
            'id' => (string) $order['clientOrderId'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $order['price'],
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
            'info' => $order,
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetOrder (array_merge (array (
            'client_order_id' => $id,
        ), $params));
        return $this->parse_order ($response['orders'][0]);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $params = array_merge (array ('symbol' => $market['id']));
        }
        $response = $this->privateGetOrder ($params);

        return $this->parse_orders ($response, $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $amount = floatval ($amount);
        $response = $this->privatePostAccountCryptoWithdraw (array_merge (array (
            'currency' => $currency,
            'amount' => (string) $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api' . '/' . $this->version . '/';
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            $url .= $api . '/' . $this->implode_params ($path, $params);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $url .= $this->implode_params ($path, $params) . '?' . $this->urlencode ($query);
            if ($method != 'GET')
                if ($query)
                    $body = $this->json ($query);
            $payload = $this->encode ($this->apiKey . ':' . $this->secret);
            $auth = base64_encode ($payload);
            $headers = array (
                'Authorization' => "Basic " . $this->decode ($auth),
                'Content-Type' => 'application/json',
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class huobi1 extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'huobi1',
            'name' => 'Huobi v1',
            'countries' => 'CN',
            'rateLimit' => 2000,
            'version' => 'v1',
            'hasFetchOHLCV' => true,
            'accounts' => null,
            'accountsById' => null,
            'timeframes' => array (
                '1m' => '1min',
                '5m' => '5min',
                '15m' => '15min',
                '30m' => '30min',
                '1h' => '60min',
                '1d' => '1day',
                '1w' => '1week',
                '1M' => '1mon',
                '1y' => '1year',
            ),
            'api' => array (
                'market' => array (
                    'get' => array (
                        'history/kline', // 获取K线数据
                        'detail/merged', // 获取聚合行情(Ticker)
                        'depth', // 获取 Market Depth 数据
                        'trade', // 获取 Trade Detail 数据
                        'history/trade', // 批量获取最近的交易记录
                        'detail', // 获取 Market Detail 24小时成交量数据
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'common/symbols', // 查询系统支持的所有交易对
                        'common/currencys', // 查询系统支持的所有币种
                        'common/timestamp', // 查询系统当前时间
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account/accounts', // 查询当前用户的所有账户(即account-id)
                        'account/accounts/{id}/balance', // 查询指定账户的余额
                        'order/orders/{id}', // 查询某个订单详情
                        'order/orders/{id}/matchresults', // 查询某个订单的成交明细
                        'order/orders', // 查询当前委托、历史委托
                        'order/matchresults', // 查询当前成交、历史成交
                        'dw/withdraw-virtual/addresses', // 查询虚拟币提现地址
                    ),
                    'post' => array (
                        'order/orders/place', // 创建并执行一个新订单 (一步下单， 推荐使用)
                        'order/orders', // 创建一个新的订单请求 （仅创建订单，不执行下单）
                        'order/orders/{id}/place', // 执行一个订单 （仅执行已创建的订单）
                        'order/orders/{id}/submitcancel', // 申请撤销一个订单请求
                        'order/orders/batchcancel', // 批量撤销订单
                        'dw/balance/transfer', // 资产划转
                        'dw/withdraw-virtual/create', // 申请提现虚拟币
                        'dw/withdraw-virtual/{id}/place', // 确认申请虚拟币提现
                        'dw/withdraw-virtual/{id}/cancel', // 申请取消提现虚拟币
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $response = $this->publicGetCommonSymbols ();
        $markets = $response['data'];
        $numMarkets = count ($markets);
        if ($numMarkets < 1)
            throw new ExchangeError ($this->id . ' publicGetCommonSymbols returned empty $response => ' . $this->json ($response));
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $baseId = $market['base-currency'];
            $quoteId = $market['quote-currency'];
            $base = strtoupper ($baseId);
            $quote = strtoupper ($quoteId);
            $id = $baseId . $quoteId;
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $last = null;
        if (array_key_exists ('last', $ticker))
            $last = $ticker['last'];
        $timestamp = $this->milliseconds ();
        if (array_key_exists ('ts', $ticker))
            $timestamp = $ticker['ts'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => $ticker['bid'][0],
            'ask' => $ticker['ask'][0],
            'vwap' => null,
            'open' => $ticker['open'],
            'close' => $ticker['close'],
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['amount']),
            'quoteVolume' => $ticker['vol'],
            'info' => $ticker,
        );
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->marketGetDepth (array_merge (array (
            'symbol' => $market['id'],
            'type' => 'step0',
        ), $params));
        return $this->parse_order_book ($response['tick'], $response['tick']['ts']);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->marketGetDetailMerged (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker ($response['tick'], $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['ts'];
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['direction'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function parse_trades_data ($data, $market) {
        $result = array ();
        for ($i = 0; $i < count ($data); $i++) {
            $trades = $this->parse_trades ($data[$i]['data'], $market);
            for ($k = 0; $k < count ($trades); $k++) {
                $result[] = $trades[$k];
            }
        }
        return $result;
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->marketGetHistoryTrade (array_merge (array (
            'symbol' => $market['id'],
            'size' => 2000,
        ), $params));
        return $this->parse_trades_data ($response['data'], $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv['id'] * 1000,
            $ohlcv['open'],
            $ohlcv['high'],
            $ohlcv['low'],
            $ohlcv['close'],
            $ohlcv['vol'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->marketGetHistoryKline (array_merge (array (
            'symbol' => $market['id'],
            'period' => $this->timeframes[$timeframe],
            'size' => 2000, // max = 2000
        ), $params));
        return $this->parse_ohlcvs ($response['data'], $market, $timeframe, $since, $limit);
    }

    public function loadAccounts ($reload = false) {
        if ($reload) {
            $this->accounts = $this->fetchAccounts ();
        } else {
            if ($this->accounts) {
                return $this->accounts;
            } else {
                $this->accounts = $this->fetchAccounts ();
                $this->accountsById = $this->index_by ($this->accounts, 'id');
            }
        }
        return $this->accounts;
    }

    public function fetchAccounts () {
        $this->load_markets ();
        $response = $this->privateGetAccountAccounts ();
        return $response['data'];
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $this->loadAccounts ();
        $response = $this->privateGetAccountAccountsIdBalance (array_merge (array (
            'id' => $this->accounts[0]['id'],
        ), $params));
        $balances = $response['data']['list'];
        $result = array ( 'info' => $response );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $uppercase = strtoupper ($balance['currency']);
            $currency = $this->common_currency_code ($uppercase);
            $account = $this->account ();
            $account['free'] = floatval ($balance['balance']);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $this->loadAccounts ();
        $market = $this->market ($symbol);
        $order = array (
            'account-id' => $this->accounts[0]['id'],
            'amount' => sprintf ('%10f', $amount),
            'symbol' => $market['id'],
            'type' => $side . '-' . $type,
        );
        if ($type == 'limit')
            $order['price'] = sprintf ('%10f', $price);
        $response = $this->privatePostOrderOrdersPlace (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['data'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostOrderOrdersIdSubmitcancel (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/';
        if ($api == 'market')
            $url .= $api;
        else
            $url .= $this->version;
        $url .= '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'private') {
            $timestamp = $this->YmdHMS ($this->milliseconds (), 'T');
            $request = $this->keysort (array_merge (array (
                'SignatureMethod' => 'HmacSHA256',
                'SignatureVersion' => '2',
                'AccessKeyId' => $this->apiKey,
                'Timestamp' => $timestamp,
            ), $query));
            $auth = $this->urlencode ($request);
            $payload = implode ("\n", array ($method, $this->hostname, $url, $auth));
            $signature = $this->hmac ($this->encode ($payload), $this->encode ($this->secret), 'sha256', 'base64');
            $auth .= '&' . $this->urlencode (array ( 'Signature' => $signature ));
            if ($method == 'GET') {
                $url .= '?' . $auth;
            } else {
                $body = $this->json ($query);
                $headers = array (
                    'Content-Type' => 'application/json',
                );
            }
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class huobicny extends huobi1 {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'huobicny',
            'name' => 'Huobi CNY',
            'hostname' => 'be.huobi.com',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api' => 'https://be.huobi.com',
                'www' => 'https://www.huobi.com',
                'doc' => 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class huobipro extends huobi1 {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'huobipro',
            'name' => 'Huobi Pro',
            'hostname' => 'api.huobi.pro',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api' => 'https://api.huobi.pro',
                'www' => 'https://www.huobi.pro',
                'doc' => 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class huobi extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'huobi',
            'name' => 'Huobi',
            'countries' => 'CN',
            'rateLimit' => 2000,
            'version' => 'v3',
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '001',
                '5m' => '005',
                '15m' => '015',
                '30m' => '030',
                '1h' => '060',
                '1d' => '100',
                '1w' => '200',
                '1M' => '300',
                '1y' => '400',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api' => 'http://api.huobi.com',
                'www' => 'https://www.huobi.com',
                'doc' => 'https://github.com/huobiapi/API_Docs_en/wiki',
            ),
            'api' => array (
                'staticmarket' => array (
                    'get' => array (
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ),
                ),
                'usdmarket' => array (
                    'get' => array (
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ),
                ),
                'trade' => array (
                    'post' => array (
                        'get_account_info',
                        'get_orders',
                        'order_info',
                        'buy',
                        'sell',
                        'buy_market',
                        'sell_market',
                        'cancel_order',
                        'get_new_deal_orders',
                        'get_order_id_by_trade_id',
                        'withdraw_coin',
                        'cancel_withdraw_coin',
                        'get_withdraw_coin_result',
                        'transfer',
                        'loan',
                        'repayment',
                        'get_loan_available',
                        'get_loans',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btc', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'type' => 'staticmarket', 'coinType' => 1 ),
                'LTC/CNY' => array ( 'id' => 'ltc', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'type' => 'staticmarket', 'coinType' => 2 ),
                // 'BTC/USD' => array ( 'id' => 'btc', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'usdmarket',    'coinType' => 1 ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->tradePostGetAccountInfo ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $available = 'available_' . $lowercase . '_display';
            $frozen = 'frozen_' . $lowercase . '_display';
            $loan = 'loan_' . $lowercase . '_display';
            if (array_key_exists ($available, $balances))
                $account['free'] = floatval ($balances[$available]);
            if (array_key_exists ($frozen, $balances))
                $account['used'] = floatval ($balances[$frozen]);
            if (array_key_exists ($loan, $balances))
                $account['used'] = $this->sum ($account['used'], floatval ($balances[$loan]));
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = $market['type'] . 'GetDepthId';
        $orderbook = $this->$method (array_merge (array ( 'id' => $market['id'] ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = $market['type'] . 'GetTickerId';
        $response = $this->$method (array_merge (array (
            'id' => $market['id'],
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = intval ($response['time']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['ts'];
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['direction'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = $market['type'] . 'GetDetailId';
        $response = $this->$method (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        // not implemented yet
        return [
            $ohlcv[0],
            $ohlcv[1],
            $ohlcv[2],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[6],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $method = $market['type'] . 'GetIdKlinePeriod';
        $ohlcvs = $this->$method (array_merge (array (
            'id' => $market['id'],
            'period' => $this->timeframes[$timeframe],
        ), $params));
        return $ohlcvs;
        // return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $method = 'tradePost' . $this->capitalize ($side);
        $order = array (
            'coin_type' => $market['coinType'],
            'amount' => $amount,
            'market' => strtolower ($market['quote']),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $method .= $this->capitalize ($type);
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->tradePostCancelOrder (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'];
        if ($api == 'trade') {
            $url .= '/api' . $this->version;
            $query = $this->keysort (array_merge (array (
                'method' => $path,
                'access_key' => $this->apiKey,
                'created' => $this->nonce (),
            ), $params));
            $queryString = $this->urlencode ($this->omit ($query, 'market'));
            // secret key must be appended to the $query before signing
            $queryString .= '&secret_key=' . $this->secret;
            $query['sign'] = $this->hash ($this->encode ($queryString));
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        } else {
            $url .= '/' . $api . '/' . $this->implode_params ($path, $params) . '_json.js';
            $query = $this->omit ($params, $this->extract_params ($path));
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'trade', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        if (array_key_exists ('code', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class independentreserve extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'independentreserve',
            'name' => 'Independent Reserve',
            'countries' => array ( 'AU', 'NZ' ), // Australia, New Zealand
            'rateLimit' => 1000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg',
                'api' => array (
                    'public' => 'https://api.independentreserve.com/Public',
                    'private' => 'https://api.independentreserve.com/Private',
                ),
                'www' => 'https://www.independentreserve.com',
                'doc' => 'https://www.independentreserve.com/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'WithdrawDigitalCurrency',
                        'RequestFiatWithdrawal',
                        'GetTrades',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $baseCurrencies = $this->publicGetValidPrimaryCurrencyCodes ();
        $quoteCurrencies = $this->publicGetValidSecondaryCurrencyCodes ();
        $result = array ();
        for ($i = 0; $i < count ($baseCurrencies); $i++) {
            $baseId = $baseCurrencies[$i];
            $baseIdUppercase = strtoupper ($baseId);
            $base = $this->common_currency_code ($baseIdUppercase);
            for ($j = 0; $j < count ($quoteCurrencies); $j++) {
                $quoteId = $quoteCurrencies[$j];
                $quoteIdUppercase = strtoupper ($quoteId);
                $quote = $this->common_currency_code ($quoteIdUppercase);
                $id = $baseId . '/' . $quoteId;
                $symbol = $base . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                    'info' => $id,
                );
            }
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostGetAccounts ();
        $result = array ( 'info' => $balances );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $currencyCode = $balance['CurrencyCode'];
            $uppercase = strtoupper ($currencyCode);
            $currency = $this->common_currency_code ($uppercase);
            $account = $this->account ();
            $account['free'] = $balance['AvailableBalance'];
            $account['total'] = $balance['TotalBalance'];
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetOrderBook (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        ), $params));
        $timestamp = $this->parse8601 ($response['CreatedTimestampUtc']);
        return $this->parse_order_book ($response, $timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['CreatedTimestampUtc']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['DayHighestPrice'],
            'low' => $ticker['DayLowestPrice'],
            'bid' => $ticker['CurrentHighestBidPrice'],
            'ask' => $ticker['CurrentLowestOfferPrice'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $ticker['LastPrice'],
            'change' => null,
            'percentage' => null,
            'average' => $ticker['DayAvgPrice'],
            'baseVolume' => $ticker['DayVolumeXbtInSecondaryCurrrency'],
            'quoteVolume' => $ticker['DayVolumeXbt'],
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketSummary (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
        ), $params));
        return $this->parse_ticker ($response, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['TradeTimestampUtc']);
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => $trade['SecondaryCurrencyTradePrice'],
            'amount' => $trade['PrimaryCurrencyAmount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetRecentTrades (array_merge (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'numberOfRecentTradesToRetrieve' => 50, // max = 50
        ), $params));
        return $this->parse_trades ($response['Trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $capitalizedOrderType = $this->capitalize ($type);
        $method = 'Place' . $capitalizedOrderType . 'Order';
        $orderType = $capitalizedOrderType;
        $orderType .= ($side == 'sell') ?  'Offer' : 'Bid';
        $order = $this->ordered (array (
            'primaryCurrencyCode' => $market['baseId'],
            'secondaryCurrencyCode' => $market['quoteId'],
            'orderType' => $orderType,
        ));
        if ($type == 'limit')
            $order['price'] = $price;
        $order['volume'] = $amount;
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['OrderGuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array ( 'orderGuid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $auth = array (                $url,
                'apiKey=' . $this->apiKey,
                'nonce=' . (string) $nonce,
           );
            $keysorted = $this->keysort ($params);
            $keys = array_keys ($keysorted);
            for ($i = 0; $i < count ($keys); $i++) {
                $key = $keys[$i];
                $auth[] = $key . '=' . $params[$key];
            }
            $message = implode (',', $auth);
            $signature = $this->hmac ($this->encode ($message), $this->encode ($this->secret));
            $query = $this->keysort (array_merge (array (
                'apiKey' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
            ), $params));
            $body = $this->json ($query);
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        // todo error handling
        return $response;
    }
}

// -----------------------------------------------------------------------------

class itbit extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'itbit',
            'name' => 'itBit',
            'countries' => 'US',
            'rateLimit' => 2000,
            'version' => 'v1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api' => 'https://api.itbit.com',
                'www' => 'https://www.itbit.com',
                'doc' => array (
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders/{id}',
                    ),
                    'post' => array (
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ),
                    'delete' => array (
                        'wallets/{walletId}/orders/{id}',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'XBTUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/SGD' => array ( 'id' => 'XBTSGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/EUR' => array ( 'id' => 'XBTEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetMarketsSymbolOrderBook (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetMarketsSymbolTicker (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        $serverTimeUTC = (array_key_exists ('serverTimeUTC', $ticker));
        if (!$serverTimeUTC)
            throw new ExchangeError ($this->id . ' fetchTicker returned a bad response => ' . $this->json ($ticker));
        $timestamp = $this->parse8601 ($ticker['serverTimeUTC']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high24h']),
            'low' => floatval ($ticker['low24h']),
            'bid' => $this->safe_float ($ticker, 'bid'),
            'ask' => $this->safe_float ($ticker, 'ask'),
            'vwap' => floatval ($ticker['vwap24h']),
            'open' => floatval ($ticker['openToday']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume24h']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['timestamp']);
        $id = (string) $trade['matchNumber'];
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => $id,
            'order' => $id,
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketsSymbolTrades (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['recentTrades'], $market);
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetBalances ();
        $balances = $response['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => floatval ($balance['availableBalance']),
                'used' => 0.0,
                'total' => floatval ($balance['totalBalance']),
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetchWallets () {
        return $this->privateGetWallets ();
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $walletIdInParams = (array_key_exists ('walletId', $params));
        if (!$walletIdInParams)
            throw new ExchangeError ($this->id . ' createOrder requires a walletId parameter');
        $amount = (string) $amount;
        $price = (string) $price;
        $market = $this->market ($symbol);
        $order = array (
            'side' => $side,
            'type' => $type,
            'currency' => $market['base'],
            'amount' => $amount,
            'display' => $amount,
            'price' => $price,
            'instrument' => $market['id'],
        );
        $response = $this->privatePostTradeAdd (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $walletIdInParams = (array_key_exists ('walletId', $params));
        if (!$walletIdInParams)
            throw new ExchangeError ($this->id . ' cancelOrder requires a walletId parameter');
        return $this->privateDeleteWalletsWalletIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if ($query)
                $body = $this->json ($query);
            else
                $body = '';
            $nonce = (string) $this->nonce ();
            $timestamp = $nonce;
            $auth = array ($method, $url, $body, $nonce, $timestamp);
            $message = $nonce . $this->json ($auth);
            $hash = $this->hash ($this->encode ($message), 'sha256', 'binary');
            $binhash = $this->binary_concat ($url, $hash);
            $signature = $this->hmac ($binhash, $this->encode ($this->secret), 'sha512', 'base64');
            $headers = array (
                'Authorization' => self.apiKey . ':' . $signature,
                'Content-Type' => 'application/json',
                'X-Auth-Timestamp' => $timestamp,
                'X-Auth-Nonce' => $nonce,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('code', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class jubi extends asia {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'jubi',
            'name' => 'jubi.com',
            'countries' => 'CN',
            'rateLimit' => 1500,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api' => 'https://www.jubi.com/api',
                'www' => 'https://www.jubi.com',
                'doc' => 'https://www.jubi.com/help/api.html',
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetAllticker ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $base = strtoupper ($id);
            $quote = 'CNY'; // todo
            $symbol = $base . '/' . $quote;
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $id,
            );
        }
        return $result;
    }
}

// -----------------------------------------------------------------------------

class kraken extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'kraken',
            'name' => 'Kraken',
            'countries' => 'US',
            'version' => '0',
            'rateLimit' => 3000,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchMyTrades' => true,
            'hasWithdraw' => true,
            'marketsByAltname' => array (),
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '4h' => '240',
                '1d' => '1440',
                '1w' => '10080',
                '2w' => '21600',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api' => 'https://api.kraken.com',
                'www' => 'https://www.kraken.com',
                'doc' => array (
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ),
                'fees' => 'https://www.kraken.com/en-us/help/fees',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'AddOrder',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ),
                ),
            ),
        ), $options));
    }

    public function cost_to_precision ($symbol, $cost) {
        return $this->truncate (floatval ($cost), $this->markets[$symbol]['precision']['price']);
    }

    public function fee_to_precision ($symbol, $fee) {
        return $this->truncate (floatval ($fee), $this->markets[$symbol]['precision']['amount']);
    }

    public function fetch_markets () {
        $markets = $this->publicGetAssetPairs ();
        $keys = array_keys ($markets['result']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $market = $markets['result'][$id];
            $base = $market['base'];
            $quote = $market['quote'];
            if (($base[0] == 'X') || ($base[0] == 'Z'))
                $base = mb_substr ($base, 1);
            if (($quote[0] == 'X') || ($quote[0] == 'Z'))
                $quote = mb_substr ($quote, 1);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $darkpool = mb_strpos ($id, '.d') !== false;
            $symbol = $darkpool ? $market['altname'] : ($base . '/' . $quote);
            $maker = null;
            if (array_key_exists ('fees_maker', $market)) {
                $maker = floatval ($market['fees_maker'][0][1]) / 100;
            }
            $precision = array (
                'amount' => $market['lot_decimals'],
                'price' => $market['pair_decimals'],
            );
            $amountLimits = array (
                'min' => pow (10, -$precision['amount']),
                'max' => pow (10, $precision['amount']),
            );
            $priceLimits = array (
                'min' => pow (10, -$precision['price']),
                'max' => null,
            );
            $costLimits = array (
                'min' => 0,
                'max' => null,
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
                'cost' => $costLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'darkpool' => $darkpool,
                'info' => $market,
                'altname' => $market['altname'],
                'maker' => $maker,
                'taker' => floatval ($market['fees'][0][1]) / 100,
                'lot' => $amountLimits['min'],
                'active' => true,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        $result = $this->appendInactiveMarkets ($result);
        $this->marketsByAltname = $this->index_by ($result, 'altname');
        return $result;
    }

    public function appendInactiveMarkets ($result = []) {
        $precision = array ( 'amount' => 8, 'price' => 8 );
        $costLimits = array ( 'min' => 0, 'max' => null );
        $priceLimits = array ( 'min' => pow (10, -$precision['price']), 'max' => null );
        $amountLimits = array ( 'min' => pow (10, -$precision['amount']), 'max' => pow (10, $precision['amount']) );
        $limits = array ( 'amount' => $amountLimits, 'price' => $priceLimits, 'cost' => $costLimits );
        $defaults = array (
            'darkpool' => false,
            'info' => null,
            'maker' => null,
            'taker' => null,
            'lot' => $amountLimits['min'],
            'active' => false,
            'precision' => $precision,
            'limits' => $limits,
        );
        $markets = array (            array ( 'id' => 'XXLMZEUR', 'symbol' => 'XLM/EUR', 'base' => 'XLM', 'quote' => 'EUR', 'altname' => 'XLMEUR' ),
       );
        for ($i = 0; $i < count ($markets); $i++) {
            $result[] = array_merge ($defaults, $markets[$i]);
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $darkpool = mb_strpos ($symbol, '.d') !== false;
        if ($darkpool)
            throw new ExchangeError ($this->id . ' does not provide an order book for $darkpool $symbol ' . $symbol);
        $market = $this->market ($symbol);
        $response = $this->publicGetDepth (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $orderbook = $response['result'][$market['id']];
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['h'][1]),
            'low' => floatval ($ticker['l'][1]),
            'bid' => floatval ($ticker['b'][0]),
            'ask' => floatval ($ticker['a'][0]),
            'vwap' => floatval ($ticker['p'][1]),
            'open' => floatval ($ticker['o']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['c'][0]),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['v'][1]),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $pairs = array ();
        for ($s = 0; $s < count ($this->symbols); $s++) {
            $symbol = $this->symbols[$s];
            $market = $this->markets[$symbol];
            if ($market['active'])
                if (!$market['darkpool'])
                    $pairs[] = $market['id'];
        }
        $filter = implode (',', $pairs);
        $response = $this->publicGetTicker (array_merge (array (
            'pair' => $filter,
        ), $params));
        $tickers = $response['result'];
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $darkpool = mb_strpos ($symbol, '.d') !== false;
        if ($darkpool)
            throw new ExchangeError ($this->id . ' does not provide a $ticker for $darkpool $symbol ' . $symbol);
        $market = $this->market ($symbol);
        $response = $this->publicGetTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $ticker = $response['result'][$market['id']];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[6]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
            'interval' => $this->timeframes[$timeframe],
        );
        if ($since)
            $request['since'] = intval ($since / 1000);
        $response = $this->publicGetOHLC (array_merge ($request, $params));
        $ohlcvs = $response['result'][$market['id']];
        return $this->parse_ohlcvs ($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        $side = null;
        $type = null;
        $price = null;
        $amount = null;
        $id = null;
        $order = null;
        if (!$market)
            $market = $this->findMarketByAltnameOrId ($trade['pair']);
        if (array_key_exists ('ordertxid', $trade)) {
            $order = $trade['ordertxid'];
            $id = $trade['id'];
            $timestamp = intval ($trade['time'] * 1000);
            $side = $trade['type'];
            $type = $trade['ordertype'];
            $price = floatval ($trade['price']);
            $amount = floatval ($trade['vol']);
        } else {
            $timestamp = intval ($trade[2] * 1000);
            $side = ($trade[3] == 's') ? 'sell' : 'buy';
            $type = ($trade[4] == 'l') ? 'limit' : 'market';
            $price = floatval ($trade[0]);
            $amount = floatval ($trade[1]);
        }
        $symbol = ($market) ? $market['symbol'] : null;
        return array (
            'id' => $id,
            'order' => $order,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $id = $market['id'];
        $response = $this->publicGetTrades (array_merge (array (
            'pair' => $id,
        ), $params));
        $trades = $response['result'][$id];
        return $this->parse_trades ($trades, $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostBalance ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $code = $currency;
            // X-ISO4217-A3 standard $currency codes
            if ($code[0] == 'X') {
                $code = mb_substr ($code, 1);
            } else if ($code[0] == 'Z') {
                $code = mb_substr ($code, 1);
            }
            $code = $this->common_currency_code ($code);
            $balance = floatval ($balances[$currency]);
            $account = array (
                'free' => $balance,
                'used' => 0.0,
                'total' => $balance,
            );
            $result[$code] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $order = array (
            'pair' => $market['id'],
            'type' => $side,
            'ordertype' => $type,
            'volume' => $this->amount_to_precision ($symbol, $amount),
        );
        if ($type == 'limit')
            $order['price'] = $this->price_to_precision ($symbol, $price);
        $response = $this->privatePostAddOrder (array_merge ($order, $params));
        $length = count ($response['result']['txid']);
        $id = ($length > 1) ? $response['result']['txid'] : $response['result']['txid'][0];
        return array (
            'info' => $response,
            'id' => $id,
        );
    }

    public function findMarketByAltnameOrId ($id) {
        $result = null;
        if (array_key_exists ($id, $this->marketsByAltname)) {
            $result = $this->marketsByAltname[$id];
        } else if (array_key_exists ($id, $this->markets_by_id)) {
            $result = $this->markets_by_id[$id];
        }
        return $result;
    }

    public function parse_order ($order, $market = null) {
        $description = $order['descr'];
        $side = $description['type'];
        $type = $description['ordertype'];
        $symbol = null;
        if (!$market)
            $market = $this->findMarketByAltnameOrId ($description['pair']);
        $timestamp = intval ($order['opentm'] * 1000);
        $amount = floatval ($order['vol']);
        $filled = floatval ($order['vol_exec']);
        $remaining = $amount - $filled;
        $fee = null;
        $cost = $this->safe_float ($order, 'cost');
        $price = $this->safe_float ($description, 'price');
        if (!$price)
            $price = $this->safe_float ($order, 'price');
        if ($market) {
            $symbol = $market['symbol'];
            if (array_key_exists ('fee', $order)) {
                $flags = $order['oflags'];
                $feeCost = $this->safe_float ($order, 'fee');
                $fee = array (
                    'cost' => $feeCost,
                    'rate' => null,
                );
                if (mb_strpos ($flags, 'fciq') !== false) {
                    $fee['currency'] = $market['quote'];
                } else if (mb_strpos ($flags, 'fcib') !== false) {
                    $fee['currency'] = $market['base'];
                }
            }
        }
        return array (
            'id' => $order['id'],
            'info' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => $fee,
            // 'trades' => $this->parse_trades ($order['trades'], $market),
        );
    }

    public function parse_orders ($orders, $market = null) {
        $result = array ();
        $ids = array_keys ($orders);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $order = array_merge (array ( 'id' => $id ), $orders[$id]);
            $result[] = $this->parse_order ($order, $market);
        }
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostQueryOrders (array_merge (array (
            'trades' => true, // whether or not to include trades in output (optional, default false)
            'txid' => $id, // comma delimited list of transaction ids to query info about (20 maximum)
            // 'userref' => 'optional', // restrict results to given user reference $id (optional)
        ), $params));
        $orders = $response['result'];
        $order = $this->parse_order (array_merge (array ( 'id' => $id ), $orders[$id]));
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostTradesHistory (array_merge (array (
            // 'type' => 'all', // any position, closed position, closing position, no position
            // 'trades' => false, // whether or not to include $trades related to position in output
            // 'start' => 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
            // 'end' => 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
            // 'ofs' = result offset
        ), $params));
        $trades = $response['result']['trades'];
        $ids = array_keys ($trades);
        for ($i = 0; $i < count ($ids); $i++) {
            $trades[$ids[$i]]['id'] = $ids[$i];
        }
        return $this->parse_trades ($trades);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $response = $this->privatePostCancelOrder (array_merge (array (
                'txid' => $id,
            ), $params));
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'error');
                if (mb_strpos ($message, 'EOrder:Unknown order') !== false)
                    throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $response;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        if (array_key_exists ('key', $params)) {
            $this->load_markets ();
            $response = $this->privatePostWithdraw (array_merge (array (
                'asset' => $currency,
                'amount' => $amount,
                // 'address' => $address, // they don't allow withdrawals to direct addresses
            ), $params));
            return array (
                'info' => $response,
                'id' => $response['result'],
            );
        }
        throw new ExchangeError ($this->id . " withdraw requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostOpenOrders ($params);
        $orders = $this->parse_orders ($response['result']['open']);
        return $this->filter_orders_by_symbol ($orders, $symbol);
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostClosedOrders ($params);
        $orders = $this->parse_orders ($response['result']['closed']);
        return $this->filter_orders_by_symbol ($orders, $symbol);
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $api . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            $auth = $this->encode ($nonce . $body);
            $hash = $this->hash ($auth, 'sha256', 'binary');
            $binary = $this->encode ($url);
            $binhash = $this->binary_concat ($binary, $hash);
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($binhash, $secret, 'sha512', 'base64');
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Sign' => $this->decode ($signature),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response)) {
            $numErrors = count ($response['error']);
            if ($numErrors) {
                for ($i = 0; $i < count ($response['error']); $i++) {
                    if ($response['error'][$i] == 'EService:Unavailable')
                        throw new ExchangeNotAvailable ($this->id . ' ' . $this->json ($response));
                }
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class kuna extends acx {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'kuna',
            'name' => 'Kuna',
            'countries' => 'UA',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => false,
            'hasFetchTickers' => false,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
                'api' => 'https://kuna.io',
                'www' => 'https://kuna.io',
                'doc' => 'https://kuna.io/documents/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'tickers/{market}',
                        'order_book',
                        'order_book/{market}',
                        'trades',
                        'trades/{market}',
                        'timestamp',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'members/me',
                        'orders',
                        'trades/my',
                    ),
                    'post' => array (
                        'orders',
                        'order/delete',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/UAH' => array ( 'id' => 'btcuah', 'symbol' => 'BTC/UAH', 'base' => 'BTC', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ))),
                'ETH/UAH' => array ( 'id' => 'ethuah', 'symbol' => 'ETH/UAH', 'base' => 'ETH', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ))),
                'GBG/UAH' => array ( 'id' => 'gbguah', 'symbol' => 'GBG/UAH', 'base' => 'GBG', 'quote' => 'UAH', 'precision' => array ( 'amount' => 3, 'price' => 2 ), 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ))), // Golos Gold (GBG != GOLOS)
                'KUN/BTC' => array ( 'id' => 'kunbtc', 'symbol' => 'KUN/BTC', 'base' => 'KUN', 'quote' => 'BTC', 'precision' => array ( 'amount' => 6, 'price' => 6 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ))),
                'BCH/BTC' => array ( 'id' => 'bchbtc', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'precision' => array ( 'amount' => 6, 'price' => 6 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ))),
                'WAVES/UAH' => array ( 'id' => 'wavesuah', 'symbol' => 'WAVES/UAH', 'base' => 'WAVES', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ))),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.2 / 100,
                    'maker' => 0.2 / 100,
                ),
            ),
        ), $options));
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code == 400) {
            $data = json_decode ($body, $as_associative_array = true);
            $error = $data['error'];
            $errorMessage = $error['message'];
            if (mb_strpos ($errorMessage, 'cannot lock funds')) {
                throw new InsufficientFunds (implode (' ', array ($this->id, $method, $url, $code, $reason, $body)));
            }
        }
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderBook = $this->publicGetOrderBook (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_order_book ($orderBook, null, 'bids', 'asks', 'price', 'volume');
    }

    public function parse_order ($order, $market) {
        $symbol = $market['symbol'];
        $timestamp = $this->parse8601 ($order['created_at']);
        return array (
            'id' => $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $symbol,
            'type' => $order['ord_type'],
            'side' => $order['side'],
            'price' => floatval ($order['price']),
            'amount' => floatval ($order['volume']),
            'filled' => floatval ($order['executed_volume']),
            'remaining' => floatval ($order['remaining_volume']),
            'trades' => null,
            'fee' => null,
            'info' => $order,
        );
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol argument');
        $market = $this->market ($symbol);
        $orders = $this->privateGetOrders (array_merge (array (
            'market' => $market['id'],
        ), $params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache . fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return $this->parse_orders ($orders, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['volume']),
            'info' => $trade,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }
}

// -----------------------------------------------------------------------------

class lakebtc extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'lakebtc',
            'name' => 'LakeBTC',
            'countries' => 'US',
            'version' => 'api_v2',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
                'api' => 'https://api.lakebtc.com',
                'www' => 'https://www.lakebtc.com',
                'doc' => array (
                    'https://www.lakebtc.com/s/api_v2',
                    'https://www.lakebtc.com/s/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'bcorderbook',
                        'bctrades',
                        'ticker',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'buyOrder',
                        'cancelOrders',
                        'getAccountInfo',
                        'getExternalAccounts',
                        'getOrders',
                        'getTrades',
                        'openOrders',
                        'sellOrder',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTicker ();
        $result = array ();
        $keys = array_keys ($markets);
        for ($k = 0; $k < count ($keys); $k++) {
            $id = $keys[$k];
            $market = $markets[$id];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['balance'];
        $result = array ( 'info' => $response );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $balance = floatval ($balances[$currency]);
            $account = array (
                'free' => $balance,
                'used' => 0.0,
                'total' => $balance,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetBcorderbook (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetTicker (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $ticker = $tickers[$market['id']];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'bid'),
            'ask' => $this->safe_float ($ticker, 'ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float ($ticker, 'volume'),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetBctrades (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $method = 'privatePost' . $this->capitalize ($side) . 'Order';
        $marketId = $this->market_id ($market);
        $order = array (
            'params' => array ($price, $amount, $marketId),
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array ( 'params' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version;
        if ($api == 'public') {
            $url .= '/' . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            if ($params)
                $params = implode (',', $params);
            else
                $params = '';
            $query = $this->urlencode (array (
                'tonce' => $nonce,
                'accesskey' => $this->apiKey,
                'requestmethod' => strtolower ($method),
                'id' => $nonce,
                'method' => $path,
                'params' => $params,
            ));
            $body = $this->json (array (
                'method' => $path,
                'params' => $params,
                'id' => $nonce,
            ));
            $signature = $this->hmac ($this->encode ($query), $this->secret, 'sha1', 'base64');
            $headers = array (
                'Json-Rpc-Tonce' => $nonce,
                'Authorization' => "Basic " . $this->apiKey . ':' . $signature,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class livecoin extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'livecoin',
            'name' => 'LiveCoin',
            'countries' => array ( 'US', 'UK', 'RU' ),
            'rateLimit' => 1000,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg',
                'api' => 'https://api.livecoin.net',
                'www' => 'https://www.livecoin.net',
                'doc' => 'https://www.livecoin.net/api?lang=en',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'exchange/all/order_book',
                        'exchange/last_trades',
                        'exchange/maxbid_minask',
                        'exchange/order_book',
                        'exchange/restrictions',
                        'exchange/ticker', // omit params to get all tickers at once
                        'info/coinInfo',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'exchange/client_orders',
                        'exchange/order',
                        'exchange/trades',
                        'exchange/commission',
                        'exchange/commissionCommonInfo',
                        'payment/balances',
                        'payment/balance',
                        'payment/get/address',
                        'payment/history/size',
                        'payment/history/transactions',
                    ),
                    'post' => array (
                        'exchange/buylimit',
                        'exchange/buymarket',
                        'exchange/cancellimit',
                        'exchange/selllimit',
                        'exchange/sellmarket',
                        'payment/out/capitalist',
                        'payment/out/card',
                        'payment/out/coin',
                        'payment/out/okpay',
                        'payment/out/payeer',
                        'payment/out/perfectmoney',
                        'payment/voucher/amount',
                        'payment/voucher/make',
                        'payment/voucher/redeem',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetExchangeTicker ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['symbol'];
            $symbol = $id;
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetPaymentBalances ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($this->currencies); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = null;
            if (array_key_exists ($currency, $result))
                $account = $result[$currency];
            else
                $account = $this->account ();
            if ($balance['type'] == 'total')
                $account['total'] = floatval ($balance['value']);
            if ($balance['type'] == 'available')
                $account['free'] = floatval ($balance['value']);
            if ($balance['type'] == 'trade')
                $account['used'] = floatval ($balance['value']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetExchangeOrderBook (array_merge (array (
            'currencyPair' => $this->market_id ($symbol),
            'groupByPrice' => 'false',
            'depth' => 100,
        ), $params));
        $timestamp = $orderbook['timestamp'];
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['best_bid']),
            'ask' => floatval ($ticker['best_ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetExchangeTicker ($params);
        $tickers = $this->index_by ($response, 'symbol');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetExchangeTicker (array_merge (array (
            'currencyPair' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['time'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['id'],
            'order' => null,
            'type' => null,
            'side' => strtolower ($trade['type']),
            'price' => $trade['price'],
            'amount' => $trade['quantity'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetExchangeLastTrades (array_merge (array (
            'currencyPair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $method = 'privatePostExchange' . $this->capitalize ($side) . $type;
        $order = array (
            'currencyPair' => $this->market_id ($symbol),
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostExchangeCancellimit (array_merge (array (
            'orderId' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $query = $this->urlencode ($this->keysort ($params));
            if ($method == 'GET')
                if ($query)
                    $url .= '?' . $query;
            else
                if ($query)
                    $body = $query;
            $signature = $this->hmac ($this->encode ($query), $this->encode ($this->secret), 'sha256');
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Sign' => strtoupper ($signature),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response))
            if (!$response['success'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class liqui extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'liqui',
            'name' => 'Liqui',
            'countries' => 'UA',
            'rateLimit' => 2500,
            'version' => '3',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchTickers' => true,
            'hasFetchMyTrades' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api' => array (
                    'public' => 'https://api.liqui.io/api',
                    'private' => 'https://api.liqui.io/tapi',
                ),
                'www' => 'https://liqui.io',
                'doc' => 'https://liqui.io/api',
                'fees' => 'https://liqui.io/fee',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.001,
                    'taker' => 0.0025,
                ),
                'funding' => 0.0,
            ),
        ), $options));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostWithdrawCoin (array_merge (array (
            'coinName' => $currency,
            'amount' => floatval ($amount),
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['return']['tId'],
        );
    }
}

// -----------------------------------------------------------------------------

class luno extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'luno',
            'name' => 'luno',
            'countries' => array ( 'GB', 'SG', 'ZA' ),
            'rateLimit' => 3000,
            'version' => '1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api' => 'https://api.mybitx.com/api',
                'www' => 'https://www.luno.com',
                'doc' => array (
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'orderbook',
                        'ticker',
                        'tickers',
                        'trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'accounts/{id}/pending',
                        'accounts/{id}/transactions',
                        'balance',
                        'fee_info',
                        'funding_address',
                        'listorders',
                        'listtrades',
                        'orders/{id}',
                        'quotes/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                    ),
                    'post' => array (
                        'accounts',
                        'postorder',
                        'marketorder',
                        'stoporder',
                        'funding_address',
                        'withdrawals',
                        'send',
                        'quotes',
                        'oauth2/grant',
                    ),
                    'put' => array (
                        'quotes/{id}',
                    ),
                    'delete' => array (
                        'quotes/{id}',
                        'withdrawals/{id}',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTickers ();
        $result = array ();
        for ($p = 0; $p < count ($markets['tickers']); $p++) {
            $market = $markets['tickers'][$p];
            $id = $market['pair'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalance ();
        $balances = $response['balance'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $this->common_currency_code ($balance['asset']);
            $reserved = floatval ($balance['reserved']);
            $unconfirmed = floatval ($balance['unconfirmed']);
            $account = array (
                'free' => floatval ($balance['balance']),
                'used' => $this->sum ($reserved, $unconfirmed),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $orderbook['timestamp'];
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_trade']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['rolling_24_hour_volume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetTickers ($params);
        $tickers = $this->index_by ($response['tickers'], 'pair');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $side = ($trade['is_buy']) ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => null,
            'order' => null,
            'timestamp' => $trade['timestamp'],
            'datetime' => $this->iso8601 ($trade['timestamp']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['volume']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $method = 'privatePost';
        $order = array ( 'pair' => $this->market_id ($market) );
        if ($type == 'market') {
            $method .= 'Marketorder';
            $order['type'] = strtoupper ($side);
            if ($side == 'buy')
                $order['counter_volume'] = $amount;
            else
                $order['base_volume'] = $amount;
        } else {
            $method .= 'Order';
            $order['volume'] = $amount;
            $order['price'] = $price;
            if ($side == 'buy')
                $order['type'] = 'BID';
            else
                $order['type'] = 'ASK';
        }
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostStoporder (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        if ($api == 'private') {
            $auth = $this->encode ($this->apiKey . ':' . $this->secret);
            $auth = base64_encode ($auth);
            $headers = array ( 'Authorization' => 'Basic ' . $this->decode ($auth) );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class mercado extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'mercado',
            'name' => 'Mercado Bitcoin',
            'countries' => 'BR', // Brazil
            'rateLimit' => 1000,
            'version' => 'v3',
            'hasCORS' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api' => array (
                    'public' => 'https://www.mercadobitcoin.net/api',
                    'private' => 'https://www.mercadobitcoin.net/tapi',
                ),
                'www' => 'https://www.mercadobitcoin.com.br',
                'doc' => array (
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'orderbook/', // last slash critical
                        'orderbook_litecoin/',
                        'ticker/',
                        'ticker_litecoin/',
                        'trades/',
                        'trades_litecoin/',
                        'v2/ticker/',
                        'v2/ticker_litecoin/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'withdraw_coin',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/BRL' => array ( 'id' => 'BRLBTC', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'suffix' => '' ),
                'LTC/BRL' => array ( 'id' => 'BRLLTC', 'symbol' => 'LTC/BRL', 'base' => 'LTC', 'quote' => 'BRL', 'suffix' => 'Litecoin' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = 'publicGetOrderbook' . $this->capitalize ($market['suffix']);
        $orderbook = $this->$method ($params);
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = 'publicGetV2Ticker' . $this->capitalize ($market['suffix']);
        $response = $this->$method ($params);
        $ticker = $response['ticker'];
        $timestamp = intval ($ticker['date']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $method = 'publicGetTrades' . $this->capitalize ($market['suffix']);
        $response = $this->$method ($params);
        return $this->parse_trades ($response, $market);
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['balance'];
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            if (array_key_exists ($lowercase, $balances)) {
                $account['free'] = floatval ($balances[$lowercase]['available']);
                $account['total'] = floatval ($balances[$lowercase]['total']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $method = 'privatePostPlace' . $this->capitalize ($side) . 'Order';
        $order = array (
            'coin_pair' => $this->market_id ($symbol),
            'quantity' => $amount,
            'limit_price' => $price,
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['response_data']['order']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $request = array (
            'coin' => $currency,
            'quantity' => sprintf ('%10f', $amount),
            'address' => $address,
        );
        if ($currency == 'BRL') {
            $account_ref = (array_key_exists ('account_ref', $params));
            if (!$account_ref)
                throw new ExchangeError ($this->id . ' requires $account_ref parameter to withdraw ' . $currency);
        } else if ($currency != 'LTC') {
            $tx_fee = (array_key_exists ('tx_fee', $params));
            if (!$tx_fee)
                throw new ExchangeError ($this->id . ' requires $tx_fee parameter to withdraw ' . $currency);
        }
        $response = $this->privatePostWithdrawCoin (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response['response_data']['withdrawal']['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/';
        if ($api == 'public') {
            $url .= $path;
        } else {
            $url .= $this->version . '/';
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'tapi_method' => $path,
                'tapi_nonce' => $nonce,
            ), $params));
            $auth = '/tapi/' . $this->version . '/' . '?' . $body;
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'TAPI-ID' => $this->apiKey,
                'TAPI-MAC' => $this->hmac ($this->encode ($auth), $this->secret, 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error_message', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class mixcoins extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'mixcoins',
            'name' => 'MixCoins',
            'countries' => array ( 'GB', 'HK' ),
            'rateLimit' => 1500,
            'version' => 'v1',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg',
                'api' => 'https://mixcoins.com/api',
                'www' => 'https://mixcoins.com',
                'doc' => 'https://mixcoins.com/help/api/',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'trades',
                        'depth',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'cancel',
                        'info',
                        'orders',
                        'order',
                        'transactions',
                        'trade',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'BCH/BTC' => array ( 'id' => 'bcc_btc', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC' ),
                'LSK/BTC' => array ( 'id' => 'lsk_btc', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
                'BCH/USD' => array ( 'id' => 'bcc_usd', 'symbol' => 'BCH/USD', 'base' => 'BCH', 'quote' => 'USD' ),
                'ETH/USD' => array ( 'id' => 'eth_usd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostInfo ();
        $balance = $response['result']['wallet'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            if (array_key_exists ($lowercase, $balance)) {
                $account['free'] = floatval ($balance[$lowercase]['avail']);
                $account['used'] = floatval ($balance[$lowercase]['lock']);
                $account['total'] = $this->sum ($account['free'], $account['used']);
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetDepth (array_merge (array (
            'market' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($response['result']);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetTicker (array_merge (array (
            'market' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['result'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'id' => (string) $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['result'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'market' => $this->market_id ($symbol),
            'op' => $side,
            'amount' => $amount,
        );
        if ($type == 'market') {
            $order['order_type'] = 1;
            $order['price'] = $price;
        } else {
            $order['order_type'] = 0;
        }
        $response = $this->privatePostTrade (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['result']['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->secret, 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 200)
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

// -----------------------------------------------------------------------------

class nova extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'nova',
            'name' => 'Novaexchange',
            'countries' => 'TZ', // Tanzania
            'rateLimit' => 2000,
            'version' => 'v2',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg',
                'api' => 'https://novaexchange.com/remote',
                'www' => 'https://novaexchange.com',
                'doc' => 'https://novaexchange.com/remote/faq',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets/',
                        'markets/{basecurrency}/',
                        'market/info/{pair}/',
                        'market/orderhistory/{pair}/',
                        'market/openorders/{pair}/buy/',
                        'market/openorders/{pair}/sell/',
                        'market/openorders/{pair}/both/',
                        'market/openorders/{pair}/{ordertype}/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getbalances/',
                        'getbalance/{currency}/',
                        'getdeposits/',
                        'getwithdrawals/',
                        'getnewdepositaddress/{currency}/',
                        'getdepositaddress/{currency}/',
                        'myopenorders/',
                        'myopenorders_market/{pair}/',
                        'cancelorder/{orderid}/',
                        'withdraw/{currency}/',
                        'trade/{pair}/',
                        'tradehistory/',
                        'getdeposithistory/',
                        'getwithdrawalhistory/',
                        'walletstatus/',
                        'walletstatus/{currency}/',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $response = $this->publicGetMarkets ();
        $markets = $response['markets'];
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            if (!$market['disabled']) {
                $id = $market['marketname'];
                list ($quote, $base) = explode ('_', $id);
                $symbol = $base . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetMarketOpenordersPairBoth (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'buyorders', 'sellorders', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetMarketInfoPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $ticker = $response['markets'][0];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high24h']),
            'low' => floatval ($ticker['low24h']),
            'bid' => $this->safe_float ($ticker, 'bid'),
            'ask' => $this->safe_float ($ticker, 'ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => floatval ($ticker['change24h']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume24h']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['unix_t_datestamp'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => null,
            'order' => null,
            'type' => null,
            'side' => strtolower ($trade['tradetype']),
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketOrderhistoryPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['items'], $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetbalances ();
        $balances = $response['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $lockbox = floatval ($balance['amount_lockbox']);
            $trades = floatval ($balance['amount_trades']);
            $account = array (
                'free' => floatval ($balance['amount']),
                'used' => $this->sum ($lockbox, $trades),
                'total' => floatval ($balance['amount_total']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets ();
        $amount = (string) $amount;
        $price = (string) $price;
        $market = $this->market ($symbol);
        $order = array (
            'tradetype' => strtoupper ($side),
            'tradeamount' => $amount,
            'tradeprice' => $price,
            'tradebase' => 1,
            'pair' => $market['id'],
        );
        $response = $this->privatePostTradePair (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelorder (array_merge (array (
            'orderid' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/';
        if ($api == 'private')
            $url .= $api . '/';
        $url .= $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $url .= '?' . $this->urlencode (array ( 'nonce' => $nonce ));
            $signature = $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512', 'base64');
            $body = $this->urlencode (array_merge (array (
                'apikey' => $this->apiKey,
                'signature' => $signature,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] != 'success')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class okcoincny extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'okcoincny',
            'name' => 'OKCoin CNY',
            'countries' => 'CN',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
                'api' => array (
                    'web' => 'https://www.okcoin.cn',
                    'public' => 'https://www.okcoin.cn/pai',
                    'private' => 'https://www.okcoin.cn/api',
                ),
                'www' => 'https://www.okcoin.cn',
                'doc' => 'https://www.okcoin.cn/rest_getStarted.html',
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'BCH/CNY' => array ( 'id' => 'bcc_cny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class okcoinusd extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'okcoinusd',
            'name' => 'OKCoin USD',
            'countries' => array ( 'CN', 'US' ),
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api' => array (
                    'web' => 'https://www.okcoin.com',
                    'public' => 'https://www.okcoin.com/api',
                    'private' => 'https://www.okcoin.com/api',
                ),
                'www' => 'https://www.okcoin.com',
                'doc' => array (
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'LTC/USD' => array ( 'id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/USD' => array ( 'id' => 'eth_usd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/USD' => array ( 'id' => 'etc_usd', 'symbol' => 'ETC/USD', 'base' => 'ETC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class okex extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'okex',
            'name' => 'OKEX',
            'countries' => array ( 'CN', 'US' ),
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg',
                'api' => array (
                    'www' => 'https://www.okex.com',
                    'public' => 'https://www.okex.com/api',
                    'private' => 'https://www.okex.com/api',
                ),
                'www' => 'https://www.okex.com',
                'doc' => 'https://www.okex.com/rest_getStarted.html',
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'future', 'spot' => false, 'future' => true ),
                'LTC/USD' => array ( 'id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'type' => 'future', 'spot' => false, 'future' => true ),
                'LTC/BTC' => array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/BTC' => array ( 'id' => 'etc_btc', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'BCH/BTC' => array ( 'id' => 'bcc_btc', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class paymium extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'paymium',
            'name' => 'Paymium',
            'countries' => array ( 'FR', 'EU' ),
            'rateLimit' => 2000,
            'version' => 'v1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
                'api' => 'https://paymium.com/api',
                'www' => 'https://www.paymium.com',
                'doc' => array (
                    'https://github.com/Paymium/api-documentation',
                    'https://www.paymium.com/page/developers',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'countries',
                        'data/{id}/ticker',
                        'data/{id}/trades',
                        'data/{id}/depth',
                        'bitcoin_charts/{id}/trades',
                        'bitcoin_charts/{id}/depth',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'merchant/get_payment/{UUID}',
                        'user',
                        'user/addresses',
                        'user/addresses/{btc_address}',
                        'user/orders',
                        'user/orders/{UUID}',
                        'user/price_alerts',
                    ),
                    'post' => array (
                        'user/orders',
                        'user/addresses',
                        'user/payment_requests',
                        'user/price_alerts',
                        'merchant/create_payment',
                    ),
                    'delete' => array (
                        'user/orders/{UUID}/cancel',
                        'user/price_alerts/{id}',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/EUR' => array ( 'id' => 'eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->privateGetUser ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $balance = 'balance_' . $lowercase;
            $locked = 'locked_' . $lowercase;
            if (array_key_exists ($balance, $balances))
                $account['free'] = $balances[$balance];
            if (array_key_exists ($locked, $balances))
                $account['used'] = $balances[$locked];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetDataIdDepth (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $result = $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'price', 'amount');
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetDataIdTicker (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $ticker['at'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['price']),
            'change' => null,
            'percentage' => floatval ($ticker['variation']),
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['created_at_int']) * 1000;
        $volume = 'traded_' . strtolower ($market['base']);
        return array (
            'info' => $trade,
            'id' => $trade['uuid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade[$volume],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetDataIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'type' => $this->capitalize ($type) . 'Order',
            'currency' => $this->market_id ($market),
            'direction' => $side,
            'amount' => $amount,
        );
        if ($type == 'market')
            $order['price'] = $price;
        $response = $this->privatePostUserOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['uuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderNumber' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $body = $this->json ($params);
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $url . $body;
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Api-Signature' => $this->hmac ($this->encode ($auth), $this->secret),
                'Api-Nonce' => $nonce,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class poloniex extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'poloniex',
            'name' => 'Poloniex',
            'countries' => 'US',
            'rateLimit' => 1000, // up to 6 calls per second
            'hasCORS' => true,
            'hasFetchMyTrades' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchTickers' => true,
            'hasWithdraw' => true,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '5m' => 300,
                '15m' => 900,
                '30m' => 1800,
                '2h' => 7200,
                '4h' => 14400,
                '1d' => 86400,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api' => array (
                    'public' => 'https://poloniex.com/public',
                    'private' => 'https://poloniex.com/tradingApi',
                ),
                'www' => 'https://poloniex.com',
                'doc' => array (
                    'https://poloniex.com/support/api/',
                    'http://pastebin.com/dMX7mZE0',
                ),
                'fees' => 'https://poloniex.com/fees',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0015,
                    'taker' => 0.0025,
                ),
                'funding' => 0.0,
            ),
            'limits' => array (
                'amount' => array (
                    'min' => 0.00000001,
                    'max' => 1000000000,
                ),
                'price' => array (
                    'min' => 0.00000001,
                    'max' => 1000000000,
                ),
                'cost' => array (
                    'min' => 0.00000000,
                    'max' => 1000000000,
                )
            ),
            'precision' => array (
                'amount' => 8,
                'price' => 8,
            ),
        ), $options));
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $key = 'quote';
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision ($symbol, $amount * $rate));
        if ($side == 'sell') {
            $cost *= $price;
        } else {
            $key = 'base';
        }
        return array (
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => floatval ($this->fee_to_precision ($symbol, $cost)),
        );
    }

    public function common_currency_code ($currency) {
        if ($currency == 'BTM')
            return 'Bitmark';
        return $currency;
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '5m', $since = null, $limit = null) {
        return [
            $ohlcv['date'] * 1000,
            $ohlcv['open'],
            $ohlcv['high'],
            $ohlcv['low'],
            $ohlcv['close'],
            $ohlcv['volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '5m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        if (!$since)
            $since = 0;
        $request = array (
            'currencyPair' => $market['id'],
            'period' => $this->timeframes[$timeframe],
            'start' => intval ($since / 1000),
        );
        if ($limit)
            $request['end'] = $this->sum ($request['start'], $limit * $this->timeframes[$timeframe]);
        $response = $this->publicGetReturnChartData (array_merge ($request, $params));
        return $this->parse_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function fetch_markets () {
        $markets = $this->publicGetReturnTicker ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $market = $markets[$id];
            list ($quote, $base) = explode ('_', $id);
            $base = $this->common_currency_code ($base);
            $quote = $this->common_currency_code ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $this->limits['amount']['min'],
                'info' => $market,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostReturnCompleteBalances (array (
            'account' => 'all',
        ));
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $id = $currencies[$c];
            $balance = $balances[$id];
            $currency = $this->common_currency_code ($id);
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['onOrders']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetchFees ($params = array ()) {
        $this->load_markets ();
        $fees = $this->privatePostReturnFeeInfo ();
        return array (
            'info' => $fees,
            'maker' => floatval ($fees['makerFee']),
            'taker' => floatval ($fees['takerFee']),
            'withdraw' => 0.0,
        );
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetReturnOrderBook (array_merge (array (
            'currencyPair' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high24hr']),
            'low' => floatval ($ticker['low24hr']),
            'bid' => floatval ($ticker['highestBid']),
            'ask' => floatval ($ticker['lowestAsk']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => floatval ($ticker['percentChange']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['quoteVolume']),
            'quoteVolume' => floatval ($ticker['baseVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetReturnTicker ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetReturnTicker ($params);
        $ticker = $tickers[$market['id']];
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['date']);
        $symbol = null;
        if ((!$market) && (array_key_exists ('currencyPair', $trade)))
            $market = $this->markets_by_id[$trade['currencyPair']]['symbol'];
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'id' => $this->safe_string ($trade, 'tradeID'),
            'order' => $this->safe_string ($trade, 'orderNumber'),
            'type' => 'limit',
            'side' => $trade['type'],
            'price' => floatval ($trade['rate']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $trades = $this->publicGetReturnTradeHistory (array_merge (array (
            'currencyPair' => $market['id'],
            'end' => $this->seconds (), // last 50000 $trades by default
        ), $params));
        return $this->parse_trades ($trades, $market);
    }

    public function fetch_my_trades ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        if ($symbol)
            $market = $this->market ($symbol);
        $pair = $market ? $market['id'] : 'all';
        $request = array_merge (array (
            'currencyPair' => $pair,
            // 'start' => $this->seconds () - 86400, // last 24 hours by default
            // 'end' => $this->seconds (), // last 50000 $trades by default
        ), $params);
        $response = $this->privatePostReturnTradeHistory ($request);
        $result = array ();
        if ($market) {
            $result = $this->parse_trades ($response, $market);
        } else {
            if ($response) {
                $ids = array_keys ($response);
                for ($i = 0; $i < count ($ids); $i++) {
                    $id = $ids[$i];
                    $market = $this->markets_by_id[$id];
                    $symbol = $market['symbol'];
                    $trades = $this->parse_trades ($response[$id], $market);
                    for ($j = 0; $j < count ($trades); $j++) {
                        $result[] = $trades[$j];
                    }
                }
            }
        }
        return $result;
    }

    public function parse_order ($order, $market = null) {
        $timestamp = $this->safe_integer ($order, 'timestamp');
        if (!$timestamp)
            $timestamp = $this->parse8601 ($order['date']);
        $trades = null;
        if (array_key_exists ('resultingTrades', $order))
            $trades = $this->parse_trades ($order['resultingTrades'], $market);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $price = floatval ($order['price']);
        $cost = $this->safe_float ($order, 'total', 0.0);
        $remaining = $this->safe_float ($order, 'amount');
        $amount = $this->safe_float ($order, 'startingAmount', $remaining);
        $filled = $amount - $remaining;
        return array (
            'info' => $order,
            'id' => $order['orderNumber'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'trades' => $trades,
            'fee' => null,
        );
    }

    public function parseOpenOrders ($orders, $market, $result = []) {
        for ($i = 0; $i < count ($orders); $i++) {
            $order = $orders[$i];
            $extended = array_merge ($order, array (
                'status' => 'open',
                'type' => 'limit',
                'side' => $order['type'],
                'price' => $order['rate'],
            ));
            $result[] = $this->parse_order ($extended, $market);
        }
        return $result;
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $pair = $market ? $market['id'] : 'all';
        $response = $this->privatePostReturnOpenOrders (array_merge (array (
            'currencyPair' => $pair,
        )));
        $openOrders = array ();
        if ($market) {
            $openOrders = $this->parseOpenOrders ($response, $market, $openOrders);
        } else {
            $marketIds = array_keys ($response);
            for ($i = 0; $i < count ($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $orders = $response[$marketId];
                $market = $this->markets_by_id[$marketId];
                $openOrders = $this->parseOpenOrders ($orders, $market, $openOrders);
            }
        }
        for ($j = 0; $j < count ($openOrders); $j++) {
            $this->orders[$openOrders[$j]['id']] = $openOrders[$j];
        }
        $openOrdersIndexedById = $this->index_by ($openOrders, 'id');
        $cachedOrderIds = array_keys ($this->orders);
        $result = array ();
        for ($k = 0; $k < count ($cachedOrderIds); $k++) {
            $id = $cachedOrderIds[$k];
            if (array_key_exists ($id, $openOrdersIndexedById)) {
                $this->orders[$id] = array_merge ($this->orders[$id], $openOrdersIndexedById[$id]);
            } else {
                $order = $this->orders[$id];
                if ($order['status'] == 'open') {
                    $this->orders[$id] = array_merge ($order, array (
                        'status' => 'closed',
                        'cost' => $order['amount'] * $order['price'],
                        'filled' => $order['amount'],
                        'remaining' => 0.0,
                    ));
                }
            }
            $order = $this->orders[$id];
            if ($market) {
                if ($order['symbol'] == $symbol)
                    $result[] = $order;
            } else {
                $result[] = $order;
            }
        }
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['id'] == $id)
                return $orders[$i];
        }
        return null;
    }

    public function filterOrdersByStatus ($orders, $status) {
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == $status)
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        return $this->filterOrdersByStatus ($orders, 'open');
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $orders = $this->fetch_orders ($symbol, $params);
        return $this->filterOrdersByStatus ($orders, 'closed');
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets ();
        $method = 'privatePost' . $this->capitalize ($side);
        $market = $this->market ($symbol);
        $price = floatval ($price);
        $amount = floatval ($amount);
        $response = $this->$method (array_merge (array (
            'currencyPair' => $market['id'],
            'rate' => $this->price_to_precision ($symbol, $price),
            'amount' => $this->amount_to_precision ($symbol, $amount),
        ), $params));
        $timestamp = $this->milliseconds ();
        $order = $this->parse_order (array_merge (array (
            'timestamp' => $timestamp,
            'status' => 'open',
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
        ), $response), $market);
        $id = $order['id'];
        $this->orders[$id] = $order;
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function edit_order ($id, $symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $price = floatval ($price);
        $amount = floatval ($amount);
        $request = array (
            'orderNumber' => $id,
            'rate' => $this->price_to_precision ($symbol, $price),
            'amount' => $this->amount_to_precision ($symbol, $amount),
        );
        $response = $this->privatePostMoveOrder (array_merge ($request, $params));
        $result = null;
        if (array_key_exists ($id, $this->orders)) {
            $this->orders[$id] = array_merge ($this->orders[$id], array (
                'price' => $price,
                'amount' => $amount,
            ));
            $result = array_merge ($this->orders[$id], array ( 'info' => $response ));
        } else {
            $result = array (
                'info' => $response,
                'id' => $response['orderNumber'],
            );
        }
        return $result;
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $response = null;
        try {
            $response = $this->privatePostCancelOrder (array_merge (array (
                'orderNumber' => $id,
            ), $params));
            if (array_key_exists ($id, $this->orders))
                $this->orders[$id]['status'] = 'canceled';
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string ($this->last_json_response, 'error');
                if (mb_strpos ($message, 'Invalid order') !== false)
                    throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $response;
    }

    public function fetch_order_status ($id, $symbol = null) {
        $this->load_markets ();
        $orders = $this->fetch_open_orders ($symbol);
        $indexed = $this->index_by ($orders, 'id');
        return (array_key_exists ($id, $indexed)) ? 'open' : 'closed';
    }

    public function fetch_order_trades ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        $trades = $this->privatePostReturnOrderTrades (array_merge (array (
            'orderNumber' => $id,
        ), $params));
        return $this->parse_trades ($trades);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $result = $this->privatePostWithdraw (array_merge (array (
            'currency' => $currency,
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $result,
            'id' => $result['response'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $query = array_merge (array ( 'command' => $path ), $params);
        if ($api == 'public') {
            $url .= '?' . $this->urlencode ($query);
        } else {
            $query['nonce'] = $this->nonce ();
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response)) {
            $error = $this->id . ' ' . $this->json ($response);
            $failed = mb_strpos ($response['error'], 'Not enough') !== false;
            if ($failed)
                throw new InsufficientFunds ($error);
            throw new ExchangeError ($error);
        }
        return $response;
    }
}

// -----------------------------------------------------------------------------

class quadrigacx extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'quadrigacx',
            'name' => 'QuadrigaCX',
            'countries' => 'CA',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
                'api' => 'https://api.quadrigacx.com',
                'www' => 'https://www.quadrigacx.com',
                'doc' => 'https://www.quadrigacx.com/api_info',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'order_book',
                        'ticker',
                        'transactions',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance',
                        'bitcoin_deposit_address',
                        'bitcoin_withdrawal',
                        'buy',
                        'cancel_order',
                        'ether_deposit_address',
                        'ether_withdrawal',
                        'lookup_order',
                        'open_orders',
                        'sell',
                        'user_transactions',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/CAD' => array ( 'id' => 'btc_cad', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETH/CAD' => array ( 'id' => 'eth_cad', 'symbol' => 'ETH/CAD', 'base' => 'ETH', 'quote' => 'CAD' ),
            ),
        ), $options));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = array (
                'free' => floatval ($balances[$lowercase . '_available']),
                'used' => floatval ($balances[$lowercase . '_reserved']),
                'total' => floatval ($balances[$lowercase . '_balance']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderBook (array_merge (array (
            'book' => $this->market_id ($symbol),
        ), $params));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        return $this->parse_order_book ($orderbook, $timestamp);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTicker (array_merge (array (
            'book' => $this->market_id ($symbol),
        ), $params));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'book' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'amount' => $amount,
            'book' => $this->market_id ($symbol),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            $url .= '?' . $this->urlencode ($params);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = $this->nonce ();
            $request = implode ('', array ((string) $nonce, $this->uid, $this->apiKey));
            $signature = $this->hmac ($this->encode ($request), $this->encode ($this->secret));
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
            ), $params);
            $body = $this->json ($query);
            $headers = array (
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class qryptos extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'qryptos',
            'name' => 'QRYPTOS',
            'countries' => array ( 'CN', 'TW' ),
            'version' => '2',
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
                'api' => 'https://api.qryptos.com',
                'www' => 'https://www.qryptos.com',
                'doc' => 'https://developers.quoine.com',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'accounts/balance',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                    ),
                    'post' => array (
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ),
                    'put' => array (
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetProducts ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['id'];
            $base = $market['base_currency'];
            $quote = $market['quoted_currency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetAccountsBalance ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $total = floatval ($balance['balance']);
            $account = array (
                'free' => $total,
                'used' => 0.0,
                'total' => $total,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetProductsIdPriceLevels (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'buy_price_levels', 'sell_price_levels');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $last = null;
        if (array_key_exists ('last_traded_price', $ticker)) {
            if ($ticker['last_traded_price']) {
                $length = count ($ticker['last_traded_price']);
                if ($length > 0)
                    $last = floatval ($ticker['last_traded_price']);
            }
        }
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high_market_ask']),
            'low' => floatval ($ticker['low_market_bid']),
            'bid' => floatval ($ticker['market_bid']),
            'ask' => floatval ($ticker['market_ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_24h']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetProducts ($params);
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $base = $ticker['base_currency'];
            $quote = $ticker['quoted_currency'];
            $symbol = $base . '/' . $quote;
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetProductsId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['created_at'] * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['taker_side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['quantity']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetExecutions (array_merge (array (
            'product_id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['models'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'order_type' => $type,
            'product_id' => $this->market_id ($symbol),
            'side' => $side,
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrders (array_merge (array (
            'order' => $order,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePutOrdersIdCancel (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $headers = array (
            'X-Quoine-API-Version' => $this->version,
            'Content-Type' => 'application/json',
        );
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array (
                'path' => $url,
                'nonce' => $nonce,
                'token_id' => $this->apiKey,
                'iat' => (int) floor ($nonce / 1000), // issued at
            );
            if ($query)
                $body = $this->json ($query);
            $headers['X-Quoine-Auth'] = $this->jwt ($request, $this->secret);
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('message', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class quoine extends qryptos {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'quoine',
            'name' => 'QUOINE',
            'countries' => array ( 'JP', 'SG', 'VN' ),
            'version' => '2',
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
                'api' => 'https://api.quoine.com',
                'www' => 'https://www.quoine.com',
                'doc' => 'https://developers.quoine.com',
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class southxchange extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'southxchange',
            'name' => 'SouthXchange',
            'countries' => 'AR', // Argentina
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
                'api' => 'https://www.southxchange.com/api',
                'www' => 'https://www.southxchange.com',
                'doc' => 'https://www.southxchange.com/Home/Api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets',
                        'price/{symbol}',
                        'prices',
                        'book/{symbol}',
                        'trades/{symbol}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'cancelMarketOrders',
                        'cancelOrder',
                        'generatenewaddress',
                        'listOrders',
                        'listBalances',
                        'placeOrder',
                        'withdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $base = $market[0];
            $quote = $market[1];
            $symbol = $base . '/' . $quote;
            $id = $symbol;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privatePostListBalances ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['Currency'];
            $uppercase = strtoupper ($currency);
            $free = floatval ($balance['Available']);
            $used = floatval ($balance['Unconfirmed']);
            $total = $this->sum ($free, $used);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $total,
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook, null, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => $this->safe_float ($ticker, 'Bid'),
            'ask' => $this->safe_float ($ticker, 'Ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'Last'),
            'change' => $this->safe_float ($ticker, 'Variation24Hr'),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float ($ticker, 'Volume24Hr'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetPrices ($params);
        $tickers = $this->index_by ($response, 'Market');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetPriceSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['At'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => null,
            'order' => null,
            'type' => null,
            'side' => $trade['Type'],
            'price' => $trade['Price'],
            'amount' => $trade['Amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $order = array (
            'listingCurrency' => $market['base'],
            'referenceCurrency' => $market['quote'],
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limitPrice'] = $price;
        $response = $this->privatePostPlaceOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response,
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelOrder (array_merge (array (
            'orderCode' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency' => $currency,
            'address' => $address,
            'amount' => $amount,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'private') {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
            ), $query);
            $body = $this->json ($query);
            $headers = array (
                'Content-Type' => 'application/json',
                'Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        return $response;
    }
}

// -----------------------------------------------------------------------------

class surbitcoin extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'surbitcoin',
            'name' => 'SurBitcoin',
            'countries' => 'VE',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://surbitcoin.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class tidex extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'tidex',
            'name' => 'Tidex',
            'countries' => 'UK',
            'rateLimit' => 1000,
            'version' => '3',
            // 'hasCORS' => false,
            // 'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api' => array (
                    'public' => 'https://api.tidex.com/api',
                    'private' => 'https://api.tidex.com/tapi',
                ),
                'www' => 'https://tidex.com',
                'doc' => 'https://tidex.com/public-api',
                'fees' => 'https://tidex.com/pairs-spec'
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class therock extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'therock',
            'name' => 'TheRockTrading',
            'countries' => 'MT',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
                'api' => 'https://api.therocktrading.com',
                'www' => 'https://therocktrading.com',
                'doc' => array (
                    'https://api.therocktrading.com/doc/v1/index.html',
                    'https://api.therocktrading.com/doc/',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'funds/{id}/orderbook',
                        'funds/{id}/ticker',
                        'funds/{id}/trades',
                        'funds/tickers',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'balances',
                        'balances/{id}',
                        'discounts',
                        'discounts/{id}',
                        'funds',
                        'funds/{id}',
                        'funds/{id}/trades',
                        'funds/{fund_id}/orders',
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/position_balances',
                        'funds/{fund_id}/positions',
                        'funds/{fund_id}/positions/{id}',
                        'transactions',
                        'transactions/{id}',
                        'withdraw_limits/{id}',
                        'withdraw_limits',
                    ),
                    'post' => array (
                        'atms/withdraw',
                        'funds/{fund_id}/orders',
                    ),
                    'delete' => array (
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/orders/remove_all',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetFundsTickers ();
        $result = array ();
        for ($p = 0; $p < count ($markets['tickers']); $p++) {
            $market = $markets['tickers'][$p];
            $id = $market['fund_id'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalances ();
        $balances = $response['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $free = $balance['trading_balance'];
            $total = $balance['balance'];
            $used = $total - $free;
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $total,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetFundsIdOrderbook (array_merge (array (
            'id' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->parse8601 ($orderbook['date']);
        return $this->parse_order_book ($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['date']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => floatval ($ticker['close']),
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_traded']),
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetFundsTickers ($params);
        $tickers = $this->index_by ($response['tickers'], 'fund_id');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetFundsIdTicker (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker ($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        if (!$market)
            $market = $this->markets_by_id[$trade['fund_id']];
        $timestamp = $this->parse8601 ($trade['date']);
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetFundsIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades ($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $response = $this->privatePostFundsFundIdOrders (array_merge (array (
            'fund_id' => $this->market_id ($symbol),
            'side' => $side,
            'amount' => $amount,
            'price' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privateDeleteFundsFundIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'private') {
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $url;
            $headers = array (
                'X-TRT-KEY' => $this->apiKey,
                'X-TRT-NONCE' => $nonce,
                'X-TRT-SIGN' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512'),
            );
            if ($query) {
                $body = $this->json ($query);
                $headers['Content-Type'] = 'application/json';
            }
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class urdubit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'urdubit',
            'name' => 'UrduBit',
            'countries' => 'PK',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://urdubit.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class vaultoro extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'vaultoro',
            'name' => 'Vaultoro',
            'countries' => 'CH',
            'rateLimit' => 1000,
            'version' => '1',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
                'api' => 'https://api.vaultoro.com',
                'www' => 'https://www.vaultoro.com',
                'doc' => 'https://api.vaultoro.com',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'bidandask',
                        'buyorders',
                        'latest',
                        'latesttrades',
                        'markets',
                        'orderbook',
                        'sellorders',
                        'transactions/day',
                        'transactions/hour',
                        'transactions/month',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'balance',
                        'mytrades',
                        'orders',
                    ),
                    'post' => array (
                        'buy/{symbol}/{type}',
                        'cancel/{id}',
                        'sell/{symbol}/{type}',
                        'withdraw',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $result = array ();
        $markets = $this->publicGetMarkets ();
        $market = $markets['data'];
        $base = $market['BaseCurrency'];
        $quote = $market['MarketCurrency'];
        $symbol = $base . '/' . $quote;
        $baseId = $base;
        $quoteId = $quote;
        $id = $market['MarketName'];
        $result[] = array (
            'id' => $id,
            'symbol' => $symbol,
            'base' => $base,
            'quote' => $quote,
            'baseId' => $baseId,
            'quoteId' => $quoteId,
            'info' => $market,
        );
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privateGetBalance ();
        $balances = $response['data'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency_code'];
            $uppercase = strtoupper ($currency);
            $free = $balance['cash'];
            $used = $balance['reserved'];
            $total = $this->sum ($free, $used);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $total,
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicGetOrderbook ($params);
        $orderbook = array (
            'bids' => $response['data'][0]['b'],
            'asks' => $response['data'][1]['s'],
        );
        $result = $this->parse_order_book ($orderbook, null, 'bids', 'asks', 'Gold_Price', 'Gold_Amount');
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $quote = $this->publicGetBidandask ($params);
        $bidsLength = count ($quote['bids']);
        $bid = $quote['bids'][$bidsLength - 1];
        $ask = $quote['asks'][0];
        $response = $this->publicGetMarkets ($params);
        $ticker = $response['data'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['24hHigh']),
            'low' => floatval ($ticker['24hLow']),
            'bid' => $bid[0],
            'ask' => $ask[0],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['LastPrice']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['24hVolume']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['Time']);
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => $trade['Gold_Price'],
            'amount' => $trade['Gold_Amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactionsDay ($params);
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $method = 'privatePost' . $this->capitalize ($side) . 'SymbolType';
        $response = $this->$method (array_merge (array (
            'symbol' => strtolower ($market['quoteId']),
            'type' => $type,
            'gld' => $amount,
            'price' => $price || 1,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['data']['Order_ID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets ();
        return $this->privatePostCancelId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($api == 'public') {
            $url .= $path;
        } else {
            $nonce = $this->nonce ();
            $url .= $this->version . '/' . $this->implode_params ($path, $params);
            $query = array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), $this->omit ($params, $this->extract_params ($path)));
            $url .= '?' . $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/json',
                'X-Signature' => $this->hmac ($this->encode ($url), $this->encode ($this->secret))
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class vbtc extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'vbtc',
            'name' => 'VBTC',
            'countries' => 'VN',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://vbtc.exchange',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC' ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class virwox extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'virwox',
            'name' => 'VirWoX',
            'countries' => array ( 'AT', 'EU' ),
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg',
                'api' => array (
                    'public' => 'http://api.virwox.com/api/json.php',
                    'private' => 'https://www.virwox.com/api/trading.php',
                ),
                'www' => 'https://www.virwox.com',
                'doc' => 'https://www.virwox.com/developers.php',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ),
                    'post' => array (
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ),
                    'post' => array (
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetInstruments ();
        $keys = array_keys ($markets['result']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $market = $markets['result'][$keys[$p]];
            $id = $market['instrumentID'];
            $symbol = $market['symbol'];
            $base = $market['longCurrency'];
            $quote = $market['shortCurrency'];
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetBalances ();
        $balances = $response['result']['accountList'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $total = $balance['balance'];
            $account = array (
                'free' => $total,
                'used' => 0.0,
                'total' => $total,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetchMarketPrice ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicPostGetBestPrices (array_merge (array (
            'symbols' => array ($symbol),
        ), $params));
        $result = $response['result'];
        return array (
            'bid' => $this->safe_float ($result[0], 'bestBuyPrice'),
            'ask' => $this->safe_float ($result[0], 'bestSellPrice'),
        );
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $response = $this->publicPostGetMarketDepth (array_merge (array (
            'symbols' => array ($symbol),
            'buyDepth' => 100,
            'sellDepth' => 100,
        ), $params));
        $orderbook = $response['result'][0];
        return $this->parse_order_book ($orderbook, null, 'buy', 'sell', 'price', 'volume');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $end = $this->milliseconds ();
        $start = $end - 86400000;
        $response = $this->publicGetTradedPriceVolume (array_merge (array (
            'instrument' => $symbol,
            'endDate' => $this->YmdHMS ($end),
            'startDate' => $this->YmdHMS ($start),
            'HLOC' => 1,
        ), $params));
        $marketPrice = $this->fetchMarketPrice ($symbol, $params);
        $tickers = $response['result']['priceVolumeList'];
        $keys = array_keys ($tickers);
        $length = count ($keys);
        $lastKey = $keys[$length - 1];
        $ticker = $tickers[$lastKey];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => $marketPrice['bid'],
            'ask' => $marketPrice['ask'],
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => floatval ($ticker['close']),
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['longVolume']),
            'quoteVolume' => floatval ($ticker['shortVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($market, $params = array ()) {
        $this->load_markets ();
        return $this->publicGetRawTradeData(array_merge (array (
            'instrument' => $market,
            'timespan' => 3600,
        ), $params));
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        $order = array (
            'instrument' => $this->symbol ($market),
            'orderType' => strtoupper ($side),
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostPlaceOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['orderID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderID' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $auth = array ();
        if ($api == 'private') {
            $auth['key'] = $this->apiKey;
            $auth['user'] = $this->login;
            $auth['pass'] = $this->password;
        }
        $nonce = $this->nonce ();
        if ($method == 'GET') {
            $url .= '?' . $this->urlencode (array_merge (array (
                'method' => $path,
                'id' => $nonce,
            ), $auth, $params));
        } else {
            $headers = array ( 'Content-Type' => 'application/json' );
            $body = $this->json (array (
                'method' => $path,
                'params' => array_merge ($auth, $params),
                'id' => $nonce,
            ));
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            if ($response['error'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

// -----------------------------------------------------------------------------

class wex extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'wex',
            'name' => 'WEX',
            'countries' => 'NZ', // New Zealand
            'version' => '3',
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
                'api' => array (
                    'public' => 'https://wex.nz/api',
                    'private' => 'https://wex.nz/tapi',
                ),
                'www' => 'https://wex.nz',
                'doc' => array (
                    'https://wex.nz/api/3/docs',
                    'https://wex.nz/tapi/docs',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                )
            ),
        ), $options));
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float ($ticker, 'high'),
            'low' => $this->safe_float ($ticker, 'low'),
            'bid' => $this->safe_float ($ticker, 'sell'),
            'ask' => $this->safe_float ($ticker, 'buy'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float ($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float ($ticker, 'avg'),
            'baseVolume' => $this->safe_float ($ticker, 'vol_cur'),
            'quoteVolume' => $this->safe_float ($ticker, 'vol'),
            'info' => $ticker,
        );
    }
}

// -----------------------------------------------------------------------------

class xbtce extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'xbtce',
            'name' => 'xBTCe',
            'countries' => 'RU',
            'rateLimit' => 2000, // responses are cached every 2 seconds
            'version' => 'v1',
            'hasPublicAPI' => false,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg',
                'api' => 'https://cryptottlivewebapi.xbtce.net:8443/api',
                'www' => 'https://www.xbtce.com',
                'doc' => array (
                    'https://www.xbtce.com/tradeapi',
                    'https://support.xbtce.info/Knowledgebase/Article/View/52/25/xbtce-exchange-api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/ticks',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'ticker',
                        'ticker/{filter}',
                        'tradesession',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'tradeserverinfo',
                        'tradesession',
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'account',
                        'asset',
                        'asset/{id}',
                        'position',
                        'position/{id}',
                        'trade',
                        'trade/{id}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/ask/info',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/{periodicity}/bars/bid/info',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/level2/info',
                        'quotehistory/{symbol}/periodicities',
                        'quotehistory/{symbol}/ticks',
                        'quotehistory/{symbol}/ticks/info',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/cache/{symbol}/level2',
                        'quotehistory/cache/{symbol}/ticks',
                        'quotehistory/symbols',
                        'quotehistory/version',
                    ),
                    'post' => array (
                        'trade',
                        'tradehistory',
                    ),
                    'put' => array (
                        'trade',
                    ),
                    'delete' => array (
                        'trade',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->privateGetSymbol ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['Symbol'];
            $base = $market['MarginCurrency'];
            $quote = $market['ProfitCurrency'];
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $symbol = $market['IsTradeAllowed'] ? $symbol : $id;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $balances = $this->privateGetAsset ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['Currency'];
            $uppercase = strtoupper ($currency);
            // xbtce names DASH incorrectly as DSH
            if ($uppercase == 'DSH')
                $uppercase = 'DASH';
            $account = array (
                'free' => $balance['FreeAmount'],
                'used' => $balance['LockedAmount'],
                'total' => $balance['Amount'],
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $orderbook = $this->privateGetLevel2Filter (array_merge (array (
            'filter' => $market['id'],
        ), $params));
        $orderbook = $orderbook[0];
        $timestamp = $orderbook['Timestamp'];
        return $this->parse_order_book ($orderbook, $timestamp, 'Bids', 'Asks', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = 0;
        $last = null;
        if (array_key_exists ('LastBuyTimestamp', $ticker))
            if ($timestamp < $ticker['LastBuyTimestamp']) {
                $timestamp = $ticker['LastBuyTimestamp'];
                $last = $ticker['LastBuyPrice'];
            }
        if (array_key_exists ('LastSellTimestamp', $ticker))
            if ($timestamp < $ticker['LastSellTimestamp']) {
                $timestamp = $ticker['LastSellTimestamp'];
                $last = $ticker['LastSellPrice'];
            }
        if (!$timestamp)
            $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['DailyBestBuyPrice'],
            'low' => $ticker['DailyBestSellPrice'],
            'bid' => $ticker['BestBid'],
            'ask' => $ticker['BestAsk'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $ticker['DailyTradedTotalVolume'],
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets ();
        $tickers = $this->publicGetTicker ($params);
        $tickers = $this->index_by ($tickers, 'Symbol');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = null;
            $symbol = null;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                $base = mb_substr ($id, 0, 3);
                $quote = mb_substr ($id, 3, 6);
                if ($base == 'DSH')
                    $base = 'DASH';
                if ($quote == 'DSH')
                    $quote = 'DASH';
                $symbol = $base . '/' . $quote;
            }
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker ($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetTickerFilter (array_merge (array (
            'filter' => $market['id'],
        ), $params));
        $length = count ($tickers);
        if ($length < 1)
            throw new ExchangeError ($this->id . ' fetchTicker returned empty response, xBTCe public API error');
        $tickers = $this->index_by ($tickers, 'Symbol');
        $ticker = $tickers[$market['id']];
        return $this->parse_ticker ($ticker, $market);
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        // no method for trades?
        return $this->privateGetTrade ($params);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv['Timestamp'],
            $ohlcv['Open'],
            $ohlcv['High'],
            $ohlcv['Low'],
            $ohlcv['Close'],
            $ohlcv['Volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetchOHLCV is disabled by the exchange');
        $minutes = intval ($timeframe / 60); // 1 minute by default
        $periodicity = (string) $minutes;
        $this->load_markets ();
        $market = $this->market ($symbol);
        if (!$since)
            $since = $this->seconds () - 86400 * 7; // last day by defulat
        if (!$limit)
            $limit = 1000; // default
        $response = $this->privateGetQuotehistorySymbolPeriodicityBarsBid (array_merge (array (
            'symbol' => $market['id'],
            'periodicity' => $periodicity,
            'timestamp' => $since,
            'count' => $limit,
        ), $params));
        return $this->parse_ohlcvs ($response['Bars'], $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $response = $this->tapiPostTrade (array_merge (array (
            'pair' => $this->market_id ($symbol),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['Id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privateDeleteTrade (array_merge (array (
            'Type' => 'Cancel',
            'Id' => $id,
        ), $params));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests, their public API is always busy');
        if (!$this->uid)
            throw new AuthenticationError ($this->id . ' requires uid property for authentication and trading');
        $url = $this->urls['api'] . '/' . $this->version;
        if ($api == 'public')
            $url .= '/' . $api;
        $url .= '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $headers = array ( 'Accept-Encoding' => 'gzip, deflate' );
            $nonce = (string) $this->nonce ();
            if ($method == 'POST') {
                if ($query) {
                    $headers['Content-Type'] = 'application/json';
                    $body = $this->json ($query);
                }
                else
                    $url .= '?' . $this->urlencode ($query);
            }
            $auth = $nonce . $this->uid . $this->apiKey . $method . $url;
            if ($body)
                $auth .= $body;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha256', 'base64');
            $credentials = $this->uid . ':' . $this->apiKey . ':' . $nonce . ':' . $this->binary_to_string ($signature);
            $headers['Authorization'] = 'HMAC ' . $credentials;
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

// -----------------------------------------------------------------------------

class yobit extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'yobit',
            'name' => 'YoBit',
            'countries' => 'RU',
            'rateLimit' => 3000, // responses are cached every 2 seconds
            'version' => '3',
            'hasCORS' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api' => array (
                    'public' => 'https://yobit.net/api',
                    'private' => 'https://yobit.net/tapi',
                ),
                'www' => 'https://www.yobit.net',
                'doc' => 'https://www.yobit.net/en/api/',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth/{pair}',
                        'info',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'ActiveOrders',
                        'CancelOrder',
                        'GetDepositAddress',
                        'getInfo',
                        'OrderInfo',
                        'Trade',
                        'TradeHistory',
                        'WithdrawCoinsToAddress',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.002,
                    'taker' => 0.002,
                ),
                'funding' => 0.0,
            ),
        ), $options));
    }

    public function common_currency_code ($currency) {
        $substitutions = array (
            'AIR' => 'AirCoin',
            'ANI' => 'ANICoin',
            'ANT' => 'AntsCoin',
            'ATM' => 'Autumncoin',
            'BCC' => 'BCH',
            'BTS' => 'Bitshares2',
            'DCT' => 'Discount',
            'DGD' => 'DarkGoldCoin',
            'ICN' => 'iCoin',
            'LIZI' => 'LiZi',
            'LUN' => 'LunarCoin',
            'NAV' => 'NavajoCoin',
            'OMG' => 'OMGame',
            'PAY' => 'EPAY',
            'REP' => 'Republicoin',
        );
        if (array_key_exists ($currency, $substitutions))
            return $substitutions[$currency];
        return $currency;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $sides = array ( 'free' => 'funds', 'total' => 'funds_incl_orders' );
        $keys = array_keys ($sides);
        for ($i = 0; $i < count ($keys); $i++) {
            $key = $keys[$i];
            $side = $sides[$key];
            if (array_key_exists ($side, $balances)) {
                $currencies = array_keys ($balances[$side]);
                for ($j = 0; $j < count ($currencies); $j++) {
                    $lowercase = $currencies[$j];
                    $uppercase = strtoupper ($lowercase);
                    $currency = $this->common_currency_code ($uppercase);
                    $account = null;
                    if (array_key_exists ($currency, $result)) {
                        $account = $result[$currency];
                    } else {
                        $account = $this->account ();
                    }
                    $account[$key] = $balances[$side][$lowercase];
                    if ($account['total'] && $account['free'])
                        $account['used'] = $account['total'] - $account['free'];
                    $result[$currency] = $account;
                }
            }
        }
        return $this->parse_balance ($result);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostWithdrawCoinsToAddress (array_merge (array (
            'coinName' => $currency,
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }
}

// -----------------------------------------------------------------------------

class yunbi extends acx {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'yunbi',
            'name' => 'YUNBI',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '2h' => '120',
                '4h' => '240',
                '12h' => '720',
                '1d' => '1440',
                '3d' => '4320',
                '1w' => '10080',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg',
                'extension' => '.json', // default extension appended to endpoint URLs
                'api' => 'https://yunbi.com',
                'www' => 'https://yunbi.com',
                'doc' => array (
                    'https://yunbi.com/documents/api/guide',
                    'https://yunbi.com/swagger/',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'tickers',
                        'tickers/{market}',
                        'markets',
                        'order_book',
                        'k',
                        'depth',
                        'trades',
                        'k_with_pending_trades',
                        'timestamp',
                        'addresses/{address}',
                        'partners/orders/{id}/trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'deposits',
                        'members/me',
                        'deposit',
                        'deposit_address',
                        'order',
                        'orders',
                        'trades/my',
                    ),
                    'post' => array (
                        'order/delete',
                        'orders',
                        'orders/multi',
                        'orders/clear',
                    ),
                ),
            ),
        ), $options));
    }
}

// -----------------------------------------------------------------------------

class zaif extends Exchange {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge(array (
            'id' => 'zaif',
            'name' => 'Zaif',
            'countries' => 'JP',
            'rateLimit' => 2000,
            'version' => '1',
            'hasCORS' => false,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
                'api' => 'https://api.zaif.jp',
                'www' => 'https://zaif.jp',
                'doc' => array (
                    'http://techbureau-api-document.readthedocs.io/ja/latest/index.html',
                    'https://corp.zaif.jp/api-docs',
                    'https://corp.zaif.jp/api-docs/api_links',
                    'https://www.npmjs.com/package/zaif.jp',
                    'https://github.com/you21979/node-zaif',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth/{pair}',
                        'currencies/{pair}',
                        'currencies/all',
                        'currency_pairs/{pair}',
                        'currency_pairs/all',
                        'last_price/{pair}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'active_orders',
                        'cancel_order',
                        'deposit_history',
                        'get_id_info',
                        'get_info',
                        'get_info2',
                        'get_personal_info',
                        'trade',
                        'trade_history',
                        'withdraw',
                        'withdraw_history',
                    ),
                ),
                'ecapi' => array (
                    'post' => array (
                        'createInvoice',
                        'getInvoice',
                        'getInvoiceIdsByOrderNumber',
                        'cancelInvoice',
                    ),
                ),
            ),
        ), $options));
    }

    public function fetch_markets () {
        $markets = $this->publicGetCurrencyPairsAll ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['currency_pair'];
            $symbol = $market['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets ();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances['funds']);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $balance = $balances['funds'][$currency];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => $balance,
                'used' => 0.0,
                'total' => $balance,
            );
            if (array_key_exists ('deposit', $balances)) {
                if (array_key_exists ($currency, $balances['deposit'])) {
                    $account['total'] = $balances['deposit'][$currency];
                    $account['used'] = $account['total'] - $account['free'];
                }
            }
            $result[$uppercase] = $account;
        }
        return $this->parse_balance ($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets ();
        $orderbook = $this->publicGetDepthPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        return $this->parse_order_book ($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets ();
        $ticker = $this->publicGetTickerPair (array_merge (array (
            'pair' => $this->market_id ($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => $ticker['bid'],
            'ask' => $ticker['ask'],
            'vwap' => $ticker['vwap'],
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $ticker['last'],
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $ticker['volume'],
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $side = ($trade['trade_type'] == 'bid') ? 'buy' : 'sell';
        $timestamp = $trade['date'] * 1000;
        $id = $this->safe_string ($trade, 'id');
        $id = $this->safe_string ($trade, 'tid', $id);
        if (!$market)
            $market = $this->markets_by_id[$trade['currency_pair']];
        return array (
            'id' => (string) $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets ();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades ($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets ();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $response = $this->privatePostTrade (array_merge (array (
            'currency_pair' => $this->market_id ($symbol),
            'action' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
            'price' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['return']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function parse_order ($order, $market = null) {
        $side = ($order['action'] == 'bid') ? 'buy' : 'sell';
        $timestamp = intval ($order['timestamp']) * 1000;
        if (!$market)
            $market = $this->markets_by_id[$order['currency_pair']];
        $price = $order['price'];
        $amount = $order['amount'];
        return array (
            'id' => (string) $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $market['symbol'],
            'type' => 'limit',
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'filled' => null,
            'remaining' => null,
            'trades' => null,
            'fee' => null,
        );
    }

    public function parse_orders ($orders, $market = null) {
        $ids = array_keys ($orders);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $order = $orders[$id];
            $extended = array_merge ($order, array ( 'id' => $id ));
            $result[] = $this->parse_order ($extended, $market);
        }
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        $request = array (
            // 'is_token' => false,
            // 'is_token_both' => false,
        );
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['currency_pair'] = $market['id'];
        }
        $response = $this->privatePostActiveOrders (array_merge ($request, $params));
        return $this->parse_orders ($response['return'], $market);
    }

    public function fetchClosedOrders ($symbol = null, $params = array ()) {
        $this->load_markets ();
        $market = null;
        $request = array (
            // 'from' => 0,
            // 'count' => 1000,
            // 'from_id' => 0,
            // 'end_id' => 1000,
            // 'order' => 'DESC',
            // 'since' => 1503821051,
            // 'end' => 1503821051,
            // 'is_token' => false,
        );
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['currency_pair'] = $market['id'];
        }
        $response = $this->privatePostTradeHistory (array_merge ($request, $params));
        return $this->parse_orders ($response['return'], $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets ();
        if ($currency == 'JPY')
            throw new ExchangeError ($this->id . ' does not allow ' . $currency . ' withdrawals');
        $result = $this->privatePostWithdraw (array_merge (array (
            'currency' => $currency,
            'amount' => $amount,
            'address' => $address,
            // 'message' => 'Hi!', // XEM only
            // 'opt_fee' => 0.003, // BTC and MONA only
        ), $params));
        return array (
            'info' => $result,
            'id' => $result['return']['txid'],
            'fee' => $result['return']['fee'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($api == 'public') {
            $url .= 'api/' . $this->version . '/' . $this->implode_params ($path, $params);
        } else {
            $url .= ($api == 'ecapi') ? 'ecapi' : 'tapi';
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'api', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $response['error']);
        if (array_key_exists ('success', $response))
            if (!$response['success'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}
