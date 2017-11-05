<?php

namespace ccxt;

include_once ('okcoinusd.php');

class okex extends okcoinusd {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'okex',
            'name' => 'OKEX',
            'countries' => array ( 'CN', 'US' ),
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg',
                'api' => array (
                    'www' => 'https://www.okex.com',
                    'public' => 'https://www.okex.com/api',
                    'private' => 'https://www.okex.com/api',
                ),
                'www' => 'https://www.okex.com',
                'doc' => 'https://www.okex.com/rest_getStarted.html',
            ),
            'markets' => array (                'BTC/USD' => array ( 'id' => 'btc_usd', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'type' => 'future', 'spot' => false, 'future' => true),
                'LTC/USD' => array ('id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'type' => 'future', 'spot' => false, 'future' => true),
                'LTC/BTC' => array ('id' => 'ltc_btc', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false),
                'ETH/BTC' => array ('id' => 'eth_btc', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false),
                'ETC/BTC' => array ('id' => 'etc_btc', 'symbol' => 'ETC/BTC', 'base' => 'ETC', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false),
                'BCH/BTC' => array ('id' => 'bcc_btc', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'type' => 'spot', 'spot' => true, 'future' => false),
            ),
        ));
    }
}

?>