<?php

namespace ccxt;

include_once ('base/Exchange.php');

class vbtc extends blinktrade {

    public function describe () {
        return array_replace_recursive (parent::describe (), {
            'id' => 'vbtc',
            'name' => 'VBTC',
            'countries' => 'VN',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://vbtc.exchange',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/VND' => array ( 'id' => 'BTCVND', 'symbol' => 'BTC/VND', 'base' => 'BTC', 'quote' => 'VND', 'brokerId' => 3, 'broker' => 'VBTC' ),
            }
        ));
    }
}

?>