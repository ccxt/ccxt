declare module 'ccxt' {

    // error.js -----------------------------------------

    export class BaseError extends Error {
        constructor(message: string);
    }

    export class ExchangeError extends BaseError {
        constructor(message: string);
    }

    export class NotSupported extends ExchangeError {
        constructor(message: string);
    }

    export class AuthenticationError extends ExchangeError {
        constructor(message: string);
    }

    export class InvalidNonce extends ExchangeError {
        constructor(message: string);
    }

    export class InsufficientFunds extends ExchangeError {
        constructor(message: string);
    }

    export class InvalidOrder extends ExchangeError {
        constructor(message: string);
    }

    export class OrderNotFound extends InvalidOrder {
        constructor(message: string);
    }

    export class OrderNotCached extends InvalidOrder {
        constructor(message: string);
    }

    export class CancelPending extends InvalidOrder {
        constructor(message: string);
    }

    export class NetworkError extends BaseError {
        constructor(message: string);
    }

    export class DDoSProtection extends NetworkError {
        constructor(message: string);
    }

    export class RequestTimeout extends NetworkError {
        constructor(message: string);
    }

    export class ExchangeNotAvailable extends NetworkError {
        constructor(message: string);
    }

    // -----------------------------------------------

    export const version: string;
    export const exchanges: string[];

    export interface MinMax {
        max: number;
        min: number;
    }

    export interface Market {
        [key: string]: any
        id: string;
        symbol: string;
        base: string;
        quote: string;
        active: boolean;
        precision: { amount: number, price: number, cost: number };
        limits: { amount: MinMax, price: MinMax, cost?: MinMax };
        info: any;
    }

    export interface Order {
        id: string;
        datetime: string;
        timestamp: number;
        lastTradeTimestamp: number;
        status: 'open' | 'closed' | 'canceled';
        symbol: string;
        type: 'market' | 'limit';
        side: 'buy' | 'sell';
        price: number;
        amount: number;
        filled: number;
        remaining: number;
        cost: number;
        trades: Trade[];
        fee: Fee;
        info: {};
    }

    export interface OrderBook {
        asks: [number, number][];
        bids: [number, number][];
        datetime: string;
        timestamp: number;
        nonce: number;
    }

    export interface Trade {
        amount: number;                  // amount of base currency
        datetime: string;                // ISO8601 datetime with milliseconds;
        id: string;                      // string trade id
        info: {};                        // the original decoded JSON as is
        order?: string;                  // string order id or undefined/None/null
        price: number;                   // float price in quote currency
        timestamp: number;               // Unix timestamp in milliseconds
        type?: 'market' | 'limit';       // order type, 'market', 'limit' or undefined/None/null
        side: 'buy' | 'sell';            // direction of the trade, 'buy' or 'sell'
        symbol: string;                  // symbol in CCXT format
        takerOrMaker: 'taker' | 'maker'; // string, 'taker' or 'maker'
        cost: number;                    // total cost (including fees), `price * amount`
        fee: Fee;
    }

    export interface Ticker {
        symbol: string;
        info: object;
        timestamp: number;
        datetime: string;
        high: number;
        low: number;
        bid: number;
        bidVolume?: number;
        ask: number;
        askVolume?: number;
        vwap?: number;
        open?: number;
        close?: number;
        last?: number;
        previousClose?: number;
        change?: number;
        percentage?: number;
        average?: number;
        quoteVolume?: number;
        baseVolume?: number;
    }

    export interface Transaction {
        info: {};
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        address: string;
        type: "deposit" | "withdrawal";
        amount: number;
        currency: string;
        status: "pending" | "ok";
        updated: number;
        fee: Fee;
    }

    export interface Tickers {
        info: any;
        [symbol: string]: Ticker;
    }

    export interface Currency {
        id: string;
        code: string;
    }

    export interface Balance {
        free: number;
        used: number;
        total: number;
    }

    export interface PartialBalances {
        [currency: string]: number;
    }

    export interface Balances {
        info: any;
        [key: string]: Balance;
    }

    export interface DepositAddress {
        currency: string;
        address: string;
        status: string;
        info: any;
    }

    export interface Fee {
        type: 'taker' | 'maker';
        currency: string;
        rate: number;
        cost: number;
    }

    // timestamp, open, high, low, close, volume
    export type OHLCV = [number, number, number, number, number, number];

    export class Exchange {
        constructor(config?: {[key in keyof Exchange]?: Exchange[key]});
        // allow dynamic keys
        [key: string]: any;
        // properties
        hash: any;
        hmac: any;
        jwt: any;
        binaryConcat: any;
        stringToBinary: any;
        stringToBase64: any;
        base64ToBinary: any;
        base64ToString: any;
        binaryToString: any;
        utf16ToBase64: any;
        urlencode: any;
        pluck: any;
        unique: any;
        extend: any;
        deepExtend: any;
        flatten: any;
        groupBy: any;
        indexBy: any;
        sortBy: any;
        keysort: any;
        decimal: any;
        safeFloat: any;
        safeString: any;
        safeInteger: any;
        safeValue: any;
        capitalize: any;
        json: JSON["stringify"]
        sum: any;
        ordered: any;
        aggregate: any;
        truncate: any;
        name: string;
        // nodeVersion: string;
        fees: object;
        enableRateLimit: boolean;
        countries: string;
        // set by loadMarkets
        markets: { [symbol: string]: Market };
        marketsById: { [id: string]: Market };
        currencies: { [symbol: string]: Currency };
        ids: string[];
        symbols: string[];
        id: string;
        proxy: string;
        parse8601: typeof Date.parse
        milliseconds: typeof Date.now;
        rateLimit: number;  // milliseconds = seconds * 1000
        timeout: number; // milliseconds
        verbose: boolean;
        twofa: boolean;// two-factor authentication
        substituteCommonCurrencyCodes: boolean;
        timeframes: any;
        has: { [what: string]: any }; // https://github.com/ccxt/ccxt/pull/1984
        balance: object;
        orderbooks: object;
        orders: object;
        trades: object;
        userAgent: { 'User-Agent': string } | false;

        // methods
        getMarket (symbol: string): Market;
        describe (): any;
        defaults (): any;
        nonce (): number;
        encodeURIComponent (...args: any[]): string;
        checkRequiredCredentials (): void;
        initRestRateLimiter (): void;
        handleResponse (url: string, method: string, headers?: any, body?: any): any;
        defineRestApi (api: any, methodName: any, options?: { [x: string]: any }): void;
        fetch (url: string, method?: string, headers?: any, body?: any): Promise<any>;
        fetch2 (path: any, api?: string, method?: string, params?: { [x: string]: any }, headers?: any, body?: any): Promise<any>;
        setMarkets (markets: Market[], currencies?: Currency[]): { [symbol: string]: Market };
        loadMarkets (reload?: boolean): Promise<{ [symbol: string]: Market }>;
        fetchTicker (symbol: string, params?: { [x: string]: any }): Promise<Ticker>;
        fetchTickers (symbols?: string[], params?: { [x: string]: any }): Promise<{ [x: string]: Ticker }>;
        fetchMarkets (): Promise<Market[]>;
        fetchOrderStatus (id: string, market: string): Promise<string>;
        encode (str: string): string;
        decode (str: string): string;
        account (): Balance;
        commonCurrencyCode (currency: string): string;
        market (symbol: string): Market;
        marketId (symbol: string): string;
        marketIds (symbols: string[]): string[];
        symbol (symbol: string): string;
        extractParams (str: string): string[];
        createOrder (symbol: string, type: string, side: string, amount: number, price?: number, params?: {}): Promise<any>;
        fetchBalance (params?: any): Promise<Balances>;
        fetchTotalBalance (params?: any): Promise<PartialBalances>;
        fetchUsedBalance (params?: any): Promise<PartialBalances>;
        fetchFreeBalance (params?: any): Promise<PartialBalances>;
        fetchOrderBook (symbol: string, limit?: number, params?: any): Promise<OrderBook>;
        fetchTicker (symbol: string): Promise<Ticker>;
        fetchTickers (symbols?: string[]): Promise<Tickers>;
        fetchTrades (symbol: string, since?: number, limit?: number, params?: {}): Promise<Trade[]>;
        fetchOHLCV? (symbol: string, timeframe?: string, since?: number, limit?: number, params?: {}): Promise<OHLCV[]>;
        fetchOrders (symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]>;
        fetchOpenOrders (symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]>;
        fetchCurrencies (params?: any): Promise<any>;
        fetchTransactions (currency?: string, since?: number, limit?: number, params?: {}): Promise<Transaction[]>;
        fetchDeposits (currency?: string, since?: number, limit?: number, params?: {}): Promise<Transaction[]>;
        fetchWithdrawals (currency?: string, since?: number, limit?: number, params?: {}): Promise<Transaction[]>;
        cancelOrder (id: string, symbol?: string, params?: {}): Promise<any>;
        createDepositAddress (currency: string, params?: {}): Promise<any>;
        fetchDepositAddress (currency: string, params?: {}): Promise<any>;
        withdraw (currency: string, amount: number, address: string, tag?: string, params?: {}): Promise<any>;
        request (path: string, api?: string, method?: string, params?: any, headers?: any, body?: any): Promise<any>;
        YmdHMS (timestamp: string, infix: string) : string;
        iso8601 (timestamp: string): string;
        seconds (): number;
        microseconds (): number;
    }

    /* tslint:disable */

    export class _1btcxe extends Exchange {}
    export class acx extends Exchange {}
    export class allcoin extends okcoinusd {}
    export class anxpro extends Exchange {}
    export class anybits extends bitsane {}
    export class bcex extends Exchange {}
    export class bibox extends Exchange {}
    export class bigone extends Exchange {}
    export class binance extends Exchange {}
    export class bit2c extends Exchange {}
    export class bitbank extends Exchange {}
    export class bitbay extends Exchange {}
    export class bitfinex extends Exchange {}
    export class bitfinex2 extends bitfinex {}
    export class bitflyer extends Exchange {}
    export class bitforex extends Exchange {}
    export class bithumb extends Exchange {}
    export class bitibu extends acx {}
    export class bitkk extends zb {}
    export class bitlish extends Exchange {}
    export class bitmarket extends Exchange {}
    export class bitmex extends Exchange {}
    export class bitsane extends Exchange {}
    export class bitso extends Exchange {}
    export class bitstamp extends Exchange {}
    export class bitstamp1 extends Exchange {}
    export class bittrex extends Exchange {}
    export class bitz extends Exchange {}
    export class bl3p extends Exchange {}
    export class bleutrade extends bittrex {}
    export class braziliex extends Exchange {}
    export class btcalpha extends Exchange {}
    export class btcbox extends Exchange {}
    export class btcchina extends Exchange {}
    export class btcexchange extends btcturk {}
    export class btcmarkets extends Exchange {}
    export class btctradeim extends coinegg {}
    export class btctradeua extends Exchange {}
    export class btcturk extends Exchange {}
    export class buda extends Exchange {}
    export class bxinth extends Exchange {}
    export class ccex extends Exchange {}
    export class cex extends Exchange {}
    export class chbtc extends zb {}
    export class chilebit extends foxbit {}
    export class cobinhood extends Exchange {}
    export class coinbase extends Exchange {}
    export class coinbaseprime extends gdax {}
    export class coinbasepro extends gdax {}
    export class coincheck extends Exchange {}
    export class coinegg extends Exchange {}
    export class coinex extends Exchange {}
    export class coinexchange extends Exchange {}
    export class coinfalcon extends Exchange {}
    export class coinfloor extends Exchange {}
    export class coingi extends Exchange {}
    export class coinmarketcap extends Exchange {}
    export class coinmate extends Exchange {}
    export class coinnest extends Exchange {}
    export class coinone extends Exchange {}
    export class coinspot extends Exchange {}
    export class cointiger extends huobipro {}
    export class coolcoin extends coinegg {}
    export class coss extends Exchange {}
    export class crex24 extends Exchange {}
    export class crypton extends Exchange {}
    export class cryptopia extends Exchange {}
    export class deribit extends Exchange {}
    export class dsx extends liqui {}
    export class ethfinex extends bitfinex {}
    export class exmo extends Exchange {}
    export class exx extends Exchange {}
    export class fcoin extends Exchange {}
    export class flowbtc extends Exchange {}
    export class foxbit extends Exchange {}
    export class fybse extends Exchange {}
    export class fybsg extends fybse {}
    export class gatecoin extends Exchange {}
    export class gateio extends Exchange {}
    export class gdax extends Exchange {}
    export class gemini extends Exchange {}
    export class getbtc extends _1btcxe {}
    export class hadax extends huobipro {}
    export class hitbtc extends Exchange {}
    export class hitbtc2 extends hitbtc {}
    export class huobipro extends Exchange {}
    export class ice3x extends Exchange {}
    export class independentreserve extends Exchange {}
    export class indodax extends Exchange {}
    export class itbit extends Exchange {}
    export class jubi extends btcbox {}
    export class kkex extends Exchange {}
    export class kraken extends Exchange {}
    export class kucoin extends Exchange {}
    export class kuna extends acx {}
    export class lakebtc extends Exchange {}
    export class lbank extends Exchange {}
    export class liqui extends Exchange {}
    export class liquid extends Exchange {}
    export class livecoin extends Exchange {}
    export class luno extends Exchange {}
    export class lykke extends Exchange {}
    export class mercado extends Exchange {}
    export class mixcoins extends Exchange {}
    export class negociecoins extends Exchange {}
    export class nova extends Exchange {}
    export class okcoincny extends okcoinusd {}
    export class okcoinusd extends Exchange {}
    export class okex extends okcoinusd {}
    export class paymium extends Exchange {}
    export class poloniex extends Exchange {}
    export class qryptos extends liquid {}
    export class quadrigacx extends Exchange {}
    export class quoinex extends liquid {}
    export class rightbtc extends Exchange {}
    export class southxchange extends Exchange {}
    export class surbitcoin extends foxbit {}
    export class theocean extends Exchange {}
    export class therock extends Exchange {}
    export class tidebit extends Exchange {}
    export class tidex extends liqui {}
    export class uex extends Exchange {}
    export class upbit extends Exchange {}
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
