'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, NotSupported, PermissionDenied, InvalidNonce, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------



module.exports = class tokens extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokens',
            'name': 'Tokens',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'fetchDepositAddress': true,
                'fetchOrder': 'emulated',
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                // 'logo': '',
                'api': 'https://api.tokens.net/',
                'www': 'https://www.tokens.net',
                'doc': 'https://www.tokens.net/api/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            },
            'api': {
                'public': {
                    'get': [
                        'public/ticker/{pair}/',
                        'public/ticker/hour/{pair}/',
                        'public/trades/minute/{pair}/',
                        'public/trades/hour/{pair}/',
                        'public/trades/day/{pair}/',
                        'public/trading-pairs/get/all/',
                        'public/order-book/{pair}/'
                    ],
                },
                'private': {
                    'get': [
                       '/private/balance/{currency}/',
                       '/private/orders/get/all/',
                       '/private/orders/get/{id}/',
                       '/private/orders/get/{trading_pair}/'  
                    ],
                    'post' : [
                        '/private/orders/add/limit/',
                        '/private/orders/cancel/{id}/'
                    ]
                }
            },
            // https://www.tokens.net/fees/
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.0 / 100
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ADA': 15,
                        'BAT': 2,
                        'BCH': 0.0001,
                        'BIT': 30,
                        'BSV': 0.0001,
                        'BTC': 0.0002,
                        'DAI': 1,
                        'DPP': 100,
                        'DTR': 30,
                        'ELI': 100,
                        'ETH':0.005,
                        'EURS': 1.5,
                        'GUSD': 1,
                        'LANA': 5000,
                        'LTC': 0.002,
                        'MRP': 100,
                        'PAX': 1,
                        'TAJ': 300,
                        'TUSD': 1,
                        'USDC': 1,
                        'USDT-ERC': 1,
                        'USDT-OMNI': 3,
                        'VTY': 300,
                        'XAUR': 15,
                        'XLM': 0.1,
                        'XRM': 0.0001,
                        'XRP' : 0.05
                    }
                },
            },
            'exceptions': {
                // 100 API Key is missing
                // 101 Nonce is missing
                // 102 Signature is missing
                // 110 Nonce has to be integer
                // 111 Provided nonce is less or equal to the last nonce
                // 120 Invalid API key
                // 121 Signature is invalid
                // 130 Invalid trading pair
                // 131 Invalid order id
                // 140 Only opened orders can be canceled
                // 150 Parameter {parameter} is invalid with error: {error}
                // 160 Invalid currency code
                // 429 API rate limit exceeded
            },
        });
    }

    async fetchMarkets (params = {}) {}

    async fetchOrderBook (symbol, limit = undefined, params = {}) {}

    async fetchTicker (symbol, params = {}) {}

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {}

    async fetchBalance (params = {}) {}

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {}

    async cancelOrder (id, symbol = undefined, params = {}) {}

    async fetchOrderStatus (id, symbol = undefined, params = {}) {}

    async fetchOrder (id, symbol = undefined, params = {}) {}

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {}

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {}

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {}

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {}

    async fetchDepositAddress (code, params = {}) {}

    async withdraw (code, amount, address, tag = undefined, params = {}) {}

    // error example:
    // {
    // "timestamp": 1234567890,
    // "status": error,
    // "errorCode": 100,
    // "reason": API Key is missing
    // }

    handleErrors (httpCode, reason, url, method, headers, body, response) {}

};




// import {Exchange, OrderBook, Trade} from "ccxt";

// const https = require("https");

// module.exports = class tokens extends Exchange {
//     describe()  {
//         return this.deepExtend(super.describe(), {
//             id: "tokens",
//             name: "Tokens",
//             rateLimit: 1000,
//             urls: {
//                 api: "https://api.tokens.net/",
//             },
//             requiredCredentials: {
//                 apiKey: true,
//                 secret: true,
//                 uid: true,
//             },
//             api: {
//                 public: {
//                     get: [
//                         "public/trades/hour/{pair}/",
//                     ],
//                 },
//             },
//         });
//     }

//     // @ts-ignore
//      async loadMarkets(reload)  {
//         return {
//             "DPP/ETH": {
//                 id: "DPPETH",
//                 symbol: "DPP/ETH",
//                 base: "DPP",
//                 quote: "ETH",
//             },
//         };
//     }

