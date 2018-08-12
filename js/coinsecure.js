'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinsecure extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsecure',
            'name': 'Coinsecure',
            'countries': [ 'IN' ], // India
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg',
                'api': 'https://api.coinsecure.in',
                'www': 'https://coinsecure.in',
                'doc': [
                    'https://api.coinsecure.in',
                    'https://github.com/coinsecure/plugins',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'bitcoin/search/confirmation/{txid}',
                        'exchange/ask/low',
                        'exchange/ask/orders',
                        'exchange/bid/high',
                        'exchange/bid/orders',
                        'exchange/lastTrade',
                        'exchange/max24Hr',
                        'exchange/min24Hr',
                        'exchange/ticker',
                        'exchange/trades',
                    ],
                },
                'private': {
                    'get': [
                        'mfa/authy/call',
                        'mfa/authy/sms',
                        'netki/search/{netkiName}',
                        'user/bank/otp/{number}',
                        'user/kyc/otp/{number}',
                        'user/profile/phone/otp/{number}',
                        'user/wallet/coin/address/{id}',
                        'user/wallet/coin/deposit/confirmed/all',
                        'user/wallet/coin/deposit/confirmed/{id}',
                        'user/wallet/coin/deposit/unconfirmed/all',
                        'user/wallet/coin/deposit/unconfirmed/{id}',
                        'user/wallet/coin/wallets',
                        'user/exchange/bank/fiat/accounts',
                        'user/exchange/bank/fiat/balance/available',
                        'user/exchange/bank/fiat/balance/pending',
                        'user/exchange/bank/fiat/balance/total',
                        'user/exchange/bank/fiat/deposit/cancelled',
                        'user/exchange/bank/fiat/deposit/unverified',
                        'user/exchange/bank/fiat/deposit/verified',
                        'user/exchange/bank/fiat/withdraw/cancelled',
                        'user/exchange/bank/fiat/withdraw/completed',
                        'user/exchange/bank/fiat/withdraw/unverified',
                        'user/exchange/bank/fiat/withdraw/verified',
                        'user/exchange/ask/cancelled',
                        'user/exchange/ask/completed',
                        'user/exchange/ask/pending',
                        'user/exchange/bid/cancelled',
                        'user/exchange/bid/completed',
                        'user/exchange/bid/pending',
                        'user/exchange/bank/coin/addresses',
                        'user/exchange/bank/coin/balance/available',
                        'user/exchange/bank/coin/balance/pending',
                        'user/exchange/bank/coin/balance/total',
                        'user/exchange/bank/coin/deposit/cancelled',
                        'user/exchange/bank/coin/deposit/unverified',
                        'user/exchange/bank/coin/deposit/verified',
                        'user/exchange/bank/coin/withdraw/cancelled',
                        'user/exchange/bank/coin/withdraw/completed',
                        'user/exchange/bank/coin/withdraw/unverified',
                        'user/exchange/bank/coin/withdraw/verified',
                        'user/exchange/bank/summary',
                        'user/exchange/coin/fee',
                        'user/exchange/fiat/fee',
                        'user/exchange/kycs',
                        'user/exchange/referral/coin/paid',
                        'user/exchange/referral/coin/successful',
                        'user/exchange/referral/fiat/paid',
                        'user/exchange/referrals',
                        'user/exchange/trade/summary',
                        'user/login/token/{token}',
                        'user/summary',
                        'user/wallet/summary',
                        'wallet/coin/withdraw/cancelled',
                        'wallet/coin/withdraw/completed',
                        'wallet/coin/withdraw/unverified',
                        'wallet/coin/withdraw/verified',
                    ],
                    'post': [
                        'login',
                        'login/initiate',
                        'login/password/forgot',
                        'mfa/authy/initiate',
                        'mfa/ga/initiate',
                        'signup',
                        'user/netki/update',
                        'user/profile/image/update',
                        'user/exchange/bank/coin/withdraw/initiate',
                        'user/exchange/bank/coin/withdraw/newVerifycode',
                        'user/exchange/bank/fiat/withdraw/initiate',
                        'user/exchange/bank/fiat/withdraw/newVerifycode',
                        'user/password/change',
                        'user/password/reset',
                        'user/wallet/coin/withdraw/initiate',
                        'wallet/coin/withdraw/newVerifycode',
                    ],
                    'put': [
                        'signup/verify/{token}',
                        'user/exchange/kyc',
                        'user/exchange/bank/fiat/deposit/new',
                        'user/exchange/ask/new',
                        'user/exchange/bid/new',
                        'user/exchange/instant/buy',
                        'user/exchange/instant/sell',
                        'user/exchange/bank/coin/withdraw/verify',
                        'user/exchange/bank/fiat/account/new',
                        'user/exchange/bank/fiat/withdraw/verify',
                        'user/mfa/authy/initiate/enable',
                        'user/mfa/ga/initiate/enable',
                        'user/netki/create',
                        'user/profile/phone/new',
                        'user/wallet/coin/address/new',
                        'user/wallet/coin/new',
                        'user/wallet/coin/withdraw/sendToExchange',
                        'user/wallet/coin/withdraw/verify',
                    ],
                    'delete': [
                        'user/gcm/{code}',
                        'user/logout',
                        'user/exchange/bank/coin/withdraw/unverified/cancel/{withdrawID}',
                        'user/exchange/bank/fiat/deposit/cancel/{depositID}',
                        'user/exchange/ask/cancel/{orderID}',
                        'user/exchange/bid/cancel/{orderID}',
                        'user/exchange/bank/fiat/withdraw/unverified/cancel/{withdrawID}',
                        'user/mfa/authy/disable/{code}',
                        'user/mfa/ga/disable/{code}',
                        'user/profile/phone/delete',
                        'user/profile/image/delete/{netkiName}',
                        'user/wallet/coin/withdraw/unverified/cancel/{withdrawID}',
                    ],
                },
            },
            'markets': {
                'BTC/INR': { 'id': 'BTC/INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
            },
            'fees': {
                'trading': {
                    'maker': 0.4 / 100,
                    'taker': 0.4 / 100,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserExchangeBankSummary ();
        let balance = response['message'];
        let coin = {
            'free': balance['availableCoinBalance'],
            'used': balance['pendingCoinBalance'],
            'total': balance['totalCoinBalance'],
        };
        let fiat = {
            'free': balance['availableFiatBalance'],
            'used': balance['pendingFiatBalance'],
            'total': balance['totalFiatBalance'],
        };
        let result = {
            'info': balance,
            'BTC': coin,
            'INR': fiat,
        };
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let bids = await this.publicGetExchangeBidOrders (params);
        let asks = await this.publicGetExchangeAskOrders (params);
        let orderbook = {
            'bids': bids['message'],
            'asks': asks['message'],
        };
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'rate', 'vol');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetExchangeTicker (params);
        let ticker = response['message'];
        let timestamp = ticker['timestamp'];
        let baseVolume = this.safeFloat (ticker, 'coinvolume');
        if (symbol === 'BTC/INR') {
            let satoshi = 0.00000001;
            baseVolume = baseVolume * satoshi;
        }
        let quoteVolume = this.safeFloat (ticker, 'fiatvolume') / 100;
        let vwap = quoteVolume / baseVolume;
        let last = this.safeFloat (ticker, 'lastPrice') / 100;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high') / 100,
            'low': this.safeFloat (ticker, 'low') / 100,
            'bid': this.safeFloat (ticker, 'bid') / 100,
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask') / 100,
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open') / 100,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, symbol = undefined) {
        let timestamp = trade['time'];
        let side = (trade['ordType'] === 'bid') ? 'buy' : 'sell';
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'rate') / 100,
            'amount': this.safeFloat (trade, 'vol') / 100000000,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let result = await this.publicGetExchangeTrades (params);
        if ('message' in result) {
            let trades = result['message'];
            return this.parseTrades (trades, market);
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePutUserExchange';
        let order = {};
        if (type === 'market') {
            method += 'Instant' + this.capitalize (side);
            if (side === 'buy')
                order['maxFiat'] = amount;
            else
                order['maxVol'] = amount;
        } else {
            let direction = (side === 'buy') ? 'Bid' : 'Ask';
            method += direction + 'New';
            order['rate'] = price;
            order['vol'] = amount;
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['message']['orderID'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // let method = 'privateDeleteUserExchangeAskCancelOrderId'; // TODO fixme, have to specify order side here
        // return await this[method] ({ 'orderID': id });
        throw new NotSupported (this.id + ' cancelOrder () is not fully implemented yet');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = { 'Authorization': this.apiKey };
            if (Object.keys (query).length) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code === 200) {
            if ((body[0] === '{') || (body[0] === '[')) {
                let response = JSON.parse (body);
                if ('success' in response) {
                    let success = response['success'];
                    if (!success) {
                        throw new ExchangeError (this.id + ' error returned: ' + body);
                    }
                    if (!('message' in response)) {
                        throw new ExchangeError (this.id + ' malformed response: no "message" in response: ' + body);
                    }
                } else {
                    throw new ExchangeError (this.id + ' malformed response: no "success" in response: ' + body);
                }
            } else {
                // if not a JSON response
                throw new ExchangeError (this.id + ' returned a non-JSON reply: ' + body);
            }
        }
    }
};
