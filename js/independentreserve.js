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
        });
    }

    async fetchMarkets () {
        let baseCurrencies = await this.publicGetGetValidPrimaryCurrencyCodes ();
        let quoteCurrencies = await this.publicGetGetValidSecondaryCurrencyCodes ();
        let result = [];
        for (let i = 0; i < baseCurrencies.length; i++) {
            let baseId = baseCurrencies[i];
            let baseIdUppercase = baseId.toUpperCase ();
            let base = this.commonCurrencyCode (baseIdUppercase);
            for (let j = 0; j < quoteCurrencies.length; j++) {
                let quoteId = quoteCurrencies[j];
                let quoteIdUppercase = quoteId.toUpperCase ();
                let quote = this.commonCurrencyCode (quoteIdUppercase);
                let id = baseId + '/' + quoteId;
                let symbol = base + '/' + quote;
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
        let balances = await this.privatePostGetAccounts ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyCode = balance['CurrencyCode'];
            let uppercase = currencyCode.toUpperCase ();
            let currency = this.commonCurrencyCode (uppercase);
            let account = this.account ();
            account['free'] = balance['AvailableBalance'];
            account['total'] = balance['TotalBalance'];
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetOrderBook (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params));
        let timestamp = this.parse8601 (response['CreatedTimestampUtc']);
        return this.parseOrderBook (response, timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['CreatedTimestampUtc']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = ticker['LastPrice'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['DayHighestPrice'],
            'low': ticker['DayLowestPrice'],
            'bid': ticker['CurrentHighestBidPrice'],
            'bidVolume': undefined,
            'ask': ticker['CurrentLowestOfferPrice'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': ticker['DayAvgPrice'],
            'baseVolume': ticker['DayVolumeXbtInSecondaryCurrrency'],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetMarketSummary (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market === 'undefined') {
            symbol = market['symbol'];
        } else {
            market = this.findMarket (order['PrimaryCurrencyCode'] + '/' + order['SecondaryCurrencyCode']);
        }
        let orderType = this.safeValue (order, 'Type');
        if (orderType.indexOf ('Market') >= 0)
            orderType = 'market';
        else if (orderType.indexOf ('Limit') >= 0)
            orderType = 'limit';
        let side = undefined;
        if (orderType.indexOf ('Bid') >= 0)
            side = 'buy';
        else if (orderType.indexOf ('Offer') >= 0)
            side = 'sell';
        let timestamp = this.parse8601 (order['CreatedTimestampUtc']);
        let amount = this.safeFloat (order, 'VolumeOrdered');
        if (typeof amount === 'undefined')
            amount = this.safeFloat (order, 'Volume');
        let filled = this.safeFloat (order, 'VolumeFilled');
        let remaining = undefined;
        let feeRate = this.safeFloat (order, 'FeePercent');
        let feeCost = undefined;
        if (typeof amount !== 'undefined') {
            if (typeof filled !== 'undefined') {
                remaining = amount - filled;
                if (typeof feeRate !== 'undefined')
                    feeCost = feeRate * filled;
            }
        }
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['base'];
        }
        let fee = {
            'rate': feeRate,
            'cost': feeCost,
            'currency': feeCurrency,
        };
        let id = order['OrderGuid'];
        let status = this.parseOrderStatus (order['Status']);
        let cost = this.safeFloat (order, 'Value');
        let average = this.safeFloat (order, 'AvgPrice');
        let price = this.safeFloat (order, 'Price', average);
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
        let statuses = {
            'Open': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'PartiallyFilledAndCancelled': 'canceled',
            'Cancelled': 'canceled',
            'PartiallyFilledAndExpired': 'canceled',
            'Expired': 'canceled',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetOrderDetails (this.extend ({
            'orderGuid': id,
        }, params));
        let market = undefined;
        if (typeof symbol !== 'undefined')
            market = this.market (symbol);
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let pageIndex = this.safeInteger (params, 'pageIndex', 1);
        const request = this.ordered ({
            'pageIndex': pageIndex,
            'pageSize': limit,
        });
        const response = await this.privatePostGetTrades (this.extend (request, params));
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
        }
        return this.parseTrades (response['Data'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['TradeTimestampUtc']);
        let id = this.safeString (trade, 'TradeGuid');
        let orderId = this.safeString (trade, 'OrderGuid');
        let price = this.safeFloat (trade, 'Price');
        if (typeof price === 'undefined') {
            price = this.safeFloat (trade, 'SecondaryCurrencyTradePrice');
        }
        let amount = this.safeFloat (trade, 'VolumeTraded');
        if (typeof amount === 'undefined') {
            amount = this.safeFloat (trade, 'PrimaryCurrencyAmount');
        }
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let side = this.safeString (trade, 'OrderType');
        if (typeof side !== 'undefined') {
            if (side.indexOf ('Bid') >= 0)
                side = 'buy';
            else if (side.indexOf ('Offer') >= 0)
                side = 'sell';
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
            'price': price,
            'amount': amount,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetRecentTrades (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50, // max = 50
        }, params));
        return this.parseTrades (response['Trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let capitalizedOrderType = this.capitalize (type);
        let method = 'privatePostPlace' + capitalizedOrderType + 'Order';
        let orderType = capitalizedOrderType;
        orderType += (side === 'sell') ? 'Offer' : 'Bid';
        let order = this.ordered ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        });
        if (type === 'limit')
            order['price'] = price;
        order['volume'] = amount;
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['OrderGuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'orderGuid': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let auth = [
                url,
                'apiKey=' + this.apiKey,
                'nonce=' + nonce.toString (),
            ];
            let keys = Object.keys (params);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                auth.push (key + '=' + params[key]);
            }
            let message = auth.join (',');
            let signature = this.hmac (this.encode (message), this.encode (this.secret));
            body = this.json ({
                'apiKey': this.apiKey,
                'nonce': nonce,
                'signature': signature.toUpperCase (),
            });
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
