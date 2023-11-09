import Exchange from './abstract/bitmart.js';
import { Int, OrderSide, Balances, OrderType, OHLCV, Order, Trade, Transaction, Ticker, OrderBook } from './base/types.js';
/**
 * @class bitmart
 * @extends Exchange
 */
export default class bitmart extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchStatus(params?: {}): Promise<{
        status: any;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchContractMarkets(params?: {}): Promise<any[]>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {};
        deposit: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: any): {
        info: any;
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    }>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: any): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    customParseBalance(response: any, marketType: any): Balances;
    parseBalanceHelper(entry: any): import("./base/types.js").Balance;
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    parseOrder(order: any, market?: any): Order;
    parseOrderSide(side: any): string;
    parseOrderStatusByType(type: any, status: any): string;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    safeNetwork(networkId: any): any;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<any>;
    fetchTransactionsByType(type: any, code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDeposit(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawal(id: string, code?: string, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): Transaction;
    repayMargin(code: string, amount: any, symbol?: string, params?: {}): Promise<any>;
    borrowMargin(code: string, amount: any, symbol?: string, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: any): {
        id: string;
        currency: any;
        amount: any;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowRate(code: string, params?: {}): Promise<{
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseBorrowRate(info: any, currency?: any): {
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowRates(params?: {}): Promise<any[]>;
    parseBorrowRates(info: any, codeKey: any): any[];
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    parseTransferStatus(status: any): string;
    parseTransferToAccount(type: any): string;
    parseTransferFromAccount(type: any): string;
    parseTransfer(transfer: any, currency?: any): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
    };
    fetchTransfers(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchBorrowInterest(code?: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: any): {
        symbol: string;
        marginMode: string;
        currency: any;
        interest: number;
        interestRate: number;
        amountBorrowed: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: any): import("./base/types.js").OpenInterest;
    setLeverage(leverage: any, symbol?: string, params?: {}): Promise<any>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: number;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: any): {
        info: any;
        symbol: any;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: number;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: string[], params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: any): import("./base/types.js").Position;
    fetchMyLiquidations(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: any): import("./base/types.js").Liquidation;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
