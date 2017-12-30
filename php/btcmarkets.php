<?php

namespace ccxt;

class btcmarkets extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'btcmarkets',
            'name' => 'BTC Markets',
            'countries' => 'AU', // Australia
            'rateLimit' => 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchOpenOrders' => true,
            'has' => array (
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchClosedOrders' => 'emulated',
                'fetchOpenOrders' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg',
                'api' => 'https://api.btcmarkets.net',
                'www' => 'https://btcmarkets.net/',
                'doc' => 'https://github.com/BTCMarkets/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'market/{id}/tick',
                        'market/{id}/orderbook',
                        'market/{id}/trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account/balance',
                        'account/{id}/tradingfee',
                    ),
                    'post' => array (
                        'fundtransfer/withdrawCrypto',
                        'fundtransfer/withdrawEFT',
                        'order/create',
                        'order/cancel',
                        'order/history',
                        'order/open',
                        'order/trade/history',
                        'order/createBatch', // they promise it's coming soon...
                        'order/detail',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/AUD' => array ( 'id' => 'BTC/AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'LTC/AUD' => array ( 'id' => 'LTC/AUD', 'symbol' => 'LTC/AUD', 'base' => 'LTC', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'ETH/AUD' => array ( 'id' => 'ETH/AUD', 'symbol' => 'ETH/AUD', 'base' => 'ETH', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'ETC/AUD' => array ( 'id' => 'ETC/AUD', 'symbol' => 'ETC/AUD', 'base' => 'ETC', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'XRP/AUD' => array ( 'id' => 'XRP/AUD', 'symbol' => 'XRP/AUD', 'base' => 'XRP', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'BCH/AUD' => array ( 'id' => 'BCH/AUD', 'symbol' => 'BCH/AUD', 'base' => 'BCH', 'quote' => 'AUD', 'maker' => 0.0085, 'taker' => 0.0085 ),
                'LTC/BTC' => array ( 'id' => 'LTC/BTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'maker' => 0.0022, 'taker' => 0.0022 ),
                'ETH/BTC' => array ( 'id' => 'ETH/BTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'maker' => 0.0022, 'taker' => 0.0022 ),
                'ETC/BTC' => array ( 'id' => 'ETC/BTC', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC', 'maker' => 0.0022, 'taker' => 0.0022 ),
                'XRP/BTC' => array ( 'id' => 'XRP/BTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC', 'maker' => 0.0022, 'taker' => 0.0022 ),
                'BCH/BTC' => array ( 'id' => 'BCH/BTC', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'maker' => 0.0022, 'taker' => 0.0022 ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privateGetAccountBalance ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $multiplier = 100000000;
            $total = floatval ($balance['balance'] / $multiplier);
            $used = floatval ($balance['pendingFunds'] / $multiplier);
            $free = $total - $used;
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
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetMarketIdOrderbook (array_merge (array (
            'id' => $market['id'],
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        return $this->parse_order_book($orderbook, $timestamp);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bestBid']),
            'ask' => floatval ($ticker['bestAsk']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume24h']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetMarketIdTick (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketIdTrades (array_merge (array (
            // 'since' => 59868345231,
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $multiplier = 100000000; // for $price and volume
        // does BTC Markets support $market orders at all?
        $orderSide = ($side == 'buy') ? 'Bid' : 'Ask';
        $order = $this->ordered (array (
            'currency' => $market['quote'],
        ));
        $order['currency'] = $market['quote'];
        $order['instrument'] = $market['base'];
        $order['price'] = intval ($price * $multiplier);
        $order['volume'] = intval ($amount * $multiplier);
        $order['orderSide'] = $orderSide;
        $order['ordertype'] = $this->capitalize ($type);
        $order['clientRequestId'] = (string) $this->nonce ();
        $response = $this->privatePostOrderCreate ($order);
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_orders ($ids) {
        $this->load_markets();
        return $this->privatePostOrderCancel (array ( 'order_ids' => $ids ));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->cancel_orders (array ( $id ));
    }

    public function parse_order_trade ($trade, $market) {
        $multiplier = 100000000;
        $timestamp = $trade['creationTime'];
        $side = ($trade['side'] == 'Bid') ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'] / $multiplier,
            'fee' => $trade['fee'] / $multiplier,
            'amount' => $trade['volume'] / $multiplier,
        );
    }

    public function parse_order ($order, $market = null) {
        $multiplier = 100000000;
        $side = ($order['orderSide'] == 'Bid') ? 'buy' : 'sell';
        $type = ($order['ordertype'] == 'Limit') ? 'limit' : 'market';
        $timestamp = $order['creationTime'];
        if (!$market) {
            $market = $this->market ($order['instrument'] . '/' . $order['currency']);
        }
        $status = 'open';
        if ($order['status'] == 'Failed' || $order['status'] == 'Cancelled' || $order['status'] == 'Partially Cancelled' || $order['status'] == 'Error') {
            $status = 'canceled';
        } else if ($order['status'] == "Fully Matched" || $order['status'] == "Partially Matched") {
            $status = 'closed';
        }
        $price = $this->safe_float($order, 'price') / $multiplier;
        $amount = $this->safe_float($order, 'volume') / $multiplier;
        $remaining = $this->safe_float($order, 'openVolume', 0.0) / $multiplier;
        $filled = $amount - $remaining;
        $cost = $price * $amount;
        $trades = array ();
        for ($i = 0; $i < count ($order['trades']); $i++) {
            $trade = $this->parse_order_trade ($order['trades'][$i], $market);
            $trades[] = $trade;
        }
        $result = array (
            'info' => $order,
            'id' => (string) $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'trades' => $trades,
        );
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $ids = array ( $id );
        $response = $this->privatePostOrderDetail (array_merge (array (
            'orderIds' => $ids,
        ), $params));
        $numOrders = is_array ($response['orders']) ? count ($response['orders']) : 0;
        if ($numOrders < 1)
            throw new OrderNotFound ($this->id . ' No matching order found => ' . $id);
        return $this->parse_order($response['orders'][0]);
    }

    public function prepare_orders_request ($market, $since = null, $limit = null, $params = array ()) {
        $request = $this->ordered (array (
            'currency' => $market['quote'],
            'instrument' => $market['base'],
        ));
        if ($limit) {
            $request['limit'] = $limit;
        } else {
            $request['limit'] = 100;
        }
        if ($since) {
            $request['since'] = $since;
        } else {
            $request['since'] = 0;
        }
        return $request;
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new NotSupported ($this->id . ' => fetchOrders requires a `$symbol` parameter.');
        $this->load_markets();
        $market = null;
        $market = $this->market ($symbol);
        $request = $this->prepare_orders_request ($market, $since, $limit, $params);
        $response = $this->privatePostOrderHistory (array_merge ($request, $params));
        return $this->parse_orders($response['orders'], $market);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new NotSupported ($this->id . ' => fetchOpenOrders requires a `$symbol` parameter.');
        $this->load_markets();
        $market = null;
        $market = $this->market ($symbol);
        $request = $this->prepare_orders_request ($market, $since, $limit, $params);
        $response = $this->privatePostOrderOpen (array_merge ($request, $params));
        return $this->parse_orders($response['orders'], $market);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $params);
        return $this->filter_by($orders, 'status', 'closed');
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $uri = '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'] . $uri;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $auth = $uri . "\n" . $nonce . "\n";
            $headers = array (
                'Content-Type' => 'application/json',
                'apikey' => $this->apiKey,
                'timestamp' => $nonce,
            );
            if ($method == 'POST') {
                $body = $this->json ($params);
                $auth .= $body;
            }
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64');
            $headers['signature'] = $this->decode ($signature);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private') {
            if (is_array ($response) && array_key_exists ('success', $response))
                if (!$response['success'])
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            return $response;
        }
        return $response;
    }
}
