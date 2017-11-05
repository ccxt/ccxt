<?php

namespace ccxt;

include_once ('base/Exchange.php');

class huobipro extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'huobipro',
            'name' => 'Huobi Pro',
            'countries' => 'CN',
            'rateLimit' => 2000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOHLCV' => true,
            'accounts' => null,
            'accountsById' => null,
            'hostname' => 'api.huobi.pro',
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
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api' => 'https://api.huobi.pro',
                'www' => 'https://www.huobi.pro',
                'doc' => 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
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
        ));
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
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $market['amount-precision'],
                'price' => $market['price-precision'],
            );
            $lot = pow (10, -$precision['amount']);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $lot,
                        'max' => pow (10, $precision['amount']),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision['price']),
                        'max' => null,
                    ),
                    'cost' => array (
                        'min' => 0,
                        'max' => null,
                    ),
                ),
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
        $bid = null;
        $ask = null;
        if (array_key_exists ('bid', $ticker)) {
            if ($ticker['bid'])
                $bid = $this->safe_float($ticker['bid'], 0);
        }
        if (array_key_exists ('ask', $ticker)) {
            if ($ticker['ask'])
                $ask = $this->safe_float($ticker['ask'], 0);
        }
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => $bid,
            'ask' => $ask,
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
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->marketGetDepth (array_merge (array (
            'symbol' => $market['id'],
            'type' => 'step0',
        ), $params));
        return $this->parse_order_book($response['tick'], $response['tick']['ts']);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->marketGetDetailMerged (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($response['tick'], $market);
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
            $trades = $this->parse_trades($data[$i]['data'], $market);
            for ($k = 0; $k < count ($trades); $k++) {
                $result[] = $trades[$k];
            }
        }
        return $result;
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->marketGetHistoryTrade (array_merge (array (
            'symbol' => $market['id'],
            'size' => 2000,
        ), $params));
        return $this->parse_trades_data($response['data'], $market);
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
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->marketGetHistoryKline (array_merge (array (
            'symbol' => $market['id'],
            'period' => $this->timeframes[$timeframe],
            'size' => 2000, // max = 2000
        ), $params));
        return $this->parse_ohlcvs($response['data'], $market, $timeframe, $since, $limit);
    }

    public function load_accounts ($reload = false) {
        if ($reload) {
            $this->accounts = $this->fetchAccounts ();
        } else {
            if ($this->accounts) {
                return $this->accounts;
            } else {
                $this->accounts = $this->fetchAccounts ();
                $this->accountsById = $this->index_by($this->accounts, 'id');
            }
        }
        return $this->accounts;
    }

    public function fetch_accounts () {
        $this->load_markets();
        $response = $this->privateGetAccountAccounts ();
        return $response['data'];
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $this->loadAccounts ();
        $response = $this->privateGetAccountAccountsIdBalance (array_merge (array (
            'id' => $this->accounts[0]['id'],
        ), $params));
        $balances = $response['data']['list'];
        $result = array ('info' => $response);
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $uppercase = strtoupper ($balance['currency']);
            $currency = $this->common_currency_code($uppercase);
            $account = null;
            if (array_key_exists ($currency, $result))
                $account = $result[$currency];
            else
                $account = $this->account ();
            if ($balance['type'] == 'trade')
                $account['free'] = floatval ($balance['balance']);
            if ($balance['type'] == 'frozen')
                $account['used'] = floatval ($balance['balance']);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $this->loadAccounts ();
        $market = $this->market ($symbol);
        $order = array (
            'account-id' => $this->accounts[0]['id'],
            'amount' => $this->amount_to_precision($symbol, $amount),
            'symbol' => $market['id'],
            'type' => $side . '-' . $type,
        );
        if ($type == 'limit')
            $order['price'] = $this->price_to_precision($symbol, $price);
        $response = $this->privatePostOrderOrdersPlace (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['data'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostOrderOrdersIdSubmitcancel (array ('id' => $id));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/';
        if ($api == 'market')
            $url .= $api;
        else
            $url .= $this->version;
        $url .= '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
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
            $auth .= '&' . $this->urlencode (array ('Signature' => $signature));
            $url .= '?' . $auth;
            if ($method == 'POST') {
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
        return array ('url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers);
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>