'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btctradeua extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btctradeua',
            'name': 'BTC Trade UA',
            'countries': [ 'UA' ], // Ukraine,
            'rateLimit': 3000,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'signIn': true,
            },
            'urls': {
                'referral': 'https://btc-trade.com.ua/registration/22689',
                'logo': 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
                'api': 'https://btc-trade.com.ua/api',
                'www': 'https://btc-trade.com.ua',
                'doc': 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
            },
            'api': {
                'public': {
                    'get': [
                        'deals/{symbol}',
                        'trades/sell/{symbol}',
                        'trades/buy/{symbol}',
                        'japan_stat/high/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'auth',
                        'ask/{symbol}',
                        'balance',
                        'bid/{symbol}',
                        'buy/{symbol}',
                        'my_orders/{symbol}',
                        'order/status/{id}',
                        'remove/order/{id}',
                        'sell/{symbol}',
                    ],
                },
            },
            'markets': {
                'BCH/UAH': { 'id': 'bch_uah', 'symbol': 'BCH/UAH', 'base': 'BCH', 'quote': 'UAH', 'baseId': 'bch', 'quoteId': 'uah' },
                'BTC/UAH': { 'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'baseId': 'btc', 'quoteId': 'uah', 'precision': { 'price': 1 }, 'limits': { 'amount': { 'min': 0.0000000001 }}},
                'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'dash', 'quoteId': 'btc' },
                'DASH/UAH': { 'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH', 'baseId': 'dash', 'quoteId': 'uah' },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
                'DOGE/UAH': { 'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH', 'baseId': 'doge', 'quoteId': 'uah' },
                'ETH/UAH': { 'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'baseId': 'eth', 'quoteId': 'uah' },
                'ITI/UAH': { 'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH', 'baseId': 'iti', 'quoteId': 'uah' },
                'KRB/UAH': { 'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH', 'baseId': 'krb', 'quoteId': 'uah' },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
                'LTC/UAH': { 'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH', 'baseId': 'ltc', 'quoteId': 'uah' },
                'NVC/BTC': { 'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC', 'baseId': 'nvc', 'quoteId': 'btc' },
                'NVC/UAH': { 'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH', 'baseId': 'nvc', 'quoteId': 'uah' },
                'PPC/BTC': { 'id': 'ppc_btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC', 'baseId': 'ppc', 'quoteId': 'btc' },
                'SIB/UAH': { 'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH', 'baseId': 'sib', 'quoteId': 'uah' },
                'XMR/UAH': { 'id': 'xmr_uah', 'symbol': 'XMR/UAH', 'base': 'XMR', 'quote': 'UAH', 'baseId': 'xmr', 'quoteId': 'uah' },
                'ZEC/UAH': { 'id': 'zec_uah', 'symbol': 'ZEC/UAH', 'base': 'ZEC', 'quote': 'UAH', 'baseId': 'zec', 'quoteId': 'uah' },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0006,
                        'LTC': 0.01,
                        'NVC': 0.01,
                        'DOGE': 10,
                    },
                },
            },
        });
    }

    async signIn (params = {}) {
        return await this.privatePostAuth (params);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        const result = { 'info': response };
        const balances = this.safeValue (response, 'accounts');
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const bids = await this.publicGetTradesBuySymbol (this.extend (request, params));
        const asks = await this.publicGetTradesSellSymbol (this.extend (request, params));
        const orderbook = {
            'bids': [],
            'asks': [],
        };
        if (bids) {
            if ('list' in bids) {
                orderbook['bids'] = bids['list'];
            }
        }
        if (asks) {
            if ('list' in asks) {
                orderbook['asks'] = asks['list'];
            }
        }
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'currency_trade');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetJapanStatHighSymbol (this.extend (request, params));
        const ticker = this.safeValue (response, 'trades');
        const timestamp = this.milliseconds ();
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
        const tickerLength = ticker.length;
        if (tickerLength > 0) {
            const start = Math.max (tickerLength - 48, 0);
            for (let i = start; i < ticker.length; i++) {
                const candle = ticker[i];
                if (result['open'] === undefined) {
                    result['open'] = candle[1];
                }
                if ((result['high'] === undefined) || (result['high'] < candle[2])) {
                    result['high'] = candle[2];
                }
                if ((result['low'] === undefined) || (result['low'] > candle[3])) {
                    result['low'] = candle[3];
                }
                if (result['baseVolume'] === undefined) {
                    result['baseVolume'] = -candle[5];
                } else {
                    result['baseVolume'] -= candle[5];
                }
            }
            const last = tickerLength - 1;
            result['last'] = ticker[last][4];
            result['close'] = result['last'];
            result['baseVolume'] = -1 * result['baseVolume'];
        }
        return result;
    }

    convertCyrillicMonthNameToString (cyrillic) {
        const months = {
            'января': '01',
            'февраля': '02',
            'марта': '03',
            'апреля': '04',
            'мая': '05',
            'июня': '06',
            'июля': '07',
            'августа': '08',
            'сентября': '09',
            'октября': '10',
            'ноября': '11',
            'декабря': '12',
        };
        return this.safeString (months, cyrillic);
    }

    parseCyrillicDatetime (cyrillic) {
        const parts = cyrillic.split (' ');
        let day = parts[0];
        const month = this.convertCyrillicMonthNameToString (parts[1]);
        if (!month) {
            throw new ExchangeError (this.id + ' parseTrade() undefined month name: ' + cyrillic);
        }
        const year = parts[2];
        let hms = parts[4];
        const hmsLength = hms.length;
        if (hmsLength === 7) {
            hms = '0' + hms;
        }
        if (day.length === 1) {
            day = '0' + day;
        }
        const ymd = [ year, month, day ].join ('-');
        const ymdhms = ymd + 'T' + hms;
        const timestamp = this.parse8601 (ymdhms);
        // server reports local time, adjust to UTC
        let md = [ month, day ].join ('');
        md = parseInt (md);
        // a special case for DST
        // subtract 2 hours during winter
        if (md < 325 || md > 1028) {
            return timestamp - 7200000;
        }
        // subtract 3 hours during summer
        return timestamp - 10800000;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parseCyrillicDatetime (this.safeString (trade, 'pub_date'));
        const id = this.safeString (trade, 'id');
        const type = 'limit';
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amnt_trade');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'order': undefined,
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
            'symbol': market['id'],
        };
        const response = await this.publicGetDealsSymbol (this.extend (request, params));
        // they report each trade twice (once for both of the two sides of the fill)
        // deduplicate trades for that reason
        const trades = [];
        for (let i = 0; i < response.length; i++) {
            if (response[i]['id'] % 2) {
                trades.push (response[i]);
            }
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privatePost' + this.capitalize (side) + 'Id';
        const request = {
            'count': amount,
            'currency1': market['quoteId'],
            'currency': market['baseId'],
            'price': price,
        };
        return this[method] (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privatePostRemoveOrderId (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp, // until they fix their timestamp
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'type'),
            'price': this.safeFloat (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeFloat (order, 'amnt_trade'),
            'filled': 0,
            'remaining': this.safeFloat (order, 'amnt_trade'),
            'trades': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privatePostMyOrdersSymbol (this.extend (request, params));
        const orders = this.safeValue (response, 'your_open_orders');
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += this.implodeParams (path, query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query));
            const auth = body + this.secret;
            headers = {
                'public-key': this.apiKey,
                'api-sign': this.hash (this.encode (auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
