<?php

namespace ccxt;

include_once ('hitbtc.php');

class hitbtc2 extends hitbtc {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'hitbtc2',
            'name' => 'HitBTC v2',
            'countries' => 'HK', // Hong Kong
            'rateLimit' => 1500,
            'version' => '2',
            'hasCORS' => true,
            // older metainfo interface
            'hasFetchOHLCV' => true,
            'hasFetchTickers' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => false,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchMyTrades' => true,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchOHLCV' => true,
                'fetchTickers' => true,
                'fetchOrder' => true,
                'fetchOrders' => false,
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => true,
                'fetchMyTrades' => true,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => 'M1',
                '3m' => 'M3',
                '5m' => 'M5',
                '15m' => 'M15',
                '30m' => 'M30', // default
                '1h' => 'H1',
                '4h' => 'H4',
                '1d' => 'D1',
                '1w' => 'D7',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api' => 'https://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'doc' => 'https://api.hitbtc.com',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'symbol', // Available Currency Symbols
                        'symbol/{symbol}', // Get symbol info
                        'currency', // Available Currencies
                        'currency/{currency}', // Get currency info
                        'ticker', // Ticker list for all symbols
                        'ticker/{symbol}', // Ticker for symbol
                        'trades/{symbol}', // Trades
                        'orderbook/{symbol}', // Orderbook
                        'candles/{symbol}', // Candles
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order', // List your current open orders
                        'order/{clientOrderId}', // Get a single order by clientOrderId
                        'trading/balance', // Get trading balance
                        'trading/fee/{symbol}', // Get trading fee rate
                        'history/trades', // Get historical trades
                        'history/order', // Get historical orders
                        'history/order/{id}/trades', // Get historical trades by specified order
                        'account/balance', // Get main acccount balance
                        'account/transactions', // Get account transactions
                        'account/transactions/{id}', // Get account transaction by id
                        'account/crypto/address/{currency}', // Get deposit crypro address
                    ),
                    'post' => array (
                        'order', // Create new order
                        'account/crypto/withdraw', // Withdraw crypro
                        'account/crypto/address/{currency}', // Create new deposit crypro address
                        'account/transfer', // Transfer amount to trading
                    ),
                    'put' => array (
                        'order/{clientOrderId}', // Create new order
                        'account/crypto/withdraw/{id}', // Commit withdraw crypro
                    ),
                    'delete' => array (
                        'order', // Cancel all open orders
                        'order/{clientOrderId}', // Cancel order
                        'account/crypto/withdraw/{id}', // Rollback withdraw crypro
                    ),
                    'patch' => array (
                        'order/{clientOrderId}', // Cancel Replace order
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => -0.01 / 100,
                    'taker' => 0.1 / 100,
                ),
            ),
        ));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'DRK')
            return 'DASH';
        if ($currency == 'CAT')
            return 'BitClave';
        return $currency;
    }

    public function fee_to_precision ($symbol, $fee) {
        return $this->truncate ($fee, 8);
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbol ();
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['id'];
            $base = $market['baseCurrency'];
            $quote = $market['quoteCurrency'];
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $lot = floatval ($market['quantityIncrement']);
            $step = floatval ($market['tickSize']);
            $precision = array (
                'price' => $this->precision_from_string($market['tickSize']),
                'amount' => $this->precision_from_string($market['quantityIncrement']),
            );
            $result[] = array_merge ($this->fees['trading'], array (
                'info' => $market,
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'step' => $step,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $lot,
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => $step,
                        'max' => null,
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                ),
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $type = $this->safe_string($params, 'type', 'trading');
        $method = 'privateGet' . $this->capitalize ($type) . 'Balance';
        $balances = $this->$method ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['currency'];
            $currency = $this->common_currency_code($code);
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['reserved']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['timestamp']);
        return [
            $timestamp,
            floatval ($ohlcv['open']),
            floatval ($ohlcv['max']),
            floatval ($ohlcv['min']),
            floatval ($ohlcv['close']),
            floatval ($ohlcv['volumeQuote']),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'period' => $this->timeframes[$timeframe],
        );
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->publicGetCandlesSymbol (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetOrderbookSymbol (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bid', 'ask', 'price', 'size');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['timestamp']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'bid'),
            'ask' => $this->safe_float($ticker, 'ask'),
            'vwap' => null,
            'open' => $this->safe_float($ticker, 'open'),
            'close' => $this->safe_float($ticker, 'close'),
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'volume'),
            'quoteVolume' => $this->safe_float($ticker, 'volumeQuote'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTicker ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker['symbol'];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        if (array_key_exists ('message', $ticker))
            throw new ExchangeError ($this->id . ' ' . $ticker['message']);
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['timestamp']);
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $id = $trade['symbol'];
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                $symbol = $id;
            }
        }
        $fee = null;
        if (array_key_exists ('fee', $trade)) {
            $currency = $market ? $market['quote'] : null;
            $fee = array (
                'cost' => floatval ($trade['fee']),
                'currency' => $currency,
            );
        }
        $orderId = null;
        if (array_key_exists ('clientOrderId', $trade))
            $orderId = $trade['clientOrderId'];
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'order' => $orderId,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['quantity']),
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $clientOrderId = $this->milliseconds ();
        $amount = floatval ($amount);
        $order = array (
            'clientOrderId' => (string) $clientOrderId,
            'symbol' => $market['id'],
            'side' => $side,
            'quantity' => $this->amount_to_precision($symbol, $amount),
            'type' => $type,
        );
        if ($type == 'limit') {
            $order['price'] = $this->price_to_precision($symbol, $price);
        } else {
            $order['timeInForce'] = 'FOK';
        }
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['clientOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privateDeleteOrderClientOrderId (array_merge (array (
            'clientOrderId' => $id,
        ), $params));
    }

    public function parse_order ($order, $market = null) {
        $created = null;
        if (array_key_exists ('createdAt', $order))
            $created = $this->parse8601 ($order['createdAt']);
        $updated = null;
        if (array_key_exists ('updatedAt', $order))
            $updated = $this->parse8601 ($order['updatedAt']);
        if (!$market)
            $market = $this->markets_by_id[$order['symbol']];
        $symbol = $market['symbol'];
        $amount = $this->safe_float($order, 'quantity');
        $filled = $this->safe_float($order, 'cumQuantity');
        $status = $order['status'];
        if ($status == 'new') {
            $status = 'open';
        } else if ($status == 'suspended') {
            $status = 'open';
        } else if ($status == 'partiallyFilled') {
            $status = 'open';
        } else if ($status == 'filled') {
            $status = 'closed';
        }
        $remaining = null;
        if ($amount !== null) {
            if ($filled !== null) {
                $remaining = $amount - $filled;
            }
        }
        return array (
            'id' => (string) $order['clientOrderId'],
            'timestamp' => $created,
            'datetime' => $this->iso8601 ($created),
            'created' => $created,
            'updated' => $updated,
            'status' => $status,
            'symbol' => $symbol,
            'type' => $order['type'],
            'side' => $order['side'],
            'price' => $this->safe_float($order, 'price'),
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
            'info' => $order,
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privateGetHistoryOrder (array_merge (array (
            'clientOrderId' => $id,
        ), $params));
        $numOrders = count ($response);
        if ($numOrders > 0)
            return $this->parse_order($response[0]);
        throw OrderNotFound ($this->id . ' order ' . $id . ' not found');
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = null;
        $request = array ();
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['symbol'] = $market['id'];
        }
        $response = $this->privateGetOrder (array_merge ($request, $params));
        return $this->parse_orders($response, $market);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = null;
        $request = array ();
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['symbol'] = $market['id'];
        }
        if ($limit)
            $request['limit'] = $limit;
        if ($since) {
            $request['from'] = $this->iso8601 ($since);
        }
        $response = $this->privateGetHistoryOrder (array_merge ($request, $params));
        return $this->parse_orders($response, $market);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array (
            // 'symbol' => 'BTC/USD', // optional
            // 'sort' => 'DESC', // or 'ASC'
            // 'by' => 'timestamp', // or 'id'	String	timestamp by default, or id
            // 'from':	'Datetime or Number', // ISO 8601
            // 'till':	'Datetime or Number',
            // 'limit' => 100,
            // 'offset' => 0,
        );
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['symbol'] = $market['id'];
        }
        if ($since)
            $request['from'] = $this->iso8601 ($since);
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->privateGetHistoryTrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $amount = floatval ($amount);
        $response = $this->privatePostAccountCryptoWithdraw (array_merge (array (
            'currency' => $currency,
            'amount' => (string) $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/api' . '/' . $this->version . '/';
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            $url .= $api . '/' . $this->implode_params($path, $params);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $url .= $this->implode_params($path, $params);
            if ($method == 'GET') {
                if ($query)
                    $url .= '?' . $this->urlencode ($query);
            } else {
                if ($query)
                    $body = $this->json ($query);
            }
            $payload = $this->encode ($this->apiKey . ':' . $this->secret);
            $auth = base64_encode ($payload);
            $headers = array (
                'Authorization' => "Basic " . $this->decode ($auth),
                'Content-Type' => 'application/json',
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code == 400) {
            if ($body[0] == "{") {
                $response = json_decode ($body, $as_associative_array = true);
                if (array_key_exists ('error', $response)) {
                    if (array_key_exists ('message', $response['error'])) {
                        $message = $response['error']['message'];
                        if ($message == 'Order not found') {
                            throw new OrderNotFound ($this->id . ' order not found in active orders');
                        }
                    }
                }
            }
            throw new ExchangeError ($this->id . ' ' . $body);
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>