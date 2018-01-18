<?php

namespace ccxt;

class bitfinex extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitfinex',
            'name' => 'Bitfinex',
            'countries' => 'VG',
            'version' => 'v1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            // old metainfo interface
            'hasFetchOrder' => true,
            'hasFetchTickers' => true,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            'hasFetchOHLCV' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            // new metainfo interface
            'has' => array (
                'fetchOHLCV' => true,
                'fetchTickers' => true,
                'fetchOrder' => true,
                'fetchOpenOrders' => true,
                'fetchClosedOrders' => true,
                'fetchMyTrades' => true,
                'withdraw' => true,
                'deposit' => true,
            ),
            'timeframes' => array (
                '1m' => '1m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '3h' => '3h',
                '6h' => '6h',
                '12h' => '12h',
                '1d' => '1D',
                '1w' => '7D',
                '2w' => '14D',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'doc' => array (
                    'https://bitfinex.readme.io/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ),
            ),
            'api' => array (
                'v2' => array (
                    'get' => array (
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'book/{symbol}',
                        // 'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'tickers',
                        'today',
                        'trades/{symbol}',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'account_fees',
                        'account_infos',
                        'balances',
                        'basket_manage',
                        'credits',
                        'deposit/new',
                        'funding/close',
                        'history',
                        'history/movements',
                        'key_info',
                        'margin_infos',
                        'mytrades',
                        'mytrades_funding',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'offers/hist',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'orders/hist',
                        'position/claim',
                        'positions',
                        'summary',
                        'taken_funds',
                        'total_taken_funds',
                        'transfer',
                        'unused_taken_funds',
                        'withdraw',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'tierBased' => true,
                    'percentage' => true,
                    'maker' => 0.1 / 100,
                    'taker' => 0.2 / 100,
                    'tiers' => array (
                        'taker' => [
                            [0, 0.2 / 100],
                            [500000, 0.2 / 100],
                            [1000000, 0.2 / 100],
                            [2500000, 0.2 / 100],
                            [5000000, 0.2 / 100],
                            [7500000, 0.2 / 100],
                            [10000000, 0.18 / 100],
                            [15000000, 0.16 / 100],
                            [20000000, 0.14 / 100],
                            [25000000, 0.12 / 100],
                            [30000000, 0.1 / 100],
                        ],
                        'maker' => [
                            [0, 0.1 / 100],
                            [500000, 0.08 / 100],
                            [1000000, 0.06 / 100],
                            [2500000, 0.04 / 100],
                            [5000000, 0.02 / 100],
                            [7500000, 0],
                            [10000000, 0],
                            [15000000, 0],
                            [20000000, 0],
                            [25000000, 0],
                            [30000000, 0],
                        ],
                    ),
                ),
                'funding' => array (
                    'tierBased' => false, // true for tier-based/progressive
                    'percentage' => false, // fixed commission
                    'deposit' => array (
                        'BTC' => 0.0005,
                        'IOTA' => 0.5,
                        'ETH' => 0.01,
                        'BCH' => 0.01,
                        'LTC' => 0.1,
                        'EOS' => 0.1,
                        'XMR' => 0.04,
                        'SAN' => 0.1,
                        'DASH' => 0.01,
                        'ETC' => 0.01,
                        'XPR' => 0.02,
                        'YYW' => 0.1,
                        'NEO' => 0,
                        'ZEC' => 0.1,
                        'BTG' => 0,
                        'OMG' => 0.1,
                        'DATA' => 1,
                        'QASH' => 1,
                        'ETP' => 0.01,
                        'QTUM' => 0.01,
                        'EDO' => 0.5,
                        'AVT' => 0.5,
                        'USDT' => 0,
                    ),
                    'withdraw' => array (
                        'BTC' => 0.0005,
                        'IOTA' => 0.5,
                        'ETH' => 0.01,
                        'BCH' => 0.01,
                        'LTC' => 0.1,
                        'EOS' => 0.1,
                        'XMR' => 0.04,
                        'SAN' => 0.1,
                        'DASH' => 0.01,
                        'ETC' => 0.01,
                        'XPR' => 0.02,
                        'YYW' => 0.1,
                        'NEO' => 0,
                        'ZEC' => 0.1,
                        'BTG' => 0,
                        'OMG' => 0.1,
                        'DATA' => 1,
                        'QASH' => 1,
                        'ETP' => 0.01,
                        'QTUM' => 0.01,
                        'EDO' => 0.5,
                        'AVT' => 0.5,
                        'USDT' => 5,
                    ),
                ),
            ),
        ));
    }

    public function common_currency_code ($currency) {
        $currencies = array (
            'DSH' => 'DASH', // Bitfinex names Dash as DSH, instead of DASH
            'QTM' => 'QTUM',
            'BCC' => 'CST_BCC',
            'BCU' => 'CST_BCU',
            'IOT' => 'IOTA',
            'DAT' => 'DATA',
        );
        return (is_array ($currencies) && array_key_exists ($currency, $currencies)) ? $currencies[$currency] : $currency;
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbolsDetails ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = strtoupper ($market['pair']);
            $baseId = mb_substr ($id, 0, 3);
            $quoteId = mb_substr ($id, 3, 6);
            $base = $this->common_currency_code($baseId);
            $quote = $this->common_currency_code($quoteId);
            $symbol = $base . '/' . $quote;
            $precision = array (
                'price' => $market['price_precision'],
                'amount' => $market['price_precision'],
            );
            $limits = array (
                'amount' => array (
                    'min' => floatval ($market['minimum_order_size']),
                    'max' => floatval ($market['maximum_order_size']),
                ),
                'price' => array (
                    'min' => pow (10, -$precision['price']),
                    'max' => pow (10, $precision['price']),
                ),
            );
            $limits['cost'] = array (
                'min' => $limits['amount']['min'] * $limits['price']['min'],
                'max' => null,
            );
            $result[] = array_merge ($this->fees['trading'], array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'active' => true,
                'precision' => $precision,
                'limits' => $limits,
                'lot' => pow (10, -$precision['amount']),
                'info' => $market,
            ));
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balanceType = $this->safe_string($params, 'type', 'exchange');
        $balances = $this->privatePostBalances ();
        $result = array ( 'info' => $balances );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            if ($balance['type'] === $balanceType) {
                $currency = $balance['currency'];
                $uppercase = strtoupper ($currency);
                $uppercase = $this->common_currency_code($uppercase);
                $account = $this->account ();
                $account['free'] = floatval ($balance['available']);
                $account['total'] = floatval ($balance['amount']);
                $account['used'] = $account['total'] - $account['free'];
                $result[$uppercase] = $account;
            }
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTickers ($params);
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            if (is_array ($ticker) && array_key_exists ('pair', $ticker)) {
                $id = $ticker['pair'];
                if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                    $market = $this->markets_by_id[$id];
                    $symbol = $market['symbol'];
                    $result[$symbol] = $this->parse_ticker($ticker, $market);
                } else {
                    throw new ExchangeError ($this->id . ' fetchTickers() failed to recognize $symbol ' . $id . ' ' . $this->json ($ticker));
                }
            } else {
                throw new ExchangeError ($this->id . ' fetchTickers() response not recognized ' . $this->json ($tickers));
            }
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetPubtickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = floatval ($ticker['timestamp']) * 1000;
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else if (is_array ($ticker) && array_key_exists ('pair', $ticker)) {
            $id = $ticker['pair'];
            if (is_array ($this->markets_by_id) && array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                throw new ExchangeError ($this->id . ' unrecognized $ticker $symbol ' . $id . ' ' . $this->json ($ticker));
            }
        }
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['high']),
            'low' => floatval ($ticker['low']),
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last_price']),
            'change' => null,
            'percentage' => null,
            'average' => floatval ($ticker['mid']),
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = intval (floatval ($trade['timestamp'])) * 1000;
        $side = strtolower ($trade['type']);
        $orderId = $this->safe_string($trade, 'order_id');
        $price = floatval ($trade['price']);
        $amount = floatval ($trade['amount']);
        $cost = $price * $amount;
        return array (
            'id' => (string) $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'order' => $orderId,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
            'cost' => $cost,
            'fee' => null,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $request = array ( 'symbol' => $market['id'] );
        if ($limit) {
            $request['limit_trades'] = $limit;
        }
        if ($since) {
            $request['timestamp'] = intval ($since / 1000);
        }
        $response = $this->privatePostMytrades (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $orderType = $type;
        if (($type === 'limit') || ($type === 'market'))
            $orderType = 'exchange ' . $type;
        // $amount = $this->amount_to_precision($symbol, $amount);
        $order = array (
            'symbol' => $this->market_id($symbol),
            'amount' => (string) $amount,
            'side' => $side,
            'type' => $orderType,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        );
        if ($type === 'market') {
            $order['price'] = (string) $this->nonce ();
        } else {
            // $price = $this->price_to_precision($symbol, $price);
            $order['price'] = (string) $price;
        }
        $result = $this->privatePostOrderNew (array_merge ($order, $params));
        return $this->parse_order($result);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostOrderCancel (array ( 'order_id' => intval ($id) ));
    }

    public function parse_order ($order, $market = null) {
        $side = $order['side'];
        $open = $order['is_live'];
        $canceled = $order['is_cancelled'];
        $status = null;
        if ($open) {
            $status = 'open';
        } else if ($canceled) {
            $status = 'canceled';
        } else {
            $status = 'closed';
        }
        $symbol = null;
        if (!$market) {
            $exchange = strtoupper ($order['symbol']);
            if (is_array ($this->markets_by_id) && array_key_exists ($exchange, $this->markets_by_id)) {
                $market = $this->markets_by_id[$exchange];
            }
        }
        if ($market)
            $symbol = $market['symbol'];
        $orderType = $order['type'];
        $exchange = mb_strpos ($orderType, 'exchange ') !== false;
        if ($exchange) {
            $parts = explode (' ', $order['type']);
            $orderType = $parts[1];
        }
        $timestamp = intval (floatval ($order['timestamp']) * 1000);
        $result = array (
            'info' => $order,
            'id' => (string) $order['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $orderType,
            'side' => $side,
            'price' => $this->safe_float($order, 'price'),
            'average' => floatval ($order['avg_execution_price']),
            'amount' => floatval ($order['original_amount']),
            'remaining' => floatval ($order['remaining_amount']),
            'filled' => floatval ($order['executed_amount']),
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostOrders ($params);
        $orders = $this->parse_orders($response, null, $since, $limit);
        if ($symbol)
            $orders = $this->filter_by($orders, 'symbol', $symbol);
        return $orders;
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $request = array ();
        if ($limit)
            $request['limit'] = $limit;
        $response = $this->privatePostOrdersHist (array_merge ($request, $params));
        $orders = $this->parse_orders($response, null, $since, $limit);
        if ($symbol)
            $orders = $this->filter_by($orders, 'symbol', $symbol);
        $orders = $this->filter_by($orders, 'status', 'closed');
        return $orders;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostOrderStatus (array_merge (array (
            'order_id' => intval ($id),
        ), $params));
        return $this->parse_order($response);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            $ohlcv[1],
            $ohlcv[3],
            $ohlcv[4],
            $ohlcv[2],
            $ohlcv[5],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $v2id = 't' . $market['id'];
        $request = array (
            'symbol' => $v2id,
            'timeframe' => $this->timeframes[$timeframe],
            'sort' => 1,
        );
        if ($limit)
            $request['limit'] = $limit;
        if ($since)
            $request['start'] = $since;
        $request = array_merge ($request, $params);
        $response = $this->v2GetCandlesTradeTimeframeSymbolHist ($request);
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function get_currency_name ($currency) {
        if ($currency === 'BTC') {
            return 'bitcoin';
        } else if ($currency === 'LTC') {
            return 'litecoin';
        } else if ($currency === 'ETH') {
            return 'ethereum';
        } else if ($currency === 'ETC') {
            return 'ethereumc';
        } else if ($currency === 'OMNI') {
            return 'mastercoin'; // ???
        } else if ($currency === 'ZEC') {
            return 'zcash';
        } else if ($currency === 'XMR') {
            return 'monero';
        } else if ($currency === 'USD') {
            return 'wire';
        } else if ($currency === 'DASH') {
            return 'dash';
        } else if ($currency === 'XRP') {
            return 'ripple';
        } else if ($currency === 'EOS') {
            return 'eos';
        } else if ($currency === 'BCH') {
            return 'bcash';
        } else if ($currency === 'USDT') {
            return 'tetheruso';
        }
        throw new NotSupported ($this->id . ' ' . $currency . ' not supported for withdrawal');
    }

    public function create_deposit_address ($currency, $params = array ()) {
        $response = $this->fetch_deposit_address ($currency, array_merge (array (
            'renew' => 1,
        ), $params));
        return array (
            'currency' => $currency,
            'address' => $response['address'],
            'status' => 'ok',
            'info' => $response['info'],
        );
    }

    public function fetch_deposit_address ($currency, $params = array ()) {
        $name = $this->get_currency_name ($currency);
        $request = array (
            'method' => $name,
            'wallet_name' => 'exchange',
            'renew' => 0, // a value of 1 will generate a new address
        );
        $response = $this->privatePostDepositNew (array_merge ($request, $params));
        return array (
            'currency' => $currency,
            'address' => $response['address'],
            'status' => 'ok',
            'info' => $response,
        );
    }

    public function withdraw ($currency, $amount, $address, $tag = null, $params = array ()) {
        $name = $this->get_currency_name ($currency);
        $request = array (
            'withdraw_type' => $name,
            'walletselected' => 'exchange',
            'amount' => (string) $amount,
            'address' => $address,
        );
        if ($tag)
            $request['payment_id'] = $tag;
        $responses = $this->privatePostWithdraw (array_merge ($request, $params));
        $response = $responses[0];
        return array (
            'info' => $response,
            'id' => $response['withdrawal_id'],
        );
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = '/' . $this->implode_params($path, $params);
        if ($api === 'v2') {
            $request = '/' . $api . $request;
        } else {
            $request = '/' . $this->version . $request;
        }
        $query = $this->omit ($params, $this->extract_params($path));
        $url = $this->urls['api'] . $request;
        if (($api === 'public') || (mb_strpos ($path, '/hist') !== false)) {
            if ($query) {
                $suffix = '?' . $this->urlencode ($query);
                $url .= $suffix;
                $request .= $suffix;
            }
        }
        if ($api === 'private') {
            $this->check_required_credentials();
            $nonce = $this->nonce ();
            $query = array_merge (array (
                'nonce' => (string) $nonce,
                'request' => $request,
            ), $query);
            $query = $this->json ($query);
            $query = $this->encode ($query);
            $payload = base64_encode ($query);
            $secret = $this->encode ($this->secret);
            $signature = $this->hmac ($payload, $secret, 'sha384');
            $headers = array (
                'X-BFX-APIKEY' => $this->apiKey,
                'X-BFX-PAYLOAD' => $this->decode ($payload),
                'X-BFX-SIGNATURE' => $signature,
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if (strlen ($body) < 2)
            return;
        if ($code >= 400) {
            if ($body[0] === '{') {
                $response = json_decode ($body, $as_associative_array = true);
                if (is_array ($response) && array_key_exists ('message', $response)) {
                    $message = $response['message'];
                    $error = $this->id . ' ' . $message;
                    if (mb_strpos ($message, 'Key price should be a decimal number') !== false) {
                        throw new InvalidOrder ($error);
                    } else if (mb_strpos ($message, 'Invalid order => not enough exchange balance') !== false) {
                        throw new InsufficientFunds ($error);
                    } else if ($message === 'Order could not be cancelled.') {
                        throw new OrderNotFound ($error);
                    } else if (mb_strpos ($message, 'Invalid order') !== false) {
                        throw new InvalidOrder ($error);
                    } else if ($message === 'Order price must be positive.') {
                        throw new InvalidOrder ($error);
                    } else if (mb_strpos ($message, 'Key amount should be a decimal number') !== false) {
                        throw new InvalidOrder ($error);
                    } else if ($message === 'No such order found.') {
                        throw new OrderNotFound ($error);
                    } else if ($message === 'Could not find a key matching the given X-BFX-APIKEY.') {
                        throw new AuthenticationError ($error);
                    }
                } else if (is_array ($response) && array_key_exists ('error', $response)) {
                    $code = $response['error'];
                    $error = $this->id . ' ' . $code;
                    if ($code === 'ERR_RATE_LIMIT')
                        throw new DDoSProtection ($error);
                }
            }
        }
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (is_array ($response) && array_key_exists ('message', $response)) {
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}
