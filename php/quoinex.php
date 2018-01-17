<?php

namespace ccxt;

class quoinex extends qryptos {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'quoinex',
            'name' => 'QUOINEX',
            'countries' => array ( 'JP', 'SG', 'VN' ),
            'version' => '2',
            'rateLimit' => 1000,
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/35047114-0e24ad4a-fbaa-11e7-96a9-69c1a756083b.jpg',
                'api' => 'https://api.quoine.com',
                'www' => 'https://quoinex.com/',
                'doc' => array (
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ),
                'fees' => 'https://quoine.zendesk.com/hc/en-us/articles/115011281488-Fees',
            ),
        ));
    }
}
