<?php

namespace ccxt;

include_once ('base/Exchange.php');

class bittrex extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bittrex',
            'name' => 'Bittrex',
            'countries' => 'US',
            'version' => 'v1.1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchMyTrades' => false,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchTickers' => true,
                'fetchOHLCV' => true,
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchClosedOrders' => 'emulated',
                'fetchOpenOrders' => true,
                'fetchMyTrades' => false,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => 'oneMin',
                '5m' => 'fiveMin',
                '30m' => 'thirtyMin',
                '1h' => 'hour',
                '1d' => 'day',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api' => array (
                    'public' => 'https://bittrex.com/api',
                    'account' => 'https://bittrex.com/api',
                    'market' => 'https://bittrex.com/api',
                    'v2' => 'https://bittrex.com/api/v2.0/pub',
                ),
                'www' => 'https://bittrex.com',
                'doc' => array (
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ),
                'fees' => array (
                    'https://bittrex.com/Fees',
                    'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ),
            ),
            'api' => array (
                'v2' => array (
                    'get' => array (
                        'currencies/GetBTCPrice',
                        'market/GetTicks',
                        'market/GetLatestTick',
                        'Markets/GetMarketSummaries',
                        'market/GetLatestTick',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ),
                ),
                'account' => array (
                    'get' => array (
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ),
                ),
                'market' => array (
                    'get' => array (
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.0025,
                    'taker' => 0.0025,
                ),
            ),
        ));
    }

    public function cost_to_precision ($symbol, $cost) {
        return $this->truncate (floatval ($cost), $this->markets[$symbol].precision.price);
    }

    public function fee_to_precision ($symbol, $fee) {
        return $this->truncate (floatval ($fee), $this->markets[$symbol]['precision']['price']);
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
            $precision = array (
                'amount' => 8,
                'price' => 8,
            );
            $amountLimits = array (
                'min' => $market['MinTradeSize'],
                'max' => null,
            );
            $priceLimits = array ( 'min' => null, 'max' => null );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'lot' => $amountLimits['min'],
                'precision' => $precision,
                'limits' => $limits,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->accountGetBalances ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $indexed = $this->index_by($balances, 'Currency');
        $keys = array_keys ($indexed);
        for ($i = 0; $i < count ($keys); $i++) {
            $id = $keys[$i];
            $currency = $this->common_currency_code($id);
            $account = $this->account ();
            $balance = $indexed[$id];
            $free = floatval ($balance['Available']);
            $total = floatval ($balance['Balance']);
            $used = $total - $free;
            $account['free'] = $free;
            $account['used'] = $used;
            $account['total'] = $total;
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id($symbol),
            'type' => 'both',
            'depth' => 50,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->parse8601 ($ticker['TimeStamp']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'High'),
            'low' => $this->safe_float($ticker, 'Low'),
            'bid' => $this->safe_float($ticker, 'Bid'),
            'ask' => $this->safe_float($ticker, 'Ask'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'Last'),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'Volume'),
            'quoteVolume' => $this->safe_float($ticker, 'BaseVolume'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetMarketsummaries ($params);
        $tickers = $response['result'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $id = $ticker['MarketName'];
            $market = null;
            $symbol = $id;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                list ($quote, $base) = explode ('-', $id);
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
        $response = $this->publicGetMarketsummary (array_merge (array (
            'market' => $market['id'],
        ), $params));
        $ticker = $response['result'][0];
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['TimeStamp']);
        $side = null;
        if ($trade['OrderType'] == 'BUY') {
            $side = 'buy';
        } else if ($trade['OrderType'] == 'SELL') {
            $side = 'sell';
        }
        $id = null;
        if (array_key_exists ('Id', $trade))
            $id = (string) $trade['Id'];
        return array (
            'id' => $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => 'limit',
            'side' => $side,
            'price' => $trade['Price'],
            'amount' => $trade['Quantity'],
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarkethistory (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades($response['result'], $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1d', $since = null, $limit = null) {
        $timestamp = $this->parse8601 ($ohlcv['T']);
        return [
            $timestamp,
            $ohlcv['O'],
            $ohlcv['H'],
            $ohlcv['L'],
            $ohlcv['C'],
            $ohlcv['V'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'tickInterval' => $this->timeframes[$timeframe],
            'marketName' => $market['id'],
        );
        $response = $this->v2GetMarketGetTicks (array_merge ($request, $params));
        return $this->parse_ohlcvs($response['result'], $market, $timeframe, $since, $limit);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['market'] = $market['id'];
        }
        $response = $this->marketGetOpenorders (array_merge ($request, $params));
        $orders = $this->parse_orders($response['result'], $market);
        return $this->filter_orders_by_symbol($orders, $symbol);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'marketGet' . $this->capitalize ($side) . $type;
        $order = array (
            'market' => $market['id'],
            'quantity' => $this->amount_to_precision($symbol, $amount),
        );
        if ($type == 'limit')
            $order['rate'] = $this->price_to_precision($symbol, $price);
        $response = $this->$method (array_merge ($order, $params));
        $result = array (
            'info' => $response,
            'id' => $response['result']['uuid'],
        );
        return $result;
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = null;
        try {
            $response = $this->marketGetCancel (array_merge (array (
                'uuid' => $id,
            ), $params));
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string($this->last_json_response, 'message');
                if ($message == 'ORDER_NOT_OPEN')
                    throw new InvalidOrder ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
                if ($message == 'UUID_INVALID')
                    throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $side = null;
        if (array_key_exists ('OrderType', $order))
            $side = ($order['OrderType'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        if (array_key_exists ('Type', $order))
            $side = ($order['Type'] == 'LIMIT_BUY') ? 'buy' : 'sell';
        $status = 'open';
        if ($order['Closed']) {
            $status = 'closed';
        } else if ($order['CancelInitiated']) {
            $status = 'canceled';
        }
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('Exchange', $order))
                if (array_key_exists ($order['Exchange'], $this->markets_by_id))
                    $market = $this->markets_by_id[$order['Exchange']];
        }
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = null;
        if (array_key_exists ('Opened', $order))
            $timestamp = $this->parse8601 ($order['Opened']);
        if (array_key_exists ('TimeStamp', $order))
            $timestamp = $this->parse8601 ($order['TimeStamp']);
        $fee = null;
        $commission = null;
        if (array_key_exists ('Commission', $order)) {
            $commission = 'Commission';
        } else if (array_key_exists ('CommissionPaid', $order)) {
            $commission = 'CommissionPaid';
        }
        if ($commission) {
            $fee = array (
                'cost' => floatval ($order[$commission]),
                'currency' => $market['quote'],
            );
        }
        $price = $this->safe_float($order, 'Limit');
        $cost = $this->safe_float($order, 'Price');
        $amount = $this->safe_float($order, 'Quantity');
        $remaining = $this->safe_float($order, 'QuantityRemaining', 0.0);
        $filled = $amount - $remaining;
        if (!$cost) {
            if ($price && $amount)
                $cost = $price * $amount;
        }
        if (!$price) {
            if ($cost && $filled)
                $price = $cost / $filled;
        }
        $average = $this->safe_float($order, 'PricePerUnit');
        $result = array (
            'info' => $order,
            'id' => $order['OrderUuid'],
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
        $this->load_markets();
        $response = null;
        try {
            $response = $this->accountGetOrder (array ( 'uuid' => $id ));
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string($this->last_json_response, 'message');
                if ($message == 'UUID_INVALID')
                    throw new OrderNotFound ($this->id . ' fetchOrder() error => ' . $this->last_http_response);
            }
            throw $e;
        }
        return $this->parse_order($response['result']);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['market'] = $market['id'];
        }
        $response = $this->accountGetOrderhistory (array_merge ($request, $params));
        $orders = $this->parse_orders($response['result'], $market);
        return $this->filter_orders_by_symbol($orders, $symbol);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $params);
        return $this->filter_by($orders, 'status', 'closed');
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->accountGetWithdraw (array_merge (array (
            'currency' => $currency,
            'quantity' => $amount,
            'address' => $address,
        ), $params));
        $id = null;
        if (array_key_exists ('result', $response)) {
            if (array_key_exists ('uuid', $response['result']))
                $id = $response['result']['uuid'];
        }
        return array (
            'info' => $response,
            'id' => $id,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/';
        if ($api != 'v2')
            $url .= $this->version . '/';
        if ($api == 'public') {
            $url .= $api . '/' . strtolower ($method) . $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else if ($api == 'v2') {
            $url .= $path;
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $nonce = $this->nonce ();
            $url .= $api . '/';
            if ((($api == 'account') && ($path != 'withdraw')) || ($path == 'openorders'))
                $url .= strtolower ($method);
            $url .= $path . '?' . $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'apikey' => $this->apiKey,
            ), $params));
            $signature = $this->hmac ($this->encode ($url), $this->encode ($this->secret), 'sha512');
            $headers = array ( 'apisign' => $signature );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('success', $response))
            if ($response['success'])
                return $response;
        if (array_key_exists ('message', $response))
            if ($response['message'] == "INSUFFICIENT_FUNDS")
                throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}

?>