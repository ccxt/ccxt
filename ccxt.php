<?php

namespace ccxt;

class CCXTError                  extends \Exception {}
class DDoSProtectionError        extends CCXTError {}
class TimeoutError               extends CCXTError {}
class AuthenticationError        extends CCXTError {}
class NotAvailableError          extends CCXTError {}
class MarketNotAvailableError    extends NotAvailableError {}
class EndpointNotAvailableError  extends NotAvailableError {}
class OrderBookNotAvailableError extends NotAvailableError {}
class TickerNotAvailableError    extends NotAvailableError {}

$version = '1.1.101';

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

class Market {

    public static $markets = array (
        '_1broker',
        '_1btcxe',
        'anxpro',
        'bit2c',
        'bitbay',
        'bitbays',
        'bitcoincoid',
        'bitfinex',
        'bitflyer',
        'bitlish',
        'bitmarket',
        'bitmex',
        'bitso',
        'bitstamp',
        'bittrex',
        'bl3p',
        'btcchina',
        'btce',
        'btcexchange',
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
        'coingi',
        'coinmarketcap',
        'coinmate',
        'coinsecure',
        'coinspot',
        'dsx',
        'exmo',
        'flowbtc',
        'foxbit',
        'fybse',
        'fybsg',
        'gatecoin',
        'gdax',
        'gemini',
        'hitbtc',
        'huobi',
        'itbit',
        'jubi',
        'kraken',
        'lakebtc',
        'livecoin',
        'liqui',
        'luno',
        'mercado',
        'okcoincny',
        'okcoinusd',
        'paymium',
        'poloniex',
        'quadrigacx',
        'quoine',
        'southxchange',
        'surbitcoin',
        'therock',
        'urdubit',
        'vaultoro',
        'vbtc',
        'virwox',
        'xbtce',
        'yobit',
        'yunbi',
        'zaif',
    );

    public static function split ($string, $delimiters = array (' ')) {
        return explode ($delimiters[0], str_replace ($delimiters, $delimiters[0], $string));
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
        return Market::index_by ($arrayOfArrays, $key);
    }

    public static function sortBy ($arrayOfArrays, $key, $descending = false) {
        return Market::sort_by ($arrayOfArrays, $key, $descending);
    }

    public static function sum () {
        return array_sum (array_filter (func_get_args (), function ($x) { return isset ($x) ? $x : 0; }));
    }
    
    public static function extractParams ($string) {
        return Market::extract_params ($string);
    }
    
    public static function implodeParams ($string, $params) {
        return Market::implode_params ($string, $params);
    }

    public static function urlencodeBase64 ($string) {
        return preg_replace (array ('#[=]+$#u', '#\+#u', '#\\/#'), array ('', '-', '_'), base64_encode ($string));
    }

    public static function urlencode ($string) {
        return http_build_query ($string);
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
        $t = mktime ($h, $m, $s, $mm, $dd, $yyyy, 0);
        $t += $hours * 3600 + $minutes * 60;
        $t *= 1000;
        return $t;
    }

    public static function yyyymmddhhmmss ($timestamp) {
        return gmdate ('YmdHis', (int) round ($timestamp / 1000));
    }

