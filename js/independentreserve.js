"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')

//  ---------------------------------------------------------------------------

module.exports = class independentreserve extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'independentreserve',
            'name': 'Independent Reserve',
            'countries': [ 'AU', 'NZ' ], // Australia, New Zealand
            'rateLimit': 1000,
            'hasCORS': false,
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
        });
    }

    async fetchMarkets () {
        let baseCurrencies = await this.publicGetValidPrimaryCurrencyCodes ();
        let quoteCurrencies = await this.publicGetValidSecondaryCurrencyCodes ();
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
                let taker = 0.5 / 100;
                let maker = 0.5 / 100;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'taker': taker,
                    'maker': maker,
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

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOrderBook (this.extend ({
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
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker['DayHighestPrice'],
            'low': ticker['DayLowestPrice'],
            'bid': ticker['CurrentHighestBidPrice'],
            'ask': ticker['CurrentLowestOfferPrice'],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': ticker['LastPrice'],
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
        let response = await this.publicGetMarketSummary (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['TradeTimestampUtc']);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'price': trade['SecondaryCurrencyTradePrice'],
            'amount': trade['PrimaryCurrencyAmount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetRecentTrades (this.extend ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50, // max = 50
        }, params));
        return this.parseTrades (response['Trades'], market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let capitalizedOrderType = this.capitalize (type);
        let method = 'Place' + capitalizedOrderType + 'Order';
        let orderType = capitalizedOrderType;
        orderType += (side == 'sell') ?  'Offer' : 'Bid';
        let order = this.ordered ({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        });
        if (type == 'limit')
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
        if (api == 'public') {
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
            let keysorted = this.keysort (params);
            let keys = Object.keys (keysorted);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                auth.push (key + '=' + params[key]);
            }
            let message = auth.join (',');
            let signature = this.hmac (this.encode (message), this.encode (this.secret));
            let query = this.keysort (this.extend ({
                'apiKey': this.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params));
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // todo error handling
        return response;
    }
}
