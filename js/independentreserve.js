'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class independentreserve extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'independentreserve',
            'name': 'Independent Reserve',
            'countries': [ 'AU', 'NZ' ], // Australia, New Zealand
            'rateLimit': 1000,
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg',
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
                    ],
                },
                'private': {
                    'post': [
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'WithdrawDigitalCurrency',
                        'RequestFiatWithdrawal',
                        'GetTrades',
                        'GetBrokerageFees',
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
        const result = [];
        for (let i = 0; i < baseCurrencies.length; i++) {
            const baseId = baseCurrencies[i];
            const base = this.safeCurrencyCode (baseId);
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
            account['free'] = this.safeFloat (balance, 'AvailableBalance');
            account['total'] = this.safeFloat (balance, 'TotalBalance');
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
        return this.parseOrderBook (response, timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (ticker, 'CreatedTimestampUtc'));
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'LastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'DayHighestPrice'),
            'low': this.safeFloat (ticker, 'DayLowestPrice'),
            'bid': this.safeFloat (ticker, 'CurrentHighestBidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'CurrentLowestOfferPrice'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'DayAvgPrice'),
            'baseVolume': this.safeFloat (ticker, 'DayVolumeXbtInSecondaryCurrrency'),
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
        let symbol = undefined;
        const baseId = this.safeString (order, 'PrimaryCurrencyCode');
        const quoteId = this.safeString (order, 'PrimaryCurrencyCode');
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
        let orderType = this.safeValue (order, 'Type');
        if (orderType.indexOf ('Market') >= 0) {
            orderType = 'market';
        } else if (orderType.indexOf ('Limit') >= 0) {
            orderType = 'limit';
        }
        let side = undefined;
        if (orderType.indexOf ('Bid') >= 0) {
            side = 'buy';
        } else if (orderType.indexOf ('Offer') >= 0) {
            side = 'sell';
        }
        const timestamp = this.parse8601 (this.safeString (order, 'CreatedTimestampUtc'));
        let amount = this.safeFloat (order, 'VolumeOrdered');
        if (amount === undefined) {
            amount = this.safeFloat (order, 'Volume');
        }
        const filled = this.safeFloat (order, 'VolumeFilled');
        let remaining = undefined;
        const feeRate = this.safeFloat (order, 'FeePercent');
        let feeCost = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
                if (feeRate !== undefined) {
                    feeCost = feeRate * filled;
                }
            }
        }
        const fee = {
            'rate': feeRate,
            'cost': feeCost,
            'currency': base,
        };
        const id = this.safeString (order, 'OrderGuid');
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const cost = this.safeFloat (order, 'Value');
        const average = this.safeFloat (order, 'AvgPrice');
        const price = this.safeFloat (order, 'Price', average);
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
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
        const price = this.safeFloat2 (trade, 'Price', 'SecondaryCurrencyTradePrice');
        const amount = this.safeFloat2 (trade, 'VolumeTraded', 'PrimaryCurrencyAmount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
