<?php

namespace ccxt;

include_once ('base/Exchange.php');

class kucoin extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'kucoin',
            'name' => 'Kucoin',
            'countries' => 'HK', // Hong Kong
            'version' => 'v1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => false, // see the method implementation below
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchMyTrades' => false,
            'hasFetchCurrencies' => true,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchTickers' => true,
                'fetchOHLCV' => true, // see the method implementation below
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchClosedOrders' => 'emulated',
                'fetchOpenOrders' => true,
                'fetchMyTrades' => false,
                'fetchCurrencies' => true,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => '1min',
                '5m' => '5min',
                '15m' => '15min',
                '30m' => '30min',
                '1h' => '1hour',
                '8h' => '8hour',
                '1d' => '1day',
                '1w' => '1week',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api' => 'https://api.kucoin.com',
                'www' => 'https://kucoin.com',
                'doc' => 'https://kucoinapidocs.docs.apiary.io',
                'fees' => 'https://news.kucoin.com/en/fee',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'deal-orders',
                        'order/active',
                        'order/dealt',
                        'referrer/descendant/count',
                        'user/info',
                    ),
                    'post' => array (
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'cancel-order',
                        'order',
                        'user/change-lang',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0010,
                    'taker' => 0.0010,
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $response = $this->publicGetMarketOpenSymbols ();
        $markets = $response['data'];
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['symbol'];
            $base = $market['coinType'];
            $quote = $market['coinTypePair'];
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => 8,
                'price' => 8,
            );
            $active = $market['trading'];
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'active' => $active,
                'info' => $market,
                'lot' => pow (10, -$precision['amount']),
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => pow (10, -$precision['amount']),
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => null,
                        'max' => null,
                    ),
                ),
            ));
        }
        return $result;
    }

    public function fetch_currencies ($params = array ()) {
        $response = $this->publicGetMarketOpenCoins ($params);
        $currencies = $response['data'];
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $id = $currency['coin'];
            // todo => will need to rethink the fees
            // to add support for multiple withdrawal/$deposit methods and
            // differentiated fees for each particular method
            $code = $this->common_currency_code($id);
            $precision = array (
                'amount' => $currency['tradePrecision'],
                'price' => $currency['tradePrecision'],
            );
            $deposit = $currency['enableDeposit'];
            $withdraw = $currency['enableWithdraw'];
            $active = ($deposit && $withdraw);
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'info' => $currency,
                'name' => $currency['name'],
                'active' => $active,
                'status' => 'ok',
                'fee' => $currency['withdrawFeeRate'], // todo => redesign
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => pow (10, -$precision['amount']),
                        'max' => pow (10, $precision['amount']),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision['price']),
                        'max' => pow (10, $precision['price']),
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => $currency['withdrawMinAmount'],
                        'max' => pow (10, $precision['amount']),
                    ),
                ),
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        throw new ExchangeError ($this->id . ' fetchBalance() / private API not implemented yet');
        //  JUNK FROM SOME OTHER EXCHANGE, TEMPLATE
        //  $response = $this->accountGetBalances ();
        //  $balances = $response['result'];
        //  $result = array ( 'info' => $balances );
        //  $indexed = $this->index_by($balances, 'Currency');
        //  $keys = array_keys ($indexed);
        //  for ($i = 0; $i < count ($keys); $i++) {
        //      $id = $keys[$i];
        //      $currency = $this->common_currency_code($id);
        //      $account = $this->account ();
        //      $balance = $indexed[$id];
        //      $free = floatval ($balance['Available']);
        //      $total = floatval ($balance['Balance']);
        //      $used = $total - $free;
        //      $account['free'] = $free;
        //      $account['used'] = $used;
        //      $account['total'] = $total;
        //      $result[$currency] = $account;
        //  }
        // return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetOpenOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $orderbook = $response['data'];
        return $this->parse_order_book($orderbook, null, 'BUY', 'SELL');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['datetime'];
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $symbol = $ticker['coinType'] . '/' . $ticker['coinTypePair'];
        }
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'buy'),
            'ask' => $this->safe_float($ticker, 'sell'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'lastDealPrice'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'vol'),
            'quoteVolume' => $this->safe_float($ticker, 'volValue'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $response = $this->publicGetMarketOpenSymbols ($params);
        $tickers = $response['data'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $this->parse_ticker($tickers[$t]);
            $symbol = $ticker['symbol'];
            $result[$symbol] = $ticker;
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetOpenTick (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $ticker = $response['data'];
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade[0];
        $side = null;
        if ($trade[1] == 'BUY') {
            $side = 'buy';
        } else if ($trade[1] == 'SELL') {
            $side = 'sell';
        }
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => 'limit',
            'side' => $side,
            'price' => $trade[2],
            'amount' => $trade[3],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetOpenDealOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response['data'], $market, $since, $limit);
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
        $this->load_markets();
        $market = $this->market ($symbol);
        $to = $this->seconds ();
        // whatever I try with from . $to . $limit it does not work (always an empty $response)
        // tried all combinations:
        // - reversing them
        // - changing directions
        // - seconds
        // - milliseconds
        // - datetime strings
        // the endpoint doesn't seem $to work, or something is missing in their docs
        $request = array (
            'symbol' => $market['id'],
            'type' => $this->timeframes[$timeframe],
            'from' => $to - 86400,
            'to' => $to,
        );
        if ($since) {
            $request['from'] = intval ($since / 1000);
        }
        if ($limit) {
            $request['limit'] = $limit;
        }
        $response = $this->publicGetOpenKline (array_merge ($request, $params));
        return $this->parse_ohlcvs($response['data'], $market, $timeframe, $since, $limit);
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $endpoint = '/' . $this->version . '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'] . $endpoint;
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            throw new ExchangeError ($this->id . ' private API not implemented yet');
            // ---------------------------------
            // FROM KUCOIN:
            // String host = "https://$api.kucoin.com";
            // String $endpoint = "/v1/KCS-BTC/order"; // API $endpoint
            // String secret; // The secret assigned when the API created
            // POST parameters：
            //     type => BUY
            //     amount => 10
            //     price => 1.1
            //     Arrange the parameters in ascending alphabetical order (lower cases first), then combine them with & (don't urlencode them, don't add ?, don't add extra &), e.g. amount=10&price=1.1&type=BUY
            //     将查询参数按照字母升序(小字母在前)排列后用&进行连接(请不要进行urlencode操作,开头不要带?,首位不要有额外的&符号)得到的$queryString如 =>  amount=10&price=1.1&type=BUY
            // String $queryString;
            // // splice string for signing
            // String strForSign = $endpoint . "/" . $nonce . "/" . $queryString;
            // // Make a Base64 encoding of the completed string
            // String signatureStr = Base64.getEncoder().encodeToString(strForSign.getBytes("UTF-8"));
            // // KC-API-SIGNATURE in header
            // String signatureResult = hmacEncrypt("HmacSHA256", signatureStr, secret);
            // ----------------------------------
            // TEMPLATE (it is close, but it still needs testing and debugging):
            $this->check_required_credentials();
            // their $nonce is always a calibrated synched milliseconds-timestamp
            $nonce = $this->milliseconds ();
            $queryString = '';
            $nonce = (string) $nonce;
            if ($query) {
                $queryString = $this->rawencode ($this->keysort ($query));
                if ($method == 'GET') {
                    $url .= '?' . $queryString;
                } else {
                    $body = $queryString;
                }
            }
            $auth = $endpoint . '/' . $nonce . '/' . $queryString;
            $payload = base64_encode ($this->encode ($auth));
            // $payload should be "encoded" as returned from stringToBase64
            $signature = $this->hmac ($payload, $this->encode ($this->secret), 'sha512');
            $headers = array (
                'KC-API-KEY' => $this->apiKey (),
                'KC-API-NONCE' => $nonce,
                'KC-API-SIGNATURE' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code >= 400) {
            if ($body[0] == "{") {
                $response = json_decode ($body, $as_associative_array = true);
                if (is_array ($response) && array_key_exists ('success', $response)) {
                    if (!$response['success']) {
                        if (is_array ($response) && array_key_exists ('message', $response)) {
                            if ($response['message'] == 'MIN_TRADE_REQUIREMENT_NOT_MET')
                                throw new InvalidOrder ($this->id . ' ' . $this->json ($response));
                            if ($response['message'] == 'APIKEY_INVALID')
                                throw new AuthenticationError ($this->id . ' ' . $this->json ($response));
                        }
                        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
                    }
                }
            }
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        return $response;
    }
}

?>