<?php

namespace ccxt;

include_once ('base/Exchange.php');

class qryptos extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'qryptos',
            'name' => 'QRYPTOS',
            'countries' => array ( 'CN', 'TW' ),
            'version' => '2',
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'has' => array (
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg',
                'api' => 'https://api.qryptos.com',
                'www' => 'https://www.qryptos.com',
                'doc' => 'https://developers.quoine.com',
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
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetProducts ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['id'];
            $base = $market['base_currency'];
            $quote = $market['quoted_currency'];
            $symbol = $base . '/' . $quote;
            $maker = floatval ($market['maker_fee']);
            $taker = floatval ($market['taker_fee']);
            $active = !$market['disabled'];
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'maker' => $maker,
                'taker' => $taker,
                'active' => $active,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privateGetAccountsBalance ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $total = floatval ($balance['balance']);
            $account = array (
                'free' => $total,
                'used' => 0.0,
                'total' => $total,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetProductsIdPriceLevels (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'buy_price_levels', 'sell_price_levels');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $last = null;
        if (array_key_exists ('last_traded_price', $ticker)) {
            if ($ticker['last_traded_price']) {
                $length = count ($ticker['last_traded_price']);
                if ($length > 0)
                    $last = floatval ($ticker['last_traded_price']);
            }
        }
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high_market_ask']),
            'low' => floatval ($ticker['low_market_bid']),
            'bid' => floatval ($ticker['market_bid']),
            'ask' => floatval ($ticker['market_ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_24h']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetProducts ($params);
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $base = $ticker['base_currency'];
            $quote = $ticker['quoted_currency'];
            $symbol = $base . '/' . $quote;
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetProductsId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['created_at'] * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['taker_side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['quantity']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'product_id' => $market['id'],
        );
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->publicGetExecutions (array_merge ($request, $params));
        return $this->parse_trades($response['models'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'order_type' => $type,
            'product_id' => $this->market_id($symbol),
            'side' => $side,
            'quantity' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrders (array_merge (array (
            'order' => $order,
        ), $params));
        return $this->parse_order ($response);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePutOrdersIdCancel (array_merge (array (
            'id' => $id,
        ), $params));
    }

    public function parse_order ($order) {
        $timestamp = $order['created_at'] * 1000;
        $marketId = $order['product_id'];
        $market = $this->marketsById[$marketId];
        $status = null;
        if (array_key_exists ('status', $order)) {
            if ($order['status'] == 'live') {
                $status = 'open';
            } else if ($order['status'] == 'filled') {
                $status = 'closed';
            } else if ($order['status'] == 'cancelled') { // 'll' intended
                $status = 'canceled';
            }
        }
        $amount = floatval ($order['quantity']);
        $filled = floatval ($order['filled_quantity']);
        return array (
            'id' => $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'type' => $order['order_type'],
            'status' => $status,
            'symbol' => $market['symbol'],
            'side' => $order['side'],
            'price' => $order['price'],
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $amount - $filled,
            'trades' => null,
            'fee' => array (
                'currency' => null,
                'cost' => floatval ($order['order_fee']),
            ),
            'info' => $order,
        );
    }

    public function fetch_order ($id) {
        $this->load_markets();
        $order = $this->privateGetOrdersId (array ( 'id' => $id ));
        return $this->parse_order($order);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params=array ()) {
        $this->load_markets();
        $market = null;
        $request = array ();
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $status = $params['status'];
        if ($status == 'open') {
            $request['status'] = 'live';
        } else if ($status == 'closed') {
            $request['status'] = 'filled';
        } else if ($status == 'canceled') {
            $request['status'] = 'cancelled';
        }
        $result = $this->privateGetOrders ($request);
        $orders = $result['models'];
        return $this->parse_orders($orders, $market);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_orders($symbol, $since, $limit, array_merge (array ( 'status' => 'open' ), $params));
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        return $this->fetch_orders($symbol, $since, $limit, array_merge (array ( 'status' => 'closed' ), $params));
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        $response = null;
        if ($code == 200 || $code == 404 || $code == 422) {
            if (($body[0] == '{') || ($body[0] == '[')) {
                $response = json_decode ($body, $as_associative_array = true);
            } else {
                // if not a JSON $response
                throw new ExchangeError ($this->id . ' returned a non-JSON reply => ' . $body);
            }
        }
        if ($code == 404) {
            if (array_key_exists ('message', $response)) {
                if ($response['message'] == 'Order not found') {
                    throw new OrderNotFound ($this->id . ' ' . $body);
                }
            }
        } else if ($code == 422) {
            if (array_key_exists ('errors', $response)) {
                $errors = $response['errors'];
                if (array_key_exists ('user', $errors)) {
                    $messages = $errors['user'];
                    if (mb_strpos ($messages, 'not_enough_free_balance') !== false) {
                        throw new InsufficientFunds ($this->id . ' ' . $body);
                    }
                }
            }
        }
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        $headers = array (
            'X-Quoine-API-Version' => $this->version,
            'Content-Type' => 'application/json',
        );
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            if ($method == 'GET') {
                if ($query)
                    $url .= '?' . $this->urlencode ($query);
            } else if ($query) {
                $body = $this->json ($query);
            }
            $nonce = $this->nonce ();
            $request = array (
                'path' => $url,
                'nonce' => $nonce,
                'token_id' => $this->apiKey,
                'iat' => (int) floor ($nonce / 1000), // issued at
            );
            $headers['X-Quoine-Auth'] = $this->jwt ($request, $this->secret);
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

?>