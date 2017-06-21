<?php

namespace ccxt;

class Market {

    //--------------------------------------------------------------------------

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

    public static function base64urlencode ($string) {
        return preg_replace (array ('#[=]+$#u', '#\+#u', '#\\/#'), array ('', '-', '_'), base64_encode ($string));
    }

    public function nonce   () { return $this->seconds (); }
    public function seconds () { return time (); }
    
    public function milliseconds () { 
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . substr ($msec, 2, 3);
    }
    
    public function microseconds () {
        list ($msec, $sec) = explode (' ', microtime ());
        return $sec . str_pad (substr ($msec, 2, 6), 6, '0');
    }

    public function __construct ($options) {
        $this->curl      = curl_init ();
        $this->id        = null;
        $this->rateLimit = 2000;
        $this->timeout   = null;

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
                        $underscoreSuffix = implode ('_', array_map ('mb_strtolower', $splitPath));

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
        $raw = ($digest === 'raw');
        $hash = hash ($type, $request, ($raw || $base64) ? true : false);
        if ($base64)
            $hash = base64_encode ($hash);
        return $hash;
    }

    public function hmac ($request, $secret, $type = 'sha256', $digest = 'hex') {
        $base64 = ($digest === 'base64');
        $raw = ($digest === 'raw');
        $hmac = hash_hmac ($type, $request, $secret, ($raw || $base64) ? true : false);
        if ($base64)
            $hmac = base64_encode ($hmac);        
        return $hmac;
    }

