<?php

namespace ccxt;

include_once ('blinktrade.php');

class urdubit extends blinktrade {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'urdubit',
            'name' => 'UrduBit',
            'countries' => 'PK',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://urdubit.com',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/PKR' => array ( 'id' => 'BTCPKR', 'symbol' => 'BTC/PKR', 'base' => 'BTC', 'quote' => 'PKR', 'brokerId' => 8, 'broker' => 'UrduBit' ),
            ),
        ));
    }
}

?>