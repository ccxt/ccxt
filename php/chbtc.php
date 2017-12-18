<?php

namespace ccxt;

class chbtc extends zb {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'chbtc',
            'name' => 'CHBTC',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            'hasFetchOrder' => true,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api' => array (
                    'public' => 'http://api.chbtc.com/data', // no https for public API
                    'private' => 'https://trade.chbtc.com/api',
                ),
                'www' => 'https://trade.chbtc.com/api',
                'doc' => 'https://www.chbtc.com/i/developer',
            ),
        ));
    }

    public function get_market_field_name () {
        return 'currency';
    }

    public function fetch_markets () {
        return array (
            'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY' ),
            'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY' ),
            'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY' ),
            'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY' ),
            'BTS/CNY' => array ( 'id' => 'bts_cny', 'symbol' => 'BTS/CNY', 'base' => 'BTS', 'quote' => 'CNY' ),
            // 'EOS/CNY' => array ( 'id' => 'eos_cny', 'symbol' => 'EOS/CNY', 'base' => 'EOS', 'quote' => 'CNY' ),
            'BCH/CNY' => array ( 'id' => 'bcc_cny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY' ),
            'HSR/CNY' => array ( 'id' => 'hsr_cny', 'symbol' => 'HSR/CNY', 'base' => 'HSR', 'quote' => 'CNY' ),
            'QTUM/CNY' => array ( 'id' => 'qtum_cny', 'symbol' => 'QTUM/CNY', 'base' => 'QTUM', 'quote' => 'CNY' ),
        );
    }
}
