<?php

namespace ccxt;

include_once ('base/Exchange.php');

class btcturk extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'btcturk',
            'name' => 'BTCTurk',
            'countries' => 'TR', // Turkey
            'rateLimit' => 1000,
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'timeframes' => array (
                '1d' => '1d',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api' => 'https://www.btcturk.com/api',
                'www' => 'https://www.btcturk.com',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ohlcdata', // ?last=COUNT
                        'orderbook',
                        'ticker',
                        'trades',   // ?last=COUNT (max 50)
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'balance',
                        'openOrders',
                        'userTransactions', // ?offset=0&limit=25&sort=asc
                    ),
                    'post' => array (
                        'buy',
                        'cancelOrder',
                        'sell',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/TRY' => array ( 'id' => 'BTCTRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY', 'maker' => 0.002, 'taker' => 0.0035 ),
                'ETH/TRY' => array ( 'id' => 'ETHTRY', 'symbol' => 'ETH/TRY', 'base' => 'ETH', 'quote' => 'TRY', 'maker' => 0.002, 'taker' => 0.0035 ),
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'maker' => 0.002, 'taker' => 0.0035 ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetBalance ();
        $result = array ( 'info' => $response );
        $base = array (
            'free' => $response['bitcoin_available'],
            'used' => $response['bitcoin_reserved'],
            'total' => $response['bitcoin_balance'],
        );
        $quote = array (
            'free' => $response['money_available'],
            'used' => $response['money_reserved'],
            'total' => $response['money_balance'],
        );
        $symbol = $this->symbols[0];
        $market = $this->markets[$symbol];
        $result[$market['base']] = $base;
        $result[$market['quote']] = $quote;
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetOrderbook (array_merge (array (
            'pairSymbol' => $market['id'],
        ), $params));
        $timestamp = intval ($orderbook['timestamp'] * 1000);
        return $this->parse_order_book($orderbook, $timestamp);
    }

    public function parse_ticker ($ticker, $market = null) {
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = intval ($ticker['timestamp']) * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => floatval ($ticker['open']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['average']),
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTicker ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $symbol = $ticker['pair'];
            $market = null;
            if (array_key_exists ($symbol, $this->markets_by_id)) {
                $market = $this->markets_by_id[$symbol];
                $symbol = $market['symbol'];
            }
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $tickers = $this->fetch_tickers();
        $result = null;
        if (array_key_exists ($symbol, $tickers))
            $result = $tickers[$symbol];
        return $result;
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
            'side' => null,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        // $maxCount = 50;
        $response = $this->publicGetTrades (array_merge (array (
            'pairSymbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['Time']);
        return [
            $timestamp,
            $ohlcv['Open'],
            $ohlcv['High'],
            $ohlcv['Low'],
            $ohlcv['Close'],
            $ohlcv['Volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1d', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ();
        if ($limit)
            $request['last'] = $limit;
        $response = $this->publicGetOhlcdata (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $method = 'privatePost' . $this->capitalize ($side);
        $order = array (
            'Type' => ($side == 'buy') ? 'BuyBtc' : 'SelBtc',
            'IsMarketOrder' => ($type == 'market') ? 1 : 0,
        );
        if ($type == 'market') {
            if ($side == 'buy')
                $order['Total'] = $amount;
            else
                $order['Amount'] = $amount;
        } else {
            $order['Price'] = $price;
            $order['Amount'] = $amount;
        }
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if ($this->id == 'btctrader')
            throw new ExchangeError ($this->id . ' is an abstract base API for BTCExchange, BTCTurk');
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce ().toString;
            $body = $this->urlencode ($params);
            $secret = $this->base64ToString ($this->secret);
            $auth = $this->apiKey . $nonce;
            $headers = array (
                'X-PCK' => $this->apiKey,
                'X-Stamp' => (string) $nonce,
                'X-Signature' => $this->hmac ($this->encode ($auth), $secret, 'sha256', 'base64'),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

?>