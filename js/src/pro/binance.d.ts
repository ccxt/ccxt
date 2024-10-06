import binanceRest from '../binance.js';
import type { Int, OrderSide, OrderType, Str, Strings, Trade, OrderBook, Order, Ticker, Tickers, OHLCV, Position, Balances, Num, Dict, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class binance extends binanceRest {
    describe(): any;
    describeData(): {
        has: {
            ws: boolean;
            watchBalance: boolean;
            watchLiquidations: boolean;
            watchLiquidationsForSymbols: boolean;
            watchMyLiquidations: boolean;
            watchMyLiquidationsForSymbols: boolean;
            watchBidsAsks: boolean;
            watchMyTrades: boolean;
            watchOHLCV: boolean;
            watchOHLCVForSymbols: boolean;
            watchOrderBook: boolean;
            watchOrderBookForSymbols: boolean;
            watchOrders: boolean;
            watchOrdersForSymbols: boolean;
            watchPositions: boolean;
            watchTicker: boolean;
            watchTickers: boolean;
            watchMarkPrices: boolean;
            watchMarkPrice: boolean;
            watchTrades: boolean;
            watchTradesForSymbols: boolean;
            createOrderWs: boolean;
            editOrderWs: boolean;
            cancelOrderWs: boolean;
            cancelOrdersWs: boolean;
            cancelAllOrdersWs: boolean;
            fetchBalanceWs: boolean;
            fetchDepositsWs: boolean;
            fetchMarketsWs: boolean;
            fetchMyTradesWs: boolean;
            fetchOHLCVWs: boolean;
            fetchOrderBookWs: boolean;
            fetchOpenOrdersWs: boolean;
            fetchOrderWs: boolean;
            fetchOrdersWs: boolean;
            fetchPositionWs: boolean;
            fetchPositionForSymbolWs: boolean;
            fetchPositionsWs: boolean;
            fetchTickerWs: boolean;
            fetchTradesWs: boolean;
            fetchTradingFeesWs: boolean;
            fetchWithdrawalsWs: boolean;
        };
        urls: {
            test: {
                ws: {
                    spot: string;
                    margin: string;
                    future: string;
                    delivery: string;
                    'ws-api': {
                        spot: string;
                        future: string;
                    };
                };
            };
            api: {
                ws: {
                    spot: string;
                    margin: string;
                    future: string;
                    delivery: string;
                    'ws-api': {
                        spot: string;
                        future: string;
                    };
                    papi: string;
                };
            };
            doc: string;
        };
        streaming: {
            keepAlive: number;
        };
        options: {
            returnRateLimits: boolean;
            streamLimits: {
                spot: number;
                margin: number;
                future: number;
                delivery: number;
            };
            subscriptionLimitByStream: {
                spot: number;
                margin: number;
                future: number;
                delivery: number;
            };
            streamBySubscriptionsHash: {};
            streamIndex: number;
            watchOrderBookRate: number;
            liquidationsLimit: number;
            myLiquidationsLimit: number;
            tradesLimit: number;
            ordersLimit: number;
            OHLCVLimit: number;
            requestId: {};
            watchOrderBookLimit: number;
            watchTrades: {
                name: string;
            };
            watchTicker: {
                name: string;
            };
            watchTickers: {
                name: string;
            };
            watchOHLCV: {
                name: string;
            };
            watchOrderBook: {
                maxRetries: number;
                checksum: boolean;
            };
            watchBalance: {
                fetchBalanceSnapshot: boolean;
                awaitBalanceSnapshot: boolean;
            };
            watchLiquidationsForSymbols: {
                defaultType: string;
            };
            watchPositions: {
                fetchPositionsSnapshot: boolean;
                awaitPositionsSnapshot: boolean;
            };
            wallet: string;
            listenKeyRefreshRate: number;
            ws: {
                cost: number;
            };
            tickerChannelsMap: {
                '24hrTicker': string;
                '24hrMiniTicker': string;
                markPriceUpdate: string;
                '1hTicker': string;
                '4hTicker': string;
                '1dTicker': string;
                bookTicker: string;
            };
        };
    };
    requestId(url: any): any;
    stream(type: Str, subscriptionHash: Str, numSubscriptions?: number): string;
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    watchLiquidationsForSymbols(symbols?: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleLiquidation(client: Client, message: any): void;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    watchMyLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    watchMyLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleMyLiquidation(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    fetchOrderBookWs(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleFetchOrderBook(client: Client, message: any): void;
    fetchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<void>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscription(client: Client, subscription: Dict): void;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleFetchOHLCV(client: Client, message: any): void;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMultiTickerHelper(methodName: any, channelName: string, symbols?: Strings, params?: {}): Promise<any>;
    parseWsTicker(message: any, marketType: any): Ticker;
    handleTickerWs(client: Client, message: any): void;
    handleBidsAsks(client: Client, message: any): void;
    handleTickers(client: Client, message: any): void;
    handleTickersAndBidsAsks(client: Client, message: any, methodType: any): void;
    getMessageHash(channelName: string, symbol: Str, isBidAsk: boolean): string;
    signParams(params?: {}): any;
    authenticate(params?: {}): Promise<void>;
    keepAliveListenKey(params?: {}): Promise<void>;
    setBalanceCache(client: Client, type: any, isPortfolioMargin?: boolean): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any, isPortfolioMargin: any): Promise<void>;
    fetchBalanceWs(params?: {}): Promise<Balances>;
    handleBalanceWs(client: Client, message: any): void;
    handleAccountStatusWs(client: Client, message: any): void;
    fetchPositionWs(symbol: string, params?: {}): Promise<Position[]>;
    fetchPositionsWs(symbols?: Strings, params?: {}): Promise<Position[]>;
    handlePositionsWs(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    getMarketType(method: any, market: any, params?: {}): any;
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleOrderWs(client: Client, message: any): void;
    handleOrdersWs(client: Client, message: any): void;
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    handleEditOrderWs(client: Client, message: any): void;
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderUpdate(client: Client, message: any): void;
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings, isPortfolioMargin?: boolean): void;
    loadPositionsSnapshot(client: any, messageHash: any, type: any, isPortfolioMargin: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    fetchMyTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTradesWs(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    handleAcountUpdate(client: any, message: any): void;
    handleWsError(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
