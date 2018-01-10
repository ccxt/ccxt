<?php

namespace ccxt;

class gateio extends bter {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'gateio',
            'name' => 'Gate.io',
            'countries' => 'CN',
            'rateLimit' => 1000,
            'hasCORS' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api' => array (
                    'public' => 'https://data.gate.io/api',
                    'private' => 'https://data.gate.io/api',
                ),
                'www' => 'https://gate.io/',
                'doc' => 'https://gate.io/api2',
                'fees' => 'https://gate.io/fee',
            ),
        ));
    }

    public function parse_trade ($trade, $market) {
        // exchange reports local time (UTC+8)
        $timestamp = $this->parse8601 ($trade['date']) - 8 * 60 * 60 * 1000;
        return array (
            'id' => $trade['tradeID'],
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'type' => null,
            'side' => $trade['type'],
            'price' => $trade['rate'],
            'amount' => $this->safe_float($trade, 'amount'),
        );
    }
}
