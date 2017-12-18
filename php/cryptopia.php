<?php

namespace ccxt;

class cryptopia extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'cryptopia',
            'name' => 'Cryptopia',
            'rateLimit' => 1500,
            'countries' => 'NZ', // New Zealand
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchTickers' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'hasFetchMyTrades' => true,
            'hasFetchCurrencies' => true,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchTickers' => true,
                'fetchOrder' => 'emulated',
                'fetchOrders' => 'emulated',
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => 'emulated',
                'fetchMyTrades' => true,
                'fetchCurrencies' => true,
                'deposit' => true,
                'withdraw' => true,
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
                'api' => 'https://www.cryptopia.co.nz/api',
                'www' => 'https://www.cryptopia.co.nz',
                'doc' => array (
                    'https://www.cryptopia.co.nz/Forum/Category/45',
                    'https://www.cryptopia.co.nz/Forum/Thread/255',
                    'https://www.cryptopia.co.nz/Forum/Thread/256',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'GetCurrencies',
                        'GetTradePairs',
                        'GetMarkets',
                        'GetMarkets/{id}',
                        'GetMarkets/{hours}',
                        'GetMarkets/{id}/{hours}',
                        'GetMarket/{id}',
                        'GetMarket/{id}/{hours}',
                        'GetMarketHistory/{id}',
                        'GetMarketHistory/{id}/{hours}',
                        'GetMarketOrders/{id}',
                        'GetMarketOrders/{id}/{count}',
                        'GetMarketOrderGroups/{ids}/{count}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'CancelTrade',
                        'GetBalance',
                        'GetDepositAddress',
                        'GetOpenOrders',
                        'GetTradeHistory',
                        'GetTransactions',
                        'SubmitTip',
                        'SubmitTrade',
                        'SubmitTransfer',
                        'SubmitWithdraw',
                    ),
                ),
            ),
        ));
    }

    public function common_currency_code ($currency) {
        if ($currency == 'CC')
            return 'CCX';
        if ($currency == 'FCN')
            return 'Facilecoin';
        if ($currency == 'NET')
            return 'NetCoin';
        if ($currency == 'BTG')
            return 'Bitgem';
        if ($currency == 'FUEL')
            return 'FC2'; // FuelCoin != FUEL
        return $currency;
    }

    public function currency_id ($currency) {
        if ($currency == 'CCX')
            return 'CC';
        if ($currency == 'Facilecoin')
            return 'FCN';
        if ($currency == 'NetCoin')
            return 'NET';
        if ($currency == 'Bitgem')
            return 'BTG';
        if ($currency == 'FC2')
            return 'FUEL'; // FuelCoin != FUEL
        return $currency;
    }

    public function fetch_markets () {
        $response = $this->publicGetTradePairs ();
        $result = array ();
        $markets = $response['Data'];
        for ($i = 0; $i < count ($markets); $i++) {
            $market = $markets[$i];
            $id = $market['Id'];
            $symbol = $market['Label'];
            list ($base, $quote) = explode ('/', $symbol);
            $base = $this->common_currency_code($base);
            $quote = $this->common_currency_code($quote);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'amount' => 8,
                'price' => 8,
            );
            $amountLimits = array (
                'min' => $market['MinimumTrade'],
                'max' => $market['MaximumTrade']
            );
            $priceLimits = array (
                'min' => $market['MinimumPrice'],
                'max' => $market['MaximumPrice'],
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $active = $market['Status'] == 'OK';
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
                'maker' => $market['TradeFee'] / 100,
                'taker' => $market['TradeFee'] / 100,
                'lot' => $amountLimits['min'],
                'active' => $active,
                'precision' => $precision,
                'limits' => $limits,
            );
        }
        return $result;
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetMarketOrdersId (array_merge (array (
            'id' => $this->market_id($symbol),
        ), $params));
        $orderbook = $response['Data'];
        return $this->parse_order_book($orderbook, null, 'Buy', 'Sell', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'info' => $ticker,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['High']),
            'low' => floatval ($ticker['Low']),
            'bid' => floatval ($ticker['BidPrice']),
            'ask' => floatval ($ticker['AskPrice']),
            'vwap' => null,
            'open' => floatval ($ticker['Open']),
            'close' => floatval ($ticker['Close']),
            'first' => null,
            'last' => floatval ($ticker['LastPrice']),
            'change' => floatval ($ticker['Change']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['Volume']),
            'quoteVolume' => floatval ($ticker['BaseVolume']),
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketId (array_merge (array (
            'id' => $market['id'],
        ), $params));
        $ticker = $response['Data'];
        return $this->parse_ticker($ticker, $market);
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetMarkets ($params);
        $result = array ();
        $tickers = $response['Data'];
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker['TradePairId'];
            $recognized = (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id));
            if (!$recognized)
                throw new ExchangeError ($this->id . ' fetchTickers() returned unrecognized pair $id ' . $id);
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = null;
        if (is_array ($trade) && array_key_exists ('Timestamp', $trade)) {
            $timestamp = $trade['Timestamp'] * 1000;
        } else if (is_array ($trade) && array_key_exists ('TimeStamp', $trade)) {
            $timestamp = $this->parse8601 ($trade['TimeStamp']);
        }
        $price = $this->safe_float($trade, 'Price');
        if (!$price)
            $price = $this->safe_float($trade, 'Rate');
        $cost = $this->safe_float($trade, 'Total');
        $id = $this->safe_string($trade, 'TradeId');
        if (!$market) {
            if (is_array ($trade) && array_key_exists ('TradePairId', $trade))
                if (is_array ($this->markets_by_id) && array_key_exists ($trade['TradePairId'], $this->markets_by_id))
                    $market = $this->markets_by_id[$trade['TradePairId']];
        }
        $symbol = null;
        $fee = null;
        if ($market) {
            $symbol = $market['symbol'];
            if (is_array ($trade) && array_key_exists ('Fee', $trade)) {
                $fee = array (
                    'currency' => $market['quote'],
                    'cost' => $trade['Fee'],
                );
            }
        }
        return array (
            'id' => $id,
            'info' => $trade,
            'order' => null,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => strtolower ($trade['Type']),
            'price' => $price,
            'cost' => $cost,
            'amount' => $trade['Amount'],
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetMarketHistoryIdHours (array_merge (array (
            'id' => $market['id'],
            'hours' => 24, // default
        ), $params));
        $trades = $response['Data'];
        return $this->parse_trades($trades, $market, $since, $limit);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchMyTrades requires a symbol');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->privatePostGetTradeHistory (array_merge (array (
            // 'Market' => $market['id'],
            'TradePairId' => $market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count' => 10, // max = 100
        ), $params));
        return $this->parse_trades($response['Data'], $market, $since, $limit);
    }

    public function fetch_currencies ($params = array ()) {
        $response = $this->publicGetCurrencies ($params);
        $currencies = $response['Data'];
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $id = $currency['Symbol'];
            // todo => will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            $precision = array (
                'amount' => 8, // default $precision, todo => fix "magic constants"
                'price' => 8,
            );
            $code = $this->common_currency_code($id);
            $active = ($currency['ListingStatus'] == 'Active');
            $status = strtolower ($currency['Status']);
            $result[$code] = array (
                'id' => $id,
                'code' => $code,
                'info' => $currency,
                'name' => $currency['Name'],
                'active' => $active,
                'status' => $status,
                'fee' => $currency['WithdrawFee'],
                'precision' => $precision,
                'limits' => array (
                    'amount' => array (
                        'min' => $currency['MinBaseTrade'],
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
                        'min' => $currency['MinWithdraw'],
                        'max' => $currency['MaxWithdraw'],
                    ),
                ),
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostGetBalance ();
        $balances = $response['Data'];
        $result = array ( 'info' => $response );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $code = $balance['Symbol'];
            $currency = $this->common_currency_code($code);
            $account = array (
                'free' => $balance['Available'],
                'used' => 0.0,
                'total' => $balance['Total'],
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $price = floatval ($price);
        $amount = floatval ($amount);
        $request = array (
            'TradePairId' => $market['id'],
            'Type' => $this->capitalize ($side),
            'Rate' => $this->price_to_precision($symbol, $price),
            'Amount' => $this->amount_to_precision($symbol, $amount),
        );
        $response = $this->privatePostSubmitTrade (array_merge ($request, $params));
        if (!$response)
            throw new ExchangeError ($this->id . ' createOrder returned unknown error => ' . $this->json ($response));
        $id = null;
        $filled = 0.0;
        if (is_array ($response) && array_key_exists ('Data', $response)) {
            if (is_array ($response['Data']) && array_key_exists ('OrderId', $response['Data'])) {
                if ($response['Data']['OrderId']) {
                    $id = (string) $response['Data']['OrderId'];
                }
            }
            if (is_array ($response['Data']) && array_key_exists ('FilledOrders', $response['Data'])) {
                $filledOrders = $response['Data']['FilledOrders'];
                $filledOrdersLength = count ($filledOrders);
                if ($filledOrdersLength) {
                    $filled = null;
                }
            }
        }
        $timestamp = $this->milliseconds ();
        $order = array (
            'id' => $id,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => 'open',
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'remaining' => $amount,
            'filled' => $filled,
            'fee' => null,
            // 'trades' => $this->parse_trades($order['trades'], $market),
        );
        if ($id)
            $this->orders[$id] = $order;
        return array_merge (array ( 'info' => $response ), $order);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = null;
        try {
            $response = $this->privatePostCancelTrade (array_merge (array (
                'Type' => 'Trade',
                'OrderId' => $id,
            ), $params));
            if (is_array ($this->orders) && array_key_exists ($id, $this->orders))
                $this->orders[$id]['status'] = 'canceled';
        } catch (Exception $e) {
            if ($this->last_json_response) {
                $message = $this->safe_string($this->last_json_response, 'Error');
                if ($message) {
                    if (mb_strpos ($message, 'does not exist') !== false)
                        throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
                }
            }
            throw $e;
        }
        return $response;
    }

    public function parse_order ($order, $market = null) {
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else if (is_array ($order) && array_key_exists ('Market', $order)) {
            $id = $order['Market'];
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
        }
        $timestamp = $this->parse8601 ($order['TimeStamp']);
        $amount = $this->safe_float($order, 'Amount');
        $remaining = $this->safe_float($order, 'Remaining');
        $filled = $amount - $remaining;
        return array (
            'id' => (string) $order['OrderId'],
            'info' => $this->omit ($order, 'status'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'status' => $order['status'],
            'symbol' => $symbol,
            'type' => 'limit',
            'side' => strtolower ($order['Type']),
            'price' => $this->safe_float($order, 'Rate'),
            'cost' => $this->safe_float($order, 'Total'),
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'fee' => null,
            // 'trades' => $this->parse_trades($order['trades'], $market),
        );
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a $symbol param');
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->privatePostGetOpenOrders (array (
            // 'Market' => $market['id'],
            'TradePairId' => $market['id'], // Cryptopia identifier (not required if 'Market' supplied)
            // 'Count' => 100, // default = 100
        ), $params);
        $orders = array ();
        for ($i = 0; $i < count ($response['Data']); $i++) {
            $orders[] = array_merge ($response['Data'][$i], array ( 'status' => 'open' ));
        }
        $openOrders = $this->parse_orders($orders, $market);
        for ($j = 0; $j < count ($openOrders); $j++) {
            $this->orders[$openOrders[$j]['id']] = $openOrders[$j];
        }
        $openOrdersIndexedById = $this->index_by($openOrders, 'id');
        $cachedOrderIds = array_keys ($this->orders);
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

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $id = (string) $id;
        $orders = $this->fetch_orders($symbol, $params);
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['id'] == $id)
                return $orders[$i];
        }
        throw new OrderNotCached ($this->id . ' order ' . $id . ' not found in cached .orders, fetchOrder requires .orders (de)serialization implemented for this method to work properly');
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'open')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $orders = $this->fetch_orders($symbol, $params);
        $result = array ();
        for ($i = 0; $i < count ($orders); $i++) {
            if ($orders[$i]['status'] == 'closed')
                $result[] = $orders[$i];
        }
        return $result;
    }

    public function fetch_deposit_address ($currency, $params = array ()) {
        $currencyId = $this->currency_id ($currency);
        $response = $this->privatePostGetDepositAddress (array_merge (array (
            'Currency' => $currencyId
        ), $params));
        $address = $this->safe_string($response['Data'], 'BaseAddress');
        if (!$address)
            $address = $this->safe_string($response['Data'], 'Address');
        return array (
            'currency' => $currency,
            'address' => $address,
            'status' => 'ok',
            'info' => $response,
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $currencyId = $this->currency_id ($currency);
        $response = $this->privatePostSubmitWithdraw (array_merge (array (
            'Currency' => $currencyId,
            'Amount' => $amount,
            'Address' => $address, // Address must exist in you AddressBook in security settings
        ), $params));
        return array (
            'info' => $response,
            'id' => $response['Data'],
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $body = $this->json ($query);
            $hash = $this->hash ($this->encode ($body), 'md5', 'base64');
            $secret = base64_decode ($this->secret);
            $uri = $this->encode_uri_component($url);
            $lowercase = strtolower ($uri);
            $payload = $this->apiKey . $method . $lowercase . $nonce . $this->binary_to_string($hash);
            $signature = $this->hmac ($this->encode ($payload), $secret, 'sha256', 'base64');
            $auth = 'amx ' . $this->apiKey . ':' . $this->binary_to_string($signature) . ':' . $nonce;
            $headers = array (
                'Content-Type' => 'application/json',
                'Authorization' => $auth,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($response) {
            if (is_array ($response) && array_key_exists ('Success', $response))
                if ($response['Success']) {
                    return $response;
                } else if (is_array ($response) && array_key_exists ('Error', $response)) {
                    if ($response['Error'] == 'Insufficient Funds.')
                        throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                }
        }
        throw new ExchangeError ($this->id . ' ' . $this->json ($response));
    }
}
