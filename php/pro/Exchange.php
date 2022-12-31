<?php

namespace ccxt\pro;

// rounding mode duplicated from CCXT
// const TRUNCATE = 0;
// const ROUND = 1;
// const ROUND_UP = 2;
// const ROUND_DOWN = 3;

class Exchange extends \ccxt\async\Exchange {

    use ClientTrait;

    public static $exchanges = array();
}

// the override below is technically an error
// todo: fix the conflict of ccxt.exchanges vs ccxtpro.exchanges

Exchange::$exchanges = array(
    'alpaca',
    'ascendex',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bitcoincom',
    'bitfinex',
    'bitfinex2',
    'bitget',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitrue',
    'bitstamp',
    'bittrex',
    'bitvavo',
    'bybit',
    'cex',
    'coinbaseprime',
    'coinbasepro',
    'coinex',
    'cryptocom',
    'currencycom',
    'deribit',
    'exmo',
    'gate',
    'gateio',
    'hitbtc',
    'hollaex',
    'huobi',
    'huobijp',
    'huobipro',
    'idex',
    'kraken',
    'kucoin',
    'luno',
    'mexc',
    'ndax',
    'okcoin',
    'okex',
    'okx',
    'phemex',
    'ripio',
    'upbit',
    'wazirx',
    'whitebit',
    'woo',
    'zb',
    'zipmex',
);

