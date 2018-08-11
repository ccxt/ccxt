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
                'api': 'https://api.bitforex.com',  
                'www': 'https://www.bitforex.com',
                'doc': 'https://github.com/bitforexapi/API_Docs/wiki',
                'fees': 'https://help.bitforex.com/en_us/?cat=13',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'api/v1/market/symbols',
                        'api/v1/market/ticker',
                        'api/v1/market/depth',
                        'api/v1/market/trades',
                        'api/v1/market/kline',
                    ],
                },
                'private': {
                    'post': [
                        'api/v1/fund/mainAccount',
                        'api/v1/fund/allAccount',
                        'api/v1/trade/placeOrder',
                        'api/v1/trade/cancelOrder',
                        'api/v1/trade/orderInfo',
                        'api/v1/trade/orderInfos',
                    ],
                },
            },
            'fees': {
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetApiV1MarketSymbols ();
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
        let sideId = this.safeString (trade, 'direction');
        let side = this.parseSide(sideId);
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
        let response = await this.publicGetApiV1MarketTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostApiV1FundAllAccount (params);
        let data = response['data'];
        let result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            let current = data[i];
            let currencyId = current['currency'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            result[code] = account;
            result[code]['used'] = this.safeFloat(current, 'frozen');
            result[code]['free'] = this.safeFloat(current, 'active');
            result[code]['total'] = this.safeFloat(current, 'fix');
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'symbol':market.id,
        };
        let response = await this.publicGetApiV1MarketTicker (this.extend (request, params));
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
        let response = await this.publicGetApiV1MarketDepth (this.extend (request, params));
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
        return -1
    }

    parseOrderStatus (orderStatusId) {
        if (orderStatusId === 0 || orderStatusId === 1) {
            return 'open';
        } else if (orderStatusId === 2) {
            return 'closed';
        } else if (orderStatusId === 3 || orderStatusId == 4) {
            return 'canceled';
        } else {
            return undefined;
        }
    }

    parseSide (sideId) {
        if (sideId === 1) {
            return 'buy';
        } else if (sideId === 2) {
            return 'sell';
        } else {
            return undefined;
        }
    }

    parseOrder (order, market = undefined) {
        let id =  this.safeString (order, 'orderId');
        let timestamp = this.safeFloat2 (order, 'lastTime', 'createTime');
        let iso8601 = this.iso8601 (timestamp);
        let symbol = market['symbol'];
        let sideId = this.safeInteger (order, 'tradeType');
        let side = this.parseSide (sideId);
        let type = undefined;
        let price = this.safeFloat (order, 'orderPrice');
        let average = this.safeFloat (order, 'avgPrice');
        let amount = this.safeFloat (order, 'orderAmount')
        let filled = this.safeFloat (order, 'dealAmount')
        let remaining = amount - filled;
        let statusId = this.safeInteger (order, 'orderState');
        let status = this.parseOrderStatus (statusId);
        let cost = filled * price;
        let fee = this.safeFloat (order, 'tradeFee');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
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
        let market = this.market (symbol);
        let request = {
            'symbol': this.marketId(symbol),
            'orderId': id,
        };
        let response = await this.privatePostApiV1TradeOrderInfo (this.extend (request, params));
        let order = this.parseOrder(response['data'], market);
        return order;
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': this.marketId(symbol),
            'state': 0,
        };
        let response = await this.privatePostApiV1TradeOrderInfos (this.extend (request, params));
        return this.parseOrders (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return -1;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let sideId = undefined;
        if (side === 'buy') {
            sideId = 1;
        } else if (side === 'sell') {
            sideId = 2;
        }
        let request = {
            'symbol': this.marketId(symbol),
            'price': price,
            'amount': amount,
            'tradeType': sideId,
        };
        let response = await this.privatePostApiV1TradePlaceOrder (this.extend (request, params));
        let data = response['data'];    //TODO: What if order fails?
        return {
            'info': response,
            'id': this.safeString (data, 'orderId')
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        if (typeof symbol !== 'undefined') {
            request['symbol'] = this.marketId(symbol);
        }
        let results = await this.privatePostApiV1TradeCancelOrder (this.extend (request, params));
        let data = results['data']; //True
        let sucess = results['success']; //True
        let time = results['time']; 
        return success;             //What's correct return val?
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
            let payload = this.urlencode ({ 'accessKey': this.apiKey });
            query['nonce'] = this.milliseconds();
            if (Object.keys (query).length) {
                payload += '&' + this.urlencode (this.keysort (query));
            }
            let message = '/' + path + '?' + payload;
            let signature = this.hmac (message, this.secret);
            body = payload + '&signData=' + signature;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        //TODO
        return;
    }
};
