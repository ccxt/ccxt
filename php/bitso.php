<?php

namespace ccxt;

class bitso extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitso',
            'name' => 'Bitso',
            'countries' => 'MX', // Mexico
            'rateLimit' => 2000, // 30 requests per minute
            'version' => 'v3',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api' => 'https://api.bitso.com',
                'www' => 'https://bitso.com',
                'doc' => 'https://bitso.com/api_info',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ),
                    'post' => array (
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ),
                    'delete' => array (
                        'orders/{oid}',
                        'orders/all',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetAvailableBooks ();
        $result = array ();
        for ($i = 0; $i < count ($markets['payload']); $i++) {
            $market = $markets['payload'][$i];
            $id = $market['book'];
            $symbol = str_replace ('_', '/', strtoupper ($id));
            list ($base, $quote) = explode ('/', $symbol);
            $limits = array (
                'amount' => array (
                    'min' => floatval ($market['minimum_amount']),
                    'max' => floatval ($market['maximum_amount']),
                ),
                'price' => array (
                    'min' => floatval ($market['minimum_price']),
                    'max' => floatval ($market['maximum_price']),
                ),
                'cost' => array (
                    'min' => floatval ($market['minimum_value']),
                    'max' => floatval ($market['maximum_value']),
                ),
            );
            $precision = array (
                'amount' => $this->precision_from_string($market['minimum_amount']),
                'price' => $this->precision_from_string($market['minimum_price']),
            );
            $lot = $limits['amount']['min'];
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'lot' => $lot,
                'limits' => $limits,
                'precision' => $precision,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetBalance ();
        $balances = $response['payload']['balances'];
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = strtoupper ($balance['currency']);
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => floatval ($balance['locked']),
                'total' => floatval ($balance['total']),
            );
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetOrderBook (array_merge (array (
            'book' => $this->market_id($symbol),
        ), $params));
        $orderbook = $response['payload'];
        $timestamp = $this->parse8601 ($orderbook['updated_at']);
        return $this->parse_order_book($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetTicker (array_merge (array (
            'book' => $this->market_id($symbol),
        ), $params));
        $ticker = $response['payload'];
        $timestamp = $this->parse8601 ($ticker['created_at']);
        $vwap = floatval ($ticker['vwap']);
        $baseVolume = floatval ($ticker['volume']);
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => $vwap,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        $symbol = null;
        if (!$market) {
            if (is_array ($trade) && array_key_exists ('book', $trade))
                $market = $this->markets_by_id[$trade['book']];
        }
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'order' => null,
            'type' => null,
            'side' => $trade['maker_side'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'book' => $market['id'],
        ), $params));
        return $this->parse_trades($response['payload'], $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'book' => $this->market_id($symbol),
            'side' => $side,
            'type' => $type,
            'major' => $this->amount_to_precision($symbol, $amount),
        );
        if ($type === 'limit')
            $order['price'] = $this->price_to_precision($symbol, $price);
        $response = $this->privatePostOrders (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['payload']['oid'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privateDeleteOrders (array ( 'oid' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $query = '/' . $this->version . '/' . $this->implode_params($path, $params);
        $url = $this->urls['api'] . $query;
        if ($api === 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $request = implode ('', array ($nonce, $method, $query));
            if ($params) {
                $body = $this->json ($params);
                $request .= $body;
            }
            $signature = $this->hmac ($this->encode ($request), $this->encode ($this->secret));
            $auth = $this->apiKey . ':' . $nonce . ':' . $signature;
            $headers = array (
                'Authorization' => 'Bitso ' . $auth,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}
