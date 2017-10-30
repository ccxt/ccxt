<?php

namespace ccxt;

include_once ('base/Exchange.php');

class acx extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'acx',
            'name' => 'ACX',
            'countries' => 'AU',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '2h' => '120',
                '4h' => '240',
                '12h' => '720',
                '1d' => '1440',
                '3d' => '4320',
                '1w' => '10080',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg',
                'extension' => '.json',
                'api' => 'https://acx.io/api',
                'www' => 'https://acx.io',
                'doc' => 'https://acx.io/documents/api_v2',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets', // Get all available markets
                        'tickers', // Get ticker of all markets
                        'tickers/array (market)', // Get ticker of specific market
                        'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                        'order_book', // Get the order book of specified market
                        'depth', // Get depth or specified market Both asks and bids are sorted from highest price to lowest.
                        'k', // Get OHLC(k line) of specific market
                        'k_with_pending_trades', // Get K data with pending trades, which are the trades not included in K data yet, because there's delay between trade generated and processed by K data generator
                        'timestamp', // Get server current time, in seconds since Unix epoch
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'members/me', // Get your profile and accounts info
                        'deposits', // Get your deposits history
                        'deposit', // Get details of specific deposit
                        'deposit_address', // Where to deposit The address field could be empty when a new address is generating (e.g. for bitcoin), you should try again later in that case.
                        'orders', // Get your orders, results is paginated
                        'order', // Get information of specified order
                        'trades/my', // Get your executed trades Trades are sorted in reverse creation order.
                        'withdraws', // Get your cryptocurrency withdraws
                        'withdraw', // Get your cryptocurrency withdraw
                    ),
                    'post' => array (
                        'orders', // Create a Sell/Buy order
                        'orders/multi', // Create multiple sell/buy orders
                        'orders/clear', // Cancel all my orders
                        'order/delete', // Cancel an order
                        'withdraw', // Create a withdraw
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
            $id = $market['id'];
            $symbol = $market['name'];
            list ($base, $quote) = explode ('/', $symbol);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
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
        $response = $this->privateGetMembersMe ();
        $balances = $response['accounts'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $uppercase = strtoupper ($currency);
            $account = array (
                'free' => floatval ($balance['balance']),
                'used' => floatval ($balance['locked']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$uppercase] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'market' => $market['id'],
            'limit' => 300,
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        $result = $this->parse_order_book($orderbook, $timestamp);
        $result['bids'] = $this->sort_by($result['bids'], 0, true);
        $result['asks'] = $this->sort_by($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['at'] * 1000;
        $ticker = $ticker['ticker'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high', null),
            'low' => $this->safe_float($ticker, 'low', null),
            'bid' => $this->safe_float($ticker, 'buy', null),
            'ask' => $this->safe_float($ticker, 'sell', null),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last', null),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float($ticker, 'vol', null),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTickers ($params);
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = null;
            $symbol = $id;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                $base = mb_substr ($id, 0, 3);
                $quote = mb_substr ($id, 3, 6);
                $base = strtoupper ($base);
                $quote = strtoupper ($quote);
                $base = $this->common_currency_code($base);
                $quote = $this->common_currency_code($quote);
                $symbol = $base . '/' . $quote;
            }
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTickersMarket (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_ticker($response, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade['timestamp'] * 1000;
        $side = ($trade['type'] == 'bid') ? 'buy' : 'sell';
        return array (
            'info' => $trade,
            'id' => (string) $trade['tid'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        // looks like they switched this endpoint off
        // it returns 503 Service Temporarily Unavailable always
        // return $this->parse_trades($response, $market);
        return $response;
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[1],
            $ohlcv[2],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        if (!$limit)
            $limit = 500; // default is 30
        $request = array (
            'market' => $market['id'],
            'period' => $this->timeframes[$timeframe],
            'limit' => $limit,
        );
        if ($since)
            $request['timestamp'] = $since;
        $response = $this->publicGetK (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'market' => $this->market_id($symbol),
            'side' => $side,
            'volume' => (string) $amount,
            'ord_type' => $type,
        );
        if ($type == 'limit') {
            $order['price'] = (string) $price;
        }
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostOrderDelete (array ( 'id' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $result = $this->privatePostWithdraw (array_merge (array (
            'currency' => strtolower ($currency),
            'sum' => $amount,
            'address' => $address,
        ), $params));
        return array (
            'info' => $result,
            'id' => null,
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/api' . '/' . $this->version . '/' . $this->implode_params($path, $params);
        if (array_key_exists ('extension', $this->urls))
            $request .= $this->urls['extension'];
        $query = $this->omit ($params, $this->extract_params($path));
        $url = $this->urls['api'] . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $query = $this->urlencode ($this->keysort (array_merge (array (
                'access_key' => $this->apiKey,
                'tonce' => $nonce,
            ), $params)));
            $auth = $method . '|' . $request . '|' . $query;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $suffix = $query . '&$signature=' . $signature;
            if ($method == 'GET') {
                $url .= '?' . $suffix;
            } else {
                $body = $suffix;
                $headers = array ( 'Content-Type' => 'application/x-www-form-urlencoded' );
            }
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>