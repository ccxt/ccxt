<?php

namespace ccxt;

class fybsg extends fybse {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'fybsg',
            'name' => 'FYB-SG',
            'countries' => 'SG', // Singapore
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
                'api' => 'https://www.fybsg.com/api/SGD',
                'www' => 'https://www.fybsg.com',
                'doc' => 'http://docs.fyb.apiary.io',
            ),
            'markets' => array (
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
            ),
        ));
    }
}

