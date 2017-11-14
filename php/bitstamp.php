<?php

namespace ccxt;

include_once ('base/Exchange.php');

class bitstamp extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitstamp',
            'name' => 'Bitstamp',
            'countries' => 'GB',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api' => 'https://www.bitstamp.net/api',
                'www' => 'https://www.bitstamp.net',
                'doc' => 'https://www.bitstamp.net/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balance/',
                        'balance/{pair}/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ),
                ),
                'v1' => array (
                    'post' => array (
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btcusd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'BTC/EUR' => array ( 'id' => 'btceur', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'EUR/USD' => array ( 'id' => 'eurusd', 'symbol' => 'EUR/USD', 'base' => 'EUR', 'quote' => 'USD', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'XRP/USD' => array ( 'id' => 'xrpusd', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'XRP/EUR' => array ( 'id' => 'xrpeur', 'symbol' => 'XRP/EUR', 'base' => 'XRP', 'quote' => 'EUR', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'XRP/BTC' => array ( 'id' => 'xrpbtc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'LTC/USD' => array ( 'id' => 'ltcusd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'LTC/EUR' => array ( 'id' => 'ltceur', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'LTC/BTC' => array ( 'id' => 'ltcbtc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'ETH/USD' => array ( 'id' => 'ethusd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'ETH/EUR' => array ( 'id' => 'etheur', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR', 'maker' => 0.0025, 'taker' => 0.0025 ),
                'ETH/BTC' => array ( 'id' => 'ethbtc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'maker' => 0.0025, 'taker' => 0.0025 ),
            ),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderBookPair (array_merge (array (
            'pair' => $this->market_id($symbol),
        ), $params));
        $timestamp = intval ($orderbook['timestamp']) * 1000;
        return $this->parse_order_book($orderbook, $timestamp);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerPair (array_merge (array (
            'pair' => $this->market_id($symbol),
        ), $params));
        $timestamp = intval ($ticker['timestamp']) * 1000;
        $vwap = floatval ($ticker['vwap']);
        $baseVolume = floatval ($ticker['volume']);
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => $vwap,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        if (array_key_exists ('date', $trade)) {
            $timestamp = intval ($trade['date']) * 1000;
        } else if (array_key_exists ('datetime', $trade)) {
            // $timestamp = $this->parse8601 ($trade['datetime']);
            $timestamp = intval ($trade['datetime']) * 1000;
        }
        $side = ($trade['type'] == 0) ? 'buy' : 'sell';
        $order = null;
        if (array_key_exists ('order_id', $trade))
            $order = (string) $trade['order_id'];
        if (array_key_exists ('currency_pair', $trade)) {
            if (array_key_exists ($trade['currency_pair'], $this->markets_by_id))
                $market = $this->markets_by_id[$trade['currency_pair']];
        }
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactionsPair (array_merge (array (
            'pair' => $market['id'],
            'time' => 'minute',
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostBalance ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $total = $lowercase . '_balance';
            $free = $lowercase . '_available';
            $used = $lowercase . '_reserved';
            $account = $this->account ();
            if (array_key_exists ($free, $balance))
                $account['free'] = floatval ($balance[$free]);
            if (array_key_exists ($used, $balance))
                $account['used'] = floatval ($balance[$used]);
            if (array_key_exists ($total, $balance))
                $account['total'] = floatval ($balance[$total]);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'pair' => $this->market_id($symbol),
            'amount' => $amount,
        );
        if ($type == 'market')
            $method .= 'Market';
        else
            $order['price'] = $price;
        $method .= 'Pair';
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function parse_order_status ($order) {
        if (($order['status'] == 'Queue') || ($order['status'] == 'Open'))
            return 'open';
        if ($order['status'] == 'Finished')
            return 'closed';
        return $order['status'];
    }

    public function fetch_order_status ($id, $symbol = null) {
        $this->load_markets();
        $response = $this->privatePostOrderStatus (array ( 'id' => $id ));
        return $this->parse_order_status($response);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = null;
        if ($symbol)
            $market = $this->market ($symbol);
        $pair = $market ? $market['id'] : 'all';
        $request = array_merge (array ( 'pair' => $pair ), $params);
        $response = $this->privatePostOpenOrdersPair ($request);
        return $this->parse_trades($response, $market);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostOrderStatus (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/';
        if ($api != 'v1')
            $url .= $this->version . '/';
        $url .= $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->encode ($this->hmac ($this->encode ($auth), $this->encode ($this->secret)));
            $query = array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query);
            $body = $this->urlencode ($query);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('status', $response))
            if ($response['status'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>