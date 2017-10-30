
class bleutrade extends bittrex {


    public function describe () {
        return array_replace_recursive (super.describe (), array (
            'id' => 'bleutrade',
            'name' => 'Bleutrade',
            'countries' => 'BR', // Brazil
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => true,
            'hasFetchTickers' => true,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api' => array (
                    'public' => 'https://bleutrade.com/api',
                    'account' => 'https://bleutrade.com/api',
                    'market' => 'https://bleutrade.com/api',
                ),
                'www' => 'https://bleutrade.com',
                'doc' => 'https://bleutrade.com/help/API',
            ),
        ));
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $this->load_markets();
        $response = $this->publicGetOrderbook (array_merge (array (
            'market' => $this->market_id($symbol),
            'type' => 'ALL',
            'depth' => 50,
        ), $params));
        $orderbook = $response['result'];
        return $this->parse_order_book($orderbook, null, 'buy', 'sell', 'Rate', 'Quantity');
    }
}
