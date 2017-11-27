<?php

namespace ccxt;

include_once ('base/Exchange.php');

class anxpro extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'anxpro',
            'name' => 'ANXPro',
            'countries' => array ( 'JP', 'SG', 'HK', 'NZ' ),
            'version' => '2',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchTrades' => false,
            'hasWithdraw' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api' => 'https://anxpro.com/api',
                'www' => 'https://anxpro.com',
                'doc' => array (
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', // disabled by ANXPro
                    ),
                ),
                'private' => array (
                    'post' => array (
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'BTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/HKD' => array ( 'id' => 'BTCHKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD' ),
                'BTC/EUR' => array ( 'id' => 'BTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/CAD' => array ( 'id' => 'BTCCAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/AUD' => array ( 'id' => 'BTCAUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'BTC/SGD' => array ( 'id' => 'BTCSGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/JPY' => array ( 'id' => 'BTCJPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
                'BTC/GBP' => array ( 'id' => 'BTCGBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP' ),
                'BTC/NZD' => array ( 'id' => 'BTCNZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD' ),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'DOGE/BTC' => array ( 'id' => 'DOGEBTC', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC' ),
                'STR/BTC' => array ( 'id' => 'STRBTC', 'symbol' => 'STR/BTC', 'base' => 'STR', 'quote' => 'BTC' ),
                'XRP/BTC' => array ( 'id' => 'XRPBTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.3 / 100,
                    'taker' => 0.6 / 100,
                ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostMoneyInfo ();
        $balance = $response['data'];
        $currencies = array_keys ($balance['Wallets']);
        $result = array ( 'info' => $balance );
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balance['Wallets'])) {
                $wallet = $balance['Wallets'][$currency];
                $account['free'] = floatval ($wallet['Available_Balance']['value']);
                $account['total'] = floatval ($wallet['Balance']['value']);
                $account['used'] = $account['total'] - $account['free'];
            }
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $response = $this->publicGetCurrencyPairMoneyDepthFull (array_merge (array (
            'currency_pair' => $this->market_id($symbol),
        ), $params));
        $orderbook = $response['data'];
        $t = intval ($orderbook['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        return $this->parse_order_book($orderbook, $timestamp, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetCurrencyPairMoneyTicker (array_merge (array (
            'currency_pair' => $this->market_id($symbol),
        ), $params));
        $ticker = $response['data'];
        $t = intval ($ticker['dataUpdateTime']);
        $timestamp = intval ($t / 1000);
        $bid = $this->safe_float($ticker['buy'], 'value');
        $ask = $this->safe_float($ticker['sell'], 'value');;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']['value']),
            'low' => floatval ($ticker['low']['value']),
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => floatval ($ticker['vwap']['value']),
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']['value']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['avg']['value']),
            'baseVolume' => floatval ($ticker['vol']['value']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        throw new ExchangeError ($this->id . ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled');
        return $this->publicGetCurrencyPairMoneyTradeFetch (array_merge (array (
            'currency_pair' => $this->market_id($symbol),
        ), $params));
    }

    public function create_order ($market, $type, $side, $amount, $price = null, $params = array ()) {
        $order = array (
            'currency_pair' => $this->market_id($market),
            'amount_int' => intval ($amount * 100000000), // 10^8
            'type' => $side,
        );
        if ($type == 'limit')
            $order['price_int'] = intval ($price * 100000); // 10^5
        $result = $this->privatePostCurrencyPairOrderAdd (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => $result['data']
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostCurrencyPairOrderCancel (array ( 'oid' => $id ));
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostMoneyCurrencySendSimple (array_merge (array (
            'currency' => $currency,
            'amount_int' => intval ($amount * 100000000), // 10^8
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['data']['transactionId'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        $url = $this->urls['api'] . '/' . $this->version . '/' . $request;
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
                'Rest-Sign' => $this->decode ($signature),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] == 'success')
                return $response;
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

?>