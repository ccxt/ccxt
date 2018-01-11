<?php

namespace ccxt;

class coinexchange extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'coinexchange',
            'name' => 'CoinExchange',
            'countries' => array ( 'IN', 'JP', 'VN', 'US' ),
            'rateLimit' => 1000,
            // obsolete metainfo interface
            'hasPrivateAPI' => false,
            'hasFetchTrades' => false,
            'hasFetchCurrencies' => true,
            'hasFetchTickers' => true,
            // new metainfo interface
            'has' => array (
                'fetchTrades' => false,
                'fetchCurrencies' => true,
                'fetchTickers' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg',
                'api' => 'https://www.coinexchange.io/api/v1',
                'www' => 'https://www.coinexchange.io',
                'doc' => 'https://coinexchangeio.github.io/slate/',
                'fees' => 'https://www.coinexchange.io/fees',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'getcurrency',
                        'getcurrencies',
                        'getmarkets',
                        'getmarketsummaries',
                        'getmarketsummary',
                        'getorderbook',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0015,
                    'taker' => 0.0015,
                ),
            ),
            'precision' => array (
                'amount' => 8,
                'price' => 8,
            ),
        ));
    }

    public function common_currency_code ($currency) {
        return $currency;
    }

    public function fetch_currencies ($params = array ()) {
        $currencies = $this->publicGetCurrencies ($params);
        $precision = $this->precision['amount'];
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $id = $currency['CurrencyID'];
            $code = $this->common_currency_code($currency['TickerCode']);
            $active = $currency['WalletStatus'] == 'online';
            $status = 'ok';
            if (!$active)
                $status = 'disabled';
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'name' => $currency['Name'],
                'active' => $active,
                'status' => $status,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => null,
                        'max' => pow (10, $precision),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision),
                        'max' => pow (10, $precision),
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => null,
                        'max' => pow (10, $precision),
                    ),
                ),
                'info' => $currency,
            );
        }
        return $result;
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['MarketID'];
            $base = $this->common_currency_code($market['MarketAssetCode']);
            $quote = $this->common_currency_code($market['BaseCurrencyCode']);
            $symbol = $base . '/' . $quote;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'active' => true,
                'lot' => null,
                'info' => $market,
            );
        }
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        if (!$market) {
            $marketId = $ticker['MarketID'];
            $market = $this->marketsById[$marketId];
        }
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = $this->milliseconds ();
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['HighPrice']),
            'low' => floatval ($ticker['LowPrice']),
            'bid' => floatval ($ticker['BidPrice']),
            'ask' => floatval ($ticker['AskPrice']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['LastPrice']),
            'change' => floatval ($ticker['Change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['Volume']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetMarketsummary (array_merge (array (
            'market_id' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetMarketsummaries ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $this->parse_ticker($tickers[$i]);
            $symbol = $ticker['symbol'];
            $result[$symbol] = $ticker;
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'market_id' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'BuyOrders', 'SellOrders', 'Price', 'Quantity');
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            $params = $this->urlencode ($params);
            if (strlen ($params))
                $url .= '?' . $params;
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        $success = $this->safe_integer($response, 'success');
        if ($success != 1) {
            throw new ExchangeError ($response['message']);
        }
        return $response['result'];
    }
}
