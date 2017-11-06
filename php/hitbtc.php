<?php

namespace ccxt;

include_once ('base/Exchange.php');

class hitbtc extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'hitbtc',
            'name' => 'HitBTC',
            'countries' => 'HK', // Hong Kong
            'rateLimit' => 1500,
            'version' => '1',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOrder' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api' => 'http://api.hitbtc.com',
                'www' => 'https://hitbtc.com',
                'doc' => array (
                    'https://hitbtc.com/api',
                    'http://hitbtc-com.github.io/hitbtc-api',
                    'http://jsfiddle.net/bmknight/RqbYB',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time,'
                    ),
                ),
                'trading' => array (
                    'get' => array (
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ),
                    'post' => array (
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ),
                ),
                'payment' => array (
                    'get' => array (
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ),
                    'post' => array (
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ),
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
        $markets = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($markets['symbols']); $p++) {
            $market = $markets['symbols'][$p];
            $id = $market['symbol'];
            $base = $market['commodity'];
            $quote = $market['currency'];
            $lot = floatval ($market['lot']);
            $step = floatval ($market['step']);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'lot' => $lot,
                'step' => $step,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $method = $this->safe_string($params, 'type', 'trading');
        $method .= 'GetBalance';
        $query = $this->omit ($params, 'type');
        $response = $this->$method ($query);
        $balances = $response['balance'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['currency_code'];
            $currency = $this->common_currency_code($code);
            $free = $this->safe_float($balance, 'cash', 0.0);
            $free = $this->safe_float($balance, 'balance', $free);
            $used = $this->safe_float($balance, 'reserved', 0.0);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $this->sum ($free, $used),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetSymbolOrderbook (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook);
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
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'bid'),
            'ask' => $this->safe_float($ticker, 'ask'),
            'vwap' => null,
            'open' => $this->safe_float($ticker, 'open'),
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'volume'),
            'quoteVolume' => $this->safe_float($ticker, 'volume_quote'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTicker ($params);
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
        $ticker = $this->publicGetSymbolTicker (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        if (array_key_exists ('message', $ticker))
            throw new ExchangeError ($this->id . ' ' . $ticker['message']);
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        return array (
            'info' => $trade,
            'id' => $trade[0],
            'timestamp' => $trade[3],
            'datetime' => $this->iso8601 ($trade[3]),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade[4],
            'price' => floatval ($trade[1]),
            'amount' => floatval ($trade[2]),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetSymbolTrades (array_merge (array (
            'symbol' => $market['id'],
            // 'from' => 0,
            // 'till' => 100,
            // 'by' => 'ts', // or by trade_id
            // 'sort' => 'desc', // or asc
            // 'start_index' => 0,
            // 'max_results' => 1000,
            // 'format_item' => 'object',
            // 'format_price' => 'number',
            // 'format_amount' => 'number',
            // 'format_tid' => 'string',
            // 'format_timestamp' => 'millisecond',
            // 'format_wrap' => false,
            'side' => 'true',
        ), $params));
        return $this->parse_trades($response['trades'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        // check if $amount can be evenly divided into lots
        // they want integer $quantity in lot units
        $quantity = floatval ($amount) / $market['lot'];
        $wholeLots = (int) round ($quantity);
        $difference = $quantity - $wholeLots;
        if (abs ($difference) > $market['step'])
            throw new ExchangeError ($this->id . ' $order $amount should be evenly divisible by lot unit size of ' . (string) $market['lot']);
        $clientOrderId = $this->milliseconds ();
        $order = array (
            'clientOrderId' => (string) $clientOrderId,
            'symbol' => $market['id'],
            'side' => $side,
            'quantity' => (string) $wholeLots, // $quantity in integer lot units
            'type' => $type,
        );
        if ($type == 'limit') {
            $order['price'] = sprintf ('%10f', $price);
        } else {
            $order['timeInForce'] = 'FOK';
        }
        $response = $this->tradingPostNewOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['ExecutionReport']['clientOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->tradingPostCancelOrder (array_merge (array (
            'clientOrderId' => $id,
        ), $params));
    }

    public function get_order_status ($status) {
        $statuses = array (
            'new' => 'open',
            'partiallyFilled' => 'partial',
            'filled' => 'closed',
            'canceled' => 'canceled',
            'rejected' => 'rejected',
            'expired' => 'expired',
        );
        return $this->safe_string($statuses, $status);
    }

    public function parse_order ($order, $market = null) {
        $timestamp = intval ($order['lastTimestamp']);
        $symbol = null;
        if (!$market)
            $market = $this->markets_by_id[$order['symbol']];
        $status = $this->safe_string($order, 'orderStatus');
        if ($status)
            $status = $this->get_order_status ($status);
        $averagePrice = $this->safe_float($order, 'avgPrice', 0.0);
        $price = $this->safe_float($order, 'orderPrice');
        $amount = $this->safe_float($order, 'orderQuantity');
        $remaining = $this->safe_float($order, 'quantityLeaves');
        $filled = null;
        $cost = null;
        if ($market) {
            $symbol = $market['symbol'];
            $amount *= $market['lot'];
            $remaining *= $market['lot'];
        }
        if ($amount && $remaining) {
            $filled = $amount - $remaining;
            $cost = $averagePrice * $filled;
        }
        return array (
            'id' => (string) $order['clientOrderId'],
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
        $response = $this->tradingGetOrder (array_merge (array (
            'client_order_id' => $id,
        ), $params));
        return $this->parse_order($response['orders'][0]);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $statuses = array ( 'new', 'partiallyFiiled' );
        $market = $this->market ($symbol);
        $request = array (
            'sort' => 'desc',
            'statuses' => implode (',', $statuses),
        );
        if ($market)
            $request['symbols'] = $market['id'];
        $response = $this->tradingGetOrdersActive (array_merge ($request, $params));
        return $this->parse_orders($response['orders'], $market);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $statuses = array ( 'filled', 'canceled', 'rejected', 'expired' );
        $request = array (
            'sort' => 'desc',
            'statuses' => implode (',', $statuses),
            'max_results' => 1000,
        );
        if ($market)
            $request['symbols'] = $market['id'];
        $response = $this->tradingGetOrdersRecent (array_merge ($request, $params));
        return $this->parse_orders($response['orders'], $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->paymentPostPayout (array_merge (array (
            'currency_code' => $currency,
            'amount' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['transaction'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . 'api' . '/' . $this->version . '/' . $api . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $payload = array ( 'nonce' => $nonce, 'apikey' => $this->apiKey );
            $query = array_merge ($payload, $query);
            if ($method == 'GET')
                $url .= '?' . $this->urlencode ($query);
            else
                $url .= '?' . $this->urlencode ($payload);
            $auth = $url;
            if ($method == 'POST') {
                if ($query) {
                    $body = $this->urlencode ($query);
                    $auth .= $body;
                }
            }
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'X-Signature' => strtolower ($this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512')),
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('code', $response)) {
            if (array_key_exists ('ExecutionReport', $response)) {
                if ($response['ExecutionReport']['orderRejectReason'] == 'orderExceedsLimit')
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
            }
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

?>