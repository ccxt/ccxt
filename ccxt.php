<?php

namespace ccxt;

class Market {

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

    public static function index_by ($arrayOfArrays, $key) {
        $result = array ();
        foreach ($arrayOfArrays as $array)
            $result[$array[$key]] = $array;
        return $result;
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
        list ($yyyy, $mm, $dd, $h, $m, $s, $ms, $sign, $hours, $minutes) = $matches;
        $ms = $ms or '.000';
        $sign = $sign or '';
        $sign = intval ($sign . '1');
        $hours = (intval ($hours) or 0) * $sign;
        $minutes = (intval ($minutes) or 0) * $sign;
        $t = mktime ($h, $m, $s, $mm, $dd, $yyyy, 0);
        $t += $hours * 3600 + $minutes * 60;
        $t *= 1000;
        return $t;
    }

    public static function yyyymmddhhmmss ($timestamp) {
        return gmdate ('YmdHis', (int) round ($timestamp / 1000));
    }

    public function nonce () {
        return $this->seconds ();
    }

    public function __construct ($options) {
        $this->curl      = curl_init ();
        $this->id        = null;
        $this->rateLimit = 2000;
        $this->timeout   = 10; // in seconds

        if ($options)
            foreach ($options as $key => $value)
                $this->$key = $value;

        $this->verbose = $this->log || $this->debug || ($this->verbosity == 1) || $this->verbose;

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

    public function jwt ($request, $secret, $alg = 'HS256', $hash = 'sha256') {
        $encodedHeader = $this->urlencodeBase64 (json_encode (array ('alg' => $alg, 'typ' => 'JWT')));
        $encodedData = $this->urlencodeBase64 (json_encode ($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        $signature = $this->urlencodeBase64 ($this->hmac ($token, $secret, $hash, 'binary'));
        return $token . '.' . $signature;
    }

    public function fetch ($url, $method = 'GET', $headers = null, $body = null) {

        /*
            try {
                return JSON.parse (response)
            } catch (e) {
                var cloudflareProtection = response.match (/cloudflare/i) ? 'DDoS protection by Cloudflare' : ''
                if ($this->verbose)
                    console.log ($this->id, response, cloudflareProtection, e)
                throw e
            }
        */

        if (!$headers)
            $headers = array ();
        elseif (is_array ($headers)) {
            $tmp = $headers;
            $headers = array ();
            foreach ($tmp as $key => $value)
                $headers[] = $key . ': ' . $value;
        }

        if ($this->verbose)
            var_dump ($url, $method, $headers, $body);

        curl_setopt ($this->curl, CURLOPT_URL, $url);

        if ($this->timeout) {
            // curl_setopt ($this->curl, CURLOPT_CONNECTTIMEOUT, 0); 
            curl_setopt ($this->curl, CURLOPT_TIMEOUT, $this->timeout); // seconds
        }

        curl_setopt ($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt ($this->curl, CURLOPT_SSL_VERIFYPEER, false);

        $userAgent = 'ccxt/0.1.0 (+https://github.com/kroitor/ccxt) PHP/' . PHP_VERSION;
        curl_setopt ($this->curl, CURLOPT_USERAGENT, $userAgent);

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
        if (!$result && trigger_error ($method . ' `' . $url . '`: ' . curl_error ($this->curl)))
            return false;
            
        return json_decode ($result, $jsonDecodeAsAssociativeArray = true);
    }

    public function loadProducts ($reload = false) {
        return $this->load_products ($reload);
    }

    public function load_products ($reload = false) {
        if (!$reload && $this->products) return $this->products;
        return $this->products = $this->indexBy ($this->fetch_products (), 'symbol');
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

    public function buy ($product, $amount, $price = null, $params = array ()) {
        return $this->order ($product, 'buy',  $amount, $price, $params);
    }

    public function sell ($product, $amount, $price = null, $params = array ()) {
        return $this->order ($product, 'sell', $amount, $price, $params);
    }

    public function trade ($product, $side, $amount, $price = null, $params = array ()) {
        return $this->order ($product, $side, $amount, $price, $params);
    }

    public function order ($product, $side, $amount, $price = null, $params = array ()) { 
        return $this->createOrder ($product, $price ? 'market' : 'limit', $side, $amount, $price, $params);
    }

    public function create_buy_order ($product, $type, $amount, $price = null, $params = array ()) {
        return $this->createOrder ($product, $type, 'buy', $amount, $price, $params);
    }

    public function create_sell_order ($product, $type, $amount, $price = null, $params = array ()) {
        return $this->createOrder ($product, $type, 'sell', $amount, $price, $params);
    }

    public function create_limit_buy_order ($product, $amount, $price, $params = array ()) {
        return $this->createLimitOrder ($product, 'buy',  $amount, $price, $params);
    }

    public function create_limit_sell_order ($product, $amount, $price, $params = array ()) {
        return $this->createLimitOrder ($product, 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order ($product, $amount, $params = array ()) {
        return $this->create_market_order ($product, 'buy', $amount, $params);
    }

    public function create_market_sell_order ($product, $amount, $params = array ()) {
        return $this->create_market_order ($product, 'sell', $amount, $params);
    }

    public function create_limit_order ($product, $side, $amount, $price, $params = array ()) {
        return $this->createOrder ($product, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order ($product, $side, $amount, $params = array ()) {
        return $this->createOrder ($product, 'market', $side, $amount, null, $params);
    }

    public function createBuyOrder ($product, $type, $amount, $price = null, $params = array ()) {
        return $this->create_buy_order ($product, $type, $amount, $price, $params);
    }

    public function createSellOrder ($product, $type, $amount, $price = null, $params = array ()) {
        return $this->create_sell_order ($product, $type, $amount, $price, $params);
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

    public function createLimitOrder ($product, $side, $amount, $price, $params = array ()) {
        return $this->create_limit_order ($product, $side, $amount, $price, $params);
    }

    public function createMarketOrder ($product, $side, $amount, $params = array ()) {
        return $this->create_market_order ($product, $side, $amount, $params);
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
            'rateLimit' => 2000,
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
        $categories = $this->fetchCategories ();
        $result = array ();
        for ($c = 0; $c < count ($categories); $c++) {
            $category = $categories[$c];
            $products = $this->privateGetMarketList (array ( 
                'category' => strtolower ($category),
            ));
            for ($p = 0; $p < count ($products['response']); $p++) {
                $product = $products['response'][$p];
                if (($category == 'FOREX') || ($category == 'CRYPTO')) {
                    $id = $product['symbol'];
                    $symbol = $product['name'];
                    list ($base, $quote) = explode ('/', $symbol);
                    $result[] = array (
                        'id' => $id,
                        'symbol' => $symbol,
                        'base' => $base,
                        'quote' => $quote,
                        'info' => $product,
                    );
                } else {
                    $id = $product['symbol'];
                    $symbol = $product['symbol'];
                    $name = $product['name'];
                    $type = strtolower ($product['type']);
                    $result[] = array (
                        'id' => $id,
                        'symbol' => $symbol,
                        'name' => $name,
                        'type' => $type,
                        'info' => $product,
                    );
                }
            }
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetUserOverview ();
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
            'bid' => $orderbook['bids'][0]['price'],
            'ask' => $orderbook['asks'][0]['price'],
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
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
            'comment' => 'Crypto Capital API',
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

    public function fetch_balance () {
        return $this->privatePostBalancesAndInfo ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $query = array_merge (array (
                'api_key' => $this->apiKey,
                'nonce' => $this->nonce (),
            ), $params);
            $query['signature'] = $this->hmac (json_encode ($query), $this->secret);
            $body = json_encode ($query);
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
            'rateLimit' => 2000,
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
        return $this->privatePostMoneyInfo ();
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetCurrencyPairMoneyDepthFull (array (
            'currency_pair' => $this->product_id ($product),
        ));
        $orderbook = $response['data'];
        $timestamp = intval ($orderbook['dataUpdateTime']) / 1000;
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
        $timestamp = intval ($ticker['dataUpdateTime'] / 1000);
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']['value']),
            'low' => floatval ($ticker['low']['value']),
            'bid' => floatval ($ticker['buy']['value']),
            'ask' => floatval ($ticker['sell'])['value'],
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
                'Rest-Sign' => $this->hmac ($auth, $secret, 'sha512', 'base64'),
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
        return $this->privatePostAccountBalanceV2 ();
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
                'sign' => $this->hmac ($body, $this->secret, 'sha512', 'base64'),
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
        return $this->privatePostInfo ();
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
                'API-Hash' => $this->hmac ($body, $this->secret, 'sha512'),
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
            'rateLimit' => 2000,
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
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
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
                    'https://vip.bitcoin.co.id/trade_api',
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
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
        return $this->privatePostGetInfo ();
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
            'vwap' => floatval ($ticker['vwap']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['average']),
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
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
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
            'rateLimit' => 2000,
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
        return $this->privatePostBalances ();
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
        return $this->privatePostOrderNew (array_merge (array (
            'symbol' => $this->product_id ($product),
            'amount' => (string) $amount,
            'price' => (string) $price,
            'side' => $side,
            'type' => 'exchange ' . $type,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        ), $params));
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
            $payload = base64_encode (json_encode ($query));
            $headers = array (
                'X-BFX-APIKEY' => $this->apiKey,
                'X-BFX-PAYLOAD' => $payload,
                'X-BFX-SIGNATURE' => $this->hmac ($payload, $this->secret, 'sha384'),
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
            'rateLimit' => 2000,    
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
        return $this->privatePostBalance ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $body = json_encode (array_merge (array ( 'token' => $this->apiKey ), $params));
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
            'rateLimit' => 3000,
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
                'LMX/BTC' => array ( 'id' => 'LiteMineXBTC', 'symbol' => 'LMX/BTC', 'base' => 'LMX', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostInfo ();
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
                'API-Hash' => $this->hmac ($body, $this->secret, 'sha512'),
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
            'rateLimit' => 2000,
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
        return $this->privateGetUserMargin (array ( 'currency' => 'all' ));
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
        // TODO sort bidasks
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/api/' . $this->version . '/' . $path;
        if ($params)
            $query .= '?' . $this->urlencode ($params);
        $url = $this->urls['api'] . $query;
        if ($type == 'private') {
            $nonce = (string) $this->nonce ();
            if ($method == 'POST')
                if ($params)
                    $body = json_encode ($params);
            $request = implode ('', array ($method, $query, $nonce, $body || ''));
            $headers = array (
                'Content-Type' => 'application/json',
                'api-nonce' => $nonce,
                'api-key' => $this->apiKey,
                'api-signature' => $this->hmac ($request, $this->secret),
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
        return $this->privateGetBalance ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $query;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            if ($params)
                $body = json_encode ($params);
            $nonce = (string) $this->nonce ();
            $request = implode ('', array ($nonce, $method, $query, $body || ''));
            $signature = $this->hmac ($request, $this->secret);
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
        return $this->privatePostBalance ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($auth, $this->secret);
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
            'rateLimit' => 2000,
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
            $base = $product['BaseCurrency'];
            $quote = $product['MarketCurrency'];
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
        return $this->accountGetBalances ();
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
            $headers = array ( 'apisign' => $this->hmac ($url, $this->secret, 'sha512') );
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
            'rateLimit' => 3000,
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
        return $this->privatePostGetAccountInfo ();
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
        // TODO sort bidasks
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

    public function nonce () {
        return $this->microseconds ();
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type] . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
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
            $body = json_encode ($request);
            $query = (
                'tonce=' . $nonce .
                '&accesskey=' . $this->apiKey .
                '&requestmethod=' . strtolower ($method) .
                '&id=' . $nonce .
                '&$method=' . $path .
                '&$params=' . $p
            );
            $signature = $this->hmac ($query, $this->secret, 'sha1');
            $auth = $this->apiKey . ':' . $signature; 
            $headers = array (
                'Content-Length' => strlen ($body),
                'Authorization' => 'Basic ' . base64_encode ($query),
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
                'api' => 'https://btc-e.com/api',
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
            list ($base, $quote) = explode ('_');
            $base = strtoupper ($base);
            $quote = strtoupper ($quote, $id);
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
        return $this->privatePostGetInfo ();
    }

    public function fetch_order_book ($product) {
        $p = $this->product ($product);
        $response = $this->publicGetDepthPair (array (
            'pair' => $p['id'],
        ));
        $orderbook = $response[$p['id']]; 
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
        $tickers = $this->publicGetTickerPair (array (
            'pair' => $p['id'],
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class btcx extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'btcx',
            'name' => 'BTCX',
            'countries' => array ( 'IS', 'US', 'EU', ),
            'rateLimit' => 3000, // support in english is very poor, unable to tell rate limits
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
        return $this->privatePostBalance ();
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
                'Signature' => $this->hmac ($body, $this->secret, 'sha512'),
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
            'rateLimit' => 2000,
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

    public function fetch_balance () {
        return $this->privatePostBalance ();
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
        $p = $this->product ($product);
        $tickers = $this->publicGet (array ( 'pairing' => $p['id'] ));
        $ticker = $tickers[$p['id']];
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path . '/';
        if ($params)
            $url .= '?' . $this->urlencode ($params);
        if ($type == 'private') {
            $nonce = $this->nonce ();
            $signature = $this->hash ($this->apiKey . $nonce . $this->secret, 'sha256');
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
            'rateLimit' => 2000,
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
        return $this->privateGetBalances ();
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
            $headers = array ( 'apisign' => $this->hmac ($url, $this->secret, 'sha512') );
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
            'rateLimit' => 2000,
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
        return $this->privatePostBalance ();
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
            'change' => floatval ($ticker['change']),
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {   
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($this->hmac ($nonce . $this->uid . $this->apiKey, $this->secret)),
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

class coincheck extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'coincheck',
            'name' => 'coincheck',
            'countries' => array ( 'JP', 'ID', ),
            'rateLimit' => 2000,
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
        return $this->privateGetAccountsBalance ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = $this->urlencode ($this->keysort ($query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-NONCE' => $nonce,
                'ACCESS-SIGNATURE' => $this->hmac ($nonce . $url . ($body || ''), $this->secret)
            );
        }
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
                    'https://coinmate.io/developers',
                    'http://docs.coinmate.apiary.io/#reference',
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
        return $this->privatePostBalances ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $auth = implode (' ', array ($nonce, $this->uid, $this->apiKey));
            $signature = $this->hmac ($auth, $this->secret);
            $body = $this->urlencode (array_merge (array (
                'clientId' => $this->uid,
                'nonce' => $nonce,
                'publicKey' => $this->apiKey,
                'signature' => strtoupper ($signature),
            ), $params));
            $headers = array (
                'Content-Type' =>  'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
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
        return $this->privateGetUserExchangeBankSummary ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'private') {
            $headers = array ( 'Authorization' => $this->apiKey );
            if ($query) {
                $body = json_encode ($query);
                $headers['Content-Type'] = 'application/json';
            }
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
        return $this->privatePostUserInfo ();
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
            'open' => floatval ($ticker['open']),
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
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------

class fyb extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'rateLimit' => 2000,
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
            'quoteVolume' => floatval ($ticker['vol']),
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
                'sig' => $this->hmac ($body, $this->secret, 'sha1')
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

class gdax extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'gdax',
            'name' => 'GDAX',
            'countries' => 'US',
            'rateLimit' => 1000,
            'urls' => array (
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
        return array (
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($quote['high']),
            'low' => floatval ($quote['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
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
        $order = array (
            'client_oid' => $this->nonce (),
            'product_id' => $this->product_id ($product),
            'side' => $side,
            'size' => $amount,
            'type' => $type,            
        );
        if ($type == 'limit')
            $order['price'] = $price;
        return $this->privatePostOrder (array_merge ($order, $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params ($path, $params);
        $url = $this->urls['api'] . $request;
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = json_encode ($query);
            $what = $nonce . $method . $request . ($body || '');
            $secret = base64_decode ($this->secret);
            $signature = $this->hash ($what, $secret, 'sha256', 'binary');
            $headers = array (
                'CB-ACCESS-KEY' => $this->apiKey,
                'CB-ACCESS-SIGN' => base64_encode ($signature),
                'CB-ACCESS-TIMESTAMP' => $nonce,
                'CB-ACCESS-PASSPHRASE' => $this->password,
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
            'rateLimit' => 2000, // 200 for private API
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
            throw new Exception ($this->id . ' allows limit orders only');
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
            $payload = base64_encode (json_encode ($request));
            $signature = $this->hmac ($payload, $this->secret, 'sha384');
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
            'rateLimit' => 2000,
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
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'X-Signature' => strtolower ($this->hmac ($url . ($body || ''), $this->secret, 'sha512')),
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
            'rateLimit' => 5000,
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
            $query['sign'] = $this->hash ($queryString);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        } else {
            $url .= '/' . $type . '/' . $this->implode_params ($path, $params) . '_json.js';
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
            'rateLimit' => 3000,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api' => 'https://api.itbit.com',
                'www' => 'https://www.itbit.com',
                'doc' => array (
                    'https://www.itbit.com/api',
                    'https://api.itbit.com/docs',
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
                        'wallets/{walletId}/orders/{orderId}',
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
                        'wallets/{walletId}/orders/{orderId}',
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
            throw new Exception ($this->id . ' allows limit orders only');
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if ($query)
                $body = json_encode ($query);
            else
                $body = '';
            $nonce = (string) $this->nonce ();
            $timestamp = $nonce;
            $auth = array ($method, $url, $body, $nonce, $timestamp);
            $message = $nonce . json_encode ($auth);
            $hashedMessage = $this->hash ($message, 'sha256', 'binary');
            $signature = $this->hmac ($url . $hashedMessage, $this->secret, 'sha512', 'base64');
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
            'rateLimit' => 2000,
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
            $query['signature'] = $this->hmac ($this->urlencode ($query), $this->hash ($this->secret));
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
            'rateLimit' => 3000,
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
        return $this->privatePostBalance ();
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $type . '/' . $path;
        if ($type == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $query = array_merge (array ( 'nonce' => $nonce ), $params);
            $body = $this->urlencode ($query);
            $query = $url . $this->hash ($nonce . $body, 'sha256', 'binary');
            $secret = base64_decode ($this->secret);
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Sign' => $this->hmac ($query, $secret, 'sha512', 'base64'),
                'Content-type' => 'application/x-www-form-urlencoded',
            );
        }
        $url = $this->urls['api'] . $url;
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
            'rateLimit' => 5000,
            'version' => '1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api' => 'https://api.mybitx.com/api',
                'www' => 'https://www.luno.com',
                'doc' => array (
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

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        if ($type == 'private') {
            $auth = base64_encode ($this->apiKey . ':' . $this->secret);
            $headers = array ( 'Authorization' => 'Basic ' . $auth );
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
            throw new Exception ($this->id . ' allows limit orders only');
        $method = 'privatePostPlace' . $this->capitalize ($side) . 'Order';
        $order = array (
            'coin_pair' => $this->product_id ($product),
            'quantity' => $amount,
            'limit_price' => $price,
        );
        return $this->$method (array_merge ($order, $params));        
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
                'TAPI-MAC' => $this->hmac ($auth, $this->secret, 'sha512'),
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
            'rateLimit' => 2000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
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
            'asks' => $orderbook['asks'],
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
            $query['sign'] = strtoupper ($this->hash ($queryString));
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
            'rateLimit' => 3000,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
                'api' => 'https://paymium.com/api',
                'www' => 'https://www.paymium.com',
                'doc' => array (
                    'https://www.paymium.com/page/developers',
                    'https://github.com/Paymium/api-documentation',
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
        $response = $this->publicGetDataIdDepth  (array (
            'id' => $this->product_id ($product),
        ));
        return $response;
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
            $body = json_encode ($params);
            $nonce = (string) $this->nonce ();            
            $auth = $nonce . $url . $body;
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Api-Signature' => $this->hmac ($auth, $this->secret),
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
            'rateLimit' => 1000, // 6 calls per second
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
        return $this->privatePostReturnCompleteBalances (array (
            'account' => 'all',
        ));
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetReturnOrderBook (array (
            'currencyPair' => $this->product_id ($product),
        ));
        return $response;
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
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
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
            'rateLimit' => 2000,
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
        return $this->privatePostBalance ();
    }

    public function fetch_order_book ($product) {
        $response = $this->publicGetOrderBook (array (
            'book' => $this->product_id ($product),
        ));
        return $response;
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
        return $this->privatePostCancelOrder (array_merge (array ( $id ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type == 'public') {
            $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $request = implode ('', array ($nonce, $this->uid, $this->apiKey));
            $signature = $this->hmac ($request, $this->secret);
            $query = array_merge (array ( 
                'key' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
            ), $params);
            $body = json_encode ($query);
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
            'rateLimit' => 2000,
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
        $response = $this->publicGetProductsIdPriceLevels (array (
            'id' => $this->product_id ($product),
        ));
        return $response;
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
                $body = json_encode ($query);
            $headers['X-Quoine-Auth'] = $this->jwt ($request, $this->secret);
        }
        return $this->fetch ($this->urls['api'] . $url, $method, $headers, $body);
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
                'doc' => 'https://api.therocktrading.com/doc/',
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
        $response = $this->publicGetFundsIdOrderbook (array (
            'id' => $this->product_id ($product),
        ));
        return $response;
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
            throw new Exception ($this->id . ' allows limit orders only');
        return $this->privatePostFundsFundIdOrders (array_merge (array (
            'fund_id' => $this->product_id ($product),
            'side' => $side,
            'amount' => $amount,
            'price' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params ($path, $params);
        $query = $this->omit ($params, $this->extract_params ($path));
        if ($type == 'private') {
            $nonce = (string) $this->nonce ();
            $headers = array (
                'X-TRT-KEY' => $this->apiKey,
                'X-TRT-NONCE' => $nonce,
                'X-TRT-SIGN' => $this->hmac ($nonce . $url, $this->secret, 'sha512'),
            );
            if ($query) {
                $body = json_encode ($query);
                $headers['Content-Type'] = 'application/json';
            }
        }
        return $this->fetch ($url, $method, $headers, $body);
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
                        'cancel/{orderid',
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
        return $response;
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
            'last' => floatval ($ticker['lastPrice']),
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
                'X-Signature' => $this->hmac ($url, $this->secret)
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
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
        return $response;
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
            $body = json_encode (array ( 
                'method' => $path, 
                'params' => array_merge ($auth, $params),
                'id' => $nonce,
            ));
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
        $response = $this->apiGetDepthPairs (array (
            'pairs' => $this->product_id ($product),
        ));
        return $response;
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
            throw new Exception ($this->id . ' allows limit orders only');
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
                'sign' => $this->hmac ($body, $this->secret, 'sha512'),
            );
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
            'rateLimit' => 3000,
            'version' => '1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
                'api' => 'https://api.zaif.jp',
                'www' => 'https://zaif.jp',
                'doc' => array (
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
        $response = $this->apiGetDepthPair  (array (
            'pair' => $this->product_id ($product),
        ));
        return $response;
    }

    public function fetch_ticker ($product) {
        $ticker = $this->apiGetTickerPair (array (
            'pair' => $this->product_id ($product),
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
        return $this->apiGetTradesPair (array (
            'pair' => $this->product_id ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new Exception ($this->id . ' allows limit orders only');
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
                'Sign' => $this->hmac ($body, $this->secret, 'sha512'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

?>