<?php

namespace ccxt;

include_once ('base/Exchange.php');

class chbtc extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'chbtc',
            'name' => 'CHBTC',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api' => array (
                    'public' => 'http://api.chbtc.com/data', // no https for public API
                    'private' => 'https://trade.chbtc.com/api',
                ),
                'www' => 'https://trade.chbtc.com/api',
                'doc' => 'https://www.chbtc.com/i/developer',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY' ),
                'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY' ),
                'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY' ),
                'BTS/CNY' => array ( 'id' => 'bts_cny', 'symbol' => 'BTS/CNY', 'base' => 'BTS', 'quote' => 'CNY' ),
                // 'EOS/CNY' => array ( 'id' => 'eos_cny', 'symbol' => 'EOS/CNY', 'base' => 'EOS', 'quote' => 'CNY' ),
                'BCH/CNY' => array ( 'id' => 'bcc_cny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY' ),
                'HSR/CNY' => array ( 'id' => 'hsr_cny', 'symbol' => 'HSR/CNY', 'base' => 'HSR', 'quote' => 'CNY' ),
                'QTUM/CNY' => array ( 'id' => 'qtum_cny', 'symbol' => 'QTUM/CNY', 'base' => 'QTUM', 'quote' => 'CNY' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $account = $this->account ();
            if (array_key_exists ($currency, $balances['balance']))
                $account['free'] = floatval ($balances['balance'][$currency]['amount']);
            if (array_key_exists ($currency, $balances['frozen']))
                $account['used'] = floatval ($balances['frozen'][$currency]['amount']);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        $timestamp = $this->milliseconds ();
        $bids = null;
        $asks = null;
        if (array_key_exists ('bids', $orderbook))
            $bids = $orderbook['bids'];
        if (array_key_exists ('asks', $orderbook))
            $asks = $orderbook['asks'];
        $result = array (
            'bids' => $bids,
            'asks' => $asks,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        if ($result['bids'])
            $result['bids'] = $this->sort_by($result['bids'], 0, true);
        if ($result['asks'])
            $result['asks'] = $this->sort_by($result['asks'], 0);
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $response = $this->publicGetTicker (array_merge (array (
            'currency' => $this->market_id($symbol),
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = $this->milliseconds ();
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
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => null,
            'quoteVolume' => floatval ($ticker['vol']),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade['date'] * 1000;
        $side = ($trade['trade_type'] == 'bid') ? 'buy' : 'sell';
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

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'currency' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $paramString = '&$price=' . (string) $price;
        $paramString .= '&$amount=' . (string) $amount;
        $tradeType = ($side == 'buy') ? '1' : '0';
        $paramString .= '&$tradeType=' . $tradeType;
        $paramString .= '&currency=' . $this->market_id($symbol);
        $response = $this->privatePostOrder ($paramString);
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $paramString = '&$id=' . (string) $id;
        if (array_key_exists ('currency', $params))
            $paramString .= '&currency=' . $params['currency'];
        return $this->privatePostCancelOrder ($paramString);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $paramString = '&$id=' . (string) $id;
        if (array_key_exists ('currency', $params))
            $paramString .= '&currency=' . $params['currency'];
        return $this->privatePostGetOrder ($paramString);
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->version . '/' . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $paramsLength = count ($params); // $params should be a string here
            $nonce = $this->nonce ();
            $auth = 'method=' . $path;
            $auth .= '&accesskey=' . $this->apiKey;
            $auth .= $paramsLength ? $params : '';
            $secret = $this->hash ($this->encode ($this->secret), 'sha1');
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($secret), 'md5');
            $suffix = 'sign=' . $signature . '&reqTime=' . (string) $nonce;
            $url .= '/' . $path . '?' . $auth . '&' . $suffix;
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($api == 'private')
            if (array_key_exists ('code', $response))
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>