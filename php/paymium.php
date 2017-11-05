<?php

namespace ccxt;

include_once ('base/Exchange.php');

class paymium extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'paymium',
            'name' => 'Paymium',
            'countries' => array ( 'FR', 'EU' ),
            'rateLimit' => 2000,
            'version' => 'v1',
            'hasCORS' => true,
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
                        'data/array (id)/ticker',
                        'data/array (id)/trades',
                        'data/array (id)/depth',
                        'bitcoin_charts/array (id)/trades',
                        'bitcoin_charts/array (id)/depth',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'merchant/get_payment/array (UUID)',
                        'user',
                        'user/addresses',
                        'user/addresses/array (btc_address)',
                        'user/orders',
                        'user/orders/array (UUID)',
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
                        'user/orders/array (UUID)/cancel',
                        'user/price_alerts/array (id)',
                    ),
                ),
            ),
            'markets' => array (                'BTC/EUR' => array ( 'id' => 'eur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR'),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $balances = $this->privateGetUser ();
        $result = array ('info' => $balances);
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $balance = 'balance_' . $lowercase;
            $locked = 'locked_' . $lowercase;
            if (array_key_exists ($balance, $balances))
                $account['free'] = $balances[$balance];
            if (array_key_exists ($locked, $balances))
                $account['used'] = $balances[$locked];
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetDataIdDepth (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $result = $this->parse_order_book($orderbook, null, 'bids', 'asks', 'price', 'amount');
        $result['bids'] = $this->sort_by($result['bids'], 0, true);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetDataIdTicker (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $timestamp = $ticker['at'] * 1000;
        return array (
            'symbol' => $symbol,
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

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['created_at_int']) * 1000;
        $volume = 'traded_' . strtolower ($market['base']);
        return array (
            'info' => $trade,
            'id' => $trade['uuid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade[$volume],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetDataIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'type' => $this->capitalize ($type) . 'Order',
            'currency' => $this->market_id($market),
            'direction' => $side,
            'amount' => $amount,
        );
        if ($type == 'market')
            $order['price'] = $price;
        $response = $this->privatePostUserOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['uuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array_merge (array (
            'orderNumber' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
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
        return array ('url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers);
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>