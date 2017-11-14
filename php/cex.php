<?php

namespace ccxt;

include_once ('base/Exchange.php');

class cex extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'cex',
            'name' => 'CEX.IO',
            'countries' => array ( 'GB', 'EU', 'CY', 'RU' ),
            'rateLimit' => 1500,
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOpenOrders' => true,
            'timeframes' => array (
                '1m' => '1m',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api' => 'https://cex.io/api',
                'www' => 'https://cex.io',
                'doc' => 'https://cex.io/cex-api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency_limits/',
                        'last_price/{pair}/',
                        'last_prices/{currencies}/',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}/',
                        'ticker/{pair}/',
                        'tickers/{currencies}/',
                        'trade_history/{pair}/',
                    ),
                    'post' => array (
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'active_orders_status/',
                        'archived_orders/{pair}/',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}/',
                        'cancel_replace_order/{pair}/',
                        'close_position/{pair}/',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}/',
                        'open_orders/',
                        'open_position/{pair}/',
                        'open_positions/{pair}/',
                        'place_order/{pair}/',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0,
                    'taker' => 0.2 / 100,
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetCurrencyLimits ();
        $result = array ();
        for ($p = 0; $p < count ($markets['data']['pairs']); $p++) {
            $market = $markets['data']['pairs'][$p];
            $id = $market['symbol1'] . '/' . $market['symbol2'];
            $symbol = $id;
            list ($base, $quote) = explode ('/', $symbol);
            $precision = array (
                'price' => 4,
                'amount' => -1 * log10 ($market['minLotSize']),
            );
            $amountLimits = array (
                'min' => $market['minLotSize'],
                'max' => $market['maxLotSize'],
            );
            $priceLimits = array (
                'min' => $market['minPrice'],
                'max' => $market['maxPrice'],
            );
            $limits = array (
                'amount' => $amountLimits,
                'price' => $priceLimits,
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'precision' => $precision,
                'limits' => $limits,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostBalance ();
        $result = array ( 'info' => $balances );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            if (array_key_exists ($currency, $balances)) {
                $account = array (
                    'free' => floatval ($balances[$currency]['available']),
                    'used' => floatval ($balances[$currency]['orders']),
                    'total' => 0.0,
                );
                $account['total'] = $this->sum ($account['free'], $account['used']);
                $result[$currency] = $account;
            }
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetOrderBookPair (array_merge (array (
            'pair' => $this->market_id($symbol),
        ), $params));
        $timestamp = $orderbook['timestamp'] * 1000;
        return $this->parse_order_book($orderbook, $timestamp);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0] * 1000,
            $ohlcv[1],
            $ohlcv[2],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        if (!$since)
            $since = $this->milliseconds () - 86400000; // yesterday
        $ymd = $this->Ymd ($since);
        $ymd = explode ('-', $ymd);
        $ymd = implode ('', $ymd);
        $request = array (
            'pair' => $market['id'],
            'yyyymmdd' => $ymd,
        );
        $response = $this->publicGetOhlcvHdYyyymmddPair (array_merge ($request, $params));
        $key = 'data' . $this->timeframes[$timeframe];
        $ohlcvs = json_decode ($response[$key], $as_associative_array = true);
        return $this->parse_ohlcvs($ohlcvs, $market, $timeframe, $since, $limit);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = null;
        $iso8601 = null;
        if (array_key_exists ('timestamp', $ticker)) {
            $timestamp = intval ($ticker['timestamp']) * 1000;
            $iso8601 = $this->iso8601 ($timestamp);
        }
        $volume = $this->safe_float($ticker, 'volume');
        $high = $this->safe_float($ticker, 'high');
        $low = $this->safe_float($ticker, 'low');
        $bid = $this->safe_float($ticker, 'bid');
        $ask = $this->safe_float($ticker, 'ask');
        $last = $this->safe_float($ticker, 'last');
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $iso8601,
            'high' => $high,
            'low' => $low,
            'bid' => $bid,
            'ask' => $ask,
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $volume,
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $currencies = implode ('/', $this->currencies);
        $response = $this->publicGetTickersCurrencies (array_merge (array (
            'currencies' => $currencies,
        ), $params));
        $tickers = $response['data'];
        $result = array ();
        for ($t = 0; $t < count ($tickers); $t++) {
            $ticker = $tickers[$t];
            $symbol = str_replace (':', '/', $ticker['pair']);
            $market = $this->markets[$symbol];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetTickerPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = intval ($trade['date']) * 1000;
        return array (
            'info' => $trade,
            'id' => $trade['tid'],
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
        $response = $this->publicGetTradeHistoryPair (array_merge (array (
            'pair' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $order = array (
            'pair' => $this->market_id($symbol),
            'type' => $side,
            'amount' => $amount,
        );
        if ($type == 'limit')
            $order['price'] = $price;
        else
            $order['order_type'] = $type;
        $response = $this->privatePostPlaceOrderPair (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array ( 'id' => $id ));
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostGetOrder (array_merge (array (
            'id' => (string) $id,
        ), $params));
    }

    public function parse_order ($order, $market = null) {
        $timestamp = intval ($order['time']);
        $symbol = null;
        if (!$market) {
            $symbol = $order['symbol1'] . '/' . $order['symbol2'];
            if (array_key_exists ($symbol, $this->markets))
                $market = $this->market ($symbol);
        }
        $status = $order['status'];
        if ($status == 'cd') {
            $status = 'canceled';
        } else if ($status == 'c') {
            $status = 'canceled';
        } else if ($status == 'd') {
            $status = 'closed';
        }
        $price = $this->safe_float($order, 'price');
        $amount = $this->safe_float($order, 'amount');
        $remaining = $this->safe_float($order, 'pending');
        if (!$remaining)
            $remaining = $this->safe_float($order, 'remains');
        $filled = $amount - $remaining;
        $fee = null;
        $cost = null;
        if ($market) {
            $symbol = $market['symbol'];
            $cost = $this->safe_float($order, 'ta:' . $market['quote']);
            $baseFee = 'fa:' . $market['base'];
            $quoteFee = 'fa:' . $market['quote'];
            $feeRate = $this->safe_float($order, 'tradingFeeMaker');
            if (!$feeRate)
                $feeRate = $this->safe_float($order, 'tradingFeeTaker', $feeRate);
            if ($feeRate)
                $feeRate /= 100.0; // convert to mathematically-correct percentage coefficients => 1.0 = 100%
            if (array_key_exists ($baseFee, $order)) {
                $fee = array (
                    'currency' => $market['base'],
                    'rate' => $feeRate,
                    'cost' => $this->safe_float($order, $baseFee),
                );
            } else if (array_key_exists ($quoteFee, $order)) {
                $fee = array (
                    'currency' => $market['quote'],
                    'rate' => $feeRate,
                    'cost' => $this->safe_float($order, $quoteFee),
                );
            }
        }
        if (!$cost)
            $cost = $price * $filled;
        return array (
            'id' => $order['id'],
            'datetime' => $this->iso8601 ($timestamp),
            'timestamp' => $timestamp,
            'status' => $status,
            'symbol' => $symbol,
            'type' => null,
            'side' => $order['type'],
            'price' => $price,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'trades' => null,
            'fee' => $fee,
            'info' => $order,
        );
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        $method = 'privatePostOpenOrders';
        $market = null;
        if ($symbol) {
            $market = $this->market ($symbol);
            $request['pair'] = $market['id'];
            $method .= 'Pair';
        }
        $orders = $this->$method (array_merge ($request, $params));
        for ($i = 0; $i < count ($orders); $i++) {
            $orders[$i] = array_merge ($orders[$i], array ( 'status' => 'open' ));
        }
        return $this->parse_orders($orders, $market);
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'] . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            if (!$this->uid)
                throw new AuthenticationError ($this->id . ' requires `' . $this->id . '.uid` property for authentication');
            $nonce = (string) $this->nonce ();
            $auth = $nonce . $this->uid . $this->apiKey;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret));
            $body = $this->urlencode (array_merge (array (
                'key' => $this->apiKey,
                'signature' => strtoupper ($signature),
                'nonce' => $nonce,
            ), $query));
            $headers = array (
                'Content-Type' => 'application/x-www-form-urlencoded',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (!$response) {
            throw new ExchangeError ($this->id . ' returned ' . $this->json ($response));
        } else if ($response == true) {
            return $response;
        } else if (array_key_exists ('e', $response)) {
            if (array_key_exists ('ok', $response))
                if ($response['ok'] == 'ok')
                    return $response;
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        } else if (array_key_exists ('error', $response)) {
            if ($response['error'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}

?>