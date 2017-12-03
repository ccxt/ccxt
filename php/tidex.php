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
                'fees' => 'https://tidex.com/pairs-spec'
            ),
        ));
    }
}

?>