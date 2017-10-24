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

$version = '1.9.246';

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
        return $this->parse_ohlcvs ($ohlcv, $market, $timeframe, $since, $limit);
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

// ============================================================================

// This comment is a placeholder for transpiled derived exchange implementations
// See https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md for details

?>
