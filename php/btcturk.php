<?php

namespace ccxt;

include_once ('btctrader.php');

class btcturk extends btctrader {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'btcturk',
            'name' => 'BTCTurk',
            'countries' => 'TR', // Turkey
            'rateLimit' => 1000,
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api' => 'https://www.btcturk.com/api',
                'www' => 'https://www.btcturk.com',
                'doc' => 'https://github.com/BTCTrader/broker-api-docs',
            ),
            'markets' => array (
                'BTC/TRY' => array ( 'id' => 'BTCTRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY' ),
                'ETH/TRY' => array ( 'id' => 'ETHTRY', 'symbol' => 'ETH/TRY', 'base' => 'ETH', 'quote' => 'TRY' ),
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC' ),
            ),
        ));
    }
}

?>