    public static function json ($input) {
        return json_encode ($input);
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
        $this->curl      = curl_init ();
        $this->id        = null;
        $this->rateLimit = 2000;
        $this->timeout   = 10000; // in milliseconds
        $this->proxy     = '';
        $this->products  = null;
        $this->verbose   = false;
        $this->apiKey    = '';
        $this->secret    = '';
        $this->password  = '';
        $this->uid       = '';
        $this->twofa     = false;
        $this->productsById = null;
        $this->products_by_id = null;

        if ($options)
            foreach ($options as $key => $value)
                $this->$key = $value;

        if ($this->api)
            foreach ($this->api as $type => $methods)
                foreach ($methods as $method => $paths)
                    foreach ($paths as $path) {

                        $splitPath = mb_split ('[^a-zA-Z0-9]', $path);
                        
                        $uppercaseMethod  = mb_strtoupper ($method);
                        $lowercaseMethod  = mb_strtolower ($method);
                        $camelcaseMethod  = Market::capitalize ($lowercaseMethod);
                        $camelcaseSuffix  = implode (array_map ('\ccxt\Market::capitalize', $splitPath));
                        $lowercasePath    = array_map ('trim', array_map ('strtolower', $splitPath));
                        $underscoreSuffix = implode ('_', array_filter ($lowercasePath));

                        if (mb_stripos ($camelcaseSuffix, $camelcaseMethod) === 0)
                            $camelcaseSuffix = mb_substr ($camelcaseSuffix, mb_strlen ($camelcaseMethod));

                        if (mb_stripos ($underscoreSuffix, $lowercaseMethod) === 0)
                            $underscoreSuffix = trim (mb_substr ($underscoreSuffix, mb_strlen ($lowercaseMethod)), '_');

                        $camelcase  = $type . $camelcaseMethod . Market::capitalize ($camelcaseSuffix);
                        $underscore = $type . '_' . $lowercaseMethod . '_' . mb_strtolower ($underscoreSuffix);
    
                        $f = function ($params = array ()) use ($path, $type, $uppercaseMethod) {
                            return $this->request ($path, $type, $uppercaseMethod, $params);
                        };

                        $this->$camelcase  = $f;
                        $this->$underscore = $f;
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

    // this is a special case workaround for Kraken, see issues #52 and #23
    public function signForKraken ($path, $request, $secret, $nonce) {
        $auth = $this->encode ($nonce . $request);
        $query = $this->encode ($path) . $this->hash ($auth, 'sha256', 'binary');
        $secret = base64_decode ($secret);
        $signature = $this->hmac ($query, $secret, 'sha512', 'base64');
        return $signature;
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

    public function fetch ($url, $method = 'GET', $headers = null, $body = null) {
        
        global $version;
        
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

        if ($this->verbose)
            var_dump ($url, $method, $headers, $body);

        curl_setopt ($this->curl, CURLOPT_URL, $url);

        if ($this->timeout) {
            $seconds = intval ($this->timeout / 1000);
            curl_setopt ($this->curl, CURLOPT_CONNECTTIMEOUT, $seconds); 
            curl_setopt ($this->curl, CURLOPT_TIMEOUT, $seconds);
        }

        curl_setopt ($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt ($this->curl, CURLOPT_SSL_VERIFYPEER, false);

        $userAgent = 'ccxt/' . $version . ' (+https://github.com/kroitor/ccxt) PHP/' . PHP_VERSION;
        curl_setopt ($this->curl, CURLOPT_USERAGENT, $userAgent);

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

        $result = curl_exec ($this->curl);

        if ($result === false) {
            
            $curl_errno = curl_errno ($this->curl);
            $curl_error = curl_error ($this->curl);

            if ($curl_errno == 28) // CURLE_OPERATION_TIMEDOUT
                $this->raise_error ('TimeoutError', $url, $method, $curl_errno, $curl_error);

            var_dump ($result);

            // all sorts of SSL problems, accessibility
            $this->raise_error ('MarketNotAvailableError', $url, $method, $curl_errno, $curl_error);
        }

        $http_status_code = curl_getinfo ($this->curl, CURLINFO_HTTP_CODE);

        if ($http_status_code == 429) {

            $this->raise_error ('DDoSProtectionError', $url, $method, 
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (500, 501, 502, 404))) {

            $this->raise_error ('MarketNotAvailableError', $url, $method, 
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (408, 504))) {

            $this->raise_error ('TimeoutError', $url, $method, 
                'not accessible from this location at the moment');
        }

        if (in_array ($http_status_code, array (401, 422, 511))) {

            $details = '(possible reasons: ' . implode (', ', array (
                'invalid API keys',
                'bad or old nonce',
                'market down or offline', 
                'on maintenance',
                'DDoS protection',
                'rate-limiting in effect',
            )) . ')';

            $this->raise_error ('AuthenticationError', $url, $method, 
                'check your API keys', $details);
        }

        if (in_array ($http_status_code, array (400, 403, 405, 503, 525))) {

            if (preg_match ('#cloudflare|incapsula#i', $result)) {
        
                $this->raise_error ('DDoSProtectionError', $url, $method, 
                    'not accessible from this location at the moment');
        
            } else {
        
                $details = '(possible reasons: ' . implode (', ', array (
                    'invalid API keys',
                    'bad or old nonce',
                    'market down or offline', 
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';
        
                $this->raise_error ('MarketNotAvailableError', $url, $method, 
                    'not accessible from this location at the moment', $details);
            }            
        }

        $decoded = json_decode ($result, $as_associative_array = true);
        
        if (!$decoded) {

            if (preg_match ('#offline|unavailable|busy|maintenance|maintenancing#i', $result)) {

                $details = '(possible reasons: ' . implode (', ', array (
                    'market down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';

                $this->raise_error ('MarketNotAvailableError', $url, $method, 
                    'not accessible from this location at the moment', $details);
            }

            if (preg_match ('#cloudflare|incapsula#i', $result)) {
                $this->raise_error ('DDoSProtectionError', $url, $method, 
                    'not accessible from this location at the moment');
            }
        }
        
        return $decoded;
    }

    public function set_products ($products) {
        $values = array_values ($products);
        $this->products = $this->indexBy ($values, 'symbol');
        $this->products_by_id = $this->indexBy ($values, 'id');
        $this->productsById = $this->products_by_id;
        $this->symbols = array_keys ($this->products);
        sort ($this->symbols);
        $base = $this->pluck (array_filter ($values, function ($product) { 
            return array_key_exists ('base', $product);
        }), 'base');
        $quote = $this->pluck (array_filter ($values, function ($product) {
            return array_key_exists ('quote', $product);
        }), 'quote');
        $this->currencies = $this->unique (array_merge ($base, $quote));
        sort ($this->currencies);
        return $this->products;
    }

    public function setProducts ($products) {
        return $this->set_products ($products);
    }

    public function loadProducts ($reload = false) {
        return $this->load_products ($reload);
    }

    public function load_products ($reload = false) {
        if (!$reload && $this->products) {
            if (!$this->products_by_id) {
                return $this->set_products ($this->products);
            }
            return $this->products;
        }
        $products = $this->fetch_products ();
        return $this->set_products ($products);
    }

    public function fetch_products () {
        return $this->products; // stub
    }
    
    public function fetchProducts  () {
        return $this->fetch_products ();
    }
    public function fetchBalance () {
        return $this->fetch_balance ();
    }
    
    public function fetchOrderBook ($product) {
        return $this->fetch_order_book ($product);
    }
    
    public function fetchTicker ($product) {
        return $this->fetch_ticker ($product);
    }
    
    public function fetchTrades ($product) {
        return $this->fetch_trades ($product);
    }

    public function create_limit_buy_order ($product, $amount, $price, $params = array ()) {
        return $this->create_order ($product, 'limit', 'buy',  $amount, $price, $params);
    }

    public function create_limit_sell_order ($product, $amount, $price, $params = array ()) {
        return $this->create_order ($product, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order ($product, $amount, $params = array ()) {
        return $this->create_order ($product, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order ($product, $amount, $params = array ()) {
        return $this->create_order ($product, 'market', 'sell', $amount, null, $params);
    }

    public function createLimitBuyOrder ($product, $amount, $price, $params = array ()) {
        return $this->create_limit_buy_order ($product, $amount, $price, $params);
    }

    public function createLimitSellOrder ($product, $amount, $price, $params = array ()) {
        return $this->create_limit_sell_order ($product, $amount, $price, $params);
    }

    public function createMarketBuyOrder ($product, $amount, $params = array ()) { 
        return $this->create_market_buy_order ($product, $amount, $params);
    }

    public function createMarketSellOrder ($product, $amount, $params = array ()) {
        return $this->create_market_sell_order ($product, $amount, $params);
    }

    public function commonCurrencyCode ($currency) { 
        return ($currency === 'XBT') ? 'BTC' : $currency;
    }

    public function product ($product) {
        return ((gettype ($product) === 'string') && 
                   isset ($this->products)        && 
                   isset ($this->products[$product])) ? 
                        $this->products[$product] : $product;
    }

    public function product_id ($product) {
        return (is_array ($product = $this->product ($product))) ? $product['id'] : $product;
    }

    public function productId ($product) {
        return $this->product_id ($product);
    }

    public function symbol ($product) {
        return (is_array ($product = $this->product ($product))) ? $product['symbol'] : $product;
    }

    public function request ($path, $type, $method, $params, $headers = null, $body = null) {
        /* stub */
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

//=============================================================================

class _1broker extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => '_1broker',
            'name' => '1Broker',
            'countries' => 'US',
            'rateLimit' => 1500,
            'version' => 'v2',
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
        $categories = $this->privateGetMarketCategories ();
        return $categories['response'];
    }

    public function fetch_products () {
        $this_ = $this; // workaround for Babel bug (not passing `this` to _recursive() call)
        $categories = $this->fetchCategories ();
        $result = array ();
        for ($c = 0; $c < count ($categories); $c++) {
            $category = $categories[$c];
            $products = $this_->privateGetMarketList (array (
                'category' => strtolower ($category),
            ));
            for ($p = 0; $p < count ($products['response']); $p++) {
                $product = $products['response'][$p];
                $id = $product['symbol'];
                $symbol = null;
                $base = null;
                $quote = null;
                if (($category == 'FOREX') || ($category == 'CRYPTO')) {
                    $symbol = $product['name'];
                    $parts = explode ('/', $symbol);
                    $base = $parts[0];
                    $quote = $parts[1];
                } else {
                    $base = $id;
                    $quote = 'USD';
                    $symbol = $base . '/' . $quote;
                }
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'info' => $product,
                );
            }
        }
        return $result;
    }

    public function fetch_balance () {
        $balance = $this->privateGetUserOverview ();
        $response = $balance['response'];
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $result[$currency] = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
        }
        $result['BTC']['free'] = floatval ($response['balance']);
        $result['BTC']['total'] = $result['BTC']['free'];
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->privateGetMarketQuotes (array (
            'symbols' => $this->product_id ($product),
        ));
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

    public function fetch_ticker ($product) {
        $result = $this->privateGetMarketBars (array (
            'symbol' => $this->product_id ($product),
            'resolution' => 60,
            'limit' => 1,
        ));
        $orderbook = $this->fetchOrderBook ($product);
        $ticker = $result['response'][0];
        $timestamp = $this->parse8601 ($ticker['date']);
        return array (
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

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'symbol' => $this->product_id ($product),
            'margin' => $amount,
            'direction' => ($side == 'sell') ? 'short' : 'long',
            'leverage' => 1,
            'type' => $side,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['type'] .= '_market';
        return $this->privateGetOrderCreate (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrderCancel (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests');
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path . '.php';
        $query = array_merge (array ( 'token' => $this->apiKey ), $params);
        $url .= '?' . $this->urlencode ($query);
        return $this->fetch ($url, $method);        
    }
}

//-----------------------------------------------------------------------------

class cryptocapital extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'cryptocapital',
            'name' => 'Crypto Capital',
            'comment' => 'Crypto Capital API',
            'countries' => 'PA', // Panama
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
            'products' => array (
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostBalancesAndInfo ();
        $balance = $response['balances-and-info'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance['available']))
                $account['free'] = floatval ($balance['available'][$currency]);
            if (array_key_exists ($currency, $balance['on_hold']))
                $account['used'] = floatval ($balance['on_hold'][$currency]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderBook (array (
            'currency' => $this->product_id ($product),
        ));
        $orderbook = $response['order-book'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'bid', 'asks' => 'ask' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $timestamp = intval ($order['timestamp']) * 1000;
                $price = floatval ($order['price']);
                $amount = floatval ($order['order_amount']);
                $result[$key][] = array ($price, $amount, $timestamp);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetStats (array (
            'currency' => $this->product_id ($product),
        ));
        $ticker = $response['stats'];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTransactions (array (
            'currency' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'side' => $side,
            'type' => $type,
            'currency' => $this->product_id ($product),
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limit_price'] = $price;
        return $this->privatePostOrdersNew (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrdersCancel (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'cryptocapital')
            throw new \Exception ($this->id . ' is an abstract base API for _1btcxe');
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class _1btcxe extends cryptocapital {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => '_1btcxe',
            'name' => '1BTCXE',
            'countries' => 'PA', // Panama
            'comment' => 'Crypto Capital API',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api' => 'https://1btcxe.com/api',
                'www' => 'https://1btcxe.com',
                'doc' => 'https://1btcxe.com/api-docs.php',
            ),
            'products' => array (
                'BTC/USD' => array ( 'id' => 'USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', ),
                'BTC/EUR' => array ( 'id' => 'EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR', ),
                'BTC/CNY' => array ( 'id' => 'CNY', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', ),
                'BTC/RUB' => array ( 'id' => 'RUB', 'symbol' => 'BTC/RUB', 'base' => 'BTC', 'quote' => 'RUB', ),
                'BTC/CHF' => array ( 'id' => 'CHF', 'symbol' => 'BTC/CHF', 'base' => 'BTC', 'quote' => 'CHF', ),
                'BTC/JPY' => array ( 'id' => 'JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY', ),
                'BTC/GBP' => array ( 'id' => 'GBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP', ),
                'BTC/CAD' => array ( 'id' => 'CAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD', ),
                'BTC/AUD' => array ( 'id' => 'AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD', ),
                'BTC/AED' => array ( 'id' => 'AED', 'symbol' => 'BTC/AED', 'base' => 'BTC', 'quote' => 'AED', ),
                'BTC/BGN' => array ( 'id' => 'BGN', 'symbol' => 'BTC/BGN', 'base' => 'BTC', 'quote' => 'BGN', ),
                'BTC/CZK' => array ( 'id' => 'CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK', ),
                'BTC/DKK' => array ( 'id' => 'DKK', 'symbol' => 'BTC/DKK', 'base' => 'BTC', 'quote' => 'DKK', ),
                'BTC/HKD' => array ( 'id' => 'HKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD', ),
                'BTC/HRK' => array ( 'id' => 'HRK', 'symbol' => 'BTC/HRK', 'base' => 'BTC', 'quote' => 'HRK', ),
                'BTC/HUF' => array ( 'id' => 'HUF', 'symbol' => 'BTC/HUF', 'base' => 'BTC', 'quote' => 'HUF', ),
                'BTC/ILS' => array ( 'id' => 'ILS', 'symbol' => 'BTC/ILS', 'base' => 'BTC', 'quote' => 'ILS', ),
                'BTC/INR' => array ( 'id' => 'INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR', ),
                'BTC/MUR' => array ( 'id' => 'MUR', 'symbol' => 'BTC/MUR', 'base' => 'BTC', 'quote' => 'MUR', ),
                'BTC/MXN' => array ( 'id' => 'MXN', 'symbol' => 'BTC/MXN', 'base' => 'BTC', 'quote' => 'MXN', ),
                'BTC/NOK' => array ( 'id' => 'NOK', 'symbol' => 'BTC/NOK', 'base' => 'BTC', 'quote' => 'NOK', ),
                'BTC/NZD' => array ( 'id' => 'NZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD', ),
                'BTC/PLN' => array ( 'id' => 'PLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN', ),
                'BTC/RON' => array ( 'id' => 'RON', 'symbol' => 'BTC/RON', 'base' => 'BTC', 'quote' => 'RON', ),
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK', ),
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD', ),
                'BTC/THB' => array ( 'id' => 'THB', 'symbol' => 'BTC/THB', 'base' => 'BTC', 'quote' => 'THB', ),
                'BTC/TRY' => array ( 'id' => 'TRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY', ),
                'BTC/ZAR' => array ( 'id' => 'ZAR', 'symbol' => 'BTC/ZAR', 'base' => 'BTC', 'quote' => 'ZAR', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class anxpro extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'anxpro',
            'name' => 'ANXPro',
            'countries' => array ( 'JP', 'SG', 'HK', 'NZ', ),
            'version' => '2',
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api' => 'https://anxpro.com/api',
                'www' => 'https://anxpro.com',
                'doc' => 'https://anxpro.com/pages/api',
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
            'products' => array (
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

    public function fetch_balance () {
        $response = $this->privatePostMoneyInfo ();
        $balance = $response['data'];
        $currencies = array_keys ($balance['Wallets']);
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance['Wallets'])) {
                $wallet = $balance['Wallets'][$currency];
                $account['free'] = floatval ($wallet['Available_Balance']['value']);
                $account['total'] = floatval ($wallet['Balance']['value']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetCurrencyPairMoneyDepthFull (array (
            'currency_pair' => $this->product_id ($product),
        ));
        $orderbook = $response['data'];
        $t = intval ($orderbook['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['amount']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetCurrencyPairMoneyTicker (array (
            'currency_pair' => $this->product_id ($product),
        ));
        $ticker = $response['data'];
        $t = intval ($ticker['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']['value']),
            'low' => floatval ($ticker['low']['value']),
            'bid' => floatval ($ticker['buy']['value']),
            'ask' => floatval ($ticker['sell']['value']),
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

    public function fetch_trades ($product) {
        $error = $this->id . ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled';
        throw new EndpointNotAvailableError ($error);
        return $this->publicGetCurrencyPairMoneyTradeFetch (array (
            'currency_pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'currency_pair' => $this->product_id ($product),
            'amount_int' => $amount,
            'type' => $side,
        );
        if ($type == 'limit')
            $order['price_int'] = $price;
        return $this->privatePostCurrencyPairOrderAdd (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCurrencyPairOrderCancel (array ( 'oid' => $id ));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $query));
            $secret = base64_decode ($this->secret);
            $auth = $request . "\0" . $body;
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Rest-Key' => $this->apiKey,
                'Rest-Sign' => $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bit2c extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bit2c',
            'name' => 'Bit2C',
            'countries' => 'IL', // Israel
            'rateLimit' => 3000,
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
            'products' => array (
                'BTC/NIS' => array ( 'id' => 'BtcNis', 'symbol' => 'BTC/NIS', 'base' => 'BTC', 'quote' => 'NIS' ),
                'LTC/BTC' => array ( 'id' => 'LtcBtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LTC/NIS' => array ( 'id' => 'LtcNis', 'symbol' => 'LTC/NIS', 'base' => 'LTC', 'quote' => 'NIS' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $balance = $this->privatePostAccountBalanceV2 ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance)) {
                $available = 'AVAILABLE_' . $currency;
                $account['free'] = $balance[$available];
                $account['total'] = $balance[$currency];
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetExchangesPairOrderbook (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order[0];
                $amount = $order[1];
                $timestamp = $order[2] * 1000;
                $result[$side][] = array ($price, $amount, $timestamp);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetExchangesPairTicker (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['h']),
            'low' => floatval ($ticker['l']),
            'bid' => null,
            'ask' => null,
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

    public function fetch_trades ($product) {
        return $this->publicGetExchangesPairTrades (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePostOrderAddOrder';
        $order = array (
            'Amount' => $amount,
            'Pair' => $this->product_id ($product),
        );
        if ($type == 'market') {
            $method .= 'MarketPrice' . $this->capitalize ($side);
        } else {
            $order['Price'] = $price;
            $order['Total'] = $amount * $price;
            $order['IsBid'] = ($side == 'buy');
        }
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrderCancelOrder (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        if ($type == 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ( 'nonce' => $nonce ), $params);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'key' => $this->apiKey,
                'sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512', 'base64'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitbay extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitbay',
            'name' => 'BitBay',
            'countries' => array ( 'PL', 'EU', ), // Poland
            'rateLimit' => 1000,
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
            'products' => array (
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

    public function fetch_balance () {
        $response = $this->privatePostInfo ();
        $balance = $response['balances'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance)) {
                $account['free'] = floatval ($balance[$currency]['available']);
                $account['used'] = floatval ($balance[$currency]['locked']);
                $account['total'] = $this->sum ($account['free'], $account['used']);
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetIdOrderbook (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetIdTicker (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetIdTrades (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        return $this->privatePostTrade (array_merge (array (
            'type' => $side,
            'currency' => $p['base'],
            'amount' => $amount,
            'payment_currency' => $p['quote'],
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type == 'public') {
            $url .= '/' . $this->implode_params ($path, $params) . '.json';
        } else {
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'moment' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'API-Key' => $this->apiKey,
                'API-Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitbays extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitbays',
            'name' => 'BitBays',
            'countries' => array ( 'CN', 'GB', 'HK', 'AU', 'CA' ),
            'rateLimit' => 1500,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27808599-983687d2-6051-11e7-8d95-80dfcbe5cbb4.jpg',
                'api' => 'https://bitbays.com/api',
                'www' => 'https://bitbays.com',
                'doc' => 'https://bitbays.com/help/api/',
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
            'products' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'ODS/BTC' => array ( 'id' => 'ods_btc', 'symbol' => 'ODS/BTC', 'base' => 'ODS', 'quote' => 'BTC' ),
                'LSK/BTC' => array ( 'id' => 'lsk_btc', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
                'LSK/CNY' => array ( 'id' => 'lsk_cny', 'symbol' => 'LSK/CNY', 'base' => 'LSK', 'quote' => 'CNY' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostInfo ();
        $balance = $response['result']['wallet'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($lowercase, $balance)) {
                $account['free'] = floatval ($balance[$lowercase]['avail']);
                $account['used'] = floatval ($balance[$lowercase]['lock']);
                $account['total'] = $this->sum ($account['free'], $account['used']);
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetDepth (array (
            'market' => $this->product_id ($product),
        ));
        $orderbook = $response['result'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker (array (
            'market' => $this->product_id ($product),
        ));
        $ticker = $response['result'];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'market' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'market' => $this->product_id ($product),
            'op' => $side,
            'amount' => $amount,
        );
        if ($type == 'market') {
            $order['order_type'] = 1;
            $order['price'] = $price;
        } else {
            $order['order_type'] = 0;
        }
        return $this->privatePostTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitcoincoid extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitcoincoid',
            'name' => 'Bitcoin.co.id',
            'countries' => 'ID', // Indonesia
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
            'products' => array (
                'BTC/IDR' =>  array ( 'id' => 'btc_idr', 'symbol' => 'BTC/IDR', 'base' => 'BTC', 'quote' => 'IDR', 'baseId' => 'btc', 'quoteId' => 'idr' ),
                'BTS/BTC' =>  array ( 'id' => 'bts_btc', 'symbol' => 'BTS/BTC', 'base' => 'BTS', 'quote' => 'BTC', 'baseId' => 'bts', 'quoteId' => 'btc' ),
                'DASH/BTC' => array ( 'id' => 'drk_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC', 'baseId' => 'drk', 'quoteId' => 'btc' ),
                'DOGE/BTC' => array ( 'id' => 'doge_btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC', 'baseId' => 'doge', 'quoteId' => 'btc' ),
                'ETH/BTC' =>  array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'baseId' => 'eth', 'quoteId' => 'btc' ),
                'LTC/BTC' =>  array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'baseId' => 'ltc', 'quoteId' => 'btc' ),
                'NXT/BTC' =>  array ( 'id' => 'nxt_btc', 'symbol' => 'NXT/BTC', 'base' => 'NXT', 'quote' => 'BTC', 'baseId' => 'nxt', 'quoteId' => 'btc' ),
                'STR/BTC' =>  array ( 'id' => 'str_btc', 'symbol' => 'STR/BTC', 'base' => 'STR', 'quote' => 'BTC', 'baseId' => 'str', 'quoteId' => 'btc' ),
                'NEM/BTC' =>  array ( 'id' => 'nem_btc', 'symbol' => 'NEM/BTC', 'base' => 'NEM', 'quote' => 'BTC', 'baseId' => 'nem', 'quoteId' => 'btc' ),
                'XRP/BTC' =>  array ( 'id' => 'xrp_btc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC', 'baseId' => 'xrp', 'quoteId' => 'btc' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostGetInfo ();
        $balance = $response['return']['balance'];
        $frozen = $response['return']['balance_hold'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($lowercase, $balance)) {
                $account['free'] = floatval ($balance[$lowercase]);
            }
            if (array_key_exists ($lowercase, $frozen)) {
                $account['used'] = floatval ($frozen[$lowercase]);
            }
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetPairDepth (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buy', 'asks' => 'sell' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $pair = $this->product ($product);
        $response = $this->publicGetPairTicker (array (
            'pair' => $pair['id'],
        ));
        $ticker = $response['ticker'];
        $timestamp = floatval ($ticker['server_time']) * 1000;
        $baseVolume = 'vol_' . strtolower ($pair['baseId']);
        $quoteVolume = 'vol_' . strtolower ($pair['quoteId']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetPairTrades (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $order = array (
            'pair' => $p['id'],
            'type' => $side,
            'price' => $price,
        );
        $base = strtolower ($p['base']);
        $order[$base] = $amount;
        return $this->privatePostTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type == 'public') {
            $url .= '/' . $this->implode_params ($path, $params);
        } else {
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitfinex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitfinex',
            'name' => 'Bitfinex',
            'countries' => 'US',
            'version' => 'v1',
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'doc' => array (
                    'https://bitfinex.readme.io/v1/docs',
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'book/{symbol}',
                        'candles/{symbol}',
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
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
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

    public function fetch_products () {
        $products = $this->publicGetSymbolsDetails ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = strtoupper ($product['pair']);
            $baseId = mb_substr ($id, 0, 3);
            $quoteId = mb_substr ($id, 3, 6);
            $base = $baseId;
            $quote = $quoteId;
            // issue #4 Bitfinex names Dash as DSH, instead of DASH
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privatePostBalances ();
        $balances = array ();
        for ($b = 0; $b < count ($response); $b++) {
            $account = $response[$b];
            if ($account['type'] == 'exchange') {
                $currency = $account['currency'];
                // issue #4 Bitfinex names Dash as DSH, instead of DASH
                if ($currency == 'DSH')
                    $currency = 'DASH';
                $uppercase = strtoupper ($currency);
                $balances[$uppercase] = $account;
            }
        }
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balances)) {
                $account['free'] = floatval ($balances[$currency]['available']);
                $account['total'] = floatval ($balances[$currency]['amount']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetBookSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['amount']);
                $timestamp = intval (floatval ($order['timestamp']));
                $result[$side][] = array ($price, $amount, $timestamp);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetPubtickerSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = floatval ($ticker['timestamp']) * 1000;
        return array (
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
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradesSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'symbol' => $this->product_id ($product),
            'amount' => (string) $amount,
            'side' => $side,
            'type' => 'exchange ' . $type,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        );
        if ($type == 'market') {
            $order['price'] = (string) $this->nonce ();
        } else {
            $order['price'] = $price;
        }
        return $this->privatePostOrderNew (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrderCancel (array ( 'order_id' => $id ));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . $request;
        if ($type == 'public') {
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
            $headers = array (
                'X-BFX-APIKEY' => $this->apiKey,
                'X-BFX-PAYLOAD' => $payload,
                'X-BFX-SIGNATURE' => $this->hmac ($payload, $secret, 'sha384'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitflyer extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitflyer',
            'name' => 'bitFlyer',
            'countries' => 'JP',
            'version' => 'v1',
            'rateLimit' => 500,
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

    public function fetch_products () {
        $products = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['product_code'];
            $currencies = explode ('_', $id);
            $base = null;
            $quote = null;
            $symbol = $id;
            $numCurrencies = count ($currencies);
            if ($numCurrencies == 2) {
                $base = $currencies[0];
                $quote = $currencies[1];
                $symbol = $base . '/' . $quote;
            }
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
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
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balances)) {
                $account['total'] = $balances[$currency]['amount'];
                $account['free'] = $balances[$currency]['available'];                
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetBoard (array (
            'product_code' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['size']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker (array (
            'product_code' => $this->product_id ($product),
        ));
        $timestamp = $this->parse8601 ($ticker['timestamp']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetExecutions (array (
            'product_code' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'product_code' => $this->product_id ($product),
            'child_order_type' => strtoupper ($type),
            'side' => strtoupper ($side),
            'price' => $price,
            'size' => $amount,
        );
        return $this->privatePostSendparentorder (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelparentorder (array_merge (array (
            'parent_order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->version . '/' . $path;
        if ($type == 'private')
            $request = '/me' . $request;
        $url = $this->urls['api'] . $request;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->json ($params);
            $auth = implode ('', array ($nonce, $method, $request, $body));
            $headers = array (
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-TIMESTAMP' => $nonce,
                'ACCESS-SIGN' => $this->hmac ($this->encode ($auth), $this->secret),
                'Content-Type' => 'application/json',
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitlish extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitlish',
            'name' => 'bitlish',
            'countries' => array ( 'GB', 'EU', 'RU', ),
            'rateLimit' => 1500,
            'version' => 'v1',
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

    public function fetch_products () {
        $products = $this->publicGetPairs ();
        $result = array ();
        $keys = array_keys ($products);
        for ($p = 0; $p < count ($keys); $p++) {
            $product = $products[$keys[$p]];
            $id = $product['id'];
            $symbol = $product['name'];
            list ($base, $quote) = explode ('/', $symbol);
            // issue #4 bitlish names Dash as DSH, instead of DASH
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->publicGetTickers ();
        $ticker = $tickers[$p['id']];
        $timestamp = $this->milliseconds ();
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['max']),
            'low' => floatval ($ticker['min']),
            'bid' => null,
            'ask' => null,
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

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetTradesDepth (array (
            'pair_id' => $this->product_id ($product),
        ));
        $timestamp = intval (intval ($orderbook['last']) / 1000);
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'bid', 'asks' => 'ask' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['volume']);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradesHistory (array (
            'pair_id' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
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
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance)) {
                $account['free'] = floatval ($balance[$currency]['funds']);
                $account['used'] = floatval ($balance[$currency]['holded']);                
                $account['total'] = $this->sum ($account['free'], $account['used']);
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function sign_in () {
        return $this->privatePostSignin (array (
            'login' => $this->login,
            'passwd' => $this->password,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'pair_id' => $this->product_id ($product),
            'dir' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostCreateTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelTrade (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $body = $this->json (array_merge (array ( 'token' => $this->apiKey ), $params));
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitmarket extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitmarket',
            'name' => 'BitMarket',
            'countries' => array ( 'PL', 'EU', ),
            'rateLimit' => 1500,
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
            'products' => array (
                'BTC/PLN' => array ( 'id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ( 'id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LiteMineX/BTC' => array ( 'id' => 'LiteMineXBTC', 'symbol' => 'LiteMineX/BTC', 'base' => 'LiteMineX', 'quote' => 'BTC' ),
                'PlnX/BTC' => array ( 'id' => 'PlnxBTC', 'symbol' => 'PlnX/BTC', 'base' => 'PlnX', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostInfo ();
        $data = $response['data'];
        $balance = $data['balances'];
        $result = array ( 'info' => $data );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balance['available']))
                $account['free'] = $balance['available'][$currency];
            if (array_key_exists ($currency, $balance['blocked']))
                $account['used'] = $balance['blocked'][$currency];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetJsonMarketOrderbook (array (
            'market' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;

    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetJsonMarketTicker (array (
            'market' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetJsonMarketTrades (array (
            'market' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTrade (array_merge (array (
            'market' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitmex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitmex',
            'name' => 'BitMEX',
            'countries' => 'SC', // Seychelles
            'version' => 'v1',
            'rateLimit' => 1500,
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

    public function fetch_products () {
        $products = $this->publicGetInstrumentActive ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['symbol'];
            $base = $product['underlying'];
            $quote = $product['quoteCurrency'];
            $isFuturesContract = $id != ($base . $quote);
            $base = $this->commonCurrencyCode ($base);
            $quote = $this->commonCurrencyCode ($quote);
            $symbol = $isFuturesContract ? $id : ($base . '/' . $quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privateGetUserMargin (array ( 'currency' => 'all' ));
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($response); $b++) {
            $balance = $response[$b];
            $currency = strtoupper ($balance['currency']);
            $currency = $this->commonCurrencyCode ($currency);
            $account = array (
                'free' => $balance['availableMargin'],
                'used' => null,
                'total' => $balance['amount'],
            );
            if ($currency == 'BTC') {
                $account['free'] = $account['free'] * 0.00000001;
                $account['total'] = $account['total'] * 0.00000001;
            }
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderBookL2 (array (
            'symbol' => $this->product_id ($product),
        ));
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

    public function fetch_ticker ($product) {
        $request = array (
            'symbol' => $this->product_id ($product),
            'binSize' => '1d',
            'partial' => true,
            'count' => 1,
            'reverse' => true,
        );
        $quotes = $this->publicGetQuoteBucketed ($request);
        $quotesLength = count ($quotes);
        $quote = $quotes[$quotesLength - 1];
        $tickers = $this->publicGetTradeBucketed ($request);
        $ticker = $tickers[0];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrade (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'symbol' => $this->product_id ($product),
            'side' => $this->capitalize ($side),
            'orderQty' => $amount,
            'ordType' => $this->capitalize ($type),
        );
        if ($type == 'limit')
            $order['rate'] = $price;
        return $this->privatePostOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privateDeleteOrder (array ( 'orderID' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/api/' . $this->version . '/' . $path;
        if ($params)
            $query .= '?' . $this->urlencode ($params);
        $url = $this->urls['api'] . $query;
        if ($type == 'private') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitso extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitso',
            'name' => 'Bitso',
            'countries' => 'MX', // Mexico
            'rateLimit' => 2000, // 30 requests per minute
            'version' => 'v3',
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

    public function fetch_products () {
        $products = $this->publicGetAvailableBooks ();
        $result = array ();
        for ($p = 0; $p < count ($products['payload']); $p++) {
            $product = $products['payload'][$p];
            $id = $product['book'];
            $symbol = str_replace ('_', '/', strtoupper ($id));
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
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
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderBook (array (
            'book' => $this->product_id ($product),
        ));
        $orderbook = $response['payload'];
        $timestamp = $this->parse8601 ($orderbook['updated_at']);
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['amount']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker (array (
            'book' => $this->product_id ($product),
        ));
        $ticker = $response['payload'];
        $timestamp = $this->parse8601 ($ticker['created_at']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'book' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'book' => $this->product_id ($product),
            'side' => $side,
            'type' => $type,
            'major' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privateDeleteOrders (array ( 'oid' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $query;
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bitstamp extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitstamp',
            'name' => 'Bitstamp',
            'countries' => 'GB',
            'rateLimit' => 1000,
            'version' => 'v2',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api' => 'https://www.bitstamp.net/api',
                'www' => 'https://www.bitstamp.net',
                'doc' => 'https://www.bitstamp.net/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'order_book/{id}/',
                        'ticker_hour/{id}/',
                        'ticker/{id}/',
                        'transactions/{id}/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance/',
                        'balance/{id}/',
                        'buy/{id}/',
                        'buy/market/{id}/',
                        'cancel_order/',
                        'liquidation_address/info/',
                        'liquidation_address/new/',
                        'open_orders/all/',
                        'open_orders/{id}/',
                        'sell/{id}/',
                        'sell/market/{id}/',
                        'transfer-from-main/',
                        'transfer-to-main/',
                        'user_transactions/',
                        'user_transactions/{id}/',
                        'withdrawal/cancel/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'xrp_address/',
                        'xrp_withdrawal/',
                    ),
                ),
            ),
            'products' => array (
                'BTC/USD' => array ( 'id' => 'btcusd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'btceur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'EUR/USD' => array ( 'id' => 'eurusd', 'symbol' => 'EUR/USD', 'base' => 'EUR', 'quote' => 'USD' ),
                'XRP/USD' => array ( 'id' => 'xrpusd', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD' ),
                'XRP/EUR' => array ( 'id' => 'xrpeur', 'symbol' => 'XRP/EUR', 'base' => 'XRP', 'quote' => 'EUR' ),
                'XRP/BTC' => array ( 'id' => 'xrpbtc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'LTC/USD' => array ( 'id' => 'ltcusd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ( 'id' => 'ltceur', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/BTC' => array ( 'id' => 'ltcbtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderBookId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTickerId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTransactionsId (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
        $balance = $this->privatePostBalance ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $total = $lowercase . '_balance';
            $free = $lowercase . '_available';
            $used = $lowercase . '_reserved';
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($free, $balance))
                $account['free'] = floatval ($balance[$free]);
            if (array_key_exists ($used, $balance))
                $account['used'] = floatval ($balance[$used]);
            if (array_key_exists ($total, $balance))
                $account['total'] = floatval ($balance[$total]);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'id' => $this->product_id ($product),
            'amount' => $amount,
        );
        if ($type == 'market')
            $method .= 'Market';
        else
            $order['price'] = $price;
        $method .= 'Id';
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $query = array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bittrex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bittrex',
            'name' => 'Bittrex',
            'countries' => 'US',
            'version' => 'v1.1',
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api' => 'https://bittrex.com/api',
                'www' => 'https://bittrex.com',
                'doc' => array (
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ),
            ),
            'api' => array (
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
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($products['result']); $p++) {
            $product = $products['result'][$p];
            $id = $product['MarketName'];
            $base = $product['MarketCurrency'];
            $quote = $product['BaseCurrency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->accountGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $indexed = $this->index_by ($balances, 'Currency');
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $indexed)) {
                $balance = $indexed[$currency];
                $account['free'] = $balance['Available'];
                $account['used'] = $balance['Pending'];
                $account['total'] = $balance['Balance'];
            }
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderbook (array (
            'market' => $this->product_id ($product),
            'type' => 'both',
            'depth' => 50,
        ));
        $orderbook = $response['result'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buy', 'asks' => 'sell' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['Rate']);
                $amount = floatval ($order['Quantity']);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetMarketsummary (array (
            'market' => $this->product_id ($product),
        ));
        $ticker = $response['result'][0];
        $timestamp = $this->parse8601 ($ticker['TimeStamp']);
        return array (
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
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['Volume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetMarkethistory (array (
            'market' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'marketGet' . $this->capitalize ($side) . $type;
        $order = array (
            'market' => $this->product_id ($product),
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['rate'] = $price;
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->marketGetCancel (array ( 'uuid' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/';
        if ($type == 'public') {
            $url .= $type . '/' . strtolower ($method) . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $url .= $type . '/';
            if ((($type == 'account') && ($path != 'withdraw')) || ($path == 'openorders'))
                $url .= strtolower ($method);
            $url .= $path . '?' . $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), $params));
            $signature = $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512');
            $headers = array ( 'apisign' => $signature );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class blinktrade extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
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
            'products' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin', ),
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC', ),
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit', ),
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit', ),
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit', ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostU2 (array (
            'BalanceReqID' => $this->nonce (),
        ));
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->publicGetCurrencyOrderbook (array (
            'currency' => $p['quote'],
            'crypto_currency' => $p['base'],
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $ticker = $this->publicGetCurrencyTicker (array (
            'currency' => $p['quote'],
            'crypto_currency' => $p['base'],
        ));
        $timestamp = $this->milliseconds ();
        $lowercaseQuote = strtolower ($p['quote']);
        $quoteVolume = 'vol_' . $lowercaseQuote;
        return array (
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

    public function fetch_trades ($product) {
        $p = $this->product ($product);
        return $this->publicGetCurrencyTrades (array (
            'currency' => $p['quote'],
            'crypto_currency' => $p['base'],
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $p = $this->product ($product);
        $order = array (
            'ClOrdID' => $this->nonce (),
            'Symbol' => $p['id'],
            'Side' => $this->capitalize ($side),
            'OrdType' => 2,
            'Price' => $price,
            'OrderQty' => $amount,
            'BrokerID' => $p['brokerId'],
        );
        return $this->privatePostD (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostF (array_merge (array (
            'ClOrdID' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bl3p extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bl3p',
            'name' => 'BL3P',
            'countries' => array ( 'NL', 'EU' ), // Netherlands, EU
            'rateLimit' => 1000,
            'version' => '1',
            'comment' => 'An exchange market by BitonicNL',
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
            'products' => array (
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'LTC/EUR' => array ( 'id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostGENMKTMoneyInfo ();
        $data = $response['data'];
        $balance = $data['wallets'];
        $result = array ( 'info' => $data );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
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
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->publicGetMarketOrderbook (array (
            'market' => $p['id'],
        ));
        $orderbook = $response['data'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['price_int'] / 100000;
                $amount = $order['amount_int'] / 100000000;
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetMarketTicker (array (
            'market' => $this->product_id ($product),
        ));        
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetMarketTrades (array (
            'market' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $order = array (
            'market' => $p['id'],
            'amount_int' => $amount,
            'fee_currency' => $p['quote'],
            'type' => ($side == 'buy') ? 'bid' : 'ask',
        );
        if ($type == 'limit')
            $order['price_int'] = $price;
        return $this->privatePostMarketMoneyOrderAdd (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostMarketMoneyOrderCancel (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params ($path, $params);
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
                'Rest-Key' => $this->apiKey,
                'Rest-Sign' => $signature,
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btcchina extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btcchina',
            'name' => 'BTCChina',
            'countries' => 'CN',
            'rateLimit' => 1500,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
                'api' => array (
                    'public' => 'https://data.btcchina.com/data',
                    'private' => 'https://api.btcchina.com/api_trade_v1.php',
                ),
                'www' => 'https://www.btcchina.com',
                'doc' => 'https://www.btcchina.com/apidocs'
            ),
            'api' => array (
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
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetTicker (array (
            'market' => 'all',
        ));
        $result = array ();
        $keys = array_keys ($products);
        for ($p = 0; $p < count ($keys); $p++) {
            $key = $keys[$p];
            $product = $products[$key];
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
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );

        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($lowercase, $balances['balance']))
                $account['total'] = floatval ($balances['balance'][$lowercase]['amount']);
            if (array_key_exists ($lowercase, $balances['frozen']))
                $account['used'] = floatval ($balances['frozen'][$lowercase]['amount']);
            $account['free'] = $account['total'] - $account['used'];
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderbook (array (
            'market' => $this->product_id ($product),
        ));
        $timestamp = $orderbook['date'] * 1000;;
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->publicGetTicker (array (
            'market' => $p['id'],
        ));
        $ticker = $tickers['ticker'];
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
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'market' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $method = 'privatePost' . $this->capitalize ($side) . 'Order2';
        $order = array ();
        $id = strtoupper ($p['id']);
        if ($type == 'market') {
            $order['params'] = array (null, $amount, $id);
        } else {
            $order['params'] = array ($price, $amount, $id);
        }
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        $market = $params['market']; // TODO fixme
        return $this->privatePostCancelOrder (array_merge (array (
            'params' => array ($id, $market), 
        ), $params));
    }

    public function nonce () {
        return $this->microseconds ();
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type] . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
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
                'Content-Length' => strlen ($body),
                'Authorization' => 'Basic ' . base64_encode ($auth),
                'Json-Rpc-Tonce' => $nonce,
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btce extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btce',
            'name' => 'BTC-e',
            'countries' => array ( 'BG', 'RU' ), // Bulgaria, Russia
            'version' => '3',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27843225-1b571514-611a-11e7-9208-2641a560b561.jpg',
                'api' => array (
                    'public' => 'https://btc-e.com/api',
                    'private' => 'https://btc-e.com/tapi',
                ),
                'www' => 'https://btc-e.com',
                'doc' => array (
                    'https://btc-e.com/api/3/docs',
                    'https://btc-e.com/tapi/docs',
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

    public function fetch_products () {
        $response = $this->publicGetInfo ();
        $products = $response['pairs'];
        $keys = array_keys ($products);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products[$id];
            list ($base, $quote) = explode ('_', $id);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $funds = $balances['funds'];
        $currencies = array_keys ($funds);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            // they misspell DASH as dsh :/
            if ($uppercase == 'DSH')
                $uppercase = 'DASH';
            $account = array (
                'free' => $funds[$currency],
                'used' => null,
                'total' => $funds[$currency],
            );
            $result[$uppercase] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->publicGetDepthPair (array (
            'pair' => $p['id'],
        ));
        if (array_key_exists ($p['id'], $response)) {
            $orderbook = $response[$p['id']];
            $timestamp = $this->milliseconds ();
            $result = array (
                'bids' => $orderbook['bids'],
                'asks' => $orderbook['asks'],
                'timestamp' => $timestamp,
                'datetime' => $this->iso8601 ($timestamp),
            );
            $result['bids'] = $this->sort_by ($result['bids'], 0, true);
            $result['asks'] = $this->sort_by ($result['asks'], 0);
            return $result;
        }
        throw new OrderBookNotAvailableError ($this->id . ' ' . $p['symbol'] . ' order book not available');
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->publicGetTickerPair (array (
            'pair' => $p['id'],
        ));
        $ticker = $tickers[$p['id']];
        $timestamp = $ticker['updated'] * 1000;
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'] ? $ticker['high'] : null,
            'low' => $ticker['low'] ? $ticker['low'] : null,
            'bid' => $ticker['sell'] ? $ticker['sell'] : null,
            'ask' => $ticker['buy'] ? $ticker['buy'] : null,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $ticker['last'] ? $ticker['last'] : null,
            'change' => null,
            'percentage' => null,
            'average' => $ticker['avg'] ? $ticker['avg'] : null,
            'baseVolume' => $ticker['vol_cur'] ? $ticker['vol_cur'] : null,
            'quoteVolume' => $ticker['vol'] ? $ticker['vol'] : null,
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradesPair (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        );
        return $this->privatePostTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'method' => $path,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btctrader extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btctrader',
            'name' => 'BTCTrader',
            'countries' => array ( 'TR', 'GR', 'PH' ), // Turkey, Greece, Philippines
            'rateLimit' => 1000,
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
            'products' => array (
            ),
        ), $options));
    }

    public function fetch_balance () {
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
        $product = $this->products[$symbol];
        $result[$product['base']] = $base;
        $result[$product['quote']] = $quote;
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderbook ();
        $timestamp = intval ($orderbook['timestamp'] * 1000);
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker ();
        $timestamp = intval ($ticker['timestamp'] * 1000);
        return array (
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

    public function fetch_trades ($product) {
        $maxCount = 50;
        return $this->publicGetTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
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
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'btctrader')
            throw new \Exception ($this->id . ' is an abstract base API for BTCExchange, BTCTurk');
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btcexchange extends btctrader {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btcexchange',
            'name' => 'BTCExchange',
            'countries' => 'PH', // Philippines
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api' => 'https://www.btcexchange.ph/api',
                'www' => 'https://www.btcexchange.ph',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'products' => array (
                'BTC/PHP' => array ( 'id' => 'BTC/PHP', 'symbol' => 'BTC/PHP', 'base' => 'BTC', 'quote' => 'PHP' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class btctradeua extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btctradeua',
            'name' => 'BTC Trade UA',
            'countries' => 'UA', // Ukraine,
            'rateLimit' => 3000,
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
            'products' => array (
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

    public function fetch_balance () {
        $response = $this->privatePostBalance ();
        $accounts = $response['accounts'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($accounts); $b++) {
            $account = $accounts[$b];
            $currency = $account['currency'];
            $balance = floatval ($account['balance']);
            $result[$currency] = array (
                'free' => $balance,
                'used' => null,
                'total' => $balance,
            );
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $bids = $this->publicGetTradesBuySymbol (array (
            'symbol' => $p['id'],
        ));
        $asks = $this->publicGetTradesSellSymbol (array (
            'symbol' => $p['id'],
        ));
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
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['currency_trade']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetJapanStatHighSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $ticker = $response['trades'];
        $timestamp = $this->milliseconds ();
        $result = array (
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

    public function fetch_trades ($product) {
        return $this->publicGetDealsSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $p = $this->product ($product);
        $method = 'privatePost' . $this->capitalize ($side) . 'Id';
        $order = array (
            'count' => $amount,
            'currency1' => $p['quote'],
            'currency' => $p['base'],
            'price' => $price,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostRemoveOrderId (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btcturk extends btctrader {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btcturk',
            'name' => 'BTCTurk',
            'countries' => 'TR', // Turkey
            'rateLimit' => 1000,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api' => 'https://www.btcturk.com/api',
                'www' => 'https://www.btcturk.com',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'products' => array (
                'BTC/TRY' => array ( 'id' => 'BTC/TRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class btcx extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btcx',
            'name' => 'BTCX',
            'countries' => array ( 'IS', 'US', 'EU', ),
            'rateLimit' => 1500, // support in english is very poor, unable to tell rate limits
            'version' => 'v1',
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
            'products' => array (
                'BTC/USD' => array ( 'id' => 'btc/usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'btc/eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => $balances[$currency],
                'used' => null,
                'total' => $balances[$currency],
            );
            $result[$uppercase] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetDepthIdLimit (array (
            'id' => $this->product_id ($product),
            'limit' => 1000,
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['price'];
                $amount = $order['amount'];
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTickerId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $ticker['time'] * 1000;
        return array (
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
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradeIdLimit (array (
            'id' => $this->product_id ($product),
            'limit' => 100,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTrade (array_merge (array (
            'type' => strtoupper ($side),
            'market' => $this->product_id ($product),
            'amount' => $amount,
            'price' => $price,
        ), $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancel (array ( 'order' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/';
        if ($type == 'public') {
            $url .= $this->implode_params ($path, $params);
        } else {
            $nonce = $this->nonce ();
            $url .= $type;
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bter extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bter',
            'name' => 'Bter',
            'countries' => array ( 'VG', 'CN' ), // British Virgin Islands, China
            'version' => '2',
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

    public function fetch_products () {
        $response = $this->publicGetMarketlist ();
        $products = $response['data'];
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['pair'];
            $base = $product['curr_a'];
            $quote = $product['curr_b'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $balance = $this->privatePostBalances ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
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
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderBookId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTickerId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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
            'baseVolume' => floatval ($ticker['baseVolume']),
            'quoteVolume' => floatval ($ticker['quoteVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradeHistoryId (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'currencyPair' => $this->symbol ($product),
            'rate' => $price,
            'amount' => $amount,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'orderNumber' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $prefix = ($type == 'private') ? ($type . '/') : '';
        $url = $this->urls['api'][$type] . $this->version . '/1/' . $prefix . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array ( 'nonce' => $nonce );
            $body = $this->urlencode (array_merge ($request, $query));
            $headers = array (
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class bxinth extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bxinth',
            'name' => 'BX.in.th',
            'countries' => 'TH', // Thailand
            'rateLimit' => 1500,
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

    public function fetch_products () {
        $products = $this->publicGetPairing ();
        $keys = array_keys ($products);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $product = $products[$keys[$p]];
            $id = $product['pairing_id'];
            $base = $product['primary_currency'];
            $quote = $product['secondary_currency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function commonCurrencyCode ($currency) {
        // why would they use three letters instead of four for $currency codes
        if ($currency == 'DAS')
            return 'DASH';
        if ($currency == 'DOG')
            return 'DOGE';
        return $currency;
    }

    public function fetch_balance () {
        $response = $this->privatePostBalance ();
        $balance = $response['balance'];
        $result = array ( 'info' => $balance );
        $currencies = array_keys ($balance);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $code = $this->commonCurrencyCode ($currency);
            $account = array (
                'free' => floatval ($balance[$currency]['available']),
                'used' => null,
                'total' => floatval ($balance[$currency]['total']),
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$code] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderbook (array (
            'pairing' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $id = $this->product_id ($product);
        $tickers = $this->publicGet (array ( 'pairing' => $id ));
        $key = (string) $id;
        $ticker = $tickers[$key];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrade (array (
            'pairing' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrder (array_merge (array (
            'pairing' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id) {
        $pairing = null; // TODO fixme
        return $this->privatePostCancel (array (
            'order_id' => $id,
            'pairing' => $pairing,
        ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path . '/';
        if ($params)
            $url .= '?' . $this->urlencode ($params);
        if ($type == 'private') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class ccex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'ccex',
            'name' => 'C-CEX',
            'countries' => array ( 'DE', 'EU', ),
            'rateLimit' => 1500,
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

    public function fetch_products () {
        $products = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($products['result']); $p++) {
            $product = $products['result'][$p];
            $id = $product['MarketName'];
            $base = $product['MarketCurrency'];
            $quote = $product['BaseCurrency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privateGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['Currency'];
            $account = array (
                'free' => $balance['Available'],
                'used' => $balance['Pending'],
                'total' => $balance['Balance'],
            );
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderbook (array (
            'market' => $this->product_id ($product),
            'type' => 'both',
            'depth' => 100,
        ));
        $orderbook = $response['result'];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buy', 'asks' => 'sell' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['Rate']);
                $amount = floatval ($order['Quantity']);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->tickersGetMarket (array (
            'market' => strtolower ($this->product_id ($product)),
        ));
        $ticker = $response['ticker'];
        $timestamp = $ticker['updated'] * 1000;
        return array (
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
            'quoteVolume' => floatval ($ticker['buysupport']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetMarkethistory (array (
            'market' => $this->product_id ($product),
            'type' => 'both',
            'depth' => 100,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privateGet' . $this->capitalize ($side) . $type;
        return $this->$method (array_merge (array (
            'market' => $this->product_id ($product),
            'quantity' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id) {
        return $this->privateGetCancel (array ( 'uuid' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type == 'private') {
            $nonce = (string) $this->nonce ();
            $query = $this->keysort (array_merge (array (
                'a' => $path,
                'apikey' => $this->apiKey,
                'nonce' => $nonce,
            ), $params));
            $url .= '?' . $this->urlencode ($query);
            $headers = array ( 'apisign' => $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512') );
        } else if ($type == 'public') {
            $url .= '?' . $this->urlencode (array_merge (array (
                'a' => 'get' . $path,
            ), $params));
        } else {
            $url .= '/' . $this->implode_params ($path, $params) . '.json';
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class cex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'cex',
            'name' => 'CEX.IO',
            'countries' => array ( 'GB', 'EU', 'CY', 'RU', ),
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api' => 'https://cex.io/api',
                'www' => 'https://cex.io',
                'doc' => 'https://cex.io/cex-api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency_limits',
                        'last_price/{pair}',
                        'last_prices/{currencies}',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}',
                        'ticker/{pair}',
                        'tickers/{currencies}',
                        'trade_history/{pair}',
                    ),
                    'post' => array (
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'active_orders_status/',
                        'archived_orders/{pair}',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}',
                        'cancel_replace_order/{pair}',
                        'close_position/{pair}',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}',
                        'open_orders/',
                        'open_position/{pair}',
                        'open_positions/{pair}',
                        'place_order/{pair}',
                        'place_order/{pair}',
                    ),
                )
            ),
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetCurrencyLimits ();
        $result = array ();
        for ($p = 0; $p < count ($products['data']['pairs']); $p++) {
            $product = $products['data']['pairs'][$p];
            $id = $product['symbol1'] . '/' . $product['symbol2'];
            $symbol = $id;
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => floatval ($balances[$currency]['available']),
                'used' => floatval ($balances[$currency]['orders']),
                'total' => null,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook =  $this->publicGetOrderBookPair (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $orderbook['timestamp'] * 1000;
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTickerPair (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTradeHistoryPair (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['order_type'] = $type;
        return $this->privatePostPlaceOrderPair (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class chbtc extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'chbtc',
            'name' => 'CHBTC',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v1',
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
            'products' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', ),
                'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY', ),
                'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY', ),
                'BTS/CNY' => array ( 'id' => 'bts_cny', 'symbol' => 'BTS/CNY', 'base' => 'BTS', 'quote' => 'CNY', ),
                'EOS/CNY' => array ( 'id' => 'eos_cny', 'symbol' => 'EOS/CNY', 'base' => 'EOS', 'quote' => 'CNY', ),
            ),
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetPairSettings ();
        $keys = array_keys ($products);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products[$id];
            $symbol = str_replace ('_', '/', $id);
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balances['balance']))
                $account['free'] = $balances['balance'][$currency]['amount'];
            if (array_key_exists ($currency, $balances['frozen']))
                $account['used'] = $balances['frozen'][$currency]['amount'];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->publicGetDepth (array (
            'currency' => $p['id'],
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker (array (
            'currency' => $this->product_id ($product),
        ));
        $ticker = $response['ticker'];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'currency' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $paramString = 'price=' . $price;
        $paramString .= '&$amount=' . $amount;
        $paramString .= '&tradeType=' . ($side == 'buy') ? '1' : '0';
        $paramString .= '&currency=' . $this->product_id ($product);
        return $this->privatePostOrder ($paramString);
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array ( 'id' => $id ), $params));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type]; 
        if ($type == 'public') {
            $url .= '/' . $this->version . '/' . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $paramsLength = count ($params); // $params should be a string here!
            $nonce = $this->nonce ();            
            $auth = 'method=' . $path;            
            $auth .= '&accesskey=' . $this->apiKey;            
            $auth .= $paramsLength ? $params : '';
            $secret = $this->hash ($this->encode ($this->secret), 'sha1');
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($secret), 'md5');
            $suffix = 'sign=' . $signature . '&reqTime=' . (string) $nonce;
            $url .= '/' . $path . '?' . $auth . '&' . $suffix;
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class chilebit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'chilebit',
            'name' => 'ChileBit',
            'countries' => 'CL',
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
            'products' => array (
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class coincheck extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coincheck',
            'name' => 'coincheck',
            'countries' => array ( 'JP', 'ID', ),
            'rateLimit' => 1500,
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
            'products' => array (
                'BTC/JPY' =>  array ( 'id' => 'btc_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY' ), // the only real pair
                'ETH/JPY' =>  array ( 'id' => 'eth_jpy',  'symbol' => 'ETH/JPY',  'base' => 'ETH',  'quote' => 'JPY' ),
                'ETC/JPY' =>  array ( 'id' => 'etc_jpy',  'symbol' => 'ETC/JPY',  'base' => 'ETC',  'quote' => 'JPY' ),
                'DAO/JPY' =>  array ( 'id' => 'dao_jpy',  'symbol' => 'DAO/JPY',  'base' => 'DAO',  'quote' => 'JPY' ),
                'LSK/JPY' =>  array ( 'id' => 'lsk_jpy',  'symbol' => 'LSK/JPY',  'base' => 'LSK',  'quote' => 'JPY' ),
                'FCT/JPY' =>  array ( 'id' => 'fct_jpy',  'symbol' => 'FCT/JPY',  'base' => 'FCT',  'quote' => 'JPY' ),
                'XMR/JPY' =>  array ( 'id' => 'xmr_jpy',  'symbol' => 'XMR/JPY',  'base' => 'XMR',  'quote' => 'JPY' ),
                'REP/JPY' =>  array ( 'id' => 'rep_jpy',  'symbol' => 'REP/JPY',  'base' => 'REP',  'quote' => 'JPY' ),
                'XRP/JPY' =>  array ( 'id' => 'xrp_jpy',  'symbol' => 'XRP/JPY',  'base' => 'XRP',  'quote' => 'JPY' ),
                'ZEC/JPY' =>  array ( 'id' => 'zec_jpy',  'symbol' => 'ZEC/JPY',  'base' => 'ZEC',  'quote' => 'JPY' ),
                'XEM/JPY' =>  array ( 'id' => 'xem_jpy',  'symbol' => 'XEM/JPY',  'base' => 'XEM',  'quote' => 'JPY' ),
                'LTC/JPY' =>  array ( 'id' => 'ltc_jpy',  'symbol' => 'LTC/JPY',  'base' => 'LTC',  'quote' => 'JPY' ),
                'DASH/JPY' => array ( 'id' => 'dash_jpy', 'symbol' => 'DASH/JPY', 'base' => 'DASH', 'quote' => 'JPY' ),
                'ETH/BTC' =>  array ( 'id' => 'eth_btc',  'symbol' => 'ETH/BTC',  'base' => 'ETH',  'quote' => 'BTC' ),
                'ETC/BTC' =>  array ( 'id' => 'etc_btc',  'symbol' => 'ETC/BTC',  'base' => 'ETC',  'quote' => 'BTC' ),
                'LSK/BTC' =>  array ( 'id' => 'lsk_btc',  'symbol' => 'LSK/BTC',  'base' => 'LSK',  'quote' => 'BTC' ),
                'FCT/BTC' =>  array ( 'id' => 'fct_btc',  'symbol' => 'FCT/BTC',  'base' => 'FCT',  'quote' => 'BTC' ),
                'XMR/BTC' =>  array ( 'id' => 'xmr_btc',  'symbol' => 'XMR/BTC',  'base' => 'XMR',  'quote' => 'BTC' ),
                'REP/BTC' =>  array ( 'id' => 'rep_btc',  'symbol' => 'REP/BTC',  'base' => 'REP',  'quote' => 'BTC' ),
                'XRP/BTC' =>  array ( 'id' => 'xrp_btc',  'symbol' => 'XRP/BTC',  'base' => 'XRP',  'quote' => 'BTC' ),
                'ZEC/BTC' =>  array ( 'id' => 'zec_btc',  'symbol' => 'ZEC/BTC',  'base' => 'ZEC',  'quote' => 'BTC' ),
                'XEM/BTC' =>  array ( 'id' => 'xem_btc',  'symbol' => 'XEM/BTC',  'base' => 'XEM',  'quote' => 'BTC' ),
                'LTC/BTC' =>  array ( 'id' => 'ltc_btc',  'symbol' => 'LTC/BTC',  'base' => 'LTC',  'quote' => 'BTC' ),
                'DASH/BTC' => array ( 'id' => 'dash_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $balances = $this->privateGetAccountsBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($lowercase, $balances))
                $account['free'] = floatval ($balances[$lowercase]);
            $reserved = $lowercase . '_reserved';
            if (array_key_exists ($reserved, $balances))
                $account['used'] = floatval ($balances[$reserved]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook =  $this->publicGetOrderBooks ();
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker ();
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $prefix = '';
        $order = array (
            'pair' => $this->product_id ($product),
        );
        if ($type == 'market') {
            $order_type = $type . '_' . $side;
            $order['order_type'] = $order_type;
            $prefix = ($side == buy) ? ($order_type . '_') : '';
            $order[$prefix . 'amount'] = $amount;
        } else {
            $order['order_type'] = $side;
            $order['rate'] = $price;
            $order['amount'] = $amount;
        }
        return $this->privatePostExchangeOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privateDeleteExchangeOrdersId (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $length = 0;
            if ($query) {
                $body = $this->urlencode ($this->keysort ($query));
                $length = count ($body);
            }
            $auth = $nonce . $url . ($body || '');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => $length,
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-NONCE' => $nonce,
                'ACCESS-SIGNATURE' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret)),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class coingi extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coingi',
            'name' => 'Coingi',
            'rateLimit' => 1000,
            'countries' => array ( 'PA', 'BG', 'CN', 'US' ), // Panama, Bulgaria, China, US
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
            'products' => array (
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

    public function fetch_balance () {
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
                'total' => null,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->currentGetOrderBookPairAskCountBidCountDepth (array (
            'pair' => $p['id'],
            'askCount' => 512, // maximum returned number of asks 1-512
            'bidCount' => 512, // maximum returned number of bids 1-512
            'depth' => 32, // maximum number of depth range steps 1-32
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['price'];
                $amount = $order['baseAmount'];
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->currentGet24hourRollingAggregation ();
        $tickers = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $base = strtoupper ($ticker['currencyPair']['base']);
            $quote = strtoupper ($ticker['currencyPair']['counter']);
            $symbol = $base . '/' . $quote;
            $tickers[$symbol] = $ticker;
        }
        $timestamp = $this->milliseconds ();
        $p = $this->product ($product);
        $ticker = array (
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
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => null,
            'info' => null,
        );
        if (array_key_exists ($p['symbol'], $tickers)) {
            $aggregation = $tickers[$p['symbol']];
            $ticker['high'] = $aggregation['high'];
            $ticker['low'] = $aggregation['low'];
            $ticker['bid'] = $aggregation['highestBid'];
            $ticker['ask'] = $aggregation['lowestAsk'];
            $ticker['baseVolume'] = $aggregation['baseVolume'];
            $ticker['quoteVolume'] = $aggregation['counterVolume'];
            $ticker['high'] = $aggregation['high'];
            $ticker['info'] = $aggregation;
        }
        return $ticker;
    }

    public function fetch_trades ($product) {
        return $this->publicGetTransactionsPairMaxCount (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'currencyPair' => $this->product_id ($product),
            'volume' => $amount,
            'price' => $price,
            'orderType' => ($side == 'buy') ? 0 : 1,
        );
        return $this->userPostAddOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->userPostCancelOrder (array ( 'orderId' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $type . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'current') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class coinmarketcap extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coinmarketcap',
            'name' => 'CoinMarketCap',
            'rateLimit' => 10000,
            'version' => 'v1',
            'countries' => 'US',
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

    public function fetch_order_book () {
        throw new \Exception ('Fetching order books is not supported by the API of ' . $this->id);
    }

    public function fetch_products () {
        $products = $this->publicGetTicker ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            for ($c = 0; $c < count ($this->currencies); $c++) {
                $base = $product['symbol'];                
                $baseId = $product['id'];
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
                    'info' => $product,
                );
            }
        }
        return $result;
    }

    public function fetchGlobal ($currency = 'USD') {
        $request = array ();
        if ($currency)
            $request['convert'] = $currency;
        return $this->publicGetGlobal ($request);
    }

    public function parseTicker ($ticker, $product) {
        $timestamp = intval ($ticker['last_updated']) * 1000;
        $volume = null;
        $volumeKey = '24h_volume_' . $product['quoteId'];
        if ($ticker[$volumeKey])
            $volume = floatval ($ticker[$volumeKey]);
        $price = 'price_' . $product['quoteId'];
        $change = null;
        $changeKey = 'percent_change_24h';
        if ($ticker[$changeKey])
            $change = floatval ($ticker[$changeKey]);
        return array (
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
            'last' => floatval ($ticker[$price]),
            'change' => $change,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $volume,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($currency = 'USD') {
        $request = array ();
        if ($currency) 
            $request['convert'] = $currency;
        $response = $this->publicGetTicker ($request);
        $tickers = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $id = $ticker['id'] . '/' . $currency;
            $product = $this->products_by_id[$id];
            $symbol = $product['symbol'];
            $tickers[$symbol] = $this->parseTicker ($ticker, $product);
        }
        return $tickers;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $request = array (
            'convert' => $p['quote'],
            'id' => $p['baseId'],
        );
        $response = $this->publicGetTickerId ($request);
        $ticker = $response[0];
        return $this->parseTicker ($ticker, $p);
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class coinmate extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coinmate',
            'name' => 'CoinMate',
            'countries' => array ( 'GB', 'CZ' ), // UK, Czech Republic
            'rateLimit' => 1000,
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
            'products' => array (
                'BTC/EUR' => array ( 'id' => 'BTC_EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR'  ),
                'BTC/CZK' => array ( 'id' => 'BTC_CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK'  ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostBalances ();
        $balances = $response['data'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $balances)) {
                $account['free'] = $balances[$currency]['available'];
                $account['used'] = $balances[$currency]['reserved'];
                $account['total'] = $balances[$currency]['balance'];
            }            
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderBook (array (
            'currencyPair' => $this->product_id ($product),
            'groupByPriceLimit' => 'False',
        ));
        $orderbook = $response['data'];
        $timestamp = $orderbook['timestamp'] * 1000;
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['price'];
                $amount = $order['amount'];
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker (array (
            'currencyPair' => $this->product_id ($product),
        ));
        $ticker = $response['data'];
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
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
            'quoteVolume' => floatval ($ticker['amount']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTransactions (array (
            'currencyPair' => $this->product_id ($product),
            'minutesIntoHistory' => 10,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'currencyPair' => $this->product_id ($product),
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
        return $this->$method (self.extend ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'orderId' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
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
                'Content-Type' =>  'application/x-www-form-urlencoded',
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class coinsecure extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coinsecure',
            'name' => 'Coinsecure',
            'countries' => 'IN', // India
            'rateLimit' => 1000,
            'version' => 'v1',
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
            'products' => array (
                'BTC/INR' => array ( 'id' => 'BTC/INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
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
        return $result;
    }

    public function fetch_order_book ($product) {
        $bids = $this->publicGetExchangeBidOrders ();
        $asks = $this->publicGetExchangeAskOrders ();
        $orderbook = array (
            'bids' => $bids['message'],
            'asks' => $asks['message'],
        );
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['rate'];
                $amount = $order['vol'];
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetExchangeTicker ();
        $ticker = $response['message'];
        $timestamp = $ticker['timestamp'];
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetExchangeTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
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
        return $this->$method (self.extend ($order, $params));
    }

    public function cancel_order ($id) {
        throw new \Exception ($this->id . ' cancelOrder () is not fully implemented yet');
        $method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        return $this->$method (array ( 'orderID' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'private') {
            $headers = array ( 'Authorization' => $this->apiKey );
            if ($query) {
                $body = $this->json ($query);
                $headers['Content-Type'] = 'application/json';
            }
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class coinspot extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coinspot',
            'name' => 'CoinSpot',
            'countries' => 'AU', // Australia
            'rateLimit' => 1000,
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
            'products' => array (
                'BTC/AUD' => array ( 'id' => 'BTC', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD', ),
                'LTC/AUD' => array ( 'id' => 'LTC', 'symbol' => 'LTC/AUD', 'base' => 'LTC', 'quote' => 'AUD', ),
                'DOGE/AUD' => array ( 'id' => 'DOGE', 'symbol' => 'DOGE/AUD', 'base' => 'DOGE', 'quote' => 'AUD', ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        $response = $this->privatePostMyBalances ();
        $balances = $response['balance'];
        $currencies = array_keys ($balances)
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => $balances[$currency],
                'used' => null,
                'total' => $balances[$currency],
            );
            if ($uppercase == 'DRK')
                $uppercase = 'DASH';
            $result[$uppercase] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->privatePostOrders (array (
            'cointype' => $p['id'],
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buyorders', 'asks' => 'sellorders' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['rate']);
                $amount = floatval ($order['amount']);
                $result[$key][] = array ($price, $amount);
            }
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetLatest ();
        $id = $this->product_id ($product);
        $id = strtolower ($id);
        $ticker = $response['prices'][$id];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->privatePostOrdersHistory (array (
            'cointype' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePostMy' . $this->capitalize ($side);
        if ($type =='market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $order = array (
            'cointype' => $this->product_id ($product),
            'amount' => $amount,
            'rate' => $price,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        throw new \Exception ($this->id . ' cancelOrder () is not fully implemented yet');
        $method = 'privatePostMyBuy';
        return $this->$method (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests');
        $url = $this->urls['api'][$type] . '/' . $path;
        if ($type == 'private') {
            $nonce = $this->nonce ();
            $body = $this->json (array_merge (array ( 'nonce' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/json',
                'Content-Length' => strlen ($body),
                'key' => $this->apiKey,
                'sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class dsx extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'dsx',
            'name' => 'DSX',
            'countries' => 'UK',
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
                'api' => array (
                    'mapi' => 'https://dsx.uk/mapi',  // market data
                    'tapi' => 'https://dsx.uk/tapi',  // trading
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
                'mapi' => array ( // market data (public)
                    'get' => array (
                        'barsFromMoment/{id}/{period}/{start}', // empty reply :\
                        'depth/{id}',
                        'info',
                        'lastBars/{id}/{period}/{amount}', // period is (m, h or d)
                        'periodBars/{id}/{period}/{start}/{end}',
                        'ticker/{id}',
                        'trades/{id}',
                    ),
                ),
                'tapi' => array ( // trading (private)
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
                'dwapi' => array ( // deposit / withdraw (private)
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

    public function fetch_products () {
        $response = $this->mapiGetInfo ();
        $keys = array_keys ($response['pairs']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $response['pairs'][$id];
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
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->tapiPostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances['total']);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $account = array (
                'free' => $balances['funds'][$currency],
                'used' => null,
                'total' => $balances['total'][$currency],
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->mapiGetDepthId (array (
            'id' => $p['id'],
        ));
        $orderbook = $response[$p['id']];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order[0];
                $amount = $order[1];
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $response = $this->mapiGetTickerId (array (
            'id' => $p['id'],
        ));
        $ticker = $response[$p['id']];
        $timestamp = $ticker['updated'] * 1000;
        return array (
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
            'average' => floatval ($ticker['avg']),
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => floatval ($ticker['vol_cur']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->mapiGetTradesId (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $order = array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'rate' => $price,
            'amount' => $amount,
        );
        return $this->tapiPostTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->tapiPostCancelOrder (array ( 'orderId' => $id ));
    }

    public function request ($path, $type = 'mapi', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if (($type == 'mapi') || ($type == 'dwapi'))
            $url .= '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'mapi') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $method = $path;
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $nonce,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512', 'base64'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class exmo extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'exmo',
            'name' => 'EXMO',
            'countries' => array ( 'ES', 'RU', ), // Spain, Russia
            'rateLimit' => 1000, // once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version' => 'v1',
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

    public function fetch_products () {
        $products = $this->publicGetPairSettings ();
        $keys = array_keys ($products);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products[$id];
            $symbol = str_replace ('_', '/', $id);
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        $response = $this->privatePostUserInfo ();
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = array (
                'free' => null,
                'used' => null,
                'total' => null,
            );
            if (array_key_exists ($currency, $response['balances']))
                $account['free'] = floatval ($response['balances'][$currency]);
            if (array_key_exists ($currency, $response['reserved']))
                $account['used'] = floatval ($response['reserved'][$currency]);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->publicGetOrderBook (array (
            'pair' => $p['id'],
        ));
        $orderbook = $response[$p['id']];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'bid', 'asks' => 'ask' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker ();
        $p = $this->product ($product);
        $ticker = $response[$p['id']];
        $timestamp = $ticker['updated'] * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $prefix = '';
        if ($type =='market')
            $prefix = 'market_';
        $order = array (
            'pair' => $this->product_id ($product),
            'quantity' => $amount,
            'price' => $price || 0,
            'type' => $prefix . $side,
        );
        return $this->privatePostOrderCreate (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrderCancel (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        $result = $this->fetch ($url, $method, $headers, $body);
        if (array_key_exists ('result', $result)) {
            if (!$result['result']) {
                throw new MarketNotAvailableError ('[Market Not Available] ' . $this->id . ' ' . $result['error']);
            }
        }
        return $result;
    }
}

//-----------------------------------------------------------------------------

class flowbtc extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'flowbtc',
            'name' => 'flowBTC',
            'countries' => 'BR', // Brazil
            'version' => 'v1',
            'rateLimit' => 1000,
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

    public function fetch_products () {
        $response = $this->publicPostGetProductPairs ();
        $products = $response['productPairs'];
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['name'];
            $base = $product['product1Label'];
            $quote = $product['product2Label'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privatePostUserInfo ();
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->publicPostGetOrderBook (array (
            'productPair' => $p['id'],
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['px']);
                $amount = floatval ($order['qty']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $ticker = $this->publicPostGetTicker (array (
            'productPair' => $p['id'],
        ));
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicPostGetTrades (array (
            'productPair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $orderType = ($type == 'market') ? 1 : 0;
        $order = array (
            'ins' => $this->product_id ($product),
            'side' => $side,
            'orderType' => $orderType,
            'qty' => $amount,
            'px' => $price,
        );
        return $this->privatePostCreateOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'serverOrderId' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            if ($params) {
                $body = $this->json ($params);
            }
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->secret);
            $body = $this->urlencode (array_merge (array (
                'apiKey' => $this->apiKey,
                'apiNonce' => $nonce,
                'apiSig' => strtoupper ($signature),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/json',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class foxbit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'foxbit',
            'name' => 'FoxBit',
            'countries' => 'BR',
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
            'products' => array (
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class fyb extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
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

    public function fetch_balance () {
        return $this->privatePostGetaccinfo ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderbook ();
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTickerdetailed ();
        $timestamp = $this->milliseconds ();
        $last = null;
        $volume = null;
        if (array_key_exists ('last', $ticker))
            $last = floatval ($ticker['last']);
        if (array_key_exists ('vol', $ticker))
            $volume = floatval ($ticker['vol']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostPlaceorder (array_merge (array (
            'qty' => $amount,
            'price' => $price,
            'type' => strtoupper ($side[0])
        ), $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelpendingorder (array ( 'orderNo' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $headers = array (
                'Content-type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sig' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha1')
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class fybse extends fyb {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'fybse',
            'name' => 'FYB-SE',
            'countries' => 'SE', // Sweden
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api' => 'https://www.fybse.se/api/SEK',
                'www' => 'https://www.fybse.se',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'products' => array (
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class fybsg extends fyb {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'fybsg',
            'name' => 'FYB-SG',
            'countries' => 'SG', // Singapore
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
                'api' => 'https://www.fybsg.com/api/SGD',
                'www' => 'https://www.fybsg.com',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'products' => array (
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class gatecoin extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'gatecoin',
            'name' => 'Gatecoin',
            'rateLimit' => 2000,
            'countries' => 'HK', // Hong Kong
            'comment' => 'a regulated/licensed exchange',
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

    public function fetch_products () {
        $response = $this->publicGetPublicLiveTickers ();
        $products = $response['tickers'];
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['currencyPair'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
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
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->publicGetPublicMarketDepthCurrencyPair (array (
            'CurrencyPair' => $p['id'],
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['volume']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $response = $this->publicGetPublicLiveTickerCurrencyPair (array (
            'CurrencyPair' => $p['id'],
        ));
        $ticker = $response['ticker'];
        $timestamp = intval ($ticker['createDateTime']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetPublicTransactionsCurrencyPair (array (
            'CurrencyPair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'Code' => $this->product_id ($product),
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
        return $this->privatePostTradeOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privateDeleteTradeOrdersOrderID (array ( 'OrderID' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {

            $nonce = $this->nonce ();
            $contentType = ($method == 'GET') ? '' : 'application/json';
            $auth = $method . $url . $contentType . (string) $nonce;
            $auth = strtolower ($auth);

            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha256', 'base64');
            $headers = array (
                'API_PUBLIC_KEY' => $this->apiKey,
                'API_REQUEST_SIGNATURE' => $signature,
                'API_REQUEST_DATE' => $nonce,
            );
            if ($method != 'GET')
                $headers['Content-Type'] = $contentType;
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class gdax extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'gdax',
            'name' => 'GDAX',
            'countries' => 'US',
            'rateLimit' => 1000,
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
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetProducts ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['id'];
            $base = $product['base_currency'];
            $quote = $product['quote_currency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetAccounts ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetProductsIdBook (array (
            'id' => $this->product_id ($product),
            'level' => 2, // 1 best bidask, 2 aggregated, 3 full
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $ticker = $this->publicGetProductsIdTicker (array (
            'id' => $p['id'],
        ));
        $quote = $this->publicGetProductsIdStats (array (
            'id' => $p['id'],
        ));
        $timestamp = $this->parse8601 ($ticker['time']);
        $bid = null;
        $ask = null;
        if (array_key_exists ('bid', $ticker))
            $bid = floatval ($ticker['bid']);
        if (array_key_exists ('ask', $ticker))
            $ask = floatval ($ticker['ask']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetProductsIdTrades (array (
            'id' => $this->product_id ($product), // fixes issue #2
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $oid = (string) $this->nonce ();
        $order = array (
            'product_id' => $this->product_id ($product),
            'side' => $side,
            'size' => $amount,
            'type' => $type,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privateDeleteOrdersId (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $request;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->apiKey)
                throw new AuthenticationError ($this->id . ' requires apiKey property for authentication and trading');
            if (!$this->secret)
                throw new AuthenticationError ($this->id . ' requires $secret property for authentication and trading');
            if (!$this->password)
                throw new AuthenticationError ($this->id . ' requires password property for authentication and trading');
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = $this->json ($query);
            $what = $nonce . $method . $request . ($body || '');
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($this->encode ($what), $secret, 'sha256', 'base64');
            $headers = array (
                'CB-ACCESS-KEY' => $this->apiKey,
                'CB-ACCESS-SIGN' => $signature,
                'CB-ACCESS-TIMESTAMP' => $nonce,
                'CB-ACCESS-PASSPHRASE' => $this->password,
                'Content-Type' => 'application/json',
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class gemini extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'gemini',
            'name' => 'Gemini',
            'countries' => 'US',
            'rateLimit' => 1500, // 200 for private API
            'version' => 'v1',
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

    public function fetch_products () {
        $products = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product;
            $uppercaseProduct = strtoupper ($product);
            $base = mb_substr ($uppercaseProduct, 0, 3);
            $quote = mb_substr ($uppercaseProduct, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetBookSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['amount']);
                $timestamp = intval ($order['timestamp']) * 1000;
                $result[$side][] = array ($price, $amount, $timestamp);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $ticker = $this->publicGetPubtickerSymbol (array (
            'symbol' => $p['id'],
        ));
        $timestamp = $ticker['volume']['timestamp'];
        $baseVolume = $p['base'];
        $quoteVolume = $p['quote'];
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTradesSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
        return $this->privatePostBalances ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $order = array (
            'client_order_id' => $this->nonce (),
            'symbol' => $this->product_id ($product),
            'amount' => (string) $amount,
            'price' => (string) $price,
            'side' => $side,
            'type' => 'exchange limit', // gemini allows limit orders only
        );
        return $this->privatePostOrderNew (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array_merge (array (
                'request' => $url,
                'nonce' => $nonce,
            ), $query);
            $payload = $this->json ($request);
            $payload = $this->encode ($payload);
            $payload = base64_encode ($payload);
            $signature = $this->hmac ($payload, $this->encode ($this->secret), 'sha384');
            $headers = array (
                'Content-Type' => 'text/plain',
                'Content-Length' => 0,
                'X-GEMINI-APIKEY' => $this->apiKey,
                'X-GEMINI-PAYLOAD' => $payload,
                'X-GEMINI-SIGNATURE' => $signature,
            );
        }
        $url = $this->urls['api'] . $url;
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class hitbtc extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'hitbtc',
            'name' => 'HitBTC',
            'countries' => 'HK', // Hong Kong
            'rateLimit' => 1500,
            'version' => '1',
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

    public function fetch_products () {
        $products = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($products['symbols']); $p++) {
            $product = $products['symbols'][$p];
            $id = $product['symbol'];
            $base = $product['commodity'];
            $quote = $product['currency'];
            // looks like they now have it correct
            // if ($base == 'DSH')
                // $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->tradingGetBalance ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetSymbolOrderbook (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetSymbolTicker (array (
            'symbol' => $this->product_id ($product),
        ));
        if (array_key_exists ('message', $ticker))
            throw new \Exception ($this->id . ' ' . $ticker['message']);
        $timestamp = $ticker['timestamp'];
        return array (
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
            'average' => null,
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => floatval ($ticker['volume_quote']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetSymbolTrades (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'clientOrderId' => $this->nonce (),
            'symbol' => $this->product_id ($product),
            'side' => $side,
            'quantity' => $amount,
            'type' => $type,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->tradingPostNewOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->tradingPostCancelOrder (array ( 'clientOrderId' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api/' . $this->version . '/' . $type . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ( 'nonce' => $nonce, 'apikey' => $this->apiKey ), $query);
            if ($method == 'POST')
                if ($query)
                    $body = $this->urlencode ($query);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
            $auth = $url . ($body || '');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'X-Signature' => strtolower ($this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512')),
            );
        }
        $url = $this->urls['api'] . $url;
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class huobi extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'huobi',
            'name' => 'Huobi',
            'countries' => 'CN',
            'rateLimit' => 2000,
            'version' => 'v3',
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
            'products' => array (
                'BTC/CNY' => array ( 'id' => 'btc', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'type' => 'staticmarket', 'coinType' => 1, ),
                'LTC/CNY' => array ( 'id' => 'ltc', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'type' => 'staticmarket', 'coinType' => 2, ),
                'BTC/USD' => array ( 'id' => 'btc', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'usdmarket',    'coinType' => 1, ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->tradePostGetAccountInfo ();
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $method = $p['type'] . 'GetDepthId';
        $orderbook = $this->$method (array ( 'id' => $p['id'] ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $method = $p['type'] . 'GetTickerId';
        $response = $this->$method (array ( 'id' => $p['id'] ));
        $ticker = $response['ticker'];
        $timestamp = intval ($response['time']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        $p = $this->product ($product);
        $method = $p['type'] . 'GetDetailId';
        return $this->$method (array ( 'id' => $p['id'] ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $method = 'tradePost' . $this->capitalize ($side);
        $order = array (
            'coin_type' => $p['coinType'],
            'amount' => $amount,
            'market' => strtolower ($p['quote']),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $method .= $this->capitalize ($type);
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->tradePostCancelOrder (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'trade', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'];
        if ($type == 'trade') {
            $url .= '/api' . $this->version;
            $query = $this->keysort (array_merge (array (
                'method' => $path,
                'access_key' => $this->apiKey,
                'created' => $this->nonce (),
            ), $params));
            $queryString = $this->urlencode ($this->omit ($query, 'market'));
            // secret key must be at the end of $query to be signed
            $queryString .= '&secret_key=' . $this->secret;
            $query['sign'] = $this->hash ($this->encode ($queryString));
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        } else {
            $url .= '/' . $type . '/' . $this->implode_params ($path, $params) . '_json.js';
            $query = $this->omit ($params, $this->extract_params ($path));
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class itbit extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'itbit',
            'name' => 'itBit',
            'countries' => 'US',
            'rateLimit' => 2000,
            'version' => 'v1',
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
            'products' => array (
                'BTC/USD' => array ( 'id' => 'XBTUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/SGD' => array ( 'id' => 'XBTSGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/EUR' => array ( 'id' => 'XBTEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetMarketsSymbolOrderBook (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetMarketsSymbolTicker (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->parse8601 ($ticker['serverTimeUTC']);
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high24h']),
            'low' => floatval ($ticker['low24h']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
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

    public function fetch_trades ($product) {
        return $this->publicGetMarketsSymbolTrades (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
        return $this->privateGetWallets ();
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $amount = (string) $amount;
        $price = (string) $price;
        $p = $this->product ($product);
        $order = array (
            'side' => $side,
            'type' => $type,
            'currency' => $p['base'],
            'amount' => $amount,
            'display' => $amount,
            'price' => $price,
            'instrument' => $p['id'],
        );
        return $this->privatePostTradeAdd (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privateDeleteWalletsWalletIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
            $hashedMessage = $this->hash ($message, 'sha256', 'binary');
            $signature = $this->hmac ($this->encode ($url . $hashedMessage), $this->secret, 'sha512', 'base64');
            $headers = array (
                'Authorization' => self.apiKey . ':' . $signature,
                'Content-Type' => 'application/json',
                'X-Auth-Timestamp' => $timestamp,
                'X-Auth-Nonce' => $nonce,
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class jubi extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'jubi',
            'name' => 'jubi.com',
            'countries' => 'CN',
            'rateLimit' => 1500,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api' => 'https://www.jubi.com/api',
                'www' => 'https://www.jubi.com',
                'doc' => 'https://www.jubi.com/help/api.html',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth',
                        'orders',
                        'ticker',
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
            'products' => array (
                'BTC/CNY' =>  array ( 'id' => 'btc',  'symbol' => 'BTC/CNY',  'base' => 'BTC',  'quote' => 'CNY' ),
                'ETH/CNY' =>  array ( 'id' => 'eth',  'symbol' => 'ETH/CNY',  'base' => 'ETH',  'quote' => 'CNY' ),
                'ANS/CNY' =>  array ( 'id' => 'ans',  'symbol' => 'ANS/CNY',  'base' => 'ANS',  'quote' => 'CNY' ),
                'BLK/CNY' =>  array ( 'id' => 'blk',  'symbol' => 'BLK/CNY',  'base' => 'BLK',  'quote' => 'CNY' ),
                'DNC/CNY' =>  array ( 'id' => 'dnc',  'symbol' => 'DNC/CNY',  'base' => 'DNC',  'quote' => 'CNY' ),
                'DOGE/CNY' => array ( 'id' => 'doge', 'symbol' => 'DOGE/CNY', 'base' => 'DOGE', 'quote' => 'CNY' ),
                'EAC/CNY' =>  array ( 'id' => 'eac',  'symbol' => 'EAC/CNY',  'base' => 'EAC',  'quote' => 'CNY' ),
                'ETC/CNY' =>  array ( 'id' => 'etc',  'symbol' => 'ETC/CNY',  'base' => 'ETC',  'quote' => 'CNY' ),
                'FZ/CNY' =>   array ( 'id' => 'fz',   'symbol' => 'FZ/CNY',   'base' => 'FZ',   'quote' => 'CNY' ),
                'GOOC/CNY' => array ( 'id' => 'gooc', 'symbol' => 'GOOC/CNY', 'base' => 'GOOC', 'quote' => 'CNY' ),
                'GAME/CNY' => array ( 'id' => 'game', 'symbol' => 'GAME/CNY', 'base' => 'GAME', 'quote' => 'CNY' ),
                'HLB/CNY' =>  array ( 'id' => 'hlb',  'symbol' => 'HLB/CNY',  'base' => 'HLB',  'quote' => 'CNY' ),
                'IFC/CNY' =>  array ( 'id' => 'ifc',  'symbol' => 'IFC/CNY',  'base' => 'IFC',  'quote' => 'CNY' ),
                'JBC/CNY' =>  array ( 'id' => 'jbc',  'symbol' => 'JBC/CNY',  'base' => 'JBC',  'quote' => 'CNY' ),
                'KTC/CNY' =>  array ( 'id' => 'ktc',  'symbol' => 'KTC/CNY',  'base' => 'KTC',  'quote' => 'CNY' ),
                'LKC/CNY' =>  array ( 'id' => 'lkc',  'symbol' => 'LKC/CNY',  'base' => 'LKC',  'quote' => 'CNY' ),
                'LSK/CNY' =>  array ( 'id' => 'lsk',  'symbol' => 'LSK/CNY',  'base' => 'LSK',  'quote' => 'CNY' ),
                'LTC/CNY' =>  array ( 'id' => 'ltc',  'symbol' => 'LTC/CNY',  'base' => 'LTC',  'quote' => 'CNY' ),
                'MAX/CNY' =>  array ( 'id' => 'max',  'symbol' => 'MAX/CNY',  'base' => 'MAX',  'quote' => 'CNY' ),
                'MET/CNY' =>  array ( 'id' => 'met',  'symbol' => 'MET/CNY',  'base' => 'MET',  'quote' => 'CNY' ),
                'MRYC/CNY' => array ( 'id' => 'mryc', 'symbol' => 'MRYC/CNY', 'base' => 'MRYC', 'quote' => 'CNY' ),
                'MTC/CNY' =>  array ( 'id' => 'mtc',  'symbol' => 'MTC/CNY',  'base' => 'MTC',  'quote' => 'CNY' ),
                'NXT/CNY' =>  array ( 'id' => 'nxt',  'symbol' => 'NXT/CNY',  'base' => 'NXT',  'quote' => 'CNY' ),
                'PEB/CNY' =>  array ( 'id' => 'peb',  'symbol' => 'PEB/CNY',  'base' => 'PEB',  'quote' => 'CNY' ),
                'PGC/CNY' =>  array ( 'id' => 'pgc',  'symbol' => 'PGC/CNY',  'base' => 'PGC',  'quote' => 'CNY' ),
                'PLC/CNY' =>  array ( 'id' => 'plc',  'symbol' => 'PLC/CNY',  'base' => 'PLC',  'quote' => 'CNY' ),
                'PPC/CNY' =>  array ( 'id' => 'ppc',  'symbol' => 'PPC/CNY',  'base' => 'PPC',  'quote' => 'CNY' ),
                'QEC/CNY' =>  array ( 'id' => 'qec',  'symbol' => 'QEC/CNY',  'base' => 'QEC',  'quote' => 'CNY' ),
                'RIO/CNY' =>  array ( 'id' => 'rio',  'symbol' => 'RIO/CNY',  'base' => 'RIO',  'quote' => 'CNY' ),
                'RSS/CNY' =>  array ( 'id' => 'rss',  'symbol' => 'RSS/CNY',  'base' => 'RSS',  'quote' => 'CNY' ),
                'SKT/CNY' =>  array ( 'id' => 'skt',  'symbol' => 'SKT/CNY',  'base' => 'SKT',  'quote' => 'CNY' ),
                'TFC/CNY' =>  array ( 'id' => 'tfc',  'symbol' => 'TFC/CNY',  'base' => 'TFC',  'quote' => 'CNY' ),
                'VRC/CNY' =>  array ( 'id' => 'vrc',  'symbol' => 'VRC/CNY',  'base' => 'VRC',  'quote' => 'CNY' ),
                'VTC/CNY' =>  array ( 'id' => 'vtc',  'symbol' => 'VTC/CNY',  'base' => 'VTC',  'quote' => 'CNY' ),
                'WDC/CNY' =>  array ( 'id' => 'wdc',  'symbol' => 'WDC/CNY',  'base' => 'WDC',  'quote' => 'CNY' ),
                'XAS/CNY' =>  array ( 'id' => 'xas',  'symbol' => 'XAS/CNY',  'base' => 'XAS',  'quote' => 'CNY' ),
                'XPM/CNY' =>  array ( 'id' => 'xpm',  'symbol' => 'XPM/CNY',  'base' => 'XPM',  'quote' => 'CNY' ),
                'XRP/CNY' =>  array ( 'id' => 'xrp',  'symbol' => 'XRP/CNY',  'base' => 'XRP',  'quote' => 'CNY' ),
                'XSGS/CNY' => array ( 'id' => 'xsgs', 'symbol' => 'XSGS/CNY', 'base' => 'XSGS', 'quote' => 'CNY' ),
                'YTC/CNY' =>  array ( 'id' => 'ytc',  'symbol' => 'YTC/CNY',  'base' => 'YTC',  'quote' => 'CNY' ),
                'ZET/CNY' =>  array ( 'id' => 'zet',  'symbol' => 'ZET/CNY',  'base' => 'ZET',  'quote' => 'CNY' ),
                'ZCC/CNY' =>  array ( 'id' => 'zcc',  'symbol' => 'ZCC/CNY',  'base' => 'ZCC',  'quote' => 'CNY' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostBalance ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetDepth (array (
            'coin' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker (array (
            'coin' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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
            'quoteVolume' => floatval ($ticker['volume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetOrders (array (
            'coin' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTradeAdd (array_merge (array (
            'amount' => $amount,
            'price' => $price,
            'type' => $side,
            'coin' => $this->product_id ($product),
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privateDeleteWalletsWalletIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
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
            $query['signature'] = $this->hmac ($this->encode ($request), $secret);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class kraken extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'kraken',
            'name' => 'Kraken',
            'countries' => 'US',
            'version' => '0',
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api' => 'https://api.kraken.com',
                'www' => 'https://www.kraken.com',
                'doc' => array (
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ),
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

    public function fetch_products () {
        $products = $this->publicGetAssetPairs ();
        $keys = array_keys ($products['result']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products['result'][$id];
            $base = $product['base'];
            $quote = $product['quote'];
            if (($base[0] == 'X') || ($base[0] == 'Z'))
                $base = mb_substr ($base, 1);
            if (($quote[0] == 'X') || ($quote[0] == 'Z'))
                $quote = mb_substr ($quote, 1);
            $base = $this->commonCurrencyCode ($base);
            $quote = $this->commonCurrencyCode ($quote);
            $darkpool = mb_strpos ($id, '.d') !== false;
            $symbol = $darkpool ? $product['altname'] : ($base . '/' . $quote);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $darkpool = mb_strpos ($product, '.d') !== false;
        if ($darkpool)
            throw new OrderBookNotAvailableError ($this->id . ' does not provide an $order book for $darkpool symbol ' . $product);
        $p = $this->product ($product);
        $response = $this->publicGetDepth  (array (
            'pair' => $p['id'],
        ));
        $orderbook = $response['result'][$p['id']];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $timestamp = $order[2] * 1000;
                $result[$side][] = array ($price, $amount, $timestamp);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $darkpool = mb_strpos ($product, '.d') !== false;
        if ($darkpool)
            throw new TickerNotAvailableError ($this->id . ' does not provide a $ticker for $darkpool symbol ' . $product);
        $p = $this->product ($product);
        $response = $this->publicGetTicker (array (
            'pair' => $p['id'],
        ));
        $ticker = $response['result'][$p['id']];
        $timestamp = $this->milliseconds ();
        return array (
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
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['v'][1]),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
        $response = $this->privatePostBalance ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $xcode = 'X' . $currency; // X-ISO4217-A3 standard $currency codes
            $zcode = 'Z' . $currency;
            $balance = null;
            if (array_key_exists ($xcode, $balances))
                $balance = floatval ($balances[$xcode]);
            if (array_key_exists ($zcode, $balances))
                $balance = floatval ($balances[$zcode]);
            if (array_key_exists ($currency, $balances))
                $balance = floatval ($balances[$currency]);
            $account = array (
                'free' => $balance,
                'used' => null,
                'total' => $balance,
            );
            $result[$currency] = $account;
        }
        return $result;
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'ordertype' => $type,
            'volume' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostAddOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'txid' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $type . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            // a workaround for Kraken to replace the old CryptoJS block below, see issues #52 and #23
            $signature = $this->signForKraken ($url, $body, $this->secret, $nonce);
            // an old CryptoJS block that does not want to work properly under Node
            // $auth = $this->encode ($nonce . $body);
            // $query = $this->encode ($url) . $this->hash ($auth, 'sha256', 'binary');
            // $secret = base64_decode ($this->secret);
            // $signature = $this->hmac ($query, $secret, 'sha512', 'base64');
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Sign' => $signature,
                'Content-type' => 'application/x-www-form-urlencoded',
            );
        }
        $url = $this->urls['api'] . $url;
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class lakebtc extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'lakebtc',
            'name' => 'LakeBTC',
            'countries' => 'US',
            'version' => 'api_v2',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
                'api' => 'https://api.lakebtc.com',
                'www' => 'https://www.lakebtc.com',
                'doc' => array (
                    'https://www.lakebtc.com/s/api',
                    'https://www.lakebtc.com/s/api_v2',
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

    public function fetch_products () {
        $products = $this->publicGetTicker ();
        $result = array ();
        $keys = array_keys ($products);
        for ($k = 0; $k < count ($keys); $k++) {
            $id = $keys[$k];
            $product = $products[$id];
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
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privatePostGetAccountInfo ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetBcorderbook (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->publicGetTicker (array (
            'symbol' => $p['id'],
        ));
        $ticker = $tickers[$p['id']];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetBctrades (array (
            'symbol' => $this->product_id ($product)
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $method = 'privatePost' . $this->capitalize ($side) . 'Order';
        $productId = $this->product_id ($product);
        $order = array (
            'params' => array ($price, $amount, $productId),
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostCancelOrder (array ( 'params' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version;
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
                'Content-Type' => 'application/json',
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class livecoin extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'livecoin',
            'name' => 'LiveCoin',
            'countries' => array ( 'US', 'UK', 'RU' ),
            'rateLimit' => 1000,
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

    public function fetch_products () {
        $products = $this->publicGetExchangeTicker ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['symbol'];
            $symbol = $id;
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetPaymentBalances ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetExchangeOrderBook (array (
            'currencyPair' => $this->product_id ($product),
            'groupByPrice' => 'false',
            'depth' => 100,
        ));
        $timestamp = $orderbook['timestamp'];
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetExchangeTicker (array (
            'currencyPair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetExchangeLastTrades (array (
            'currencyPair' => $this->product_id ($product)
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side) . $type;
        $order = array (
            'currencyPair' => $this->product_id ($product),
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostExchangeCancellimit (array_merge (array (
            'orderId' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $length = 0;
            if ($params) {
                $query = $this->keysort ($params);
                $body = $this->urlencode ($query);
                $length = count ($body);
            }
            $body = $this->encode ($body || '');
            $signature = $this->hmac ($body, $this->encode ($this->secret), 'sha256');
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Sign' => strtoupper ($signature),
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => $length,
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class liqui extends btce {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'liqui',
            'name' => 'Liqui',
            'countries' => array ( 'UA', ),
            'rateLimit' => 1000,
            'version' => '3',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api' => array (
                    'public' => 'https://api.liqui.io/api',
                    'private' => 'https://api.liqui.io/tapi',
                ),
                'www' => 'https://liqui.io',
                'doc' => 'https://liqui.io/api',
            ),
        ), $options));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            $url .=  '/' . $this->version . '/' . $this->implode_params ($path, $params);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'method' => $path,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class luno extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'luno',
            'name' => 'luno',
            'countries' => array ( 'GB', 'SG', 'ZA', ),
            'rateLimit' => 3000,
            'version' => '1',
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

    public function fetch_products () {
        $products = $this->publicGetTickers ();
        $result = array ();
        for ($p = 0; $p < count ($products['tickers']); $p++) {
            $product = $products['tickers'][$p];
            $id = $product['pair'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = $this->commonCurrencyCode ($base);
            $quote = $this->commonCurrencyCode ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetBalance ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderbook (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $orderbook['timestamp'];
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['volume']);
                // $timestamp = $order[2] * 1000;
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $ticker['timestamp'];
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->product_id ($product)
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost';
        $order = array ( 'pair' => $this->product_id ($product) );
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
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostStoporder (array ( 'order_id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        if ($type == 'private') {
            $auth = $this->encode ($this->apiKey . ':' . $this->secret);
            $auth = base64_encode ($auth);
            $headers = array ( 'Authorization' => 'Basic ' . $this->decode ($auth) );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class mercado extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'mercado',
            'name' => 'Mercado Bitcoin',
            'countries' => 'BR', // Brazil
            'rateLimit' => 1000,
            'version' => 'v3',
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
                    'get' => array ( // last slash critical
                        'orderbook/',
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
            'products' => array (
                'BTC/BRL' => array ( 'id' => 'BRLBTC', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'suffix' => '' ),
                'LTC/BRL' => array ( 'id' => 'BRLLTC', 'symbol' => 'LTC/BRL', 'base' => 'LTC', 'quote' => 'BRL', 'suffix' => 'Litecoin' ),
            ),
        ), $options));
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $method = 'publicGetOrderbook' . $this->capitalize ($p['suffix']);
        $orderbook = $this->$method ();
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $method = 'publicGetV2Ticker' . $this->capitalize ($p['suffix']);
        $response = $this->$method ();
        $ticker = $response['ticker'];
        $timestamp = intval ($ticker['date']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        $p = $this->product ($product);
        $method = 'publicGetTrades' . $this->capitalize ($p['suffix']);
        return $this->$method ();
    }

    public function fetch_balance () {
        return $this->privatePostGetAccountInfo ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        $method = 'privatePostPlace' . $this->capitalize ($side) . 'Order';
        $order = array (
            'coin_pair' => $this->product_id ($product),
            'quantity' => $amount,
            'limit_price' => $price,
        );
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type] . '/';
        if ($type == 'public') {
            $url .= $path;
        } else {
            $url .= $this->version . '/';
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'tapi_method' => $path,
                'tapi_nonce' => $nonce,
            ), $params));
            $auth = '/tapi/' . $this->version  . '/' . '?' . $body;
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'TAPI-ID' => $this->apiKey,
                'TAPI-MAC' => $this->hmac ($this->encode ($auth), $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class okcoin extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'version' => 'v1',
            'rateLimit' => 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
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

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetDepth (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $this->sort_by ($orderbook['asks'], 0),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTicker (array (
            'symbol' => $this->product_id ($product),
        ));
        $ticker = $response['ticker'];
        $timestamp = intval ($response['date']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function fetch_balance () {
        return $this->privatePostUserinfo ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'symbol' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['type'] .= '_market';
        return $this->privatePostTrade (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api/' . $this->version . '/' . $path . '.do';
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $query = $this->keysort (array_merge (array (
                'api_key' => $this->apiKey,
            ), $params));
            // secret key must be at the end of $query
            $queryString = $this->urlencode ($query) . '&secret_key=' . $this->secret;
            $query['sign'] = strtoupper ($this->hash ($this->encode ($queryString)));
            $body = $this->urlencode ($query);
            $headers = array ( 'Content-type' => 'application/x-www-form-urlencoded' );
        }
        $url = $this->urls['api'] . $url;
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class okcoincny extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'okcoincny',
            'name' => 'OKCoin CNY',
            'countries' => 'CN',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
                'api' => 'https://www.okcoin.cn',
                'www' => 'https://www.okcoin.cn',
                'doc' => 'https://www.okcoin.cn/rest_getStarted.html',
            ),
            'products' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class okcoinusd extends okcoin {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'okcoinusd',
            'name' => 'OKCoin USD',
            'countries' => array ( 'CN', 'US' ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api' => 'https://www.okcoin.com',
                'www' => 'https://www.okcoin.com',
                'doc' => array (
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ),
            ),
            'products' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'LTC/USD' => array ( 'id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class paymium extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'paymium',
            'name' => 'Paymium',
            'countries' => array ( 'FR', 'EU', ),
            'rateLimit' => 2000,
            'version' => 'v1',
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
            'products' => array (
                'BTC/EUR' => array ( 'id' => 'eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privateGetUser ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetDataIdDepth  (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['price'];
                $amount = $order['amount'];
                $timestamp = $order['timestamp'] * 1000;
                $result[$side][] = array ($price, $amount, $timestamp);
            }
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetDataIdTicker (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $ticker['at'] * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetDataIdTrades (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'type' => $this->capitalize ($type) . 'Order',
            'currency' => $this->product_id ($product),
            'direction' => $side,
            'amount' => $amount,
        );
        if ($type == 'market')
            $order['price'] = $price;
        return $this->privatePostUserOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderNumber' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class poloniex extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'poloniex',
            'name' => 'Poloniex',
            'countries' => 'US',
            'rateLimit' => 500, // 6 calls per second
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
        ), $options));
    }

    public function fetch_products () {
        $products = $this->publicGetReturnTicker ();
        $keys = array_keys ($products);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products[$id];
            list ($quote, $base) = explode ('_', $id);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privatePostReturnCompleteBalances (array (
            'account' => 'all',
        ));
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetReturnOrderBook (array (
            'currencyPair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->publicGetReturnTicker ();
        $ticker = $tickers[$p['id']];
        $timestamp = $this->milliseconds ();
        return array (
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
            'last' => null,
            'change' => floatval ($ticker['percentChange']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['baseVolume']),
            'quoteVolume' => floatval ($ticker['quoteVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetReturnTradeHistory (array (
            'currencyPair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        return $this->$method (array_merge (array (
            'currencyPair' => $this->product_id ($product),
            'rate' => $price,
            'amount' => $amount,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderNumber' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        $query = array_merge (array ( 'command' => $path ), $params);
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class quadrigacx extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'quadrigacx',
            'name' => 'QuadrigaCX',
            'countries' => 'CA',
            'rateLimit' => 1000,
            'version' => 'v2',
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
            'products' => array (
                'BTC/CAD' => array ( 'id' => 'btc_cad', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETH/CAD' => array ( 'id' => 'eth_cad', 'symbol' => 'ETH/CAD', 'base' => 'ETH', 'quote' => 'CAD' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
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
        return $result;
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetOrderBook (array (
            'book' => $this->product_id ($product),
        ));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetTicker (array (
            'book' => $this->product_id ($product),
        ));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTransactions (array (
            'book' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'amount' => $amount,
            'book' => $this->product_id ($product),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->$method (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
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
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class quoine extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'quoine',
            'name' => 'QUOINE',
            'countries' => array ( 'JP', 'SG', 'VN' ),
            'version' => '2',
            'rateLimit' => 1000,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
                'api' => 'https://api.quoine.com',
                'www' => 'https://www.quoine.com',
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

    public function fetch_products () {
        $products = $this->publicGetProducts ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['id'];
            $base = $product['base_currency'];
            $quote = $product['quoted_currency'];
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetAccountsBalance ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetProductsIdPriceLevels (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buy_price_levels', 'asks' => 'sell_price_levels' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetProductsId (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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
            'last' => floatval ($ticker['last_traded_price']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_24h']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetExecutions (array (
            'product_id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'order_type' => $type,
            'product_id' => $this->product_id ($product),
            'side' => $side,
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostOrders (array_merge (array (
            'order' => $order,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePutOrdersIdCancel (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        $headers = array (
            'X-Quoine-API-Version' => $this->version,
            'Content-type' => 'application/json',
        );
        if ($type == 'public') {
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
        return $this->fetch ($this->urls['api'] . $url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class southxchange extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'southxchange',
            'name' => 'SouthXchange',
            'countries' => 'AR', // Argentina
            'rateLimit' => 1000,
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

    public function fetch_products () {
        $products = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $base = $product[0];
            $quote = $product[1];
            $symbol = $base . '/' . $quote;
            $id = $symbol;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privatePostListBalances ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetBookSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'BuyOrders', 'asks' => 'SellOrders' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['Price']);
                $amount = floatval ($order['Amount']);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetPriceSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['Bid']),
            'ask' => floatval ($ticker['Ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['Last']),
            'change' => floatval ($ticker['Variation24Hr']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['Volume24Hr']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->publicGetTradesSymbol (array (
            'symbol' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $order = array (
            'listingCurrency' => $p['base'],
            'referenceCurrency' => $p['quote'],
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limitPrice'] = $price;
        return $this->privatePostPlaceOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderCode' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'private') {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
            ), $query);
            $body = $this->json ($query);
            $headers = array (
                'Content-Type' => 'application/json',
                'Hash' => $this->hmac ($this->encode ($body), $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class surbitcoin extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'surbitcoin',
            'name' => 'SurBitcoin',
            'countries' => 'VE',
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
            'products' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class therock extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'therock',
            'name' => 'TheRockTrading',
            'countries' => 'MT',
            'rateLimit' => 1000,
            'version' => 'v1',
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

    public function fetch_products () {
        $products = $this->publicGetFundsTickers ();
        $result = array ();
        for ($p = 0; $p < count ($products['tickers']); $p++) {
            $product = $products['tickers'][$p];
            $id = $product['fund_id'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetBalances ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->publicGetFundsIdOrderbook (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->parse8601 ($orderbook['date']);
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['amount']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->publicGetFundsIdTicker (array (
            'id' => $this->product_id ($product),
        ));
        $timestamp = $this->parse8601 ($ticker['date']);
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetFundsIdTrades (array (
            'id' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        return $this->privatePostFundsFundIdOrders (array_merge (array (
            'fund_id' => $this->product_id ($product),
            'side' => $side,
            'amount' => $amount,
            'price' => $price,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privateDeleteFundsFundIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'private') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class urdubit extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'urdubit',
            'name' => 'UrduBit',
            'countries' => 'PK',
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
            'products' => array (
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class vaultoro extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'vaultoro',
            'name' => 'Vaultoro',
            'countries' => 'CH',
            'rateLimit' => 1000,
            'version' => '1',
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

    public function fetch_products () {
        $result = array ();
        $products = $this->publicGetMarkets ();
        $product = $products['data'];
        $base = $product['BaseCurrency'];
        $quote = $product['MarketCurrency'];
        $symbol = $base . '/' . $quote;
        $baseId = $base;
        $quoteId = $quote;
        $id = $product['MarketName'];
        $result[] = array (
            'id' => $id,
            'symbol' => $symbol,
            'base' => $base,
            'quote' => $quote,
            'baseId' => $baseId,
            'quoteId' => $quoteId,
            'info' => $product,
        );
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetBalance ();
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderbook ();
        $orderbook = array (
            'bids' => $response['data'][0]['b'],
            'asks' => $response['data'][1]['s'],
        );
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = $order['Gold_Price'];
                $amount = $order['Gold_Amount'];
                $result[$side][] = array ($price, $amount);
            }
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        return $result;
    }

    public function fetch_ticker ($product) {
        $quote = $this->publicGetBidandask ();
        $bidsLength = count ($quote['bids']);
        $bid = $quote['bids'][$bidsLength - 1];
        $ask = $quote['asks'][0];
        $response = $this->publicGetMarkets ();
        $ticker = $response['data'];
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTransactionsDay ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $method = 'privatePost' . $this->capitalize ($side) . 'SymbolType';
        return $this->$method (array_merge (array (
            'symbol' => strtolower ($p['quoteId']),
            'type' => $type,
            'gld' => $amount,
            'price' => $price || 1,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($type == 'public') {
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
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class vbtc extends blinktrade {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'vbtc',
            'name' => 'VBTC',
            'countries' => 'VN',
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
            'products' => array (
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC', ),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class virwox extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'virwox',
            'name' => 'VirWoX',
            'countries' => 'AT',
            'rateLimit' => 1000,
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

    public function fetch_products () {
        $products = $this->publicGetInstruments ();
        $keys = array_keys ($products['result']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $product = $products['result'][$keys[$p]];
            $id = $product['instrumentID'];
            $symbol = $product['symbol'];
            $base = $product['longCurrency'];
            $quote = $product['shortCurrency'];
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privatePostGetBalances ();
    }

    public function fetchBestPrices ($product) {
        return $this->publicPostGetBestPrices (array (
            'symbols' => array ($this->symbol ($product)),
        ));
    }

    public function fetch_order_book ($product) {
        $response = $this->publicPostGetMarketDepth (array (
            'symbols' => array ($this->symbol ($product)),
            'buyDepth' => 100,
            'sellDepth' => 100,
        ));
        $orderbook = $response['result'][0];
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ( 'bids' => 'buy', 'asks' => 'sell' );
        $keys = array_keys ($sides);
        for ($k = 0; $k < count ($keys); $k++) {
            $key = $keys[$k];
            $side = $sides[$key];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['price']);
                $amount = floatval ($order['volume']);
                $result[$key][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $end = $this->milliseconds ();
        $start = $end - 86400000;
        $response = $this->publicGetTradedPriceVolume (array (
            'instrument' => $this->symbol ($product),
            'endDate' => $this->yyyymmddhhmmss ($end),
            'startDate' => $this->yyyymmddhhmmss ($start),
            'HLOC' => 1,
        ));
        $tickers = $response['result']['priceVolumeList'];
        $keys = array_keys ($tickers);
        $length = count ($keys);
        $lastKey = $keys[$length - 1];
        $ticker = $tickers[$lastKey];
        $timestamp = $this->milliseconds ();
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => null,
            'ask' => null,
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

    public function fetch_trades ($product) {
        return $this->publicGetRawTradeData (array (
            'instrument' => $this->symbol ($product),
            'timespan' => 3600,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'instrument' => $this->symbol ($product),
            'orderType' => strtoupper ($side),
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostPlaceOrder (array_merge ($order, $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderID' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        $auth = array ();
        if ($type == 'public') {
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
            $headers = array ( 'Content-type' => 'application/json' );
            $body = $this->json (array (
                'method' => $path,
                'params' => array_merge ($auth, $params),
                'id' => $nonce,
            ));
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class xbtce extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'xbtce',
            'name' => 'xBTCe',
            'countries' => 'RU',
            'rateLimit' => 2000, // responses are cached every 2 seconds
            'version' => 'v1',
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

    public function fetch_products () {
        $products = $this->privateGetSymbol ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['Symbol'];
            $base = $product['MarginCurrency'];
            $quote = $product['ProfitCurrency'];
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $symbol = $product['IsTradeAllowed'] ? $symbol : $id;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetAsset ();
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->privateGetLevel2Filter (array (
            'filter' => $p['id'],
        ));
        $orderbook = $orderbook[0];
        $timestamp = $orderbook['Timestamp'];
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $Side = $this->capitalize ($side);
            $orders = $orderbook[$Side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order['Price']);
                $amount = floatval ($order['Volume']);
                $result[$side][] = array ($price, $amount);
            }
        }
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->privateGetTickFilter (array (
            'filter' => $p['id'],
        ));
        $tickers = $this->index_by ($tickers, 'Symbol');
        $ticker = $tickers[$p['id']];
        $timestamp = $ticker['Timestamp'];
        $bid = null;
        $ask = null;
        if (array_key_exists ('BestBid', $ticker))
            $bid = $ticker['BestBid']['Price'];
        if (array_key_exists ('BestAsk', $ticker))
            $ask = $ticker['BestAsk']['Price'];
        return array (
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
    }

    public function fetch_trades ($product) {
        // no method for trades?
        return $this->privateGetTrade ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        return $this->tapiPostTrade (array_merge (array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->privateDeleteTrade (array_merge (array (
            'Type' => 'Cancel',
            'Id' => $id,
        ), $params));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function request ($path, $type = 'api', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests, their public API is always busy');
        if (!$this->uid)
            throw new AuthenticationError ($this->id . ' requires uid property for authentication and trading');
        $url = $this->urls['api'] . '/' . $this->version;
        if ($type == 'public')
            $url .= '/' . $type;
        $url .= '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = $this->json ($query);
            else
                $body = '';
            $auth = $nonce . $this->uid . $this->apiKey . $method . $url . $body;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha256', 'base64');
            $credentials = implode (':', array ($this->uid, $this->apiKey, $nonce, $signature));
            $headers = array (
                'Accept-Encoding' => 'gzip, deflate',
                'Authorization' => 'HMAC ' . $credentials,
                'Content-Type' => 'application/json',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class yobit extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'yobit',
            'name' => 'YoBit',
            'countries' => 'RU',
            'rateLimit' => 2000, // responses are cached every 2 seconds
            'version' => '3',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api' => 'https://yobit.net',
                'www' => 'https://www.yobit.net',
                'doc' => 'https://www.yobit.net/en/api/',
            ),
            'api' => array (
                'api' => array (
                    'get' => array (
                        'depth/{pairs}',
                        'info',
                        'ticker/{pairs}',
                        'trades/{pairs}',
                    ),
                ),
                'tapi' => array (
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
        ), $options));
    }

    public function fetch_products () {
        $products = $this->apiGetInfo ();
        $keys = array_keys ($products['pairs']);
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $product = $products['pairs'][$id];
            $symbol = str_replace ('_', '/', strtoupper ($id));
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->tapiPostGetInfo ();
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->apiGetDepthPairs (array (
            'pairs' => $p['id'],
        ));
        $orderbook = $response[$p['id']];
        $timestamp = $this->milliseconds ();
        $bids = (array_key_exists ('bids', $orderbook)) ? $orderbook['bids'] : array ();
        $asks = (array_key_exists ('asks', $orderbook)) ? $orderbook['asks'] : array ();
        $result = array (
            'bids' => $bids,
            'asks' => $asks,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $tickers = $this->apiGetTickerPairs (array (
            'pairs' => $p['id'],
        ));
        $ticker = $tickers[$p['id']];
        $timestamp = $ticker['updated'] * 1000;
        return array (
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
            'average' => floatval ($ticker['avg']),
            'baseVolume' => floatval ($ticker['vol_cur']),
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function fetch_trades ($product) {
        return $this->apiGetTradesPairs (array (
            'pairs' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        return $this->tapiPostTrade (array_merge (array (
            'pair' => $this->product_id ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->tapiPostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'api', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $type;
        if ($type == 'api') {
            $url .= '/' . $this->version . '/' . $this->implode_params ($path, $params);
            $query = $this->omit ($params, $this->extract_params ($path));
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ( 'method' => $path, 'nonce' => $nonce ), $params);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class yunbi extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'yunbi',
            'name' => 'YUNBI',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v2',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg',
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

    public function fetch_products () {
        $products = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['id'];
            $symbol = $product['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
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
                'total' => null,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$uppercase] = $account;
        }
        return $result;
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $orderbook = $this->publicGetDepth (array (
            'market' => $p['id'],
        ));
        $timestamp = $orderbook['timestamp'] * 1000;
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        $sides = array ('bids', 'asks');
        for ($s = 0; $s < count ($sides); $s++) {
            $side = $sides[$s];
            $orders = $orderbook[$side];
            for ($i = 0; $i < count ($orders); $i++) {
                $order = $orders[$i];
                $price = floatval ($order[0]);
                $amount = floatval ($order[1]);
                $result[$side][] = array ($price, $amount);
            }
        }
        $result['bids'] = $this->sort_by ($result['bids'], 0, true);
        $result['asks'] = $this->sort_by ($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($product) {
        $response = $this->publicGetTickersMarket (array (
            'market' => $this->product_id ($product),
        ));
        $ticker = $response['ticker'];
        $timestamp = $response['at'] * 1000;
        return array (
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

    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'market' => $this->product_id ($product),
            'side' => $side,
            'volume' => $amount,
            'ord_type' => $type,
        );
        if ($type == 'market') {
            $order['price'] = $price;
        }
        return $this->privatePostOrders (array_merge ($order, $params));
    }

    public function cancel_order ($id) {
        return $this->privatePostOrderDelete (array ( 'id' => $id ));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/api/' . $this->version . '/' . $this->implode_params ($path, $params) . '.json';
        $query = $this->omit ($params, $this->extract_params ($path));
        $url = $this->urls['api'] . $request;
        if ($type == 'public') {
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
                $headers = array (
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Content-Length' => strlen ($body),
                );
            }
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class zaif extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'zaif',
            'name' => 'Zaif',
            'countries' => 'JP',
            'rateLimit' => 2000,
            'version' => '1',
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
                'api' => array (
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
                'tapi' => array (
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

    public function fetch_products () {
        $products = $this->apiGetCurrencyPairsAll ();
        $result = array ();
        for ($p = 0; $p < count ($products); $p++) {
            $product = $products[$p];
            $id = $product['currency_pair'];
            $symbol = $product['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product,
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->tapiPostGetInfo ();
    }

    public function fetch_order_book ($product) {
        $orderbook = $this->apiGetDepthPair  (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => $orderbook['bids'],
            'asks' => $orderbook['asks'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        return $result;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->apiGetTickerPair (array (
            'pair' => $this->product_id ($product),
        ));
        $timestamp = $this->milliseconds ();
        return array (
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

    public function fetch_trades ($product) {
        return $this->apiGetTradesPair (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new \Exception ($this->id . ' allows limit orders only');
        return $this->tapiPostTrade (array_merge (array (
            'currency_pair' => $this->product_id ($product),
            'action' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
            'price' => $price,
        ), $params));
    }

    public function cancel_order ($id, $params = array ()) {
        return $this->tapiPostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'api', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $type;
        if ($type == 'api') {
            $url .= '/' . $this->version . '/' . $this->implode_params ($path, $params);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

?>