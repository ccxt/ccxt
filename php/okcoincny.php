<?php

namespace ccxt;

include_once ('base/Exchange.php');

class okcoincny extends okcoin {

    public function describe () {
        return array_replace_recursive (parent::describe (), {
            'id' => 'okcoincny',
            'name' => 'OKCoin CNY',
            'countries' => 'CN',
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
                'api' => array (
                    'web' => 'https://www.okcoin.cn',
                    'public' => 'https://www.okcoin.cn/pai',
                    'private' => 'https://www.okcoin.cn/api',
                ),
                'www' => 'https://www.okcoin.cn',
                'doc' => 'https://www.okcoin.cn/rest_getStarted.html',
            ),
            'markets' => array (
                'BTC/CNY' => array ( 'id' => 'btc_cny', 'symbol' => 'BTC/CNY', 'base' => 'BTC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'LTC/CNY' => array ( 'id' => 'ltc_cny', 'symbol' => 'LTC/CNY', 'base' => 'LTC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETH/CNY' => array ( 'id' => 'eth_cny', 'symbol' => 'ETH/CNY', 'base' => 'ETH', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'ETC/CNY' => array ( 'id' => 'etc_cny', 'symbol' => 'ETC/CNY', 'base' => 'ETC', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
                'BCH/CNY' => array ( 'id' => 'bcc_cny', 'symbol' => 'BCH/CNY', 'base' => 'BCH', 'quote' => 'CNY', 'type' => 'spot', 'spot' => true, 'future' => false ),
            }
        ));
    }
}

?>