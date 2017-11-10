// Type definitions for ccxt 0.1.0
// Project: https://github.com/kroitor/ccxt
// Definitions by: Cayle Sharrock <https://github.com/CjS77>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'ccxt' {

    export interface CCXTMarket {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        info: any;
    }

    export interface CCXTOrderbook {
        bids: number[][];
        asks: number[][];
        timestamp: number;
        datetime: string;
    }

    export interface CCXTHistTrade {
        info: {};                  // the original decoded JSON as is
        id: string;                // string trade id
        timestamp: number;         // Unix timestamp in milliseconds
        datetime: string;          // ISO8601 datetime with milliseconds;
        symbol: string;            // symbol in CCXT format
        order?: string;             // string order id or undefined/None/null
        type?: 'market' | 'limit'; // order type, 'market', 'limit' or undefined/None/null
        side: 'buy' | 'sell';
        price: number;             // float price in quote currency
        amount: number;            // amount of base currency
    }

    // timestamp, open, high, low, close, volume
    export type CCXTOHLCV = [number, number, number, number, number, number];

    export class Exchange {
        readonly rateLimit: number;
        readonly hasFetchOHLCV: boolean;
        public verbose: boolean;
        public substituteCommonCurrencyCodes: boolean;
        public hasFetchTickers: boolean;

        fetch(url: string, method: string, headers?: any, body?: any): Promise<any>;

        handleResponse(url: string, method: string, headers?: any, body?: any): any;

        loadMarkets(reload?: boolean): Promise<CCXTMarket[]>;

        fetchOrderStatus(id: string, market: string): Promise<string>;

        account(): any;

        commonCurrencyCode(currency: string): string;

        market(symbol: string): CCXTMarket;

        marketId(symbol: string): string;

        marketIds(symbols: string): string[];

        symbol(symbol: string): string;

        createOrder(market: string, type: string, side: string, amount: string, price?: string, params?: any): Promise<any>;

        fetchBalance(params?: any): Promise<any>;

        fetchOrderBook(market: string, params?: any): Promise<CCXTOrderbook>;

        fetchTicker(market: string): Promise<any>;

        fetchTrades(symbol: string, params?: {}): Promise<CCXTHistTrade[]>;

        fetchOHLCV?(symbol: string, params?: {}): Promise<CCXTOHLCV[]>;

        cancelOrder(id: string): Promise<any>;

        withdraw(currency: string, amount: string, address: string, params?: any): Promise<any>;

        request(path: string, api: string, method: string, params?: any, headers?: any, body?: any): Promise<any>;
    }
    /* tslint:disable */
    export class _1broker extends Exchange {}

    export class _1btcxe extends Exchange {}

    export class anxpro extends Exchange {}

    export class binance extends Exchange {}

    export class bit2c extends Exchange {}

    export class bitbay extends Exchange {}

    export class bitbays extends Exchange {}

    export class bitcoincoid extends Exchange {}

    export class bitfinex extends Exchange {}

    export class bitfinex2 extends Exchange {}

    export class bitflyer extends Exchange {}

    export class bitlish extends Exchange {}

    export class bitmarket extends Exchange {}

    export class bitmex extends Exchange {}

    export class bitso extends Exchange {}

    export class bitstamp extends Exchange {}

    export class bittrex extends Exchange {}

    export class bl3p extends Exchange {}

    export class btcchina extends Exchange {}

    export class btce extends Exchange {}

    export class btcexchange extends Exchange {}

    export class btcmarkets extends Exchange {}

    export class btctradeua extends Exchange {}

    export class btcturk extends Exchange {}

    export class btcx extends Exchange {}

    export class bter extends Exchange {}

    export class bxinth extends Exchange {}

    export class ccex extends Exchange {}

    export class cex extends Exchange {}

    export class chbtc extends Exchange {}

    export class chilebit extends Exchange {}

    export class coincheck extends Exchange {}

    export class coinfloor extends Exchange {}

    export class coingi extends Exchange {}

    export class coinmarketcap extends Exchange {}

    export class coinmate extends Exchange {}

    export class coinsecure extends Exchange {}

    export class coinspot extends Exchange {}

    export class cryptopia extends Exchange {}

    export class dsx extends Exchange {}

    export class exmo extends Exchange {}

    export class flowbtc extends Exchange {}

    export class foxbit extends Exchange {}

    export class fybse extends Exchange {}

    export class fybsg extends Exchange {}

    export class gatecoin extends Exchange {}

    export class gdax extends Exchange {}

    export class gemini extends Exchange {}

    export class hitbtc extends Exchange {}

    export class hitbtc2 extends Exchange {}

    export class huobi extends Exchange {}

    export class itbit extends Exchange {}

    export class jubi extends Exchange {}

    export class kraken extends Exchange {}

    export class lakebtc extends Exchange {}

    export class livecoin extends Exchange {}

    export class liqui extends Exchange {}

    export class luno extends Exchange {}

    export class mercado extends Exchange {}

    export class okcoincny extends Exchange {}

    export class okcoinusd extends Exchange {}

    export class okex extends Exchange {}

    export class paymium extends Exchange {}

    export class poloniex extends Exchange {}

    export class quadrigacx extends Exchange {}

    export class quoine extends Exchange {}

    export class southxchange extends Exchange {}

    export class surbitcoin extends Exchange {}

    export class therock extends Exchange {}

    export class urdubit extends Exchange {}

    export class vaultoro extends Exchange {}

    export class vbtc extends Exchange {}

    export class virwox extends Exchange {}

    export class xbtce extends Exchange {}

    export class yobit extends Exchange {}

    export class yunbi extends Exchange {}

    export class zaif extends Exchange {}
    /* tslint:enable */
}
