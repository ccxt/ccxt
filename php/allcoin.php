<?php

namespace ccxt;

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
                    'web' => 'https://www.allcoin.com',
                    'public' => 'https://api.allcoin.com/api',
                    'private' => 'https://api.allcoin.com/api',
                ),
                'www' => 'https://www.allcoin.com',
                'doc' => 'https://www.allcoin.com/About/APIReference',
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'Home/MarketOverViewDetail/',
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
        $result = array ();
        $response = $this->webGetHomeMarketOverViewDetail ();
        $coins = $response['marketCoins'];
        for ($j = 0; $j < count ($coins); $j++) {
            $markets = $coins[$j]['Markets'];
            for ($k = 0; $k < count ($markets); $k++) {
                $market = $markets[$k]['Market'];
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

    public function parse_order_status ($status) {
        if ($status === -1)
            return 'canceled';
        if ($status === 0)
            return 'open';
        if ($status === 1)
            return 'open'; // partially filled
        if ($status === 2)
            return 'closed';
        if ($status === 10)
            return 'canceled';
        return $status;
    }

    public function get_create_date_field () {
        // allcoin typo create_data instead of create_date
        return 'create_data';
    }

    public function get_orders_field () {
        // allcoin typo order instead of orders (expected based on their API docs)
        return 'order';
    }
}
