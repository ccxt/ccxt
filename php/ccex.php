<?php

namespace ccxt;

include_once ('base/Exchange.php');

class ccex extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'ccex',
            'name' => 'C-CEX',
            'countries' => array ( 'DE', 'EU' ),
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
                'api' => array (
                    'tickers' => 'https://c-cex.com/t',
                    'public' => 'https://c-cex.com/t/api_pub.html',
                    'private' => 'https://c-cex.com/t/api.html',
                ),
                'www' => 'https://c-cex.com',
                'doc' => 'https://c-cex.com/?id=api',
            ),
            'api' => array (
                'tickers' => array (
                    'get' => array (
                        'coinnames',
                        '{market}',
                        'pairs',
                        'prices',
                        'volume_{coin}',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'balancedistribution',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'orderbook',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'buylimit',
                        'cancel',
                        'getbalance',
                        'getbalances',
                        'getopenorders',
                        'getorder',
                        'getorderhistory',
                        'mytrades',
                        'selllimit',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.2 / 100,
                    'maker' => 0.2 / 100,
                ),
            ),
        ));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'IOT')
            return 'IoTcoin';
        if ($currency == 'BLC')
            return 'Cryptobullcoin';
        if ($currency == 'XID')
            return 'InternationalDiamond';
        return $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $result = array ();
        for ($p = 0; $p < count ($markets['result']); $p++) {
            $market = $markets['result'][$p];
            $id = $market['MarketName'];
            $base = $market['MarketCurrency'];
            $quote = $market['BaseCurrency'];
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $code = $balance['Currency'];
            $currency = $this->common_currency_code($code);
            $account = array (
                'free' => $balance['Available'],
                'used' => $balance['Pending'],
                'total' => $balance['Balance'],
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id($symbol),
            'type' => 'both',
            'depth' => 100,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
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
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['buy']),
            'ask' => floatval ($ticker['sell']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['lastprice']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['avg']),
            'baseVolume' => null,
            'quoteVolume' => $this->safe_float($ticker, 'buysupport'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->tickersGetPrices ($params);
        $result = array ( 'info' => $tickers );
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $ticker = $tickers[$id];
            $uppercase = strtoupper ($id);
            $market = null;
            $symbol = null;
            if (array_key_exists ($uppercase, $this->markets_by_id)) {
                $market = $this->markets_by_id[$uppercase];
                $symbol = $market['symbol'];
            } else {
                list ($base, $quote) = explode ('-', $uppercase);
                $base = $this->common_currency_code($base);
                $quote = $this->common_currency_code($quote);
                $symbol = $base . '/' . $quote;
            }
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->tickersGetMarket (array_merge (array (
            'market' => strtolower ($market['id']),
        ), $params));
        $ticker = $response['ticker'];
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['TimeStamp']);
        return array (
            'id' => $trade['Id'],
            'info' => $trade,
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => strtolower ($trade['OrderType']),
            'price' => $trade['Price'],
            'amount' => $trade['Quantity'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarkethistory (array_merge (array (
            'market' => $market['id'],
            'type' => 'both',
            'depth' => 100,
        ), $params));
        return $this->parse_trades($response['result'], $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $method = 'privateGet' . $this->capitalize ($side) . $type;
        $response = $this->$method (array_merge (array (
            'market' => $this->market_id($symbol),
            'quantity' => $amount,
            'rate' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privateGetCancel (array ( 'uuid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'private') {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $query = $this->keysort (array_merge (array (
                'a' => $path,
                'apikey' => $this->apiKey,
                'nonce' => $nonce,
            ), $params));
            $url .= '?' . $this->urlencode ($query);
            $headers = array ( 'apisign' => $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512') );
        } else if ($api == 'public') {
            $url .= '?' . $this->urlencode (array_merge (array (
                'a' => 'get' . $path,
            ), $params));
        } else {
            $url .= '/' . $this->implode_params($path, $params) . '.json';
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'tickers')
            return $response;
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

?>