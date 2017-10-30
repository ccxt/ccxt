<?php

namespace ccxt;

include_once ('base/Exchange.php');

class quoine extends qryptos {

    public function describe () {
        return array_replace_recursive (parent::describe (), {
            'id' => 'quoine',
            'name' => 'QUOINE',
            'countries' => array ( 'JP', 'SG', 'VN' ),
            'version' => '2',
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
                'api' => 'https://api.quoine.com',
                'www' => 'https://www.quoine.com',
                'doc' => 'https://developers.quoine.com',
            }
        ));
    }
}

?>