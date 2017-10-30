<?php

namespace ccxt;

include_once ('base/Exchange.php');

class _1btcxe extends cryptocapital {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => '_1btcxe',
            'name' => '1BTCXE',
            'countries' => 'PA', // Panama
            'comment' => 'Crypto Capital API',
            'hasCORS' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api' => 'https://1btcxe.com/api',
                'www' => 'https://1btcxe.com',
                'doc' => 'https://1btcxe.com/api-docs.php',
            ),
            'markets' => array (
                'BTC/USD' => array ( 'id' => 'USD', 'symbol' => 'BTC/USD', 'base' => 'BTC', 'quote' => 'USD' ),
                'BTC/EUR' => array ( 'id' => 'EUR', 'symbol' => 'BTC/EUR', 'base' => 'BTC', 'quote' => 'EUR' ),
                'BTC/CNY' => array ( 'id' => 'CNY', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
                'BTC/RUB' => array ( 'id' => 'RUB', 'symbol' => 'BTC/RUB', 'base' => 'BTC', 'quote' => 'RUB' ),
                'BTC/CHF' => array ( 'id' => 'CHF', 'symbol' => 'BTC/CHF', 'base' => 'BTC', 'quote' => 'CHF' ),
                'BTC/JPY' => array ( 'id' => 'JPY', 'symbol' => 'BTC/JPY', 'base' => 'BTC', 'quote' => 'JPY' ),
                'BTC/GBP' => array ( 'id' => 'GBP', 'symbol' => 'BTC/GBP', 'base' => 'BTC', 'quote' => 'GBP' ),
                'BTC/CAD' => array ( 'id' => 'CAD', 'symbol' => 'BTC/CAD', 'base' => 'BTC', 'quote' => 'CAD' ),
                'BTC/AUD' => array ( 'id' => 'AUD', 'symbol' => 'BTC/AUD', 'base' => 'BTC', 'quote' => 'AUD' ),
                'BTC/AED' => array ( 'id' => 'AED', 'symbol' => 'BTC/AED', 'base' => 'BTC', 'quote' => 'AED' ),
                'BTC/BGN' => array ( 'id' => 'BGN', 'symbol' => 'BTC/BGN', 'base' => 'BTC', 'quote' => 'BGN' ),
                'BTC/CZK' => array ( 'id' => 'CZK', 'symbol' => 'BTC/CZK', 'base' => 'BTC', 'quote' => 'CZK' ),
                'BTC/DKK' => array ( 'id' => 'DKK', 'symbol' => 'BTC/DKK', 'base' => 'BTC', 'quote' => 'DKK' ),
                'BTC/HKD' => array ( 'id' => 'HKD', 'symbol' => 'BTC/HKD', 'base' => 'BTC', 'quote' => 'HKD' ),
                'BTC/HRK' => array ( 'id' => 'HRK', 'symbol' => 'BTC/HRK', 'base' => 'BTC', 'quote' => 'HRK' ),
                'BTC/HUF' => array ( 'id' => 'HUF', 'symbol' => 'BTC/HUF', 'base' => 'BTC', 'quote' => 'HUF' ),
                'BTC/ILS' => array ( 'id' => 'ILS', 'symbol' => 'BTC/ILS', 'base' => 'BTC', 'quote' => 'ILS' ),
                'BTC/INR' => array ( 'id' => 'INR', 'symbol' => 'BTC/INR', 'base' => 'BTC', 'quote' => 'INR' ),
                'BTC/MUR' => array ( 'id' => 'MUR', 'symbol' => 'BTC/MUR', 'base' => 'BTC', 'quote' => 'MUR' ),
                'BTC/MXN' => array ( 'id' => 'MXN', 'symbol' => 'BTC/MXN', 'base' => 'BTC', 'quote' => 'MXN' ),
                'BTC/NOK' => array ( 'id' => 'NOK', 'symbol' => 'BTC/NOK', 'base' => 'BTC', 'quote' => 'NOK' ),
                'BTC/NZD' => array ( 'id' => 'NZD', 'symbol' => 'BTC/NZD', 'base' => 'BTC', 'quote' => 'NZD' ),
                'BTC/PLN' => array ( 'id' => 'PLN', 'symbol' => 'BTC/PLN', 'base' => 'BTC', 'quote' => 'PLN' ),
                'BTC/RON' => array ( 'id' => 'RON', 'symbol' => 'BTC/RON', 'base' => 'BTC', 'quote' => 'RON' ),
                'BTC/SEK' => array ( 'id' => 'SEK', 'symbol' => 'BTC/SEK', 'base' => 'BTC', 'quote' => 'SEK' ),
                'BTC/SGD' => array ( 'id' => 'SGD', 'symbol' => 'BTC/SGD', 'base' => 'BTC', 'quote' => 'SGD' ),
                'BTC/THB' => array ( 'id' => 'THB', 'symbol' => 'BTC/THB', 'base' => 'BTC', 'quote' => 'THB' ),
                'BTC/TRY' => array ( 'id' => 'TRY', 'symbol' => 'BTC/TRY', 'base' => 'BTC', 'quote' => 'TRY' ),
                'BTC/ZAR' => array ( 'id' => 'ZAR', 'symbol' => 'BTC/ZAR', 'base' => 'BTC', 'quote' => 'ZAR' ),
            ),
        ));
    }
}

?>