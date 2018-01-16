<?php

namespace ccxt;

class kucoin extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'kucoin',
            'name' => 'Kucoin',
            'countries' => 'HK', // Hong Kong
            'version' => 'v1',
            'rateLimit' => 2000,
            'hasCORS' => false,
            'userAgent' => $this->userAgents['chrome'],
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => false,
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
                'fetchOrder' => false,
                'fetchOrders' => true,
                'fetchClosedOrders' => true,
                'fetchOpenOrders' => true,
                'fetchMyTrades' => false,
                'fetchCurrencies' => true,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '8h' => '480',
                '1d' => 'D',
                '1w' => 'W',
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
                        'order/active-map',
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
                'funding' => array (
                    'tierBased' => false,
                    'percentage' => false,
                    'withdraw' => array (
                        'KCS' => 2.0,
                        'BTC' => 0.0005,
                        'USDT' => 10.0,
                        'ETH' => 0.01,
                        'LTC' => 0.001,
                        'NEO' => 0.0,
                        'GAS' => 0.0,
                        'KNC' => 0.5,
                        'BTM' => 5.0,
                        'QTUM' => 0.1,
                        'EOS' => 0.5,
                        'CVC' => 3.0,
                        'OMG' => 0.1,
                        'PAY' => 0.5,
                        'SNT' => 20.0,
                        'BHC' => 1.0,
                        'HSR' => 0.01,
                        'WTC' => 0.1,
                        'VEN' => 2.0,
                        'MTH' => 10.0,
                        'RPX' => 1.0,
                        'REQ' => 20.0,
                        'EVX' => 0.5,
                        'MOD' => 0.5,
                        'NEBL' => 0.1,
                        'DGB' => 0.5,
                        'CAG' => 2.0,
                        'CFD' => 0.5,
                        'RDN' => 0.5,
                        'UKG' => 5.0,
                        'BCPT' => 5.0,
                        'PPT' => 0.1,
                        'BCH' => 0.0005,
                        'STX' => 2.0,
                        'NULS' => 1.0,
                        'GVT' => 0.1,
                        'HST' => 2.0,
                        'PURA' => 0.5,
                        'SUB' => 2.0,
                        'QSP' => 5.0,
                        'POWR' => 1.0,
                        'FLIXX' => 10.0,
                        'LEND' => 20.0,
                        'AMB' => 3.0,
                        'RHOC' => 2.0,
                        'R' => 2.0,
                        'DENT' => 50.0,
                        'DRGN' => 1.0,
                        'ACT' => 0.1,
                    ),
                    'deposit' => 0.00,
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
            $precision = $currency['tradePrecision'];
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
                        'min' => pow (10, -$precision),
                        'max' => pow (10, $precision),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision),
                        'max' => pow (10, $precision),
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => $currency['withdrawMinAmount'],
                        'max' => pow (10, $precision),
                    ),
                ),
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetAccountBalance (array_merge (array (
            'limit' => 20, // default 12, max 20
            'page' => 1,
        ), $params));
        $balances = $response['data'];
        $result = array ( 'info' => $balances );
        $indexed = $this->index_by($balances, 'coinType');
        $keys = is_array ($indexed) ? array_keys ($indexed) : array ();
        for ($i = 0; $i < count ($keys); $i++) {
            $id = $keys[$i];
            $currency = $this->common_currency_code($id);
            $account = $this->account ();
            $balance = $indexed[$id];
            $used = floatval ($balance['freezeBalance']);
            $free = floatval ($balance['balance']);
            $total = $this->sum ($free, $used);
            $account['free'] = $free;
            $account['used'] = $used;
            $account['total'] = $total;
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
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

    public function parse_order ($order, $market = null) {
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $symbol = $order['coinType'] . '/' . $order['coinTypePair'];
        }
        $timestamp = $order['createdAt'];
        $price = $this->safe_value($order, 'price');
        if ($price === null)
            $price = $this->safe_value($order, 'dealPrice');
        $amount = $this->safe_value($order, 'amount');
        $filled = $this->safe_value($order, 'dealAmount', 0);
        $remaining = $this->safe_value($order, 'pendingAmount');
        if ($amount === null)
            if ($filled !== null)
                if ($remaining !== null)
                    $amount = $this->sum ($filled, $remaining);
        $side = strtolower ($order['direction']);
        $fee = null;
        if (is_array ($order) && array_key_exists ('fee', $order)) {
            $fee = array (
                'cost' => $this->safe_float($order, 'fee'),
                'rate' => $this->safe_float($order, 'feeRate'),
            );
            if ($market)
                $fee['currency'] = $market['base'];
        }
        $status = $this->safe_value($order, 'status');
        $result = array (
            'info' => $order,
            'id' => $this->safe_string($order, 'oid'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'cost' => $price * $filled,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => $fee,
        );
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
        );
        $response = $this->privateGetOrderActiveMap (array_merge ($request, $params));
        $orders = $this->array_concat($response['data']['SELL'], $response['data']['BUY']);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            $result[] = array_merge ($orders[$i], array ( 'status' => 'open' ));
        }
        return $this->parse_orders($result, $market, $since, $limit);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $request = array ();
        $this->load_markets();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['symbol'] = $market['id'];
        }
        if ($since) {
            $request['since'] = $since;
        }
        if ($limit) {
            $request['limit'] = $limit;
        }
        $response = $this->privateGetOrderDealt (array_merge ($request, $params));
        $orders = $response['data']['datas'];
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            $result[] = array_merge ($orders[$i], array ( 'status' => 'closed' ));
        }
        return $this->parse_orders($result, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type != 'limit')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets();
        $market = $this->market ($symbol);
        $base = $market['base'];
        $order = array (
            'symbol' => $market['id'],
            'type' => strtoupper ($side),
            'price' => $this->price_to_precision($symbol, $price),
            'amount' => $this->truncate ($amount, $this->currencies[$base]['precision']),
        );
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $this->safe_string($response['data'], 'orderOid'),
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder requires $symbol argument');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'orderOid' => $id,
        );
        if (is_array ($params) && array_key_exists ('type', $params)) {
            $request['type'] = strtoupper ($params['type']);
        } else {
            throw new ExchangeError ($this->id . ' cancelOrder requires type (BUY or SELL) param');
        }
        $response = $this->privatePostCancelOrder (array_merge ($request, $params));
        return $response;
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

    public function parse_trading_view_ohlcvs ($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $result = array ();
        for ($i = 0; $i < count ($ohlcvs['t']); $i++) {
            $result[] = [
                $ohlcvs['t'][$i],
                $ohlcvs['o'][$i],
                $ohlcvs['h'][$i],
                $ohlcvs['l'][$i],
                $ohlcvs['c'][$i],
                $ohlcvs['v'][$i],
            ];
        }
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $end = $this->seconds ();
        $resolution = $this->timeframes[$timeframe];
        // convert 'resolution' to $minutes in order to calculate 'from' later
        $minutes = $resolution;
        if ($minutes == 'D') {
            if (!$limit)
                $limit = 30; // 30 days, 1 month
            $minutes = 1440;
        } else if ($minutes == 'W') {
            if (!$limit)
                $limit = 52; // 52 weeks, 1 year
            $minutes = 10080;
        } else if (!$limit) {
            $limit = 1440;
            $minutes = 1440;
        }
        $start = $end - $minutes * 60 * $limit;
        if ($since) {
            $start = intval ($since / 1000);
            $end = $this->sum ($start, $minutes * 60 * $limit);
        }
        $request = array (
            'symbol' => $market['id'],
            'type' => $this->timeframes[$timeframe],
            'resolution' => $resolution,
            'from' => $start,
            'to' => $end,
        );
        $response = $this->publicGetOpenChartHistory (array_merge ($request, $params));
        return $this->parse_trading_view_ohlcvs ($response, $market, $timeframe, $since, $limit);
    }

    public function withdraw ($code, $amount, $address, $params = array ()) {
        $this->load_markets();
        $currency = $this->currency ($code);
        $response = $this->privatePostAccountCoinWithdrawApply (array_merge (array (
            'coin' => $currency['id'],
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $endpoint = '/' . $this->version . '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'] . $endpoint;
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            // their $nonce is always a calibrated synched milliseconds-timestamp
            $nonce = $this->milliseconds ();
            $queryString = '';
            $nonce = (string) $nonce;
            if ($query) {
                $queryString = $this->rawencode ($this->keysort ($query));
                $url .= '?' . $queryString;
                if ($method != 'GET') {
                    $body = $queryString;
                }
            }
            $auth = $endpoint . '/' . $nonce . '/' . $queryString;
            $payload = base64_encode ($this->encode ($auth));
            // $payload should be "encoded" as returned from stringToBase64
            $signature = $this->hmac ($payload, $this->encode ($this->secret), 'sha256');
            $headers = array (
                'KC-API-KEY' => $this->apiKey,
                'KC-API-NONCE' => $nonce,
                'KC-API-SIGNATURE' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function throw_exception_on_error ($response) {
        if (is_array ($response) && array_key_exists ('success', $response)) {
            if (!$response['success']) {
                if (is_array ($response) && array_key_exists ('code', $response)) {
                    $message = $this->safe_string($response, 'msg');
                    if ($response['code'] == 'UNAUTH') {
                        if ($message == 'Invalid nonce')
                            throw new InvalidNonce ($this->id . ' ' . $message);
                        throw new AuthenticationError ($this->id . ' ' . $this->json ($response));
                    } else if ($response['code'] == 'ERROR') {
                        if (mb_strpos ($message, 'precision of amount') !== false)
                            throw new InvalidOrder ($this->id . ' ' . $message);
                    }
                }
            }
        }
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($body && ($body[0] == "{")) {
            $response = json_decode ($body, $as_associative_array = true);
            $this->throw_exception_on_error ($response);
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        $this->throw_exception_on_error ($response);
        return $response;
    }
}
