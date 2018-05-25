'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btctradeua extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btctradeua',
            'name': 'BTC Trade UA',
            'countries': 'UA', // Ukraine,
            'rateLimit': 3000,
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchOpenOrders': true,
            },
            'urls': {
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
                'BCH/UAH': { 'id': 'bch_uah', 'symbol': 'BCH/UAH', 'base': 'BCH', 'quote': 'UAH' },
                'BTC/UAH': { 'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'precision': { 'price': 1 }, 'limits': { 'amount': { 'min': 0.0000000001 }}},
                'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
                'DASH/UAH': { 'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH' },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
                'DOGE/UAH': { 'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH' },
                'ETH/UAH': { 'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH' },
                'ITI/UAH': { 'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH' },
                'KRB/UAH': { 'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH' },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'LTC/UAH': { 'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH' },
                'NVC/BTC': { 'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC' },
                'NVC/UAH': { 'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH' },
                'PPC/BTC': { 'id': 'ppc_btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC' },
                'SIB/UAH': { 'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH' },
                'XMR/UAH': { 'id': 'xmr_uah', 'symbol': 'XMR/UAH', 'base': 'XMR', 'quote': 'UAH' },
                'ZEC/UAH': { 'id': 'zec_uah', 'symbol': 'ZEC/UAH', 'base': 'ZEC', 'quote': 'UAH' },
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

    signIn () {
        return this.privatePostAuth ();
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostBalance ();
        let result = { 'info': response };
        if ('accounts' in response) {
            let accounts = response['accounts'];
            for (let b = 0; b < accounts.length; b++) {
                let account = accounts[b];
                let currency = account['currency'];
                let balance = parseFloat (account['balance']);
                result[currency] = {
                    'free': balance,
                    'used': 0.0,
                    'total': balance,
                };
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let bids = await this.publicGetTradesBuySymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let asks = await this.publicGetTradesSellSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let orderbook = {
            'bids': [],
            'asks': [],
        };
        if (bids) {
            if ('list' in bids)
                orderbook['bids'] = bids['list'];
        }
        if (asks) {
            if ('list' in asks)
                orderbook['asks'] = asks['list'];
        }
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'currency_trade');
    }

    async fetchTicker (symbol, params = {}) {
        let response = await this.publicGetJapanStatHighSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        let ticker = response['trades'];
        let timestamp = this.milliseconds ();
        let result = {
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
        let tickerLength = ticker.length;
        if (tickerLength > 0) {
            let start = Math.max (tickerLength - 48, 0);
            for (let t = start; t < ticker.length; t++) {
                let candle = ticker[t];
                if (typeof result['open'] === 'undefined')
                    result['open'] = candle[1];
                if ((typeof result['high'] === 'undefined') || (result['high'] < candle[2]))
                    result['high'] = candle[2];
                if ((typeof result['low'] === 'undefined') || (result['low'] > candle[3]))
                    result['low'] = candle[3];
                if (typeof result['baseVolume'] === 'undefined')
                    result['baseVolume'] = -candle[5];
                else
                    result['baseVolume'] -= candle[5];
            }
            let last = tickerLength - 1;
            result['last'] = ticker[last][4];
            result['close'] = result['last'];
            result['baseVolume'] = -1 * result['baseVolume'];
        }
        return result;
    }

    convertCyrillicMonthNameToString (cyrillic) {
        let months = {
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
        let month = undefined;
        if (cyrillic in months)
            month = months[cyrillic];
        return month;
    }

    parseCyrillicDatetime (cyrillic) {
        let parts = cyrillic.split (' ');
        let day = parts[0];
        let month = this.convertCyrillicMonthNameToString (parts[1]);
        if (!month)
            throw new ExchangeError (this.id + ' parseTrade() undefined month name: ' + cyrillic);
        let year = parts[2];
        let hms = parts[4];
        let hmsLength = hms.length;
        if (hmsLength === 7) {
            hms = '0' + hms;
        }
        if (day.length === 1) {
            day = '0' + day;
        }
        let ymd = [ year, month, day ].join ('-');
        let ymdhms = ymd + 'T' + hms;
        let timestamp = this.parse8601 (ymdhms);
        // server reports local time, adjust to UTC
        let md = [ month, day ].join ('');
        md = parseInt (md);
        // a special case for DST
        // subtract 2 hours during winter
        if (md < 325 || md > 1028)
            return timestamp - 7200000;
        // subtract 3 hours during summer
        return timestamp - 10800000;
    }

    parseTrade (trade, market) {
        let timestamp = this.parseCyrillicDatetime (trade['pub_date']);
        return {
            'id': trade['id'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': trade['type'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amnt_trade'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetDealsSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        // they report each trade twice (once for both of the two sides of the fill)
        // deduplicate trades for that reason
        let trades = [];
        for (let i = 0; i < response.length; i++) {
            if (response[i]['id'] % 2) {
                trades.push (response[i]);
            }
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side) + 'Id';
        let order = {
            'count': amount,
            'currency1': market['quote'],
            'currency': market['base'],
            'price': price,
        };
        return this[method] (this.extend (order, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostRemoveOrderId ({ 'id': id });
    }

    parseOrder (trade, market) {
        let timestamp = this.milliseconds;
        return {
            'id': trade['id'],
            'timestamp': timestamp, // until they fix their timestamp
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amnt_trade'],
            'filled': 0,
            'remaining': trade['amnt_trade'],
            'trades': undefined,
            'info': trade,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol argument');
        let market = this.market (symbol);
        let response = await this.privatePostMyOrdersSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        let orders = response['your_open_orders'];
        return this.parseOrders (orders, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += this.implodeParams (path, query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query));
            let auth = body + this.secret;
            headers = {
                'public-key': this.apiKey,
                'api-sign': this.hash (this.encode (auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
