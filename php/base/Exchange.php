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

use kornrunner\Keccak;
use kornrunner\Solidity;
use Elliptic\EC;
use BN\BN;

$version = '1.25.31';

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

    const VERSION = '1.25.31';

    public static $exchanges = array(
        '_1btcxe',
        'acx',
        'adara',
        'anxpro',
        'aofex',
        'bcex',
        'bequant',
        'bibox',
        'bigone',
        'binance',
        'binanceje',
        'binanceus',
        'bit2c',
        'bitbank',
        'bitbay',
        'bitfinex',
        'bitfinex2',
        'bitflyer',
        'bitforex',
        'bithumb',
        'bitkk',
        'bitlish',
        'bitmart',
        'bitmax',
        'bitmex',
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
        'btcmarkets',
        'btctradeim',
        'btctradeua',
        'btcturk',
        'buda',
        'bw',
        'bybit',
        'bytetrade',
        'cex',
        'chilebit',
        'cobinhood',
        'coinbase',
        'coinbaseprime',
        'coinbasepro',
        'coincheck',
        'coinegg',
        'coinex',
        'coinfalcon',
        'coinfloor',
        'coingi',
        'coinmarketcap',
        'coinmate',
        'coinone',
        'coinspot',
        'coolcoin',
        'coss',
        'crex24',
        'deribit',
        'digifinex',
        'dsx',
        'exmo',
        'exx',
        'fcoin',
        'fcoinjp',
        'flowbtc',
        'foxbit',
        'ftx',
        'fybse',
        'gateio',
        'gemini',
        'hitbtc',
        'hitbtc2',
        'hollaex',
        'huobipro',
        'huobiru',
        'ice3x',
        'idex',
        'independentreserve',
        'indodax',
        'itbit',
        'kkex',
        'kraken',
        'kucoin',
        'kuna',
        'lakebtc',
        'latoken',
        'lbank',
        'liquid',
        'livecoin',
        'luno',
        'lykke',
        'mercado',
        'mixcoins',
        'oceanex',
        'okcoin',
        'okcoinusd',
        'okex',
        'okex3',
        'paymium',
        'poloniex',
        'rightbtc',
        'southxchange',
        'stex',
        'stronghold',
        'surbitcoin',
        'theocean',
        'therock',
        'tidebit',
        'tidex',
        'timex',
        'topq',
        'upbit',
        'vaultoro',
        'vbtc',
        'whitebit',
        'xbtce',
        'yobit',
        'zaif',
        'zb',
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

    public static function uuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
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
        return count(array_filter(array_keys($array), 'is_string')) > 0;
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

    public static function indexBy($arrayOfArrays, $key) {
        return static::index_by($arrayOfArrays, $key);
    }

    public static function sortBy($arrayOfArrays, $key, $descending = false) {
        return static::sort_by($arrayOfArrays, $key, $descending);
    }

    public static function filterBy($arrayOfArrays, $key, $descending = false) {
        return static::filter_by($arrayOfArrays, $key, $descending);
    }

    public static function groupBy($arrayOfArrays, $key, $descending = false) {
        return static::group_by($arrayOfArrays, $key, $descending);
    }

    public static function sum() {
        return array_sum(array_filter(func_get_args(), function ($x) {
            return isset($x) ? $x : 0;
        }));
    }

    public static function extractParams($string) {
        return static::extract_params($string);
    }

    public static function implodeParams($string, $params) {
        return static::implode_params($string, $params);
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

    public function encode_uri_component($string) {
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

    public function seconds() {
        return time();
    }

    public function milliseconds() {
        list($msec, $sec) = explode(' ', microtime());
        return (int) ($sec . substr($msec, 2, 3));
    }

    public function microseconds() {
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

    public static function binaryToBase64($binary) {
        return static::binary_to_base64($binary);
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

    public function checkRequiredCredentials($error = true) {
        return $this->check_required_credentials($error);
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

    public function checkAddress($address) {
        return $this->check_address($address);
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

        // rate limiter params
        $this->rateLimit = 2000;
        $this->tokenBucket = array(
            'refillRate' => 1.0 / $this->rateLimit,
            'delay' => 1.0,
            'capacity' => 1.0,
            'defaultCost' => 1.0,
            'maxCapacity' => 1000,
        );

        $this->curlopt_interface = null;
        $this->timeout = 10000; // in milliseconds
        $this->proxy = '';
        $this->origin = '*'; // CORS origin
        $this->headers = array();
        $this->hostname = null; // in case of inaccessibility of the "main" domain

        $this->options = array(); // exchange-specific options if any

        $this->skipJsonOnStatusCodes = false; // TODO: reserved, rewrite the curl routine to parse JSON body anyway

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
        $this->ids = null;
        $this->currencies = array();
        $this->base_currencies = null;
        $this->quote_currencies = null;
        $this->balance = array();
        $this->orderbooks = array();
        $this->tickers = array();
        $this->fees = array('trading' => array(), 'funding' => array());
        $this->precision = array();
        $this->orders = array();
        $this->trades = array();
        $this->transactions = array();
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
        $this->marketsById = null;
        $this->markets_by_id = null;
        $this->currencies_by_id = null;
        $this->userAgent = null; // 'ccxt/' . $this::VERSION . ' (+https://github.com/ccxt/ccxt) PHP/' . PHP_VERSION;
        $this->userAgents = array(
            'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
            'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        );
        $this->minFundingAddressLength = 1; // used in check_address
        $this->substituteCommonCurrencyCodes = true;
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
            'withdraw' => false,
        );

        $this->precisionMode = DECIMAL_PLACES;

        $this->lastRestRequestTimestamp = 0;
        $this->lastRestPollTimestamp = 0;
        $this->restRequestQueue = null;
        $this->restPollerLoopIsRunning = false;
        $this->enableRateLimit = false;
        $this->enableLastJsonResponse = true;
        $this->enableLastHttpResponse = true;
        $this->enableLastResponseHeaders = true;
        $this->last_http_response = null;
        $this->last_json_response = null;
        $this->last_response_headers = null;

        $this->requiresWeb3 = false;

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
                $this->urls['api_backup'] = $this->urls['api'];
                $this->urls['api'] = $this->urls['test'];
            } else {
                throw new NotSupported($this->id . ' does not have a sandbox URL');
            }
        } elseif (array_key_exists('api_backup', $this->urls)) {
            $this->urls['api'] = $this->urls['api_backup'];
            unset($this->urls['api_backup']);
        }
    }

    public function define_rest_api($api, $method_name, $options = array()) {
        foreach ($api as $type => $methods) {
            foreach ($methods as $http_method => $paths) {
                foreach ($paths as $path) {
                    $splitPath = mb_split('[^a-zA-Z0-9]', $path);

                    $uppercaseMethod = mb_strtoupper($http_method);
                    $lowercaseMethod = mb_strtolower($http_method);
                    $camelcaseMethod = static::capitalize($lowercaseMethod);
                    $camelcaseSuffix = implode(array_map(get_called_class() . '::capitalize', $splitPath));
                    $lowercasePath = array_map('trim', array_map('strtolower', $splitPath));
                    $underscoreSuffix = implode('_', array_filter($lowercasePath));

                    $camelcase = $type . $camelcaseMethod . static::capitalize($camelcaseSuffix);
                    $underscore = $type . '_' . $lowercaseMethod . '_' . mb_strtolower($underscoreSuffix);

                    if (array_key_exists('suffixes', $options)) {
                        if (array_key_exists('camelcase', $options['suffixes'])) {
                            $camelcase .= $options['suffixes']['camelcase'];
                        }
                        if (array_key_exists('underscore', $options['suffixes'])) {
                            $underscore .= $options['suffixes']['underscore'];
                        }
                    }

                    $this->defined_rest_api[$camelcase] = array($path, $type, $uppercaseMethod, $method_name);
                    $this->defined_rest_api[$underscore] = array($path, $type, $uppercaseMethod, $method_name);
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
        $hash = \hash($type, $request, ($binary || $base64) ? true : false);
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

    // this method is experimental
    public function throttle() {
        $now = $this->milliseconds();
        $elapsed = $now - $this->lastRestRequestTimestamp;
        if ($elapsed < $this->rateLimit) {
            $delay = $this->rateLimit - $elapsed;
            usleep((int) ($delay * 1000.0));
        }
    }

    public function sign($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) {
        throw new NotSupported($this->id . ' sign() not supported yet');
    }

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) {
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        return $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function request($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) {
        return $this->fetch2($path, $api, $method, $params, $headers, $body);
    }

    public function throwExactlyMatchedException($exact, $string, $message) {
        return $this->throw_exactly_matched_exception($exact, $string, $message);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
        if (isset($exact[$string])) {
            throw new $exact[$string]($message);
        }
    }

    public function throwBroadlyMatchedException($broad, $string, $message) {
        return $this->throw_broadly_matched_exception($broad, $string, $message);
    }

    public function throw_broadly_matched_exception($broad, $string, $message) {
        $broad_key = $this->find_broadly_matched_key($broad, $string);
        if ($broad_key !== null) {
            throw new $broad[$broad_key]($message);
        }
    }

    public function findBroadlyMatchedKey($broad, $string) {
        return $this->find_broadly_matched_key($broad, $string);
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

    public function handle_errors($code, $reason, $url, $method, $headers, $body, $response, $request_headers, $request_body) {
        // it's a stub function, does nothing in base code
    }

    public function parse_json($json_string, $as_associative_array = true) {
        return json_decode($json_string, $as_associative_array);
    }

    public function print() {
        $args = func_get_args();
        if (is_array($args)) {
            foreach ($args as $arg) {
                print_r($arg);
            }
        }
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {
        if ($this->enableRateLimit) {
            $this->throttle();
        }

        $headers = array_merge($this->headers, $headers ? $headers : array());

        if (strlen($this->proxy)) {
            $headers['Origin'] = $this->origin;
        }

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

        $verbose_headers = $headers;

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
            $this->print("\nRequest:\n", array($method, $url, $verbose_headers, $body));
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

        $response_headers = array();
        $http_status_text = '';

        // this function is called by curl for each header received
        curl_setopt($this->curl, CURLOPT_HEADERFUNCTION,
            function ($curl, $header) use (&$response_headers, &$http_status_text) {
                $length = strlen($header);
                $tuple = explode(':', $header, 2);
                if (count($tuple) !== 2) { // ignore invalid headers
                    // if it's a "GET https://example.com/path 200 OK" line
                    // try to parse the "OK" HTTP status string
                    if (substr($header, 0, 4) === 'HTTP') {
                        $parts = explode(' ', $header);
                        if (count($parts) === 3) {
                            $http_status_text = trim($parts[2]);
                        }
                    }
                    return $length;
                }
                $key = strtolower(trim($tuple[0]));
                $value = trim($tuple[1]);
                if (!array_key_exists($key, $response_headers)) {
                    $response_headers[$key] = array($value);
                } else {
                    $response_headers[$key][] = $value;
                }
                return $length;
            }
        );

        // user-defined cURL options (if any)
        if (!empty($this->curl_options)) {
            curl_setopt_array($this->curl, $this->curl_options);
        }

        $result = curl_exec($this->curl);

        $this->lastRestRequestTimestamp = $this->milliseconds();

        if ($this->enableLastHttpResponse) {
            $this->last_http_response = $result;
        }

        if ($this->enableLastResponseHeaders) {
            $this->last_response_headers = $response_headers;
        }

        $json_response = null;

        if ($this->is_json_encoded_object($result)) {
            $json_response = $this->parse_json($result);

            if ($this->enableLastJsonResponse) {
                $this->last_json_response = $json_response;
            }
        }

        $curl_errno = curl_errno($this->curl);
        $curl_error = curl_error($this->curl);
        $http_status_code = curl_getinfo($this->curl, CURLINFO_HTTP_CODE);

        if ($this->verbose) {
            $this->print("\nResponse:\n", array($method, $url, $http_status_code, $curl_error, $response_headers, $result));
        }

        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $result ? $result : null, $json_response, $headers, $body);

        if ($result === false) {
            if ($curl_errno == 28) { // CURLE_OPERATION_TIMEDOUT
                throw new RequestTimeout(implode(' ', array($url, $method, $curl_errno, $curl_error)));
            }

            // all sorts of SSL problems, accessibility
            throw new ExchangeNotAvailable(implode(' ', array($url, $method, $curl_errno, $curl_error)));
        }

        $string_code = (string) $http_status_code;

        if (array_key_exists($string_code, $this->httpExceptions)) {
            $error_class = $this->httpExceptions[$string_code];
            if ($error_class === 'ExchangeNotAvailable') {
                if (preg_match('#cloudflare|incapsula|overload|ddos#i', $result)) {
                    throw new DDoSProtection(implode(' ', array($url, $method, $http_status_code, $result)));
                }
                $details = '(possible reasons: ' . implode(', ', array(
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline',
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting in effect',
                    )) . ')';
                throw new ExchangeNotAvailable(implode(' ', array($url, $method, $http_status_code, $result, $details)));
            }
            if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                $error_class = '\\ccxt\\' . $error_class;
            }
            throw new $error_class(implode(' ', array($url, $method, $http_status_code, $result)));
        }

        if (!$json_response) {
            $details = '(possible reasons: ' . implode(', ', array(
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';
            $error_class = null;
            if (preg_match('#offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing#i', $result)) {
                $error_class = 'ExchangeNotAvailable';
            }

            if (preg_match('#cloudflare|incapsula#i', $result)) {
                $error_class = 'DDosProtection';
            }
            if ($error_class !== null) {
                if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                    $error_class = '\\ccxt\\' . $error_class;
                }
                throw new $error_class(implode(' ', array($url, $method, $http_status_code, 'not accessible from this location at the moment', $details)));
            }
        }

        return isset($json_response) ? $json_response : $result;
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
        $this->marketsById = $this->markets_by_id;
        $this->symbols = array_keys($this->markets);
        sort($this->symbols);
        $this->ids = array_keys($this->markets_by_id);
        sort($this->ids);
        if ($currencies) {
            $this->currencies = array_replace_recursive($currencies, $this->currencies);
        } else {
            $base_currencies = array_map(function ($market) {
                return array(
                    'id' => array_key_exists('baseId', $market) ? $market['baseId'] : $market['base'],
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
                    'id' => array_key_exists('quoteId', $market) ? $market['quoteId'] : $market['quote'],
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
        return $this->markets;
    }

    public function setMarkets($markets) {
        return $this->set_markets($markets);
    }

    public function loadMarkets($reload = false, $params = array()) {
        return $this->load_markets($reload, $params);
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

    public function loadAccounts($reload = false, $params = array()) {
        return $this->load_accounts($reload, $params);
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

    public function parse_ohlcv($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return ('array' === gettype($ohlcv) && !static::is_associative($ohlcv)) ? array_slice($ohlcv, 0, 6) : $ohlcv;
    }

    public function parseOHLCV($ohlcv, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcv($ohlcv, $market, $timeframe, $since, $limit);
    }

    public function parse_ohlcvs($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        $ohlcvs = is_array($ohlcvs) ? array_values($ohlcvs) : array();
        $result = array();
        $num_ohlcvs = count($ohlcvs);
        for ($i = 0; $i < $num_ohlcvs; $i++) {
            if ($limit && (count($result) >= $limit)) {
                break;
            }
            $ohlcv = $this->parse_ohlcv($ohlcvs[$i], $market, $timeframe, $since, $limit);
            if ($since && ($ohlcv[0] < $since)) {
                continue;
            }
            $result[] = $ohlcv;
        }
        return $this->sort_by($result, 0);
    }

    public function parseOHLCVs($ohlcvs, $market = null, $timeframe = 60, $since = null, $limit = null) {
        return $this->parse_ohlcvs($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_bid_ask($bidask, $price_key = 0, $amount_key = 1) {
        return array(floatval($bidask[$price_key]), floatval($bidask[$amount_key]));
    }

    public function parse_bids_asks($bidasks, $price_key = 0, $amount_key = 1) {
        $result = array();
        $array = is_array($bidasks) ? array_values($bidasks) : array();
        foreach ($array as $bidask) {
            $result[] = $this->parse_bid_ask($bidask, $price_key, $amount_key);
        }
        return $result;
    }

    public function parseBidAsk($bidask, $price_key = 0, $amount_key = 1) {
        return $this->parse_bid_ask($bidask, $price_key, $amount_key);
    }

    public function parseBidsAsks($bidasks, $price_key = 0, $amount_key = 1) {
        return $this->parse_bids_asks($bidasks, $price_key, $amount_key);
    }

    public function fetch_l2_order_book($symbol, $limit = null, $params = array()) {
        $orderbook = $this->fetch_order_book($symbol, $limit, $params);
        return array_merge($orderbook, array(
            'bids' => $this->sort_by($this->aggregate($orderbook['bids']), 0, true),
            'asks' => $this->sort_by($this->aggregate($orderbook['asks']), 0),
        ));
    }

    public function fetchL2OrderBook($symbol, $limit = null, $params = array()) {
        return $this->fetch_l2_order_book($symbol, $limit, $params);
    }

    public function parse_order_book($orderbook, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        return array(
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

    public function parseOrderBook($orderbook, $timestamp = null, $bids_key = 'bids', $asks_key = 'asks', $price_key = 0, $amount_key = 1) {
        return $this->parse_order_book($orderbook, $timestamp, $bids_key, $asks_key, $price_key, $amount_key);
    }

    public function parse_balance($balance) {
        $currencies = $this->omit($balance, array('info', 'free', 'used', 'total'));

        $balance['free'] = array();
        $balance['used'] = array();
        $balance['total'] = array();

        foreach ($currencies as $code => $value) {
            if (!isset($value['total'])) {
                if (isset($value['free']) && isset($value['used'])) {
                    $balance[$code]['total'] = static::sum($value['free'], $value['used']);
                }
            }
            if (!isset($value['used'])) {
                if (isset($value['total']) && isset($value['free'])) {
                    $balance[$code]['used'] = static::sum($value['total'], -$value['free']);
                }
            }
            if (!isset($value['free'])) {
                if (isset($value['total']) && isset($value['used'])) {
                    $balance[$code]['free'] = static::sum($value['total'], -$value['used']);
                }
            }
            $balance['free'][$code] = $balance[$code]['free'];
            $balance['used'][$code] = $balance[$code]['used'];
            $balance['total'][$code] = $balance[$code]['total'];
        }
        return $balance;
    }

    public function parseBalance($balance) {
        return $this->parse_balance($balance);
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

    public function fetchFreeBalance($params = array()) {
        return $this->fetch_free_balance($params);
    }

    public function fetchUsedBalance($params = array()) {
        return $this->fetch_used_balance($params);
    }

    public function fetchTotalBalance($params = array()) {
        return $this->fetch_total_balance($params);
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
        $array = array_values($array);
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
            $result = ($tail && !$since_is_set) ?
                array_slice($result, -$limit) :
                array_slice($result, 0, $limit);
        }
        return $result;
    }

    public function filterBySinceLimit($array, $since = null, $limit = null, $key = 'timestamp', $tail = false) {
        return $this->filter_by_since_limit($array, $since, $limit, $key, $tail);
    }

    public function parse_trades($trades, $market = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($trades) ? array_values($trades) : array();
        $result = array();
        foreach ($array as $trade) {
            $result[] = array_merge($this->parse_trade($trade, $market), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $symbol = isset($market) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit);
    }

    public function parseTrades($trades, $market = null, $since = null, $limit = null, $params = array()) {
        return $this->parse_trades($trades, $market, $since, $limit, $params);
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
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parseLedger($items, $currency = null, $since = null, $limit = null, $params = array()) {
        return $this->parse_ledger($items, $currency, $since, $limit, $params);
    }

    public function parse_transactions($transactions, $currency = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($transactions) ? array_values($transactions) : array();
        $result = array();
        foreach ($array as $transaction) {
            $result[] = array_replace_recursive($this->parse_transaction($transaction, $currency), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = isset($currency) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parseTransactions($transactions, $currency = null, $since = null, $limit = null, $params = array()) {
        return $this->parse_transactions($transactions, $currency, $since, $limit, $params);
    }

    public function parse_orders($orders, $market = null, $since = null, $limit = null, $params = array()) {
        $array = is_array($orders) ? array_values($orders) : array();
        $result = array();
        foreach ($array as $order) {
            $result[] = array_replace_recursive($this->parse_order($order, $market), $params);
        }
        $result = $this->sort_by($result, 'timestamp');
        $symbol = isset($market) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit);
    }

    public function parseOrders($orders, $market = null, $since = null, $limit = null, $params = array()) {
        return $this->parse_orders($orders, $market, $since, $limit, $params);
    }

    public function safe_currency_code($currency_id, $currency = null) {
        $code = null;
        if ($currency_id !== null) {
            if ($this->currencies_by_id !== null && array_key_exists($currency_id, $this->currencies_by_id)) {
                $code = $this->currencies_by_id[$currency_id]['code'];
            } else {
                $code = $this->common_currency_code(mb_strtoupper($currency_id));
            }
        }
        if ($code === null && $currency !== null) {
            $code = $currency['code'];
        }
        return $code;
    }

    public function safeCurrencyCode($currency_id, $currency = null) {
        return $this->safe_currency_code($currency_id, $currency);
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

    public function filterBySymbol($orders, $symbol = null) {
        return $this->filter_by_symbol($orders, $symbol);
    }

    public function filter_by_value_since_limit($array, $field, $value = null, $since = null, $limit = null, $key = 'timestamp', $tail = false) {
        $array = array_values($array);
        $valueIsSet = isset($value);
        $sinceIsSet = isset($since);
        $array = array_filter($array, function ($element) use ($valueIsSet, $value, $sinceIsSet, $since, $field, $key) {
            return ($valueIsSet ? ($element[$field] === $value) : true) &&
                    ($sinceIsSet ? ($element[$key] >= $since) : true);
        });
        if (isset($limit)) {
            return ($tail && !$sinceIsSet) ?
                array_slice($array, -$limit) :
                array_slice($array, 0, $limit);
        }
        return $array;
    }

    public function filter_by_symbol_since_limit($array, $symbol = null, $since = null, $limit = null) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit);
    }

    public function filterBySymbolSinceLimit($array, $symbol = null, $since = null, $limit = null) {
        return $this->filter_by_symbol_since_limit($array, $symbol, $since, $limit);
    }

    public function filter_by_currency_since_limit($array, $code = null, $since = null, $limit = null) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit);
    }

    public function filterByCurrencySinceLimit($array, $code = null, $since = null, $limit = null) {
        return $this->filter_by_currency_since_limit($array, $code, $since, $limit);
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

    public function filterByArray($objects, $key, $values = null, $indexed = true) {
        return $this->filter_by_array($objects, $key, $values, $indexed);
    }

    public function fetch_bids_asks($symbols, $params = array()) { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all prices at once with a single call to fetch_bids_asks () for now');
    }

    public function fetchBidsAsks($symbols, $params = array()) {
        return $this->fetch_bids_asks($symbols, $params);
    }

    public function fetch_ticker($symbol, $params = array()) { // stub
        throw new NotSupported($this->id . ' fetchTicker not supported yet');
    }

    public function fetch_tickers($symbols, $params = array()) { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now');
    }

    public function fetchTickers($symbols = null, $params = array()) {
        return $this->fetch_tickers($symbols, $params);
    }

    public function fetch_order_status($id, $symbol = null, $params = array()) {
        $order = $this->fetch_order($id, $symbol, $params);
        return $order['status'];
    }

    public function fetchOrderStatus($id, $market = null) {
        return $this->fetch_order_status($id);
    }

    public function purge_cached_orders($before) {
        $this->orders = static::index_by(array_filter($this->orders, function ($order) use ($before) {
            return ('open' === $order['status']) || ($order['timestamp'] >= $before);
        }), 'id');
        return $this->orders;
    }

    public function purgeCachedOrders($before) {
        return $this->purge_cached_orders($before);
    }

    public function fetch_order($id, $symbol = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_order() not supported yet');
    }

    public function fetchOrder($id, $symbol = null, $params = array()) {
        return $this->fetch_order($id, $symbol, $params);
    }

    public function fetch_order_trades($id, $symbol = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_order_trades() not supported yet');
    }

    public function fetchOrderTrades($id, $symbol = null, $params = array()) {
        return $this->fetch_order_trades($id, $symbol, $params);
    }

    public function fetch_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_orders() not supported yet');
    }

    public function fetchOrders($symbol = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_orders($symbol, $since, $limit, $params);
    }

    public function fetch_open_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_open_orders() not supported yet');
    }

    public function fetchOpenOrders($symbol = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_open_orders($symbol, $since, $limit, $params);
    }

    public function fetch_closed_orders($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_closed_orders() not supported yet');
    }

    public function fetchClosedOrders($symbol = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_closed_orders($symbol, $since, $limit, $params);
    }

    public function fetch_my_trades($symbol = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_my_trades() not supported yet');
    }

    public function fetchMyTrades($symbol = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_my_trades($symbol, $since, $limit, $params);
    }

    public function fetchTransactions($code = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_transactions($code, $since, $limit, $params);
    }

    public function fetch_transactions($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_transactions() not supported yet');
    }

    public function fetchDeposits($code = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_deposits($code, $since, $limit, $params);
    }

    public function fetch_deposits($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_deposits() not supported yet');
    }

    public function fetchWithdrawals($code = null, $since = null, $limit = null, $params = array()) {
        return $this->fetch_withdrawals($code, $since, $limit, $params);
    }

    public function fetch_withdrawals($code = null, $since = null, $limit = null, $params = array()) {
        throw new NotSupported($this->id . ' fetch_withdrawals() not supported yet');
    }

    public function fetchDepositAddress($code, $params = array()) {
        return $this->fetch_deposit_address($code, $params);
    }

    public function fetch_deposit_address($code, $params = array()) {
        throw new NotSupported($this->id . ' fetch_deposit_address() not supported yet');
    }

    public function fetch_markets($params = array()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->markets ? array_values($this->markets) : array();
    }

    public function fetchMarkets($params = array()) {
        return $this->fetch_markets($params);
    }

    public function fetch_currencies($params = array()) {
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->currencies ? $this->currencies : array();
    }

    public function fetchCurrencies($params = array()) {
        return $this->fetch_currencies();
    }

    public function fetchBalance($params = array()) {
        return $this->fetch_balance($params);
    }

    public function fetch_balance($params = array()) {
        throw new NotSupported($this->id . ' fetch_balance() not supported yet');
    }

    public function fetchOrderBook($symbol, $limit = null, $params = array()) {
        return $this->fetch_order_book($symbol, $limit, $params);
    }

    public function fetchTicker($symbol, $params = array()) {
        return $this->fetch_ticker($symbol, $params);
    }

    public function fetchTrades($symbol, $since = null, $limit = null, $params = array()) {
        return $this->fetch_trades($symbol, $since, $limit, $params);
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

    public function fetchOHLCV($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array()) {
        return $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, $params);
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

    public function edit_order($id, $symbol, $type, $side, $amount, $price, $params = array()) {
        if (!$this->enableRateLimit) {
            throw new ExchangeError($this->id . ' edit_order() requires enableRateLimit = true');
        }
        $this->cancel_order($id, $symbol, $params);
        return $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function cancelOrder($id, $symbol = null, $params = array()) {
        return $this->cancel_order($id, $symbol, $params);
    }

    public function editLimitBuyOrder($id, $symbol, $amount, $price, $params = array()) {
        return $this->edit_limit_buy_order($id, $symbol, $amount, $price, $params);
    }

    public function editLimitSellOrder($id, $symbol, $amount, $price, $params = array()) {
        return $this->edit_limit_sell_order($id, $symbol, $amount, $price, $params);
    }

    public function editLimitOrder($id, $symbol, $side, $amount, $price, $params = array()) {
        return $this->edit_limit_order($id, $symbol, $side, $amount, $price, $params);
    }

    public function editOrder($id, $symbol, $type, $side, $amount, $price, $params = array()) {
        return $this->edit_order($id, $symbol, $type, $side, $amount, $price, $params);
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

    public function createOrder($symbol, $type, $side, $amount, $price = null, $params = array()) {
        return $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function createLimitOrder($symbol, $side, $amount, $price, $params = array()) {
        return $this->create_limit_order($symbol, $side, $amount, $price, $params);
    }

    public function createMarketOrder($symbol, $side, $amount, $price = null, $params = array()) {
        return $this->create_market_order($symbol, $side, $amount, $price, $params);
    }

    public function createLimitBuyOrder($symbol, $amount, $price, $params = array()) {
        return $this->create_limit_buy_order($symbol, $amount, $price, $params);
    }

    public function createLimitSellOrder($symbol, $amount, $price, $params = array()) {
        return $this->create_limit_sell_order($symbol, $amount, $price, $params);
    }

    public function createMarketBuyOrder($symbol, $amount, $params = array()) {
        return $this->create_market_buy_order($symbol, $amount, $params);
    }

    public function createMarketSellOrder($symbol, $amount, $params = array()) {
        return $this->create_market_sell_order($symbol, $amount, $params);
    }

    public function calculate_fee($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array()) {
        $market = $this->markets[$symbol];
        $rate = $market[$takerOrMaker];
        $cost = floatval($this->cost_to_precision($symbol, $amount * $price));
        return array(
            'type' => $takerOrMaker,
            'currency' => $market['quote'],
            'rate' => $rate,
            'cost' => floatval($this->fee_to_precision($symbol, $rate * $cost)),
        );
    }

    public function createFee($symbol, $type, $side, $amount, $price, $fee = 'taker', $params = array()) {
        return $this->calculate_fee($symbol, $type, $side, $amount, $price, $fee, $params);
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

    public function currency_id($commonCode) {
        if (!$this->currencies) {
            throw new ExchangeError($this->id . ' currencies not loaded');
        }

        if (array_key_exists($commonCode, $this->currencies)) {
            return $this->currencies[$commonCode]['id'];
        }

        $currencyIds = array();
        $distinct = is_array($this->commonCurrencies) ? array_keys($this->commonCurrencies) : array();
        for ($i = 0; $i < count($distinct); $i++) {
            $k = $distinct[$i];
            $currencyIds[$this->commonCurrencies[$k]] = $k;
        }

        return $this->safe_string($currencyIds, $commonCode, $commonCode);
    }

    public function precision_from_string($string) {
        $parts = explode('.', preg_replace('/0+$/', '', $string));
        return (count($parts) > 1) ? strlen($parts[1]) : 0;
    }

    public function cost_to_precision($symbol, $cost) {
        return self::decimal_to_precision($cost, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function costToPrecision($symbol, $cost) {
        return $this->cost_to_precision($symbol, $cost);
    }

    public function price_to_precision($symbol, $price) {
        return self::decimal_to_precision($price, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function priceToPrecision($symbol, $price) {
        return $this->price_to_precision($symbol, $price);
    }

    public function amount_to_precision($symbol, $amount) {
        return self::decimal_to_precision($amount, TRUNCATE, $this->markets[$symbol]['precision']['amount'], $this->precisionMode);
    }

    public function amountToPrecision($symbol, $amount) {
        return $this->amount_to_precision($symbol, $amount);
    }

    public function fee_to_precision($symbol, $fee) {
        return self::decimalToPrecision($fee, ROUND, $this->markets[$symbol]['precision']['price'], $this->precisionMode);
    }

    public function feeToPrecision($symbol, $fee) {
        return $this->fee_to_precision($symbol, $fee);
    }

    public function currency_to_precision($currency, $fee) {
        return self::decimal_to_precision($fee, ROUND, $this->currencies[$currency]['precision'], $this->precisionMode);
    }

    public function currencyToPrecision($symbol, $fee) {
        return $this->currency_to_precision($symbol, $fee);
    }

    public function commonCurrencyCode($currency) {
        return $this->common_currency_code($currency);
    }

    public function currencyId($commonCode) {
        return $this->currency_id($commonCode);
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
        if ((gettype($symbol) === 'string') && isset($this->markets[$symbol])) {
            return $this->markets[$symbol];
        }

        throw new BadSymbol($this->id . ' does not have market symbol ' . $symbol);
    }

    public function market_ids($symbols) {
        return array_map(array($this, 'market_id'), $symbols);
    }

    public function marketIds($symbols) {
        return $this->market_ids($symbols);
    }

    public function market_id($symbol) {
        return (is_array($market = $this->market($symbol))) ? $market['id'] : $symbol;
    }

    public function marketId($symbol) {
        return $this->market_id($symbol);
    }

    public function __call($function, $params) {
        if (array_key_exists($function, $this->defined_rest_api)) {
            $partial = $this->defined_rest_api[$function];
            $entry = $partial[3];
            $partial[3] = $params ? $params[0] : $params;
            return call_user_func_array(array($this, $entry), $partial);
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

    public static function decimalToPrecision($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING) {
        return static::decimal_to_precision($x, $roundingMode, $numPrecisionDigits, $countingMode, $paddingMode);
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
        $number = $splitted[0];
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

    // ------------------------------------------------------------------------
    // web3 / 0x methods

    public static function has_web3() {
        // PHP version of this function does nothing, as most of its
        // dependencies are very lighweight and don't eat a lot
        return true;
    }

    public function check_required_dependencies() {
        if (!static::has_web3()) {
            throw new ExchangeError($this->id . ' requires web3 dependencies');
        }
    }

    public static function from_wei($amount, $decimals = 18) {
        $exponential = sprintf('%e', $amount);
        list($n, $exponent) = explode('e', $exponential);
        $new_exponent = intval($exponent) - $decimals;
        return floatval($n . 'e' . strval($new_exponent));
    }

    public static function to_wei($amount, $decimals = 18) {
        $exponential = sprintf('%e', $amount);
        list($n, $exponent) = explode('e', $exponential);
        $new_exponent = intval($exponent) + $decimals;
        return static::number_to_string(floatval($n . 'e' . strval($new_exponent)));
    }

    public function getZeroExOrderHash($order) {
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

        $unpacked = array(
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

    public function oath() {
        if ($this->twofa) {
            return $this->totp($this->twofa);
        } else {
            throw new ExchangeError($this->id . ' requires a non-empty value in $this->twofa property');
        }
    }

    public function soliditySha3 ($array) {
        return @call_user_func_array('\\kornrunner\Solidity::sha3', $array);
    }

    public static function totp($key) {
        function base32_decode($s) {
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
        $noSpaceKey = str_replace(' ', '', $key);
        $encodedKey = base32_decode($noSpaceKey);
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

    public static function pack_byte ($n) {
        return pack('C', $n);
    }

    public static function number_to_be($n, $padding) {
        $n = new BN ($n);
        return array_reduce(array_map('static::pack_byte', $n->toArray('little', $padding)), function ($a, $b) { return $a . $b; });
    }

    public static function number_to_le($n, $padding) {
        $n = new BN ($n);
        return array_reduce(array_map('static::pack_byte', $n->toArray('little', $padding)), function ($a, $b) { return $b . $a; });
    }

    public static function integer_divide($a, $b) {
        return (new BN ($a))->div (new BN ($b));
    }

    public static function integer_modulo($a, $b) {
        return (new BN ($a))->mod (new BN ($b));
    }

    public static function integer_pow($a, $b) {
        return (new BN ($a))->pow (new BN ($b));
    }
}
