<?php

namespace ccxt;

class vbtc extends foxbit {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
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
        ));
    }
}
