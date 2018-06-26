'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class deribit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': 'NL', // Netherlands
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchTicker': false,
                'fetchTickers': false,
            },
            'timeframes': {},
            'urls': {
                // 'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/629338/35326678-d005069c-0110-11e8-8a4c-8c8e201da2a2.png',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://www.deribit.com/pages/docs/api',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'test',
                        'getinstruments',
                        'index',
                        'getcurrencies',
                        'getorderbook',
                        'getlasttrades',
                        'getsummary',
                        'stats',
                        'getannouncments',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'getopenorders',
                        'positions',
                        'orderhistory',
                        'orderstate',
                        'tradehistory',
                        'newannouncements',
                    ],
                    'post': [
                        'buy',
                        'sell',
                        'edit',
                        'cancel',
                        'cancelall',
                    ],
                },
            },
            'exceptions': {
                'Invalid API Key.': AuthenticationError,
                'Access Denied': PermissionDenied,
            },
            'options': {
                'fetchTickerQuotes': true,
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/' + 'api/' + this.version + '/' + api + '/' + path;
        let url = this.urls['api'] + query;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = '_=' + nonce + '&_ackey=' + this.apiKey + '&_acsec=' + this.secret + '&_action=' + query;
            if (method === 'POST') {
                params = this.keysort (params);
                auth += '&' + this.urlencode (params);
            }
            let hash = this.hash (this.encode (auth), 'sha256', 'base64');
            let signature = this.apiKey + '.' + nonce + '.' + hash;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-deribit-sig': signature,
            };
            body = this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets () {
        let marketsResponse = await this.publicGetGetinstruments ();
        let markets = marketsResponse['result'];
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['instrumentName'];
            let base = market['baseCurrency'];
            let quote = market['currency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let marketEntry = {
                'id': id,
                'symbol': id,
                'base': base,
                'quote': quote,
                'active': market['isActive'],
                'precision': {
                    'amount': market['minTradeSize'],
                    'price': market['tickSize'],
                },
                'limits': {
                    'amount': {
                        'min': market['minTradeSize'],
                    },
                    'price': {
                        'min': market['tickSize'],
                    },
                },
                'type': market['kind'],
                'spot': false,
                'future': market['kind'] === 'future',
                'option': market['kind'] === 'option',
                'info': market,
            };
            if (marketEntry['option']) {
                marketEntry = this.extend (marketEntry, {
                    'optionCall': market['optionType'] === 'call',
                    'optionPut': market['optionType'] === 'put',
                    'optionStrike': market['strike'],
                });
            }
            result.push (marketEntry);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        let account = await this.privateGetAccount ();
        let result = {
            'BTC': {
                'free': account['result']['availableFunds'],
                'used': account['result']['maintenanceMargin'],
                'total': account['result']['equity'],
            },
        };
        return this.parseBalance (result);
    }

    async fetchDepositAddress (currency, params = {}) {
        let account = await this.privateGetAccount ();
        return {
            'currency': 'BTC',
            'address': account['depositAddress'],
            'status': 'ok',
            'info': account,
        };
    }

    parseTrade (trade, market) {
        return {
            'info': trade,
            'timestamp': trade['timeStamp'],
            'datetime': this.iso8601 (trade['timeStamp']),
            'symbol': market['symbol'],
            'id': trade['tradeId'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['direction'],
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['limit'] = limit;
        } else {
            request['limit'] = 10000;
        }
        let response = await this.publicGetGetlasttrades (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetorderbook ({ 'instrument': market['id'] });
        let timestamp = response['usOut'] / 1000000;
        let orderbook = this.parseOrderBook (response['result'], timestamp, 'bids', 'asks', 'price', 'quantity');
        return this.extend (orderbook, {
            'nonce': this.safeInteger (response, 'tstamp'),
        });
    }

    parseOrder (order) {
        return {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': order['created'],
            'datetime': this.iso8601 (order['created']),
            'lastTradeTimestamp': undefined,
            'symbol': order['instrument'],
            'type': undefined,
            'side': order['direction'].toLowerCase (),
            'price': order['price'],
            'amount': order['quantity'],
            'cost': order['commission'],
            'filled': order['filledQuantity'],
            'remaining': order['quantity'] - order['filledQuantity'],
            'status': order['state'],
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateGetOrderstate ({ 'orderId': id });
        return this.parseOrder (response['result']);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.privateGetTradeHistory ({ 'instrument': symbol });
        return this.parseTrades (response['result']);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'instrument': this.marketId (symbol),
            'quantity': amount,
            'type': type,
        };
        if (typeof price !== 'undefined')
            request['price'] = price;
        let handler = (side === 'buy') ? this.privatePostBuy : this.privatePostSell;
        let response = await handler (this.extend (request, params));
        let order = this.parseOrder (response['result']);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response['result'] }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderId': id,
        };
        if (typeof amount !== 'undefined')
            request['quantity'] = amount;
        if (typeof price !== 'undefined')
            request['price'] = price;
        let response = await this.privatePostEdit (this.extend (request, params));
        let order = this.parseOrder (response['result']);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response['result'] }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostCancel (this.extend ({ 'orderId': id }, params));
        let order = this.parseOrder (response['result']);
        return this.extend ({ 'info': response['result'] }, order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        params['instrument'] = this.marketId (symbol);
        let response = await this.privateGetGetopenorders (params);
        return this.parseOrders (response['result']);
    }
};
