'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bw',
            'name': 'bw.com',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1M',
                '5m': '5M',
                '15m': '15M',
                '30m': '30M',
                '1h': '1H',
                '1w': '1W',
            },
            'hostname': 'bw.com', // set to 'bw.io' for China mainland
            'urls': {
                'api': 'https://www.{hostname}',
                'www': 'https://www.{hostname}',
                'doc': 'https://github.com/bw-exchange/api_docs_en/wiki',
                'fees': 'https://www.bw.com/feesRate',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                    'tiers': {
                        'taker': [
                            [ 0, 0.2 / 100 ],
                        ],
                        'maker': [
                            [ 0, 0.2 / 100 ],
                        ],
                    },
                },
                'funding': {
                },
            },
            'exceptions': {
                'exact': {
                    '999': AuthenticationError,
                },
            },
            'api': {
                'public': {
                    'get': [
                        'api/data/v1/klines',
                        'api/data/v1/ticker',
                        'api/data/v1/tickers',
                        'api/data/v1/trades',
                        'api/data/v1/entrusts',
                        'exchange/config/controller/website/marketcontroller/getByWebId',
                        'exchange/config/controller/website/currencycontroller/getCurrencyList',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/entrust/controller/website/EntrustController/getEntrustById',
                        'exchange/entrust/controller/website/EntrustController/getUserEntrustRecordFromCacheWithPage',
                        'exchange/entrust/controller/website/EntrustController/getUserEntrustList',
                        'exchange/fund/controller/website/fundwebsitecontroller/getwithdrawaddress',
                        'exchange/fund/controller/website/fundwebsitecontroller/getpayoutcoinrecord',
                        'exchange/fund/controller/website/fundcontroller/getPayinCoinRecord',
                        'exchange/fund/controller/website/fundcontroller/getPayinAddress',
                    ],
                    'post': [
                        'exchange/fund/controller/website/fundcontroller/findbypage',
                        'exchange/entrust/controller/website/EntrustController/addEntrust',
                        'exchange/entrust/controller/website/EntrustController/cancelEntrust',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteMarketcontrollerGetByWebId (params);
        //
        //     {
        //         "datas": [
        //             {
        //                 "orderNum":null,
        //                 "leverEnable":true,
        //                 "leverMultiple":10,
        //                 "marketId":"291",
        //                 "webId":"102",
        //                 "serverId":"entrust_bw_23",
        //                 "name":"eos_usdt",
        //                 "leverType":"2",
        //                 "buyerCurrencyId":"11",
        //                 "sellerCurrencyId":"7",
        //                 "amountDecimal":4,
        //                 "priceDecimal":3,
        //                 "minAmount":"0.0100000000",
        //                 "state":1,
        //                 "openTime":1572537600000,
        //                 "defaultFee":"0.00200000",
        //                 "createUid":null,
        //                 "createTime":0,
        //                 "modifyUid":null,
        //                 "modifyTime":1574160113735,
        //                 "combineMarketId":"",
        //                 "isCombine":0,
        //                 "isMining":0
        //             }
        //         ],
        //         "resMsg": { "message":"success !", "method":null, "code":"1" }
        //     }
        //
        const markets = this.safeValue (response, 'datas', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'marketId');
            const numericId = parseInt (id);
            const name = this.safeStringUpper (market, 'name');
            let [ base, quote ] = name.split ('_');
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const baseId = this.safeString (market, 'sellerCurrencyId');
            const quoteId = this.safeString (market, 'buyerCurrencyId');
            const baseNumericId = parseInt (baseId);
            const quoteNumericId = parseInt (quoteId);
            const symbol = base + '/' + quote;
            const state = this.safeInteger (market, 'state');
            const active = (state === 1);
            const fee = this.safeFloat (market, 'defaultFee');
            result.push ({
                'id': id,
                'active': active,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'maker': fee,
                'taker': fee,
                'info': market,
                'precision': {
                    'amount': this.safeInteger (market, 'amountDecimal'),
                    'price': this.safeInteger (market, 'priceDecimal'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': 0,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteCurrencycontrollerGetCurrencyList (params);
        //
        //     {
        //         "datas":[
        //             {
        //                 "currencyId":"456",
        //                 "name":"pan",
        //                 "alias":"pan",
        //                 "logo":"pan.svg",
        //                 "description":"pan",
        //                 "descriptionEnglish":"pan",
        //                 "defaultDecimal":2,
        //                 "createUid":null,
        //                 "createTime":1574068133762,
        //                 "modifyUid":null,
        //                 "modifyTime":0,
        //                 "state":1,
        //                 "mark":"pan",
        //                 "totalNumber":"0",
        //                 "publishNumber":"0",
        //                 "marketValue":"0",
        //                 "isLegalCoin":0,
        //                 "needBlockUrl":1,
        //                 "blockChainUrl":"https://etherscan.io/tx/",
        //                 "tradeSearchUrl":null,
        //                 "tokenCoinsId":0,
        //                 "isMining":"0",
        //                 "arithmetic":null,
        //                 "founder":"bw_nxwal",
        //                 "teamAddress":null,
        //                 "remark":null,
        //                 "tokenName":"ethw2",
        //                 "isMemo":0,
        //                 "websiteCurrencyId":"7rhqoHLohkG",
        //                 "drawFlag":0,
        //                 "rechargeFlag":1,
        //                 "drawFee":"0.03000000",
        //                 "onceDrawLimit":100,
        //                 "dailyDrawLimit":500,
        //                 "timesFreetrial":"0",
        //                 "hourFreetrial":"0",
        //                 "dayFreetrial":"0",
        //                 "minFee":"0",
        //                 "inConfigTimes":7,
        //                 "outConfigTimes":7,
        //                 "minCash":"0.06000000",
        //                 "limitAmount":"0",
        //                 "zbExist":false,
        //                 "zone":1
        //             },
        //         ],
        //         "resMsg": { "message":"success !", "method":null, "code":"1" }
        //     }
        //
        const currencies = this.safeValue (response, 'datas', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currencyId');
            const code = this.safeCurrencyCode (this.safeStringUpper (currency, 'name'));
            const state = this.safeInteger (currency, 'state');
            const active = state === 1;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': this.safeFloat (currency, 'drawFee'),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'limitAmount', 0),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': parseFloat (this.safeInteger (currency, 'onceDrawLimit')),
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     [
        //         "281",            // market id
        //         "9754.4",         // last
        //         "9968.8",         // high
        //         "9631.5",         // low
        //         "47865.6432",     // base volume
        //         "-2.28",          // change
        //         // closing price for last 6 hours
        //         "[[1, 9750.1], [2, 9737.1], [3, 9727.5], [4, 9722], [5, 9722.1], [6, 9754.4]]",
        //         "9752.12",        // bid
        //         "9756.69",        // ask
        //         "469849357.2364"  // quote volume
        //     ]
        //
        let symbol = undefined;
        const marketId = ticker[0];
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const close = parseFloat (ticker[1]);
        const bid = this.safeValue (ticker, 'bid', {});
        const ask = this.safeValue (ticker, 'ask', {});
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker[2]),
            'low': parseFloat (ticker[3]),
            'bid': parseFloat (ticker[7]),
            'bidVolume': this.safeFloat (bid, 'quantity'),
            'ask': parseFloat (ticker[8]),
            'askVolume': this.safeFloat (ask, 'quantity'),
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': parseFloat (ticker[5]),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker[4]),
            'quoteVolume': parseFloat (ticker[9]),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        const response = await this.publicGetApiDataV1Ticker (this.extend (request, params));
        //
        //     {
        //         "datas": [
        //             "281",
        //             "7601.99",
        //             "8126.5",
        //             "7474.68",
        //             "47004.8708",
        //             "-6.18",
        //             "[[1, 7800.34], [2, 7626.41], [3, 7609.97], [4, 7569.04], [5, 7577.93], [6, 7601.99]]",
        //             "7600.24",
        //             "7603.69",
        //             "371968300.0119"
        //         ],
        //         "resMsg": { "message":"success !","method":null,"code":"1" }}
        //     }
        //
        const ticker = this.safeValue (response, 'datas', []);
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Entrusts (this.extend (request, params));
        //
        //     {
        //         "datas": {
        //             "asks": [
        //                 [ "9740.43", "0.0083" ],
        //             ],
        //             "bids": [
        //                 [ "9734.33", "0.0133" ],
        //             ],
        //             "timestamp": "1569303520",
        //         },
        //         "resMsg": {
        //             "message": "success !",
        //             "method": null,
        //             "code": "1",
        //         },
        //     }
        //
        const orderbook = this.safeValue (response, 'datas', []);
        const timestamp = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerFindbypage (params);
        const data = this.safeValue (response, 'datas', {});
        const balances = this.safeValue (data, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let symbol = this.safeInteger (balance, 'currencyTypeId', '');
            symbol = symbol.toString ();
            if (symbol in this.currencies_by_id) {
                symbol = this.currencies_by_id[symbol]['code'];
                symbol = this.safeCurrencyCode (symbol);
            }
            const account = this.account ();
            const amount = this.safeFloat (balance, 'amount');
            account['free'] = amount;
            account['total'] = amount;
            account['used'] = 0;
            result[symbol] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'type': 0, // sell
            'rangeType': 0, // limit order
            'marketId': market['id'],
        };
        if (side.toLowerCase () === 'buy') {
            request['type'] = 1; // buy
        }
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerAddEntrust (this.extend (request, params));
        const data = this.safeValue (response, 'datas');
        return {
            'id': this.safeString (data, 'entrustId'),
            'info': response,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '-2': 'canceled',
            '-1': 'canceled',
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'marketId');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const timestamp = this.safeInteger (order, 'createTime');
        let side = undefined;
        const orderSide = this.safeInteger (order, 'type');
        if (orderSide === 0) {
            side = 'sell';
        } else if (orderSide === 1) {
            side = 'buy';
        }
        const amount = this.safeFloat (order, 'amount');
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'completeAmount');
        const status = this.parseOrderStatus (this.safeInteger (order, 'status', '').toString ());
        return {
            'info': order,
            'id': this.safeString (order, 'entrustId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': amount - filled,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetEntrustById (this.extend (request, params));
        const order = this.safeValue (response, 'datas', {});
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerCancelEntrust (this.extend (request, params));
        return {
            'info': response,
            'id': id,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (this.safeFloat (ohlcv, 3) * 1000),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
            this.safeFloat (ohlcv, 6),
            this.safeFloat (ohlcv, 7),
            this.safeFloat (ohlcv, 8),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'type': this.timeframes[timeframe],
            'dataSize': 500,
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Klines (this.extend (request, params));
        const data = this.safeValue (response, 'datas', []);
        const ohlcvs = this.parseOHLCVs (data, market, timeframe, since, limit);
        return this.sortBy (ohlcvs, 0);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], { 'hostname': this.hostname }) + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            const ms = this.milliseconds ().toString ();
            let content = '';
            if (method === 'GET') {
                const sortedParams = this.keysort (params);
                const keys = Object.keys (sortedParams);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    content += key + sortedParams[key];
                }
            } else {
                content = body;
            }
            const signing = this.apiKey + ms + content + this.secret;
            const hash = this.hash (this.encode (signing), 'md5');
            if (!headers) {
                headers = {};
            }
            headers['Apiid'] = this.apiKey;
            headers['Timestamp'] = ms;
            headers['Sign'] = hash;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // default error handler
        }
        const resMsg = this.safeValue (response, 'resMsg');
        const errorCode = this.safeString (resMsg, 'code');
        if (errorCode !== '1') {
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (errorCode in exact) {
                throw new exact[errorCode] (feedback);
            }
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
