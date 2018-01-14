<?php

namespace ccxt;

class bitcoincoid extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitcoincoid',
            'name' => 'Bitcoin.co.id',
            'countries' => 'ID', // Indonesia
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => false,
            'hasFetchOHLCV' => false,
            'hasFetchOrder' => true,
            'hasFetchOrders' => false,
            'hasFetchClosedOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchMyTrades' => false,
            'hasFetchCurrencies' => false,
            'hasWithdraw' => false,
            // new metainfo interface
            'has' => array (
                'fetchTickers' => false,
                'fetchOHLCV' => false,
                'fetchOrder' => true,
                'fetchOrders' => false,
                'fetchClosedOrders' => true,
                'fetchOpenOrders' => true,
                'fetchMyTrades' => false,
                'fetchCurrencies' => false,
                'withdraw' => false,
            ),
            'version' => '1.7', // as of 6 November 2017
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api' => array (
                    'public' => 'https://vip.bitcoin.co.id/api',
                    'private' => 'https://vip.bitcoin.co.id/tapi',
                ),
                'www' => 'https://www.bitcoin.co.id',
                'doc' => array (
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                    'https://vip.bitcoin.co.id/trade_api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'getOrder',
                        'openOrders',
                        'cancelOrder',
                        'orderHistory',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/IDR' => array ( 'id' => 'btc_idr', 'symbol' => 'BTC/IDR', 'base' => 'BTC', 'quote' => 'IDR', 'baseId' => 'btc', 'quoteId' => 'idr' ),
                'BCH/IDR' => array ( 'id' => 'bch_idr', 'symbol' => 'BCH/IDR', 'base' => 'BCH', 'quote' => 'IDR', 'baseId' => 'bch', 'quoteId' => 'idr' ),
                'BTG/IDR' => array ( 'id' => 'btg_idr', 'symbol' => 'BTG/IDR', 'base' => 'BTG', 'quote' => 'IDR', 'baseId' => 'btg', 'quoteId' => 'idr' ),
                'ETH/IDR' => array ( 'id' => 'eth_idr', 'symbol' => 'ETH/IDR', 'base' => 'ETH', 'quote' => 'IDR', 'baseId' => 'eth', 'quoteId' => 'idr' ),
                'ETC/IDR' => array ( 'id' => 'etc_idr', 'symbol' => 'ETC/IDR', 'base' => 'ETC', 'quote' => 'IDR', 'baseId' => 'etc', 'quoteId' => 'idr' ),
                'IGNIS/IDR' => array ( 'id' => 'ignis_idr', 'symbol' => 'IGNIS/IDR', 'base' => 'IGNIS', 'quote' => 'IDR', 'baseId' => 'ignis', 'quoteId' => 'idr' ),
                'LTC/IDR' => array ( 'id' => 'ltc_idr', 'symbol' => 'LTC/IDR', 'base' => 'LTC', 'quote' => 'IDR', 'baseId' => 'ltc', 'quoteId' => 'idr' ),
                'NXT/IDR' => array ( 'id' => 'nxt_idr', 'symbol' => 'NXT/IDR', 'base' => 'NXT', 'quote' => 'IDR', 'baseId' => 'nxt', 'quoteId' => 'idr' ),
                'WAVES/IDR' => array ( 'id' => 'waves_idr', 'symbol' => 'WAVES/IDR', 'base' => 'WAVES', 'quote' => 'IDR', 'baseId' => 'waves', 'quoteId' => 'idr' ),
                'XRP/IDR' => array ( 'id' => 'xrp_idr', 'symbol' => 'XRP/IDR', 'base' => 'XRP', 'quote' => 'IDR', 'baseId' => 'xrp', 'quoteId' => 'idr' ),
                'XZC/IDR' => array ( 'id' => 'xzc_idr', 'symbol' => 'XZC/IDR', 'base' => 'XZC', 'quote' => 'IDR', 'baseId' => 'xzc', 'quoteId' => 'idr' ),
                'XLM/IDR' => array ( 'id' => 'str_idr', 'symbol' => 'XLM/IDR', 'base' => 'XLM', 'quote' => 'IDR', 'baseId' => 'str', 'quoteId' => 'idr' ),
                'BTS/BTC' => array ( 'id' => 'bts_btc', 'symbol' => 'BTS/BTC', 'base' => 'BTS', 'quote' => 'BTC', 'baseId' => 'bts', 'quoteId' => 'btc' ),
                'DASH/BTC' => array ( 'id' => 'drk_btc', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC', 'baseId' => 'drk', 'quoteId' => 'btc' ),
                'DOGE/BTC' => array ( 'id' => 'doge_btc', 'symbol' => 'DOGE/BTC', 'base' => 'DOGE', 'quote' => 'BTC', 'baseId' => 'doge', 'quoteId' => 'btc' ),
                'ETH/BTC' => array ( 'id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'baseId' => 'eth', 'quoteId' => 'btc' ),
                'LTC/BTC' => array ( 'id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'baseId' => 'ltc', 'quoteId' => 'btc' ),
                'NXT/BTC' => array ( 'id' => 'nxt_btc', 'symbol' => 'NXT/BTC', 'base' => 'NXT', 'quote' => 'BTC', 'baseId' => 'nxt', 'quoteId' => 'btc' ),
                'XLM/BTC' => array ( 'id' => 'str_btc', 'symbol' => 'XLM/BTC', 'base' => 'XLM', 'quote' => 'BTC', 'baseId' => 'str', 'quoteId' => 'btc' ),
                'XEM/BTC' => array ( 'id' => 'nem_btc', 'symbol' => 'XEM/BTC', 'base' => 'XEM', 'quote' => 'BTC', 'baseId' => 'nem', 'quoteId' => 'btc' ),
                'XRP/BTC' => array ( 'id' => 'xrp_btc', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC', 'baseId' => 'xrp', 'quoteId' => 'btc' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetInfo ();
        $balance = $response['return'];
        $result = array ( 'info' => $balance );
        $codes = is_array ($this->currencies) ? array_keys ($this->currencies) : array ();
        for ($i = 0; $i < count ($codes); $i++) {
            $code = $codes[$i];
            $currency = $this->currencies[$code];
            $lowercase = $currency['id'];
            $account = $this->account ();
            $account['free'] = $this->safe_float($balance['balance'], $lowercase, 0.0);
            $account['used'] = $this->safe_float($balance['balance_hold'], $lowercase, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$code] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetPairDepth (array_merge (array (
            'pair' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'buy', 'sell');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetPairTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $ticker = $response['ticker'];
        $timestamp = floatval ($ticker['server_time']) * 1000;
        $baseVolume = 'vol_' . strtolower ($market['baseId']);
        $quoteVolume = 'vol_' . strtolower ($market['quoteId']);
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
            'baseVolume' => floatval ($ticker[$baseVolume]),
            'quoteVolume' => floatval ($ticker[$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetPairTrades (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function parse_order ($order, $market = null) {
        $side = null;
        if (is_array ($order) && array_key_exists ('type', $order))
            $side = $order['type'];
        $status = $this->safe_string($order, 'status', 'open');
        if ($status == 'filled') {
            $status = 'closed';
        } else if ($status == 'calcelled') {
            $status = 'canceled';
        }
        $symbol = null;
        $cost = null;
        $price = $this->safe_float($order, 'price');
        $amount = null;
        $remaining = null;
        $filled = null;
        if ($market) {
            $symbol = $market['symbol'];
            $quoteId = $market['quoteId'];
            $baseId = $market['baseId'];
            if (($market['quoteId'] == 'idr') && (is_array ($order) && array_key_exists ('order_rp', $order)))
                $quoteId = 'rp';
            if (($market['baseId'] == 'idr') && (is_array ($order) && array_key_exists ('remain_rp', $order)))
                $baseId = 'rp';
            $cost = $this->safe_float($order, 'order_' . $quoteId);
            if ($cost) {
                $amount = $cost / $price;
                $remainingCost = $this->safe_float($order, 'remain_' . $quoteId);
                if ($remainingCost !== null) {
                    $remaining = $remainingCost / $price;
                    $filled = $amount - $remaining;
                }
            } else {
                $amount = $this->safe_float($order, 'order_' . $baseId);
                $cost = $price * $amount;
                $remaining = $this->safe_float($order, 'remain_' . $baseId);
                $filled = $amount - $remaining;
            }
        }
        $average = null;
        if ($filled)
            $average = $cost / $filled;
        $timestamp = intval ($order['submit_time']);
        $fee = null;
        $result = array (
            'info' => $order,
            'id' => $order['order_id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => $side,
            'price' => $price,
            'cost' => $cost,
            'average' => $average,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => $fee,
        );
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrder requires a symbol');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->privatePostGetOrder (array_merge (array (
            'pair' => $market['id'],
            'order_id' => $id,
        ), $params));
        $orders = $response['return'];
        $order = $this->parse_order(array_merge (array ( 'id' => $id ), $orders['order']), $market);
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a symbol');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
        );
        $response = $this->privatePostOpenOrders (array_merge ($request, $params));
        $orders = $this->parse_orders($response['return']['orders'], $market, $since, $limit);
        return $this->filter_orders_by_symbol($orders, $symbol);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a symbol');
        $this->load_markets();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['pair'] = $market['id'];
        }
        $response = $this->privatePostOrderHistory (array_merge ($request, $params));
        $orders = $this->parse_orders($response['return']['orders'], $market, $since, $limit);
        $orders = $this->filter_by($orders, 'status', 'closed');
        if ($symbol)
            return $this->filter_orders_by_symbol($orders, $symbol);
        return $orders;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $order = array (
            'pair' => $market['id'],
            'type' => $side,
            'price' => $price,
        );
        $base = $market['baseId'];
        $order[$base] = $amount;
        $result = $this->privatePostTrade (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => (string) $result['return']['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array_merge (array (
            'order_id' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api == 'public') {
            $url .= '/' . $this->implode_params($path, $params);
        } else {
            $this->check_required_credentials();
            $body = $this->urlencode (array_merge (array (
                'method' => $path,
                'nonce' => $this->nonce (),
            ), $params));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512'),
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('error', $response))
            throw new ExchangeError ($this->id . ' ' . $response['error']);
        return $response;
    }
}
