<?php

namespace ccxt;

include_once ('liqui.php');

class tidex extends liqui {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'tidex',
            'name' => 'Tidex',
            'countries' => 'UK',
            'rateLimit' => 2000,
            'version' => '3',
            // 'hasCORS' => false,
            // 'hasFetchTickers' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api' => array (
                    'public' => 'https://api.tidex.com/api',
                    'private' => 'https://api.tidex.com/tapi',
                ),
                'www' => 'https://tidex.com',
                'doc' => 'https://tidex.com/public-api',
                'fees' => 'https://tidex.com/pairs-spec',
            ),
            'fees' => array (
                'trading' => array (
                    'tierBased' => false,
                    'percentage' => true,
                    'taker' => 0.1 / 100,
                    'maker' => 0.1 / 100,
                ),
                'funding' => array (
                    'tierBased' => false,
                    'percentage' => false,
                    'withdraw' => array (
                        'BTC' => 0.0012,
                        'ETH' => 0.01,
                        'LTC' => 0.001,
                        'DOGE' => 0.01,
                        'ICN' => 2,
                        'DASH' => 0.002,
                        'GNO' => 2,
                        'EOS' => 2,
                        'BCH' => 2,
                        'USDT' => 0,
                    ),
                    'deposit' => array (
                        'BTC' => 0,
                        'ETH' => 0,
                        'LTC' => 0,
                        'DOGE' => 0,
                        'ICN' => 0,
                        'DASH' => 0,
                        'GNO' => 0,
                        'EOS' => 0,
                        'BCH' => 0,
                        'USDT' => 0,
                    ),
                ),
            ),
        ));
    }
}

?>