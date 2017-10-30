<?php

namespace ccxt;

include_once ('base/Exchange.php');

class chilebit extends blinktrade {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'chilebit',
            'name' => 'ChileBit',
            'countries' => 'CL',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
                'api' => array (
                    'public' => 'https://api.blinktrade.com/api',
                    'private' => 'https://api.blinktrade.com/tapi',
                ),
                'www' => 'https://chilebit.net',
                'doc' => 'https://blinktrade.com/docs',
            ),
            'comment' => 'Blinktrade API',
            'markets' => array (
                'BTC/CLP' => array ( 'id' => 'BTCCLP', 'symbol' => 'BTC/CLP', 'base' => 'BTC', 'quote' => 'CLP', 'brokerId' => 9, 'broker' => 'ChileBit' ),
            ),
        ));
    }
}

?>