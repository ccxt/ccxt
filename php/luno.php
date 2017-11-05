<?php

namespace ccxt;

include_once ('base/Exchange.php');

class luno extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'luno',
            'name' => 'luno',
            'countries' => array ( 'GB', 'SG', 'ZA' ),
            'rateLimit' => 3000,
            'version' => '1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
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
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTickers ();
        $result = array ();
        for ($p = 0; $p < count ($markets['tickers']); $p++) {
            $market = $markets['tickers'][$p];
            $id = $market['pair'];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
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
        $response = $this->privateGetBalance ();
        $balances = $response['balance'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $this->common_currency_code($balance['asset']);
            $reserved = floatval ($balance['reserved']);
            $unconfirmed = floatval ($balance['unconfirmed']);
            $account = array (
                'free' => floatval ($balance['balance']),
                'used' => $this->sum ($reserved, $unconfirmed),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'pair' => $this->market_id($symbol),
        ), $params));
        $timestamp = $orderbook['timestamp'];
        return $this->parse_order_book($orderbook, $timestamp, 'bids', 'asks', 'price', 'volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
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

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetTickers ($params);
        $tickers = $this->index_by($response['tickers'], 'pair');
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
        $ticker = $this->publicGetTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $side = ($trade['is_buy']) ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => null,
            'order' => null,
            'timestamp' => $trade['timestamp'],
            'datetime' => $this->iso8601 ($trade['timestamp']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['volume']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades($response['trades'], $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $method = 'privatePost';
        $order = array ( 'pair' => $this->market_id($market) );
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
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostStoporder (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        if ($api == 'private') {
            $auth = $this->encode ($this->apiKey . ':' . $this->secret);
            $auth = base64_encode ($auth);
            $headers = array ( 'Authorization' => 'Basic ' . $this->decode ($auth) );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>