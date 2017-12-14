<?php

namespace ccxt;

include_once ('base/Exchange.php');

class btcmarkets extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'btcmarkets',
            'name' => 'BTC Markets',
            'countries' => 'AU', // Australia
            'rateLimit' => 1000, // market data cached for 1 second (trades cached for 2 seconds)
            'hasCORS' => false,
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
            'instrument' => $market['base'],
            'price' => $price * $multiplier,
            'volume' => $amount * $multiplier,
            'orderSide' => $orderSide,
            'ordertype' => $this->capitalize ($type),
            'clientRequestId' => (string) $this->nonce (),
        ));
        $response = $this->privatePostOrderCreate (array_merge ($order, $params));
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

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $uri = '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'] . $uri;
        $query = $this->omit ($params, $this->extract_params($path));
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
                $body = $this->urlencode ($query);
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

?>