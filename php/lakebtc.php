<?php

namespace ccxt;

include_once ('base/Exchange.php');

class lakebtc extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'lakebtc',
            'name' => 'LakeBTC',
            'countries' => 'US',
            'version' => 'api_v2',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
                'api' => 'https://api.lakebtc.com',
                'www' => 'https://www.lakebtc.com',
                'doc' => array (
                    'https://www.lakebtc.com/s/api_v2',
                    'https://www.lakebtc.com/s/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'bcorderbook',
                        'bctrades',
                        'ticker',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'buyOrder',
                        'cancelOrders',
                        'getAccountInfo',
                        'getExternalAccounts',
                        'getOrders',
                        'getTrades',
                        'openOrders',
                        'sellOrder',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTicker ();
        $result = array ();
        $keys = array_keys ($markets);
        for ($k = 0; $k < count ($keys); $k++) {
            $id = $keys[$k];
            $market = $markets[$id];
            $base = mb_substr ($id, 0, 3);
            $quote = mb_substr ($id, 3, 6);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['balance'];
        $result = array ( 'info' => $response );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $balance = floatval ($balances[$currency]);
            $account = array (
                'free' => $balance,
                'used' => 0.0,
                'total' => $balance,
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetBcorderbook (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetTicker (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $ticker = $tickers[$market['id']];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'bid'),
            'ask' => $this->safe_float($ticker, 'ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'volume'),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetBctrades (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $method = 'privatePost' . $this->capitalize ($side) . 'Order';
        $marketId = $this->market_id($market);
        $order = array (
            'params' => array ( $price, $amount, $marketId ),
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array ( 'params' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version;
        if ($api == 'public') {
            $url .= '/' . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            if ($params)
                $params = implode (',', $params);
            else
                $params = '';
            $query = $this->urlencode (array (
                'tonce' => $nonce,
                'accesskey' => $this->apiKey,
                'requestmethod' => strtolower ($method),
                'id' => $nonce,
                'method' => $path,
                'params' => $params,
            ));
            $body = $this->json (array (
                'method' => $path,
                'params' => $params,
                'id' => $nonce,
            ));
            $signature = $this->hmac ($this->encode ($query), $this->encode ($this->secret), 'sha1', 'base64');
            $headers = array (
                'Json-Rpc-Tonce' => $nonce,
                'Authorization' => "Basic " . $this->apiKey . ':' . $this->decode ($signature),
                'Content-Type' => 'application/json',
            );
        }
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