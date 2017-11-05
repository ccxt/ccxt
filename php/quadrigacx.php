<?php

namespace ccxt;

include_once ('base/Exchange.php');

class quadrigacx extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'quadrigacx',
            'name' => 'QuadrigaCX',
            'countries' => 'CA',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
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
            'markets' => array (
                'BTC/CAD' => array ( 'id' => 'btc_cad', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETH/CAD' => array ( 'id' => 'eth_cad', 'symbol' => 'ETH/CAD', 'base' => 'ETH', 'quote' => 'CAD' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
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
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderBook (array_merge (array (
            'book' => $this->market_id($symbol),
        ), $params));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        return $this->parse_order_book($orderbook, $timestamp);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTicker (array_merge (array (
            'book' => $this->market_id($symbol),
        ), $params));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
            'symbol' => $symbol,
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

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'book' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'amount' => $amount,
            'book' => $this->market_id($symbol),
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
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
            );
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