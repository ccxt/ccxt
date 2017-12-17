<?php

namespace ccxt;

class southxchange extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'southxchange',
            'name' => 'SouthXchange',
            'countries' => 'AR', // Argentina
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
                'api' => 'https://www.southxchange.com/api',
                'www' => 'https://www.southxchange.com',
                'doc' => 'https://www.southxchange.com/Home/Api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets',
                        'price/{symbol}',
                        'prices',
                        'book/{symbol}',
                        'trades/{symbol}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'cancelMarketOrders',
                        'cancelOrder',
                        'generatenewaddress',
                        'listOrders',
                        'listBalances',
                        'placeOrder',
                        'withdraw',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $base = $market[0];
            $quote = $market[1];
            $symbol = $base . '/' . $quote;
            $id = $symbol;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostListBalances ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['Currency'];
            $uppercase = strtoupper ($currency);
            $free = floatval ($balance['Available']);
            $used = floatval ($balance['Unconfirmed']);
            $total = $this->sum ($free, $used);
            $account = array (
                'free' => $free,
                'used' => $used,
                'total' => $total,
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'BuyOrders', 'SellOrders', 'Price', 'Amount');
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
            'high' => null,
            'low' => null,
            'bid' => $this->safe_float($ticker, 'Bid'),
            'ask' => $this->safe_float($ticker, 'Ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'Last'),
            'change' => $this->safe_float($ticker, 'Variation24Hr'),
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'Volume24Hr'),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetPrices ($params);
        $tickers = $this->index_by($response, 'Market');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $symbol = $id;
            $market = null;
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetPriceSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['At'] * 1000;
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => null,
            'order' => null,
            'type' => null,
            'side' => $trade['Type'],
            'price' => $trade['Price'],
            'amount' => $trade['Amount'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $order = array (
            'listingCurrency' => $market['base'],
            'referenceCurrency' => $market['quote'],
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['limitPrice'] = $price;
        $response = $this->privatePostPlaceOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response,
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array_merge (array (
            'orderCode' => $id,
        ), $params));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $response = $this->privatePostWithdraw (array_merge (array (
            'currency' => $currency,
            'address' => $address,
            'amount' => $amount,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'private') {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'key' => $this->apiKey,
                'nonce' => $nonce,
            ), $query);
            $body = $this->json ($query);
            $headers = array (
                'Content-Type' => 'application/json',
                'Hash' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        return $response;
    }
}

