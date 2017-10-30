<?php

namespace ccxt;

include_once ('btce.php');

class wex extends btce {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'wex',
            'name' => 'WEX',
            'countries' => 'NZ', // New Zealand
            'version' => '3',
            'hasFetchTickers' => true,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg',
                'api' => array (
                    'public' => 'https://wex.nz/api',
                    'private' => 'https://wex.nz/tapi',
                ),
                'www' => 'https://wex.nz',
                'doc' => array (
                    'https://wex.nz/api/3/docs',
                    'https://wex.nz/tapi/docs',
                ),
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'info',
                        'ticker/array (pair)',
                        'depth/array (pair)',
                        'trades/array (pair)',
                    ),
                ),
                'private' => array (
                    'post' => array (
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ),
                ),
            ),
        ));
    }

    public function parse_ticker ($ticker, $market = null) {
        $timestamp = $ticker['updated'] * 1000;
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => $this->safe_float($ticker, 'high'),
            'low' => $this->safe_float($ticker, 'low'),
            'bid' => $this->safe_float($ticker, 'sell'),
            'ask' => $this->safe_float($ticker, 'buy'),
            'vwap' => null,
            'open' => null,
            'close' => null,
            'first' => null,
            'last' => $this->safe_float($ticker, 'last'),
            'change' => null,
            'percentage' => null,
            'average' => $this->safe_float($ticker, 'avg'),
            'baseVolume' => $this->safe_float($ticker, 'vol_cur'),
            'quoteVolume' => $this->safe_float($ticker, 'vol'),
            'info' => $ticker,
        );
    }
}

?>