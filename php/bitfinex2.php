<?php

namespace ccxt;

include_once ('bitfinex.php');

class bitfinex2 extends bitfinex {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'bitfinex2',
            'name' => 'Bitfinex v2',
            'countries' => 'US',
            'version' => 'v2',
            'hasCORS' => true,
            // old metainfo interface
            'hasFetchOrder' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => true,
            'hasWithdraw' => true,
            'hasDeposit' => false,
            'hasFetchOpenOrders' => false,
            'hasFetchClosedOrders' => false,
            // new metainfo interface
            'has' => array (
                'fetchOHLCV' => true,
                'fetchTickers' => true,
                'fetchOrder' => true,
                'fetchOpenOrders' => false,
                'fetchClosedOrders' => false,
                'withdraw' => true,
                'deposit' => false,
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
            'rateLimit' => 1500,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api' => 'https://api.bitfinex.com',
                'www' => 'https://www.bitfinex.com',
                'doc' => array (
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ),
                'fees' => 'https://www.bitfinex.com/fees',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'symbols_details',
                        'stats1/{key}:{size}:{symbol}/{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/long/last',
                        'stats1/{key}:{size}:{symbol}/long/hist',
                        'stats1/{key}:{size}:{symbol}/short/last',
                        'stats1/{key}:{size}:{symbol}/short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ),
                    'post' => array (
                        'calc/trade/avg',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/positions',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                    ),
                ),
            ),
            'markets' => array (
                'AVT/BTC' => array ( 'id' => 'tAVTBTC', 'symbol' => 'AVT/BTC', 'base' => 'AVT', 'quote' => 'BTC' ),
                'AVT/ETH' => array ( 'id' => 'tAVTETH', 'symbol' => 'AVT/ETH', 'base' => 'AVT', 'quote' => 'ETH' ),
                'AVT/USD' => array ( 'id' => 'tAVTUSD', 'symbol' => 'AVT/USD', 'base' => 'AVT', 'quote' => 'USD' ),
                'CST_BCC/BTC' => array ( 'id' => 'tBCCBTC', 'symbol' => 'CST_BCC/BTC', 'base' => 'CST_BCC', 'quote' => 'BTC' ),
                'CST_BCC/USD' => array ( 'id' => 'tBCCUSD', 'symbol' => 'CST_BCC/USD', 'base' => 'CST_BCC', 'quote' => 'USD' ),
                'BCH/BTC' => array ( 'id' => 'tBCHBTC', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC' ),
                'BCH/ETH' => array ( 'id' => 'tBCHETH', 'symbol' => 'BCH/ETH', 'base' => 'BCH', 'quote' => 'ETH' ),
                'BCH/USD' => array ( 'id' => 'tBCHUSD', 'symbol' => 'BCH/USD', 'base' => 'BCH', 'quote' => 'USD' ),
                'CST_BCU/BTC' => array ( 'id' => 'tBCUBTC', 'symbol' => 'CST_BCU/BTC', 'base' => 'CST_BCU', 'quote' => 'BTC' ),
                'CST_BCU/USD' => array ( 'id' => 'tBCUUSD', 'symbol' => 'CST_BCU/USD', 'base' => 'CST_BCU', 'quote' => 'USD' ),
                'BT1/BTC' => array ( 'id' => 'tBT1BTC', 'symbol' => 'BT1/BTC', 'base' => 'BT1', 'quote' => 'BTC' ),
                'BT1/USD' => array ( 'id' => 'tBT1USD', 'symbol' => 'BT1/USD', 'base' => 'BT1', 'quote' => 'USD' ),
                'BT2/BTC' => array ( 'id' => 'tBT2BTC', 'symbol' => 'BT2/BTC', 'base' => 'BT2', 'quote' => 'BTC' ),
                'BT2/USD' => array ( 'id' => 'tBT2USD', 'symbol' => 'BT2/USD', 'base' => 'BT2', 'quote' => 'USD' ),
                'BTC/USD' => array ( 'id' => 'tBTCUSD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'tBTCEUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTG/BTC' => array ( 'id' => 'tBTGBTC', 'symbol' => 'BTG/BTC', 'base' => 'BTG', 'quote' => 'BTC' ),
                'BTG/USD' => array ( 'id' => 'tBTGUSD', 'symbol' => 'BTG/USD', 'base' => 'BTG', 'quote' => 'USD' ),
                'DASH/BTC' => array ( 'id' => 'tDSHBTC', 'symbol' => 'DASH/BTC', 'base' => 'DASH', 'quote' => 'BTC' ),
                'DASH/USD' => array ( 'id' => 'tDSHUSD', 'symbol' => 'DASH/USD', 'base' => 'DASH', 'quote' => 'USD' ),
                'DAT/BTC' => array ( 'id' => 'tDATBTC', 'symbol' => 'DAT/BTC', 'base' => 'DAT', 'quote' => 'BTC' ),
                'DAT/ETH' => array ( 'id' => 'tDATETH', 'symbol' => 'DAT/ETH', 'base' => 'DAT', 'quote' => 'ETH' ),
                'DAT/USD' => array ( 'id' => 'tDATUSD', 'symbol' => 'DAT/USD', 'base' => 'DAT', 'quote' => 'USD' ),
                'EDO/BTC' => array ( 'id' => 'tEDOBTC', 'symbol' => 'EDO/BTC', 'base' => 'EDO', 'quote' => 'BTC' ),
                'EDO/ETH' => array ( 'id' => 'tEDOETH', 'symbol' => 'EDO/ETH', 'base' => 'EDO', 'quote' => 'ETH' ),
                'EDO/USD' => array ( 'id' => 'tEDOUSD', 'symbol' => 'EDO/USD', 'base' => 'EDO', 'quote' => 'USD' ),
                'EOS/BTC' => array ( 'id' => 'tEOSBTC', 'symbol' => 'EOS/BTC', 'base' => 'EOS', 'quote' => 'BTC' ),
                'EOS/ETH' => array ( 'id' => 'tEOSETH', 'symbol' => 'EOS/ETH', 'base' => 'EOS', 'quote' => 'ETH' ),
                'EOS/USD' => array ( 'id' => 'tEOSUSD', 'symbol' => 'EOS/USD', 'base' => 'EOS', 'quote' => 'USD' ),
                'ETC/BTC' => array ( 'id' => 'tETCBTC', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC' ),
                'ETC/USD' => array ( 'id' => 'tETCUSD', 'symbol' => 'ETC/USD', 'base' => 'ETC', 'quote' => 'USD' ),
                'ETH/BTC' => array ( 'id' => 'tETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
                'ETH/USD' => array ( 'id' => 'tETHUSD', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD' ),
                'ETP/BTC' => array ( 'id' => 'tETPBTC', 'symbol' => 'ETP/BTC', 'base' => 'ETP', 'quote' => 'BTC' ),
                'ETP/ETH' => array ( 'id' => 'tETPETH', 'symbol' => 'ETP/ETH', 'base' => 'ETP', 'quote' => 'ETH' ),
                'ETP/USD' => array ( 'id' => 'tETPUSD', 'symbol' => 'ETP/USD', 'base' => 'ETP', 'quote' => 'USD' ),
                'IOT/BTC' => array ( 'id' => 'tIOTBTC', 'symbol' => 'IOT/BTC', 'base' => 'IOT', 'quote' => 'BTC' ),
                'IOT/ETH' => array ( 'id' => 'tIOTETH', 'symbol' => 'IOT/ETH', 'base' => 'IOT', 'quote' => 'ETH' ),
                'IOT/USD' => array ( 'id' => 'tIOTUSD', 'symbol' => 'IOT/USD', 'base' => 'IOT', 'quote' => 'USD' ),
                'LTC/BTC' => array ( 'id' => 'tLTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC' ),
                'LTC/USD' => array ( 'id' => 'tLTCUSD', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD' ),
                'NEO/BTC' => array ( 'id' => 'tNEOBTC', 'symbol' => 'NEO/BTC', 'base' => 'NEO', 'quote' => 'BTC' ),
                'NEO/ETH' => array ( 'id' => 'tNEOETH', 'symbol' => 'NEO/ETH', 'base' => 'NEO', 'quote' => 'ETH' ),
                'NEO/USD' => array ( 'id' => 'tNEOUSD', 'symbol' => 'NEO/USD', 'base' => 'NEO', 'quote' => 'USD' ),
                'OMG/BTC' => array ( 'id' => 'tOMGBTC', 'symbol' => 'OMG/BTC', 'base' => 'OMG', 'quote' => 'BTC' ),
                'OMG/ETH' => array ( 'id' => 'tOMGETH', 'symbol' => 'OMG/ETH', 'base' => 'OMG', 'quote' => 'ETH' ),
                'OMG/USD' => array ( 'id' => 'tOMGUSD', 'symbol' => 'OMG/USD', 'base' => 'OMG', 'quote' => 'USD' ),
                'QTUM/BTC' => array ( 'id' => 'tQTMBTC', 'symbol' => 'QTUM/BTC', 'base' => 'QTUM', 'quote' => 'BTC' ),
                'QTUM/ETH' => array ( 'id' => 'tQTMETH', 'symbol' => 'QTUM/ETH', 'base' => 'QTUM', 'quote' => 'ETH' ),
                'QTUM/USD' => array ( 'id' => 'tQTMUSD', 'symbol' => 'QTUM/USD', 'base' => 'QTUM', 'quote' => 'USD' ),
                'RRT/BTC' => array ( 'id' => 'tRRTBTC', 'symbol' => 'RRT/BTC', 'base' => 'RRT', 'quote' => 'BTC' ),
                'RRT/USD' => array ( 'id' => 'tRRTUSD', 'symbol' => 'RRT/USD', 'base' => 'RRT', 'quote' => 'USD' ),
                'SAN/BTC' => array ( 'id' => 'tSANBTC', 'symbol' => 'SAN/BTC', 'base' => 'SAN', 'quote' => 'BTC' ),
                'SAN/ETH' => array ( 'id' => 'tSANETH', 'symbol' => 'SAN/ETH', 'base' => 'SAN', 'quote' => 'ETH' ),
                'SAN/USD' => array ( 'id' => 'tSANUSD', 'symbol' => 'SAN/USD', 'base' => 'SAN', 'quote' => 'USD' ),
                'XMR/BTC' => array ( 'id' => 'tXMRBTC', 'symbol' => 'XMR/BTC', 'base' => 'XMR', 'quote' => 'BTC' ),
                'XMR/USD' => array ( 'id' => 'tXMRUSD', 'symbol' => 'XMR/USD', 'base' => 'XMR', 'quote' => 'USD' ),
                'XRP/BTC' => array ( 'id' => 'tXRPBTC', 'symbol' => 'XRP/BTC', 'base' => 'XRP', 'quote' => 'BTC' ),
                'XRP/USD' => array ( 'id' => 'tXRPUSD', 'symbol' => 'XRP/USD', 'base' => 'XRP', 'quote' => 'USD' ),
                'ZEC/BTC' => array ( 'id' => 'tZECBTC', 'symbol' => 'ZEC/BTC', 'base' => 'ZEC', 'quote' => 'BTC' ),
                'ZEC/USD' => array ( 'id' => 'tZECUSD', 'symbol' => 'ZEC/USD', 'base' => 'ZEC', 'quote' => 'USD' ),
            ),
            'fees' => array (
                'trading' => array (
                    'maker' => 0.1 / 100,
                    'taker' => 0.2 / 100,
                ),
                'funding' => array (
                    'withdraw' => array (
                        'BTC' => 0.0005,
                        'BCH' => 0.0005,
                        'ETH' => 0.01,
                        'EOS' => 0.1,
                        'LTC' => 0.001,
                        'OMG' => 0.1,
                        'IOT' => 0.0,
                        'NEO' => 0.0,
                        'ETC' => 0.01,
                        'XRP' => 0.02,
                        'ETP' => 0.01,
                        'ZEC' => 0.001,
                        'BTG' => 0.0,
                        'DASH' => 0.01,
                        'XMR' => 0.04,
                        'QTM' => 0.01,
                        'EDO' => 0.5,
                        'DAT' => 1.0,
                        'AVT' => 0.5,
                        'SAN' => 0.1,
                        'USDT' => 5.0,
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
        // issue #796
        if ($currency == 'IOT')
            return 'IOTA';
        return $currency;
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privatePostAuthRWallets ();
        $balanceType = $this->safe_string($params, 'type', 'exchange');
        $result = array ( 'info' => $response );
        for ($b = 0; $b < count ($response); $b++) {
            $balance = $response[$b];
            list ($accountType, $currency, $total, $interest, $available) = $balance;
            if ($accountType == $balanceType) {
                if ($currency[0] == 't')
                    $currency = mb_substr ($currency, 1);
                $uppercase = strtoupper ($currency);
                $uppercase = $this->common_currency_code($uppercase);
                $account = $this->account ();
                $account['free'] = $available;
                $account['total'] = $total;
                if ($account['free'])
                    $account['used'] = $account['total'] - $account['free'];
                $result[$uppercase] = $account;
            }
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $orderbook = $this->publicGetBookSymbolPrecision (array_merge (array (
            'symbol' => $this->market_id($symbol),
            'precision' => 'R0',
        ), $params));
        $timestamp = $this->milliseconds ();
        $result = array (
            'bids' => array (),
            'asks' => array (),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
        );
        for ($i = 0; $i < count ($orderbook); $i++) {
            $order = $orderbook[$i];
            $price = $order[1];
            $amount = $order[2];
            $side = ($amount > 0) ? 'bids' : 'asks';
            $amount = abs ($amount);
            $result[$side][] = array ( $price, $amount );
        }
        $result['bids'] = $this->sort_by($result['bids'], 0, true);
        $result['asks'] = $this->sort_by($result['asks'], 0);
        return $result;
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        $length = count ($ticker);
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker[$length - 2],
            'low' => $ticker[$length - 1],
            'bid' => $ticker[$length - 10],
            'ask' => $ticker[$length - 8],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $ticker[$length - 4],
            'change' => $ticker[$length - 6],
            'percentage' => $ticker[$length - 5],
            'average' => null,
            'baseVolume' => $ticker[$length - 3],
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $tickers = $this->publicGetTickers (array_merge (array (
            'symbols' => implode (',', $this->ids),
        ), $params));
        $result = array ();
        for ($i = 0; $i < count ($tickers); $i++) {
            $ticker = $tickers[$i];
            $id = $ticker[0];
            $market = $this->markets_by_id[$id];
            $symbol = $market['symbol'];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->markets[$symbol];
        $ticker = $this->publicGetTickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($ticker, $market);
    }

    public function parse_trade ($trade, $market) {
        list ($id, $timestamp, $amount, $price) = $trade;
        $side = ($amount < 0) ? 'sell' : 'buy';
        return array (
            'id' => (string) $id,
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $side,
            'price' => $price,
            'amount' => $amount,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
        );
        if ($since) {
            $request['start'] = $since;
        }
        if ($limit) {
            $request['limit'] = $limit;
        }
        $response = $this->publicGetTradesSymbolHist (array_merge ($request, $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'timeframe' => $this->timeframes[$timeframe],
        );
        if ($limit)
            $request['limit'] = $limit;
        if ($since)
            $request['start'] = $since;
        $request = array_merge ($request, $params);
        $response = $this->publicGetCandlesTradeTimeframeSymbolHist ($request);
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported ($this->id . ' createOrder not implemented yet');
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' cancelOrder not implemented yet');
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetchOrder not implemented yet');
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        throw new NotSupported ($this->id . ' withdraw not implemented yet');
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $request = $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        $url = $this->urls['api'] . '/' . $request;
        if ($api == 'public') {
            if ($query) {
                $url .= '?' . $this->urlencode ($query);
            }
        } else {
            $this->check_required_credentials();
            $nonce = (string) $this->nonce ();
            $body = $this->json ($query);
            $auth = '/api' . '/' . $request . $nonce . $body;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha384');
            $headers = array (
                'bfx-nonce' => $nonce,
                'bfx-apikey' => $this->apiKey,
                'bfx-signature' => $signature,
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if ($response) {
            if (array_key_exists ('message', $response)) {
                if (mb_strpos ($response['message'], 'not enough exchange balance') !== false)
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
            return $response;
        } else if ($response == '') {
            throw new ExchangeError ($this->id . ' returned empty response');
        }
        return $response;
    }
}

?>