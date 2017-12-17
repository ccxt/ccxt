<?php

namespace ccxt;

class bithumb extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bithumb',
            'name' => 'Bithumb',
            'countries' => 'KR', // South Korea
            'rateLimit' => 500,
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api' => array (
                    'public' => 'https://api.bithumb.com/public',
                    'private' => 'https://api.bithumb.com',
                ),
                'www' => 'https://www.bithumb.com',
                'doc' => 'https://www.bithumb.com/u1/US127',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker/{currency}',
                        'ticker/all',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'recent_transactions/{currency}',
                        'recent_transactions/all',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'trade/place',
                        'info/order_detail',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.15 / 100,
                    'taker' => 0.15 / 100,
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetTickerAll ();
        $currencies = array_keys ($markets['data']);
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $id = $currencies[$i];
            if ($id != 'date') {
                $market = $markets['data'][$id];
                $base = $id;
                $quote = 'KRW';
                $symbol = $id . '/' . $quote;
                $result[] = array_merge ($this->fees['trading'], array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'info' => $market,
                    'lot' => null,
                    'active' => true,
                    'precision' => array (
                        'amount' => null,
                        'price' => null,
                    ),
                    'limits' => array (
                        'amount' => array (
                            'min' => null,
                            'max' => null,
                        ),
                        'price' => array (
                            'min' => null,
                            'max' => null,
                        ),
                        'cost' => array (
                            'min' => null,
                            'max' => null,
                        ),
                    ),
                ));
            }
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostInfoBalance (array_merge (array (
            'currency' => 'ALL',
        ), $params));
        $result = array ( 'info' => $response );
        $balances = $response['data'];
        $currencies = array_keys ($this->currencies);
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $account = $this->account ();
            $lowercase = strtolower ($currency);
            $account['total'] = $this->safe_float($balances, 'total_' . $lowercase);
            $account['used'] = $this->safe_float($balances, 'in_use_' . $lowercase);
            $account['free'] = $this->safe_float($balances, 'available_' . $lowercase);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetOrderbookCurrency (array_merge (array (
            'count' => 50, // max = 50
            'currency' => $market['base'],
        ), $params));
        $orderbook = $response['data'];
        $timestamp = intval ($orderbook['timestamp']);
        return $this->parse_order_book($orderbook, $timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = intval ($ticker['date']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'max_price'),
            'low' => $this->safe_float($ticker, 'min_price'),
            'bid' => $this->safe_float($ticker, 'buy_price'),
            'ask' => $this->safe_float($ticker, 'sell_price'),
            'vwap' => null,
            'open' => $this->safe_float($ticker, 'opening_price'),
            'close' => $this->safe_float($ticker, 'closing_price'),
            'first' => null,
            'last' => $this->safe_float($ticker, 'last_trade'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float($ticker, 'average_price'),
            'baseVolume' => $this->safe_float($ticker, 'volume_1day'),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $response = $this->publicGetTickerAll ($params);
        $result = array ();
        $timestamp = $response['data']['date'];
        $tickers = $this->omit ($response['data'], 'date');
        $ids = array_keys ($tickers);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $symbol = $id;
            $market = null;
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
            $ticker = $tickers[$id];
            $ticker['date'] = $timestamp;
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTickerCurrency (array_merge (array (
            'currency' => $market['base'],
        ), $params));
        return $this->parse_ticker($response['data'], $market);
    }

    public function parse_trade ($trade, $market) {
        // a workaround for their bug in date format, hours are not 0-padded
        list ($transaction_date, $transaction_time) = explode (' ', $trade['transaction_date']);
        $transaction_time_short = strlen ($transaction_time) < 8;
        if ($transaction_time_short)
            $transaction_time = '0' . $transaction_time;
        $timestamp = $this->parse8601 ($transaction_date . ' ' . $transaction_time);
        $side = ($trade['type'] == 'ask') ? 'sell' : 'buy';
        return array (
            'id' => null,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'order' => null,
            'type' => null,
            'side' => $side,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['units_traded']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetRecentTransactionsCurrency (array_merge (array (
            'currency' => $market['base'],
            'count' => 100, // max = 100
        ), $params));
        return $this->parse_trades($response['data'], $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported ($this->id . ' private API not implemented yet');
        //     $prefix = '';
        //     if ($type == 'market')
        //         $prefix = 'market_';
        //     $order = array (
        //         'pair' => $this->market_id($symbol),
        //         'quantity' => $amount,
        //         'price' => $price || 0,
        //         'type' => $prefix . $side,
        //     );
        //     $response = $this->privatePostOrderCreate (array_merge ($order, $params));
        //     return array (
        //         'info' => $response,
        //         'id' => (string) $response['order_id'],
        //     );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $side = (is_array ($params) && array_key_exists ('side', $params));
        if (!$side)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $side parameter (sell or buy)');
        $side = ($side == 'buy') ? 'purchase' : 'sales';
        $currency = (is_array ($params) && array_key_exists ('currency', $params));
        if (!$currency)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $currency parameter');
        return $this->privatePostTradeCancel (array (
            'order_id' => $id,
            'type' => $params['side'],
            'currency' => $params['currency'],
        ));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $endpoint = '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'][$api] . $endpoint;
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            $body = $this->urlencode (array_merge (array (
                'endpoint' => $endpoint,
            ), $query));
            $nonce = (string) $this->nonce ();
            $auth = $endpoint . "\0" . $body . "\0" . $nonce;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha512');
            $headers = array (
                'Api-Key' => $this->apiKey,
                'Api-Sign' => $this->decode (base64_encode ($this->encode ($signature))),
                'Api-Nonce' => $nonce,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('status', $response)) {
            if ($response['status'] == '0000')
                return $response;
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

