import Exchange from './abstract/bitmart.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, Dict, OrderRequest, int } from './base/types.js';
/**
 * @class bitmart
 * @augments Exchange
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
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: Dict;
        deposit: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
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
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    customParseBalance(response: any, marketType: any): Balances;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderSide(side: any): string;
    parseOrderStatusByType(type: any, status: any): string;
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createSwapOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<any[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: string;
        address: string;
        tag: string;
        network: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        info: any;
        currency: string;
        address: string;
        tag: string;
        network: any;
    };
    safeNetworkCode(networkId: any, currency?: any): string;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<any>;
    fetchTransactionsByType(type: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<any>;
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: string;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    fetchIsolatedBorrowRates(params?: {}): Promise<IsolatedBorrowRates>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransferStatus(status: Str): Str;
    parseTransferToAccount(type: any): string;
    parseTransferFromAccount(type: any): string;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: Dict, market?: Market): {
        symbol: string;
        marginMode: string;
        currency: string;
        interest: number;
        interestRate: number;
        amountBorrowed: number;
        timestamp: number;
        datetime: string;
        info: Dict;
    };
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
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
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
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
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
