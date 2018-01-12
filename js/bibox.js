"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bibox extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': [ 'CN', 'US', 'KR' ],
            'version': 'v1',
            'hasCORS': false,
            'hasFetchBalance': true,
            'hasFetchCurrencies': true,
            'hasFetchTickers': true,
            'hasFetchOrders': true,
            'hasFetchMyTrades': true,
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'has': {
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '8h': '12hour',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': '',
                'api': 'https://api.bibox.com',
                'www': 'https://www.bibox.com/',
                'doc': 'https://github.com/Biboxcom/api_reference/wiki/home_en',
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/115004417013-Fee-Structure-on-Bibox',
            },
            'api': {
                'public': {
                    'post': [
                        'mdata',
                    ],
                },
                'private': {
                    'post': [
                        'user',
                        'orderpending',
                        'transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.0,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                    },
                    'deposit': 0.0,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicPostMdata ({
            "cmd": "api/marketAll",
            "body": {},
        });
        let markets = response['result'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let base = market['coin_symbol'];
            let quote = market['currency_symbol'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let id = base + '_' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': undefined,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'timestamp', this.seconds ());
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = ticker['coin_symbol'] + '/' + ticker['currency_symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'ask': this.safeFloat (ticker, 'sell'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': this.safeString (ticker, 'percent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicPostMdata ({
            "cmd": "api/ticker",
            "body": this.extend ({
                "pair": market['id']
            }, params)
        });
        return this.parseTicker (response['result'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicPostMdata ({
            "cmd": "api/marketAll",
            "body": {}
        });
        let tickers = response["result"];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            if (symbols && (!(symbol in symbols))) {
                continue;
            }
            result[symbol] = ticker;
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['time'];
        let side = undefined;
        if (trade['side'] == '1') {
            side = 'buy';
        } else if (trade['side'] == '2') {
            side = 'sell';
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': "limit",
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.publicPostMdata ({
            "cmd": "api/deals",
            "body": this.extend ({
                "pair": market['id'],
                "size": size,
            }, params)
        });
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicPostMdata ({
            "cmd": "api/depth",
            "body": this.extend ({
                'pair': market['id'],
            }, params)
        });
        return this.parseOrderBook (response['result'], undefined, 'BUY', 'SELL');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 1000;
        let response = await this.publicGetKlines ({
            "cmd": "api/kline",
            "body": this.extend ({
                "pair": market['id'],
                "period": this.timeframes[timeframe],
                "size": size,
            }, params)
        });
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        let response = await this.privatePostTransfer ({
            "cmd": "transfer/coinList",
            "body": {}
        });
        let currencies = response['result'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            let code = this.commonCurrencyCode (id);
            let precision = 8;
            let deposit = currency['enable_deposit'];
            let withdraw = currency['enable_withdraw'];
            let active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTransfer ({
            "cmd": "transfer/assets",
            "body": this.extend ({
                "select": 1,
            }, params)
        });
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = undefined;
        if ('assets_list' in balances) {
            indexed = this.indexBy (balances['assets_list'], 'coin_symbol');
        } else {
            indexed = [];
        }
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let used = parseFloat (balance['freeze']);
            let free = parseFloat (balance['balance']);
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrder ({
            "cmd": "orderpending/trade",
            "body": this.extend ({
                "pair": market['id'],
                "account_type": 0,
                "order_type": type === 'limit' ? 2 : 1,
                "order_side": side,
                "pay_bix": 0,
                "amount": amount,
                "price": price,
            }, params)
        });
        return {
            'info': response,
            'id': this.safeString (response, 'result'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostCancelOrder ({
            "cmd": "orderpending/cancelTrade",
            "body": this.extend ({
                "orders_id": id
            }, params)
        });
        return response;
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            symbol = order['coin_symbol'] + '/' + order['currency_symbol'];
        }
        let type = undefined;
        if (order['order_type'] === 1) {
            type = 'market';
        } else if (order['order_type'] === 2) {
            type = 'limit';
        }
        let timestamp = order['createdAt'];
        let price = order['price'];
        let filled = order['amount'];
        let amount = this.safeInteger (order, 'deal_amount');
        let remaining = amount - filled;
        let side = undefined;
        if (order['order_side'] === 1) {
            type = 'bid';
        } else if (order['order_side'] === 2) {
            type = 'ask';
        }
        let status = undefined;
        if ('status' in order) {
            status = this.parseOrderStatus (order['status']);
        }
        let result = {
            'info': order,
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * filled,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': this.safeFloat (order, 'fee'),
        };
        return result;
    }

    parseOrderStatus (status) {
        if (status == '1')
            return 'pending';  // pending
        if (status == '2')
            return 'open';     // part completed
        if (status == '3')
            return 'closed';   // completed
        if (status == '4')
            return 'canceled'; // part canceled
        if (status == '5')
            return 'canceled'; // canceled
        if (status == '6')
            return 'canceled'; // canceling
        return status.toLowerCase ();
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            "cmd": "orderpending/orderPendingList",
            "body": this.extend ({
                "pair": market['id'],
                "account_type": 0, // 0 - regular, 1 - margin
                "page": 1,
                "size": size,
            }, params)
        });
        let orders = response['items'] || {};
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            "cmd": "orderpending/orderHistoryList",
            "body": this.extend ({
                "pair": market['id'],
                "account_type": 0, // 0 - regular, 1 - margin
                "page": 1,
                "size": size,
            }, params)
        });
        let orders = response['items'] || {};
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchDepositAddress (currency, params = {}) {
        await this.loadMarkets ();
        let market = this.market (currency);
        let response = await this.privatePostTransfer ({
            "cmd": "transfer/transferOutInfo",
            "body": this.extend ({
                "coin_symbol": market['id']
            }, params)
        });
        let result = {
            'info': response,
            'address': undefined
        };
        return result;
    }

    async withdraw (code, amount, address, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostTransfer ({
            "cmd": "transfer/transferOut",
            "body": this.extend ({
                "coin_symbol": currency,
                "amount": amount,
                "addr": address,
                "addr_remark": '',
            }, params)
        });
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let cmds = this.json ([params]);
        if (api === 'public') {
            body = {
                "cmds": cmds,
            };
        } else {
            body = {
                "cmds": cmds,
                "apikey": this.apiKey,
                "sign": this.hmac (this.encode (cmds), this.encode (this.secret), 'md5'),
            };
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': this.json (body), 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            if ('code' in response['error'])
                if (response['error']['code'] === '3012')
                    throw new AuthenticationError (this.id + ' ' + this.json (response)); // invalid api key
                else if (response['error']['code'] === '3025')
                    throw new AuthenticationError (this.id + ' ' + this.json (response)); // signature failed
                else if (response['error']['code'] === '4003')
                    throw new DDoSProtection (this.id + ' ' + this.json (response)); // server is busy, try atain later
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        if (!('result' in response))
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response['result'][0];
    }
}
