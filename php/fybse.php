<?php

namespace ccxt;

include_once ('base/Exchange.php');

class fybse extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'fybse',
            'name' => 'FYB-SE',
            'countries' => 'SE', // Sweden
            'hasCORS' => false,
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api' => 'https://www.fybse.se/api/SEK',
                'www' => 'https://www.fybse.se',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'tickerdetailed',
                        'orderbook',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'test',
                        'getaccinfo',
                        'getpendingorders',
                        'getorderhistory',
                        'cancelpendingorder',
                        'placeorder',
                        'withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $balance = $this->privatePostGetaccinfo ();
        $btc = floatval ($balance['btcBal']);
        $symbol = $this->symbols[0];
        $quote = $this->markets[$symbol]['quote'];
        $lowercase = strtolower ($quote) . 'Bal';
        $fiat = floatval ($balance[$lowercase]);
        $crypto = array (
            'free' => $btc,
            'used' => 0.0,
            'total' => $btc,
        );
        $result = array ( 'BTC' => $crypto );
        $result[$quote] = array (
            'free' => $fiat,
            'used' => 0.0,
            'total' => $fiat,
        );
        $result['info'] = $balance;
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetOrderbook ($params);
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetTickerdetailed ($params);
        $timestamp = $this->milliseconds ();
        $last = null;
        $volume = null;
        if (array_key_exists ('last', $ticker))
            $last = floatval ($ticker['last']);
        if (array_key_exists ('vol', $ticker))
            $volume = floatval ($ticker['vol']);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $volume,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades ($params);
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $response = $this->privatePostPlaceorder (array_merge (array (
            'qty' => $amount,
            'price' => $price,
            'type' => strtoupper ($side[0])
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['pending_oid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCancelpendingorder (array ( 'orderNo' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $path;
        if ($api == 'public') {
            $url .= '.json';
        } else {
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'key' => $this->apiKey,
                'sig' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha1')
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private')
            if (array_key_exists ('error', $response))
                if ($response['error'])
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>