//      async fetchTrades(symbol, since, limit, params) {
//         const market = this.formatSymbol(this.formatSymbol(symbol));
//         let response;

//         try {
//             response = await this.makeTradesCallToApi(market);
//         } catch (e) {
//             throw new Error(`Could not fetch trades from tokens for pair ${symbol}`);
//         }

//         if (response === undefined || response.status !== "ok") {
//             Logger.error(response);
//             throw new Error(`Error on ${this.constructor.name} exchange fetching pair ${symbol}`);
//         }

//         return this.parseTrades(response, market, since, limit);
//     }

//      async fetchOrderBook(symbol, limit, params) {
//         const market = this.formatSymbol(this.formatSymbol(symbol));
//         let response;

//         try {
//             response = await this.makeOrderbookCallToApi(market);
//         } catch (e) {
//             throw new Error(`Could not fetch order book from tokens for pair ${symbol}`);
//         }

//         if (response === undefined || response.status !== "ok") {
//             Logger.error(response);
//             throw new Error(`Error on ${this.constructor.name} exchange fetching pair ${symbol}`);
//         }

//         return this.parseOrderBook(response, market);
//     }

//      async makeTradesCallToApi(market) {
//         return new Promise((resolve, reject) => {
//             https.get(`https://api.tokens.net/public/trades/hour/${market}/`, (resp) => {
//                 let data = "";

//                 resp.on("data", (chunk) => {
//                     data += chunk;
//                 });

//                 resp.on("end", () => {

//                     try {

//                         const parsed = JSON.parse(data);
//                         resolve(parsed);

//                     } catch (error) {

//                         Logger.error(error.message);
//                         Logger.debug(data);
//                         reject(error)
//                     }
//                 });
//             }).on('error', (error) => {
//                 Logger.error(error.message);
//                 reject(error)
//             });
//         });

//     }

//      async makeOrderbookCallToApi(market) {
//         return new Promise((resolve, reject) => {
//             https.get(`https://api.tokens.net/public/order-book/${market}/`, (resp
//             ) => {
//                 let data = "";

//                 resp.on("data", (chunk) => {
//                     data += chunk;
//                 });

//                 resp.on("end", () => {

//                     try {

//                         const parsed = JSON.parse(data);
//                         resolve(parsed);

//                     } catch (error) {

//                         Logger.error(error.message);
//                         Logger.debug(data);
//                         reject(error)
//                     }
//                 });
//             }).on('error', (error) => {
//                 Logger.error(error.message);
//                 reject(error)
//             });
//         });

//     }

//      async parseTrades(trades, market, since, limit) {
//         let tradeList = [];

//         if (trades.trades.length === 0) {
//             return [];
//         }

//         for (const trade of trades.trades) {
//             const parsedTrade = await this.parseTrade(trade);
//             tradeList.push(parsedTrade);
//         }

//         return tradeList;
//     }

//      async parseOrderBook(orderbook, market) {

//         orderbook.asks = orderbook.asks.map((item) => {
//             return [parseFloat(item[1]), parseFloat(item[0])];
//         });

//         orderbook.bids = orderbook.bids.map((item) => {
//             return [parseFloat(item[1]), parseFloat(item[0])];
//         });

//         return {
//             asks: orderbook.asks,
//             bids: orderbook.bids,
//             datetime: this.iso8601(orderbook.timestamp),
//             timestamp: orderbook.timestamp * 1000,
//             nonce: parseInt((Math.floor(Math.random() * 9999) + 1000).toString() + orderbook.timestamp.toString(), 10),
//         };
//     }

//     formatSymbol(symbol) {
//         return symbol.replace("/", "").toLowerCase();
//     }

//     async parseTrade(tradeItem) {
//         return {
//             amount: parseFloat(tradeItem.amount),
//             datetime: new Date(tradeItem.datetime).toISOString(),
//             id: tradeItem.id.toString(),
//             info: tradeItem,
//             order: undefined,
//             price: parseFloat(tradeItem.price),
//             timestamp: parseInt(tradeItem.datetime, 10) * 1000,
//             type: undefined,
//             side: tradeItem.type,
//             symbol: "DPP/ETH",
//         };
//     }

// }
