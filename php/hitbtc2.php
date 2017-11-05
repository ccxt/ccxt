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
            'hasFetchTickers' => true,
            'hasFetchOrders' => false,
            'hasFetchOpenOrders' => false,
            'hasFetchClosedOrders' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api' => 'https://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'doc' => array (
                    'https://api.hitbtc.com/api/2/explore',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'symbol', // Available Currency Symbols
                        'symbol/array (symbol)', // Get symbol info
                        'currency', // Available Currencies
                        'currency/array (currency)', // Get currency info
                        'ticker', // Ticker list for all symbols
                        'ticker/array (symbol)', // Ticker for symbol
                        'trades/array (symbol)', // Trades
                        'orderbook/array (symbol)', // Orderbook
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order', // List your current open orders
                        'order/array (clientOrderId)', // Get a single order by clientOrderId
                        'trading/balance', // Get trading balance
                        'trading/fee/array (symbol)', // Get trading fee rate
                        'history/trades', // Get historical trades
                        'history/order', // Get historical orders
                        'history/order/array (id)/trades', // Get historical trades by specified order
                        'account/balance', // Get main acccount balance
                        'account/transactions', // Get account transactions
                        'account/transactions/array (id)', // Get account transaction by id
                        'account/crypto/address/array (currency)', // Get deposit crypro address
                    ),
                    'post' => array (
                        'order', // Create new order
                        'account/crypto/withdraw', // Withdraw crypro
                        'account/crypto/address/array (currency)', // Create new deposit crypro address
                        'account/transfer', // Transfer amount to trading
                    ),
                    'put' => array (
                        'order/array (clientOrderId)', // Create new order
                        'account/crypto/withdraw/array (id)', // Commit withdraw crypro
                    ),
                    'delete' => array (
                        'order', // Cancel all open orders
                        'order/array (clientOrderId)', // Cancel order
                        'account/crypto/withdraw/array (id)', // Rollback withdraw crypro
                    ),
                    'patch' => array (
                        'order/array (clientOrderId)', // Cancel Replace order
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0 / 100,
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

    public function fetch_markets () {
        $markets = $this->publicGetSymbol ();
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['id'];
            $base = $market['baseCurrency'];
            $quote = $market['quoteCurrency'];
            $lot = $market['quantityIncrement'];
            $step = floatval ($market['tickSize']);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'price' => 2,
                'amount' => -1 * log10($step),
            );
            $amountLimits = array ( 'min' => $lot );
            $limits = array ( 'amount' => $amountLimits );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'step' => $step,
                'info' => $market,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privateGetTradingBalance ();
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
        return array (
            'info' => $trade,
            'id' => (string) $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['quantity']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
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
            'quantity' => (string) $amount,
            'type' => $type,
        );
        if ($type == 'limit') {
            $price = floatval ($price);
            $order['price'] = sprintf ('%10f', $price);
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
        $timestamp = $this->parse8601 ($order['updatedAt']);
        if (!$market)
            $market = $this->markets_by_id[$order['symbol']];
        $symbol = $market['symbol'];
        $amount = $this->safe_float($order, 'quantity');
        $filled = $this->safe_float($order, 'cumQuantity');
        $remaining = null;
        if ($amount && $filled)
            $remaining = $amount - $filled;
        return array (
            'id' => (string) $order['clientOrderId'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
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
        $response = $this->privateGetOrder (array_merge (array (
            'client_order_id' => $id,
        ), $params));
        return $this->parse_order($response['orders'][0]);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $params = array_merge (array ('symbol' => $market['id']));
        }
        $response = $this->privateGetOrder ($params);
        return $this->parse_orders($response, $market);
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
            $url .= $this->implode_params($path, $params) . '?' . $this->urlencode ($query);
            if ($method != 'GET')
                if ($query)
                    $body = $this->json ($query);
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

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>