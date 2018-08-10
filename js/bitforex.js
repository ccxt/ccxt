'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitforex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitforex',
            'name': 'Bitforex',
            'countries': [ 'CN' ],
            'version': '1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1249087/43923293-57f06258-9bef-11e8-8630-53bd65111998.png',
                'api': 'https://api.bitforex.com/api/v1',  
                'www': 'https://www.bitforex.com',
                'doc': 'https://github.com/bitforexapi/API_Docs/wiki',
                'fees': 'https://help.bitforex.com/en_us/?cat=13',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'market/symbols',
                        'market/ticker',
                        'market/depth',
                        'market/trades',
                        'market/kline',
                    ],
                },
                'private': {
                    'post': [
                        'fund/mainAccount',
                        'fund/allAccount',
                        'fund/placeOrder',
                        'fund/cancelOrder',
                        'fund/orderInfo',
                        'fund/orderInfos',
                    ],
                },
            },
            'fees': {
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketSymbols ();
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let market = data[i];
            let id = market['symbol'];
            let symbolParts = id.split ('-');
            let baseId = symbolParts[2];
            let quoteId = symbolParts[1];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = true;
            let precision = {
                'amount':market['amountPrecision'],   //TODO: This is 4. Do we need to convert to decimal places? (eg. 0.0001?)
                'price':  market['pricePrecision'],
            };
            let limits = {
                'amount': {
                    'min': market['minOrderAmount'], 
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
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (trade, 'time');
        let id = this.safeString (trade, 'tid');
        let orderId = undefined
        let amount = this.safeFloat (trade, 'amount');
        let price = this.safeFloat (trade, 'price');
        let cost = undefined;
        if (typeof price !== 'undefined') {
            if (typeof amount !== 'undefined') {
                cost = amount * price;
            }
        }
        let side = "buy";
        let sideId = this.safeString (trade, 'direction');
        if (sideId == 2) {
            side = "sell";
        }
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': orderId,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId(symbol)
        }
        if (typeof limit !== 'undefined') {
            request['size'] = limit
        }
        let market = this.market(symbol);
        let response = await this.publicGetMarketTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        return -1;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'symbol':market.id,
        };
        let response = await this.publicGetMarketTicker (this.extend (request, params));
        let data = response['data'];
        return {
            'symbol': symbol,
            'timestamp': this.safeInteger(data, 'date'),
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (data, 'high'),
            'low': this.safeFloat (data, 'low'),
            'bid': this.safeFloat (data, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (data, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (data, 'last'),
            'last': this.safeFloat (data, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (data, 'vol'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'symbol': marketId,
        };
        if (typeof limit !== 'undefined') {
            request['size'] = limit
        }
        let response = await this.publicGetMarketDepth (this.extend (request, params));
        let data = response['data'];
        let timestamp = response['time'];
        let bidsKey = 'bids';
        let asksKey = 'asks';
        let priceKey = 'price';
        let amountKey = 'amount';
        let orderbook = this.parseOrderBook (data, timestamp, bidsKey, asksKey, priceKey, amountKey);
        return orderbook;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        return -1;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        return -1;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return -1;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();

            //TODO
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };    }

    handleErrors (code, reason, url, method, headers, body) {
        //TODO
        return;
    }
};
