<?php

namespace ccxt;

include_once ('base/Exchange.php');

class therock extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'therock',
            'name' => 'TheRockTrading',
            'countries' => 'MT',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
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
                        'funds/array (fund_id)/orders',
                        'funds/array (fund_id)/orders/{id}',
                        'funds/array (fund_id)/position_balances',
                        'funds/array (fund_id)/positions',
                        'funds/array (fund_id)/positions/{id}',
                        'transactions',
                        'transactions/{id}',
                        'withdraw_limits/{id}',
                        'withdraw_limits',
                    ),
                    'post' => array (
                        'atms/withdraw',
                        'funds/array (fund_id)/orders',
                    ),
                    'delete' => array (
                        'funds/array (fund_id)/orders/{id}',
                        'funds/array (fund_id)/orders/remove_all',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetFundsTickers ();
        $result = array ();
        for ($p = 0; $p < count ($markets['tickers']); $p++) {
            $market = $markets['tickers'][$p];
            $id = $market['fund_id'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetBalances ();
        $balances = $response['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $free = $balance['trading_balance'];
            $total = $balance['balance'];
            $used = $total - $free;
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $total,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetFundsIdOrderbook (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $timestamp = $this->parse8601 ($orderbook['date']);
        return $this->parse_order_book($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['date']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
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

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetFundsTickers ($params);
        $tickers = $this->index_by($response['tickers'], 'fund_id');
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
        $ticker = $this->publicGetFundsIdTicker (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        if (!$market)
            $market = $this->markets_by_id[$trade['fund_id']];
        $timestamp = $this->parse8601 ($trade['date']);
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetFundsIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $response = $this->privatePostFundsFundIdOrders (array_merge (array (
            'fund_id' => $this->market_id($symbol),
            'side' => $side,
            'amount' => $amount,
            'price' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privateDeleteFundsFundIdOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'private') {
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
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>