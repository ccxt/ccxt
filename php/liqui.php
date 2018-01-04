<?php

namespace ccxt;

class liqui extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'liqui',
            'name' => 'Liqui',
            'countries' => 'UA',
            'rateLimit' => 2500,
            'version' => '3',
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchTickers' => true,
            'hasFetchMyTrades' => true,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchOrder' => true,
                'fetchOrders' => 'emulated',
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => 'emulated',
                'fetchTickers' => true,
                'fetchMyTrades' => true,
                'withdraw' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api' => array (
                    'public' => 'https://api.liqui.io/api',
                    'private' => 'https://api.liqui.io/tapi',
                ),
                'www' => 'https://liqui.io',
                'doc' => 'https://liqui.io/api',
                'fees' => 'https://liqui.io/fee',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.001,
                    'taker' => 0.0025,
                ),
                'funding' => 0.0,
            ),
        ));
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $key = 'quote';
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision($symbol, $amount * $rate));
        if ($side == 'sell') {
            $cost *= $price;
        } else {
            $key = 'base';
        }
        return array (
            'type' => $takerOrMaker,
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => $cost,
        );
    }

    public function common_currency_code ($currency) {
        if (!$this->substituteCommonCurrencyCodes)
            return $currency;
        if ($currency == 'XBT')
            return 'BTC';
        if ($currency == 'BCC')
            return 'BCH';
        if ($currency == 'DRK')
            return 'DASH';
        // they misspell DASH as dsh :/
        if ($currency == 'DSH')
            return 'DASH';
        return $currency;
    }

    public function get_base_quote_from_market_id ($id) {
        $uppercase = strtoupper ($id);
        list ($base, $quote) = explode ('_', $uppercase);
        $base = $this->common_currency_code($base);
        $quote = $this->common_currency_code($quote);
        return array ( $base, $quote );
    }

    public function fetch_markets () {
        $response = $this->publicGetInfo ();
        $markets = $response['pairs'];
        $keys = is_array ($markets) ? array_keys ($markets) : array ();
        $result = array ();
        for ($p = 0; $p < count ($keys); $p++) {
            $id = $keys[$p];
            $market = $markets[$id];
            list ($base, $quote) = $this->get_base_quote_from_market_id ($id);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => $this->safe_integer($market, 'decimal_places'),
                'price' => $this->safe_integer($market, 'decimal_places'),
            );
            $amountLimits = array (
                'min' => $this->safe_float($market, 'min_amount'),
                'max' => $this->safe_float($market, 'max_amount'),
            );
            $priceLimits = array (
                'min' => $this->safe_float($market, 'min_price'),
                'max' => $this->safe_float($market, 'max_price'),
            );
            $costLimits = array (
                'min' => $this->safe_float($market, 'min_total'),
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
                'cost' => $costLimits,
            );
            $active = ($market['hidden'] == 0);
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'active' => $active,
                'taker' => $market['fee'] / 100,
                'lot' => $amountLimits['min'],
                'precision' => $precision,
                'limits' => $limits,
                'info' => $market,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetInfo ();
        $balances = $response['return'];
        $result = array ( 'info' => $balances );
        $funds = $balances['funds'];
        $currencies = is_array ($funds) ? array_keys ($funds) : array ();
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $uppercase = strtoupper ($currency);
            $uppercase = $this->common_currency_code($uppercase);
            $total = null;
            $used = null;
            if ($balances['open_orders'] == 0) {
                $total = $funds[$currency];
                $used = 0.0;
            }
            $account = array (
                'free' => $funds[$currency],
                'used' => $used,
                'total' => $total,
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetDepthPair (array_merge (array (
            'pair' => $market['id'],
            // 'limit' => 150, // default = 150, max = 2000
        ), $params));
        $market_id_in_reponse = (is_array ($response) && array_key_exists ($market['id'], $response));
        if (!$market_id_in_reponse)
            throw new ExchangeError ($this->id . ' ' . $market['symbol'] . ' order book is empty or not available');
        $orderbook = $response[$market['id']];
        $result = $this->parse_order_book($orderbook);
        $result['bids'] = $this->sort_by($result['bids'], 0, true);
        $result['asks'] = $this->sort_by($result['asks'], 0);
        return $result;
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
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'buy'),
            'ask' => $this->safe_float($ticker, 'sell'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float($ticker, 'avg'),
            'baseVolume' => $this->safe_float($ticker, 'vol_cur'),
            'quoteVolume' => $this->safe_float($ticker, 'vol'),
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $ids = null;
        if (!$symbols) {
            // $numIds = is_array ($this->ids) ? count ($this->ids) : 0;
            // if ($numIds > 256)
            //     throw new ExchangeError ($this->id . ' fetchTickers() requires $symbols argument');
            $ids = $this->ids;
        } else {
            $ids = $this->market_ids($symbols);
        }
        $tickers = $this->publicGetTickerPair (array_merge (array (
            'pair' => implode ('-', $ids),
        ), $params));
        $result = array ();
        $keys = is_array ($tickers) ? array_keys ($tickers) : array ();
        for ($k = 0; $k < count ($keys); $k++) {
            $id = $keys[$k];
            $ticker = $tickers[$id];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $tickers = $this->fetch_tickers(array ( $symbol ), $params);
        return $tickers[$symbol];
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $trade['timestamp'] * 1000;
        $side = $trade['type'];
        if ($side == 'ask')
            $side = 'sell';
        if ($side == 'bid')
            $side = 'buy';
        $price = $this->safe_float($trade, 'price');
        if (is_array ($trade) && array_key_exists ('rate', $trade))
            $price = $this->safe_float($trade, 'rate');
        $id = $this->safe_string($trade, 'tid');
        if (is_array ($trade) && array_key_exists ('trade_id', $trade))
            $id = $this->safe_string($trade, 'trade_id');
        $order = $this->safe_string($trade, $this->get_order_id_key ());
        if (is_array ($trade) && array_key_exists ('pair', $trade)) {
            $marketId = $trade['pair'];
            $market = $this->markets_by_id[$marketId];
        }
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $amount = $trade['amount'];
        $type = 'limit'; // all trades are still limit trades
        $fee = null;
        // this is filled by fetchMyTrades() only
        // is_your_order is always false :\
        // $isYourOrder = $this->safe_value($trade, 'is_your_order');
        // $takerOrMaker = 'taker';
        // if ($isYourOrder)
        //     $takerOrMaker = 'maker';
        // $fee = $this->calculate_fee($symbol, $type, $side, $amount, $price, $takerOrMaker);
        return array (
            'id' => $id,
            'order' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'fee' => $fee,
            'info' => $trade,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
        );
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->publicGetTradesPair (array_merge ($request, $params));
        return $this->parse_trades($response[$market['id']], $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
            'type' => $side,
            'amount' => $this->amount_to_precision($symbol, $amount),
            'rate' => $this->price_to_precision($symbol, $price),
        );
        $response = $this->privatePostTrade (array_merge ($request, $params));
        $id = $this->safe_string($response['return'], $this->get_order_id_key ());
        $timestamp = $this->milliseconds ();
        $price = floatval ($price);
        $amount = floatval ($amount);
        $status = 'open';
        if ($id === null) {
            $id = $this->safe_string($response['return'], 'init_order_id');
            $status = 'closed';
        }
        $filled = $this->safe_float($response['return'], 'received', 0.0);
        $remaining = $this->safe_float($response['return'], 'remains', $amount);
        $order = array (
            'id' => $id,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $status,
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $filled,
            'amount' => $amount,
            'remaining' => $remaining,
            'filled' => $filled,
            'fee' => null,
            // 'trades' => $this->parse_trades($order['trades'], $market),
        );
        $this->orders[$id] = $order;
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function get_order_id_key () {
        return 'order_id';
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = null;
        try {
            $request = array ();
            $idKey = $this->get_order_id_key ();
            $request[$idKey] = $id;
            $response = $this->privatePostCancelOrder (array_merge ($request, $params));
            if (is_array ($this->orders) && array_key_exists ($id, $this->orders))
                $this->orders[$id]['status'] = 'canceled';
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string($this->last_json_response, 'error');
                if ($message) {
                    if (mb_strpos ($message, 'not found') !== false)
                        throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
                }
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $id = (string) $order['id'];
        $status = $order['status'];
        if ($status == 0) {
            $status = 'open';
        } else if ($status == 1) {
            $status = 'closed';
        } else if (($status == 2) || ($status == 3)) {
            $status = 'canceled';
        }
        $timestamp = intval ($order['timestamp_created']) * 1000;
        $symbol = null;
        if (!$market)
            $market = $this->markets_by_id[$order['pair']];
        if ($market)
            $symbol = $market['symbol'];
        $remaining = null;
        $amount = null;
        $price = $this->safe_float($order, 'rate');
        $filled = null;
        $cost = null;
        if (is_array ($order) && array_key_exists ('start_amount', $order)) {
            $amount = $this->safe_float($order, 'start_amount');
            $remaining = $this->safe_float($order, 'amount');
        } else {
            $remaining = $this->safe_float($order, 'amount');
            if (is_array ($this->orders) && array_key_exists ($id, $this->orders))
                $amount = $this->orders[$id]['amount'];
        }
        if ($amount !== null) {
            if ($remaining !== null) {
                $filled = $amount - $remaining;
                $cost = $price * $filled;
            }
        }
        $fee = null;
        $result = array (
            'info' => $order,
            'id' => $id,
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'type' => 'limit',
            'side' => $order['type'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'remaining' => $remaining,
            'filled' => $filled,
            'status' => $status,
            'fee' => $fee,
        );
        return $result;
    }

    public function parse_orders ($orders, $market = null, $since = null, $limit = null) {
        $ids = is_array ($orders) ? array_keys ($orders) : array ();
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $order = $orders[$id];
            $extended = array_merge ($order, array ( 'id' => $id ));
            $result[] = $this->parse_order($extended, $market);
        }
        return $this->filter_by_since_limit($result, $since, $limit);
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostOrderInfo (array_merge (array (
            'order_id' => intval ($id),
        ), $params));
        $id = (string) $id;
        $newOrder = $this->parse_order(array_merge (array ( 'id' => $id ), $response['return'][$id]));
        $oldOrder = (is_array ($this->orders) && array_key_exists ($id, $this->orders)) ? $this->orders[$id] : array ();
        $this->orders[$id] = array_merge ($oldOrder, $newOrder);
        return $this->orders[$id];
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a symbol');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ( 'pair' => $market['id'] );
        $response = $this->privatePostActiveOrders (array_merge ($request, $params));
        $openOrders = array ();
        if (is_array ($response) && array_key_exists ('return', $response))
            $openOrders = $this->parse_orders($response['return'], $market);
        for ($j = 0; $j < count ($openOrders); $j++) {
            $this->orders[$openOrders[$j]['id']] = $openOrders[$j];
        }
        $openOrdersIndexedById = $this->index_by($openOrders, 'id');
        $cachedOrderIds = is_array ($this->orders) ? array_keys ($this->orders) : array ();
        $result = array ();
        for ($k = 0; $k < count ($cachedOrderIds); $k++) {
            $id = $cachedOrderIds[$k];
            if (is_array ($openOrdersIndexedById) && array_key_exists ($id, $openOrdersIndexedById)) {
                $this->orders[$id] = array_merge ($this->orders[$id], $openOrdersIndexedById[$id]);
            } else {
                $order = $this->orders[$id];
                if ($order['status'] == 'open') {
                    $this->orders[$id] = array_merge ($order, array (
                        'status' => 'closed',
                        'cost' => $order['amount'] * $order['price'],
                        'filled' => $order['amount'],
                        'remaining' => 0.0,
                    ));
                }
            }
            $order = $this->orders[$id];
            if ($order['symbol'] == $symbol)
                $result[] = $order;
        }
        return $this->filter_by_since_limit($result, $since, $limit);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $since, $limit, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'open')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $since, $limit, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'closed')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = null;
        $request = array (
            // 'from' => 123456789, // trade ID, from which the display starts numerical 0
            // 'count' => 1000, // the number of $trades for display numerical, default = 1000
            // 'from_id' => trade ID, from which the display starts numerical 0
            // 'end_id' => trade ID on which the display ends numerical ∞
            // 'order' => 'ASC', // sorting, default = DESC
            // 'since' => 1234567890, // UTC start time, default = 0
            // 'end' => 1234567890, // UTC end time, default = ∞
            // 'pair' => 'eth_btc', // default = all markets
        );
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['pair'] = $market['id'];
        }
        if ($limit)
            $request['count'] = intval ($limit);
        if ($since)
            $request['since'] = intval ($since / 1000);
        $response = $this->privatePostTradeHistory (array_merge ($request, $params));
        $trades = array ();
        if (is_array ($response) && array_key_exists ('return', $response))
            $trades = $response['return'];
        return $this->parse_trades($trades, $market, $since, $limit);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostWithdrawCoin (array_merge (array (
            'coinName' => $currency,
            'amount' => floatval ($amount),
            'address' => $address,
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['return']['tId'],
        );
    }

    public function sign_body_with_secret ($body) {
        return $this->hmac ($this->encode ($body), $this->encode ($this->secret), 'sha512');
    }

    public function get_version_string () {
        return '/' . $this->version;
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'private') {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $body = $this->urlencode (array_merge (array (
                'nonce' => $nonce,
                'method' => $path,
            ), $query));
            $signature = $this->sign_body_with_secret ($body);
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Key' => $this->apiKey,
                'Sign' => $signature,
            );
        } else {
            $url .= $this->get_version_string() . '/' . $this->implode_params($path, $params);
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('success', $response)) {
            if (!$response['success']) {
                if (mb_strpos ($response['error'], 'Not enougth') !== false) { // not enougTh is a typo inside Liqui's own API...
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                } else if ($response['error'] == 'Requests too often') {
                    throw new DDoSProtection ($this->id . ' ' . $this->json ($response));
                } else if (($response['error'] == 'not available') || ($response['error'] == 'external service unavailable')) {
                    throw new DDoSProtection ($this->id . ' ' . $this->json ($response));
                } else {
                    throw new ExchangeError ($this->id . ' ' . $this->json ($response));
                }
            }
        }
        return $response;
    }
}
