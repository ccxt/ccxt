<?php

namespace ccxt;

include_once ('base/Exchange.php');

class huobipro extends huobi1 {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'huobipro',
            'name' => 'Huobi Pro',
            'hostname' => 'api.huobi.pro',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api' => 'https://api.huobi.pro',
                'www' => 'https://www.huobi.pro',
                'doc' => 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            ),
        ));
    }
}

?>