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

use kornrunner\Eth;
use kornrunner\Secp256k1;
use kornrunner\Solidity;

$version = '1.18.120';

// rounding mode
const TRUNCATE = 0;
const ROUND = 1;

// digits counting mode
const DECIMAL_PLACES = 0;
const SIGNIFICANT_DIGITS = 1;

// padding mode
const NO_PADDING = 0;
const PAD_WITH_ZERO = 1;

class Exchange {

    const VERSION = '1.18.120';

    public static $eth_units = array (
        'wei'        => '1',
        'kwei'       => '1000',
        'babbage'    => '1000',
        'femtoether' => '1000',
        'mwei'       => '1000000',
        'lovelace'   => '1000000',
        'picoether'  => '1000000',
        'gwei'       => '1000000000',
        'nano'       => '1000000000',
        'shannon'    => '1000000000',
        'nanoether'  => '1000000000',
        'szabo'      => '1000000000000',
        'micro'      => '1000000000000',
        'microether' => '1000000000000',
        'finney'     => '1000000000000000',
        'milli'      => '1000000000000000',
        'milliether' => '1000000000000000',
        'ether'      => '1000000000000000000',
        'kether'     => '1000000000000000000000',
        'einstein'   => '1000000000000000000000',
        'grand'      => '1000000000000000000000',
        'mether'     => '1000000000000000000000000',
        'gether'     => '1000000000000000000000000000',
        'tether'     => '1000000000000000000000000000000',
    );

    public static $exchanges = array (
        '_1btcxe',
        'acx',
        'allcoin',
        'anxpro',
        'anybits',
        'bcex',
        'bibox',
        'bigone',
        'binance',
        'bit2c',
        'bitbank',
        'bitbay',
        'bitfinex',
        'bitfinex2',
        'bitflyer',
        'bitforex',
        'bithumb',
        'bitibu',
        'bitkk',
        'bitlish',
        'bitmarket',
        'bitmex',
        'bitsane',
        'bitso',
        'bitstamp',
        'bitstamp1',
        'bittrex',
        'bitz',
        'bl3p',
        'bleutrade',
        'braziliex',
        'btcalpha',
        'btcbox',
        'btcchina',
        'btcexchange',
        'btcmarkets',
        'btctradeim',
        'btctradeua',
        'btcturk',
        'buda',
        'bxinth',
        'ccex',
        'cex',
        'chbtc',
        'chilebit',
        'cobinhood',
        'coinbase',
        'coinbaseprime',
        'coinbasepro',
        'coincheck',
        'coinegg',
        'coinex',
        'coinexchange',
        'coinfalcon',
        'coinfloor',
        'coingi',
        'coinmarketcap',
        'coinmate',
        'coinnest',
        'coinone',
        'coinspot',
        'cointiger',
        'coolcoin',
        'coss',
        'crex24',
        'crypton',
        'cryptopia',
        'deribit',
        'dsx',
        'ethfinex',
        'exmo',
        'exx',
        'fcoin',
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
        'huobipro',
        'ice3x',
        'independentreserve',
        'indodax',
        'itbit',
        'jubi',
        'kkex',
        'kraken',
        'kucoin',
        'kuna',
        'lakebtc',
        'lbank',
        'liqui',
        'liquid',
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
        'rightbtc',
        'southxchange',
        'surbitcoin',
        'theocean',
        'therock',
        'tidebit',
        'tidex',
        'uex',
        'upbit',
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

    // we're not using safe_floats with a list argument as we're trying to save some cycles here
    // we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    public static function safe_float_2 ($object, $key1, $key2, $default_value = null) {
        $value = static::safe_float ($object, $key1);
        return isset ($value) ? $value : static::safe_float ($object, $key2, $default_value);
    }

    public static function safe_string_2 ($object, $key1, $key2, $default_value = null) {
        $value = static::safe_string ($object, $key1);
        return isset ($value) ? $value : static::safe_string ($object, $key2, $default_value);
    }

    public static function safe_integer_2 ($object, $key1, $key2, $default_value = null) {
        $value = static::safe_integer ($object, $key1);
        return isset ($value) ? $value : static::safe_integer ($object, $key2, $default_value);
    }

    public static function safe_value_2 ($object, $key1, $key2, $default_value = null) {
        $value = static::safe_value ($object, $key1);
        return isset ($value) ? $value : static::safe_value ($object, $key2, $default_value);
    }

    public static function truncate ($number, $precision = 0) {
        $decimal_precision = pow (10, $precision);
        return floor(floatval ($number * $decimal_precision)) / $decimal_precision;
    }

