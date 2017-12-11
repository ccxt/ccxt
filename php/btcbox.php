<?php

namespace ccxt;

include_once ('base/Exchange.php');

class btcbox extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
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
            'markets' => array (
                'BTC/JPY' => array ( 'id' => 'BTC/JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($this->currencies);
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
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
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $orderbook = $this->publicGetDepth (array_merge ($request, $params));
        $result = $this->parse_order_book($orderbook);
        $result['asks'] = $this->sort_by($result['asks'], 0);
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
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'buy'),
            'ask' => $this->safe_float($ticker, 'sell'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'vol'),
            'quoteVolume' => $this->safe_float($ticker, 'volume'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetAllticker ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $ticker = $this->publicGetTicker (array_merge ($request, $params));
        return $this->parse_ticker($ticker, $market);
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

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ();
        $numSymbols = count ($this->symbols);
        if ($numSymbols > 1)
            $request['coin'] = $market['id'];
        $response = $this->publicGetOrders (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
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
        $this->load_markets();
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
            $this->check_required_credentials();
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

?>