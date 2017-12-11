<?php

namespace ccxt;

include_once ('base/Exchange.php');

class binance extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'binance',
            'name' => 'Binance',
            'countries' => 'CN', // China
            'rateLimit' => 500,
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchMyTrades' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchTickers' => true,
                'fetchOHLCV' => true,
                'fetchMyTrades' => true,
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchOpenOrders' => true,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => '1m',
                '3m' => '3m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '2h' => '2h',
                '4h' => '4h',
                '6h' => '6h',
                '8h' => '8h',
                '12h' => '12h',
                '1d' => '1d',
                '3d' => '3d',
                '1w' => '1w',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api' => array (
                    'web' => 'https://www.binance.com',
                    'wapi' => 'https://api.binance.com/wapi/v3',
                    'public' => 'https://api.binance.com/api/v1',
                    'private' => 'https://api.binance.com/api/v3',
                ),
                'www' => 'https://www.binance.com',
                'doc' => 'https://www.binance.com/restapipub.html',
                'fees' => array (
                    'https://binance.zendesk.com/hc/en-us/articles/115000429332',
                    'https://support.binance.com/hc/en-us/articles/115000583311',
                ),
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'exchange/public/product',
                    ),
                ),
                'wapi' => array (
                    'post' => array (
                        'withdraw',
                    ),
                    'get' => array (
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'exchangeInfo',
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ),
                    'post' => array (
                        'order',
                        'order/test',
                        'userDataStream',
                    ),
                    'put' => array (
                        'userDataStream'
                    ),
                    'delete' => array (
                        'order',
                        'userDataStream',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'tierBased' => false,
                    'percentage' => true,
                    'taker' => 0.001,
                    'maker' => 0.001,
                ),
                'funding' => array (
                    'tierBased' => false,
                    'percentage' => false,
                    'withdraw' => array (
                        'BNB' => 1.0,
                        'BTC' => 0.0005,
                        'ETH' => 0.005,
                        'LTC' => 0.001,
                        'NEO' => 0.0,
                        'QTUM' => 0.01,
                        'SNT' => 50.0,
                        'BNT' => 0.6,
                        'EOS' => 2.0,
                        'BCH' => 0.0005,
                        'GAS' => 0.0,
                        'USDT' => 5.0,
                        'OAX' => 2.0,
                        'DNT' => 30.0,
                        'MCO' => 0.15,
                        'ICN' => 0.5,
                        'WTC' => 0.2,
                        'OMG' => 0.1,
                        'ZRX' => 5.0,
                        'STRAT' => 0.1,
                        'SNGLS' => 8.0,
                        'BQX' => 2.0,
                        'KNC' => 1.0,
                        'FUN' => 50.0,
                        'SNM' => 10.0,
                        'LINK' => 5.0,
                        'XVG' => 0.1,
                        'CTR' => 1.0,
                        'SALT' => 0.3,
                        'IOTA' => 0.0,
                        'MDA' => 0.5,
                        'MTL' => 0.15,
                        'SUB' => 10.0,
                        'ETC' => 0.01,
                        'MTH' => 10.0,
                        'ENG' => 2.0,
                        'AST' => 4.0,
                        'BTG' => null,
                        'DASH' => 0.002,
                        'EVX' => 1.0,
                        'REQ' => 30.0,
                        'LRC' => 7.0,
                        'VIB' => 7.0,
                        'HSR' => 0.0001,
                        'TRX' => 500.0,
                        'POWR' => 15.0,
                        'ARK' => 0.1,
                        'YOYO' => 30.0,
                        'XRP' => 0.15,
                        'MOD' => 1.0,
                        'ENJ' => 1.0,
                        'STORJ' => 2.0,
                    ),
                    'deposit' => array (
                        'BNB' => 0,
                        'BTC' => 0,
                        'ETH' => 0,
                        'LTC' => 0,
                        'NEO' => 0,
                        'QTUM' => 0,
                        'SNT' => 0,
                        'BNT' => 0,
                        'EOS' => 0,
                        'BCH' => 0,
                        'GAS' => 0,
                        'USDT' => 0,
                        'OAX' => 0,
                        'DNT' => 0,
                        'MCO' => 0,
                        'ICN' => 0,
                        'WTC' => 0,
                        'OMG' => 0,
                        'ZRX' => 0,
                        'STRAT' => 0,
                        'SNGLS' => 0,
                        'BQX' => 0,
                        'KNC' => 0,
                        'FUN' => 0,
                        'SNM' => 0,
                        'LINK' => 0,
                        'XVG' => 0,
                        'CTR' => 0,
                        'SALT' => 0,
                        'IOTA' => 0,
                        'MDA' => 0,
                        'MTL' => 0,
                        'SUB' => 0,
                        'ETC' => 0,
                        'MTH' => 0,
                        'ENG' => 0,
                        'AST' => 0,
                        'BTG' => 0,
                        'DASH' => 0,
                        'EVX' => 0,
                        'REQ' => 0,
                        'LRC' => 0,
                        'VIB' => 0,
                        'HSR' => 0,
                        'TRX' => 0,
                        'POWR' => 0,
                        'ARK' => 0,
                        'YOYO' => 0,
                        'XRP' => 0,
                        'MOD' => 0,
                        'ENJ' => 0,
                        'STORJ' => 0,
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $response = $this->publicGetExchangeInfo ();
        $markets = $response['symbols'];
        $result = array ();
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['symbol'];
            $base = $this->common_currency_code($market['baseAsset']);
            $quote = $this->common_currency_code($market['quoteAsset']);
            $symbol = $base . '/' . $quote;
            $filters = $this->index_by($market['filters'], 'filterType');
            $precision = array (
                'amount' => $market['baseAssetPrecision'],
                'price' => $market['quotePrecision'],
            );
            $active = ($market['status'] == 'TRADING');
            $lot = -1 * log10 ($precision['amount']);
            $entry = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'lot' => $lot,
                'active' => $active,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $lot,
                        'max' => null,
                    ),
                    'price' => array (
                        'min' => -1 * log10 ($precision['price']),
                        'max' => null,
                    ),
                    'cost' => array (
                        'min' => $lot,
                        'max' => null,
                    ),
                ),
            ));
            if (is_array ($filters) && array_key_exists ('PRICE_FILTER', $filters)) {
                $filter = $filters['PRICE_FILTER'];
                $entry['precision']['price'] = $this->precision_from_string($filter['tickSize']);
                $entry['limits']['price'] = array (
                    'min' => floatval ($filter['minPrice']),
                    'max' => floatval ($filter['maxPrice']),
                );
            }
            if (is_array ($filters) && array_key_exists ('LOT_SIZE', $filters)) {
                $filter = $filters['LOT_SIZE'];
                $entry['precision']['amount'] = $this->precision_from_string($filter['stepSize']);
                $entry['lot'] = floatval ($filter['stepSize']);
                $entry['limits']['amount'] = array (
                    'min' => floatval ($filter['minQty']),
                    'max' => floatval ($filter['maxQty']),
                );
            }
            if (is_array ($filters) && array_key_exists ('MIN_NOTIONAL', $filters)) {
                $entry['limits']['cost']['min'] = floatval ($filters['MIN_NOTIONAL']['minNotional']);
            }
            $result[] = $entry;
        }
        return $result;
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
            'cost' => floatval ($this->fee_to_precision($symbol, $cost)),
        );
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privateGetAccount ($params);
        $result = array ( 'info' => $response );
        $balances = $response['balances'];
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $asset = $balance['asset'];
            $currency = $this->common_currency_code($asset);
            $account = array (
                'free' => floatval ($balance['free']),
                'used' => floatval ($balance['locked']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'symbol' => $market['id'],
            'limit' => 100, // default = maximum = 100
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function parse_ticker ($ticker, $market) {
        $timestamp = $this->safe_integer($ticker, 'closeTime');
        if ($timestamp === null)
            $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'highPrice'),
            'low' => $this->safe_float($ticker, 'lowPrice'),
            'bid' => $this->safe_float($ticker, 'bidPrice'),
            'ask' => $this->safe_float($ticker, 'askPrice'),
            'vwap' => $this->safe_float($ticker, 'weightedAvgPrice'),
            'open' => $this->safe_float($ticker, 'openPrice'),
            'close' => $this->safe_float($ticker, 'prevClosePrice'),
            'first' => null,
            'last' => $this->safe_float($ticker, 'lastPrice'),
            'change' => $this->safe_float($ticker, 'priceChangePercent'),
            'percentage' => null,
            'average' => null,
            'baseVolume' => $this->safe_float($ticker, 'volume'),
            'quoteVolume' => $this->safe_float($ticker, 'quoteVolume'),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTicker24hr (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($response, $market);
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTickerAllBookTickers ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker['symbol'];
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
                $result[$symbol] = $this->parse_ticker($ticker, $market);
            }
        }
        return $result;
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[5]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'interval' => $this->timeframes[$timeframe],
        );
        $request['limit'] = ($limit) ? $limit : 500; // default == max == 500
        if ($since)
            $request['startTime'] = $since;
        $response = $this->publicGetKlines (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestampField = (is_array ($trade) && array_key_exists ('T', $trade)) ? 'T' : 'time';
        $timestamp = $trade[$timestampField];
        $priceField = (is_array ($trade) && array_key_exists ('p', $trade)) ? 'p' : 'price';
        $price = floatval ($trade[$priceField]);
        $amountField = (is_array ($trade) && array_key_exists ('q', $trade)) ? 'q' : 'qty';
        $amount = floatval ($trade[$amountField]);
        $idField = (is_array ($trade) && array_key_exists ('a', $trade)) ? 'a' : 'id';
        $id = (string) $trade[$idField];
        $side = null;
        $order = null;
        if (is_array ($trade) && array_key_exists ('orderId', $trade))
            $order = (string) $trade['orderId'];
        if (is_array ($trade) && array_key_exists ('m', $trade)) {
            $side = $trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else {
            $side = ($trade['isBuyer']) ? 'buy' : 'sell'; // this is a true $side
        }
        $fee = null;
        if (is_array ($trade) && array_key_exists ('commission', $trade)) {
            $fee = array (
                'cost' => floatval ($trade['commission']),
                'currency' => $this->common_currency_code($trade['commissionAsset']),
            );
        }
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => $id,
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
        );
        if ($since)
            $request['startTime'] = $since;
        if ($limit)
            $request['limit'] = $limit;
        // 'fromId' => 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime' => 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime' => 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit' => 500,     // default = maximum = 500
        $response = $this->publicGetAggTrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function parse_order_status ($status) {
        if ($status == 'NEW')
            return 'open';
        if ($status == 'PARTIALLY_FILLED')
            return 'partial';
        if ($status == 'FILLED')
            return 'closed';
        if ($status == 'CANCELED')
            return 'canceled';
        return strtolower ($status);
    }

    public function parse_order ($order, $market = null) {
        $status = $this->parse_order_status($order['status']);
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $id = $order['symbol'];
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
        }
        $timestamp = $order['time'];
        $price = floatval ($order['price']);
        $amount = floatval ($order['origQty']);
        $filled = $this->safe_float($order, 'executedQty', 0.0);
        $remaining = max ($amount - $filled, 0.0);
        $result = array (
            'info' => $order,
            'id' => (string) $order['orderId'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => strtolower ($order['type']),
            'side' => strtolower ($order['side']),
            'price' => $price,
            'amount' => $amount,
            'cost' => $price * $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $order = array (
            'symbol' => $market['id'],
            'quantity' => $this->amount_to_precision($symbol, $amount),
            'type' => strtoupper ($type),
            'side' => strtoupper ($side),
        );
        if ($type == 'limit') {
            $order = array_merge ($order, array (
                'price' => $this->price_to_precision($symbol, $price),
                'timeInForce' => 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            ));
        }
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['orderId'],
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrder requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->privateGetOrder (array_merge (array (
            'symbol' => $market['id'],
            'orderId' => intval ($id),
        ), $params));
        return $this->parse_order($response, $market);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
        );
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->privateGetAllOrders (array_merge ($request, $params));
        return $this->parse_orders($response, $market, $since, $limit);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->privateGetOpenOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_orders($response, $market, $since, $limit);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = null;
        try {
            $response = $this->privateDeleteOrder (array_merge (array (
                'symbol' => $market['id'],
                'orderId' => intval ($id),
                // 'origClientOrderId' => $id,
            ), $params));
        } catch (Exception $e) {
            if (mb_strpos ($this->last_http_response, 'UNKNOWN_ORDER') !== false)
                throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            throw $e;
        }
        return $response;
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchMyTrades requires a symbol');
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
        );
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->privateGetMyTrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function common_currency_code ($currency) {
        if ($currency == 'BCC')
            return 'BCH';
        return $currency;
    }

    public function currency_id ($currency) {
        if ($currency == 'BCH')
            return 'BCC';
        return $currency;
    }

    public function fetch_deposit_address ($currency, $params = array ()) {
        $response = $this->wapiGetDepositAddress (array_merge (array (
            'asset' => $this->currency_id ($currency),
            'recvWindow' => 10000000,
        ), $params));
        if (is_array ($response) && array_key_exists ('success', $response)) {
            if ($response['success']) {
                $address = $this->safe_string($response, 'address');
                return array (
                    'currency' => $currency,
                    'address' => $address,
                    'status' => 'ok',
                    'info' => $response,
                );
            }
        }
        throw new ExchangeError ($this->id . ' fetchDepositAddress failed => ' . $this->last_http_response);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $response = $this->wapiPostWithdraw (array_merge (array (
            'asset' => $this->currency_id ($currency),
            'address' => $address,
            'amount' => floatval ($amount),
            'recvWindow' => 10000000,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        $url .= '/' . $path;
        if ($api == 'wapi')
            $url .= '.html';
        if (($api == 'private') || ($api == 'wapi')) {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $query = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $signature = $this->hmac ($this->encode ($query), $this->encode ($this->secret));
            $query .= '&' . 'signature=' . $signature;
            $headers = array (
                'X-MBX-APIKEY' => $this->apiKey,
            );
            if (($method == 'GET') || ($api == 'wapi')) {
                $url .= '?' . $query;
            } else {
                $body = $query;
                $headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code >= 400) {
            if (mb_strpos ($body, 'MIN_NOTIONAL') !== false)
                throw new InvalidOrder ($this->id . ' order cost = amount * price should be > 0.001 BTC ' . $body);
            if (mb_strpos ($body, 'LOT_SIZE') !== false)
                throw new InvalidOrder ($this->id . ' order amount should be evenly divisible by lot size, use $this->amount_to_lots(symbol, amount) ' . $body);
            if (mb_strpos ($body, 'PRICE_FILTER') !== false)
                throw new InvalidOrder ($this->id . ' order price exceeds allowed price precision or invalid, use $this->price_to_precision(symbol, amount) ' . $body);
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('code', $response)) {
            if ($response['code'] < 0) {
                if ($response['code'] == -2010)
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                if ($response['code'] == -2011)
                    throw new OrderNotFound ($this->id . ' ' . $this->json ($response));
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}

?>