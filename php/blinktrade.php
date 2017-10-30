
class blinktrade extends Exchange {


    public function describe () {
        return array_replace_recursive (super.describe (), array (
            'id' => 'blinktrade',
            'name' => 'BlinkTrade',
            'countries' => array ( 'US', 'VE', 'VN', 'BR', 'PK', 'CL' ),
            'rateLimit' => 1000,
            'version' => 'v1',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27990968-75d9c884-6470-11e7-9073-46756c8e7e8c.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://blinktrade.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'array (currency)/ticker',    // ?crypto_currency=BTC
                        'array (currency)/orderbook', // ?crypto_currency=BTC
                        'array (currency)/trades',    // ?crypto_currency=BTC&since=<TIMESTAMP>&limit=<NUMBER>
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'D',   // order
                        'F',   // cancel order
                        'U2',  // balance
                        'U4',  // my orders
                        'U6',  // withdraw
                        'U18', // deposit
                        'U24', // confirm withdrawal
                        'U26', // list withdrawals
                        'U30', // list deposits
                        'U34', // ledger
                        'U70', // cancel withdrawal
                    ),
                ),
            ),
            'markets' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin' ),
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC' ),
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit' ),
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit' ),
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit' ),
            ),
        ));
    }

    public function fetch_balance ($params = array ()) {
        // todo parse balance
        return $this->privatePostU2 (array (
            'BalanceReqID' => $this->nonce (),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetCurrencyOrderbook (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $ticker = $this->publicGetCurrencyTicker (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        $timestamp = $this->milliseconds ();
        $lowercaseQuote = strtolower ($market['quote']);
        $quoteVolume = 'vol_' . $lowercaseQuote;
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
            'baseVolume' => floatval ($ticker['vol']),
            'quoteVolume' => floatval ($ticker[$quoteVolume]),
            'info' => $ticker,
        );
    }

    public function parse_trade ($trade, $market) {
        $timestamp = $trade['date'] * 1000;
        return array (
            'id' => $trade['tid'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['side'],
            'price' => $trade['price'],
            'amount' => $trade['amount'],
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetCurrencyTrades (array_merge (array (
            'currency' => $market['quote'],
            'crypto_currency' => $market['base'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        if ($type == 'market')
            throw new ExchangeError ($this->id . ' allows limit orders only');
        $market = $this->market ($symbol);
        $order = array (
            'ClOrdID' => $this->nonce (),
            'Symbol' => $market['id'],
            'Side' => $this->capitalize ($side),
            'OrdType' => '2',
            'Price' => $price,
            'OrderQty' => $amount,
            'BrokerID' => $market['brokerId'],
        );
        $response = $this->privatePostD (array_merge ($order, $params));
        $indexed = $this->index_by($response['Responses'], 'MsgType');
        $execution = $indexed['8'];
        return array (
            'info' => $response,
            'id' => $execution['OrderID'],
        );
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        return $this->privatePostF (array_merge (array (
            'ClOrdID' => $id,
        ), $params));
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api] . '/' . $this->version . '/' . $this->implode_params($path, $params);
        $query = $this->omit ($params, $this->extract_params($path));
        if ($api == 'public') {
            if ($query)
                $url .= '?' . $this->urlencode ($query);
        } else {
            $nonce = (string) $this->nonce ();
            $request = array_merge (array ( 'MsgType' => $path ), $query);
            $body = $this->json ($request);
            $headers = array (
                'APIKey' => $this->apiKey,
                'Nonce' => $nonce,
                'Signature' => $this->hmac ($this->encode ($nonce), $this->encode ($this->secret)),
                'Content-Type' => 'application/json',
            );
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('Status', $response))
            if ($response['Status'] != 200)
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
        return $response;
    }
}
