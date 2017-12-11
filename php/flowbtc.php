<?php

namespace ccxt;

include_once ('base/Exchange.php');

class flowbtc extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'flowbtc',
            'name' => 'flowBTC',
            'countries' => 'BR', // Brazil
            'version' => 'v1',
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
                'api' => 'https://api.flowbtc.com:8400/ajax',
                'www' => 'https://trader.flowbtc.com',
                'doc' => 'http://www.flowbtc.com.br/api/',
            ),
            'requiredCredentials' => array (
                'apiKey' => true,
                'secret' => true,
                'uid' => true,
            ),
            'api' => array (
                'public' => array (
                    'post' => array (
                        'GetTicker',
                        'GetTrades',
                        'GetTradesByDate',
                        'GetOrderBook',
                        'GetProductPairs',
                        'GetProducts',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'CreateAccount',
                        'GetUserInfo',
                        'SetUserInfo',
                        'GetAccountInfo',
                        'GetAccountTrades',
                        'GetDepositAddresses',
                        'Withdraw',
                        'CreateOrder',
                        'ModifyOrder',
                        'CancelOrder',
                        'CancelAllOrders',
                        'GetAccountOpenOrders',
                        'GetOrderFee',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $response = $this->publicPostGetProductPairs ();
        $markets = $response['productPairs'];
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['name'];
            $base = $market['product1Label'];
            $quote = $market['product2Label'];
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
        $balances = $response['currencies'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['name'];
            $account = array (
                'free' => $balance['balance'],
                'used' => $balance['hold'],
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
        $orderbook = $this->publicPostGetOrderBook (array_merge (array (
            'productPair' => $market['id'],
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bids', 'asks', 'px', 'qty');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicPostGetTicker (array_merge (array (
            'productPair' => $market['id'],
        ), $params));
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume24hr']),
            'quoteVolume' => floatval ($ticker['volume24hrProduct2']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['unixtime'] * 1000;
        $side = ($trade['incomingOrderSide'] == 0) ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => $trade['px'],
            'amount' => $trade['qty'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicPostGetTrades (array_merge (array (
            'ins' => $market['id'],
            'startIndex' => -1,
        ), $params));
        return $this->parse_trades($response['trades'], $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $orderType = ($type == 'market') ? 1 : 0;
        $order = array (
            'ins' => $this->market_id($symbol),
            'side' => $side,
            'orderType' => $orderType,
            'qty' => $amount,
            'px' => $price,
        );
        $response = $this->privatePostCreateOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['serverOrderId'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        if (array_key_exists ('ins', $params)) {
            return $this->privatePostCancelOrder (array_merge (array (
                'serverOrderId' => $id,
            ), $params));
        }
        throw new ExchangeError ($this->id . ' requires `ins` $symbol parameter for cancelling an order');
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $path;
        if ($api == 'public') {
            if ($params) {
                $body = $this->json ($params);
            }
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $auth = (string) $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->json (array_merge (array (
                'apiKey' => $this->apiKey,
                'apiNonce' => $nonce,
                'apiSig' => strtoupper ($signature),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('isAccepted', $response))
            if ($response['isAccepted'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

?>