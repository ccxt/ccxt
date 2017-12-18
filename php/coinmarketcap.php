<?php

namespace ccxt;

class coinmarketcap extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'coinmarketcap',
            'name' => 'CoinMarketCap',
            'rateLimit' => 10000,
            'version' => 'v1',
            'countries' => 'US',
            'hasCORS' => true,
            'hasPrivateAPI' => false,
            'hasCreateOrder' => false,
            'hasCancelOrder' => false,
            'hasFetchBalance' => false,
            'hasFetchOrderBook' => false,
            'hasFetchTrades' => false,
            'hasFetchTickers' => true,
            'hasFetchCurrencies' => true,
            'has' => array (
                'fetchCurrencies' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api' => 'https://api.coinmarketcap.com',
                'www' => 'https://coinmarketcap.com',
                'doc' => 'https://coinmarketcap.com/api',
            ),
            'requiredCredentials' => array (
                'apiKey' => false,
                'secret' => false,
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ),
                ),
            ),
            'currencyCodes' => array (
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
            ),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        throw new ExchangeError ('Fetching order books is not supported by the API of ' . $this->id);
    }

    public function fetch_markets () {
        $markets = $this->publicGetTicker (array (
            'limit' => 0,
        ));
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $currencies = $this->currencyCodes;
            for ($i = 0; $i < count ($currencies); $i++) {
                $quote = $currencies[$i];
                $quoteId = strtolower ($quote);
                $base = $market['symbol'];
                $baseId = $market['id'];
                $symbol = $base . '/' . $quote;
                $id = $baseId . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'baseId' => $baseId,
                    'quoteId' => $quoteId,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function fetch_global ($currency = 'USD') {
        $this->load_markets();
        $request = array ();
        if ($currency)
            $request['convert'] = $currency;
        return $this->publicGetGlobal ($request);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        if (is_array ($ticker) && array_key_exists ('last_updated', $ticker))
            if ($ticker['last_updated'])
                $timestamp = intval ($ticker['last_updated']) * 1000;
        $change = null;
        $changeKey = 'percent_change_24h';
        if (is_array ($ticker) && array_key_exists ($changeKey, $ticker))
            $change = floatval ($ticker[$changeKey]);
        $last = null;
        $symbol = null;
        $volume = null;
        if ($market) {
            $price = 'price_' . $market['quoteId'];
            if (is_array ($ticker) && array_key_exists ($price, $ticker))
                if ($ticker[$price])
                    $last = floatval ($ticker[$price]);
            $symbol = $market['symbol'];
            $volumeKey = '24h_volume_' . $market['quoteId'];
            if (is_array ($ticker) && array_key_exists ($volumeKey, $ticker))
                $volume = floatval ($ticker[$volumeKey]);
        }
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => null,
            'ask' => null,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => $change,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $volume,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($currency = 'USD', $params = array ()) {
        $this->load_markets();
        $request = array (
            'limit' => 10000,
        );
        if ($currency)
            $request['convert'] = $currency;
        $response = $this->publicGetTicker (array_merge ($request, $params));
        $tickers = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $id = $ticker['id'] . '/' . $currency;
            $symbol = $id;
            $market = null;
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
            $tickers[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $tickers;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array_merge (array (
            'convert' => $market['quote'],
            'id' => $market['baseId'],
        ), $params);
        $response = $this->publicGetTickerId ($request);
        $ticker = $response[0];
        return $this->parse_ticker($ticker, $market);
    }

    public function fetch_currencies ($params = array ()) {
        $currencies = $this->publicGetTicker (array_merge (array (
            'limit' => 0
        ), $params));
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $id = $currency['symbol'];
            // todo => will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            $precision = array (
                'amount' => 8, // default $precision, todo => fix "magic constants"
                'price' => 8,
            );
            $code = $this->common_currency_code($id);
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'info' => $currency,
                'name' => $currency['name'],
                'active' => true,
                'status' => 'ok',
                'fee' => null, // todo => redesign
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => pow (10, -$precision['amount']),
                        'max' => pow (10, $precision['amount']),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision['price']),
                        'max' => pow (10, $precision['price']),
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => null,
                        'max' => null,
                    ),
                ),
            );
        }
        return $result;
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('error', $response)) {
            if ($response['error']) {
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}
