<?php

namespace ccxt;

include_once ('blinktrade.php');

class foxbit extends blinktrade {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'foxbit',
            'name' => 'FoxBit',
            'countries' => 'BR',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://foxbit.exchange',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/BRL' => array ( 'id' => 'BTCBRL', 'symbol' => 'BTC/BRL', 'base' => 'BTC', 'quote' => 'BRL', 'brokerId' => 4, 'broker' => 'FoxBit' ),
            ),
        ));
    }
}

?>