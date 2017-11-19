<?php

namespace ccxt;

include_once ('base/Exchange.php');

class coingi extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'coingi',
            'name' => 'Coingi',
            'rateLimit' => 1000,
            'countries' => array ( 'PA', 'BG', 'CN', 'US' ), // Panama, Bulgaria, China, US
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api' => 'https://api.coingi.com',
                'www' => 'https://coingi.com',
                'doc' => 'http://docs.coingi.apiary.io/',
            ),
            'api' => array (
                'current' => array (
                    'get' => array (
                        'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                        'transactions/{pair}/{maxCount}',
                        '24hour-rolling-aggregation',
                    ),
                ),
                'user' => array (
                    'post' => array (
                        'balance',
                        'add-order',
                        'cancel-order',
                        'orders',
                        'transactions',
                        'create-crypto-withdrawal',
                    ),
                ),
            ),
            // todo add fetchMarkets
            'markets' => array (
                'LTC/BTC' => array ( 'id' => 'ltc-btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'PPC/BTC' => array ( 'id' => 'ppc-btc', 'symbol' => 'PPC/BTC', 'base' => 'PPC', 'quote' => 'BTC' ),
                'DOGE/BTC' => array ( 'id' => 'doge-btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'VTC/BTC' => array ( 'id' => 'vtc-btc', 'symbol' => 'VTC/BTC', 'base' => 'VTC', 'quote' => 'BTC' ),
                'FTC/BTC' => array ( 'id' => 'ftc-btc', 'symbol' => 'FTC/BTC', 'base' => 'FTC', 'quote' => 'BTC' ),
                'NMC/BTC' => array ( 'id' => 'nmc-btc', 'symbol' => 'NMC/BTC', 'base' => 'NMC', 'quote' => 'BTC' ),
                'DASH/BTC' => array ( 'id' => 'dash-btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.2 / 100,
                    'maker' => 0.2 / 100,
                ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $currencies = array ();
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = strtolower ($this->currencies[$c]);
            $currencies[] = $currency;
        }
        $balances = $this->userPostBalance (array (
            'currencies' => implode (',', $currencies)
        ));
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency']['name'];
            $currency = strtoupper ($currency);
            $account = array (
                'free' => $balance['available'],
                'used' => $balance['blocked'] . $balance['inOrders'] . $balance['withdrawing'],
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $orderbook = $this->currentGetOrderBookPairAskCountBidCountDepth (array_merge (array (
            'pair' => $market['id'],
            'askCount' => 512, // maximum returned number of asks 1-512
            'bidCount' => 512, // maximum returned number of bids 1-512
            'depth' => 32, // maximum number of depth range steps 1-32
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bids', 'asks', 'price', 'baseAmount');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['high'],
            'low' => $ticker['low'],
            'bid' => $ticker['highestBid'],
            'ask' => $ticker['lowestAsk'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => null,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $ticker['baseVolume'],
            'quoteVolume' => $ticker['counterVolume'],
            'info' => $ticker,
        );
        return $ticker;
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->currentGet24hourRollingAggregation ($params);
        $result = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $base = strtoupper ($ticker['currencyPair']['base']);
            $quote = strtoupper ($ticker['currencyPair']['counter']);
            $symbol = $base . '/' . $quote;
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $tickers = $this->fetch_tickers(null, $params);
        if (array_key_exists ($symbol, $tickers))
            return $tickers[$symbol];
        throw new ExchangeError ($this->id . ' return did not contain ' . $symbol);
    }

    public function parse_trade ($trade, $market = null) {
        if (!$market)
            $market = $this->markets_by_id[$trade['currencyPair']];
        return array (
            'id' => $trade['id'],
            'info' => $trade,
            'timestamp' => $trade['timestamp'],
            'datetime' => $this->iso8601 ($trade['timestamp']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null, // type
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->currentGetTransactionsPairMaxCount (array_merge (array (
            'pair' => $market['id'],
            'maxCount' => 128,
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'currencyPair' => $this->market_id($symbol),
            'volume' => $amount,
            'price' => $price,
            'orderType' => ($side == 'buy') ? 0 : 1,
        );
        $response = $this->userPostAddOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['result'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->userPostCancelOrder (array ( 'orderId' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $api . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'current') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $request = array_merge (array (
                'token' => $this->apiKey,
                'nonce' => $nonce,
            ), $query);
            $auth = (string) $nonce . '$' . $this->apiKey;
            $request['signature'] = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->json ($request);
            $headers = array (
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>