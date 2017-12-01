<?php

namespace ccxt;

include_once ('liqui.php');

class wex extends liqui {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'wex',
            'name' => 'WEX',
            'countries' => 'NZ', // New Zealand
            'version' => '3',
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
                'api' => array (
                    'public' => 'https://wex.nz/api',
                    'private' => 'https://wex.nz/tapi',
                ),
                'www' => 'https://wex.nz',
                'doc' => array (
                    'https://wex.nz/api/3/docs',
                    'https://wex.nz/tapi/docs',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.2 / 100,
                    'taker' => 0.2 / 100,
                ),
            ),
        ));
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'sell'),
            'ask' => $this->safe_float($ticker, 'buy'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float($ticker, 'avg'),
            'baseVolume' => $this->safe_float($ticker, 'vol_cur'),
            'quoteVolume' => $this->safe_float($ticker, 'vol'),
            'info' => $ticker,
        );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code == 200) {
            if ($body[0] != '{') {
                // $response is not JSON
                throw new ExchangeError ($this->id . ' returned a non-JSON reply => ' . $body);
            }
            $response = json_decode ($body, $as_associative_array = true);
            $success = $this->safe_value($response, 'success');
            if (!$success) {
                $error = $this->safe_value($response, 'error');
                if (!$error) {
                    throw new ExchangeError ($this->id . ' returned a malformed $error => ' . $body);
                } else if ($error == 'bad status') {
                    throw new OrderNotFound ($this->id . ' ' . $error);
                } else if (mb_strpos ($error, 'It is not enough') !== false) {
                    throw new InsufficientFunds ($this->id . ' ' . $error);
                } else if ($error == 'Requests too often') {
                    throw new DDoSProtection ($this->id . ' ' . $error);
                } else if ($error == 'not available') {
                    throw new DDoSProtection ($this->id . ' ' . $error);
                } else if ($error == 'external service unavailable') {
                    throw new DDoSProtection ($this->id . ' ' . $error);
                // that's what fetchOpenOrders return if no open orders (fix for #489)
                } else if ($error != 'no orders') {
                    throw new ExchangeError ($this->id . ' ' . $error);
                }
            }
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        return $this->fetch2 ($path, $api, $method, $params, $headers, $body);
    }
}

?>