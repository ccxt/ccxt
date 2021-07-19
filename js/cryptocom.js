'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, InsufficientFunds, DDoSProtection, InvalidNonce, PermissionDenied, BadRequest, BadSymbol } = require ('./base/errors');

module.exports = class cryptocom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptocom',
            'name': 'Crypto.com',
            'countries': [ 'MT' ],
            'version': 'v2',
            'rateLimit': 100,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchCurrencies': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': 'emulated',
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchIsolatedPositions': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'withdraw': false,
                'transfer': false,
                'fetchTransfers': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '7d',
                '2w': '14d',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://cryptocom.intercom-attachments-7.com/i/o/204082378/08c69fc201ae0fa30ca1ef83/47b-bC4xUjyLOT2Oo1NBITGS2W9hRSgSQ3avOH__QTDrYVJDpXYJ87wAIvHAc6-aWJ61M5dq8j1ebA2xfIkgkLX3dkoZ8DP3qbS84ZFFkUHDq22iV4dxAT1dxhQhWEFbwgOcI2f6',
                'test': 'https://uat-api.3ona.co/v2',
                'api': 'https://api.crypto.com/v2',
                'www': 'https://crypto.com/',
                'referral': '',
                'doc': 'https://exchange-docs.crypto.com/',
                'fees': 'https://crypto.com/exchange/document/fees-limits',
            },
            'api': {
                'public': {
                    'get': [
                        'public/get-instruments',
                        'public/get-book',
                        'public/get-candlestick',
                        'public/get-ticker',
                        'public/get-trades',
                    ],
                },
                'private': {
                    'post': [
                        'private/create-withdrawal',
                        'private/get-withdrawal-history',
                        'private/get-deposit-history',
                        'private/get-deposit-address',
                        'private/get-account-summary',
                        'private/create-order',
                        'private/cancel-order',
                        'private/cancel-all-orders',
                        'private/get-order-history',
                        'private/get-open-orders',
                        'private/get-order-detail',
                        'private/get-trades',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.004,
                    'taker': 0.004,
                },
            },
            'options': {},
            // https://exchange-docs.crypto.com/spot/index.html#response-and-reason-codes
            'exceptions': {
                'exact': {
                    '10001': ExchangeError,
                    '10002': PermissionDenied,
                    '10003': PermissionDenied,
                    '10004': BadRequest,
                    '10005': PermissionDenied,
                    '10006': DDoSProtection,
                    '10007': InvalidNonce,
                    '10008': BadRequest,
                    '10009': BadRequest,
                    '20001': BadRequest,
                    '20002': InsufficientFunds,
                    '30003': BadSymbol,
                    '30004': BadRequest,
                    '30005': BadRequest,
                    '30006': BadRequest,
                    '30007': BadRequest,
                    '30008': BadRequest,
                    '30009': BadRequest,
                    '30010': BadRequest,
                    '30013': BadRequest,
                    '30014': BadRequest,
                    '30016': BadRequest,
                    '30017': BadRequest,
                    '30023': BadRequest,
                    '30024': BadRequest,
                    '30025': BadRequest,
                    '40001': BadRequest,
                    '40002': BadRequest,
                    '40003': BadRequest,
                    '40004': BadRequest,
                    '40005': BadRequest,
                    '40006': BadRequest,
                    '40007': BadRequest,
                    '50001': BadRequest,
                },
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const id = '1';
            const nonce = this.nonce ().toString ();
            const requestParams = this.extend ({}, params);
            const paramsKeys = Object.keys (this.keysort (requestParams));
            let strSortKey = '';
            for (let i = 0; i < paramsKeys.length; i++) {
                strSortKey = strSortKey + paramsKeys[i].toString () + requestParams[paramsKeys[i]].toString ();
            }
            const payload = path + id + this.apiKey + strSortKey + nonce;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            body = this.json ({
                'id': id,
                'method': path,
                'params': params,
                'api_key': this.apiKey,
                'sig': signature,
                'nonce': nonce,
            });
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        // {
        //     "id": 11,
        //     "method": "public/get-instruments",
        //     "code": 0,
        //     "result": {
        //       "instruments": [
        //         {
        //           "instrument_name": "BTC_USDT",
        //           "quote_currency": "BTC",
        //           "base_currency": "USDT",
        //           "price_decimals": 2,
        //           "quantity_decimals": 6,
        //           "margin_trading_enabled": true
        //         },
        //         {
        //           "instrument_name": "CRO_BTC",
        //           "quote_currency": "BTC",
        //           "base_currency": "CRO",
        //           "price_decimals": 8,
        //           "quantity_decimals": 2,
        //           "margin_trading_enabled": false
        //         }
        //       ]
        //     }
        //  }
        const response = await this.publicGetPublicGetInstruments (params);
        const resultResponse = this.safeValue (response, 'result', {});
        const markets = this.safeValue (resultResponse, 'instruments', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'instrument_name');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'quantity_decimals'),
                'price': this.safeInteger (market, 'price_decimals'),
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'taker': this.fees['trading']['taker'],
                'maker': this.fees['trading']['maker'],
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetPublicGetTicker (params);
        // {
        //     "code":0,
        //     "method":"public/get-ticker",
        //     "result":{
        //       "data": [
        //         {"i":"CRO_BTC","b":0.00000890,"k":0.00001179,"a":0.00001042,"t":1591770793901,"v":14905879.59,"h":0.00,"l":0.00,"c":0.00},
        //         {"i":"EOS_USDT","b":2.7676,"k":2.7776,"a":2.7693,"t":1591770798500,"v":774.51,"h":0.05,"l":0.05,"c":0.00},
        //         {"i":"BCH_USDT","b":247.49,"k":251.73,"a":251.67,"t":1591770797601,"v":1.01693,"h":0.01292,"l":0.01231,"c":-0.00047},
        //         {"i":"ETH_USDT","b":239.92,"k":242.59,"a":240.30,"t":1591770798701,"v":0.97575,"h":0.01236,"l":0.01199,"c":-0.00018},
        //         {"i":"ETH_CRO","b":2693.11,"k":2699.84,"a":2699.55,"t":1591770795053,"v":95.680,"h":8.218,"l":7.853,"c":-0.050}
        //       ]
        //     }
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const tickers = this.safeValue (resultResponse, 'data', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            const marketId = this.safeString (ticker, 'i');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    const market = this.markets_by_id[marketId];
                    const symbol = market['symbol'];
                    result[symbol] = this.parseTicker (ticker, market);
                } else {
                    result[marketId] = this.parseTicker (ticker);
                }
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetPublicGetTicker (this.extend (request, params));
        // {
        //     "code":0,
        //     "method":"public/get-ticker",
        //     "result":{
        //       "data": {"i":"CRO_BTC","b":0.00000890,"k":0.00001179,"a":0.00001042,"t":1591770793901,"v":14905879.59,"h":0.00,"l":0.00,"c":0.00}
        //     }
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privatePostPrivateGetOrderHistory (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-order-history",
        //     "code": 0,
        //     "result": {
        //       "order_list": [
        //         {
        //           "status": "FILLED",
        //           "side": "SELL",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "367107623521528457",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588777459755,
        //           "update_time": 1588777460700,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 1,
        //           "cumulative_value": 1,
        //           "avg_price": 1,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         },
        //         {
        //           "status": "FILLED",
        //           "side": "SELL",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "367063282527104905",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588776138290,
        //           "update_time": 1588776138679,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 1,
        //           "cumulative_value": 1,
        //           "avg_price": 1,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const orderList = this.safeValue (data, 'order_list', []);
        let orders = this.parseOrders (orderList, market, since, limit);
        orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetPublicGetTrades (this.extend (request, params));
        // {
        //     "code":0,
        //     "method":"public/get-trades",
        //     "result": {
        //          "instrument_name": "BTC_USDT",
        //          "data:": [
        //              {"dataTime":1591710781947,"d":465533583799589409,"s":"BUY","p":2.96,"q":16.0,"t":1591710781946,"i":"ICX_CRO"},
        //              {"dataTime":1591707701899,"d":465430234542863152,"s":"BUY","p":0.007749,"q":115.0,"t":1591707701898,"i":"VET_USDT"},
        //              {"dataTime":1591710786155,"d":465533724976458209,"s":"SELL","p":25.676,"q":0.55,"t":1591710786154,"i":"XTZ_CRO"},
        //              {"dataTime":1591710783300,"d":465533629172286576,"s":"SELL","p":2.9016,"q":0.6,"t":1591710783298,"i":"XTZ_USDT"},
        //              {"dataTime":1591710784499,"d":465533669425626384,"s":"SELL","p":2.7662,"q":0.58,"t":1591710784498,"i":"EOS_USDT"},
        //              {"dataTime":1591710784700,"d":465533676120104336,"s":"SELL","p":243.21,"q":0.01647,"t":1591710784698,"i":"ETH_USDT"},
        //              {"dataTime":1591710786600,"d":465533739878620208,"s":"SELL","p":253.06,"q":0.00516,"t":1591710786598,"i":"BCH_USDT"},
        //              {"dataTime":1591710786900,"d":465533749959572464,"s":"BUY","p":0.9999,"q":0.2,"t":1591710786898,"i":"USDC_USDT"},
        //              {"dataTime":1591710787500,"d":465533770081010000,"s":"BUY","p":3.159,"q":1.65,"t":1591710787498,"i":"ATOM_USDT"},
        //            ]
        //      }
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        const response = await this.publicGetPublicGetCandlestick (this.extend (request, params));
        // {
        //     "code":0,
        //     "method":"public/get-candlestick",
        //     "result":{
        //       "instrument_name":"BTC_USDT",
        //       "interval":"5m",
        //       "data":[
        //         {"t":1596944700000,"o":11752.38,"h":11754.77,"l":11746.65,"c":11753.64,"v":3.694583},
        //         {"t":1596945000000,"o":11753.63,"h":11754.77,"l":11739.83,"c":11746.17,"v":2.073019},
        //         {"t":1596945300000,"o":11746.16,"h":11753.24,"l":11738.1,"c":11740.65,"v":0.867247},
        //         ...
        //       ]
        //     }
        // }
        const resultResponse = this.safeValue (response, 'result', {});
        const data = this.safeValue (resultResponse, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument_name': this.marketId (symbol),
        };
        if (limit) {
            request.depth = limit;
        }
        const response = await this.publicGetPublicGetBook (this.extend (request, params));
        // {
        //     "code":0,
        //     "method":"public/get-book",
        //     "result":{
        //       "bids":[[9668.44,0.006325,1.0],[9659.75,0.006776,1.0],[9653.14,0.011795,1.0],[9647.13,0.019434,1.0],[9634.62,0.013765,1.0],[9633.81,0.021395,1.0],[9628.46,0.037834,1.0],[9627.6,0.020909,1.0],[9621.51,0.026235,1.0],[9620.83,0.026701,1.0]],
        //       "asks":[[9697.0,0.68251,1.0],[9697.6,1.722864,2.0],[9699.2,1.664177,2.0],[9700.8,1.824953,2.0],[9702.4,0.85778,1.0],[9704.0,0.935792,1.0],[9713.32,0.002926,1.0],[9716.42,0.78923,1.0],[9732.19,0.00645,1.0],[9737.88,0.020216,1.0]],
        //       "t":1591704180270
        //     }
        // }
        const orderBook = this.safeValue (response, 'result');
        return this.parseOrderBook (orderBook, symbol);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostPrivateGetAccountSummary (params);
        // {
        //     "id": 11,
        //     "method": "private/get-account-summary",
        //     "code": 0,
        //     "result": {
        //         "accounts": [
        //             {
        //                 "balance": 99999999.905000000000000000,
        //                 "available": 99999996.905000000000000000,
        //                 "order": 3.000000000000000000,
        //                 "stake": 0,
        //                 "currency": "CRO"
        //             }
        //         ]
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const coinList = this.safeValue (data, 'accounts', []);
        const result = { 'info': response };
        for (let i = 0; i < coinList.length; i++) {
            const balance = coinList[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeNumber (balance, 'balance');
            account['free'] = this.safeNumber (balance, 'available');
            account['used'] = this.safeNumber (balance, 'order');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostPrivateGetOrderDetail (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-order-detail",
        //     "code": 0,
        //     "result": {
        //       "trade_list": [
        //         {
        //           "side": "BUY",
        //           "instrument_name": "ETH_CRO",
        //           "fee": 0.007,
        //           "trade_id": "371303044218155296",
        //           "create_time": 1588902493045,
        //           "traded_price": 7,
        //           "traded_quantity": 7,
        //           "fee_currency": "CRO",
        //           "order_id": "371302913889488619"
        //         }
        //       ],
        //       "order_info": {
        //         "status": "FILLED",
        //         "side": "BUY",
        //         "order_id": "371302913889488619",
        //         "client_oid": "9_yMYJDNEeqHxLqtD_2j3g",
        //         "create_time": 1588902489144,
        //         "update_time": 1588902493024,
        //         "type": "LIMIT",
        //         "instrument_name": "ETH_CRO",
        //         "cumulative_quantity": 7,
        //         "cumulative_value": 7,
        //         "avg_price": 7,
        //         "fee_currency": "CRO",
        //         "time_in_force": "GOOD_TILL_CANCEL",
        //         "exec_inst": "POST_ONLY"
        //       }
        //     }
        // }
        const result = this.safeValue (response, 'result', {});
        const order = this.safeValue (result, 'order_info', {});
        return this.parseOrder (order, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'quantity': amount,
        };
        if (request['type'] === 'LIMIT' || request['type'] === 'STOP_LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostPrivateCreateOrder (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/create-order",
        //     "result": {
        //       "order_id": "337843775021233500",
        //       "client_oid": "my_order_0002"
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const value = this.safeValue (data, 'order_id');
        const order = await this.fetchOrder (value, symbol);
        return order;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privatePostPrivateCancelAllOrders (this.extend (request, params));
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            'order_id': id,
        };
        await this.privatePostPrivateCancelOrder (this.extend (request, params));
        const order = await this.fetchOrder (id, symbol);
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a `symbol` argument');
        }
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privatePostPrivateGetOpenOrders (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-open-orders",
        //     "code": 0,
        //     "result": {
        //       "count": 1177,
        //       "order_list": [
        //         {
        //           "status": "ACTIVE",
        //           "side": "BUY",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "366543374673423753",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588760643829,
        //           "update_time": 1588760644292,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 0,
        //           "cumulative_value": 0,
        //           "avg_price": 0,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         },
        //         {
        //           "status": "ACTIVE",
        //           "side": "BUY",
        //           "price": 1,
        //           "quantity": 1,
        //           "order_id": "366455245775097673",
        //           "client_oid": "my_order_0002",
        //           "create_time": 1588758017375,
        //           "update_time": 1588758017411,
        //           "type": "LIMIT",
        //           "instrument_name": "ETH_CRO",
        //           "cumulative_quantity": 0,
        //           "cumulative_value": 0,
        //           "avg_price": 0,
        //           "fee_currency": "CRO",
        //           "time_in_force": "GOOD_TILL_CANCEL"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const resultList = this.safeValue (data, 'order_list', []);
        let orders = this.parseOrders (resultList, market, since, limit);
        orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        const response = await this.privatePostPrivateGetTrades (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-trades",
        //     "code": 0,
        //     "result": {
        //       "trade_list": [
        //         {
        //           "side": "SELL",
        //           "instrument_name": "ETH_CRO",
        //           "fee": 0.014,
        //           "trade_id": "367107655537806900",
        //           "create_time": 1588777459755,
        //           "traded_price": 7,
        //           "traded_quantity": 1,
        //           "fee_currency": "CRO",
        //           "order_id": "367107623521528450"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const resultList = this.safeValue (data, 'trade_list', []);
        return this.parseTrades (resultList, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostPrivateGetDepositAddress (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-deposit-address",
        //     "code": 0,
        //     "result": {
        //          "deposit_address_list": [
        //              {
        //                  "currency": "CRO",
        //                  "create_time": 1615886328000,
        //                  "id": "12345",
        //                  "address": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        //                  "status": "1",
        //                  "network": "CRO"
        //              },
        //              {
        //                  "currency": "CRO",
        //                  "create_time": 1615886332000,
        //                  "id": "12346",
        //                  "address": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
        //                  "status": "1",
        //                  "network": "ETH"
        //              }
        //          ]
        //    }
        // }
        const data = this.safeValue (response, 'result', {});
        const address = this.safeValue (data, 'deposit_address_list', []);
        const addressList = [];
        for (let i = 0; i < address.length; i++) {
            addressList.push (address[i].address);
        }
        this.checkAddress (addressList[0]);
        return {
            'currency': code,
            'address': addressList[0],
            'info': data,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_ts'] = since;
            // max 3 months range https://exchange-docs.crypto.com/spot/index.html#private-get-withdrawal-history
            request['end_ts'] = this.sum (since, 7776000000);
        }
        if (limit !== undefined) {
            request['end_ts'] = limit;
        }
        const response = await this.privatePostPrivateGetDepositHistory (this.extend (request, params));
        // {
        //     "id": 11,
        //     "method": "private/get-deposit-history",
        //     "code": 0,
        //     "result": {
        //       "deposit_list": [
        //         {
        //           "currency": "XRP",
        //           "fee": 1.0,
        //           "create_time": 1607063412000,
        //           "id": "2220",
        //           "update_time": 1607063460000,
        //           "amount": 100,
        //           "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //           "status": "1"
        //         }
        //       ]
        //     }
        // }
        const data = this.safeValue (response, 'result', {});
        const depositList = this.safeValue (data, 'deposit_list', []);
        return this.parseTransactions (depositList, currency, since, limit);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        if (errorCode in this.exceptions['exact']) {
            const Exception = this.exceptions['exact'][errorCode];
            throw new Exception (this.id + ' ' + message);
        }
        if (errorCode !== '0') {
            throw new ExchangeError (this.id + ' ' + message);
        }
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "i":"CRO_BTC",
        //     "b":0.00000890,
        //     "k":0.00001179,
        //     "a":0.00001042,
        //     "t":1591770793901,
        //     "v":14905879.59,
        //     "h":0.00,
        //     "l":0.00,
        //     "c":0.00
        // }
        let timestamp = this.safeInteger (ticker, 't');
        if (timestamp === undefined) {
            timestamp = this.milliseconds ();
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let open = undefined;
        let change = undefined;
        let average = undefined;
        const last = this.safeNumber (ticker, 'a');
        const relativeChange = this.safeNumber (ticker, 'c');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
            'bid': this.safeNumber (ticker, 'b'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'k'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeNumber (ticker, 'v'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // public/get-trades
        //
        // {"dataTime":1591710781947,"d":465533583799589409,"s":"BUY","p":2.96,"q":16.0,"t":1591710781946,"i":"ICX_CRO"},
        //
        // private/get-trades
        //
        // {
        //     "side": "SELL",
        //     "instrument_name": "ETH_CRO",
        //     "fee": 0.014,
        //     "trade_id": "367107655537806900",
        //     "create_time": 1588777459755,
        //     "traded_price": 7,
        //     "traded_quantity": 1,
        //     "fee_currency": "CRO",
        //     "order_id": "367107623521528450"
        // }
        let timestamp = this.safeInteger (trade, 't');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'create_time');
        }
        const marketId = this.safeString2 (trade, 'i', 'instrument_name');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if (marketId !== undefined) {
            symbol = this.safeSymbol (marketId, market, '_');
        }
        let price = this.safeNumber (trade, 'p');
        if (price === undefined) {
            price = this.safeNumber (trade, 'traded_price');
        }
        let amount = this.safeNumber (trade, 'q');
        if (amount === undefined) {
            amount = this.safeNumber (trade, 'traded_quantity');
        }
        const cost = price * amount;
        const side = this.safeString2 (trade, 's', 'side').toLowerCase ();
        const id = this.safeString2 (trade, 'd', 'trade_id');
        const type = 'limit'; // all trades are still limit trades
        const takerOrMaker = this.safeString (trade, 'liquidity_indicator');
        const order = this.safeString (trade, 'order_id');
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            let feeCurrency = this.safeString (trade, 'fee_currency');
            if (market !== undefined) {
                if (side === 'buy') {
                    feeCurrency = market['base'];
                } else if (side === 'sell') {
                    feeCurrency = market['quote'];
                }
            }
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order,
            'takerOrMaker': takerOrMaker,
            'type': type,
            'fee': fee,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        //      {"t":1596944700000,"o":11752.38,"h":11754.77,"l":11746.65,"c":11753.64,"v":3.694583}
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELED': 'canceled',
            'FILLED': 'closed',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //       {
        //         "status": "FILLED",
        //         "side": "BUY",
        //         "order_id": "371302913889488619",
        //         "client_oid": "9_yMYJDNEeqHxLqtD_2j3g",
        //         "create_time": 1588902489144,
        //         "update_time": 1588902493024,
        //         "type": "LIMIT",
        //         "instrument_name": "ETH_CRO",
        //         "cumulative_quantity": 7,
        //         "cumulative_value": 7,
        //         "avg_price": 7,
        //         "fee_currency": "CRO",
        //         "time_in_force": "GOOD_TILL_CANCEL",
        //         "exec_inst": "POST_ONLY"
        //       }
        const created = this.safeInteger (order, 'create_time');
        const updated = this.safeInteger (order, 'update_time');
        const marketId = this.safeString (order, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'cumulative_quantity');
        const remaining = amount - filled;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_oid');
        const price = this.safeNumber (order, 'price');
        const average = this.safeNumber (order, 'avg_price');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const timeInForce = this.safeString (order, 'time_in_force');
        const postOnly = this.safeString (order, 'exec_inst') === 'POST_ONLY';
        let cost = 0;
        if (status === 'closed') {
            cost = amount * price;
        }
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': [],
            'info': order,
            'cost': cost,
            'fee': undefined,
            'average': average,
        };
    }

    parseTransactionStatusByType (status) {
        const statuses = {
            '0': 'pending',
            '1': 'ok',
            '2': 'failed',
            '3': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        // {
        //     "currency": "XRP",
        //     "fee": 1.0,
        //     "create_time": 1607063412000,
        //     "id": "2220",
        //     "update_time": 1607063460000,
        //     "amount": 100,
        //     "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //     "status": "1"
        // }
        //
        // fetchWithdrawals
        //
        // {
        //     "currency": "XRP",
        //     "client_wid": "my_withdrawal_002",
        //     "fee": 1.0,
        //     "create_time": 1607063412000,
        //     "id": "2220",
        //     "update_time": 1607063460000,
        //     "amount": 100,
        //     "address": "2NBqqD5GRJ8wHy1PYyCXTe9ke5226FhavBf?1234567890",
        //     "status": "1"
        // }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'create_time');
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const txId = this.safeString (transaction, 'txid');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        const updated = this.safeInteger (transaction, 'update_time');
        return {
            'info': transaction,
            'id': id,
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': undefined,
            'fee': fee,
        };
    }
};
