<?php

namespace ccxt;

include_once ('base/Exchange.php');

class kraken extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'kraken',
            'name' => 'Kraken',
            'countries' => 'US',
            'version' => '0',
            'rateLimit' => 3000,
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchMyTrades' => true,
            'hasWithdraw' => true,
            'hasFetchCurrencies' => true,
            // new metainfo interface
            'has' => array (
                'fetchCurrencies' => true,
                'fetchTickers' => true,
                'fetchOHLCV' => true,
                'fetchOrder' => true,
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => true,
                'fetchMyTrades' => true,
                'withdraw' => true,
            ),
            'marketsByAltname' => array (),
            'timeframes' => array (
                '1m' => '1',
                '5m' => '5',
                '15m' => '15',
                '30m' => '30',
                '1h' => '60',
                '4h' => '240',
                '1d' => '1440',
                '1w' => '10080',
                '2w' => '21600',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api' => 'https://api.kraken.com',
                'www' => 'https://www.kraken.com',
                'doc' => array (
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ),
                'fees' => 'https://www.kraken.com/en-us/help/fees',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'AddOrder',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ),
                ),
            ),
        ));
    }

    public function cost_to_precision ($symbol, $cost) {
        return $this->truncate (floatval ($cost), $this->markets[$symbol]['precision']['price']);
    }

    public function fee_to_precision ($symbol, $fee) {
        return $this->truncate (floatval ($fee), $this->markets[$symbol]['precision']['amount']);
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if (mb_strpos ($body, 'Invalid nonce') !== false)
            throw new InvalidNonce ($this->id . ' ' . $body);
        if (mb_strpos ($body, 'Insufficient funds') !== false)
            throw new InsufficientFunds ($this->id . ' ' . $body);
        if (mb_strpos ($body, 'Cancel pending') !== false)
            throw new CancelPending ($this->id . ' ' . $body);
        if (mb_strpos ($body, 'Invalid arguments:volume') !== false)
            throw new InvalidOrder ($this->id . ' ' . $body);
    }

    public function fetch_markets () {
        $markets = $this->publicGetAssetPairs ();
        $keys = array_keys ($markets['result']);
        $result = array ();
        for ($i = 0; $i < count ($keys); $i++) {
            $id = $keys[$i];
            $market = $markets['result'][$id];
            $base = $market['base'];
            $quote = $market['quote'];
            if (($base[0] == 'X') || ($base[0] == 'Z'))
                $base = mb_substr ($base, 1);
            if (($quote[0] == 'X') || ($quote[0] == 'Z'))
                $quote = mb_substr ($quote, 1);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $darkpool = mb_strpos ($id, '.d') !== false;
            $symbol = $darkpool ? $market['altname'] : ($base . '/' . $quote);
            $maker = null;
            if (array_key_exists ('fees_maker', $market)) {
                $maker = floatval ($market['fees_maker'][0][1]) / 100;
            }
            $precision = array (
                'amount' => $market['lot_decimals'],
                'price' => $market['pair_decimals'],
            );
            $lot = pow (10, -$precision['amount']);
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'darkpool' => $darkpool,
                'info' => $market,
                'altname' => $market['altname'],
                'maker' => $maker,
                'taker' => floatval ($market['fees'][0][1]) / 100,
                'lot' => $lot,
                'active' => true,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $lot,
                        'max' => pow (10, $precision['amount']),
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
        $result = $this->append_inactive_markets($result);
        $this->marketsByAltname = $this->index_by($result, 'altname');
        return $result;
    }

    public function append_inactive_markets ($result = []) {
        $precision = array ( 'amount' => 8, 'price' => 8 );
        $costLimits = array ( 'min' => 0, 'max' => null );
        $priceLimits = array ( 'min' => pow (10, -$precision['price']), 'max' => null );
        $amountLimits = array ( 'min' => pow (10, -$precision['amount']), 'max' => pow (10, $precision['amount']) );
        $limits = array ( 'amount' => $amountLimits, 'price' => $priceLimits, 'cost' => $costLimits );
        $defaults = array (
            'darkpool' => false,
            'info' => null,
            'maker' => null,
            'taker' => null,
            'lot' => $amountLimits['min'],
            'active' => false,
            'precision' => $precision,
            'limits' => $limits,
        );
        $markets = array (
            array ( 'id' => 'XXLMZEUR', 'symbol' => 'XLM/EUR', 'base' => 'XLM', 'quote' => 'EUR', 'altname' => 'XLMEUR' ),
        );
        for ($i = 0; $i < count ($markets); $i++) {
            $result[] = array_merge ($defaults, $markets[$i]);
        }
        return $result;
    }

    public function fetch_currencies ($params = array ()) {
        $response = $this->publicGetAssets ($params);
        $currencies = $response['result'];
        $ids = array_keys ($currencies);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $currency = $currencies[$id];
            // todo => will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            $code = $this->common_currency_code($currency['altname']);
            $precision = array (
                'amount' => $currency['decimals'], // default $precision, todo => fix "magic constants"
                'price' => $currency['decimals'],
            );
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'info' => $currency,
                'name' => $code,
                'active' => true,
                'status' => 'ok',
                'fee' => null,
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => pow (10, -$precision['amount']),
                        'max' => pow (10, $precision['amount']),
                    ),
                    'price' => array (
                        'min' => pow (10, -$precision['price']),
                        'max' => pow (10, $precision['price']),
                    ),
                    'cost' => array (
                        'min' => null,
                        'max' => null,
                    ),
                    'withdraw' => array (
                        'min' => null,
                        'max' => pow (10, $precision['amount']),
                    ),
                ),
            );
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $darkpool = mb_strpos ($symbol, '.d') !== false;
        if ($darkpool)
            throw new ExchangeError ($this->id . ' does not provide an order book for $darkpool $symbol ' . $symbol);
        $market = $this->market ($symbol);
        $response = $this->publicGetDepth (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $orderbook = $response['result'][$market['id']];
        return $this->parse_order_book($orderbook);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $baseVolume = floatval ($ticker['v'][1]);
        $vwap = floatval ($ticker['p'][1]);
        $quoteVolume = $baseVolume * $vwap;
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['h'][1]),
            'low' => floatval ($ticker['l'][1]),
            'bid' => floatval ($ticker['b'][0]),
            'ask' => floatval ($ticker['a'][0]),
            'vwap' => $vwap,
            'open' => floatval ($ticker['o']),
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['c'][0]),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $baseVolume,
            'quoteVolume' => $quoteVolume,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $pairs = array ();
        for ($s = 0; $s < count ($this->symbols); $s++) {
            $symbol = $this->symbols[$s];
            $market = $this->markets[$symbol];
            if ($market['active'])
                if (!$market['darkpool'])
                    $pairs[] = $market['id'];
        }
        $filter = implode (',', $pairs);
        $response = $this->publicGetTicker (array_merge (array (
            'pair' => $filter,
        ), $params));
        $tickers = $response['result'];
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $darkpool = mb_strpos ($symbol, '.d') !== false;
        if ($darkpool)
            throw new ExchangeError ($this->id . ' does not provide a $ticker for $darkpool $symbol ' . $symbol);
        $market = $this->market ($symbol);
        $response = $this->publicGetTicker (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        $ticker = $response['result'][$market['id']];
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[6]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array (
            'pair' => $market['id'],
            'interval' => $this->timeframes[$timeframe],
        );
        if ($since)
            $request['since'] = intval ($since / 1000);
        $response = $this->publicGetOHLC (array_merge ($request, $params));
        $ohlcvs = $response['result'][$market['id']];
        return $this->parse_ohlcvs($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        $side = null;
        $type = null;
        $price = null;
        $amount = null;
        $id = null;
        $order = null;
        $fee = null;
        if (!$market)
            $market = $this->find_market_by_altname_or_id ($trade['pair']);
        if (array_key_exists ('ordertxid', $trade)) {
            $order = $trade['ordertxid'];
            $id = $trade['id'];
            $timestamp = intval ($trade['time'] * 1000);
            $side = $trade['type'];
            $type = $trade['ordertype'];
            $price = floatval ($trade['price']);
            $amount = floatval ($trade['vol']);
            if (array_key_exists ('fee', $trade)) {
                $currency = null;
                if ($market)
                    $currency = $market['quote'];
                $fee = array (
                    'cost' => floatval ($trade['fee']),
                    'currency' => $currency,
                );
            }
        } else {
            $timestamp = intval ($trade[2] * 1000);
            $side = ($trade[3] == 's') ? 'sell' : 'buy';
            $type = ($trade[4] == 'l') ? 'limit' : 'market';
            $price = floatval ($trade[0]);
            $amount = floatval ($trade[1]);
        }
        $symbol = ($market) ? $market['symbol'] : null;
        return array (
            'id' => $id,
            'order' => $order,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $id = $market['id'];
        $response = $this->publicGetTrades (array_merge (array (
            'pair' => $id,
        ), $params));
        $trades = $response['result'][$id];
        return $this->parse_trades($trades, $market);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostBalance ();
        $balances = $response['result'];
        $result = array ( 'info' => $balances );
        $currencies = array_keys ($balances);
        for ($c = 0; $c < count ($currencies); $c++) {
            $currency = $currencies[$c];
            $code = $currency;
            // X-ISO4217-A3 standard $currency codes
            if ($code[0] == 'X') {
                $code = mb_substr ($code, 1);
            } else if ($code[0] == 'Z') {
                $code = mb_substr ($code, 1);
            }
            $code = $this->common_currency_code($code);
            $balance = floatval ($balances[$currency]);
            $account = array (
                'free' => $balance,
                'used' => 0.0,
                'total' => $balance,
            );
            $result[$code] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $order = array (
            'pair' => $market['id'],
            'type' => $side,
            'ordertype' => $type,
            'volume' => $this->amount_to_precision($symbol, $amount),
        );
        if ($type == 'limit')
            $order['price'] = $this->price_to_precision($symbol, $price);
        $response = $this->privatePostAddOrder (array_merge ($order, $params));
        $length = count ($response['result']['txid']);
        $id = ($length > 1) ? $response['result']['txid'] : $response['result']['txid'][0];
        return array (
            'info' => $response,
            'id' => $id,
        );
    }

    public function find_market_by_altname_or_id ($id) {
        $result = null;
        if (array_key_exists ($id, $this->marketsByAltname)) {
            $result = $this->marketsByAltname[$id];
        } else if (array_key_exists ($id, $this->markets_by_id)) {
            $result = $this->markets_by_id[$id];
        }
        return $result;
    }

    public function parse_order ($order, $market = null) {
        $description = $order['descr'];
        $side = $description['type'];
        $type = $description['ordertype'];
        $symbol = null;
        if (!$market)
            $market = $this->find_market_by_altname_or_id ($description['pair']);
        $timestamp = intval ($order['opentm'] * 1000);
        $amount = floatval ($order['vol']);
        $filled = floatval ($order['vol_exec']);
        $remaining = $amount - $filled;
        $fee = null;
        $cost = $this->safe_float($order, 'cost');
        $price = $this->safe_float($description, 'price');
        if (!$price)
            $price = $this->safe_float($order, 'price');
        if ($market) {
            $symbol = $market['symbol'];
            if (array_key_exists ('fee', $order)) {
                $flags = $order['oflags'];
                $feeCost = $this->safe_float($order, 'fee');
                $fee = array (
                    'cost' => $feeCost,
                    'rate' => null,
                );
                if (mb_strpos ($flags, 'fciq') !== false) {
                    $fee['currency'] = $market['quote'];
                } else if (mb_strpos ($flags, 'fcib') !== false) {
                    $fee['currency'] = $market['base'];
                }
            }
        }
        return array (
            'id' => $order['id'],
            'info' => $order,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => $fee,
            // 'trades' => $this->parse_trades($order['trades'], $market),
        );
    }

    public function parse_orders ($orders, $market = null) {
        $result = array ();
        $ids = array_keys ($orders);
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $order = array_merge (array ( 'id' => $id ), $orders[$id]);
            $result[] = $this->parse_order($order, $market);
        }
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostQueryOrders (array_merge (array (
            'trades' => true, // whether or not to include trades in output (optional, default false)
            'txid' => $id, // comma delimited list of transaction ids to query info about (20 maximum)
            // 'userref' => 'optional', // restrict results to given user reference $id (optional)
        ), $params));
        $orders = $response['result'];
        $order = $this->parse_order(array_merge (array ( 'id' => $id ), $orders[$id]));
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array (
            // 'type' => 'all', // any position, closed position, closing position, no position
            // 'trades' => false, // whether or not to include $trades related to position in output
            // 'start' => 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
            // 'end' => 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
            // 'ofs' = result offset
        );
        if ($since)
            $request['start'] = intval ($since / 1000);
        $response = $this->privatePostTradesHistory (array_merge ($request, $params));
        $trades = $response['result']['trades'];
        $ids = array_keys ($trades);
        for ($i = 0; $i < count ($ids); $i++) {
            $trades[$ids[$i]]['id'] = $ids[$i];
        }
        return $this->parse_trades($trades);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = null;
        try {
            $response = $this->privatePostCancelOrder (array_merge (array (
                'txid' => $id,
            ), $params));
        } catch (Exception $e) {
            if ($this->last_http_response)
                if (mb_strpos ($this->last_http_response, 'EOrder:Unknown order') !== false)
                    throw new OrderNotFound ($this->id . ' cancelOrder() error ' . $this->last_http_response);
            throw $e;
        }
        return $response;
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        if ($since)
            $request['start'] = intval ($since / 1000);
        $response = $this->privatePostOpenOrders (array_merge ($request, $params));
        $orders = $this->parse_orders($response['result']['open']);
        return $this->filter_orders_by_symbol($orders, $symbol);
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        if ($since)
            $request['start'] = intval ($since / 1000);
        $response = $this->privatePostClosedOrders (array_merge ($request, $params));
        $orders = $this->parse_orders($response['result']['closed']);
        return $this->filter_orders_by_symbol($orders, $symbol);
    }

    public function fetch_deposit_methods ($code = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        if ($code) {
            $currency = $this->currency ($code);
            $request['asset'] = $currency['id'];
        }
        $response = $this->privatePostDepositMethods (array_merge ($request, $params));
        return $response['result'];
    }

    public function create_deposit_address ($currency, $params = array ()) {
        $request = array (
            'new' => 'true',
        );
        $response = $this->fetch_deposit_address ($currency, array_merge ($request, $params));
        return array (
            'currency' => $currency,
            'address' => $response['address'],
            'status' => 'ok',
            'info' => $response,
        );
    }

    public function fetch_deposit_address ($code, $params = array ()) {
        $method = $this->safe_value($params, 'method');
        if (!$method)
            throw new ExchangeError ($this->id . ' fetchDepositAddress() requires an extra `$method` parameter');
        $this->load_markets();
        $currency = $this->currency ($code);
        $request = array (
            'asset' => $currency['id'],
            'method' => $method,
            'new' => 'false',
        );
        $response = $this->privatePostDepositAddresses (array_merge ($request, $params));
        $result = $response['result'];
        $numResults = count ($result);
        if ($numResults < 1)
            throw new ExchangeError ($this->id . ' privatePostDepositAddresses() returned no addresses');
        $address = $this->safe_string($result[0], 'address');
        return array (
            'currency' => $code,
            'address' => $address,
            'status' => 'ok',
            'info' => $response,
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        if (array_key_exists ('key', $params)) {
            $this->load_markets();
            $response = $this->privatePostWithdraw (array_merge (array (
                'asset' => $currency,
                'amount' => $amount,
                // 'address' => $address, // they don't allow withdrawals to direct addresses
            ), $params));
            return array (
                'info' => $response,
                'id' => $response['result'],
            );
        }
        throw new ExchangeError ($this->id . " withdraw requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $api . '/' . $path;
        if ($api == 'public') {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        } else {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $body = $this->urlencode (array_merge (array ( 'nonce' => $nonce ), $params));
            $auth = $this->encode ($nonce . $body);
            $hash = $this->hash ($auth, 'sha256', 'binary');
            $binary = $this->encode ($url);
            $binhash = $this->binary_concat($binary, $hash);
            $secret = base64_decode ($this->secret);
            $signature = $this->hmac ($binhash, $secret, 'sha512', 'base64');
            $headers = array (
                'API-Key' => $this->apiKey,
                'API-Sign' => $this->decode ($signature),
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('error', $response)) {
            $numErrors = count ($response['error']);
            if ($numErrors) {
                for ($i = 0; $i < count ($response['error']); $i++) {
                    if ($response['error'][$i] == 'EService:Unavailable')
                        throw new ExchangeNotAvailable ($this->id . ' ' . $this->json ($response));
                    if ($response['error'][$i] == 'EService:Busy')
                        throw new DDoSProtection ($this->id . ' ' . $this->json ($response));
                }
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}

?>