
class bitfinex extends Exchange {


    public function describe () {
        return array_replace_recursive (super.describe (), array (
            'id' => 'bitfinex',
            'name' => 'Bitfinex',
            'countries' => 'US',
            'version' => 'v1',
            'rateLimit' => 1500,
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'hasFetchTickers' => false,
            'hasDeposit' => true,
            'hasWithdraw' => true,
            'hasFetchOHLCV' => true,
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
                        'candles/trade:array (timeframe):array (symbol)/array (section)',
                        'candles/trade:array (timeframe):array (symbol)/last',
                        'candles/trade:array (timeframe):array (symbol)/hist',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'book/array (symbol)',
                        // 'candles/array (symbol)',
                        'lendbook/array (currency)',
                        'lends/array (currency)',
                        'pubticker/array (symbol)',
                        'stats/array (symbol)',
                        'symbols',
                        'symbols_details',
                        'today',
                        'trades/array (symbol)',
                    ),
                ),
                'private' => array (
                    'post' => array (
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
        ));
    }

    public function common_currency_code ($currency) {
        // issue #4 Bitfinex names Dash as DSH, instead of DASH
        if ($currency == 'DSH')
            return 'DASH';
        if ($currency == 'QTM')
            return 'QTUM';
        return $currency;
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
            );
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'baseId' => $baseId,
                'quoteId' => $quoteId,
                'info' => $market,
                'precision' => $precision,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostBalances ();
        $result = array ( 'info' => $balances );
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            if ($balance['type'] == 'exchange') {
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

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $ticker = $this->publicGetPubtickerSymbol (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        $timestamp = floatval ($ticker['timestamp']) * 1000;
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
        $timestamp = $trade['timestamp'] * 1000;
        return array (
            'id' => (string) $trade['tid'],
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

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $response = $this->publicGetTradesSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        $orderType = $type;
        if (($type == 'limit') || ($type == 'market'))
            $orderType = 'exchange ' . $type;
        $order = array (
            'symbol' => $this->market_id($symbol),
            'amount' => (string) $amount,
            'side' => $side,
            'type' => $orderType,
            'ocoorder' => false,
            'buy_price_oco' => 0,
            'sell_price_oco' => 0,
        );
        if ($type == 'market') {
            $order['price'] = (string) $this->nonce ();
        } else {
            $order['price'] = (string) $price;
        }
        $result = $this->privatePostOrderNew (array_merge ($order, $params));
        return array (
            'info' => $result,
            'id' => (string) $result['order_id'],
        );
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
            if (array_key_exists ($exchange, $this->markets_by_id)) {
                $market = $this->markets_by_id[$exchange];
            }
        }
        if ($market)
            $symbol = $market['symbol'];
        $orderType = $order['type'];
        $exchange = mb_strpos ($orderType, 'exchange ') !== false;
        if ($exchange) {
            list ($prefix, $orderType) = explode (' ', $order['type']);
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
            'price' => floatval ($order['price']),
            'average' => floatval ($order['avg_execution_price']),
            'amount' => floatval ($order['original_amount']),
            'remaining' => floatval ($order['remaining_amount']),
            'filled' => floatval ($order['executed_amount']),
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostOrders ($params);
        return $this->parse_orders($response);
    }

    public function fetch_closed_orders ($symbol = null, $params = array ()) {
        $this->load_markets();
        $response = $this->privatePostOrdersHist (array_merge (array (
            'limit' => 100, // default 100
        ), $params));
        return $this->parse_orders($response);
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
        $market = $this->market ($symbol);
        $v2id = 't' . $market['id'];
        $request = array (
            'symbol' => $v2id,
            'timeframe' => $this->timeframes[$timeframe],
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
        if ($currency == 'BTC') {
            return 'bitcoin';
        } else if ($currency == 'LTC') {
            return 'litecoin';
        } else if ($currency == 'ETH') {
            return 'ethereum';
        } else if ($currency == 'ETC') {
            return 'ethereumc';
        } else if ($currency == 'OMNI') {
            return 'mastercoin'; // ???
        } else if ($currency == 'ZEC') {
            return 'zcash';
        } else if ($currency == 'XMR') {
            return 'monero';
        } else if ($currency == 'USD') {
            return 'wire';
        } else if ($currency == 'DASH') {
            return 'dash';
        } else if ($currency == 'XRP') {
            return 'ripple';
        } else if ($currency == 'EOS') {
            return 'eos';
        }
        throw new NotSupported ($this->id . ' ' . $currency . ' not supported for withdrawal');
    }

    public function deposit ($currency, $params = array ()) {
        $this->load_markets();
        $name = $this->getCurrencyName ($currency);
        $request = array (
            'method' => $name,
            'wallet_name' => 'exchange',
            'renew' => 0, // a value of 1 will generate a new address
        );
        $response = $this->privatePostDepositNew (array_merge ($request, $params));
        return array (
            'info' => $response,
            'address' => $response['address'],
        );
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $this->load_markets();
        $name = $this->getCurrencyName ($currency);
        $request = array (
            'withdraw_type' => $name,
            'walletselected' => 'exchange',
            'amount' => (string) $amount,
            'address' => $address,
        );
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
        if ($api == 'v2') {
            $request = '/' . $api . $request;
        } else {
            $request = '/' . $this->version . $request;
        }
        $query = $this->omit ($params, $this->extract_params($path));
        $url = $this->urls['api'] . $request;
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
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

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('message', $response)) {
            if (mb_strpos ($response['message'], 'not enough exchange balance') !== false)
                throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
            throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        }
        return $response;
    }
}
