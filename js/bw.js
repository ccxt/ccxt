'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, OrderNotFound, InsufficientFunds, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bw',
            'name': 'Bw',
            'countries': [ 'CN' ],
            'version': 'v1',
            'has': {
                'fetchBalance': true,
                'fetchMarkets': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchMyTrades': false,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/bw.jpg',
                'api': 'https://www.bw.com',
                'publicapi': 'https://kline.bw.com',
                'www': 'https://www.bw.com',
                'doc': 'https://www.bw.com/help/restApi',
                'fees': 'https://www.bw.com/help/rate',
                'referral': 'https://www.bw.com/regGetCommission/N2d2NjJEd2FMTHM=?lan=cn',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/config/controller/website/marketcontroller/getByWebId',
                        'exchange/config/controller/website/currencycontroller/getCurrencyList',
                        'api/data/v1/ticker',
                        'api/data/v1/entrusts',
                        'api/data/v1/trades',
                        'api/data/v1/klines',
                    ],
                },
                'private': {
                    'get':[
                        'exchange/entrust/controller/website/EntrustController/getEntrustById',
                        'exchange/entrust/controller/website/EntrustController/batchCancelEntrustByMarketId',
                    ],
                    'post': [
                        'exchange/entrust/controller/website/EntrustController/getEntrustById',
                        'exchange/fund/controller/website/fundcontroller/findbypage',
                        'exchange/entrust/controller/website/EntrustController/addEntrust',
                        'exchange/entrust/controller/website/EntrustController/cancelEntrust',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'deposit': {},
                    'withdraw': {
                        'BTC': 0.001,
                        'ETH': 0.01,
                        'BCHABC': 0.001,
                        'LTC': 0.03,
                        'ETC': 0.1,
                        'USDT': 5,
                        'GMB': 1000,
                        'BSV': 0.001,
                        'GUSD': 6,
                        'LST': 10,
                        'DOGE': 1500,
                        '1ST': 30,
                        'OMG': 0.7,
                        'MANA': 80,
                        'TRUE': 6,
                        'BTM': 6,
                        'ADA': 10,
                        'XRP': 2,
                        'XWC': 1,
                        'QC': 5,
                        'DASH': 0.02,
                        'NEO': 0,
                        'QTUM': 0.2,
                        'LTC': 0.03,
                        'EOS': 0.5
                    },
                },
            },
            'exceptions': {
                '2012': OrderNotFound,
                '2014': OrderNotFound,
                '2015': OrderNotFound,
                '6895': AuthenticationError,
                '6896': AuthenticationError,
                '6897': AuthenticationError,
                '6898': AuthenticationError
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetExchangeConfigControllerWebsiteMarketcontrollerGetByWebId();
        let data = response['datas'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let market = data[i];
            let id = market['marketId'];
            let name = market['name'];
            let [ baseId, quoteId ] = name.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = market['state'] == 1;
            let precision = {
                'amount': market['amountDecimal'],
                'price': market['priceDecimal'],
            };
            let limits = {
                'amount': {
                    'min': market['minAmount'],
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

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetExchangeConfigControllerWebsiteCurrencycontrollerGetCurrencyList (params);
        let currencies = response['datas'];
        let result = {};
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let id = currency['currencyId'];
            let name = currency['name'];
            let code = this.commonCurrencyCode (id);
            result[code] = {
            'id': id,
            'code': code,
            'info': currency, // the original payload
            'name': name
            };
        };
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'marketId': market['id'],
        };
        let response = await this.publicGetApiDataV1Ticker (this.extend (request, params));
        let data = response['datas'];
        let timestamp = Date.now();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': data[2],
            'low': data[3],
            'bid': data[7],
            'bidVolume': undefined,
            'ask': data[8],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': data[1],
            'last': data[1],
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': data[4],
            'quoteVolume': undefined,
            'info': response,
        };
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = trade[2];
        let id = timestamp;
        let orderId = undefined;
        let amount = trade[6];
        let price = trade[5];
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        
        let side = trade[4];
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

    async fetchTrades (symbol, since = undefined, limit = 10, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'marketId': market['id'],
            'dataSize': Math.min(limit, 20)
        };
        let response = await this.publicGetApiDataV1Trades (this.extend (request, params));

        return this.parseTrades (response['datas'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'marketId': marketId,
        };
        if (typeof limit !== 'undefined') {
            request['size'] = limit;
        }
        let response = await this.publicGetApiDataV1Entrusts (this.extend (request, params));
        let data = response['datas'];
        let timestamp = response['timestamp'];
        let bidsKey = 'bids';
        let asksKey = 'asks';
        let priceKey = 0;
        let amountKey = 1;
        let orderbook = this.parseOrderBook (data, timestamp, bidsKey, asksKey, priceKey, amountKey);
        return orderbook;
    }


    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[3], // timestamp
            parseFloat (ohlcv[4]), // Open
            parseFloat (ohlcv[5]), // High
            parseFloat (ohlcv[6]), // Low
            parseFloat (ohlcv[7]), // Close
            parseFloat (ohlcv[8]), // 
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'marketId': market['id'],
            'type': timeframe.toUpperCase()
        };
        if (typeof limit !== 'undefined') {
            request['dataSize'] = limit;
        }
        
        let response = await this.publicGetApiDataV1Klines (this.extend (request, params));
        return this.parseOHLCVs (response["datas"], market, timeframe, since, limit);
    }

    async fetchBalance (params = {pageSize:200, pageNum:1}) {
        await this.loadMarkets ();
        let response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerFindbypage (params);
        let data = response['datas']['list'];
        let result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            let current = data[i];
            let currencyId = current['currencyTypeId'];
            let name = "";
            if (currencyId in this.currencies_by_id) {
                name = this.currencies_by_id[currencyId]['name'];
            } else {
                name = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            result[name] = account;
            result[name]['used'] = this.safeFloat (current, 'freeze');
            result[name]['free'] = this.safeFloat (current, 'amount');
            result[name]['total'] = result[name]['used'] + result[name]['free'];
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (orderStatusId) {
        if (orderStatusId === 0 || orderStatusId === 3) {
            return 'open';
        } else if (orderStatusId === 2) {
            return 'closed';
        } else if (orderStatusId === 1) {
            return 'canceled';
        } else {
            return undefined;
        }
    }

    parseSide (sideId) {
        if (sideId === 1) {
            return 'buy';
        } else if (sideId === 0) {
            return 'sell';
        } else {
            return undefined;
        }
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'entrustId');
        let timestamp = this.safeFloat2 (order, 'createTime');
        let iso8601 = this.iso8601 (timestamp);
        let lastTradeTimestamp = undefined;
        let symbol = market['symbol'];
        let sideId = this.safeInteger (order, 'type');
        let side = this.parseSide (sideId);
        let type = undefined;
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'completeAmount');
        let average = filled > 0 ? this.safeFloat (order, 'completeTotalMoney') / filled : 0;
        let remaining = amount - filled;
        let statusId = this.safeInteger (order, 'status');
        let status = this.parseOrderStatus (statusId);
        let cost = filled * price;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': lastTradeTimestamp,
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
            'fee': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'marketId': this.marketId (symbol),
            'entrustId': id,
        };
        let response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetEntrustById (this.extend (request, params));
        let order = this.parseOrder (response['datas'], market);
        return order;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let sideId = undefined;
        if (side === 'buy') {
            sideId = 1;
        } else if (side === 'sell') {
            sideId = 0;
        }
        let request = {
            'marketId': this.marketId (symbol),
            'price': price,
            'amount': amount,
            'rangeType': 0,
            'type': sideId,
        };
        let response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerAddEntrust (this.extend (request, params));
        let data = response['datas'];
        return {
            'info': response,
            'id': this.safeString (data, 'entrustId'),
            'price': price,
            'amount': amount,
            'side': side == 'buy' ? 1 : 2
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'entrustId': id,
        };
        if (typeof symbol !== 'undefined') {
            request['marketId'] = this.marketId (symbol);
        }
        let results = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerCancelEntrust (this.extend (request, params));
        let success = results['resMsg'];
        let returnVal = { 'info': results, 'success': success.message };
        return returnVal;
    }

    async cancelAllOrders (symbol, params = {}){
        await this.loadMarkets ();
        let request = {
        };
        if (typeof symbol !== 'undefined') {
            request['marketId'] = this.marketId (symbol);
        }
        let results = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerBatchCancelEntrustByMarketId (this.extend (request, params));
        let success = results['resMsg'];
        let returnVal = { 'info': results, 'success': success.message };
        return returnVal;
    }
    
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = "";
        if (api === 'public') {
            let baseUrl = path.indexOf('api/data/v1') >= 0 ? this.urls['publicapi'] : this.urls['api'];
            url = baseUrl + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url = this.urls['api'] + '/' + this.implodeParams (path, params);
            
            this.checkRequiredCredentials ();
            let nonce = this.milliseconds ().toString();
            let payload = '';
            if(method == 'GET'){
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                query = this.keysort(query);
                for(let key in query){
                    payload += key + query[key];
                }
            } else {
                payload = JSON.stringify(query);
                body = payload;
            }
            let message = this.apiKey + nonce + payload + this.secret;
            let signature = this.hash(this.encode (message));
            headers = {
                "User-Agent" : "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.0.3) Gecko/2008092417 Firefox/3.0.3",
                'Apiid' : this.apiKey,
                'Timestamp': nonce,
                'Sign' : signature
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (typeof body !== 'string') {
            return; // fallback to default error handler
        }
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            let feedback = this.id + ' ' + body + ' url:' + url;
            let result = this.safeValue (response, 'resMsg');
            if (typeof result !== 'undefined') {
                if (result.code != 1) {
                    let code = this.safeString (result, 'code');
                    if (code in this.exceptions) {
                        throw new this.exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
    }
};