    public static function truncate_to_string ($number, $precision = 0) {
        if ($precision > 0) {
            $string = sprintf ('%.' . ($precision + 1) . 'F', floatval ($number));
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
            return array ();
        }
        if (!is_numeric ($since)) {
            $since = PHP_INT_MIN;
        }
        if (!is_numeric ($limits)) {
            $limits = PHP_INT_MAX;
        }
        $ms = static::parse_timeframe ($timeframe) * 1000;
        $ohlcvs = array ();
        list(/* $timestamp */, /* $open */, $high, $low, $close, $volume) = array (0, 1, 2, 3, 4, 5);
        for ($i = 0; $i < min (count($trades), $limits); $i++) {
            $trade = $trades[$i];
            if ($trade['timestamp'] < $since)
                continue;
            $openingTime = floor ($trade['timestamp'] / $ms) * $ms; // shift to the edge of m/h/d (but not M)
            $j = count($ohlcvs);

            if ($j == 0 || $openingTime >= $ohlcvs[$j-1][0] + $ms) {
                // moved to a new timeframe -> create a new candle from opening trade
                $ohlcvs[] = array (
                    $openingTime,
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['price'],
                    $trade['amount']
                );
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
        $result = array ();
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
            return array_merge ($acc, is_array ($item) ? static::flatten ($item) : array ($item));
        }, array ());
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

    public static function is_empty ($object) {
        return empty ($object);
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
        foreach ($params as $key => $value) {
            if (gettype ($value) !== 'array') {
                $string = implode ($value, mb_split ('{' . $key . '}', $string));
            }

        }
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

    public function urlencode ($string) {
        return http_build_query ($string, "", $this->urlencode_glue);
    }

    public function rawencode ($string) {
        return urldecode (http_build_query ($string, "", $this->urlencode_glue));
    }

    public function encode_uri_component ($string) {
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

    public static function iso8601 ($timestamp = null) {
        if (!isset ($timestamp))
            return null;
        if (!is_numeric ($timestamp) || intval ($timestamp) != $timestamp)
            return null;
        $timestamp = (int) $timestamp;
        if ($timestamp < 0)
            return null;
        $result = date ('c', (int) floor ($timestamp / 1000));
        $msec = (int) $timestamp % 1000;
        $result = str_replace ('+00:00', sprintf (".%03dZ", $msec), $result);
        return $result;
    }

    public static function parse_date ($timestamp) {
        return static::parse8601 ($timestamp);
    }

    public static function parse8601 ($timestamp = null) {
        if (!isset ($timestamp))
            return null;
        if (!$timestamp || !is_string ($timestamp))
            return null;
        $timedata = date_parse ($timestamp);
        if (!$timedata || $timedata['error_count'] > 0 || $timedata['warning_count'] > 0 || (isset ($timedata['relative']) && count ($timedata['relative']) > 0))
            return null;
        if ($timedata['hour'] === false ||  $timedata['minute'] === false || $timedata['second'] === false || $timedata['year'] === false || $timedata['month'] === false || $timedata['day'] === false)
            return null;
        $time = strtotime($timestamp);
        if ($time === false)
            return null;
        $time *= 1000;
        if (preg_match ('/\.(?<milliseconds>[0-9]{1,3})/', $timestamp, $match)) {
            $time += (int) str_pad($match['milliseconds'], 3, '0', STR_PAD_RIGHT);
        }
        return $time;
    }

    public static function dmy ($timestamp, $infix = '-') {
        return gmdate ('m' . $infix . 'd' . $infix . 'Y', (int) round ($timestamp / 1000));
    }

    public static function ymd ($timestamp, $infix = '-') {
        return gmdate ('Y' . $infix . 'm' . $infix . 'd', (int) round ($timestamp / 1000));
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

    public static function is_json_encoded_object ($input) {
        return (gettype ($input) === 'string') &&
                (strlen ($input) >= 2) &&
                (($input[0] === '{') || ($input[0] === '['));
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

    public function check_required_credentials ($error = true) {
        $keys = array_keys ($this->requiredCredentials);
        foreach ($this->requiredCredentials as $key => $value) {
            if ($value && (!$this->$key)) {
                if ($error) {
                    throw new AuthenticationError ($this->id . ' requires `' . $key . '`');
                } else {
                    return $error;
                }
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

        $this->curlopt_interface = null;
        $this->timeout   = 10000; // in milliseconds
        $this->proxy     = '';
        $this->origin    = '*'; // CORS origin
        $this->headers   = array ();
        $this->hostname  = null; // in case of inaccessibility of the "main" domain

        $this->options   = array (); // exchange-specific options if any

        $this->skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway

        $this->name      = null;
        $this->countries = null;
        $this->version   = null;
        $this->certified = false;
        $this->urls      = array ();
        $this->api       = array ();
        $this->comment   = null;

        $this->markets       = null;
        $this->symbols       = null;
        $this->ids           = null;
        $this->currencies    = array ();
        $this->balance       = array ();
        $this->orderbooks    = array ();
        $this->fees          = array ('trading' => array (), 'funding' => array ());
        $this->precision     = array ();
        $this->limits        = array ();
        $this->orders        = array ();
        $this->trades        = array ();
        $this->transactions  = array ();
        $this->exceptions    = array ();
        $this->httpExceptions = array (
            '422' => 'ExchangeError',
            '418' => 'DDoSProtection',
            '429' => 'DDoSProtection',
            '404' => 'ExchangeNotAvailable',
            '409' => 'ExchangeNotAvailable',
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
        $this->verbose       = false;
        $this->apiKey        = '';
        $this->secret        = '';
        $this->password      = '';
        $this->uid           = '';
        $this->privateKey    = '';
        $this->walletAddress = '';

        $this->twofa         = null;
        $this->marketsById   = null;
        $this->markets_by_id = null;
        $this->currencies_by_id = null;
        $this->userAgent   = null; // 'ccxt/' . $this::VERSION . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
        $this->userAgents = array (
            'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        );
        $this->minFundingAddressLength = 1; // used in check_address
        $this->substituteCommonCurrencyCodes = true;
        $this->timeframes = null;

        $this->requiredCredentials = array (
            'apiKey' => true,
            'secret' => true,
            'uid' => false,
            'login' => false,
            'password' => false,
            'twofa' => false, // 2-factor authentication (one-time password key)
            'privateKey' => false,
            'walletAddress' => false,
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
            'fetchDeposits' => false,
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
            'fetchTradingLimits' => false,
            'fetchTransactions' => false,
            'fetchWithdrawals' => false,
            'withdraw' => false,
        );

        $this->precisionMode = DECIMAL_PLACES;

        $this->lastRestRequestTimestamp = 0;
        $this->lastRestPollTimestamp    = 0;
        $this->restRequestQueue         = null;
        $this->restPollerLoopIsRunning  = false;
        $this->enableRateLimit          = false;
        $this->enableLastJsonResponse = true;
        $this->enableLastHttpResponse = true;
        $this->enableLastResponseHeaders = true;
        $this->last_http_response = null;
        $this->last_json_response = null;
        $this->last_response_headers = null;

        $this->requiresWeb3 = false;

        $this->commonCurrencies = array (
            'XBT' => 'BTC',
            'BCC' => 'BCH',
            'DRK' => 'DASH',
            'BCHABC' => 'BCH',
            'BCHSV' => 'BSV',
        );

        $this->urlencode_glue = ini_get ('arg_separator.output'); // can be overrided by exchange constructor params
        $this->urlencode_glue_warning = true;

        $options = array_replace_recursive ($this->describe(), $options);

        if ($options)
            foreach ($options as $key => $value)
                $this->{$key} =
                    (property_exists ($this, $key) && is_array ($this->{$key}) && is_array ($value)) ?
                        array_replace_recursive ($this->{$key}, $value) :
                        $value;

        if ($this->urlencode_glue !== '&') {
            if ($this->urlencode_glue_warning) {
                throw new ExchangeError (this.id . " warning! The glue symbol for HTTP queries " .
                    " is changed from its default value & to " .  $this->urlencode_glue . " in php.ini" .
                    " (arg_separator.output) or with a call to ini_set prior to this message. If that" .
                    " was the intent, you can acknowledge this warning and silence it by setting" .
                    " 'urlencode_glue_warning' => false or 'urlencode_glue' => '&' with exchange constructor params");
            }
        }

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

    public function underscore ($camelcase) {
        // todo: write conversion fooBar10OHLCV2Candles → foo_bar10_ohlcv2_candles
        throw new NotSupported ($this->id . ' underscore() not implemented yet');
    }

    public function camelcase ($underscore) {
        // todo: write conversion foo_bar10_ohlcv2_candles → fooBar10OHLCV2Candles
        throw new NotSupported ($this->id . ' camelcase() not implemented yet');
    }

    public static function hash ($request, $type = 'md5', $digest = 'hex') {
        $base64 = ($digest === 'base64');
        $binary = ($digest === 'binary');
        $hash = hash ($type, $request, ($binary || $base64) ? true : false);
        if ($base64)
            $hash = base64_encode ($hash);
        return $hash;
    }

    public static function hmac ($request, $secret, $type = 'sha256', $digest = 'hex') {
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

    public function findBroadlyMatchedKey ($broad, $string) {
        return $this->find_broadly_matched_key ($broad, $string);
    }

    public function find_broadly_matched_key ($broad, $string) {
        $keys = is_array ($broad) ? array_keys ($broad) : array ();
        for ($i = 0; $i < count ($keys); $i++) {
            $key = $keys[$i];
            if (mb_strpos ($string, $key) !== false)
                return $key;
        }
        return null;
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body, $response) {
        // it's a stub function, does nothing in base code
    }

    public function parse_json ($json_string) {
        return json_decode ($json_string, $as_associative_array = true);
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
            curl_setopt ($this->curl, CURLOPT_POSTFIELDS, $body);

            $headers[] = 'X-HTTP-Method-Override: PUT';

        } else if ($method == 'PATCH') {

            curl_setopt ($this->curl, CURLOPT_CUSTOMREQUEST, "PATCH");
            curl_setopt ($this->curl, CURLOPT_POSTFIELDS, $body);

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
                    $response_headers[$name] = array (trim ($header[1]));
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

        if ($this->enableLastHttpResponse) {
            $this->last_http_response = $result;
        }

        if ($this->enableLastResponseHeaders) {
            $this->last_response_headers = $response_headers;
        }

        $json_response = null;

        if ($this->is_json_encoded_object ($result)) {
         
            $json_response = $this->parse_json ($result, $as_associative_array = true);

            if ($this->enableLastJsonResponse) {
                $this->last_json_response = $json_response;
            }
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

        $this->handle_errors ($http_status_code, $curl_error, $url, $method, $response_headers, $result ? $result : null, $json_response);

        if ($result === false) {

            if ($curl_errno == 28) // CURLE_OPERATION_TIMEDOUT
                $this->raise_error ('RequestTimeout', $url, $method, $curl_errno, $curl_error);

            // var_dump ($result);

            // all sorts of SSL problems, accessibility
            $this->raise_error ('ExchangeNotAvailable', $url, $method, $curl_errno, $curl_error);
        }

        $string_code = (string) $http_status_code;

        if (array_key_exists ($string_code, $this->httpExceptions)) {
            $error_class = $this->httpExceptions[$string_code];
            if ($error_class === 'ExchangeNotAvailable') {
                if (preg_match ('#cloudflare|incapsula|overload|ddos#i', $result)) {
                    $error_class = 'DDoSProtection';
                } else {
                    $details = '(possible reasons: ' . implode (', ', array (
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline',
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting in effect',
                    )) . ')';
                }
                $this->raise_error ($error_class, $url, $method, $http_status_code, $result, $details);
            } else {
                $this->raise_error ($error_class, $url, $method, $http_status_code, $result);
            }
        }

        if (!$json_response) {

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

        return $json_response ? $json_response : $result;
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

    public function loadMarkets ($reload = false, $params = array()) {
        return $this->load_markets ($reload, $params);
    }

    public function load_markets ($reload = false, $params = array()) {
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets ($this->markets);
            }
            return $this->markets;
        }
        $markets = $this->fetch_markets ($params);
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
        return $this->sort_by ($result, 0);
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
            'bids' => $this->sort_by (
                is_array ($orderbook) && array_key_exists ($bids_key, $orderbook) ?
                    $this->parse_bids_asks ($orderbook[$bids_key], $price_key, $amount_key) : array (),
                0, true),
            'asks' => $this->sort_by (
                is_array ($orderbook) && array_key_exists ($asks_key, $orderbook) ?
                    $this->parse_bids_asks ($orderbook[$asks_key], $price_key, $amount_key) : array (),
                0),
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

    public function load_trading_limits ($symbols = null, $reload = false, $params = array ()) {
        if ($this->has['fetchTradingLimits']) {
            if ($reload || !(is_array ($this->options) && array_key_exists ('limitsLoaded', $this->options))) {
                $response = $this->fetch_trading_limits ($symbols);
                // $limits = $response['limits'];
                // $keys = is_array ($limits) ? array_keys ($limits) : array ();
                for ($i = 0; $i < count ($symbols); $i++) {
                    $symbol = $symbols[$i];
                    $this->markets[$symbol] = array_replace_recursive ($this->markets[$symbol], $response[$symbol]);
                }
                $this->options['limitsLoaded'] = $this->milliseconds ();
            }
        }
        return $this->markets;
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

    public function parse_transactions ($transactions, $currency = null, $since = null, $limit = null) {
        $array = is_array ($transactions) ? array_values ($transactions) : array ();
        $result = array ();
        foreach ($array as $transaction)
            $result[] = $this->parse_transaction ($transaction, $currency);
        $result = $this->sort_by ($result, 'timestamp');
        $code = isset ($currency) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit ($result, $code, $since, $limit);
    }

    public function parseTransactions ($transactions, $side, $market = null, $since = null, $limit = null) {
        return $this->parse_transactions ($transactions, $side, $market, $since, $limit);
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

    public function filter_by_value_since_limit ($array, $field, $value = null, $since = null, $limit = null) {
        $array = array_values ($array);
        $valueIsSet = isset ($value);
        $sinceIsSet = isset ($since);
        $array = array_filter ($array, function ($element) use ($valueIsSet, $value, $sinceIsSet, $since, $field) {
            return (($valueIsSet ? ($element[$field] === $value)     : true) &&
                    ($sinceIsSet ? ($element['timestamp'] >= $since) : true));
        });
        return array_slice ($array, 0, isset ($limit) ? $limit : count ($array));
    }

    public function filter_by_symbol_since_limit ($array, $symbol = null, $since = null, $limit = null) {
        return $this->filter_by_value_since_limit ($array, 'symbol', $symbol, $since, $limit);
    }

    public function filterBySymbolSinceLimit ($array, $symbol = null, $since = null, $limit = null) {
        return $this->filter_by_symbol_since_limit ($array, $symbol, $since, $limit);
    }

    public function filter_by_currency_since_limit ($array, $code = null, $since = null, $limit = null) {
        return $this->filter_by_value_since_limit ($array, 'currency', $code, $since, $limit);
    }

    public function filterByCurrencySinceLimit ($array, $code = null, $since = null, $limit = null) {
        return $this->filter_by_currency_since_limit ($array, $code, $since, $limit);
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

    public function fetch_order_status ($id, $symbol = null, $params = array ()) {
        $order = $this->fetch_order ($id, $symbol, $params);
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

    public function fetchTransactions ($code = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_transactions ($code, $since, $limit, $params);
    }

    public function fetch_transactions ($code = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_transactions() not implemented yet');
    }

    public function fetchDeposits ($code = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_deposits ($code, $since, $limit, $params);
    }

    public function fetch_deposits ($code = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_deposits() not implemented yet');
    }

    public function fetchWithdrawals ($code = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_withdrawals ($code, $since, $limit, $params);
    }

    public function fetch_withdrawals ($code = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_withdrawals() not implemented yet');
    }

    public function fetchDepositAddress ($code, $params = array ()) {
        return $this->fetch_deposit_address ($code, $params);
    }

    public function fetch_deposit_address ($code, $params = array ()) {
        throw new NotSupported ($this->id . ' fetch_deposit_address() not implemented yet');
    }

    public function fetch_markets ($params = array()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->markets ? array_values ($this->markets) : array ();
    }

    public function fetchMarkets  ($params = array()) {
        return $this->fetch_markets ($params);
    }

    public function fetch_currencies ($params = array ()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->currencies ? $this->currencies : array ();
    }

    public function fetchCurrencies ($params = array ()) {
        return $this->fetch_currencies ();
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

    public function parse_trading_view_ohlcv ($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function convert_trading_view_to_ohlcv ($ohlcvs) {
        $result = array ();
        for ($i = 0; $i < count ($ohlcvs['t']); $i++) {
            $result[] = array (
                $ohlcvs['t'][$i] * 1000,
                $ohlcvs['o'][$i],
                $ohlcvs['h'][$i],
                $ohlcvs['l'][$i],
                $ohlcvs['c'][$i],
                $ohlcvs['v'][$i],
            );
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

    public function createOrder ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->create_order ($symbol, $type, $side, $amount, $price, $params);
    }

    public function createLimitOrder ($symbol, $side, $amount, $price, $params = array ()) {
        return $this->create_limit_order ($symbol, $side, $amount, $price, $params);
    }

    public function createMarketOrder ($symbol, $side, $amount, $price = null, $params = array ()) {
        return $this->create_market_order ($symbol, $side, $amount, $price, $params);
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

        if (!$this->currencies) {
            throw new ExchangeError ($this->id . ' currencies not loaded');
        }

        if (array_key_exists ($commonCode, $this->currencies)) {
            return $this->currencies[$commonCode]['id'];
        }

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
        return self::decimal_to_precision ($cost, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function costToPrecision ($symbol, $cost) {
        return $this->cost_to_precision ($symbol, $cost);
    }

    public function price_to_precision ($symbol, $price) {
        return self::decimal_to_precision ($price, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function priceToPrecision ($symbol, $price) {
        return $this->price_to_precision ($symbol, $price);
    }

    public function amount_to_precision ($symbol, $amount) {
        return self::decimal_to_precision ($amount, TRUNCATE, $this->markets[$symbol]['precision']['amount'], $this->precisionMode);
    }

    public function amountToPrecision ($symbol, $amount) {
        return $this->amount_to_precision ($symbol, $amount);
    }

    public function fee_to_precision ($symbol, $fee) {
        return self::decimalToPrecision ($fee, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function feeToPrecision ($symbol, $fee) {
        return $this->fee_to_precision ($symbol, $fee);
    }

    public function currency_to_precision ($currency, $fee) {
        return self::decimal_to_precision($fee, ROUND, $this->currencies[$currency]['precision'], $this->precisionMode);
    }

    public function currencyToPrecision ($symbol, $fee) {
        return $this->currency_to_precision ($symbol, $fee);
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
        if (array_key_exists ($function, $this)) {
            return call_user_func_array ($this->$function, $params);
        } else {
            /* handle errors */
            throw new ExchangeError ($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
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

        // PHP 5.6+ only:
        // $old_feature_map = array_change_key_case (array_filter (get_object_vars ($this), function ($key) {
        //     return strpos($key, 'has') !== false && $key !== 'has';
        // }, ARRAY_FILTER_USE_KEY), CASE_LOWER);

        // the above rewritten for PHP 5.4+
        $nonfiltered = get_object_vars ($this);
        $filtered = array ();
        foreach ($nonfiltered as $key => $value) {
            if ((strpos ($key, 'has') !== false) && ($key !== 'has')) {
                $filtered[$key] = $value;
            }
        }
        $old_feature_map = array_change_key_case ($filtered, CASE_LOWER);

        $old_feature = "has{$feature}";
        return array_key_exists ($old_feature, $old_feature_map) ? $old_feature_map[$old_feature] : false;
    }

    public static function decimalToPrecision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        return static::decimal_to_precision ($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);
    }

    public static function decimal_to_precision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {

        if (!is_int ($numPrecisionDigits)) {
            throw new BaseError ('Precision must be an integer');
        }

        if (!is_numeric ($x)) {
            throw new BaseError ('Invalid number');
        }

        assert ($roundingMode === ROUND || $roundingMode === TRUNCATE);

        $result = '';

        // Special handling for negative precision
        if ($numPrecisionDigits < 0) {
            $toNearest = 10 ** abs ($numPrecisionDigits);
            if ($roundingMode === ROUND) {
                $result = (string) ($toNearest * decimal_to_precision ($x / $toNearest, $roundingMode, 0, DECIMAL_PLACES, $paddingMode));
            }
            if ($roundingMode === TRUNCATE) {
                $result = decimal_to_precision ($x - $x % $toNearest, $roundingMode, 0, DECIMAL_PLACES, $paddingMode);
            }
            return $result;
        }

        if ($roundingMode === ROUND) {
            if ($countingMode === DECIMAL_PLACES) {
                // Requested precision of 100 digits was truncated to PHP maximum of 53 digits
                $numPrecisionDigits = min (14, $numPrecisionDigits);
                $result = number_format (round ($x, $numPrecisionDigits, PHP_ROUND_HALF_UP), $numPrecisionDigits, '.', '');
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                $significantPosition = log (abs ($x), 10) % 10;
                if ($significantPosition > 0) {
                    $significantPosition += 1;
                }
                $result = (string) round ($x, $numPrecisionDigits - $significantPosition, PHP_ROUND_HALF_UP);
            }
        } elseif ($roundingMode === TRUNCATE) {
            $dotIndex = strpos ($x, '.');
            $dotPosition = $dotIndex ?: 0;
            if ($countingMode === DECIMAL_PLACES) {
                if ($dotIndex) {
                    list ($before, $after) = explode ('.', $x);
                    $result = $before . '.' . substr ($after, 0, $numPrecisionDigits);
                } else {
                    $result = $x;
                }
            } elseif ($countingMode === SIGNIFICANT_DIGITS) {
                if ($numPrecisionDigits === 0) {
                    return '0';
                }
                $significantPosition = log (abs ($x), 10) % 10;
                $start = $dotPosition - $significantPosition;
                $end   = $start + $numPrecisionDigits;
                if ($dotPosition >= $end) {
                    $end -= 1;
                }
                if ($numPrecisionDigits >= (strlen ($x) - ($dotPosition ? 1 : 0))) {
                    $result = (string) $x;
                } else {
                    if ($significantPosition < 0) {
                        $end += 1;
                    }
                    $result = str_pad (substr ($x, 0, $end), $dotPosition, '0');
                }
            }
            $result = rtrim ($result, '.');
        }

        $hasDot = strpos ($result, '.') !== false;
        if ($paddingMode === NO_PADDING) {
            if ($result === '' && $numPrecisionDigits === 0) {
                return '0';
            }
            if ($hasDot) {
                $result = rtrim ($result, '0');
                $result = rtrim ($result, '.');
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
        if (($result === '-0') || ($result === '-0.'. str_repeat ('0', max (strlen ($result) - 3, 0)))) {
            $result = substr ($result, 1);
        }
        return $result;
    }

    // ------------------------------------------------------------------------
    // web3 / 0x methods

    public function check_required_dependencies () {
        // PHP version of this function does nothing, as most of its
        // dependencies are very lighweight and don't eat a lot
    }

    public function eth_decimals ($unit = 'ether') {
        $units = array (
            'wei' => 0,          // 1
            'kwei' => 3,         // 1000
            'babbage' => 3,      // 1000
            'femtoether' => 3,   // 1000
            'mwei' => 6,         // 1000000
            'lovelace' => 6,     // 1000000
            'picoether' => 6,    // 1000000
            'gwei' => 9,         // 1000000000
            'shannon' => 9,      // 1000000000
            'nanoether' => 9,    // 1000000000
            'nano' => 9,         // 1000000000
            'szabo' => 12,       // 1000000000000
            'microether' => 12,  // 1000000000000
            'micro' => 12,       // 1000000000000
            'finney' => 15,      // 1000000000000000
            'milliether' => 15,  // 1000000000000000
            'milli' => 15,       // 1000000000000000
            'ether' => 18,       // 1000000000000000000
            'kether' => 21,      // 1000000000000000000000
            'grand' => 21,       // 1000000000000000000000
            'mether' => 24,      // 1000000000000000000000000
            'gether' => 27,      // 1000000000000000000000000000
            'tether' => 30,      // 1000000000000000000000000000000
        );
        return $this->safe_value ($units, $unit);
    }

    public function ethDecimals ($unit = 'ether') {
        return $this->eth_decimals ($unit);
    }

    public function eth_unit ($decimals = 18) {
        $units = array (
            0 => 'wei',      // 1000000000000000000
            3 => 'kwei',     // 1000000000000000
            6 => 'mwei',     // 1000000000000
            9 => 'gwei',     // 1000000000
            12 => 'szabo',   // 1000000
            15 => 'finney',  // 1000
            18 => 'ether',   // 1
            21 => 'kether',  // 0.001
            24 => 'mether',  // 0.000001
            27 => 'gether',  // 0.000000001
            30 => 'tether',  // 0.000000000001
        );
        return $this->safe_value ($units, (int) $decimals);
    }

    public function ethUnit ($decimals = 18) {
        return $this->eth_unit ($decimals);
    }

    public function fromWei ($amount, $unit = 'ether', $decimals = 18) {
        if (!isset (Exchange::$eth_units[$unit])) {
            throw new \UnexpectedValueException ("Uknown unit '" . $unit . "', supported units: " . implode (', ', array_keys (Exchange::$eth_units)));
        }
        $denominator = substr_count (Exchange::$eth_units[$unit], 0) + strlen ($amount) - strpos ($amount, '.') - 1;
        return (float) (($unit === 'wei') ? $amount : bcdiv ($amount, Exchange::$eth_units[$unit], $denominator));
    }

    public function toWei ($amount, $unit = 'ether', $decimals = 18) {
        if (!isset (Exchange::$eth_units[$unit])) {
            throw new \UnexpectedValueException ("Unknown unit '" . $unit . "', supported units: " . implode (', ', array_keys (Exchange::$eth_units)));
        }
        return (string) (int) (($unit === 'wei') ? $amount : bcmul ($amount, Exchange::$eth_units[$unit]));
    }

    // decryptAccountFromJSON (json, password) {
    //     return this.decryptAccount ((typeof json === 'string') ? JSON.parse (json) : json, password)
    // }

    // decryptAccount (key, password) {
    //     return this.web3.eth.accounts.decrypt (key, password)
    // }

    // decryptAccountFromPrivateKey (privateKey) {
    //     return this.web3.eth.accounts.privateKeyToAccount (privateKey)
    // }

    public function getZeroExOrderHash ($order) {

        // $unpacked = array (
        //     "0x90fe2af704b34e0224bf2299c838e04d4dcf1364", // exchangeContractAddress
        //     "0x731fc101bbe102221c91c31ed0489f1ddfc439a3", // maker
        //     "0x00ba938cc0df182c25108d7bf2ee3d37bce07513", // taker
        //     "0xd0a1e359811322d97991e03f863a0c30c2cf029c", // makerTokenAddress
        //     "0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570", // takerTokenAddress
        //     "0x88a64b5e882e5ad851bea5e7a3c8ba7c523fecbe", // feeRecipient
        //     "27100000000000000", // makerTokenAmount
        //     "874377028175459241", // takerTokenAmount
        //     "0", // makerFee
        //     "0", // takerFee
        //     "1534809575", // expirationUnixTimestampSec
        //     "3610846705800197954038657082705100176266402776121341340841167002345284333867", // salt
        // );
        // echo "0x" . call_user_func_array('\kornrunner\Solidity::sha3', $unpacked) . "\n";
        // should result in
        // 0xe815dc92933b68e7fc2b7102b8407ba7afb384e4080ac8d28ed42482933c5cf5

        $unpacked = array (
            $order['exchangeContractAddress'],      // { value: order.exchangeContractAddress, type: types_1.SolidityTypes.Address },
            $order['maker'],                        // { value: order.maker, type: types_1.SolidityTypes.Address },
            $order['taker'],                        // { value: order.taker, type: types_1.SolidityTypes.Address },
            $order['makerTokenAddress'],            // { value: order.makerTokenAddress, type: types_1.SolidityTypes.Address },
            $order['takerTokenAddress'],            // { value: order.takerTokenAddress, type: types_1.SolidityTypes.Address },
            $order['feeRecipient'],                 // { value: order.feeRecipient, type: types_1.SolidityTypes.Address },
            $order['makerTokenAmount'],             // { value: bigNumberToBN(order.makerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            $order['takerTokenAmount'],             // { value: bigNumberToBN(order.takerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            $order['makerFee'],                     // { value: bigNumberToBN(order.makerFee), type: types_1.SolidityTypes.Uint256, },
            $order['takerFee'],                     // { value: bigNumberToBN(order.takerFee), type: types_1.SolidityTypes.Uint256, },
            $order['expirationUnixTimestampSec'],   // { value: bigNumberToBN(order.expirationUnixTimestampSec), type: types_1.SolidityTypes.Uint256, },
            $order['salt'],                         // { value: bigNumberToBN(order.salt), type: types_1.SolidityTypes.Uint256 },
        );
        // $types = array (
        //     'address', // { value: order.exchangeContractAddress, type: types_1.SolidityTypes.Address },
        //     'address', // { value: order.maker, type: types_1.SolidityTypes.Address },
        //     'address', // { value: order.taker, type: types_1.SolidityTypes.Address },
        //     'address', // { value: order.makerTokenAddress, type: types_1.SolidityTypes.Address },
        //     'address', // { value: order.takerTokenAddress, type: types_1.SolidityTypes.Address },
        //     'address', // { value: order.feeRecipient, type: types_1.SolidityTypes.Address },
        //     'uint256', // { value: bigNumberToBN(order.makerTokenAmount), type: types_1.SolidityTypes.Uint256, },
        //     'uint256', // { value: bigNumberToBN(order.takerTokenAmount), type: types_1.SolidityTypes.Uint256, },
        //     'uint256', // { value: bigNumberToBN(order.makerFee), type: types_1.SolidityTypes.Uint256, },
        //     'uint256', // { value: bigNumberToBN(order.takerFee), type: types_1.SolidityTypes.Uint256, },
        //     'uint256', // { value: bigNumberToBN(order.expirationUnixTimestampSec), type: types_1.SolidityTypes.Uint256, },
        //     'uint256', // { value: bigNumberToBN(order.salt), type: types_1.SolidityTypes.Uint256 },
        // );
        return call_user_func_array('\kornrunner\Solidity::sha3', $unpacked);
    }

    public function signZeroExOrder ($order, $privateKey) {
        $orderHash = $this->getZeroExOrderHash ($order);
        $signature = $this->signMessage ($orderHash, privateKey);
        return array_merge ($order, array (
            'orderHash' => $orderHash,
            'ecSignature' => $signature, // todo fix v if needed
        ));
    }

    public function hashMessage ($message) {
        return '0x' . Eth::hashPersonalMessage ($message);
    }

    public function signHash ($hash, $privateKey) {
        $secp256k1 = new Secp256k1();
        $signature = $secp256k1->sign ($hash, $privateKey);
        return array (
            'v' => $signature->getRecoveryParam () + 27, // integer
            'r' => "0x" . gmp_strval ($signature->getR (), 16), // '0x'-prefixed hex string
            's' => "0x" . gmp_strval ($signature->getS (), 16), // '0x'-prefixed hex string
        );
    }

    public function signMessage ($message, $privateKey) {
        return $this->signHash ($this->hashMessage ($message), $privateKey);
    }

    public function oath () {
        if ($this->twofa) {
            return $this->totp ($this->twofa);
        } else {
            throw new ExchangeError ($this->id . ' requires a non-empty value in $this->twofa property');
        }
    }

    public static function totp ($key) {
        function base32_decode($s){
            static $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            $tmp = '';
            foreach (str_split($s) as $c) {
                if (false === ($v = strpos($alphabet, $c))) {
                    $v = 0;
                }
                $tmp .= sprintf('%05b', $v);
            }
            $args = array_map('bindec', str_split($tmp, 8));
            array_unshift($args, 'C*');
            return rtrim(call_user_func_array('pack', $args), "\0");
        }
        $noSpaceKey = str_replace (' ', '', $key);
        $encodedKey = base32_decode($noSpaceKey);
        $epoch = floor (time() / 30);
        $encodedEpoch = pack ('J', $epoch);
        $hmacResult = static::hmac($encodedEpoch, $encodedKey,"sha1", "hex");
        $hmac = [];
        foreach (str_split($hmacResult, 2) as $hex) {
            $hmac[] = hexdec($hex);
        }
        $offset = $hmac[count($hmac) - 1] & 0xF;
        $code = ($hmac[$offset + 0] & 0x7F) << 24 | ($hmac[$offset + 1] & 0xFF) << 16 | ($hmac[$offset + 2] & 0xFF) << 8 | ($hmac[$offset + 3] & 0xFF);
        $otp = $code % pow(10, 6);
        return str_pad((string) $otp, 6, '0', STR_PAD_LEFT);
    }
}
