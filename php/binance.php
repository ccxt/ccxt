<?php

namespace ccxt;

include_once ('base/Exchange.php');

class binance extends Exchange {

    public function describe () {
        return array_replace_recursive (parent::describe (), array (
            'id' => 'binance',
            'name' => 'Binance',
            'countries' => 'CN', // China
            'rateLimit' => 1000,
            'version' => 'v1',
            'hasCORS' => false,
            // obsolete metainfo interface
            'hasFetchOHLCV' => true,
            'hasFetchMyTrades' => true,
            'hasFetchOrder' => true,
            'hasFetchOrders' => true,
            'hasFetchOpenOrders' => true,
            'withdraw' => true,
            // new metainfo interface
            'has' => array (
                'fetchOHLCV' => true,
                'fetchMyTrades' => true,
                'fetchOrder' => true,
                'fetchOrders' => true,
                'fetchOpenOrders' => true,
                'withdraw' => true,
            ),
            'timeframes' => array (
                '1m' => '1m',
                '3m' => '3m',
                '5m' => '5m',
                '15m' => '15m',
                '30m' => '30m',
                '1h' => '1h',
                '2h' => '2h',
                '4h' => '4h',
                '6h' => '6h',
                '8h' => '8h',
                '12h' => '12h',
                '1d' => '1d',
                '3d' => '3d',
                '1w' => '1w',
                '1M' => '1M',
            ),
            'urls' => array (
                'logo' => 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api' => array (
                    'web' => 'https://www.binance.com',
                    'wapi' => 'https://www.binance.com/wapi',
                    'public' => 'https://www.binance.com/api',
                    'private' => 'https://www.binance.com/api',
                ),
                'www' => 'https://www.binance.com',
                'doc' => 'https://www.binance.com/restapipub.html',
                'fees' => 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            ),
            'api' => array (
                'web' => array (
                    'get' => array (
                        'exchange/public/product',
                    ),
                ),
                'wapi' => array (
                    'post' => array (
                        'withdraw',
                        'getDepositHistory',
                        'getWithdrawHistory',
                    ),
                ),
                'public' => array (
                    'get' => array (
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                    ),
                ),
                'private' => array (
                    'get' => array (
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ),
                    'post' => array (
                        'order',
                        'order/test',
                        'userDataStream',
                    ),
                    'put' => array (
                        'userDataStream'
                    ),
                    'delete' => array (
                        'order',
                        'userDataStream',
                    ),
                ),
            ),
            'fees' => array (
                'trading' => array (
                    'taker' => 0.001,
                    'maker' => 0.001,
                ),
                'funding' => array (
                    'withdraw' => array (
                        'BNB' => 1.0,
                        'BTC' => 0.0005,
                        'ETH' => 0.005,
                        'LTC' => 0.001,
                        'NEO' => 0.0,
                        'QTUM' => 0.01,
                        'SNT' => 50.0,
                        'BNT' => 0.6,
                        'EOS' => 2.0,
                        'BCH' => 0.0005,
                        'GAS' => 0.0,
                        'USDT' => 5.0,
                        'OAX' => 2.0,
                        'DNT' => 30.0,
                        'MCO' => 0.15,
                        'ICN' => 0.5,
                        'WTC' => 0.2,
                        'OMG' => 0.1,
                        'ZRX' => 5.0,
                        'STRAT' => 0.1,
                        'SNGLS' => 8.0,
                        'BQX' => 2.0,
                        'KNC' => 1.0,
                        'FUN' => 50.0,
                        'SNM' => 10.0,
                        'LINK' => 5.0,
                        'XVG' => 0.1,
                        'CTR' => 1.0,
                        'SALT' => 0.3,
                        'IOTA' => 0.0,
                        'MDA' => 0.5,
                        'MTL' => 0.15,
                        'SUB' => 10.0,
                        'ETC' => 0.01,
                        'MTH' => 10.0,
                        'ENG' => 2.0,
                        'AST' => 4.0,
                        'BTG' => null,
                        'DASH' => 0.002,
                        'EVX' => 1.0,
                        'REQ' => 30.0,
                        'LRC' => 7.0,
                        'VIB' => 7.0,
                        'HSR' => 0.0001,
                        'TRX' => 500.0,
                        'POWR' => 15.0,
                        'ARK' => 0.1,
                        'YOYO' => 30.0,
                        'XRP' => 0.15,
                        'MOD' => 1.0,
                        'ENJ' => 1.0,
                        'STORJ' => 2.0,
                    ),
                ),
            ),
            'precision' => array (
                'amount' => 6,
                'price' => 6,
            ),
            'markets' => array (
                'ETH/BTC' => array ( 'id' => 'ETHBTC', 'symbol' => 'ETH/BTC', 'base' => 'ETH', 'quote' => 'BTC', 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'LTC/BTC' => array ( 'id' => 'LTCBTC', 'symbol' => 'LTC/BTC', 'base' => 'LTC', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BNB/BTC' => array ( 'id' => 'BNBBTC', 'symbol' => 'BNB/BTC', 'base' => 'BNB', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'NEO/BTC' => array ( 'id' => 'NEOBTC', 'symbol' => 'NEO/BTC', 'base' => 'NEO', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'GAS/BTC' => array ( 'id' => 'GASBTC', 'symbol' => 'GAS/BTC', 'base' => 'GAS', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BCH/BTC' => array ( 'id' => 'BCCBTC', 'symbol' => 'BCH/BTC', 'base' => 'BCH', 'quote' => 'BTC', 'lot' => 0.001, 'limits' => array ( 'amount' => array ( 'min' => 0.001, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'MCO/BTC' => array ( 'id' => 'MCOBTC', 'symbol' => 'MCO/BTC', 'base' => 'MCO', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'WTC/BTC' => array ( 'id' => 'WTCBTC', 'symbol' => 'WTC/BTC', 'base' => 'WTC', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'OMG/BTC' => array ( 'id' => 'OMGBTC', 'symbol' => 'OMG/BTC', 'base' => 'OMG', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'ZRX/BTC' => array ( 'id' => 'ZRXBTC', 'symbol' => 'ZRX/BTC', 'base' => 'ZRX', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BQX/BTC' => array ( 'id' => 'BQXBTC', 'symbol' => 'BQX/BTC', 'base' => 'BQX', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'KNC/BTC' => array ( 'id' => 'KNCBTC', 'symbol' => 'KNC/BTC', 'base' => 'KNC', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'FUN/BTC' => array ( 'id' => 'FUNBTC', 'symbol' => 'FUN/BTC', 'base' => 'FUN', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SNM/BTC' => array ( 'id' => 'SNMBTC', 'symbol' => 'SNM/BTC', 'base' => 'SNM', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'XVG/BTC' => array ( 'id' => 'XVGBTC', 'symbol' => 'XVG/BTC', 'base' => 'XVG', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'CTR/BTC' => array ( 'id' => 'CTRBTC', 'symbol' => 'CTR/BTC', 'base' => 'CTR', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'BNB/ETH' => array ( 'id' => 'BNBETH', 'symbol' => 'BNB/ETH', 'base' => 'BNB', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNT/ETH' => array ( 'id' => 'SNTETH', 'symbol' => 'SNT/ETH', 'base' => 'SNT', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BNT/ETH' => array ( 'id' => 'BNTETH', 'symbol' => 'BNT/ETH', 'base' => 'BNT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'EOS/ETH' => array ( 'id' => 'EOSETH', 'symbol' => 'EOS/ETH', 'base' => 'EOS', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'OAX/ETH' => array ( 'id' => 'OAXETH', 'symbol' => 'OAX/ETH', 'base' => 'OAX', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'DNT/ETH' => array ( 'id' => 'DNTETH', 'symbol' => 'DNT/ETH', 'base' => 'DNT', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'MCO/ETH' => array ( 'id' => 'MCOETH', 'symbol' => 'MCO/ETH', 'base' => 'MCO', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'ICN/ETH' => array ( 'id' => 'ICNETH', 'symbol' => 'ICN/ETH', 'base' => 'ICN', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'WTC/ETH' => array ( 'id' => 'WTCETH', 'symbol' => 'WTC/ETH', 'base' => 'WTC', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'OMG/ETH' => array ( 'id' => 'OMGETH', 'symbol' => 'OMG/ETH', 'base' => 'OMG', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'ZRX/ETH' => array ( 'id' => 'ZRXETH', 'symbol' => 'ZRX/ETH', 'base' => 'ZRX', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BQX/ETH' => array ( 'id' => 'BQXETH', 'symbol' => 'BQX/ETH', 'base' => 'BQX', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'KNC/ETH' => array ( 'id' => 'KNCETH', 'symbol' => 'KNC/ETH', 'base' => 'KNC', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'FUN/ETH' => array ( 'id' => 'FUNETH', 'symbol' => 'FUN/ETH', 'base' => 'FUN', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNM/ETH' => array ( 'id' => 'SNMETH', 'symbol' => 'SNM/ETH', 'base' => 'SNM', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'NEO/ETH' => array ( 'id' => 'NEOETH', 'symbol' => 'NEO/ETH', 'base' => 'NEO', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'XVG/ETH' => array ( 'id' => 'XVGETH', 'symbol' => 'XVG/ETH', 'base' => 'XVG', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'CTR/ETH' => array ( 'id' => 'CTRETH', 'symbol' => 'CTR/ETH', 'base' => 'CTR', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.0000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'QTUM/BTC' => array ( 'id' => 'QTUMBTC', 'symbol' => 'QTUM/BTC', 'base' => 'QTUM', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'LINK/BTC' => array ( 'id' => 'LINKBTC', 'symbol' => 'LINK/BTC', 'base' => 'LINK', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SALT/BTC' => array ( 'id' => 'SALTBTC', 'symbol' => 'SALT/BTC', 'base' => 'SALT', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'IOTA/BTC' => array ( 'id' => 'IOTABTC', 'symbol' => 'IOTA/BTC', 'base' => 'IOTA', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'QTUM/ETH' => array ( 'id' => 'QTUMETH', 'symbol' => 'QTUM/ETH', 'base' => 'QTUM', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'LINK/ETH' => array ( 'id' => 'LINKETH', 'symbol' => 'LINK/ETH', 'base' => 'LINK', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SALT/ETH' => array ( 'id' => 'SALTETH', 'symbol' => 'SALT/ETH', 'base' => 'SALT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'IOTA/ETH' => array ( 'id' => 'IOTAETH', 'symbol' => 'IOTA/ETH', 'base' => 'IOTA', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'BTC/USDT' => array ( 'id' => 'BTCUSDT', 'symbol' => 'BTC/USDT', 'base' => 'BTC', 'quote' => 'USDT', 'lot' => 0.000001, 'limits' => array ( 'amount' => array ( 'min' => 0.000001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ), 'cost' => array ( 'min' => 1, 'max' => null ))),
                'ETH/USDT' => array ( 'id' => 'ETHUSDT', 'symbol' => 'ETH/USDT', 'base' => 'ETH', 'quote' => 'USDT', 'lot' => 0.00001, 'limits' => array ( 'amount' => array ( 'min' => 0.00001, 'max' => null ), 'price' => array ( 'min' => 0.01, 'max' => null ), 'cost' => array ( 'min' => 1, 'max' => null ))),
                'STRAT/ETH' => array ( 'id' => 'STRATETH', 'symbol' => 'STRAT/ETH', 'base' => 'STRAT', 'quote' => 'ETH', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'SNGLS/ETH' => array ( 'id' => 'SNGLSETH', 'symbol' => 'SNGLS/ETH', 'base' => 'SNGLS', 'quote' => 'ETH', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.01, 'max' => null ))),
                'STRAT/BTC' => array ( 'id' => 'STRATBTC', 'symbol' => 'STRAT/BTC', 'base' => 'STRAT', 'quote' => 'BTC', 'lot' => 0.01, 'limits' => array ( 'amount' => array ( 'min' => 0.01, 'max' => null ), 'price' => array ( 'min' => 0.000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
                'SNGLS/BTC' => array ( 'id' => 'SNGLSBTC', 'symbol' => 'SNGLS/BTC', 'base' => 'SNGLS', 'quote' => 'BTC', 'lot' => 1, 'limits' => array ( 'amount' => array ( 'min' => 1, 'max' => null ), 'price' => array ( 'min' => 0.00000001, 'max' => null ), 'cost' => array ( 'min' => 0.001, 'max' => null ))),
            ),
        ));
    }

    public function calculate_fee ($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        $market = $this->markets[$symbol];
        $key = 'quote';
        $rate = $market[$takerOrMaker];
        $cost = floatval ($this->cost_to_precision($symbol, $amount * $rate));
        if ($side == 'sell') {
            $cost *= $price;
        } else {
            $key = 'base';
        }
        return array (
            'currency' => $market[$key],
            'rate' => $rate,
            'cost' => floatval ($this->fee_to_precision($symbol, $cost)),
        );
    }

    public function fetch_balance ($params = array ()) {
        $response = $this->privateGetAccount ($params);
        $result = array ( 'info' => $response );
        $balances = $response['balances'];
        for ($i = 0; $i < count ($balances); $i++) {
            $balance = $balances[$i];
            $asset = $balance['asset'];
            $currency = $this->common_currency_code($asset);
            $account = array (
                'free' => floatval ($balance['free']),
                'used' => floatval ($balance['locked']),
                'total' => 0.0,
            );
            $account['total'] = $this->sum ($account['free'], $account['used']);
            $result[$currency] = $account;
        }
        return $this->parse_balance($result);
    }

    public function fetch_order_book ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $orderbook = $this->publicGetDepth (array_merge (array (
            'symbol' => $market['id'],
            'limit' => 100, // default = maximum = 100
        ), $params));
        return $this->parse_order_book($orderbook);
    }

    public function parse_ticker ($ticker, $market) {
        $timestamp = $ticker['closeTime'];
        $symbol = null;
        if ($market)
            $symbol = $market['symbol'];
        return array (
            'symbol' => $symbol,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'high' => floatval ($ticker['highPrice']),
            'low' => floatval ($ticker['lowPrice']),
            'bid' => floatval ($ticker['bidPrice']),
            'ask' => floatval ($ticker['askPrice']),
            'vwap' => floatval ($ticker['weightedAvgPrice']),
            'open' => floatval ($ticker['openPrice']),
            'close' => floatval ($ticker['prevClosePrice']),
            'first' => null,
            'last' => floatval ($ticker['lastPrice']),
            'change' => floatval ($ticker['priceChangePercent']),
            'percentage' => null,
            'average' => null,
            'baseVolume' => floatval ($ticker['volume']),
            'quoteVolume' => floatval ($ticker['quoteVolume']),
            'info' => $ticker,
        );
    }

    public function fetch_ticker ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetTicker24hr (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_ticker($response, $market);
    }

    public function parse_ohlcv ($ohlcv, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        return [
            $ohlcv[0],
            floatval ($ohlcv[1]),
            floatval ($ohlcv[2]),
            floatval ($ohlcv[3]),
            floatval ($ohlcv[4]),
            floatval ($ohlcv[5]),
        ];
    }

    public function fetch_ohlcv ($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        $market = $this->market ($symbol);
        $request = array (
            'symbol' => $market['id'],
            'interval' => $this->timeframes[$timeframe],
        );
        $request['limit'] = ($limit) ? $limit : 500; // default == max == 500
        if ($since)
            $request['startTime'] = $since;
        $response = $this->publicGetKlines (array_merge ($request, $params));
        return $this->parse_ohlcvs($response, $market, $timeframe, $since, $limit);
    }

    public function parse_trade ($trade, $market = null) {
        $timestampField = (array_key_exists ('T', $trade)) ? 'T' : 'time';
        $timestamp = $trade[$timestampField];
        $priceField = (array_key_exists ('p', $trade)) ? 'p' : 'price';
        $price = floatval ($trade[$priceField]);
        $amountField = (array_key_exists ('q', $trade)) ? 'q' : 'qty';
        $amount = floatval ($trade[$amountField]);
        $idField = (array_key_exists ('a', $trade)) ? 'a' : 'id';
        $id = (string) $trade[$idField];
        $side = null;
        $order = null;
        if (array_key_exists ('orderId', $trade))
            $order = (string) $trade['orderId'];
        if (array_key_exists ('m', $trade)) {
            $side = 'sell';
            if ($trade['m'])
                $side = 'buy';
        } else {
            $side = ($trade['isBuyer']) ? 'buy' : 'sell';
        }
        $fee = null;
        if (array_key_exists ('commission', $trade)) {
            $fee = array (
                'cost' => floatval ($trade['commission']),
                'currency' => $trade['commissionAsset'],
            );
        }
        return array (
            'info' => $trade,
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $market['symbol'],
            'id' => $id,
            'order' => $order,
            'type' => null,
            'side' => $side,
            'price' => $price,
            'cost' => $price * $amount,
            'amount' => $amount,
            'fee' => $fee,
        );
    }

    public function fetch_trades ($symbol, $params = array ()) {
        $market = $this->market ($symbol);
        $response = $this->publicGetAggTrades (array_merge (array (
            'symbol' => $market['id'],
            // 'fromId' => 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime' => 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime' => 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            'limit' => 500,        // default = maximum = 500
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function parse_order_status ($status) {
        if ($status == 'NEW')
            return 'open';
        if ($status == 'PARTIALLY_FILLED')
            return 'partial';
        if ($status == 'FILLED')
            return 'closed';
        if ($status == 'CANCELED')
            return 'canceled';
        return strtolower ($status);
    }

    public function parse_order ($order, $market = null) {
        $status = $this->parse_order_status($order['status']);
        $symbol = null;
        if ($market) {
            $symbol = $market['symbol'];
        } else {
            $id = $order['symbol'];
            if (array_key_exists ($id, $this->markets_by_id)) {
                $market = $this->markets_by_id[$id];
                $symbol = $market['symbol'];
            }
        }
        $timestamp = $order['time'];
        $price = floatval ($order['price']);
        $amount = floatval ($order['origQty']);
        $filled = $this->safe_float($order, 'executedQty', 0.0);
        $remaining = max ($amount - $filled, 0.0);
        $result = array (
            'info' => $order,
            'id' => (string) $order['orderId'],
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'symbol' => $symbol,
            'type' => strtolower ($order['type']),
            'side' => strtolower ($order['side']),
            'price' => $price,
            'amount' => $amount,
            'cost' => $price * $amount,
            'filled' => $filled,
            'remaining' => $remaining,
            'status' => $status,
            'fee' => null,
        );
        return $result;
    }

    public function create_order ($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        $market = $this->market ($symbol);
        $order = array (
            'symbol' => $market['id'],
            'quantity' => $this->amount_to_precision($symbol, $amount),
            'type' => strtoupper ($type),
            'side' => strtoupper ($side),
        );
        if ($type == 'limit') {
            $order = array_merge ($order, array (
                'price' => $this->price_to_precision($symbol, $price),
                'timeInForce' => 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            ));
        }
        $response = $this->privatePostOrder (array_merge ($order, $params));
        return array (
            'info' => $response,
            'id' => (string) $response['orderId'],
        );
    }

    public function fetch_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrder requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetOrder (array_merge (array (
            'symbol' => $market['id'],
            'orderId' => intval ($id),
        ), $params));
        return $this->parse_order($response, $market);
    }

    public function fetch_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOrders requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetAllOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_orders($response, $market);
    }

    public function fetch_open_orders ($symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchOpenOrders requires a $symbol param');
        $market = $this->market ($symbol);
        $response = $this->privateGetOpenOrders (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_orders($response, $market);
    }

    public function cancel_order ($id, $symbol = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' cancelOrder requires a $symbol param');
        $market = $this->market ($symbol);
        $response = null;
        try {
            $response = $this->privateDeleteOrder (array_merge (array (
                'symbol' => $market['id'],
                'orderId' => intval ($id),
                // 'origClientOrderId' => $id,
            ), $params));
        } catch (Exception $e) {
            if (mb_strpos ($this->last_http_response, 'UNKNOWN_ORDER') !== false)
                throw new OrderNotFound ($this->id . ' cancelOrder() error => ' . $this->last_http_response);
            throw $e;
        }
        return $response;
    }

    public function nonce () {
        return $this->milliseconds ();
    }

    public function fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ()) {
        if (!$symbol)
            throw new ExchangeError ($this->id . ' fetchMyTrades requires a symbol');
        $market = $this->market ($symbol);
        $response = $this->privateGetMyTrades (array_merge (array (
            'symbol' => $market['id'],
        ), $params));
        return $this->parse_trades($response, $market);
    }

    public function withdraw ($currency, $amount, $address, $params = array ()) {
        $response = $this->wapiPostWithdraw (array_merge (array (
            'asset' => $currency,
            'address' => $address,
            'amount' => floatval ($amount),
            'recvWindow' => 10000000,
        ), $params));
        return array (
            'info' => $response,
            'id' => null,
        );
    }

    public function sign ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $url = $this->urls['api'][$api];
        if ($api != 'web')
            $url .= '/' . $this->version;
        $url .= '/' . $path;
        if ($api == 'wapi')
            $url .= '.html';
        if (($api == 'private') || ($api == 'wapi')) {
            $nonce = $this->nonce ();
            $query = $this->urlencode (array_merge (array ( 'timestamp' => $nonce ), $params));
            $signature = null;
            if ($api != 'wapi') {
                $auth = $this->secret . '|' . $query;
                $signature = $this->hash ($this->encode ($auth), 'sha256'); // v1
            } else {
                $signature = $this->hmac ($this->encode ($query), $this->encode ($this->secret)); // v3
            }
            $query .= '&' . 'signature=' . $signature;
            $headers = array (
                'X-MBX-APIKEY' => $this->apiKey,
            );
            if (($method == 'GET') || ($api == 'wapi')) {
                $url .= '?' . $query;
            } else {
                $body = $query;
                $headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if ($params)
                $url .= '?' . $this->urlencode ($params);
        }
        return array ( 'url' => $url, 'method' => $method, 'body' => $body, 'headers' => $headers );
    }

    public function request ($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null) {
        $response = $this->fetch2 ($path, $api, $method, $params, $headers, $body);
        if (array_key_exists ('code', $response)) {
            if ($response['code'] < 0) {
                if ($response['code'] == -2010)
                    throw new InsufficientFunds ($this->id . ' ' . $this->json ($response));
                if ($response['code'] == -2011)
                    throw new OrderNotFound ($this->id . ' ' . $this->json ($response));
                throw new ExchangeError ($this->id . ' ' . $this->json ($response));
            }
        }
        return $response;
    }
}

?>