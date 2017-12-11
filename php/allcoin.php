<?php

namespace ccxt;

include_once ('okcoinusd.php');

class allcoin extends okcoinusd {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'allcoin',
            'name' => 'Allcoin',
            'countries' => 'CA',
            'hasCORS' => false,
            'extension' => '',
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
                'api' => array (
                    'web' => 'https://allcoin.com',
                    'public' => 'https://api.allcoin.com/api',
                    'private' => 'https://api.allcoin.com/api',
                ),
                'www' => 'https://allcoin.com',
                'doc' => 'https://allcoin.com/About/APIReference',
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'marketoverviews/',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'depth',
                        'kline',
                        'ticker',
                        'trades',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'batch_trade',
                        'cancel_order',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'repayment',
                        'trade',
                        'trade_history',
                        'userinfo',
                    ),
                ),
            ),
            'markets' => null,
        ));
    }

    public function fetch_markets () {
        // todo rewrite for https://www.allcoin.com/Home/MarketOverViewDetail/
        $currencies = array ( 'BTC', 'ETH', 'USD', 'QTUM', 'CNET', 'CK.USD' );
        $result = array ();
        for ($i = 0; $i < count ($currencies); $i++) {
            $currency = $currencies[$i];
            $response = $this->webGetMarketoverviews (array (
                'type' => 'full',
                'secondary' => $currency,
            ));
            $markets = $response['Markets'];
            for ($k = 0; $k < count ($markets); $k++) {
                $market = $markets[$k];
                $base = $market['Primary'];
                $quote = $market['Secondary'];
                $id = strtolower ($base) . '_' . strtolower ($quote);
                $symbol = $base . '/' . $quote;
                $result[] = array (
                    'id' => $id,
                    'symbol' => $symbol,
                    'base' => $base,
                    'quote' => $quote,
                    'type' => 'spot',
                    'spot' => true,
                    'future' => false,
                    'info' => $market,
                );
            }
        }
        return $result;
    }

    public function get_order_status ($status) {
        if ($status == -1)
            return 'canceled';
        if ($status == 0)
            return 'open';
        if ($status == 1)
            return 'partial';
        if ($status == 2)
            return 'closed';
        if ($status == 10)
            return 'canceled';
        return $status;
    }
}

?>