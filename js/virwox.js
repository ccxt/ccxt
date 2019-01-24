'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class virwox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'virwox',
            'name': 'VirWoX',
            'countries': [ 'AT', 'EU' ],
            'rateLimit': 1000,
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg',
                'api': {
                    'public': 'http://api.virwox.com/api/json.php',
                    'private': 'https://www.virwox.com/api/trading.php',
                },
                'www': 'https://www.virwox.com',
                'doc': 'https://www.virwox.com/developers.php',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'login': true,
                'password': true,
            },
            'api': {
                'public': {
                    'get': [
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ],
                    'post': [
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ],
                },
                'private': {
                    'get': [
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ],
                    'post': [
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetGetInstruments ();
        let keys = Object.keys (markets['result']);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let market = markets['result'][keys[p]];
            let id = market['instrumentID'];
            let symbol = market['symbol'];
            let base = market['longCurrency'];
            let quote = market['shortCurrency'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetBalances ();
        let balances = response['result']['accountList'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let total = balance['balance'];
            let account = {
                'free': total,
                'used': 0.0,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMarketPrice (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicPostGetBestPrices (this.extend ({
            'symbols': [ symbol ],
        }, params));
        let result = response['result'];
        return {
            'bid': this.safeFloat (result[0], 'bestBuyPrice'),
            'ask': this.safeFloat (result[0], 'bestSellPrice'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbols': [ symbol ],
        };
        if (limit !== undefined) {
            request['buyDepth'] = limit; // 100
            request['sellDepth'] = limit; // 100
        }
        let response = await this.publicPostGetMarketDepth (this.extend (request, params));
        let orderbook = response['result'][0];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'price', 'volume');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let end = this.milliseconds ();
        let start = end - 86400000;
        let response = await this.publicGetGetTradedPriceVolume (this.extend ({
            'instrument': symbol,
            'endDate': this.ymdhms (end),
            'startDate': this.ymdhms (start),
            'HLOC': 1,
        }, params));
        let tickers = response['result']['priceVolumeList'];
        let keys = Object.keys (tickers);
        let length = keys.length;
        let lastKey = keys[length - 1];
        let ticker = tickers[lastKey];
        let timestamp = this.milliseconds ();
        let close = this.safeFloat (ticker, 'close');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'longVolume'),
            'quoteVolume': this.safeFloat (ticker, 'shortVolume'),
            'info': ticker,
        };
    }

    parseTrade (trade, symbol = undefined) {
        let sec = this.safeInteger (trade, 'time');
        let timestamp = sec * 1000;
        return {
            'id': trade['tid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'vol'),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetGetRawTradeData (this.extend ({
            'instrument': symbol,
            'timespan': 3600,
        }, params));
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'data', []);
        return this.parseTrades (trades, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'instrument': market['symbol'],
            'orderType': side.toUpperCase (),
            'amount': amount,
        };
        if (type === 'limit')
            order['price'] = price;
        let response = await this.privatePostPlaceOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['result']['orderID'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancelOrder (this.extend ({
            'orderID': id,
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let auth = {};
        if (api === 'private') {
            this.checkRequiredCredentials ();
            auth['key'] = this.apiKey;
            auth['user'] = this.login;
            auth['pass'] = this.password;
        }
        let nonce = this.nonce ();
        if (method === 'GET') {
            url += '?' + this.urlencode (this.extend ({
                'method': path,
                'id': nonce,
            }, auth, params));
        } else {
            headers = { 'Content-Type': 'application/json' };
            body = this.json ({
                'method': path,
                'params': this.extend (auth, params),
                'id': nonce,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code === 200) {
            if ((body[0] === '{') || (body[0] === '[')) {
                if ('result' in response) {
                    let result = response['result'];
                    if ('errorCode' in result) {
                        let errorCode = result['errorCode'];
                        if (errorCode !== 'OK') {
                            throw new ExchangeError (this.id + ' error returned: ' + body);
                        }
                    }
                } else {
                    throw new ExchangeError (this.id + ' malformed response: no result in response: ' + body);
                }
            } else {
                // if not a JSON response
                throw new ExchangeError (this.id + ' returned a non-JSON reply: ' + body);
            }
        }
    }
};
