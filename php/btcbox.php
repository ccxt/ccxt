<?php

namespace ccxt;

include_once ('base/Exchange.php');

class btcbox extends asia {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'btcbox',
            'name' => 'BtcBox',
            'countries' => 'JP',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
                'api' => 'https://www.btcbox.co.jp/api',
                'www' => 'https://www.btcbox.co.jp/',
                'doc' => 'https://www.btcbox.co.jp/help/asm',
            ),
            'markets' => array (
                'BTC/JPY' => array ( 'id' => 'BTC/JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
            ),
        ));
    }
}

?>