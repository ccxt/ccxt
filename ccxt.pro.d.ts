declare module 'ccxt.pro' {

    export const version: string;
    export const exchanges: string[];

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

    import {
        Exchange as BaseExchange,
        Balances,
        Dictionary,
        OHLCV,
        Order,
        OrderBook,
        Params,
        Ticker,
        Trade,
    } from 'ccxt'

    // default interfaces
    export {
        Balance,
        Balances,
        Currency,
        DepositAddress,
        DepositAddressResponse,
        ExchangeId,
        Fee,
        Market,
        OHLCV,
        Order,
        OrderBook,
        PartialBalances,
        Ticker,
        Tickers,
        Trade,
        Transaction,
        WithdrawalResponse,
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
    export class ascendex extends Exchange {}
    export class bequant extends hitbtc {}
    export class binance extends Exchange {}
    export class binancecoinm extends binance {}
    export class binanceus extends binance {}
    export class binanceusdm extends binance {}
    export class bitcoincom extends hitbtc {}
    export class bitfinex extends Exchange {}
    export class bitfinex2 extends Exchange {}
    export class bitmart extends Exchange {}
    export class bitmex extends Exchange {}
    export class bitopro extends Exchange {}
    export class bitstamp extends Exchange {}
    export class bittrex extends Exchange {}
    export class bitvavo extends Exchange {}
    export class bybit extends Exchange {}
    export class cdax extends Exchange {}
    export class coinbaseprime extends coinbasepro {}
    export class coinbasepro extends Exchange {}
    export class coinex extends Exchange {}
    export class cryptocom extends Exchange {}
    export class currencycom extends Exchange {}
    export class exmo extends Exchange {}
    export class ftx extends Exchange {}
    export class ftxus extends ftx {}
    export class gate extends Exchange {}
    export class gateio extends gate {}
    export class hitbtc extends Exchange {}
    export class hollaex extends Exchange {}
    export class huobi extends Exchange {}
    export class huobijp extends Exchange {}
    export class huobipro extends huobi {}
    export class idex extends Exchange {}
    export class kraken extends Exchange {}
    export class kucoin extends Exchange {}
    export class mexc extends Exchange {}
    export class ndax extends Exchange {}
    export class okcoin extends Exchange {}
    export class okex extends okx {}
    export class okx extends Exchange {}
    export class phemex extends Exchange {}
    export class ripio extends Exchange {}
    export class upbit extends Exchange {}
    export class whitebit extends Exchange {}
    export class zb extends Exchange {}
    export class zipmex extends ndax {}

    /* tslint:enable */

}
