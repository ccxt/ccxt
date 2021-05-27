declare module 'ccxt.pro' {

    import {
        Balances,
        Dictionary,
        Exchange as BaseExchange,
        OHLCV,
        Order,
        OrderBook,
        Params,
        Ticker,
        Trade,
    } from 'ccxt'

    export class Exchange extends BaseExchange {
        watchTicker (symbol: string, params?: Params): Promise<Ticker>;
        watchTickers (symbols?: string[], params?: Params): Promise<Dictionary<Ticker>>;
        watchOrderBook (symbol: string, limit?: number, params?: Params): Promise<OrderBook>;
        watchOHLCV (symbol: string, timeframe?: string, since?: number, limit?: number, params?: Params): Promise<OHLCV[]>;
        // watchStatus (params?: Params): Promise<any>;
        watchTrades (symbol: string, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
        watchBalance (params?: Params): Promise<Balances>;
        watchOrder (id: string, symbol: string, params?: Params): Promise<Order>;
        watchOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchOpenOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchClosedOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchMyTrades (symbol?: string, since?: any, limit?: any, params?: Params): Promise<Trade>;
        // watchDeposits (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
        // watchWithdrawals (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
    }

    /* tslint:disable */

    export class aax extends Exchange {}
    export class bequant extends hitbtc {}
    export class binance extends Exchange {}
    export class binancecoinm extends binance {}
    export class binanceus extends binance {}
    export class binanceusdm extends binance {}
    export class bitcoincom extends hitbtc {}
    export class bitfinex extends Exchange {}
    export class bitmex extends Exchange {}
    export class bitstamp extends Exchange {}
    export class bittrex extends Exchange {}
    export class bitvavo extends Exchange {}
    export class cdax extends huobipro {}
    export class coinbaseprime extends coinbasepro {}
    export class coinbasepro extends Exchange {}
    export class currencycom extends Exchange {}
    export class ftx extends Exchange {}
    export class gateio extends Exchange {}
    export class gopax extends Exchange {}
    export class hitbtc extends Exchange {}
    export class huobijp extends huobipro {}
    export class huobipro extends Exchange {}
    export class idex extends Exchange {}
    export class kraken extends Exchange {}
    export class kucoin extends Exchange {}
    export class ndax extends Exchange {}
    export class okcoin extends okex {}
    export class okex extends Exchange {}
    export class phemex extends Exchange {}
    export class poloniex extends Exchange {}
    export class ripio extends Exchange {}
    export class upbit extends Exchange {}

    /* tslint:enable */

}