<?php

namespace ccxt;

include_once ('base/Exchange.php');

class bitflyer extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitflyer',
            'name' => 'bitFlyer',
            'countries' => 'JP',
            'version' => 'v1',
            'rateLimit' => 500,
            'hasCORS' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api' => 'https://api.bitflyer.jp',
                'www' => 'https://bitflyer.jp',
                'doc' => 'https://bitflyer.jp/API',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'getmarkets',    // or 'markets'
                        'getboard',      // or 'board'
                        'getticker',     // or 'ticker'
                        'getexecutions', // or 'executions'
                        'gethealth',
                        'getchats',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'getpermissions',
                        'getbalance',
                        'getcollateral',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ),
                    'post' => array (
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.25 / 100,
                    'taker' => 0.25 / 100,
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['product_code'];
            $currencies = explode ('_', $id);
            $base = null;
            $quote = null;
            $symbol = $id;
            $numCurrencies = count ($currencies);
            if ($numCurrencies == 1) {
                $base = mb_substr ($symbol, 0, 3);
                $quote = mb_substr ($symbol, 3, 6);
            } else if ($numCurrencies == 2) {
                $base = $currencies[0];
                $quote = $currencies[1];
                $symbol = $base . '/' . $quote;
            } else {
                $base = $currencies[1];
                $quote = $currencies[2];
            }
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
        $response = $this->privateGetBalance ();
        $balances = array ();
        for ($b = 0; $b < count ($response); $b++) {
            $account = $response[$b];
            $currency = $account['currency_code'];
            $balances[$currency] = $account;
        }
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balances)) {
                $account['total'] = $balances[$currency]['amount'];
                $account['free'] = $balances[$currency]['available'];
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetBoard (array_merge (array (
            'product_code' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bids', 'asks', 'price', 'size');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $ticker = $this->publicGetTicker (array_merge (array (
            'product_code' => $this->market_id($symbol),
        ), $params));
        $timestamp = $this->parse8601 ($ticker['timestamp']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['best_bid']),
            'ask' => floatval ($ticker['best_ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['ltp']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume_by_product']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $side = null;
        $order = null;
        if (array_key_exists ('side', $trade))
            if ($trade['side']) {
                $side = strtolower ($trade['side']);
                $id = $side . '_child_order_acceptance_id';
                if (array_key_exists ($id, $trade))
                    $order = $trade[$id];
            }
        $timestamp = $this->parse8601 ($trade['exec_date']);
        return array (
            'id' => (string) $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['size'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetExecutions (array_merge (array (
            'product_code' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'product_code' => $this->market_id($symbol),
            'child_order_type' => strtoupper ($type),
            'side' => strtoupper ($side),
            'price' => $price,
            'size' => $amount,
        );
        $result = $this->privatePostSendchildorder (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['child_order_acceptance_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelchildorder (array_merge (array (
            'parent_order_id' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency_code' => $currency,
            'amount' => $amount,
            // 'bank_account_id' => 1234,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['message_id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->version . '/';
        if ($api == 'private')
            $request .= 'me/';
        $request .= $path;
        if ($method == 'GET') {
            if ($params)
                $request .= '?' . $this->urlencode ($params);
        }
        $url = $this->urls['api'] . $request;
        if ($api == 'private') {
            $nonce = (string) $this->nonce ();
            $body = $this->json ($params);
            $auth = implode ('', array ($nonce, $method, $request, $body));
            $headers = array (
                'ACCESS-KEY' => $this->apiKey,
                'ACCESS-TIMESTAMP' => $nonce,
                'ACCESS-SIGN' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret)),
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

?>