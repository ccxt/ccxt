<?php

namespace ccxt;

class gdax extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'gdax',
            'name' => 'GDAX',
            'countries' => 'US',
            'rateLimit' => 1000,
            'userAgent' => $this->userAgents['chrome'],
            'hasCORS' => true,
            'hasFetchOHLCV' => true,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'timeframes' => array (
                '1m' => 60,
                '5m' => 300,
                '15m' => 900,
                '30m' => 1800,
                '1h' => 3600,
                '2h' => 7200,
                '4h' => 14400,
                '12h' => 43200,
                '1d' => 86400,
                '1w' => 604800,
                '1M' => 2592000,
                '1y' => 31536000,
            ),
            'urls' => array (
                'test' => 'https://api-public.sandbox.gdax.com',
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api' => 'https://api.gdax.com',
                'www' => 'https://www.gdax.com',
                'doc' => 'https://docs.gdax.com',
            ),
            'requiredCredentials' => array (
                'apiKey' => true,
                'secret' => true,
                'password' => true,
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currencies',
                        'products',
                        'products/{id}/book',
                        'products/{id}/candles',
                        'products/{id}/stats',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                        'time',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'accounts',
                        'accounts/{id}',
                        'accounts/{id}/holds',
                        'accounts/{id}/ledger',
                        'coinbase-accounts',
                        'fills',
                        'funding',
                        'orders',
                        'orders/{id}',
                        'payment-methods',
                        'position',
                        'reports/{id}',
                        'users/self/trailing-volume',
                    ),
                    'post' => array (
                        'deposits/coinbase-account',
                        'deposits/payment-method',
                        'funding/repay',
                        'orders',
                        'position/close',
                        'profiles/margin-transfer',
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ),
                    'delete' => array (
                        'orders',
                        'orders/{id}',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'tierBased' => true, // complicated tier system per coin
                    'percentage' => true,
                    'maker' => 0.0,
                    'taker' => 0.30 / 100, // worst-case scenario => https://www.gdax.com/fees/BTC-USD
                ),
                'funding' => array (
                    'tierBased' => false,
                    'percentage' => false,
                    'withdraw' => array (
                        'BTC' => 0.001,
                        'LTC' => 0.001,
                        'ETH' => 0.001,
                        'EUR' => 0.15,
                        'USD' => 25,
                    ),
                    'deposit' => array (
                        'BTC' => 0,
                        'LTC' => 0,
                        'ETH' => 0,
                        'EUR' => 0.15,
                        'USD' => 10,
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
            $quote = $market['quote_currency'];
            $symbol = $base . '/' . $quote;
            $amountLimits = array (
                'min' => $market['base_min_size'],
                'max' => $market['base_max_size'],
            );
            $priceLimits = array (
                'min' => $market['quote_increment'],
                'max' => null,
            );
            $costLimits = array (
                'min' => $priceLimits['min'],
                'max' => null,
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
                'cost' => $costLimits,
            );
            $precision = array (
                'amount' => -log10 (floatval ($amountLimits['min'])),
                'price' => -log10 (floatval ($priceLimits['min'])),
            );
            $taker = $this->fees['trading']['taker'];
            if (($base == 'ETH') || ($base == 'LTC')) {
                $taker = 0.003;
            }
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'precision' => $precision,
                'limits' => $limits,
                'taker' => $taker,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privateGetAccounts ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['hold']),
                'total' => floatval ($balance['balance']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetProductsIdBook (array_merge (array (
            'id' => $this->market_id($symbol),
            'level' => 2, // 1 best bidask, 2 aggregated, 3 full
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array_merge (array (
            'id' => $market['id'],
        ), $params);
        $ticker = $this->publicGetProductsIdTicker ($request);
        $timestamp = $this->parse8601 ($ticker['time']);
        $bid = null;
        $ask = null;
        if (is_array ($ticker) && array_key_exists ('bid', $ticker))
            $bid = floatval ($ticker['bid']);
        if (is_array ($ticker) && array_key_exists ('ask', $ticker))
            $ask = floatval ($ticker['ask']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'price'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['time']);
        $side = ($trade['side'] == 'buy') ? 'sell' : 'buy';
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $fee = null;
        if (is_array ($trade) && array_key_exists ('fill_fees', $trade)) {
            $fee = array (
                'cost' => floatval ($trade['fill_fees']),
                'currency' => $market['quote'],
            );
        }
        return array (
            'id' => (string) $trade['trade_id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['size']),
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetProductsIdTrades (array_merge (array (
            'id' => $market['id'], // fixes issue #2
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[3],
            $ohlcv[2],
            $ohlcv[1],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $granularity = $this->timeframes[$timeframe];
        $request = array (
            'id' => $market['id'],
            'granularity' => $granularity,
        );
        if ($since) {
            $request['start'] = $this->iso8601 ($since);
            if (!$limit)
                $limit = 200; // max = 200
            $request['end'] = $this->iso8601 ($limit * $granularity * 1000 . $since);
        }
        $response = $this->publicGetProductsIdCandles (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function fetch_time () {
        $response = $this->publicGetTime ();
        return $this->parse8601 ($response['iso']);
    }

    public function parse_order_status ($status) {
        $statuses = array (
            'pending' => 'open',
            'active' => 'open',
            'open' => 'open',
            'done' => 'closed',
            'canceled' => 'canceled',
        );
        return $this->safe_string($statuses, $status, $status);
    }

    public function parse_order ($order, $market = null) {
        $timestamp = $this->parse8601 ($order['created_at']);
        $symbol = null;
        if (!$market) {
            if (is_array ($this->markets_by_id) && array_key_exists ($order['product_id'], $this->markets_by_id))
                $market = $this->markets_by_id[$order['product_id']];
        }
        $status = $this->parse_order_status($order['status']);
        $price = $this->safe_float($order, 'price');
        $amount = $this->safe_float($order, 'size');
        $filled = $this->safe_float($order, 'filled_size');
        $remaining = $amount - $filled;
        $cost = $this->safe_float($order, 'executed_value');
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $order['id'],
            'info' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $status,
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privateGetOrdersId (array_merge (array (
            'id' => $id,
        ), $params));
        return $this->parse_order($response);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array (
            'status' => 'all',
        );
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders($response, $market, $since, $limit);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders($response, $market, $since, $limit);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array (
            'status' => 'done',
        );
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['product_id'] = $market['id'];
        }
        $response = $this->privateGetOrders (array_merge ($request, $params));
        return $this->parse_orders($response, $market, $since, $limit);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        // $oid = (string) $this->nonce ();
        $order = array (
            'product_id' => $this->market_id($market),
            'side' => $side,
            'size' => $amount,
            'type' => $type,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privateDeleteOrdersId (array ( 'id' => $id ));
    }

    public function get_payment_methods () {
        $response = $this->privateGetPaymentMethods ();
        return $response;
    }

    public function deposit ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $request = array (
            'currency' => $currency,
            'amount' => $amount,
        );
        $method = 'privatePostDeposits';
        if (is_array ($params) && array_key_exists ('payment_method_id', $params)) {
            // deposit from a payment_method, like a bank account
            $method .= 'PaymentMethod';
        } else if (is_array ($params) && array_key_exists ('coinbase_account_id', $params)) {
            // deposit into GDAX account from a Coinbase account
            $method .= 'CoinbaseAccount';
        } else {
            // deposit methodotherwise we did not receive a supported deposit location
            // relevant docs link for the Googlers
            // https://docs.gdax.com/#deposits
            throw new NotSupported ($this->id . ' deposit() requires one of `coinbase_account_id` or `payment_method_id` extra params');
        }
        $response = $this->$method (array_merge ($request, $params));
        if (!$response)
            throw new ExchangeError ($this->id . ' deposit() error => ' . $this->json ($response));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $request = array (
            'currency' => $currency,
            'amount' => $amount,
        );
        $method = 'privatePostWithdrawals';
        if (is_array ($params) && array_key_exists ('payment_method_id', $params)) {
            $method .= 'PaymentMethod';
        } else if (is_array ($params) && array_key_exists ('coinbase_account_id', $params)) {
            $method .= 'CoinbaseAccount';
        } else {
            $method .= 'Crypto';
            $request['crypto_address'] = $address;
        }
        $response = $this->$method (array_merge ($request, $params));
        if (!$response)
            throw new ExchangeError ($this->id . ' withdraw() error => ' . $this->json ($response));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($method == 'GET') {
            if ($query)
                $request .= '?' . $this->urlencode ($query);
        }
        $url = $this->urls['api'] . $request;
        if ($api == 'private') {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $payload = '';
            if ($method != 'GET') {
                if ($query) {
                    $body = $this->json ($query);
                    $payload = $body;
                }
            }
            // $payload = ($body) ? $body : '';
            $what = $nonce . $method . $request . $payload;
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($this->encode ($what), $secret, 'sha256', 'base64');
            $headers = array (
                'CB-ACCESS-KEY' => $this->apiKey,
                'CB-ACCESS-SIGN' => $this->decode ($signature),
                'CB-ACCESS-TIMESTAMP' => $nonce,
                'CB-ACCESS-PASSPHRASE' => $this->password,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code == 400) {
            if ($body[0] == "{") {
                $response = json_decode ($body, $as_associative_array = true);
                $message = $response['message'];
                if (mb_strpos ($message, 'price too small') !== false) {
                    throw new InvalidOrder ($this->id . ' ' . $message);
                } else if (mb_strpos ($message, 'price too precise') !== false) {
                    throw new InvalidOrder ($this->id . ' ' . $message);
                } else if ($message == 'Invalid API Key') {
                    throw new AuthenticationError ($this->id . ' ' . $message);
                }
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
            throw new ExchangeError ($this->id . ' ' . $body);
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('message', $response)) {
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}
