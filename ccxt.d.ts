declare module 'ccxt' {

    /**
     * Represents an associative array of a same type.
     */
    interface Dictionary<T> {
        [key: string]: T;
    }

    // errors.js -----------------------------------------

    export class BaseError extends Error {
        constructor(message: string);
    }

    export class ExchangeError extends BaseError {}
    export class AuthenticationError extends ExchangeError {}
    export class PermissionDenied extends AuthenticationError {}
    export class AccountNotEnabled extends PermissionDenied {}
    export class AccountSuspended extends AuthenticationError {}
    export class ArgumentsRequired extends ExchangeError {}
    export class BadRequest extends ExchangeError {}
    export class BadSymbol extends BadRequest {}
    export class MarginModeAlreadySet extends BadRequest {}
    export class BadResponse extends ExchangeError {}
    export class NullResponse extends BadResponse {}
    export class InsufficientFunds extends ExchangeError {}
    export class InvalidAddress extends ExchangeError {}
    export class AddressPending extends InvalidAddress {}
    export class InvalidOrder extends ExchangeError {}
    export class OrderNotFound extends InvalidOrder {}
    export class OrderNotCached extends InvalidOrder {}
    export class CancelPending extends InvalidOrder {}
    export class OrderImmediatelyFillable extends InvalidOrder {}
    export class OrderNotFillable extends InvalidOrder {}
    export class DuplicateOrderId extends InvalidOrder {}
    export class NotSupported extends ExchangeError {}
    export class NetworkError extends BaseError {}
    export class DDoSProtection extends NetworkError {}
    export class RateLimitExceeded extends DDoSProtection {}
    export class ExchangeNotAvailable extends NetworkError {}
    export class OnMaintenance extends ExchangeNotAvailable {}
    export class InvalidNonce extends NetworkError {}
    export class RequestTimeout extends NetworkError {}

    // -----------------------------------------------

    export const version: string;
    export const exchanges: string[];

    export interface MinMax {
        min: number | undefined;
        max: number | undefined;
    }

    export interface Market {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        baseId: string;
        quoteId: string;
        active?: boolean | undefined;
        type?: string;
        spot?: boolean;
        margin?: boolean;
        swap?: boolean;
        future?: boolean;
        option?: boolean;
        contract?: boolean;
        settle?: string | undefined;
        settleId?: string | undefined;
        contractSize?: number | undefined;
        linear?: boolean | undefined;
        inverse?: boolean | undefined;
        expiry?: number | undefined;
        expiryDatetime?: string | undefined;
        strike?: number | undefined;
        optionType?: string | undefined;
        taker?: number | undefined;
        maker?: number | undefined;
        percentage?: boolean | undefined;
        tierBased?: boolean | undefined;
        feeSide?: string | undefined;
        precision: {
            amount: number | undefined,
            price: number | undefined
        };
        limits: {
            amount?: MinMax,
            cost?: MinMax,
            leverage?: MinMax,
            price?: MinMax,
        };
        info: any;
    }

    export interface Order {
        id: string;
        clientOrderId: string;
        datetime: string;
        timestamp: number;
        lastTradeTimestamp: number;
        status: 'open' | 'closed' | 'canceled';
        symbol: string;
        type: string;
        timeInForce?: string;
        side: 'buy' | 'sell';
        price: number;
        average?: number;
        amount: number;
        filled: number;
        remaining: number;
        cost: number;
        trades: Trade[];
        fee: Fee;
        info: any;
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
        info: any;                        // the original decoded JSON as is
        order?: string;                  // string order id or undefined/None/null
        price: number;                   // float price in quote currency
        timestamp: number;               // Unix timestamp in milliseconds
        type?: string;                   // order type, 'market', 'limit', ... or undefined/None/null
        side: 'buy' | 'sell';            // direction of the trade, 'buy' or 'sell'
        symbol: string;                  // symbol in CCXT format
        takerOrMaker: 'taker' | 'maker'; // string, 'taker' or 'maker'
        cost: number;                    // total cost (including fees), `price * amount`
        fee: Fee;
    }

    export interface Ticker {
        symbol: string;
        info: any;
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
        info: any;
        id: string;
        txid?: string;
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

    export interface Tickers extends Dictionary<Ticker> {
        info: any;
    }

    export interface Currency {
        id: string;
        code: string;
        numericId?: number;
        precision: number;
    }

    export interface Balance {
        free: number;
        used: number;
        total: number;
    }

    export interface PartialBalances extends Dictionary<number> {
    }

    export interface Balances extends Dictionary<Balance> {
        info: any;
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

    export interface WithdrawalResponse {
        info: any;
        id: string;
    }

    export interface DepositAddressResponse {
        currency: string;
        address: string;
        info: any;
        tag?: string;
    }

    /** [ timestamp, open, high, low, close, volume ] */
    export type OHLCV = [number, number, number, number, number, number];

    /** Request parameters */
    type Params = Dictionary<string | number | boolean | string[]>;

    export class Exchange {
        constructor(config?: {[key in keyof Exchange]?: Exchange[key]});
        // allow dynamic keys
        [key: string]: any;
        // properties
        version: string;
        apiKey: string;
        secret: string;
        password: string;
        uid: string;
        requiredCredentials: {
            apiKey: boolean;
            secret: boolean;
            uid: boolean;
            login: boolean;
            password: boolean;
            twofa: boolean;
            privateKey: boolean;
            walletAddress: boolean;
            token: boolean;
        };
        options: {
            [key: string]: any;
        };
        urls: {
            logo: string;
            api: string | Dictionary<string>;
            test: string | Dictionary<string>;
            www: string;
            doc: string[];
            api_management?: string;
            fees: string;
            referral: string;
        };
        precisionMode: number;
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
        countries: string[];
        // set by loadMarkets
        markets: Dictionary<Market>;
        markets_by_id: Dictionary<Market>;
        currencies: Dictionary<Currency>;
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
        timeframes: Dictionary<number | string>;
        has: Dictionary<boolean | 'emulated'>; // https://github.com/ccxt/ccxt/pull/1984
        balance: object;
        orderbooks: object;
        orders: object;
        trades: object;
        userAgent: { 'User-Agent': string } | false;
        limits: { amount: MinMax, price: MinMax, cost: MinMax };
        hasCancelAllOrders: boolean;
        hasCancelOrder: boolean;
        hasCancelOrders: boolean;
        hasCORS: boolean;
        hasCreateDepositAddress: boolean;
        hasCreateLimitOrder: boolean;
        hasCreateMarketOrder: boolean;
        hasCreateOrder: boolean;
        hasDeposit: boolean;
        hasEditOrder: boolean;
        hasFetchBalance: boolean;
        hasFetchBidsAsks: boolean;
        hasFetchClosedOrders: boolean;
        hasFetchCurrencies: boolean;
        hasFetchDepositAddress: boolean;
        hasFetchDeposits: boolean;
        hasFetchFundingFees: boolean;
        hasFetchL2OrderBook: boolean;
        hasFetchLedger: boolean;
        hasFetchMarkets: boolean;
        hasFetchMyTrades: boolean;
        hasFetchOHLCV: boolean;
        hasFetchOpenOrders: boolean;
        hasFetchOrder: boolean;
        hasFetchOrderBook: boolean;
        hasFetchOrderBooks: boolean;
        hasFetchOrders: boolean;
        hasFetchStatus: boolean;
        hasFetchTicker: boolean;
        hasFetchTickers: boolean;
        hasFetchTime: boolean;
        hasFetchTrades: boolean;
        hasFetchTradingFee: boolean;
        hasFetchTradingFees: boolean;
        hasFetchTradingLimits: boolean;
        hasFetchTransactions: boolean;
        hasFetchWithdrawals: boolean;
        hasPrivateAPI: boolean;
        hasPublicAPI: boolean;
        hasWithdraw: boolean;

        // methods
        account (): Balance;
        cancelAllOrders (...args: any): Promise<any>; // TODO: add function signatures
        cancelOrder (id: string, symbol?: string, params?: Params): Promise<Order>;
        cancelOrders (...args: any): Promise<any>; // TODO: add function signatures
        checkRequiredCredentials (): void;
        commonCurrencyCode (currency: string): string;
        createDepositAddress (currency: string, params?: Params): Promise<DepositAddressResponse>;
        createLimitOrder (symbol: string, side: Order['side'], amount: number, price: number, params?: Params): Promise<Order>;
        createLimitBuyOrder (symbol: string, amount: number, price: number, params?: Params): Promise<Order>;
        createLimitSellOrder (symbol: string, amount: number, price: number, params?: Params): Promise<Order>;
        createMarketOrder (symbol: string, side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
        createMarketBuyOrder (symbol: string, amount: number, params?: Params): Promise<Order>;
        createMarketSellOrder (symbol: string, amount: number, params?: Params): Promise<Order>;
        createOrder (symbol: string, type: Order['type'], side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
        decode (str: string): string;
        defaults (): any;
        defineRestApi (api: any, methodName: any, options?: Dictionary<any>): void;
        deposit (...args: any): Promise<any>; // TODO: add function signatures
        describe (): any;
        editOrder (id: string, symbol: string, type: Order['type'], side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
        encode (str: string): string;
        encodeURIComponent (...args: any[]): string;
        extractParams (str: string): string[];
        fetch (url: string, method?: string, headers?: any, body?: any): Promise<any>;
        fetch2 (path: any, api?: string, method?: string, params?: Params, headers?: any, body?: any): Promise<any>;
        fetchBalance (params?: Params): Promise<Balances>;
        fetchBidsAsks (symbols?: string[], params?: Params): Promise<any>;
        fetchClosedOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        fetchCurrencies (params?: Params): Promise<Dictionary<Currency>>;
        fetchDepositAddress (currency: string, params?: Params): Promise<DepositAddressResponse>;
        fetchDeposits (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
        fetchFreeBalance (params?: Params): Promise<PartialBalances>;
        fetchFundingFees (...args: any): Promise<any>; // TODO: add function signatures
        fetchL2OrderBook (...args: any): Promise<any>; // TODO: add function signatures
        fetchLedger (...args: any): Promise<any>; // TODO: add function signatures
        fetchMarkets (params?: Params): Promise<Market[]>;
        fetchMyTrades (symbol?: string, since?: any, limit?: any, params?: Params): Promise<Trade[]>;
        fetchOHLCV (symbol: string, timeframe?: string, since?: number, limit?: number, params?: Params): Promise<OHLCV[]>;
        fetchOpenOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        fetchOrder (id: string, symbol: string, params?: Params): Promise<Order>;
        fetchOrderBook (symbol: string, limit?: number, params?: Params): Promise<OrderBook>;
        fetchOrderBooks (...args: any): Promise<any>; // TODO: add function signatures
        fetchOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        fetchOrderStatus (id: string, market: string): Promise<string>;
        fetchPosition (symbol: string, params?: Params): Promise<any>;  // TODO: add function signatures
        fetchPositions (symbols?: string[], params?: Params): Promise<any>;  // TODO: add function signatures
        fetchPositionsRisk (symbols?: string[], params?: Params): Promise<any>;  // TODO: add function signatures
        fetchStatus (...args: any): Promise<any>; // TODO: add function signatures
        fetchTicker (symbol: string, params?: Params): Promise<Ticker>;
        fetchTickers (symbols?: string[], params?: Params): Promise<Dictionary<Ticker>>;
        fetchTime (params?: Params): Promise<number>;
        fetchTotalBalance (params?: Params): Promise<PartialBalances>;
        fetchTrades (symbol: string, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
        fetchTradingFee (...args: any): Promise<any>; // TODO: add function signatures
        fetchTradingFees (...args: any): Promise<any>; // TODO: add function signatures
        fetchTradingLimits (...args: any): Promise<any>; // TODO: add function signatures
        fetchTransactions (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
        fetchUsedBalance (params?: Params): Promise<PartialBalances>;
        fetchWithdrawals (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
        getMarket (symbol: string): Market;
        initRestRateLimiter (): void;
        iso8601 (timestamp: number | string): string;
        loadMarkets (reload?: boolean): Promise<Dictionary<Market>>;
        market (symbol: string): Market;
        marketId (symbol: string): string;
        marketIds (symbols: string[]): string[];
        microseconds (): number;
        nonce (): number;
        parseTimeframe (timeframe: string): number;
        purgeCachedOrders (timestamp: number): void;
        request (path: string, api?: string, method?: string, params?: Params, headers?: any, body?: any): Promise<any>;
        seconds (): number;
        setMarkets (markets: Market[], currencies?: Currency[]): Dictionary<Market>;
        symbol (symbol: string): string;
        withdraw (currency: string, amount: number, address: string, tag?: string, params?: Params): Promise<WithdrawalResponse>;
        YmdHMS (timestamp: string, infix: string) : string;
    }
    
    /* tslint:disable */

    export class alpaca extends Exchange {}
    export class ascendex extends Exchange {}
    export class bequant extends hitbtc {}
    export class bigone extends Exchange {}
    export class binance extends Exchange {}
    export class binancecoinm extends binance {}
    export class binanceus extends binance {}
    export class binanceusdm extends binance {}
    export class bit2c extends Exchange {}
    export class bitbank extends Exchange {}
    export class bitbay extends zonda {}
    export class bitbns extends Exchange {}
    export class bitcoincom extends fmfwio {}
    export class bitfinex extends Exchange {}
    export class bitfinex2 extends Exchange {}
    export class bitflyer extends Exchange {}
    export class bitforex extends Exchange {}
    export class bitget extends Exchange {}
    export class bithumb extends Exchange {}
    export class bitmart extends Exchange {}
    export class bitmex extends Exchange {}
    export class bitopro extends Exchange {}
    export class bitpanda extends Exchange {}
    export class bitrue extends Exchange {}
    export class bitso extends Exchange {}
    export class bitstamp extends Exchange {}
    export class bitstamp1 extends Exchange {}
    export class bittrex extends Exchange {}
    export class bitvavo extends Exchange {}
    export class bkex extends Exchange {}
    export class bl3p extends Exchange {}
    export class blockchaincom extends Exchange {}
    export class btcalpha extends Exchange {}
    export class btcbox extends Exchange {}
    export class btcex extends Exchange {}
    export class btcmarkets extends Exchange {}
    export class btctradeua extends Exchange {}
    export class btcturk extends Exchange {}
    export class buda extends Exchange {}
    export class bybit extends Exchange {}
    export class cex extends Exchange {}
    export class coinbase extends Exchange {}
    export class coinbaseprime extends coinbasepro {}
    export class coinbasepro extends Exchange {}
    export class coincheck extends Exchange {}
    export class coinex extends Exchange {}
    export class coinfalcon extends Exchange {}
    export class coinmate extends Exchange {}
    export class coinone extends Exchange {}
    export class coinspot extends Exchange {}
    export class cryptocom extends Exchange {}
    export class currencycom extends Exchange {}
    export class delta extends Exchange {}
    export class deribit extends Exchange {}
    export class digifinex extends Exchange {}
    export class exmo extends Exchange {}
    export class flowbtc extends ndax {}
    export class fmfwio extends hitbtc {}
    export class gate extends Exchange {}
    export class gateio extends gate {}
    export class gemini extends Exchange {}
    export class hitbtc extends Exchange {}
    export class hitbtc3 extends Exchange {}
    export class hollaex extends Exchange {}
    export class huobi extends Exchange {}
    export class huobijp extends Exchange {}
    export class huobipro extends huobi {}
    export class idex extends Exchange {}
    export class independentreserve extends Exchange {}
    export class indodax extends Exchange {}
    export class itbit extends Exchange {}
    export class kraken extends Exchange {}
    export class kucoin extends Exchange {}
    export class kucoinfutures extends kucoin {}
    export class kuna extends Exchange {}
    export class latoken extends Exchange {}
    export class lbank extends Exchange {}
    export class lbank2 extends Exchange {}
    export class luno extends Exchange {}
    export class lykke extends Exchange {}
    export class mercado extends Exchange {}
    export class mexc extends Exchange {}
    export class mexc3 extends Exchange {}
    export class ndax extends Exchange {}
    export class novadax extends Exchange {}
    export class oceanex extends Exchange {}
    export class okcoin extends Exchange {}
    export class okex extends okx {}
    export class okex5 extends okex {}
    export class okx extends Exchange {}
    export class paymium extends Exchange {}
    export class phemex extends Exchange {}
    export class poloniex extends Exchange {}
    export class probit extends Exchange {}
    export class ripio extends Exchange {}
    export class stex extends Exchange {}
    export class therock extends Exchange {}
    export class tidex extends Exchange {}
    export class timex extends Exchange {}
    export class tokocrypto extends Exchange {}
    export class upbit extends Exchange {}
    export class wavesexchange extends Exchange {}
    export class wazirx extends Exchange {}
    export class whitebit extends Exchange {}
    export class woo extends Exchange {}
    export class yobit extends Exchange {}
    export class zaif extends Exchange {}
    export class zb extends Exchange {}
    export class zipmex extends ndax {}
    export class zonda extends Exchange {}

    
    /* tslint:enable */

    export type ExchangeId =
        | 'alpaca'
        | 'ascendex'
        | 'bequant'
        | 'bigone'
        | 'binance'
        | 'binancecoinm'
        | 'binanceus'
        | 'binanceusdm'
        | 'bit2c'
        | 'bitbank'
        | 'bitbay'
        | 'bitbns'
        | 'bitcoincom'
        | 'bitfinex'
        | 'bitfinex2'
        | 'bitflyer'
        | 'bitforex'
        | 'bitget'
        | 'bithumb'
        | 'bitmart'
        | 'bitmex'
        | 'bitopro'
        | 'bitpanda'
        | 'bitrue'
        | 'bitso'
        | 'bitstamp'
        | 'bitstamp1'
        | 'bittrex'
        | 'bitvavo'
        | 'bkex'
        | 'bl3p'
        | 'blockchaincom'
        | 'btcalpha'
        | 'btcbox'
        | 'btcex'
        | 'btcmarkets'
        | 'btctradeua'
        | 'btcturk'
        | 'buda'
        | 'bybit'
        | 'cex'
        | 'coinbase'
        | 'coinbaseprime'
        | 'coinbasepro'
        | 'coincheck'
        | 'coinex'
        | 'coinfalcon'
        | 'coinmate'
        | 'coinone'
        | 'coinspot'
        | 'cryptocom'
        | 'currencycom'
        | 'delta'
        | 'deribit'
        | 'digifinex'
        | 'exmo'
        | 'flowbtc'
        | 'fmfwio'
        | 'gate'
        | 'gateio'
        | 'gemini'
        | 'hitbtc'
        | 'hitbtc3'
        | 'hollaex'
        | 'huobi'
        | 'huobijp'
        | 'huobipro'
        | 'idex'
        | 'independentreserve'
        | 'indodax'
        | 'itbit'
        | 'kraken'
        | 'kucoin'
        | 'kucoinfutures'
        | 'kuna'
        | 'latoken'
        | 'lbank'
        | 'lbank2'
        | 'luno'
        | 'lykke'
        | 'mercado'
        | 'mexc'
        | 'mexc3'
        | 'ndax'
        | 'novadax'
        | 'oceanex'
        | 'okcoin'
        | 'okex'
        | 'okex5'
        | 'okx'
        | 'paymium'
        | 'phemex'
        | 'poloniex'
        | 'probit'
        | 'ripio'
        | 'stex'
        | 'therock'
        | 'tidex'
        | 'timex'
        | 'tokocrypto'
        | 'upbit'
        | 'wavesexchange'
        | 'wazirx'
        | 'whitebit'
        | 'woo'
        | 'yobit'
        | 'zaif'
        | 'zb'
        | 'zipmex'
        | 'zonda'
        

    // Pro related exports
    class ExchangePro extends Exchange {
        watchTicker (symbol: string, params?: Params): Promise<Ticker>;
        watchTickers (symbols?: string[], params?: Params): Promise<Dictionary<Ticker>>;
        watchOrderBook (symbol: string, limit?: number, params?: Params): Promise<OrderBook>;
        watchOHLCV (symbol: string, timeframe?: string, since?: number, limit?: number, params?: Params): Promise<OHLCV[]>;
        watchTrades (symbol: string, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
        watchBalance (params?: Params): Promise<Balances>;
        watchOrder (id: string, symbol: string, params?: Params): Promise<Order>;
        watchOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchOpenOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchClosedOrders (symbol?: string, since?: number, limit?: number, params?: Params): Promise<Order[]>;
        watchMyTrades (symbol?: string, since?: any, limit?: any, params?: Params): Promise<Trade[]>;
    }

    export namespace pro {
        export const exchanges: string[]
        class Exchange  extends ExchangePro {}
        class alpaca extends Exchange {}
        class ascendex extends Exchange {}
        class bequant extends Exchange {}
        class binance extends Exchange {}
        class binancecoinm extends Exchange {}
        class binanceus extends Exchange {}
        class binanceusdm extends Exchange {}
        class bitcoincom extends Exchange {}
        class bitfinex extends Exchange {}
        class bitfinex2 extends Exchange {}
        class bitget extends Exchange {}
        class bitmart extends Exchange {}
        class bitmex extends Exchange {}
        class bitopro extends Exchange {}
        class bitrue extends Exchange {}
        class bitstamp extends Exchange {}
        class bittrex extends Exchange {}
        class bitvavo extends Exchange {}
        class bybit extends Exchange {}
        class cex extends Exchange {}
        class coinbaseprime extends Exchange {}
        class coinbasepro extends Exchange {}
        class coinex extends Exchange {}
        class cryptocom extends Exchange {}
        class currencycom extends Exchange {}
        class deribit extends Exchange {}
        class exmo extends Exchange {}
        class gate extends Exchange {}
        class gateio extends Exchange {}
        class hitbtc extends Exchange {}
        class hollaex extends Exchange {}
        class huobi extends Exchange {}
        class huobijp extends Exchange {}
        class huobipro extends Exchange {}
        class idex extends Exchange {}
        class kraken extends Exchange {}
        class kucoin extends Exchange {}
        class luno extends Exchange {}
        class mexc extends Exchange {}
        class ndax extends Exchange {}
        class okcoin extends Exchange {}
        class okex extends Exchange {}
        class okx extends Exchange {}
        class phemex extends Exchange {}
        class ripio extends Exchange {}
        class upbit extends Exchange {}
        class wazirx extends Exchange {}
        class whitebit extends Exchange {}
        class woo extends Exchange {}
        class zb extends Exchange {}
        class zipmex extends Exchange {}
    }
}