    public function jwt ($request, $secret, $alg = 'HS256', $hash = 'sha256') {
        $encodedHeader = Market::base64urlencode (json_encode (array ('alg' => $alg, 'typ' => 'JWT')));
        $encodedData = Market::base64urlencode (json_encode ($request, JSON_UNESCAPED_SLASHES));
        $token = $encodedHeader . '.' . $encodedData;
        $signature = Market::base64urlencode ($this->hmac ($token, $secret, $hash, 'raw'));
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
        curl_setopt ($this->curl, CURLOPT_TIMEOUT, 20);
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

    public function loadProducts () { return Market::load_products (); }

    public function load_products () {
        if ($this->products) return $this->products;
        return $this->products = Market::indexBy ($this->fetch_products (), 'symbol');
    }

    public function fetch_products () { return $this->products; }
    public function fetchProducts  () { return $this->fetch_products (); }
    public function fetchBalance   () { return $this->fetch_balance  (); }
    
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
        return Market::product_id ($product);
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

    public function fetch_categories () {
        $categories = $this->privateGetMarketCategories ();
        return $categories['response'];
    }
    
    public function fetch_products () {
        $result = array ();
        $categories = $this->fetch_categories ();
        for ($c = 0; $c < count ($categories); $c++) {
            $category = $categories[$c];
            $products = $this->privateGetMarketList (array (
                'category' => mb_strtolower ($category),
            ));
            for ($p = 0; $p < count ($products['response']); $p++) {
                $product = $products['response'][$p];
                if (($category == 'FOREX') || ($category == 'CRYPTO')) {
                    $id = $product['symbol'];
                    $symbol = $product['name'];
                    list ($base, $quote) = mb_split ('\\/', $symbol);
                    $result[] = array (
                        'id' => $id,
                        'symbol' => $symbol,
                        'base' => $base,
                        'quote' => $quote,
                        'info' => $product
                    ); 
                } else {       
                    $id = $product['symbol'];
                    $symbol = $product['symbol'];
                    $name = $product['name'];
                    $type = mb_strtolower ($product['type']);
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
        return $this->privateGetMarketQuotes (array (
            'symbols' => $this->productId ($product), 
        ));
    }

    public function fetch_ticker ($product) {
        return $this->privateGetMarketBars (array (
            'symbol' => $this->productId ($product),
            'resolution' => 60,
            'date_end' => date ('c', time ()),
            'limit' => 1,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privateGetOrderCreate (array_merge (array (
            'symbol' => $this->productId ($product),
            'margin' => $amount,
            'direction' => ($side == 'sell') ? 'short' : 'long',
            'leverage' => 1,
            'type' => $side + (($type == 'market') ? '_market' : ''),
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path . '.php';
        $query = array_merge (array ('token' => $this->token), $params);
        $url .= '?' . http_build_query ($query);
        return $this->fetch ($url, $method);
    }
};

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
        return $this->publicGetOrderBook (array (
            'currency' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetStats (array (
            'currency' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTransactions (array (
            'currency' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrdersNew (array_merge (array (
            'side' => $side,
            'type' => $type,
            'currency' => $this->productId ($product),
            'amount' => $amount,
        ), ($type == 'limit') ? array ('limit_price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type === 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $query = array_merge (array (
                'api_key' => $this->apiKey,
                'nonce' => $this->nonce (),
            ), $params);
            $query['signature'] = $this->hmac (json_encode ($query), $this->secret);
            $body = json_encode ($query);
            $headers = array ('Content-Type' => 'application/json');
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
                'api' => 'https://1btcxe.com/api',
                'www' => 'https://1btcxe.com',
                'docs' => 'https://1btcxe.com/api-docs.php',
            ),
            'products' => array (
                'BTC/USD' => array ('id' => 'USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', ),
                'BTC/EUR' => array ('id' => 'EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR', ),
                'BTC/CNY' => array ('id' => 'CNY', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', ),
                'BTC/RUB' => array ('id' => 'RUB', 'symbol' => 'BTC/RUB', 'base' => 'BTC', 'quote' => 'RUB', ),
                'BTC/CHF' => array ('id' => 'CHF', 'symbol' => 'BTC/CHF', 'base' => 'BTC', 'quote' => 'CHF', ),
                'BTC/JPY' => array ('id' => 'JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY', ),
                'BTC/GBP' => array ('id' => 'GBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP', ),
                'BTC/CAD' => array ('id' => 'CAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD', ),
                'BTC/AUD' => array ('id' => 'AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD', ),
                'BTC/AED' => array ('id' => 'AED', 'symbol' => 'BTC/AED', 'base' => 'BTC', 'quote' => 'AED', ),
                'BTC/BGN' => array ('id' => 'BGN', 'symbol' => 'BTC/BGN', 'base' => 'BTC', 'quote' => 'BGN', ),
                'BTC/CZK' => array ('id' => 'CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK', ),
                'BTC/DKK' => array ('id' => 'DKK', 'symbol' => 'BTC/DKK', 'base' => 'BTC', 'quote' => 'DKK', ),
                'BTC/HKD' => array ('id' => 'HKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD', ),
                'BTC/HRK' => array ('id' => 'HRK', 'symbol' => 'BTC/HRK', 'base' => 'BTC', 'quote' => 'HRK', ),
                'BTC/HUF' => array ('id' => 'HUF', 'symbol' => 'BTC/HUF', 'base' => 'BTC', 'quote' => 'HUF', ),
                'BTC/ILS' => array ('id' => 'ILS', 'symbol' => 'BTC/ILS', 'base' => 'BTC', 'quote' => 'ILS', ),
                'BTC/INR' => array ('id' => 'INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR', ),
                'BTC/MUR' => array ('id' => 'MUR', 'symbol' => 'BTC/MUR', 'base' => 'BTC', 'quote' => 'MUR', ),
                'BTC/MXN' => array ('id' => 'MXN', 'symbol' => 'BTC/MXN', 'base' => 'BTC', 'quote' => 'MXN', ),
                'BTC/NOK' => array ('id' => 'NOK', 'symbol' => 'BTC/NOK', 'base' => 'BTC', 'quote' => 'NOK', ),
                'BTC/NZD' => array ('id' => 'NZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD', ),
                'BTC/PLN' => array ('id' => 'PLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN', ),
                'BTC/RON' => array ('id' => 'RON', 'symbol' => 'BTC/RON', 'base' => 'BTC', 'quote' => 'RON', ),
                'BTC/SEK' => array ('id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK', ),
                'BTC/SGD' => array ('id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD', ),
                'BTC/THB' => array ('id' => 'THB', 'symbol' => 'BTC/THB', 'base' => 'BTC', 'quote' => 'THB', ),
                'BTC/TRY' => array ('id' => 'TRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY', ),
                'BTC/ZAR' => array ('id' => 'ZAR', 'symbol' => 'BTC/ZAR', 'base' => 'BTC', 'quote' => 'ZAR', ),
            ),
        ), $options));
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
            'version' => 'v2',
            'urls' => array (
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
        return $this->publicGetExchangesPairOrderbook (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetExchangesPairTicker (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetExchangesPairTrades (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePostOrderAddOrder';
        if ($type == 'market')
            $method += 'MarketPrice' + capitalize ($side);
        return $this[$method] (array_merge (array (
            'Amount' => $amount,
            'Pair' => $this->productId ($product),
        ), ($type == 'limit') ? array (
            'Price' => $price,
            'Total' => $amount * $price,
            'IsBid' => ($side == 'buy'),
        ) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . Market::implodeParams ($path, $params);
        if ($type === 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ('nonce' => $nonce), $params);
            $body = http_build_query ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body), // strlen instead of mb_strlen for byte length
                'key: '            . $this->apiKey,
                'sign: '           . $this->hmac ($body, $this->secret, 'sha512', 'base64'),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
};

//-----------------------------------------------------------------------------

class bitbay extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'bitbay',
            'name' => 'BitBay',
            'countries' => array ('PL', 'EU'), // Poland
            'rateLimit' => 1000,
            'urls' => array (
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
                
                'BTC/USD' => array ('id' => 'BTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ('id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/PLN' => array ('id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'LTC/USD' => array ('id' => 'LTCUSD', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ('id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ('id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ('id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/USD' => array ('id' => 'ETHUSD', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETH/EUR' => array ('id' => 'ETHEUR', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR' ),
                'ETH/PLN' => array ('id' => 'ETHPLN', 'symbol' => 'ETH/PLN', 'base' => 'ETH', 'quote' => 'PLN' ),
                'ETH/BTC' => array ('id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'LSK/USD' => array ('id' => 'LSKUSD', 'symbol' => 'LSK/USD', 'base' => 'LSK', 'quote' => 'USD' ),
                'LSK/EUR' => array ('id' => 'LSKEUR', 'symbol' => 'LSK/EUR', 'base' => 'LSK', 'quote' => 'EUR' ),
                'LSK/PLN' => array ('id' => 'LSKPLN', 'symbol' => 'LSK/PLN', 'base' => 'LSK', 'quote' => 'PLN' ),
                'LSK/BTC' => array ('id' => 'LSKBTC', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () { 
        return $this->privatePostInfo ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetIdOrderbook (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetIdTicker (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetIdTrades (array (
            'id' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        return $this->privatePostTrade (array_merge (array (
            'type' => $side,
            'currency' => $p['base'],
            'amount' => $amount,            
            'rate' => $price,
            'payment_currency' => $p['quote'],
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type === 'public') {
            $url .= '/' . Market::implodeParams ($path, $params) . '.json';
        } else {
            $body = http_build_query (array_merge (array (
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

class bitcoincoid extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
    
            'id' => 'bitcoincoid',
            'name' => 'Bitcoin.co.id',
            'countries' => 'ID', // Indonesia
            'urls' => array (
                'api' => array (
                    'public' => 'https://vip.bitcoin.co.id/api',
                    'private' => 'https://vip.bitcoin.co.id/tapi',
                ),
                'www' => 'https://www.bitcoin.co.id',
                'docs' => array (
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
                'BTC/IDR' => array ('id' => 'btc_idr', 'symbol' => 'BTC/IDR',  'base' => 'BTC',  'quote' => 'IDR' ),
                'BTS/BTC' => array ('id' => 'bts_btc', 'symbol' => 'BTS/BTC',  'base' => 'BTS',  'quote' => 'BTC' ),
                'DASH/BTC' => array ('id' => 'drk_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
                'DOGE/BTC' => array ('id' => 'doge_btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'ETH/BTC' => array ('id' => 'eth_btc', 'symbol' => 'ETH/BTC',  'base' => 'ETH',  'quote' => 'BTC' ),
                'LTC/BTC' => array ('id' => 'ltc_btc', 'symbol' => 'LTC/BTC',  'base' => 'LTC',  'quote' => 'BTC' ),
                'NXT/BTC' => array ('id' => 'nxt_btc', 'symbol' => 'NXT/BTC',  'base' => 'NXT',  'quote' => 'BTC' ),
                'STR/BTC' => array ('id' => 'str_btc', 'symbol' => 'STR/BTC',  'base' => 'STR',  'quote' => 'BTC' ),
                'NEM/BTC' => array ('id' => 'nem_btc', 'symbol' => 'NEM/BTC',  'base' => 'NEM',  'quote' => 'BTC' ),
                'XRP/BTC' => array ('id' => 'xrp_btc', 'symbol' => 'XRP/BTC',  'base' => 'XRP',  'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () { 
        return $this->privatePostGetInfo ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetPairDepth  (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetPairTicker (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetPairTrades (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $order = array (
            'pair' => $p['id'],
            'type' => $side,
            'price' => $price,
        );
        $order[mb_strtolower ($p['base'])] = $amount;
        return $this->privatePostTrade (array_merge ($order, $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type === 'public') {
            $url .= '/' . Market::implodeParams ($path, $params);
        } else {
            $body = http_build_query (array_merge (array (
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
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'docs' => array (
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
            $id = mb_strtoupper ($product['pair']);
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
        return $this->publicGetBookSymbol (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetPubtickerSymbol (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTradesSymbol (array (
            'symbol' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrderNew (array_merge (array (
            'symbol' => $this->productId ($product),
            'amount' => $amount.toString (),
            'price' => $price.toString (),
            'side' => $side,
            'type' => 'exchange ' + $type,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        $url = $this->urls['api'] . $request;
        if ($type === 'public') {
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'nonce' => (string) $nonce,
                'request' => $request,
            ), $params);
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
            'countries' => array ('UK', 'EU', 'RU'),
            'rateLimit' => 2000,
            'version' => 'v1',
            'urls' => array (
                'api' => 'https://bitlish.com/api',
                'www' => 'https://bitlish.com',
                'docs' => 'https://bitlish.com/api',
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
            list ($base, $quote) = mb_split ('\\/', $symbol);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $product
            );
        }
        return $result;
    }

    public function fetch_ticker ($product) { 
        return $this->publicGetTickers ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetTradesDepth (array (
            'pair_id' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTradesHistory (array (
            'pair_id' => $this->productId ($product),
        ));
    }
    
    public function sign_in () {
        return $this->privatePostSignin (array (
            'login' => $this->login,
            'passwd' => $this->password,
        ));
    }
    
    public function fetch_balance () {
        return $this->privatePostBalance ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostCreateTrade (array_merge (array (
            'pair_id' => $this->productId ($product),
            'dir' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type === 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $body = json_encode (array_merge (array ('token' => $this->apiKey), $params));
            $headers = array ('Content-Type' => 'application/json');
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
            'countries' => array ('PL', 'EU'),
            'rateLimit' => 3000,
            'urls' => array (
                'api' => array (
                    'public' => 'https://www.bitmarket.net',
                    'private' => 'https://www.bitmarket.pl/api2/', // last slash is critical
                ),
                'www' => array (
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ),
                'docs' => array (
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
                'BTC/PLN' => array ('id' => 'BTCPLN',       'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BTC/EUR' => array ('id' => 'BTCEUR',       'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ('id' => 'LTCPLN',       'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ('id' => 'LTCBTC',       'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LMX/BTC' => array ('id' => 'LiteMineXBTC', 'symbol' => 'LMX/BTC', 'base' => 'LMX', 'quote' => 'BTC' ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostInfo ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetJsonMarketOrderbook (array (
            'market' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetJsonMarketTicker (array (
            'market' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetJsonMarketTrades (array (
            'market' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTrade (array_merge (array (
            'market' => $this->productId ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type === 'public') {
            $url .= '/' . Market::implodeParams ($path . '.json', $params);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'tonce' => $nonce,
                'method' => $path,
            ), $params);
            $body = http_build_query ($query);
            $headers = array (
                'API-Key: '  . $this->apiKey,
                'API-Hash: ' . $this->hmac ($body, $this->secret, 'sha512'),
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
                'api' => 'https://www.bitmex.com',
                'www' => 'https://www.bitmex.com',
                'docs' => array (
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
                ),
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
                'info' => $product
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetUserMargin (array ('currency' => 'all'));
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetOrderBookL2 (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetQuote (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrade (array (
            'symbol' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrder (array_merge (array (
            'symbol' => $this->productId ($product),
            'side' => capitalize ($side),
            'orderQty' => $amount,
            'ordType' => capitalize ($type),
        ), ($type == 'limit') ? array ('rate' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/api/' . $this->version . '/' . $path;
        if ($params)
            $query .= '?' . http_build_query ($params);
        $url = $this->urls['api'] . $query;
        if ($type === 'private') {
            $nonce = $this->nonce ();
            if ($method === 'POST')
                $body = $params ? json_encode ($params) : null;
            $request = implode (array ($method, $query, (string) $nonce, $body || ''));
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
                'api' => 'https://api.bitso.com',
                'www' => 'https://bitso.com',
                'docs' => 'https://bitso.com/api_info',
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
                ),
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
        return $this->publicGetOrderBook (array (
            'book' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'book' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'book' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrders (array_merge (array (
            'book' => $this->productId ($product),
            'side' => $side,
            'type' => $type,
            'major' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        $url = $this->urls['api'] . $query;
        if ($type === 'public') {
            $url .= '?' . http_build_query ($params);
        } else {
            if ($params)
                $body = json_encode ($params);
            $nonce = (string) $this->nonce ();
            $request = implode ('', array ($nonce, $method, $query, $body || ''));
            $signature = $this->hmac ($request, $this->secret);
            $auth = $this->apiKey . ':' . $nonce . ':' . $signature;
            $headers = array ('Authorization' => 'Bitso ' . $auth);
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
                'api' => 'https://bittrex.com/api',
                'www' => 'https://bittrex.com',
                'docs' => array ( 
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
                'info' => $product
            );
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->accountGetBalances (); }
    
    public function fetch_order_book ($product) {
        return $this->publicGetOrderbook (array (
            'market' => $this->productId ($product),
            'type' => 'both',
            'depth' => 50,
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'market' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetMarkethistory (array (
            'market' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'marketGet' . capitalize ($side) . $type;
        return $this[$method] (array_merge (array (
            'market' => $this->productId ($product),
            'quantity' => $amount,
        ), ($type == 'limit') ? array ('rate' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' ;
        if ($type === 'public') {
            $url .= $type . '/' . strtolower ($method) . $path;
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $nonce = $this->nonce ();
            $url .= $type . '/';
            if ((($type === 'account') && ($path !== 'withdraw')) || ($path === 'openorders'))
                $url .= strtolower ($method);
            $url .= $path . '?' . http_build_query (array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), $params));
            $headers = array ('apisign' => $this->hmac ($url, $this->secret, 'sha512'));
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
            'countries' => array ('IS', 'US', 'EU'), // Iceland, United States, European Union
            'rateLimit' => 3000, // support in english is very poor, unable to tell rate limits
            'version' => 'v1',
            'urls' => array (
                'api' => 'https://btc-x.is/api',
                'www' => 'https://btc-x.is',
                'docs' => 'https://btc-x.is/custom/api-document.html',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth/{id}/{limit}',
                        'ticker/{id}',                
                        'trade/{id}/{limit}',
                    ),
                ),
                'private' => array (                    'post' => array (
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
                'BTC/USD' => array ('id' => 'btc/usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD'),
                'BTC/EUR' => array ('id' => 'btc/eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR'),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostBalance ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetDepthIdLimit (array (
            'id' => $this->productId ($product),
            'limit' => 1000,
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTickerId (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTradeIdLimit (array (
            'id' => $this->productId ($product),
            'limit' => 100,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTrade (array_merge (array (
            'type' => $side.toUpperCase (),
            'market' => $this->productId ($product),
            'amount' => $amount,
            'price' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/';
        if ($type === 'public') {
            $url .= Market::implodeParams ($path, $params);
        } else {
            $nonce = $this->nonce ();
            $url .= $type;
            $body = http_build_query (array_merge (array (
                'Method' => $path,
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
                'api' => 'https://bx.in.th/api',
                'www' => 'https://bx.in.th',
                'docs' => 'https://bx.in.th/info/api',
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
        return $this->publicGetOrderbook (array (
            'pairing' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGet (array (
            'pairing' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrade (array (
            'pairing' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrder (array_merge (array (
            'pairing' => $this->productId ($product),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path . '/';
        if ($params)
            $url .= '?' . http_build_query ($params);
        if ($type === 'private') {
            $nonce = $this->nonce ();
            $signature = $this->hash ($this->apiKey . $nonce . $this->secret, 'sha256');
            $body = http_build_query (array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
                'signature' => $signature,
                // 'twofa' => $this->twofa,
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
            'countries' => array ('DE', 'EU'),
            'rateLimit' => 2000, 
            'urls' => array (
                'api' => array (
                    'tickers' => 'https://c-cex.com/t',
                    'public' => 'https://c-cex.com/t/api_pub.html',
                    'private' => 'https://c-cex.com/t/api.html',
                ),
                'www' => 'https://c-cex.com',
                'docs' => 'https://c-cex.com/?id=api',
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
        return $this->publicGetOrderbook (array (
            'market' => $this->productId ($product),
            'type' => 'both',
            'depth' => 100,
        ));
    }
    
    public function fetch_ticker ($product) { 
        return $this->tickersGetMarket (array (
            'market' => strtolower ($this->productId ($product))
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetMarkethistory (array (
            'market' => $this->productId ($product),
            'type' => 'both',
            'depth' => 100,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privateGet' + capitalize ($side) + $type;
        return $this[$method] (array_merge (array (
            'market' => $this->productId ($product),
            'quantity' => $amount,
            'rate' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        if ($type === 'private') {
            $nonce = $this->nonce ();
            $url .= '?' . http_build_query (array_merge (array (
                'a' => $path,
            ), array (
                'apikey' => $this->apiKey,
                'nonce' => $nonce,
            ), $params));
            $headers = array ('apisign' => $this->hmac ($url, $this->secret, 'sha512'));
        } else if ($type === 'public') {
            $url .= '?' . http_build_query (array_merge (array (
                'a' => 'get' . $path,
            ), $params));
        } else {
            $url .= '/' . Market::implodeParams ($path, $params) . '.json';
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
            'countries' => array ('UK', 'EU', 'CY', 'RU'),
            'rateLimit' => 2000,
            'urls' => array (
                'api' => 'https://cex.io/api',
                'www' => 'https://cex.io',
                'docs' => 'https://cex.io/cex-api',
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
                ),
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
        return $this->publicGetOrderBookPair (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTickerPair (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTradeHistoryPair (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostPlaceOrderPair (array_merge (array (
            'pair' => $this->productId ($product),
            'type' => $side,
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array ('order_type' => $type), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($type === 'public') {   
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $body = http_build_query (array_merge (array (
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
            'countries' => array ('JP', 'ID'),
            'rateLimit' => 2000,
            'urls' => array (
                'api' => 'https://coincheck.com/api',
                'www' => 'https://coincheck.com',
                'docs' => 'https://coincheck.com/documents/exchange/api',
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
                'BTC/JPY' => array ('id' => 'btc_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'), // the only real pair
                'ETH/JPY' => array ('id' => 'eth_jpy',  'symbol' => 'ETH/JPY',  'base' => 'ETH',  'quote' => 'JPY'),
                'ETC/JPY' => array ('id' => 'etc_jpy',  'symbol' => 'ETC/JPY',  'base' => 'ETC',  'quote' => 'JPY'),
                'DAO/JPY' => array ('id' => 'dao_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'LSK/JPY' => array ('id' => 'lsk_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'FCT/JPY' => array ('id' => 'fct_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'XMR/JPY' => array ('id' => 'xmr_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'REP/JPY' => array ('id' => 'rep_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'XRP/JPY' => array ('id' => 'xrp_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'ZEC/JPY' => array ('id' => 'zec_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'XEM/JPY' => array ('id' => 'xem_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'LTC/JPY' => array ('id' => 'ltc_jpy',  'symbol' => 'BTC/JPY',  'base' => 'BTC',  'quote' => 'JPY'),
                'DASH/JPY' => array ('id' => 'dash_jpy', 'symbol' => 'DASH/JPY', 'base' => 'DASH', 'quote' => 'JPY'),
                'ETH/JPY' => array ('id' => 'eth_btc',  'symbol' => 'ETH/BTC',  'base' => 'ETH',  'quote' => 'BTC'),
                'ETC/JPY' => array ('id' => 'etc_btc',  'symbol' => 'ETC/BTC',  'base' => 'ETC',  'quote' => 'BTC'),
                'LSK/JPY' => array ('id' => 'lsk_btc',  'symbol' => 'LSK/BTC',  'base' => 'LSK',  'quote' => 'BTC'),
                'FCT/JPY' => array ('id' => 'fct_btc',  'symbol' => 'FCT/BTC',  'base' => 'FCT',  'quote' => 'BTC'),
                'XMR/JPY' => array ('id' => 'xmr_btc',  'symbol' => 'XMR/BTC',  'base' => 'XMR',  'quote' => 'BTC'),
                'REP/JPY' => array ('id' => 'rep_btc',  'symbol' => 'REP/BTC',  'base' => 'REP',  'quote' => 'BTC'),
                'XRP/JPY' => array ('id' => 'xrp_btc',  'symbol' => 'XRP/BTC',  'base' => 'XRP',  'quote' => 'BTC'),
                'ZEC/JPY' => array ('id' => 'zec_btc',  'symbol' => 'ZEC/BTC',  'base' => 'ZEC',  'quote' => 'BTC'),
                'XEM/JPY' => array ('id' => 'xem_btc',  'symbol' => 'XEM/BTC',  'base' => 'XEM',  'quote' => 'BTC'),
                'LTC/JPY' => array ('id' => 'ltc_btc',  'symbol' => 'LTC/BTC',  'base' => 'LTC',  'quote' => 'BTC'),
                'DASH/JPY' => array ('id' => 'dash_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC'),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privateGetAccountsBalance ();
    }
    
    public function fetch_order_book ($product) { 
        return $this->publicGetOrderBooks ();
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {  
        $isMarket = ($type == 'market');
        $isBuy = ($side == 'buy');
        $order_type = ($isMarket ? ($type + '_') : '') + $side;
        $order = array (
            'pair' => $this->productId ($product),
            'order_type' => $order_type,
        );
        if (!$isMarket)
            $order['rate'] = $price;
        $prefix = (($isMarket && $isBuy) ? ($type + '_' + $side + '_') : '');
        $order[$prefix + 'amount'] = $amount;
        return $this->privatePostExchangeOrders (array_merge ($order, $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($type === 'public') {
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = (string) $this->nonce ();
            if ($query)
                $body = http_build_query ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-NONCE' => $nonce,
                'ACCESS-SIGNATURE' => $this->hmac ($nonce . $url . ($body || ''), $this->secret),
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
                'api' => 'https://api.coinsecure.in',
                'www' => 'https://coinsecure.in',
                'docs' => array (
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
                'BTC/INR' => array ('id' => 'BTC/INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR'),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privateGetUserExchangeBankSummary ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetExchangeAskOrders ();
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetExchangeTicker ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetExchangeTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePutUserExchange';
        if ($type == 'market') {
            $method += 'Instant' + capitalize ($side);
            $order = ($side == 'buy') ? array ('maxFiat' => $amount) : array ('maxVol' => $amount);
            return $this[$method] ($order);
        } 
        $method += (($side == 'buy') ? 'Bid' : 'Ask') + 'New';
        return $this[$method] (array ('rate' => $price, 'vol' => $amount));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($type === 'private') {
            $headers = array ('Authorization' => $this->apiKey);
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
            'countries' => array ('ES', 'RU'), // Spain, Russia
            'rateLimit' => 1000,
            'version' => 'v1',
            'urls' => array (
                'api' => 'https://api.exmo.com',
                'www' => 'https://exmo.me',
                'docs' => array (
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
        return $this->privatePostUserInfo (); }
    
    public function fetch_order_book ($product) {
        return $this->publicGetOrderBook (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrderCreate (array_merge (array (
            'pair' => $this->productId ($product),
            'quantity' => $amount,
            'price' => $price || 0,
            'type' => (($type == 'market') ? 'market_' : '') + $side,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type === 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $nonce = $this->nonce ();
            $body = http_build_query (array_merge (array ('nonce' => $nonce), $params));   
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
        return $this->publicGetOrderbook ();
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTickerdetailed ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostPlaceorder (array_merge (array (
            'qty' => $amount,
            'price' => $price,
            'type' => $side[0].toUpperCase ()
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($type === 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $body = http_build_query (array_merge (array ('timestamp' => $nonce), $params));
            $headers = array (
                'Content-type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sig' => $this->hmac ($body, $this->secret, 'sha1'),
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
                'api' => 'https://www.fybse.se/api/SEK',
                'www' => 'https://www.fybse.se',
                'docs' => 'http://docs.fyb.apiary.io',
            ),
            'products' => array (
                'BTC/SEK' => array ('id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK'),
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
                'api' => 'https://www.fybsg.com/api/SGD',
                'www' => 'https://www.fybsg.com',
                'docs' => 'http://docs.fyb.apiary.io',
            ),
            'products' => array (
                'BTC/SGD' => array ('id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD'),
            ),
        ), $options));
    }
}

//-----------------------------------------------------------------------------

class hitbtc extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'hitbtc',
            'name' => 'HitBTC',
            'countries' => 'HK', 
            'rateLimit' => 2000,
            'version' => 1,
            'urls' => array (
                'api' => 'http://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'docs' => array (
                    'https://hitbtc.com/api',
                    'http://hitbtc-com.github.io/hitbtc-api',
                    'http://jsfiddle.net/bmknight/RqbYB',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md', // announced on June 2nd 2017
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
                ),
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
        return $this->publicGetSymbolOrderbook (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetSymbolTicker (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetSymbolTrades (array (
            'symbol' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->tradingPostNewOrder (array_merge (array (
            'clientOrderId' => $this->nonce (),
            'symbol' => $this->productId ($product),
            'side' => $side,
            'quantity' => $amount,
            'type' => $type,            
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api/' . $this->version . '/' . $type . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($type === 'public') {
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ('nonce' => $nonce, 'apikey' => $this->apiKey), $query);
            if ($method === 'POST')
                if ($query)
                    $body = http_build_query ($query);
            if ($query)
                $url .= '?' . http_build_query ($query);
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
            'countries' => array ( 'CN', ),
            'rateLimit' => 5000,
            'version' => 'v3',
            'urls' => array (
                'api' => 'http://api.huobi.com',
                'www' => 'https://www.huobi.com',
                'docs' => 'https://github.com/huobiapi/API_Docs_en/wiki',
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
                'BTC/CNY' => array ('id' => 'btc', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'type' => 'staticmarket', ),
                'LTC/CNY' => array ('id' => 'ltc', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'type' => 'staticmarket', ),
                'BTC/USD' => array ('id' => 'btc', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'usdmarket',    ),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->tradePostGetAccountInfo ();
    }
    
    public function fetch_order_book ($product) { 
        $p = $this->product ($product);
        $usdmarket = $p['type'] == 'usdmarket';
        $method = $usdmarket ? 'usdmarketGetDepthId' : 'staticmarketGetDepthId';
        return $this->$method (array ('id' => $p['id']));
    }

    public function fetch_ticker ($product) {
        $p = $this->product ($product);
        $usdmarket = $p['type'] == 'usdmarket';
        $method = $usdmarket ? 'usdmarketGetTickerId' : 'staticmarketGetTickerId';
        return $this->$method (array ('id' => $p['id']));
    }

    public function fetch_trades ($product) {
        $p = $this->product ($product);
        $usdmarket = $p['type'] == 'usdmarket';
        $method = $usdmarket ? 'usdmarketGetDetailId' : 'staticmarketGetDetailId';
        return $this->$method (array ('id' => $p['id']));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $method = capitalize ($side) + (($type == 'market') ? capitalize ($type) : '');
        $order = array_merge (array (
            'coin_type' => $p['coinType'],
            'amount' => $amount,
            'market' => mb_strtolower ($p['quote']),
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params);
        return $this['tradePost' + $method] ($order);
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'];
        if ($type === 'trade') {
            $url .= '/api' . $this->version;
            $query = array_merge (array (
                'method' => $path,
                'access_key' => $this->apiKey,
                'created' => $this->nonce (),
            ), $params);
            ksort ($query);
            $query['sign'] = $this->hash (http_build_query (array_merge (array (
                'secret_key' => $this->secret,
            ), Market::omit ($query, 'market'))));
            $body = http_build_query ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        } else {
            $url .= '/' . $type . '/' . Market::implodeParams ($path, $params) . '_json.js';
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
                'api' => 'https://www.jubi.com/api',
                'www' => 'https://www.jubi.com',
                'docs' => 'https://www.jubi.com/help/api.html',
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
                'BTC/CNY' => array ('id' => 'btc',  'symbol' => 'BTC/CNY',  'base' => 'BTC',  'quote' => 'CNY'),
                'ETH/CNY' => array ('id' => 'eth',  'symbol' => 'ETH/CNY',  'base' => 'ETH',  'quote' => 'CNY'),
                'ANS/CNY' => array ('id' => 'ans',  'symbol' => 'ANS/CNY',  'base' => 'ANS',  'quote' => 'CNY'),
                'BLK/CNY' => array ('id' => 'blk',  'symbol' => 'BLK/CNY',  'base' => 'BLK',  'quote' => 'CNY'),
                'DNC/CNY' => array ('id' => 'dnc',  'symbol' => 'DNC/CNY',  'base' => 'DNC',  'quote' => 'CNY'),
                'DOGE/CNY' => array ('id' => 'doge', 'symbol' => 'DOGE/CNY', 'base' => 'DOGE', 'quote' => 'CNY'),
                'EAC/CNY' => array ('id' => 'eac',  'symbol' => 'EAC/CNY',  'base' => 'EAC',  'quote' => 'CNY'),
                'ETC/CNY' => array ('id' => 'etc',  'symbol' => 'ETC/CNY',  'base' => 'ETC',  'quote' => 'CNY'),
                'FZ/CNY' => array ('id' => 'fz',   'symbol' => 'FZ/CNY',   'base' => 'FZ',   'quote' => 'CNY'),
                'GOOC/CNY' => array ('id' => 'gooc', 'symbol' => 'GOOC/CNY', 'base' => 'GOOC', 'quote' => 'CNY'),
                'GAME/CNY' => array ('id' => 'game', 'symbol' => 'GAME/CNY', 'base' => 'GAME', 'quote' => 'CNY'),
                'HLB/CNY' => array ('id' => 'hlb',  'symbol' => 'HLB/CNY',  'base' => 'HLB',  'quote' => 'CNY'),
                'IFC/CNY' => array ('id' => 'ifc',  'symbol' => 'IFC/CNY',  'base' => 'IFC',  'quote' => 'CNY'),
                'JBC/CNY' => array ('id' => 'jbc',  'symbol' => 'JBC/CNY',  'base' => 'JBC',  'quote' => 'CNY'),
                'KTC/CNY' => array ('id' => 'ktc',  'symbol' => 'KTC/CNY',  'base' => 'KTC',  'quote' => 'CNY'),
                'LKC/CNY' => array ('id' => 'lkc',  'symbol' => 'LKC/CNY',  'base' => 'LKC',  'quote' => 'CNY'),
                'LSK/CNY' => array ('id' => 'lsk',  'symbol' => 'LSK/CNY',  'base' => 'LSK',  'quote' => 'CNY'),
                'LTC/CNY' => array ('id' => 'ltc',  'symbol' => 'LTC/CNY',  'base' => 'LTC',  'quote' => 'CNY'),
                'MAX/CNY' => array ('id' => 'max',  'symbol' => 'MAX/CNY',  'base' => 'MAX',  'quote' => 'CNY'),
                'MET/CNY' => array ('id' => 'met',  'symbol' => 'MET/CNY',  'base' => 'MET',  'quote' => 'CNY'),
                'MRYC/CNY' => array ('id' => 'mryc', 'symbol' => 'MRYC/CNY', 'base' => 'MRYC', 'quote' => 'CNY'),        
                'MTC/CNY' => array ('id' => 'mtc',  'symbol' => 'MTC/CNY',  'base' => 'MTC',  'quote' => 'CNY'),
                'NXT/CNY' => array ('id' => 'nxt',  'symbol' => 'NXT/CNY',  'base' => 'NXT',  'quote' => 'CNY'),
                'PEB/CNY' => array ('id' => 'peb',  'symbol' => 'PEB/CNY',  'base' => 'PEB',  'quote' => 'CNY'),
                'PGC/CNY' => array ('id' => 'pgc',  'symbol' => 'PGC/CNY',  'base' => 'PGC',  'quote' => 'CNY'),
                'PLC/CNY' => array ('id' => 'plc',  'symbol' => 'PLC/CNY',  'base' => 'PLC',  'quote' => 'CNY'),
                'PPC/CNY' => array ('id' => 'ppc',  'symbol' => 'PPC/CNY',  'base' => 'PPC',  'quote' => 'CNY'),
                'QEC/CNY' => array ('id' => 'qec',  'symbol' => 'QEC/CNY',  'base' => 'QEC',  'quote' => 'CNY'),
                'RIO/CNY' => array ('id' => 'rio',  'symbol' => 'RIO/CNY',  'base' => 'RIO',  'quote' => 'CNY'),
                'RSS/CNY' => array ('id' => 'rss',  'symbol' => 'RSS/CNY',  'base' => 'RSS',  'quote' => 'CNY'),
                'SKT/CNY' => array ('id' => 'skt',  'symbol' => 'SKT/CNY',  'base' => 'SKT',  'quote' => 'CNY'),
                'TFC/CNY' => array ('id' => 'tfc',  'symbol' => 'TFC/CNY',  'base' => 'TFC',  'quote' => 'CNY'),
                'VRC/CNY' => array ('id' => 'vrc',  'symbol' => 'VRC/CNY',  'base' => 'VRC',  'quote' => 'CNY'),
                'VTC/CNY' => array ('id' => 'vtc',  'symbol' => 'VTC/CNY',  'base' => 'VTC',  'quote' => 'CNY'),
                'WDC/CNY' => array ('id' => 'wdc',  'symbol' => 'WDC/CNY',  'base' => 'WDC',  'quote' => 'CNY'),
                'XAS/CNY' => array ('id' => 'xas',  'symbol' => 'XAS/CNY',  'base' => 'XAS',  'quote' => 'CNY'),
                'XPM/CNY' => array ('id' => 'xpm',  'symbol' => 'XPM/CNY',  'base' => 'XPM',  'quote' => 'CNY'),
                'XRP/CNY' => array ('id' => 'xrp',  'symbol' => 'XRP/CNY',  'base' => 'XRP',  'quote' => 'CNY'),
                'XSGS/CNY' => array ('id' => 'xsgs', 'symbol' => 'XSGS/CNY', 'base' => 'XSGS', 'quote' => 'CNY'),
                'YTC/CNY' => array ('id' => 'ytc',  'symbol' => 'YTC/CNY',  'base' => 'YTC',  'quote' => 'CNY'),
                'ZET/CNY' => array ('id' => 'zet',  'symbol' => 'ZET/CNY',  'base' => 'ZET',  'quote' => 'CNY'),
                'ZCC/CNY' => array ('id' => 'zcc',  'symbol' => 'ZCC/CNY',  'base' => 'ZCC',  'quote' => 'CNY'),        
            ),
        ), $options));
    }
    
    public function fetch_balance  () {
        return $this->privatePostBalance ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetDepth (array (
            'coin' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'coin' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetOrders (array (
            'coin' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTradeAdd (array_merge (array (
            'amount' => $amount,
            'price' => $price,
            'type' => $side,
            'coin' => $this->productId ($product),
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($type === 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
            ), $params);
            $query['signature'] = $this->hmac (http_build_query ($query), $this->hash ($this->secret));
            $body = http_build_query ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Content-Length' => strlen ($body),
            );
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------
// kraken is also owner of ex. Coinsetter / CaVirtEx / Clevercoin

class kraken extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'id' => 'kraken',
            'name' => 'Kraken',
            'countries' => 'US',
            'version' => '0',
            'rateLimit' => 3000,
            'urls' => array (
                'api' => 'https://api.kraken.com',
                'www' => 'https://www.kraken.com',
                'docs' => array (
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
            $base = (($base[0] == 'X') || ($base[0] == 'Z')) ? mb_substr ($base, 1) : $base;
            $quote = (($quote[0] == 'X') || ($quote[0] == 'Z')) ? mb_substr ($quote, 1) : $quote;
            $base = $this->commonCurrencyCode ($base);
            $quote = $this->commonCurrencyCode ($quote);
            $symbol = (mb_strpos ($id, '.d') !== false) ? $product['altname'] : ($base . '/' . $quote);
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
        return $this->publicGetDepth (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_balance () {
        return $this->privatePostBalance ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostAddOrder (array_merge (array (
            'pair' => $this->productId ($product),
            'type' => $side,
            'ordertype' => $type,
            'volume' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $type . '/' . $path;
        if ($type === 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $nonce = (string) $this->nonce ();
            $query = array_merge (array ('nonce' => $nonce), $params);
            $body = http_build_query ($query);
            $query = $url . $this->hash ($nonce . $body, 'sha256', 'raw');
            $secret = base64_decode ($this->secret);
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Sign' => $this->hmac ($query, $secret, 'sha512', 'base64'),
                'Content-Type' => 'application/x-www-form-urlencoded',
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
            'countries' => array ('UK', 'SG', 'ZA'), // UK, Singapore, South Africa
            'rateLimit' => 5000,
            'version' => '1',
            'urls' => array (
                'api' => 'https://api.mybitx.com/api',
                'www' => 'https://www.luno.com',
                'docs' => array (
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
            $base = $this->commonCurrencyCode (mb_substr ($id, 0, 3));
            $quote = $this->commonCurrencyCode (mb_substr ($id, 3, 6));
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
        return $this->publicGetOrderbook (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market') {
            $order = array (
                'pair' => $this->productId ($product),
                'type' => $side.toUpperCase (),
            );
            $volume = (($side == 'buy') ? 'counter' : 'base') + '_volume';
            $order[$volume] = $amount;
            return $this->privatePostMarketorder (array_merge ($order, $params));
        }
        return $this->privatePostOrder (array_merge (array (
            'pair' => $this->productId ($product),
            'type' => ($side == 'buy') ? 'BID' : 'ASK',
            'volume' => $amount,
            'price' => $price,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($query)
            $url .= '?' . http_build_query ($query);
        if ($type === 'private') {
            $auth = base64_encode ($this->apiKey . ':' . $this->secret);
            $headers = array ('Authorization' => 'Basic ' . $auth);
        }
        return $this->fetch ($url, $method, $headers, $body);
    }
}

//-----------------------------------------------------------------------------
// OKCoin 
// China
// https://www.okcoin.com/
// https://www.okcoin.com/rest_getStarted.html
// https://github.com/OKCoin/websocket
// https://www.npmjs.com/package/okcoin.com
// https://www.okcoin.cn
// https://www.okcoin.cn/rest_getStarted.html

class okcoin extends Market {

    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array (
            'version' => 'v1',
            'rateLimit' => 2000,
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
        return $this->publicGetDepth  (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTrades (array (
            'symbol' => $this->productId ($product),
        ));
    }
    
    public function fetch_balance () {
        return $this->privatePostUserinfo ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostTrade (array_merge (array (
            'symbol' => $this->productId ($product),
            'type' => $side + (($type == 'market') ? '_market' : ''),
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api/' . $this->version . '/' . $path . '.do';        
        if ($type == 'public') {
            if ($params)
                $url .= '?' . http_build_query ($params);
        } else {
            $query = array_merge (array ('api_key' => $this->apiKey ), $params);
            ksort ($query);
            // secret key must be at the end of querystring
            $queryString = http_build_query ($query) . '&secret_key=' . $this->secret;
            $query['sign'] = strtoupper ($this->hash ($queryString));
            $body = http_build_query ($query);
            $headers = array ('Content-type' => 'application/x-www-form-urlencoded');
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
                'api' => 'https://www.okcoin.cn',
                'www' => 'https://www.okcoin.cn',
                'docs' => 'https://www.okcoin.cn/rest_getStarted.html',
            ),
            'products' => array (
                'BTC/CNY' => array ('id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY'),
                'LTC/CNY' => array ('id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY'),
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
            'countries' => array ('CN', 'US'),
            'urls' => array (
                'api' => 'https://www.okcoin.com',
                'www' => 'https://www.okcoin.com',
                'docs' => array (
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ),
            ),
            'products' => array (
                'BTC/USD' => array ('id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD'),
                'LTC/USD' => array ('id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD'),
            ),
        ), $options));
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
                'api' => array (
                    'public' => 'https://poloniex.com/public',
                    'private' => 'https://poloniex.com/tradingApi',
                ),
                'www' => 'https://poloniex.com',
                'docs' => array (
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
        return $this->publicGetReturnOrderBook (array (
            'currencyPair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetReturnTicker ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetReturnTradeHistory (array (
            'currencyPair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' + capitalize ($side);
        return $this[$method] (array_merge (array (
            'currencyPair' => $this->productId ($product),
            'rate' => $price,
            'amount' => $amount,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        $query = array_merge (array ('command' => $path), $params);
        if ($type === 'public') {
            $url .= '?' . http_build_query ($query);
        } else {
            $query['nonce'] = $this->nonce ();
            $body = http_build_query ($query);
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
                'api' => 'https://api.quadrigacx.com',
                'www' => 'https://www.quadrigacx.com',
                'docs' => 'https://www.quadrigacx.com/api_info',
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
                'BTC/CAD' => array ('id' => 'btc_cad', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD'),
                'BTC/USD' => array ('id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD'),
                'ETH/BTC' => array ('id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC'),
                'ETH/CAD' => array ('id' => 'eth_cad', 'symbol' => 'ETH/CAD', 'base' => 'ETH', 'quote' => 'CAD'),
            ),
        ), $options));
    }

    public function fetch_balance () {
        return $this->privatePostBalance ();
    }
    
    public function fetch_order_book ($product) {
        return $this->publicGetOrderBook (array (
            'book' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetTicker (array (
            'book' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTransactions (array (
            'book' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this['privatePost' + capitalize ($side)] (array_merge (array (
            'amount' => $amount,
            'book' => $this->productId ($product),
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {

        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;

        if ($type === 'public') {

            $url .= '?' . http_build_query ($params);

        } else {

            $nonce = $this->nonce ();
            $signature = $this->hmac ($nonce . $this->uid . $this->apiKey, $this->secret);

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
            'countries' => array ('JP', 'SG', 'VN'), // Asia: Japan, Singapore, Vietnam
            'timeout' => 10000,
            'version' => 2,
            'rateLimit' => 2000,
            'urls' => array (
                'api' => 'https://api.quoine.com',
                'www' => 'https://www.quoine.com',
                'docs' => 'https://developers.quoine.com',
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
        return $this->publicGetProductsIdPriceLevels (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetProductsId (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetExecutions (array (
            'product_id' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostOrders (array_merge (array (
            'order' => array_merge (array (
                'order_type' => $type,
                'product_id' => $this->productId ($product),
                'side' => $side,
                'quantity' => $amount,
            ), ($type == 'limit') ? array ('price' => $price) : array ()),
        ), $params));
    }

    public function cancelOrder ($id, $params = array ()) {
        return $this->privatePutOrdersIdCancel (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        $headers = array (
            'X-Quoine-API-Version' => $this->version,
            'Content-Type' => 'application/json',
        );        
        if ($type === 'public') {
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = (int) $this->nonce ();
            $request = array (
                'path' => $url, 
                'nonce' => $nonce, 
                'token_id' => $this->apiKey,
                'iat' => floor ($nonce / 1000),
            );
            $body = $params ? http_build_query ($query) : null;
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
                'api' => 'https://api.therocktrading.com',
                'www' => 'https://therocktrading.com',
                'docs' => 'https://api.therocktrading.com/doc/',
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
                        'atms/withdraw',
                        'balances',
                        'balances/{id}',
                        'discounts',
                        'discounts/{id}',
                        'funds',
                        'funds/{id}',
                        'funds/{id}/trades',
                        'funds/{fund_id}/orders',
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/orders/remove_all',
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
                'info' => $product);
        }
        return $result;
    }

    public function fetch_balance () {
        return $this->privateGetBalances (); }
    
    public function fetch_order_book ($product) {
        return $this->publicGetFundsIdOrderbook (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->publicGetFundsIdTicker (array (
            'id' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetFundsIdTrades (array (
            'id' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostFundsFundIdOrders (array_merge (array (
            'fund_id' => $this->productId ($product),
            'side' => $side,
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        $query = Market::omit ($params, Market::extractParams ($path));
        if ($type === 'private') {
            $nonce = $this->nonce ();            
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
            'version' => 1,
            'urls' => array (
                'api' => 'https://api.vaultoro.com',
                'www' => 'https://www.vaultoro.com',
                'docs' => 'https://api.vaultoro.com',
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
        $products  = $this->publicGetMarkets ();
        $product = $products['data'];
        $base = $product['BaseCurrency'];
        $quote = $product['MarketCurrency'];
        $symbol = $base . '/' . $quote;
        $baseId = $base;
        $quoteId = $quote;
        $id = $product['MarketName'];
        return array (array (
            'id' => $id,
            'symbol' => $symbol,
            'base' => $base,
            'quote' => $quote,
            'baseId' => $baseId,
            'quoteId' => $quoteId,
            'info' => $product,
        ));
    }

    public function fetch_balance () {
        return $this->privateGetBalance (); }
    
    public function fetch_order_book ($product) { 
        return $this->publicGetOrderbook ();
    }

    public function fetch_ticker ($product) {
        return $this->publicGetMarkets ();
    }
    
    public function fetch_trades ($product) {
        return $this->publicGetTransactionsDay ();
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        $p = $this->product ($product);
        $method = 'privatePost' + capitalize ($side) + 'SymbolType';
        return $this[$method] (array_merge (array (
            'symbol' => mb_strtolower ($p['quoteId']),
            'type' => $type,
            'gld' => $amount,
            'price' => $price || 1,
        ), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($type === 'public') {
            $url .= $path;
        } else {
            $nonce = $this->nonce ();
            $url .= $this->version . '/' . $this->implodeParams ($path, $params);
            $query = array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), Market::omit ($params, Market::extractParams ($path)));
            $url .= '?' . http_build_query ($query);
            $headers = array (
                'Content-Type' => 'application/json',
                'X-Signature' => $this->hmac ($url, $this->secret),
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
                'api' => array (
                    'public' =>  'http://api.virwox.com/api/json.php',
                    'private' => 'https://www.virwox.com/api/trading.php',
                ),
                'www' => 'https://www.virwox.com',
                'docs' => 'https://www.virwox.com/developers.php',
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

    
    public function fetch_order_book  ($product) {
        return $this->publicPostGetMarketDepth (array (
            'symbols' => array ($this->symbol ($product)),
            'buyDepth' => 100,
            'sellDepth' => 100,
        ));
    }

    public function fetch_balance () {
        return $this->privatePostGetBalances ();
    }

    public function fetch_best_prices ($product) {
        return $this->publicPostGetBestPrices (array (
            'symbols' => array ($this->symbol ($product))
        )); 
    }     

    public function fetch_ticker ($product) { 
        return $this->publicGetTradedPriceVolume (array (
            'instrument' => $this->symbol ($product),
        ));
    }

    public function fetch_trades ($product) {
        return $this->publicGetRawTradeData (array (
            'instrument' => $this->symbol ($product),
            'timespan' => 3600,
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->privatePostPlaceOrder (array_merge (array (
            'instrument' => $this->symbol ($product),
            'orderType' => mb_strtolower ($side),
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function request ($path, $type = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$type];
        $auth = ($type === 'public') ? array () : array (
            'key' => $this->apiKey,
            'user' => $this->login,
            'pass' => $this->password,   
        );
        $nonce = $this->nonce ();
        if ($method === 'GET') {
            $url .= '?' . http_build_query (array_merge (array ( 
                'method' => $path, 
                'id' => $nonce,
            ), $auth, $params));
        } else {
            $headers = array ('Content-type' => 'application/json');
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
            'version' => 3,
            'urls' => array (
                'api' => 'https://yobit.net',
                'www' => 'https://www.yobit.net',
                'docs' => 'https://www.yobit.net/en/api/',
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
        return $this->tapiPostGetInfo (); }
    
    public function fetch_order_book ($product) {
        return $this->apiGetDepthPairs  (array (
            'pairs' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->apiGetTickerPairs (array (
            'pairs' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->apiGetTradesPairs (array (
            'pairs' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->tapiPostTrade (array_merge (array (
            'pair' => $this->productId ($product),
            'type' => $side,
            'amount' => $amount,
        ), ($type == 'limit') ? array ('rate' => $price) : array (), $params));
    }

    public function request ($path, $type = 'api', $method = 'GET', $params = array ()) {
        $url = $this->urls['api'] . '/' . $type;
        if ($type === 'api') {
            $url .= '/' . $this->version . '/' . Market::implodeParams ($path, $params);
            $query = Market::omit ($params, Market::extractParams ($path));
            if ($query)
                $url .= '?' . http_build_query ($query);
        } else {
            $nonce = $this->nonce ();
            $query = array_merge (array ('method' => $path, 'nonce' => $nonce), $params);
            $body = http_build_query ($query);
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
            'version' => 1,
            'urls' => array (
                'api' => 'https://api.zaif.jp',
                'www' => 'https://zaif.jp',
                'docs' => array (
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
        return $this->apiGetDepthPair (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_ticker ($product) {
        return $this->apiGetTickerPair (array (
            'pair' => $this->productId ($product),
        ));
    }
    
    public function fetch_trades ($product) {
        return $this->apiGetTradesPair (array (
            'pair' => $this->productId ($product),
        ));
    }

    public function create_order ($product, $type, $side, $amount, $price = null, $params = array ()) {
        return $this->tapiPostTrade (array_merge (array (
            'currency_pair' => $this->productId ($product),
            'action' => ($side == 'buy') ? 'bid' : 'ask',
            'amount' => $amount,
        ), ($type == 'limit') ? array ('price' => $price) : array (), $params));
    }

    public function cancelOrder ($id, $params = array ()) {
        return $this->tapiPostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function request ($path, $type = 'api', $method = 'GET', $params = array ()) {
        $url = $this->urls['api'] . '/' . $type;
        if ($type === 'api') {
            $url .= '/' . $this->version . '/' . Market::implodeParams ($path, $params);
        } else {
            $nonce = $this->nonce ();
            $body = http_build_query (array_merge (array (
                'method' => $path,
                'nonce' => $nonce
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