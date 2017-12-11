<?php

namespace ccxt;

include_once ('base/Exchange.php');

class zb extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'zb',
            'name' => 'ZB',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api' => array (
                    'public' => 'http://api.zb.com/data', // no https for public API
                    'private' => 'https://trade.zb.com/api',
                ),
                'www' => 'https://trade.zb.com/api',
                'doc' => 'https://www.zb.com/i/developer',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'markets',
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
        ));
    }

    public function get_trading_fee_from_base_quote ($base, $quote) {
        // $base => $quote
        $fees = array (
            'BTC' => array ( 'USDT' => 0.0 ),
            'BCH' => array ( 'BTC' => 0.001, 'USDT' => 0.001 ),
            'LTC' => array ( 'BTC' => 0.001, 'USDT' => 0.0 ),
            'ETH' => array ( 'BTC' => 0.001, 'USDT' => 0.0 ),
            'ETC' => array ( 'BTC' => 0.001, 'USDT' => 0.0 ),
            'BTS' => array ( 'BTC' => 0.001, 'USDT' => 0.001 ),
            'EOS' => array ( 'BTC' => 0.001, 'USDT' => 0.001 ),
            'HSR' => array ( 'BTC' => 0.001, 'USDT' => 0.001 ),
            'QTUM' => array ( 'BTC' => 0.001, 'USDT' => 0.001 ),
            'USDT' => array ( 'BTC' => 0.0 ),
        );
        if (array_key_exists ($base, $fees)) {
            $quoteFees = $fees[$base];
            if (array_key_exists ($quote, $quoteFees))
                return $quoteFees[$quote];
        }
        return null;
    }

    public function fetch_markets () {
        $markets = $this->publicGetMarkets ();
        $keys = array_keys ($markets);
        $result = array ();
        for ($i = 0; $i < count ($keys); $i++) {
            $id = $keys[$i];
            $market = $markets[$id];
            list ($baseId, $quoteId) = explode ('_', $id);
            $base = strtoupper ($this->common_currency_code($baseId));
            $quote = strtoupper ($this->common_currency_code($quoteId));
            $symbol = $base . '/' . $quote;
            $fee = $this->get_trading_fee_from_base_quote ($base, $quote);
            $precision = array (
                'amount' => $market['amountScale'],
                'price' => $market['priceScale'],
            );
            $lot = pow (10, -$precision['amount']);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'maker' => $fee,
                'taker' => $fee,
                'lot' => $lot,
                'active' => true,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $lot,
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision['price']),
                        'max' => null,
                    ),
                    'cost' => array (
                        'min' => 0,
                        'max' => null,
                    ),
                ),
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetAccountInfo ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($this->currencies);
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
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

    public function get_market_field_name () {
        return 'market';
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $marketFieldName = $this->get_market_field_name ();
        $request = array ();
        $request[$marketFieldName] = $market['id'];
        $orderbook = $this->publicGetDepth (array_merge ($request, $params));
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
        $this->load_markets();
        $market = $this->market ($symbol);
        $marketFieldName = $this->get_market_field_name ();
        $request = array ();
        $request[$marketFieldName] = $market['id'];
        $response = $this->publicGetTicker (array_merge ($request, $params));
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
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => null,
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
        $marketFieldName = $this->get_market_field_name ();
        $request = array ();
        $request[$marketFieldName] = $market['id'];
        $response = $this->publicGetTrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
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
        $this->load_markets();
        $paramString = '&$id=' . (string) $id;
        if (array_key_exists ('currency', $params))
            $paramString .= '&currency=' . $params['currency'];
        return $this->privatePostCancelOrder ($paramString);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
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
            $this->check_required_credentials();
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