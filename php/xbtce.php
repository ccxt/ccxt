<?php

namespace ccxt;

include_once ('base/Exchange.php');

class xbtce extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'xbtce',
            'name' => 'xBTCe',
            'countries' => 'RU',
            'rateLimit' => 2000, // responses are cached every 2 seconds
            'version' => 'v1',
            'hasPublicAPI' => false,
            'hasCORS' => false,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg',
                'api' => 'https://cryptottlivewebapi.xbtce.net:8443/api',
                'www' => 'https://www.xbtce.com',
                'doc' => array (
                    'https://www.xbtce.com/tradeapi',
                    'https://support.xbtce.info/Knowledgebase/Article/View/52/25/xbtce-exchange-api',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'currency',
                        'currency/array (filter)',
                        'level2',
                        'level2/array (filter)',
                        'quotehistory/array (symbol)/array (periodicity)/bars/ask',
                        'quotehistory/array (symbol)/array (periodicity)/bars/bid',
                        'quotehistory/array (symbol)/level2',
                        'quotehistory/array (symbol)/ticks',
                        'symbol',
                        'symbol/array (filter)',
                        'tick',
                        'tick/array (filter)',
                        'ticker',
                        'ticker/array (filter)',
                        'tradesession',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'tradeserverinfo',
                        'tradesession',
                        'currency',
                        'currency/array (filter)',
                        'level2',
                        'level2/array (filter)',
                        'symbol',
                        'symbol/array (filter)',
                        'tick',
                        'tick/array (filter)',
                        'account',
                        'asset',
                        'asset/array (id)',
                        'position',
                        'position/array (id)',
                        'trade',
                        'trade/array (id)',
                        'quotehistory/array (symbol)/array (periodicity)/bars/ask',
                        'quotehistory/array (symbol)/array (periodicity)/bars/ask/info',
                        'quotehistory/array (symbol)/array (periodicity)/bars/bid',
                        'quotehistory/array (symbol)/array (periodicity)/bars/bid/info',
                        'quotehistory/array (symbol)/level2',
                        'quotehistory/array (symbol)/level2/info',
                        'quotehistory/array (symbol)/periodicities',
                        'quotehistory/array (symbol)/ticks',
                        'quotehistory/array (symbol)/ticks/info',
                        'quotehistory/cache/array (symbol)/array (periodicity)/bars/ask',
                        'quotehistory/cache/array (symbol)/array (periodicity)/bars/bid',
                        'quotehistory/cache/array (symbol)/level2',
                        'quotehistory/cache/array (symbol)/ticks',
                        'quotehistory/symbols',
                        'quotehistory/version',
                    ),
                    'post' => array (
                        'trade',
                        'tradehistory',
                    ),
                    'put' => array (
                        'trade',
                    ),
                    'delete' => array (
                        'trade',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->privateGetSymbol ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $market = $markets[$p];
            $id = $market['Symbol'];
            $base = $market['MarginCurrency'];
            $quote = $market['ProfitCurrency'];
            if ($base == 'DSH')
                $base = 'DASH';
            $symbol = $base . '/' . $quote;
            $symbol = $market['IsTradeAllowed'] ? $symbol : $id;
            $result[] = array (
                'id' => $id,
                'symbol' => $symbol,
                'base' => $base,
                'quote' => $quote,
                'info' => $market,
            );
        }
        return $result;
    }

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privateGetAsset ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['Currency'];
            $uppercase = strtoupper ($currency);
            // xbtce names DASH incorrectly as DSH
            if ($uppercase == 'DSH')
                $uppercase = 'DASH';
            $account = array (
                'free' => $balance['FreeAmount'],
                'used' => $balance['LockedAmount'],
                'total' => $balance['Amount'],
            );
            $result[$uppercase] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $orderbook = $this->privateGetLevel2Filter (array_merge (array (
            'filter' => $market['id'],
        ), $params));
        $orderbook = $orderbook[0];
        $timestamp = $orderbook['Timestamp'];
        return $this->parse_order_book($orderbook, $timestamp, 'Bids', 'Asks', 'Price', 'Volume');
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = 0;
        $last = null;
        if (array_key_exists ('LastBuyTimestamp', $ticker))
            if ($timestamp < $ticker['LastBuyTimestamp']) {
                $timestamp = $ticker['LastBuyTimestamp'];
                $last = $ticker['LastBuyPrice'];
            }
        if (array_key_exists ('LastSellTimestamp', $ticker))
            if ($timestamp < $ticker['LastSellTimestamp']) {
                $timestamp = $ticker['LastSellTimestamp'];
                $last = $ticker['LastSellPrice'];
            }
        if (!$timestamp)
            $timestamp = $this->milliseconds ();
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $ticker['DailyBestBuyPrice'],
            'low' => $ticker['DailyBestSellPrice'],
            'bid' => $ticker['BestBid'],
            'ask' => $ticker['BestAsk'],
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $last,
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => $ticker['DailyTradedTotalVolume'],
            'quoteVolume' => null,
            'info' => $ticker,
        );
    }

    public function fetch_tickers ($symbols = null, $params = array ()) {
        $this->load_markets();
        $tickers = $this->publicGetTicker ($params);
        $tickers = $this->index_by($tickers, 'Symbol');
        $ids = array_keys ($tickers);
        $result = array ();
        for ($i = 0; $i < count ($ids); $i++) {
            $id = $ids[$i];
            $market = null;
            $symbol = null;
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            } else {
                $base = mb_substr ($id, 0, 3);
                $quote = mb_substr ($id, 3, 6);
                if ($base == 'DSH')
                    $base = 'DASH';
                if ($quote == 'DSH')
                    $quote = 'DASH';
                $symbol = $base . '/' . $quote;
            }
            $ticker = $tickers[$id];
            $result[$symbol] = $this->parse_ticker($ticker, $market);
        }
        return $result;
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $tickers = $this->publicGetTickerFilter (array_merge (array (
            'filter' => $market['id'],
        ), $params));
        $length = count ($tickers);
        if ($length < 1)
            throw new ExchangeError ($this->id . ' fetchTicker returned empty response, xBTCe public API error');
        $tickers = $this->index_by($tickers, 'Symbol');
        $ticker = $tickers[$market['id']];
        return $this->parse_ticker($ticker, $market);
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $this->load_markets();
        // no method for trades?
        return $this->privateGetTrade ($params);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv['Timestamp'],
            $ohlcv['Open'],
            $ohlcv['High'],
            $ohlcv['Low'],
            $ohlcv['Close'],
            $ohlcv['Volume'],
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        throw new NotSupported ($this->id . ' fetchOHLCV is disabled by the exchange');
        $minutes = intval ($timeframe / 60); // 1 minute by default
        $periodicity = (string) $minutes;
        $this->load_markets();
        $market = $this->market ($symbol);
        if (!$since)
            $since = $this->seconds () - 86400 * 7; // last day by defulat
        if (!$limit)
            $limit = 1000; // default
        $response = $this->privateGetQuotehistorySymbolPeriodicityBarsBid (array_merge (array (
            'symbol' => $market['id'],
            'periodicity' => $periodicity,
            'timestamp' => $since,
            'count' => $limit,
        ), $params));
        return $this->parse_ohlcvs($response['Bars'], $market, $timeframe, $since, $limit);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $response = $this->tapiPostTrade (array_merge (array (
            'pair' => $this->market_id($symbol),
            'type' => $side,
            'amount' => $amount,
            'rate' => $price,
        ), $params));
        return array (
            'info' => $response,
            'id' => (string) $response['Id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privateDeleteTrade (array_merge (array (
            'Type' => 'Cancel',
            'Id' => $id,
        ), $params));
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        if (!$this->apiKey)
            throw new AuthenticationError ($this->id . ' requires apiKey for all requests, their public API is always busy');
        if (!$this->uid)
            throw new AuthenticationError ($this->id . ' requires uid property for authentication and trading');
        $url = $this->urls['api'] . '/' . $this->version;
        if ($api == 'public')
            $url .= '/' . $api;
        $url .= '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $headers = array ( 'Accept-Encoding' => 'gzip, deflate' );
            $nonce = (string) $this->nonce ();
            if ($method == 'POST') {
                if ($query) {
                    $headers['Content-Type'] = 'application/json';
                    $body = $this->json ($query);
                }
                else
                    $url .= '?' . $this->urlencode ($query);
            }
            $auth = $nonce . $this->uid . $this->apiKey . $method . $url;
            if ($body)
                $auth .= $body;
            $signature = $this->hmac ($this->encode ($auth), $this->encode ($this->secret), 'sha256', 'base64');
            $credentials = $this->uid . ':' . $this->apiKey . ':' . $nonce . ':' . $this->binary_to_string($signature);
            $headers['Authorization'] = 'HMAC ' . $credentials;
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }
}

?>