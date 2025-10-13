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
    'apex',
    'ascendex',
    'backpack',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bingx',
    'bitfinex',
    'bitget',
    'bithumb',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitrue',
    'bitstamp',
    'bittrade',
    'bitvavo',
    'blockchaincom',
    'blofin',
    'bybit',
    'cex',
    'coinbase',
    'coinbaseadvanced',
    'coinbaseexchange',
    'coinbaseinternational',
    'coincatch',
    'coincheck',
    'coinex',
    'coinone',
    'cryptocom',
    'defx',
    'deribit',
    'derive',
    'exmo',
    'gate',
    'gateio',
    'gemini',
    'hashkey',
    'hitbtc',
    'hollaex',
    'htx',
    'huobi',
    'hyperliquid',
    'independentreserve',
    'kraken',
    'krakenfutures',
    'kucoin',
    'kucoinfutures',
    'lbank',
    'luno',
    'mexc',
    'modetrade',
    'myokx',
    'ndax',
    'okcoin',
    'okx',
    'okxus',
    'onetrading',
    'oxfun',
    'p2b',
    'paradex',
    'phemex',
    'poloniex',
    'probit',
    'toobit',
    'upbit',
    'whitebit',
    'woo',
    'woofipro',
    'xt',
);

