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
            'name': 'Foxbit',
            'country': [ 'pt-BR' ],
            'rateLimit': 1000,
            'version': '1',
            'comment': 'Foxbit Exchange',
            'urls': {
                'logo': 'https://foxbit.com.br/wp-content/uploads/2024/05/Logo_Foxbit.png',
                'api': 'https://api.foxbit.com.br',
                'www': 'https://app.foxbit.com.br',
                'doc': [
                    'https://docs.foxbit.com.br',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'rest/v3/currencies',
                        'rest/v3/markets',
                        'rest/v3/markets/{market}/orderbook',
                    ],
                },
            },
            'has': {
                'CORS': true,
                'fetchOrderBooks': false,
                'fetchOrderBook': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
            },
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        // {
        //   "data": [
        //     {
        //       "symbol": "btc",
        //       "name": "Bitcoin",
        //       "type": "CRYPTO",
        //       "precision": 8,
        //       "deposit_info": {
        //         "min_to_confirm": "1",
        //         "min_amount": "0.0001"
        //       },
        //       "withdraw_info": {
        //         "enabled": true,
        //         "min_amount": "0.0001",
        //         "fee": "0.0001"
        //       },
        //       "category": {
        //           "code": "cripto",
        //         "name": "Cripto"
        //       }
        //     }
        //   ]
        // }

        return {};
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        //  {
        //    "data": [
        //      {
        //        "symbol": "usdtbrl",
        //        "quantity_min": "0.00002",
        //        "quantity_increment": "0.00001",
        //        "price_min": "1.0",
        //        "price_increment": "0.0001",
        //        "base": {
        //          "symbol": "btc",
        //          "name": "Bitcoin",
        //          "type": "CRYPTO",
        //          "precision": 8,
        //          "deposit_info": {
        //            "min_to_confirm": "1",
        //            "min_amount": "0.0001"
        //          },
        //          "withdraw_info": {
        //            "enabled": true,
        //            "min_amount": "0.0001",
        //            "fee": "0.0001"
        //          },
        //          "category": {
        //            "code": "cripto",
        //            "name": "Cripto"
        //          }
        //        },
        //        "quote": {
        //          "symbol": "btc",
        //          "name": "Bitcoin",
        //          "type": "CRYPTO",
        //          "precision": 8,
        //          "deposit_info": {
        //            "min_to_confirm": "1",
        //            "min_amount": "0.0001"
        //          },
        //          "withdraw_info": {
        //            "enabled": true,
        //            "min_amount": "0.0001",
        //            "fee": "0.0001"
        //          },
        //          "category": {
        //            "code": "cripto",
        //            "name": "Cripto"
        //          }
        //        }
        //      }
        //    ]
        //  }

        return [];
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        return undefined;
    }

    async fetchTradingLimits (symbols: string[], params: {}): Promise<{}> {
        return [];
    }

    async fetchTradingFees (params: {}): Promise<TradingFees> {
        return {};
    }

    async fetchOrderBook (symbol: string, params: {}, limit: Int = 20): Promise<OrderBook> {
        //  {
        //    "sequence_id": 1234567890,
        //    "timestamp": 1713187921336,
        //    "bids": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "1.70000000",
        //        "310.00000000"
        //      ]
        //    ],
        //    "asks": [
        //      [
        //        "3.00000000",
        //        "300.00000000"
        //      ],
        //      [
        //        "2.00000000",
        //        "321.00000000"
        //      ]
        //    ]
        //  }
        return undefined;
    }

    async fetchOrderBooks (symbols: string[], limit?: number, params?: {}): Promise<Dictionary<OrderBook>> {
        // NAO TEMOS ENDPOINT
        return undefined;
    }

    async fetchTrades (symbol: string, since?: number, limit?: number, params?: {}): Promise<Trade[]> {
        return [];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return [];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        return undefined;
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return [];
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        return [];
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return undefined;
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<{}> {
        return {};
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        return undefined;
    }

    async fetchOrders (symbol?: string, since?: number, limit?: number, params?: {}): Promise<Order[]> {
        return []; // Coinex não possui essa function
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return [];
    }
}

