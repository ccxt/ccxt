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
                    'public': 'https://api.virwox.com/api/json.php',
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
        const response = await this.publicGetGetInstruments (params);
        const markets = this.safeValue (response, 'result');
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = this.safeValue (markets, key, {});
            const id = this.safeString (market, 'instrumentID');
            const baseId = this.safeString (market, 'longCurrency');
            const quoteId = this.safeString (market, 'shortCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetBalances (params);
        const balances = this.safeValue (response['result'], 'accountList');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMarketPrice (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbols': [ symbol ],
        };
        const response = await this.publicPostGetBestPrices (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return {
            'bid': this.safeFloat (result[0], 'bestBuyPrice'),
            'ask': this.safeFloat (result[0], 'bestSellPrice'),
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbols': [ symbol ],
        };
        if (limit !== undefined) {
            request['buyDepth'] = limit; // 100
            request['sellDepth'] = limit; // 100
        }
        const response = await this.publicPostGetMarketDepth (this.extend (request, params));
        const orderbook = response['result'][0];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'price', 'volume');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const end = this.milliseconds ();
        const start = end - 86400000;
        const request = {
            'instrument': symbol,
            'endDate': this.ymdhms (end),
            'startDate': this.ymdhms (start),
            'HLOC': 1,
        };
        const response = await this.publicGetGetTradedPriceVolume (this.extend (request, params));
        const tickers = this.safeValue (response['result'], 'priceVolumeList');
        const keys = Object.keys (tickers);
        const length = keys.length;
        const lastKey = keys[length - 1];
        const ticker = this.safeValue (tickers, lastKey);
        const timestamp = this.milliseconds ();
        const close = this.safeFloat (ticker, 'close');
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

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'time');
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'vol');
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
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': symbol,
            'timespan': 3600,
        };
        const response = await this.publicGetGetRawTradeData (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument': market['symbol'],
            'orderType': side.toUpperCase (),
            'amount': amount,
        };
        if (type === 'limit') {
            request['price'] = price;
        }
        const response = await this.privatePostPlaceOrder (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response['result'], 'orderID'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderID': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const auth = {};
        if (api === 'private') {
            this.checkRequiredCredentials ();
            auth['key'] = this.apiKey;
            auth['user'] = this.login;
            auth['pass'] = this.password;
        }
        const nonce = this.nonce ();
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

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 200) {
            if ((body[0] === '{') || (body[0] === '[')) {
                if ('result' in response) {
                    const result = response['result'];
                    if ('errorCode' in result) {
                        const errorCode = result['errorCode'];
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
