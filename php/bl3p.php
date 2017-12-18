<?php

namespace ccxt;

class bl3p extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bl3p',
            'name' => 'BL3P',
            'countries' => array ( 'NL', 'EU' ), // Netherlands, EU
            'rateLimit' => 1000,
            'version' => '1',
            'comment' => 'An exchange market by BitonicNL',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api' => 'https://api.bl3p.eu',
                'www' => array (
                    'https://bl3p.eu',
                    'https://bitonic.nl',
                ),
                'doc' => array (
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR', 'maker' => 0.0025, 'taker' => 0.0025 ),
                // 'LTC/EUR' => array ( 'id' => 'LTCEUR', 'symbol' => 'LTC/EUR', 'base' => 'LTC', 'quote' => 'EUR' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGENMKTMoneyInfo ();
        $data = $response['data'];
        $balance = $data['wallets'];
        $result = array ( 'info' => $data );
        $currencies = array_keys ($this->currencies);
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $account = $this->account ();
            if (is_array ($balance) && array_key_exists ($currency, $balance)) {
                if (is_array ($balance[$currency]) && array_key_exists ('available', $balance[$currency])) {
                    $account['free'] = floatval ($balance[$currency]['available']['value']);
                }
            }
            if (is_array ($balance) && array_key_exists ($currency, $balance)) {
                if (is_array ($balance[$currency]) && array_key_exists ('balance', $balance[$currency])) {
                    $account['total'] = floatval ($balance[$currency]['balance']['value']);
                }
            }
            if ($account['total']) {
                if ($account['free']) {
                    $account['used'] = $account['total'] - $account['free'];
                }
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function parse_bid_ask ($bidask, $priceKey = 0, $amountKey = 0) {
        return [
            $bidask['price_int'] / 100000.0,
            $bidask['amount_int'] / 100000000.0,
        ];
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketOrderbook (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $orderbook = $response['data'];
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $ticker = $this->publicGetMarketTicker (array_merge (array (
            'market' => $this->market_id($symbol),
        ), $params));
        $timestamp = $ticker['timestamp'] * 1000;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume']['24h']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        return array (
            'id' => $trade['trade_id'],
            'info' => $trade,
            'timestamp' => $trade['date'],
            'datetime' => $this->iso8601 ($trade['date']),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => null,
            'price' => $trade['price_int'] / 100000.0,
            'amount' => $trade['amount_int'] / 100000000.0,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $result = $this->parse_trades($response['data']['trades'], $market, $since, $limit);
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $order = array (
            'market' => $market['id'],
            'amount_int' => $amount,
            'fee_currency' => $market['quote'],
            'type' => ($side == 'buy') ? 'bid' : 'ask',
        );
        if ($type == 'limit')
            $order['price_int'] = $price;
        $response = $this->privatePostMarketMoneyOrderAdd (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostMarketMoneyOrderCancel (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params($path, $params);
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $query));
            $secret = base64_decode ($this->secret);
            $auth = $request . "\0" . $body;
            $signature = $this->hmac ($this->encode ($auth), $secret, 'sha512', 'base64');
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Rest-Key' => $this->apiKey,
                'Rest-Sign' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

