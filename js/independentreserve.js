'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class independentreserve extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'independentreserve',
            'name': 'Independent Reserve',
            'countries': [ 'AU', 'NZ' ], // Australia, New Zealand
            'rateLimit': 1000,
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg',
                'api': {
                    'public': 'https://api.independentreserve.com/Public',
                    'private': 'https://api.independentreserve.com/Private',
                },
                'www': 'https://www.independentreserve.com',
                'doc': 'https://www.independentreserve.com/API',
            },
            'api': {
                'public': {
                    'get': [
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetAllOrders',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                        'GetOrderMinimumVolumes',
                        'GetCryptoWithdrawalFees',
                    ],
                },
                'private': {
                    'post': [
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetFiatBankAccounts',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'GetTrades',
                        'GetBrokerageFees',
                        'GetDigitalCurrencyWithdrawal',
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'RequestFiatWithdrawal',
                        'WithdrawFiatCurrency',
                        'WithdrawDigitalCurrency',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.5 / 100,
                    'maker': 0.5 / 100,
                    'percentage': true,
                    'tierBased': false,
                },
            },
            'commonCurrencies': {
                'PLA': 'PlayChip',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const baseCurrencies = await this.publicGetGetValidPrimaryCurrencyCodes (params);
        const quoteCurrencies = await this.publicGetGetValidSecondaryCurrencyCodes (params);
        const limits = await this.publicGetGetOrderMinimumVolumes (params);
        //
        //     {
        //         "Xbt": 0.0001,
        //         "Bch": 0.001,
        //         "Bsv": 0.001,
        //         "Eth": 0.001,
        //         "Ltc": 0.01,
        //         "Xrp": 1,
        //     }
        //
        const result = [];
        for (let i = 0; i < baseCurrencies.length; i++) {
            const baseId = baseCurrencies[i];
            const base = this.safeCurrencyCode (baseId);
            const minAmount = this.safeNumber (limits, baseId);
            for (let j = 0; j < quoteCurrencies.length; j++) {
                const quoteId = quoteCurrencies[j];
                const quote = this.safeCurrencyCode (quoteId);
                const id = baseId + '/' + quoteId;
                const symbol = base + '/' + quote;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': id,
                    'type': 'spot',
                    'spot': true,
                    'active': undefined,
                    'precision': this.precision,
                    'limits': {
                        'amount': { 'min': minAmount, 'max': undefined },
                    },
                });
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privatePostGetAccounts (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'CurrencyCode');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'AvailableBalance');
            account['total'] = this.safeString (balance, 'TotalBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (response, 'CreatedTimestampUtc'));
        return this.parseOrderBook (response, symbol, timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (ticker, 'CreatedTimestampUtc'));
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'LastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'DayHighestPrice'),
            'low': this.safeNumber (ticker, 'DayLowestPrice'),
            'bid': this.safeNumber (ticker, 'CurrentHighestBidPrice'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'CurrentLowestOfferPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeNumber (ticker, 'DayAvgPrice'),
            'baseVolume': this.safeNumber (ticker, 'DayVolumeXbtInSecondaryCurrrency'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        };
        const response = await this.publicGetGetMarketSummary (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //     {
        //         "OrderGuid": "c7347e4c-b865-4c94-8f74-d934d4b0b177",
        //         "CreatedTimestampUtc": "2014-09-23T12:39:34.3817763Z",
        //         "Type": "MarketBid",
        //         "VolumeOrdered": 5.0,
        //         "VolumeFilled": 5.0,
        //         "Price": null,
        //         "AvgPrice": 100.0,
        //         "ReservedAmount": 0.0,
        //         "Status": "Filled",
        //         "PrimaryCurrencyCode": "Xbt",
        //         "SecondaryCurrencyCode": "Usd"
        //     }
        //
        // fetchOpenOrders & fetchClosedOrders
        //
        //     {
        //         "OrderGuid": "b8f7ad89-e4e4-4dfe-9ea3-514d38b5edb3",
        //         "CreatedTimestampUtc": "2020-09-08T03:04:18.616367Z",
        //         "OrderType": "LimitOffer",
        //         "Volume": 0.0005,
        //         "Outstanding": 0.0005,
        //         "Price": 113885.83,
        //         "AvgPrice": 113885.83,
        //         "Value": 56.94,
        //         "Status": "Open",
        //         "PrimaryCurrencyCode": "Xbt",
        //         "SecondaryCurrencyCode": "Usd",
        //         "FeePercent": 0.005,
        //     }
        //
        let symbol = undefined;
        const baseId = this.safeString (order, 'PrimaryCurrencyCode');
        const quoteId = this.safeString (order, 'SecondaryCurrencyCode');
        let base = undefined;
        let quote = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        } else if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let orderType = this.safeString2 (order, 'Type', 'OrderType');
        let side = undefined;
        if (orderType.indexOf ('Bid') >= 0) {
            side = 'buy';
        } else if (orderType.indexOf ('Offer') >= 0) {
            side = 'sell';
        }
        if (orderType.indexOf ('Market') >= 0) {
            orderType = 'market';
        } else if (orderType.indexOf ('Limit') >= 0) {
            orderType = 'limit';
        }
        const timestamp = this.parse8601 (this.safeString (order, 'CreatedTimestampUtc'));
        const amount = this.safeString2 (order, 'VolumeOrdered', 'Volume');
        const filled = this.safeString (order, 'VolumeFilled');
        const remaining = this.safeString (order, 'Outstanding');
        const feeRate = this.safeNumber (order, 'FeePercent');
        let feeCost = undefined;
        if (feeRate !== undefined && filled !== undefined) {
            feeCost = feeRate * filled;
        }
        const fee = {
            'rate': feeRate,
            'cost': feeCost,
            'currency': base,
        };
        const id = this.safeString (order, 'OrderGuid');
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const cost = this.safeString (order, 'Value');
        const average = this.safeString (order, 'AvgPrice');
        const price = this.safeString (order, 'Price');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'PartiallyFilledAndCancelled': 'canceled',
            'Cancelled': 'canceled',
            'PartiallyFilledAndExpired': 'canceled',
            'Expired': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetOrderDetails (this.extend ({
            'orderGuid': id,
        }, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.ordered ({});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['primaryCurrencyCode'] = market['baseId'];
            request['secondaryCurrencyCode'] = market['quoteId'];
        }
        if (limit === undefined) {
            limit = 50;
        }
        request['pageIndex'] = 1;
        request['pageSize'] = limit;
        const response = await this.privatePostGetOpenOrders (this.extend (request, params));
        const data = this.safeValue (response, 'Data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.ordered ({});
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['primaryCurrencyCode'] = market['baseId'];
            request['secondaryCurrencyCode'] = market['quoteId'];
        }
        if (limit === undefined) {
            limit = 50;
        }
        request['pageIndex'] = 1;
        request['pageSize'] = limit;
        const response = await this.privatePostGetClosedOrders (this.extend (request, params));
        const data = this.safeValue (response, 'Data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const pageIndex = this.safeInteger (params, 'pageIndex', 1);
        if (limit === undefined) {
            limit = 50;
        }
        const request = this.ordered ({
            'pageIndex': pageIndex,
            'pageSize': limit,
        });
        const response = await this.privatePostGetTrades (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response['Data'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (trade['TradeTimestampUtc']);
        const id = this.safeString (trade, 'TradeGuid');
        const orderId = this.safeString (trade, 'OrderGuid');
        const priceString = this.safeString2 (trade, 'Price', 'SecondaryCurrencyTradePrice');
        const amountString = this.safeString2 (trade, 'VolumeTraded', 'PrimaryCurrencyAmount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const baseId = this.safeString (trade, 'PrimaryCurrencyCode');
        const quoteId = this.safeString (trade, 'SecondaryCurrencyCode');
        let marketId = undefined;
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            marketId = baseId + '/' + quoteId;
        }
        const symbol = this.safeSymbol (marketId, market, '/');
        let side = this.safeString (trade, 'OrderType');
        if (side !== undefined) {
            if (side.indexOf ('Bid') >= 0) {
                side = 'buy';
            } else if (side.indexOf ('Offer') >= 0) {
                side = 'sell';
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50, // max = 50
        };
        const response = await this.publicGetGetRecentTrades (this.extend (request, params));
        return this.parseTrades (response['Trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const capitalizedOrderType = this.capitalize (type);
        const method = 'privatePostPlace' + capitalizedOrderType + 'Order';
        let orderType = capitalizedOrderType;
        orderType += (side === 'sell') ? 'Offer' : 'Bid';
        const request = this.ordered ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        });
        if (type === 'limit') {
            request['price'] = price;
        }
        request['volume'] = amount;
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['OrderGuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderGuid': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const auth = [
                url,
                'apiKey=' + this.apiKey,
                'nonce=' + nonce.toString (),
            ];
            const keys = Object.keys (params);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = params[key].toString ();
                auth.push (key + '=' + value);
            }
            const message = auth.join (',');
            const signature = this.hmac (this.encode (message), this.encode (this.secret));
            const query = this.ordered ({});
            query['apiKey'] = this.apiKey;
            query['nonce'] = nonce;
            query['signature'] = signature.toUpperCase ();
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                query[key] = params[key];
            }
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
