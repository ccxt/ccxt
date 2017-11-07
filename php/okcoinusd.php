<?php

namespace ccxt;

include_once ('base/Exchange.php');

class okcoinusd extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'okcoinusd',
            'name' => 'OKCoin USD',
            'countries' => array ( 'CN', 'US' ),
            'hasCORS' => false,
            'version' => 'v1',
            'rateLimit' => 1000, // up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'hasFetchOHLCV' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'hasFetchClosedOrders' => true,
            'extension' => '.do', // appended to endpoint URL
            'timeframes' => array (
                '1m' => '1min',
                '3m' => '3min',
                '5m' => '5min',
                '15m' => '15min',
                '30m' => '30min',
                '1h' => '1hour',
                '2h' => '2hour',
                '4h' => '4hour',
                '6h' => '6hour',
                '12h' => '12hour',
                '1d' => '1day',
                '3d' => '3day',
                '1w' => '1week',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ),
                ),
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api' => array (
                    'web' => 'https://www.okcoin.com',
                    'public' => 'https://www.okcoin.com/api',
                    'private' => 'https://www.okcoin.com/api',
                ),
                'www' => 'https://www.okcoin.com',
                'doc' => array (
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ),
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'BTC/USDT' => array ( 'id' => 'btc_usdt', 'symbol' => 'BTC/USDT', 'base' => 'BTC', 'quote' => 'USDT', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'LTC/USD' => array ( 'id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/USD' => array ( 'id' => 'eth_usd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/USD' => array ( 'id' => 'etc_usd', 'symbol' => 'ETC/USD', 'base' => 'ETC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
            ),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Depth';
        $orderbook = $this->$method (array_merge ($request, $params));
        $timestamp = $this->milliseconds ();
        return array (
            'bids' => $orderbook['bids'],
            'asks' => $this->sort_by($orderbook['asks'], 0),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['timestamp'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
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

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Ticker';
        $response = $this->$method (array_merge ($request, $params));
        $timestamp = intval ($response['date']) * 1000;
        $ticker = array_merge ($response['ticker'], array ( 'timestamp' => $timestamp ));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market = null) {
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'info' => $trade,
            'timestamp' => $trade['date_ms'],
            'datetime' => $this->iso8601 ($trade['date_ms']),
            'symbol' => $symbol,
            'id' => (string) $trade['tid'],
            'order' => null,
            'type' => null,
            'side' => $trade['type'],
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['amount']),
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Trades';
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_trades($response, $market);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = 1440, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'publicGet';
        $request = array (
            'symbol' => $market['id'],
            'type' => $this->timeframes[$timeframe],
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'Kline';
        if ($limit)
            $request['size'] = intval ($limit);
        if ($since) {
            $request['since'] = $since;
        } else {
            $request['since'] = $this->milliseconds () - 86400000; // last 24 hours
        }
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $response = $this->privatePostUserinfo ();
        $balances = $response['info']['funds'];
        $result = array ( 'info' => $response );
        for ($c = 0; $c < count ($this->currencies); $c++) {
            $currency = $this->currencies[$c];
            $lowercase = strtolower ($currency);
            $account = $this->account ();
            $account['free'] = $this->safe_float($balances['free'], $lowercase, 0.0);
            $account['used'] = $this->safe_float($balances['freezed'], $lowercase, 0.0);
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $order = array (
            'symbol' => $market['id'],
            'type' => $side,
        );
        if ($market['future']) {
            $method .= 'Future';
            $order = array_merge ($order, array (
                'contract_type' => 'this_week', // next_week, quarter
                'match_price' => 0, // match best counter party $price? 0 or 1, ignores $price if 1
                'lever_rate' => 10, // leverage rate value => 10 or 20 (10 by default)
                'price' => $price,
                'amount' => $amount,
            ));
        } else {
            if ($type == 'limit') {
                $order['price'] = $price;
                $order['amount'] = $amount;
            } else {
                $order['type'] .= '_market';
                if ($side == 'buy') {
                    $order['price'] = $this->safe_float($params, 'cost');
                    if (!$order['price'])
                        throw new ExchangeError ($this->id . ' $market buy orders require an additional cost parameter, cost = $price * amount');
                } else {
                    $order['amount'] = $amount;
                }
            }
        }
        $params = $this->omit ($params, 'cost');
        $method .= 'Trade';
        $response = $this->$method (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder() requires a $symbol argument');
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'order_id' => $id,
        );
        $method = 'privatePost';
        if ($market['future']) {
            $method .= 'FutureCancel';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        } else {
            $method .= 'CancelOrder';
        }
        $response = $this->$method (array_merge ($request, $params));
        return $response;
    }

    public function parse_order_status ($status) {
        if ($status == -1)
            return 'canceled';
        if ($status == 0)
            return 'open';
        if ($status == 1)
            return 'partial';
        if ($status == 2)
            return 'closed';
        if ($status == 4)
            return 'canceled';
        return $status;
    }

    public function parse_order ($order, $market = null) {
        $side = null;
        $type = null;
        if (array_key_exists ('type', $order)) {
            if (($order['type'] == 'buy') || ($order['type'] == 'sell')) {
                $side = $order['type'];
                $type = 'limit';
            } else {
                $side = ($order['type'] == 'buy_market') ? 'buy' : 'sell';
                $type = 'market';
            }
        }
        $status = $this->parse_order_status($order['status']);
        $symbol = null;
        if (!$market) {
            if (array_key_exists ('symbol', $order))
                if (array_key_exists ($order['symbol'], $this->markets_by_id))
                    $market = $this->markets_by_id[$order['symbol']];
        }
        if ($market)
            $symbol = $market['symbol'];
        $timestamp = null;
        if (array_key_exists ('create_date', $order))
            $timestamp = $order['create_date'];
        $amount = $order['amount'];
        $filled = $order['deal_amount'];
        $remaining = $amount - $filled;
        $average = $order['avg_price'];
        $cost = $average * $filled;
        $result = array (
            'info' => $order,
            'id' => $order['order_id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => $type,
            'side' => $side,
            'price' => $order['price'],
            'average' => $average,
            'cost' => $cost,
            'amount' => $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . 'fetchOrders requires a $symbol parameter');
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $request = array (
            'order_id' => $id,
            'symbol' => $market['id'],
            // 'status' => 0, // 0 for unfilled orders, 1 for filled orders
            // 'current_page' => 1, // current page number
            // 'page_length' => 200, // number of orders returned per page, maximum 200
        );
        if ($market['future']) {
            $method .= 'Future';
            $request['contract_type'] = 'this_week'; // next_week, quarter
        }
        $method .= 'OrderInfo';
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_order($response['orders'][0]);
    }

    public function fetch_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . 'fetchOrders requires a $symbol parameter');
        $this->load_markets();
        $market = $this->market ($symbol);
        $method = 'privatePost';
        $request = array (
            'symbol' => $market['id'],
        );
        $order_id_in_params = (array_key_exists ('order_id', $params));
        if ($market['future']) {
            $method .= 'FutureOrdersInfo';
            $request['contract_type'] = 'this_week'; // next_week, quarter
            if (!$order_id_in_params)
                throw new ExchangeError ($this->id . ' fetchOrders() requires order_id param for futures $market ' . $symbol . ' (a string of one or more order ids, comma-separated)');
        } else {
            $type = $this->safe_value($params, 'type');
            $status = $this->safe_value($params, 'status');
            if ($type) {
                $status = $params['type'];
            } else if ($status) {
                $status = $params['status'];
            } else {
                throw new ExchangeError ($this->id . ' fetchOrders() requires $type param or $status param for spot $market ' . $symbol . ' (0 or "open" for unfilled orders, 1 or "closed" for filled orders)');
            }
            if ($status == 'open')
                $status = 0;
            if ($status == 'closed')
                $status = 1;
            if ($order_id_in_params) {
                $method .= 'OrdersInfo';
                $request = array_merge ($request, array (
                    'type' => $status,
                ));
            } else {
                $method .= 'OrderHistory';
                $request = array_merge ($request, array (
                    'status' => $status,
                    'current_page' => 1, // current page number
                    'page_length' => 200, // number of orders returned per page, maximum 200
                ));
            }
            $params = $this->omit ($params, array ( 'type', 'status' ));
        }
        $response = $this->$method (array_merge ($request, $params));
        return $this->parse_orders($response['orders'], $market);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $open = 0; // 0 for unfilled orders, 1 for filled orders
        return $this->fetch_orders($symbol, null, null, array_merge (array (
            'status' => $open,
        ), $params));
    }

    public function fetch_closed_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        $closed = 1; // 0 for unfilled orders, 1 for filled orders
        return $this->fetch_orders($symbol, null, null, array_merge (array (
            'status' => $closed,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/';
        if ($api != 'web')
            $url .= $this->version . '/';
        $url .= $path . $this->extension;
        if ($api == 'private') {
            $query = $this->keysort (array_merge (array (
                'api_key' => $this->apiKey,
            ), $params));
            // secret key must be at the end of $query
            $queryString = $this->rawencode ($query) . '&secret_key=' . $this->secret;
            $query['sign'] = strtoupper ($this->hash ($this->encode ($queryString)));
            $body = $this->urlencode ($query);
            $headers = array ( 'Content-Type' => 'application/x-www-form-urlencoded' );
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        $url = $this->urls['api'][$api] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if (!$response['result'])
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}

?>