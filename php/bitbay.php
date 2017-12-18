<?php

namespace ccxt;

class bitbay extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitbay',
            'name' => 'BitBay',
            'countries' => array ( 'PL', 'EU' ), // Poland
            'rateLimit' => 1000,
            'hasCORS' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www' => 'https://bitbay.net',
                'api' => array (
                    'public' => 'https://bitbay.net/API/Public',
                    'private' => 'https://bitbay.net/API/Trading/tradingApi.php',
                ),
                'doc' => array (
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'BTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/PLN' => array ( 'id' => 'BTCPLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'LTC/USD' => array ( 'id' => 'LTCUSD', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'LTC/EUR' => array ( 'id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
                'LTC/PLN' => array ( 'id' => 'LTCPLN', 'symbol' => 'LTC/PLN', 'base' => 'LTC', 'quote' => 'PLN' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'ETHUSD', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETH/EUR' => array ( 'id' => 'ETHEUR', 'symbol' => 'ETH/EUR', 'base' => 'ETH', 'quote' => 'EUR' ),
                'ETH/PLN' => array ( 'id' => 'ETHPLN', 'symbol' => 'ETH/PLN', 'base' => 'ETH', 'quote' => 'PLN' ),
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'LSK/USD' => array ( 'id' => 'LSKUSD', 'symbol' => 'LSK/USD', 'base' => 'LSK', 'quote' => 'USD' ),
                'LSK/EUR' => array ( 'id' => 'LSKEUR', 'symbol' => 'LSK/EUR', 'base' => 'LSK', 'quote' => 'EUR' ),
                'LSK/PLN' => array ( 'id' => 'LSKPLN', 'symbol' => 'LSK/PLN', 'base' => 'LSK', 'quote' => 'PLN' ),
                'LSK/BTC' => array ( 'id' => 'LSKBTC', 'symbol' => 'LSK/BTC', 'base' => 'LSK', 'quote' => 'BTC' ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.3 / 100,
                    'taker' => 0.0043,
                ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostInfo ();
        if (is_array ($response) && array_key_exists ('balances', $response)) {
            $balance = $response['balances'];
            $result = array ( 'info' => $balance );
            $currencies = array_keys ($this->currencies);
            for ($i = 0; $i < count ($currencies); $i++) {
                $currency = $currencies[$i];
                $account = $this->account ();
                if (is_array ($balance) && array_key_exists ($currency, $balance)) {
                    $account['free'] = floatval ($balance[$currency]['available']);
                    $account['used'] = floatval ($balance[$currency]['locked']);
                    $account['total'] = $this->sum ($account['free'], $account['used']);
                }
                $result[$currency] = $account;
            }
            return $this->parse_balance($result);
        }
        throw new ExchangeError ($this->id . ' empty $balance $response ' . $this->json ($response));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetIdOrderbook (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetIdTicker (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $timestamp = $this->milliseconds ();
        $baseVolume = $this->safe_float($ticker, 'volume');
        $vwap = $this->safe_float($ticker, 'vwap');
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'max'),
            'low' => $this->safe_float($ticker, 'min'),
            'bid' => $this->safe_float($ticker, 'bid'),
            'ask' => $this->safe_float($ticker, 'ask'),
            'vwap' => $vwap,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float($ticker, 'average'),
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetIdTrades (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        return $this->privatePostTrade (array_merge (array (
            'type' => $side,
            'currency' => $market['base'],
            'amount' => $amount,
            'payment_currency' => $market['quote'],
            'rate' => $price,
        ), $params));
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancel (array ( 'id' => $id ));
    }

    public function is_fiat ($currency) {
        $fiatCurrencies = array (
            'USD' => true,
            'EUR' => true,
            'PLN' => true,
        );
        if (is_array ($fiatCurrencies) && array_key_exists ($currency, $fiatCurrencies))
            return true;
        return false;
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $method = null;
        $request = array (
            'currency' => $currency,
            'quantity' => $amount,
        );
        if ($this->is_fiat ($currency)) {
            $method = 'privatePostWithdraw';
            // $request['account'] = $params['account']; // they demand an account number
            // $request['express'] = $params['express']; // whatever it means, they don't explain
            // $request['bic'] = '';
        } else {
            $method = 'privatePostTransfer';
            $request['address'] = $address;
        }
        $response = $this->$method (array_merge ($request, $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params($path, $params) . '.json';
        } else {
            $this->check_required_credentials();
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'moment' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'API-Key' => $this->apiKey,
                'API-Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}
