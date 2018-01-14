<?php

namespace ccxt;

class kuna extends acx {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'kuna',
            'name' => 'Kuna',
            'countries' => 'UA',
            'rateLimit' => 1000,
            'version' => 'v2',
            'hasCORS' => false,
            'hasFetchTickers' => false,
            'hasFetchOHLCV' => false,
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
                'api' => 'https://kuna.io',
                'www' => 'https://kuna.io',
                'doc' => 'https://kuna.io/documents/api',
                'fees' => 'https://kuna.io/documents/api',
            ),
            'api' => array (
                'public' => array (
                    'get' => array (
                        'tickers/{market}',
                        'order_book',
                        'order_book/{market}',
                        'trades',
                        'trades/{market}',
                        'timestamp',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'members/me',
                        'orders',
                        'trades/my',
                    ),
                    'post' => array (
                        'orders',
                        'order/delete',
                    ),
                ),
            ),
            'markets' => array (
                'BTC/UAH' => array ( 'id' => 'btcuah', 'symbol' => 'BTC/UAH', 'base' => 'BTC', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'ETH/UAH' => array ( 'id' => 'ethuah', 'symbol' => 'ETH/UAH', 'base' => 'ETH', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'GBG/UAH' => array ( 'id' => 'gbguah', 'symbol' => 'GBG/UAH', 'base' => 'GBG', 'quote' => 'UAH', 'precision' => array ( 'amount' => 3, 'price' => 2 ), 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))), // Golos Gold (GBG != GOLOS)
                'KUN/BTC' => array ( 'id' => 'kunbtc', 'symbol' => 'KUN/BTC', 'base' => 'KUN', 'quote' => 'BTC', 'precision' => array ( 'amount' => 6, 'price' => 6 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'BCH/BTC' => array ( 'id' => 'bchbtc', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'precision' => array ( 'amount' => 6, 'price' => 6 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'BCH/UAH' => array ( 'id' => 'bchuah', 'symbol' => 'BCH/UAH', 'base' => 'BCH', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'WAVES/UAH' => array ( 'id' => 'wavesuah', 'symbol' => 'WAVES/UAH', 'base' => 'WAVES', 'quote' => 'UAH', 'precision' => array ( 'amount' => 6, 'price' => 0 ), 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 1, 'max' => null ), 'cost' => array ( 'min' => 0.000001, 'max' => null ))),
                'ARN/BTC' => array ( 'id' => 'arnbtc', 'symbol' => 'ARN/BTC', 'base' => 'ARN', 'quote' => 'BTC' ),
                'B2B/BTC' => array ( 'id' => 'b2bbtc', 'symbol' => 'B2B/BTC', 'base' => 'B2B', 'quote' => 'BTC' ),
                'EVR/BTC' => array ( 'id' => 'evrbtc', 'symbol' => 'EVR/BTC', 'base' => 'EVR', 'quote' => 'BTC' ),
                'GOL/GBG' => array ( 'id' => 'golgbg', 'symbol' => 'GOL/GBG', 'base' => 'GOL', 'quote' => 'GBG' ),
                'R/BTC' => array ( 'id' => 'rbtc', 'symbol' => 'R/BTC', 'base' => 'R', 'quote' => 'BTC' ),
                'RMC/BTC' => array ( 'id' => 'rmcbtc', 'symbol' => 'RMC/BTC', 'base' => 'RMC', 'quote' => 'BTC' ),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.25 / 100,
                    'maker' => 0.25 / 100,
                ),
                'funding' => array (
                    'withdraw' => array (
                        'UAH' => '1%',
                        'BTC' => 0.001,
                        'BCH' => 0.001,
                        'ETH' => 0.01,
                        'WAVES' => 0.01,
                        'GOL' => 0.0,
                        'GBG' => 0.0,
                        // 'RMC' => 0.001 BTC
                        // 'ARN' => 0.01 ETH
                        // 'R' => 0.01 ETH
                        // 'EVR' => 0.01 ETH
                    ),
                    'deposit' => array (
                        // 'UAH' => (amount) => amount * 0.001 . 5
                    ),
                ),
            ),
        ));
    }

    public function handle_errors ($code, $reason, $url, $method, $headers, $body) {
        if ($code === 400) {
            $response = json_decode ($body, $as_associative_array = true);
            $error = $this->safe_value($response, 'error');
            $errorCode = $this->safe_value($error, 'code');
            if ($errorCode === 2002) {
                throw new InsufficientFunds (implode (' ', array ($this->id, $method, $url, $code, $reason, $body)));
            } else if ($errorCode === 2003) {
                throw new OrderNotFound (implode (' ', array ($this->id, $method, $url, $code, $reason, $body)));
            }
        }
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderBook = $this->publicGetOrderBook (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_order_book($orderBook, null, 'bids', 'asks', 'price', 'remaining_volume');
    }

    public function fetch_l3_order_book ($symbol, $params) {
        return $this->fetch_order_book($symbol, $params);
    }

    public function fetch_open_orders ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol argument');
        $market = $this->market ($symbol);
        $orders = $this->privateGetOrders (array_merge (array (
            'market' => $market['id'],
        ), $params));
        // todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        // with order cache . fetchOpenOrders
        // as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return $this->parse_orders($orders, $market, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => null,
            'side' => null,
            'price' => floatval ($trade['price']),
            'amount' => floatval ($trade['volume']),
            'info' => $trade,
        );
    }

    public function fetch_trades ($symbol, $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTrades (array_merge (array (
            'market' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market, $since, $limit);
    }

    public function parse_my_trade ($trade, $market) {
        $timestamp = $this->parse8601 ($trade['created_at']);
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'id' => $trade['id'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'price' => $trade['price'],
            'amount' => $trade['volume'],
            'cost' => $trade['funds'],
            'symbol' => $symbol,
            'side' => $trade['side'],
            'order' => $trade['order_id'],
        );
    }

    public function parse_my_trades ($trades, $market = null) {
        $parsedTrades = array ();
        for ($i = 0; $i < count ($trades); $i++) {
            $trade = $trades[$i];
            $parsedTrade = $this->parse_my_trade ($trade, $market);
            $parsedTrades[] = $parsedTrade;
        }
        return $parsedTrades;
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol argument');
        $market = $this->market ($symbol);
        $response = $this->privateGetTradesMy (array ( 'market' => $market['id'] ));
        return $this->parse_my_trades ($response, $market);
    }
}
