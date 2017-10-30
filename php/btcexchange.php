
class btcexchange extends btctrader {


    public function describe () {
        return array_replace_recursive (super.describe (), array (
            'id' => 'btcexchange',
            'name' => 'BTCExchange',
            'countries' => 'PH', // Philippines
            'rateLimit' => 1500,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api' => 'https://www.btcexchange.ph/api',
                'www' => 'https://www.btcexchange.ph',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'markets' => array (
                'BTC/PHP' => array ( 'id' => 'BTC/PHP', 'symbol' => 'BTC/PHP', 'base' => 'BTC', 'quote' => 'PHP' ),
            ),
        ));
    }
}
