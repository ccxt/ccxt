<?php

namespace ccxt;

include_once ('base/Exchange.php');

class mercado extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'mercado',
            'name' => 'Mercado Bitcoin',
            'countries' => 'BR', // Brazil
            'rateLimit' => 1000,
            'version' => 'v3',
            'hasCORS' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api' => array (
                    'public' => 'https://www.mercadobitcoin.net/api',
                    'private' => 'https://www.mercadobitcoin.net/tapi',
                ),
                'www' => 'https://www.mercadobitcoin.com.br',
                'doc' => array (
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{coin}/orderbook/', // last slash critical
                        '{coin}/ticker/',
                        '{coin}/trades/',
                        '{coin}/trades/{from}/',
                        '{coin}/trades/{from}/{to}',
                        '{coin}/day-summary/{year}/{month}/{day}/',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'withdraw_coin',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/BRL' => array ( 'id' => 'BRLBTC', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'suffix' => 'Bitcoin' ),
                'LTC/BRL' => array ( 'id' => 'BRLLTC', 'symbol' => 'LTC/BRL', 'base' => 'LTC', 'quote' => 'BRL', 'suffix' => 'Litecoin' ),
                'BCH/BRL' => array ( 'id' => 'BRLBCH', 'symbol' => 'BCH/BRL', 'base' => 'BCH', 'quote' => 'BRL', 'suffix' => 'BCash' ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.3 / 100,
                    'taker' => 0.7 / 100,
                ),
            ),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetCoinOrderbook (array_merge (array (
            'coin' => $market['base'],
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetCoinTicker (array_merge (array (
            'coin' => $market['base'],
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = intval ($ticker['date']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['vol']),
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
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetCoinTrades (array_merge (array (
            'coin' => $market['base'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['response_data']['balance'];
        $result = array ( 'info' => $response );
        $currencies = array_keys ($this->currencies);
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            if (array_key_exists ($lowercase, $balances)) {
                $account['free'] = floatval ($balances[$lowercase]['available']);
                $account['total'] = floatval ($balances[$lowercase]['total']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $method = 'privatePostPlace' . $this->capitalize ($side) . 'Order';
        $order = array (
            'coin_pair' => $this->market_id($symbol),
            'quantity' => $amount,
            'limit_price' => $price,
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['response_data']['order']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder() requires a $symbol argument');
        $market = $this->market ($symbol);
        return $this->privatePostCancelOrder (array_merge (array (
            'coin_pair' => $market['id'],
            'order_id' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $request = array (
            'coin' => $currency,
            'quantity' => sprintf ('%10f', $amount),
            'address' => $address,
        );
        if ($currency == 'BRL') {
            $account_ref = (array_key_exists ('account_ref', $params));
            if (!$account_ref)
                throw new ExchangeError ($this->id . ' requires $account_ref parameter to withdraw ' . $currency);
        } else if ($currency != 'LTC') {
            $tx_fee = (array_key_exists ('tx_fee', $params));
            if (!$tx_fee)
                throw new ExchangeError ($this->id . ' requires $tx_fee parameter to withdraw ' . $currency);
        }
        $response = $this->privatePostWithdrawCoin (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => $response['response_data']['withdrawal']['id'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/';
        if ($api == 'public') {
            $url .= $this->implode_params($path, $params);
        } else {
            $this->check_required_credentials();
            $url .= $this->version . '/';
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'tapi_method' => $path,
                'tapi_nonce' => $nonce,
            ), $params));
            $auth = '/tapi/' . $this->version . '/' . '?' . $body;
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'TAPI-ID' => $this->apiKey,
                'TAPI-MAC' => $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error_message', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>