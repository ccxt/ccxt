import Exchange from './abstract/foxbit';
import type { Currencies, Market, OrderBook, Ticker, TradingFees, Int, Str, Num, Dictionary, Trade, OHLCV, Balances, Order, Account, OrderType, OrderSide } from './base/types.js';

/**
 * @class foxbit
 * @augments Exchange
 */
export default class foxbit extends Exchange {
    decribe () {
        return this.deepExtend (super.describe (), {
            'id': 'foxbit',
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        return {};
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        return [];
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        return false;
    }

    async fetchTradingLimits (symbols: string[], params: {}): Promise<{}> {
        return [];
    }

    async fetchTradingFees (params: {}): Promise<TradingFees> {
        return {};
    }

    async fetchOrderBook (symbol: string, params: {}, limit: Int = 20): Promise<OrderBook> {
        return [];
    }

    async fetchOrderBooks (symbols: string[], limit?: number, params?: {}): Promise<Dictionary<OrderBook>> {
        return [];
    }

    async fetchTrades (symbol: string, since?: number, limit?: number, params?: {}): Promise<Trade[]> {
        return [];
    }

    async fetchOHLCV (symbol: string, timeframe = "1m", since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return [];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        return {};
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return [];
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        return [];
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return {};
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<{}> {
        return {};
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        return {};
    }

    async fetchOrders (symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]> {
        return []; // Coinex não possui essa function
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return [];
    }
}

