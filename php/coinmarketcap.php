<?php

namespace ccxt;

include_once ('base/Exchange.php');

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
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api' => 'https://api.coinmarketcap.com',
                'www' => 'https://coinmarketcap.com',
                'doc' => 'https://coinmarketcap.com/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker/',
                        'ticker/array (id)/',
                        'global/',
                    ),
                ),
            ),
            'currencies' => array (
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
        $markets = $this->publicGetTicker ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            for ($c = 0; $c < count ($this->currencies); $c++) {
                $base = $market['symbol'];
                $baseId = $market['id'];
                $quote = $this->currencies[$c];
                $quoteId = strtolower ($quote);
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
        if (array_key_exists ('last_updated', $ticker))
            if ($ticker['last_updated'])
                $timestamp = intval ($ticker['last_updated']) * 1000;
        $volume = null;
        $volumeKey = '24h_volume_' . $market['quoteId'];
        if (array_key_exists ($volumeKey, $ticker))
            $volume = floatval ($ticker[$volumeKey]);
        $price = 'price_' . $market['quoteId'];
        $change = null;
        $changeKey = 'percent_change_24h';
        if (array_key_exists ($changeKey, $ticker))
            $change = floatval ($ticker[$changeKey]);
        $last = null;
        if (array_key_exists ($price, $ticker))
            if ($ticker[$price])
                $last = floatval ($ticker[$price]);
        $symbol = $market['symbol'];
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
        $request = array ();
        if ($currency)
            $request['convert'] = $currency;
        $response = $this->publicGetTicker (array_merge ($request, $params));
        $tickers = array ();
        for ($t = 0; $t < count ($response); $t++) {
            $ticker = $response[$t];
            $id = $ticker['id'] . '/' . $currency;
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
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

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($query)
            $url .= '?' . $this->urlencode ($query);
        return array ('url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers);
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        return $response;
    }
}

?>