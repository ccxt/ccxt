<?php

namespace ccxt;

include_once ('base/Exchange.php');

class surbitcoin extends blinktrade {

    public function describe () {
        return array_replace_recursive (parent::describe (), {
            'id' => 'surbitcoin',
            'name' => 'SurBitcoin',
            'countries' => 'VE',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://surbitcoin.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/VEF' => array ( 'id' => 'BTCVEF', 'symbol' => 'BTC/VEF', 'base' => 'BTC', 'quote' => 'VEF', 'brokerId' => 1, 'broker' => 'SurBitcoin' ),
            }
        ));
    }
}

?>