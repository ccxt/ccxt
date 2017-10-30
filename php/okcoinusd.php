<?php

namespace ccxt;

include_once ('okcoin.php');

class okcoinusd extends okcoin {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'okcoinusd',
            'name' => 'OKCoin USD',
            'countries' => array ( 'CN', 'US' ),
            'hasCORS' => false,
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
                'LTC/USD' => array ( 'id' => 'ltc_usd', 'symbol' => 'LTC/USD', 'base' => 'LTC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/USD' => array ( 'id' => 'eth_usd', 'symbol' => 'ETH/USD', 'base' => 'ETH', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/USD' => array ( 'id' => 'etc_usd', 'symbol' => 'ETC/USD', 'base' => 'ETC', 'quote' => 'USD', 'type' => 'spot', 'spot' => true, 'future' => false ),
            ),
        ));
    }
}

?>