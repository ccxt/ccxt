'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, InvalidOrder, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tradesatoshi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tradesatoshi',
            'name': 'TradeSatoshi',
            'countries': [ 'UK' ], // ?
            'version': '*',
            'rateLimit': 1500,
            'hasCORS': false,
            // new metainfo interface
            'has': {
                'privateAPI': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchCurrencies': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/44006686-f96c02ce-9e90-11e8-871c-c67d21e9d165.jpg',
                'api': 'https://tradesatoshi.com/api',
                'www': 'https://tradesatoshi.com/',
                'doc': 'https://tradesatoshi.com/Home/Api',
                'fees': 'https://tradesatoshi.com/FeesStructure',
                'referral': 'https://tradesatoshi.com/Account/Login?form=register&referrer=AotvmQTKrt',
            },
            'api': {
                'public': {
                    'get': [
                        'getcurrencies',
                        'getcurrency',
                        'getticker',
                        'getmarketstatus',
                        'getmarkethistory',
                        'getmarketsummary',
                        'getmarketsummaries',
                        'getorderbook',
                    ],
                },
                'private': {
                    'post': [
                        'getbalance',
                        'getbalances',
                        'getorder',
                        'getorders',
                        'submitorder',
                        'cancelorder',
                        'gettradehistory',
                        'generateaddress',
                        'submitwithdraw',
                        'getdeposits',
                        'getwithdrawals',
                        'submittransfer',
                        'submittip',
                    ],
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetcurrencies (params);
        //
        //     {
        //         "success": true,
        //         "message": null,
        //         "result": [
        //             {
        //                 "currency": "HOT",
        //                 "currencyLong": "HoloToken",
        //                 "minConfirmation": 20,
        //                 "txFee": 1,
        //                 "status": "OK", // "Maintenance"
        //                 "statusMessage": "need to fix, withdrawal fail",
        //                 "minBaseTrade": 1e-8,
        //                 "isTipEnabled": false,
        //                 "minTip": 0,
        //                 "maxTip": 0
        //             },
        //         ]
        //     }
        //
        const currencies = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const name = this.safeString (currency, 'currencyLong');
            const fee = this.safeFloat (currency, 'txFee');
            const status = this.safeStringLower (currency, 'status');
            const active = (status === 'ok');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (id);
            const minAmount = this.safeFloat (currency, 'minBaseTrade');
            const precision = this.precisionFromString (this.numberToString (minAmount));
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'status': status,
                'fee': fee, // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': { 'min': minAmount, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetmarketsummaries (params);
        //     {
        //         "success": true,
        //         "message": null,
        //         "result": [
        //             {
        //                 "market": "BOLI_BTC",
        //                 "high": 0.00000127,
        //                 "low": 0.00000125,
        //                 "volume": 701.57924724,
        //                 "baseVolume": 0.00088281,
        //                 "last": 0.00000127,
        //                 "bid": 0.00000122,
        //                 "ask": 0.00000128,
        //                 "openBuyOrders": 77,
        //                 "openSellOrders": 197,
        //                 "marketStatus": "OK", // "Paused"
        //                 "change": 1.6
        //             },
        //         ],
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'result', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            // todo: fix magic constants
            const precision = {
                'amount': 8,
                'price': 8,
            };
            const status = this.safeStringLower (market, 'marketStatus');
            const active = (status === 'ok');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'market': market['id'] };
        const response = await this.publicGetGetmarketsummary (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "message": null,
        //         "result": {
        //             "market": "ETH_BTC",
        //             "high": 0.0215,
        //             "low": 0.02073128,
        //             "volume": 1.55257974,
        //             "baseVolume": 0.0330117,
        //             "last": 0.02110003,
        //             "bid": 0.02110003,
        //             "ask": 0.02118,
        //             "openBuyOrders": 96,
        //             "openSellOrders": 315,
        //             "marketStatus": null,
        //             "change": 1.44
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.accountGetBalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'Currency');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let free = parseFloat (balance['Available']);
            let total = parseFloat (balance['Balance']);
            let used = total - free;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            // 'type': 'both', // 'both', 'buy', 'sell'
            // 'depth': 20,, // default 20
        };
        const response = await this.publicGetGetorderbook (this.extend (request, params));
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        //
        //     {
        //         "success": true,
        //         "message": null,
        //         "result": {
        //             "buy": [
        //                 { "quantity": 0.03781911, "rate": 0.02110002 },
        //                 { "quantity": 0.15474971, "rate": 0.0211 },
        //                 { "quantity": 0.01318571, "rate": 0.021 },
        //             ],
        //             "sell": [
        //                 { "quantity": 0.00987983, "rate": 0.02118 },
        //                 { "quantity": 0.02412794, "rate": 0.0211846 },
        //                 { "quantity": 0.01936513, "rate": 0.02122918 },
        //             ]
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'result', {});
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'rate', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "market": "ETH_BTC",
        //         "high": 0.0215,
        //         "low": 0.02073128,
        //         "volume": 1.55257974,
        //         "baseVolume": 0.0330117,
        //         "last": 0.02110003,
        //         "bid": 0.02110003,
        //         "ask": 0.02118,
        //         "openBuyOrders": 96,
        //         "openSellOrders": 315,
        //         "marketStatus": null,
        //         "change": 1.44
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'market');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const timestamp = this.milliseconds ();
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'), // the exchange has base ←→ quote volumes reversed
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGetmarketsummaries (params);
        //
        //     {
        //         "success": true,
        //         "message": null,
        //         "result": [
        //             {
        //                 "market": "BOLI_BTC",
        //                 "high": 0.00000127,
        //                 "low": 0.00000125,
        //                 "volume": 701.57924724,
        //                 "baseVolume": 0.00088281,
        //                 "last": 0.00000127,
        //                 "bid": 0.00000122,
        //                 "ask": 0.00000128,
        //                 "openBuyOrders": 77,
        //                 "openSellOrders": 198,
        //                 "marketStatus": "OK",
        //                 "change": 1.6
        //             },
        //         ],
        //     }
        //
        const result = {};
        const tickers = this.safeValue (response, 'result', []);
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            if ((symbols === undefined) || this.inArray (symbol, symbols)) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['TimeStamp']);
        let side = undefined;
        if (trade['OrderType'] === 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] === 'SELL') {
            side = 'sell';
        }
        let id = undefined;
        if ('Id' in trade)
            id = trade['Id'].toString ();
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade['Price'],
            'amount': trade['Quantity'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
        }, params));
        if ('result' in response) {
            if (typeof response['result'] !== 'undefined')
                return this.parseTrades (response['result'], market, since, limit);
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['T']);
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'tickInterval': this.timeframes[timeframe],
            'marketName': market['id'],
        };
        let response = await this.v2GetMarketGetTicks (this.extend (request, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.marketGetOpenorders (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market);
        return this.filterOrdersBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit')
            order['rate'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        let result = {
            'info': response,
            'id': response['result']['uuid'],
        };
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.marketGetCancel (this.extend ({
                'uuid': id,
            }, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message === 'ORDER_NOT_OPEN')
                    throw new InvalidOrder (this.id + ' cancelOrder() error: ' + this.last_http_response);
                if (message === 'UUID_INVALID')
                    throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return response;
    }

    parseOrder (order, market = undefined) {
        let side = undefined;
        if ('OrderType' in order)
            side = (order['OrderType'] === 'LIMIT_BUY') ? 'buy' : 'sell';
        if ('Type' in order)
            side = (order['Type'] === 'LIMIT_BUY') ? 'buy' : 'sell';
        let status = 'open';
        if (order['Closed']) {
            status = 'closed';
        } else if (order['CancelInitiated']) {
            status = 'canceled';
        }
        let symbol = undefined;
        if (!market) {
            if ('Exchange' in order)
                if (order['Exchange'] in this.markets_by_id)
                    market = this.markets_by_id[order['Exchange']];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = undefined;
        if ('Opened' in order)
            timestamp = this.parse8601 (order['Opened']);
        if ('TimeStamp' in order)
            timestamp = this.parse8601 (order['TimeStamp']);
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': parseFloat (order[commission]),
                'currency': market['quote'],
            };
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        let amount = this.safeFloat (order, 'Quantity');
        let remaining = this.safeFloat (order, 'QuantityRemaining', 0.0);
        let filled = amount - remaining;
        if (!cost) {
            if (price && amount)
                cost = price * amount;
        }
        if (!price) {
            if (cost && filled)
                price = cost / filled;
        }
        let average = this.safeFloat (order, 'PricePerUnit');
        let result = {
            'info': order,
            'id': order['OrderUuid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.accountGetOrder ({ 'uuid': id });
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID')
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        return this.parseOrder (response['result']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.accountGetOrderhistory (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market);
        return this.filterOrdersBySymbol (orders, symbol);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    currencyId (currency) {
        if (currency === 'BCH')
            return 'BCC';
        return currency;
    }

    async fetchDepositAddress (currency, params = {}) {
        let currencyId = this.currencyId (currency);
        let response = await this.accountGetDepositaddress (this.extend ({
            'currency': currencyId,
        }, params));
        let address = this.safeString (response['result'], 'Address');
        let message = this.safeString (response, 'message');
        let status = 'ok';
        if (!address || message === 'ADDRESS_GENERATING')
            status = 'pending';
        return {
            'currency': currency,
            'address': address,
            'status': status,
            'info': response,
        };
    }

    async withdraw (currency, amount, address, params = {}) {
        let currencyId = this.currencyId (currency);
        let response = await this.accountGetWithdraw (this.extend ({
            'currency': currencyId,
            'quantity': amount,
            'address': address,
        }, params));
        let id = undefined;
        if ('result' in response) {
            if ('uuid' in response['result'])
                id = response['result']['uuid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            url += api + '/';
            if (((api === 'account') && (path !== 'withdraw')) || (path === 'openorders'))
                url += method.toLowerCase ();
            url += path + '?' + this.urlencode (this.extend ({
                'nonce': nonce,
                'apikey': this.apiKey,
            }, params));
            let signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code >= 400) {
            if (body[0] === '{') {
                let response = JSON.parse (body);
                if ('success' in response) {
                    if (!response['success']) {
                        if ('message' in response) {
                            if (response['message'] === 'MIN_TRADE_REQUIREMENT_NOT_MET')
                                throw new InvalidOrder (this.id + ' ' + this.json (response));
                            if (response['message'] === 'APIKEY_INVALID')
                                throw new AuthenticationError (this.id + ' ' + this.json (response));
                        }
                        throw new ExchangeError (this.id + ' ' + this.json (response));
                    }
                }
            }
        }
    }
};
