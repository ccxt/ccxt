declare module 'ccxt' {

    export interface Market {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        info: any;
    }

    export interface OrderBook {
        bids: number[][];
        asks: number[][];
        timestamp: number;
        datetime: string;
    }

    export interface Trade {
        info: {};                  // the original decoded JSON as is
        id: string;                // string trade id
        timestamp: number;         // Unix timestamp in milliseconds
        datetime: string;          // ISO8601 datetime with milliseconds;
        symbol: string;            // symbol in CCXT format
        order?: string;            // string order id or undefined/None/null
        type?: 'market' | 'limit'; // order type, 'market', 'limit' or undefined/None/null
        side: 'buy' | 'sell';
        price: number;             // float price in quote currency
        amount: number;            // amount of base currency
    }

    export interface Ticker {
        symbol: string,
        timestamp: number,
        datetime: string,
        high: number,
        low: number,
        bid: number,
        ask: number,
        vwap?: number,
        open?: number,
        close?: number,
        first?: number,
        last?: number,
        change?: number,
        percentage?: number,
        average?: number,
        baseVolume?: number,
        quoteVolume?: number,
        info: {}
    }

    export interface Tickers {
        [symbol: string]: Ticker
    }

    // timestamp, open, high, low, close, volume
    export type OHLCV = [number, number, number, number, number, number];

    export class Exchange {

        readonly rateLimit: number;
        readonly hasFetchOHLCV: boolean;

        public verbose: boolean;
        public substituteCommonCurrencyCodes: boolean;
        public hasFetchTickers: boolean;

        fetch (url: string, method: string, headers?: any, body?: any): Promise<any>;
        handleResponse (url: string, method: string, headers?: any, body?: any): any;
        loadMarkets (reload?: boolean): Promise<Market[]>;
        fetchOrderStatus (id: string, market: string): Promise<string>;
        account (): any;
        commonCurrencyCode (currency: string): string;
        market (symbol: string): Market;
        marketId (symbol: string): string;
        marketIds (symbols: string): string[];
        symbol (symbol: string): string;
        createOrder (market: string, type: string, side: string, amount: string, price?: string, params?: any): Promise<any>;
        fetchBalance (params?: any): Promise<any>;
        fetchOrderBook (market: string, params?: any): Promise<OrderBook>;
        fetchTicker (market: string): Promise<Ticker>;
        fetchTickers (): Promise<Tickers>;
        fetchTrades (symbol: string, params?: {}): Promise<Trade[]>;
        fetchOHLCV? (symbol: string, params?: {}): Promise<OHLCV[]>;
        cancelOrder (id: string): Promise<any>;
        deposit (currency: string, amount: string, address: string, params?: any): Promise<any>;
        withdraw (currency: string, amount: string, address: string, params?: any): Promise<any>;
        request (path: string, api: string, method: string, params?: any, headers?: any, body?: any): Promise<any>;
    }

    /* tslint:disable */

    export class _1broker extends Exchange {}
    export class _1btcxe extends Exchange {}
    export class acx extends Exchange {}
    export class allcoin extends okcoinusd {}
    export class anxpro extends Exchange {}
    export class binance extends Exchange {}
    export class bit2c extends Exchange {}
    export class bitbay extends Exchange {}
    export class bitcoincoid extends Exchange {}
    export class bitfinex extends Exchange {}
    export class bitfinex2 extends bitfinex {}
    export class bitflyer extends Exchange {}
    export class bithumb extends Exchange {}
    export class bitlish extends Exchange {}
    export class bitmarket extends Exchange {}
    export class bitmex extends Exchange {}
    export class bitso extends Exchange {}
    export class bitstamp extends Exchange {}
    export class bitstamp1 extends Exchange {}
    export class bittrex extends Exchange {}
    export class bl3p extends Exchange {}
    export class bleutrade extends bittrex {}
    export class btcbox extends Exchange {}
    export class btcchina extends Exchange {}
    export class btcexchange extends btcturk {}
    export class btcmarkets extends Exchange {}
    export class btctradeua extends Exchange {}
    export class btcturk extends Exchange {}
    export class btcx extends Exchange {}
    export class bter extends Exchange {}
    export class bxinth extends Exchange {}
    export class ccex extends Exchange {}
    export class cex extends Exchange {}
    export class chbtc extends zb {}
    export class chilebit extends foxbit {}
    export class coincheck extends Exchange {}
    export class coinfloor extends Exchange {}
    export class coingi extends Exchange {}
    export class coinmarketcap extends Exchange {}
    export class coinmate extends Exchange {}
    export class coinsecure extends Exchange {}
    export class coinspot extends Exchange {}
    export class cryptopia extends Exchange {}
    export class dsx extends liqui {}
    export class exmo extends Exchange {}
    export class flowbtc extends Exchange {}
    export class foxbit extends Exchange {}
    export class fybse extends Exchange {}
    export class fybsg extends fybse {}
    export class gatecoin extends Exchange {}
    export class gateio extends bter {}
    export class gdax extends Exchange {}
    export class gemini extends Exchange {}
    export class hitbtc extends Exchange {}
    export class hitbtc2 extends hitbtc {}
    export class huobi extends Exchange {}
    export class huobicny extends huobipro {}
    export class huobipro extends Exchange {}
    export class independentreserve extends Exchange {}
    export class itbit extends Exchange {}
    export class jubi extends btcbox {}
    export class kraken extends Exchange {}
    export class kuna extends acx {}
    export class lakebtc extends Exchange {}
    export class liqui extends Exchange {}
    export class livecoin extends Exchange {}
    export class luno extends Exchange {}
    export class mercado extends Exchange {}
    export class mixcoins extends Exchange {}
    export class nova extends Exchange {}
    export class okcoincny extends okcoinusd {}
    export class okcoinusd extends Exchange {}
    export class okex extends okcoinusd {}
    export class paymium extends Exchange {}
    export class poloniex extends Exchange {}
    export class qryptos extends Exchange {}
    export class quadrigacx extends Exchange {}
    export class quoine extends qryptos {}
    export class southxchange extends Exchange {}
    export class surbitcoin extends foxbit {}
    export class therock extends Exchange {}
    export class tidex extends liqui {}
    export class urdubit extends foxbit {}
    export class vaultoro extends Exchange {}
    export class vbtc extends foxbit {}
    export class virwox extends Exchange {}
    export class wex extends liqui {}
    export class xbtce extends Exchange {}
    export class yobit extends liqui {}
    export class yunbi extends acx {}
    export class zaif extends Exchange {}
    export class zb extends Exchange {}

    /* tslint:enable */
}
