<?php

namespace ccxt;

include_once ('base/Exchange.php');

class bter extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bter',
            'name' => 'Bter',
            'countries' => array ( 'VG', 'CN' ), // British Virgin Islands, China
            'version' => '2',
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27980479-cfa3188c-6387-11e7-8191-93fc4184ba5c.jpg',
                'api' => array (
                    'public' => 'https://data.bter.com/api',
                    'private' => 'https://api.bter.com/api',
                ),
                'www' => 'https://bter.com',
                'doc' => 'https://bter.com/api2',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'pairs',
                        'marketinfo',
                        'marketlist',
                        'tickers',
                        'ticker/{id}',
                        'orderBook/{id}',
                        'trade/{id}',
                        'tradeHistory/{id}',
                        'tradeHistory/{id}/{tid}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'balances',
                        'depositAddress',
                        'newAddress',
                        'depositsWithdrawals',
                        'buy',
                        'sell',
                        'cancelOrder',
                        'cancelAllOrders',
                        'getOrder',
                        'openOrders',
                        'tradeHistory',
                        'withdraw',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $response = $this->publicGetMarketinfo ();
        $markets = $response['pairs'];
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $keys = array_keys ($market);
            $id = $keys[0];
            $details = $market[$id];
            list ($base, $quote) = explode ('_', $id);
            $base = strtoupper ($base);
            $quote = strtoupper ($quote);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $details['decimal_places'],
                'price' => $details['decimal_places'],
            );
            $amountLimits = array (
                'min' => $details['min_amount'],
                'max' => null,
            );
            $priceLimits = array (
                'min' => null,
                'max' => null,
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'maker' => $details['fee'] / 100,
                'taker' => $details['fee'] / 100,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balance = $this->privatePostBalances ();
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $code = $this->common_currency_code($currency);
            $account = $this->account ();
            if (array_key_exists ('available', $balance)) {
                if (array_key_exists ($currency, $balance['available'])) {
                    $account['free'] = floatval ($balance['available'][$currency]);
                }
            }
            if (array_key_exists ('locked', $balance)) {
                if (array_key_exists ($currency, $balance['locked'])) {
                    $account['used'] = floatval ($balance['locked'][$currency]);
                }
            }
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$code] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetOrderBookId (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $result = $this->parse_order_book($orderbook);
        $result['asks'] = $this->sort_by($result['asks'], 0);
        return $result;
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
            'high' => floatval ($ticker['high24hr']),
            'low' => floatval ($ticker['low24hr']),
            'bid' => floatval ($ticker['highestBid']),
            'ask' => floatval ($ticker['lowestAsk']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => floatval ($ticker['percentChange']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['quoteVolume']),
            'quoteVolume' => floatval ($ticker['baseVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTickers ($params);
        $result = array ();
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            list ($baseId, $quoteId) = explode ('_', $id);
            $base = strtoupper ($baseId);
            $quote = strtoupper ($quoteId);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $ticker = $tickers[$id];
            $market = null;
            if (array_key_exists ($symbol, $this->markets))
                $market = $this->markets[$symbol];
            if (array_key_exists ($id, $this->markets_by_id))
                $market = $this->markets_by_id[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['date']);
        return array (
            'id' => $trade['tradeID'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['rate'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $this->load_markets();
        $response = $this->publicGetTradeHistoryId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        return $this->parse_trades($response['data'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets();
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'currencyPair' => $this->market_id($symbol),
            'rate' => $price,
            'amount' => $amount,
        );
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['orderNumber'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array ( 'orderNumber' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency' => strtolower ($currency),
            'amount' => $amount,
            'address' => $address, // Address must exist in you AddressBook in security settings
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $prefix = ($api == 'private') ? ($api . '/') : '';
        $url = $this->urls['api'][$api] . $this->version . '/1/' . $prefix . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $request = array ( 'nonce' => $nonce );
            $body = $this->urlencode (array_merge ($request, $query));
            $signature = $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512');
            $headers = array (
                'Key' => $this->apiKey,
                'Sign' => $signature,
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] != 'true')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>