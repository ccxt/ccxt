<?php

namespace ccxt;

class getbtc extends _1btcxe {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'getbtc',
            'name' => 'GetBTC',
            'countries' => array ( 'VC', 'RU' ), // Saint Vincent and the Grenadines, Russia, CIS
            'rateLimit' => 1000,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/33801902-03c43462-dd7b-11e7-992e-077e4cd015b9.jpg',
                'api' => 'https://getbtc.org/api',
                'www' => 'https://getbtc.org',
                'doc' => 'https://getbtc.org/api-docs.php',
            ),
            'markets' => array (
                'BTC/EUR' => array ( 'id' => 'EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR', 'precision' => array ( 'amount' => 8, 'price' => 8 ), 'lot' => 0.00000001, 'limits' => array ( 'amount' => array ( 'min' => 0.00000001, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ))),
                'BTC/RUB' => array ( 'id' => 'RUB', 'symbol' => 'BTC/RUB', 'base' => 'BTC', 'quote' => 'RUB', 'precision' => array ( 'amount' => 8, 'price' => 8 ), 'lot' => 0.00000001, 'limits' => array ( 'amount' => array ( 'min' => 0.00000001, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ))),
                'BTC/USD' => array ( 'id' => 'USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD', 'precision' => array ( 'amount' => 8, 'price' => 8 ), 'lot' => 0.00000001, 'limits' => array ( 'amount' => array ( 'min' => 0.00000001, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ))),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.20 / 100,
                    'maker' => 0.20 / 100,
                ),
            ),
        ));
    }
}

