
class gemini extends Exchange {


    public function describe () {
        return array_replace_recursive (super.describe (), array (
            'id' => 'gemini',
            'name' => 'Gemini',
            'countries' => 'US',
            'rateLimit' => 1500, // 200 for private API
            'version' => 'v1',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api' => 'https://api.gemini.com',
                'www' => 'https://gemini.com',
                'doc' => 'https://docs.gemini.com/rest-api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'symbols',
                        'pubticker/array (symbol)',
                        'book/array (symbol)',
                        'trades/array (symbol)',
                        'auction/array (symbol)',
                        'auction/array (symbol)/history',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'order/new',
                        'order/cancel',
                        'order/cancel/session',
                        'order/cancel/all',
                        'order/status',
                        'orders',
                        'mytrades',
                        'tradevolume',
                        'balances',
                        'deposit/array (currency)/newAddress',
                        'withdraw/array (currency)',
                        'heartbeat',
                    ),
                ),
            ),
        ));
    }

    public function fetch_markets () {
        $markets = $this->publicGetSymbols ();
        $result = array ();
        for ($p = 0; $p < count ($markets); $p++) {
            $id = $markets[$p];
            $market = $id;
            $uppercase = strtoupper ($market);
            $base = mb_substr ($uppercase, 0, 3);
            $quote = mb_substr ($uppercase, 3, 6);
            $symbol = $base . '/' . $quote;
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

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $orderbook = $this->publicGetBookSymbol (array_merge (array (
            'symbol' => $this->market_id($symbol),
        ), $params));
        return $this->parse_order_book($orderbook, null, 'bids', 'asks', 'price', 'amount');
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $this->load_markets();
        $market = $this->market ($symbol);
        $ticker = $this->publicGetPubtickerSymbol (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        $timestamp = $ticker['volume']['timestamp'];
        $baseVolume = $market['base'];
        $quoteVolume = $market['quote'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => null,
            'low' => null,
            'bid' => floatval ($ticker['bid']),
            'ask' => floatval ($ticker['ask']),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => floatval ($ticker['last']),
            'change' => null,
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume'][$baseVolume]),
            'quoteVolume' => floatval ($ticker['volume'][$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['timestampms'];
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

    public function fetch_balance ($params = array ()) {
        $this->load_markets();
        $balances = $this->privatePostBalances ();
        $result = array ( 'info' => $balances );
        for ($b = 0; $b < count ($balances); $b++) {
            $balance = $balances[$b];
            $currency = $balance['currency'];
            $account = array (
                'free' => floatval ($balance['available']),
                'used' => 0.0,
                'total' => floatval ($balance['amount']),
            );
            $account['used'] = $account['total'] - $account['free'];
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $this->load_markets();
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $order = array (
            'client_order_id' => $this->nonce (),
            'symbol' => $this->market_id($symbol),
            'amount' => (string) $amount,
            'price' => (string) $price,
            'side' => $side,
            'type' => 'exchange limit', // gemini allows limit orders only
        );
        $response = $this->privatePostOrderNew (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => $response['order_id'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        $this->load_markets();
        return $this->privatePostCancelOrder (array ( 'order_id' => $id ));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = $this->nonce ();
            $request = array_merge (array (
                'request' => $url,
                'nonce' => $nonce,
            ), $query);
            $payload = $this->json ($request);
            $payload = base64_encode ($this->encode ($payload));
            $signature = $this->hmac ($payload, $this->encode ($this->secret), 'sha384');
            $headers = array (
                'Content-Type' => 'text/plain',
                'X-GEMINI-APIKEY' => $this->apiKey,
                'X-GEMINI-PAYLOAD' => $payload,
                'X-GEMINI-SIGNATURE' => $signature,
            );
        }
        $url = $this->urls['api'] . $url;
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('result', $response))
            if ($response['result'] == 'error')
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}
