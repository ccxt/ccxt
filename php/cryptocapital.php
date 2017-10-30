<?php

namespace ccxt;

include_once ('base/Exchange.php');

class cryptocapital extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'cryptocapital',
            'name' => 'Crypto Capital',
            'comment' => 'Crypto Capital API',
            'countries' => 'PA', // Panama
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1d' => '1year',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
                'www' => 'https://cryptocapital.co',
                'doc' => 'https://github.com/cryptocap',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'stats',
                        'historical-prices',
                        'order-book',
                        'transactions',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balances-and-info',
                        'open-orders',
                        'user-transactions',
                        'btc-deposit-address/get',
                        'btc-deposit-address/new',
                        'deposits/get',
                        'withdrawals/get',
                        'orders/new',
                        'orders/edit',
                        'orders/cancel',
                        'orders/status',
                        'withdrawals/new',
                    ),
                ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostBalancesAndInfo ();
        $balance = $response['balances-and-info'];
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            $account['free'] = $this->safe_float($balance['available'], $currency, 0.0);
            $account['used'] = $this->safe_float($balance['on_hold'], $currency, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetOrderBook (array_merge (array (
            'currency' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($response['order-book'], null, 'bid', 'ask', 'price', 'order_amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetStats (array_merge (array (
            'currency' => $this->market_id($symbol),
        ), $params));
        $ticker = $response['stats'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['max']),
            'low' => floatval ($ticker['min']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => floatval ($ticker['daily_change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['total_btc_traded']),
        );
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        return [
            $this->parse8601 ($ohlcv['date'] . ' 00:00:00'),
            null,
            null,
            null,
            floatval ($ohlcv['price']),
            null,
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetHistoricalPrices (array_merge (array (
            'currency' => $market['id'],
            'timeframe' => $this->timeframes[$timeframe],
        ), $params));
        $ohlcvs = $this->omit ($response['historical-prices'], 'request_currency');
        return $this->parse_ohlcvs($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['timestamp']) * 1000;
        return array (
            'id' => $trade['id'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $trade['maker_type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTransactions (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        $trades = $this->omit ($response['transactions'], 'request_currency');
        return $this->parse_trades($trades, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'side' => $side,
            'type' => $type,
            'currency' => $this->market_id($symbol),
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limit_price'] = $price;
        $result = $this->privatePostOrdersNew (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result,
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostOrdersCancel (array ( 'id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostWithdrawalsNew (array_merge (array (
            'currency' => $currency,
            'amount' => floatval ($amount),
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'cryptocapital')
            throw new ExchangeError ($this->id . ' is an abstract base API for _1btcxe');
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $query = array_merge (array (
                'api_key' => $this->apiKey,
                'nonce' => $this->nonce (),
            ), $params);
            $request = $this->json ($query);
            $query['signature'] = $this->hmac ($this->encode ($request), $this->encode ($this->secret));
            $body = $this->json ($query);
            $headers = array ( 'Content-Type' => 'application/json' );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('errors', $response)) {
            $errors = array ();
            for ($e = 0; $e < count ($response['errors']); $e++) {
                $error = $response['errors'][$e];
                $errors[] = $error['code'] . ' => ' . $error['message'];
            }
            $errors = implode (' ', $errors);
            throw new ExchangeError ($this->id . ' ' . $errors);
        }
        return $response;
    }
}

?>