'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitbay extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbay',
            'name': 'BitBay',
            'countries': [ 'MT', 'EU' ], // Malta
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www': 'https://bitbay.net',
                'api': {
                    'public': 'https://bitbay.net/API/Public',
                    'private': 'https://bitbay.net/API/Trading/tradingApi.php',
                },
                'doc': [
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                ],
                'fees': 'https://bitbay.net/en/fees',
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'BTC', 'quoteId': 'USD' },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'BTC', 'quoteId': 'EUR' },
                'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN', 'baseId': 'BTC', 'quoteId': 'PLN' },
                'LTC/USD': { 'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'LTC', 'quoteId': 'USD' },
                'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR', 'baseId': 'LTC', 'quoteId': 'EUR' },
                'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN', 'baseId': 'LTC', 'quoteId': 'PLN' },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'LTC', 'quoteId': 'BTC' },
                'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD' },
                'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR', 'baseId': 'ETH', 'quoteId': 'EUR' },
                'ETH/PLN': { 'id': 'ETHPLN', 'symbol': 'ETH/PLN', 'base': 'ETH', 'quote': 'PLN', 'baseId': 'ETH', 'quoteId': 'PLN' },
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'ETH', 'quoteId': 'BTC' },
                'LSK/USD': { 'id': 'LSKUSD', 'symbol': 'LSK/USD', 'base': 'LSK', 'quote': 'USD', 'baseId': 'LSK', 'quoteId': 'USD' },
                'LSK/EUR': { 'id': 'LSKEUR', 'symbol': 'LSK/EUR', 'base': 'LSK', 'quote': 'EUR', 'baseId': 'LSK', 'quoteId': 'EUR' },
                'LSK/PLN': { 'id': 'LSKPLN', 'symbol': 'LSK/PLN', 'base': 'LSK', 'quote': 'PLN', 'baseId': 'LSK', 'quoteId': 'PLN' },
                'LSK/BTC': { 'id': 'LSKBTC', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC', 'baseId': 'LSK', 'quoteId': 'BTC' },
                'BCH/USD': { 'id': 'BCCUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'baseId': 'BCC', 'quoteId': 'USD' },
                'BCH/EUR': { 'id': 'BCCEUR', 'symbol': 'BCH/EUR', 'base': 'BCH', 'quote': 'EUR', 'baseId': 'BCC', 'quoteId': 'EUR' },
                'BCH/PLN': { 'id': 'BCCPLN', 'symbol': 'BCH/PLN', 'base': 'BCH', 'quote': 'PLN', 'baseId': 'BCC', 'quoteId': 'PLN' },
                'BCH/BTC': { 'id': 'BCCBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'BCC', 'quoteId': 'BTC' },
                'BTG/USD': { 'id': 'BTGUSD', 'symbol': 'BTG/USD', 'base': 'BTG', 'quote': 'USD', 'baseId': 'BTG', 'quoteId': 'USD' },
                'BTG/EUR': { 'id': 'BTGEUR', 'symbol': 'BTG/EUR', 'base': 'BTG', 'quote': 'EUR', 'baseId': 'BTG', 'quoteId': 'EUR' },
                'BTG/PLN': { 'id': 'BTGPLN', 'symbol': 'BTG/PLN', 'base': 'BTG', 'quote': 'PLN', 'baseId': 'BTG', 'quoteId': 'PLN' },
                'BTG/BTC': { 'id': 'BTGBTC', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC', 'baseId': 'BTG', 'quoteId': 'BTC' },
                'DASH/USD': { 'id': 'DASHUSD', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USD', 'baseId': 'DASH', 'quoteId': 'USD' },
                'DASH/EUR': { 'id': 'DASHEUR', 'symbol': 'DASH/EUR', 'base': 'DASH', 'quote': 'EUR', 'baseId': 'DASH', 'quoteId': 'EUR' },
                'DASH/PLN': { 'id': 'DASHPLN', 'symbol': 'DASH/PLN', 'base': 'DASH', 'quote': 'PLN', 'baseId': 'DASH', 'quoteId': 'PLN' },
                'DASH/BTC': { 'id': 'DASHBTC', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'DASH', 'quoteId': 'BTC' },
                'GAME/USD': { 'id': 'GAMEUSD', 'symbol': 'GAME/USD', 'base': 'GAME', 'quote': 'USD', 'baseId': 'GAME', 'quoteId': 'USD' },
                'GAME/EUR': { 'id': 'GAMEEUR', 'symbol': 'GAME/EUR', 'base': 'GAME', 'quote': 'EUR', 'baseId': 'GAME', 'quoteId': 'EUR' },
                'GAME/PLN': { 'id': 'GAMEPLN', 'symbol': 'GAME/PLN', 'base': 'GAME', 'quote': 'PLN', 'baseId': 'GAME', 'quoteId': 'PLN' },
                'GAME/BTC': { 'id': 'GAMEBTC', 'symbol': 'GAME/BTC', 'base': 'GAME', 'quote': 'BTC', 'baseId': 'GAME', 'quoteId': 'BTC' },
                'XRP/USD': { 'id': 'XRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'XRP', 'quoteId': 'USD' },
                'XRP/EUR': { 'id': 'XRPEUR', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR', 'baseId': 'XRP', 'quoteId': 'EUR' },
                'XRP/PLN': { 'id': 'XRPPLN', 'symbol': 'XRP/PLN', 'base': 'XRP', 'quote': 'PLN', 'baseId': 'XRP', 'quoteId': 'PLN' },
                'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'XRP', 'quoteId': 'BTC' },
                // 'XIN/USD': { 'id': 'XINUSD', 'symbol': 'XIN/USD', 'base': 'XIN', 'quote': 'USD', 'baseId': 'XIN', 'quoteId': 'USD' },
                // 'XIN/EUR': { 'id': 'XINEUR', 'symbol': 'XIN/EUR', 'base': 'XIN', 'quote': 'EUR', 'baseId': 'XIN', 'quoteId': 'EUR' },
                // 'XIN/PLN': { 'id': 'XINPLN', 'symbol': 'XIN/PLN', 'base': 'XIN', 'quote': 'PLN', 'baseId': 'XIN', 'quoteId': 'PLN' },
                'XIN/BTC': { 'id': 'XINBTC', 'symbol': 'XIN/BTC', 'base': 'XIN', 'quote': 'BTC', 'baseId': 'XIN', 'quoteId': 'BTC' },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.0043,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0009,
                        'LTC': 0.005,
                        'ETH': 0.00126,
                        'LSK': 0.2,
                        'BCH': 0.0006,
                        'GAME': 0.005,
                        'DASH': 0.001,
                        'BTG': 0.0008,
                        'PLN': 4,
                        'EUR': 1.5,
                    },
                },
            },
            'exceptions': {
                '400': ExchangeError, // At least one parameter wasn't set
                '401': InvalidOrder, // Invalid order type
                '402': InvalidOrder, // No orders with specified currencies
                '403': InvalidOrder, // Invalid payment currency name
                '404': InvalidOrder, // Error. Wrong transaction type
                '405': InvalidOrder, // Order with this id doesn't exist
                '406': InsufficientFunds, // No enough money or crypto
                // code 407 not specified are not specified in their docs
                '408': InvalidOrder, // Invalid currency name
                '501': AuthenticationError, // Invalid public key
                '502': AuthenticationError, // Invalid sign
                '503': InvalidNonce, // Invalid moment parameter. Request time doesn't match current server time
                '504': ExchangeError, // Invalid method
                '505': AuthenticationError, // Key has no permission for this action
                '506': AuthenticationError, // Account locked. Please contact with customer service
                // codes 507 and 508 are not specified in their docs
                '509': ExchangeError, // The BIC/SWIFT is required for this currency
                '510': ExchangeError, // Invalid market name
            },
        });
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostInfo ();
        if ('balances' in response) {
            let balance = response['balances'];
            let result = { 'info': balance };
            let codes = Object.keys (this.currencies);
            for (let i = 0; i < codes.length; i++) {
                let code = codes[i];
                let currency = this.currencies[code];
                let id = currency['id'];
                let account = this.account ();
                if (id in balance) {
                    account['free'] = parseFloat (balance[id]['available']);
                    account['used'] = parseFloat (balance[id]['locked']);
                    account['total'] = this.sum (account['free'], account['used']);
                }
                result[code] = account;
            }
            return this.parseBalance (result);
        }
        throw new ExchangeError (this.id + ' empty balance response ' + this.json (response));
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderbook = await this.publicGetIdOrderbook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let ticker = await this.publicGetIdTicker (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = this.milliseconds ();
        let baseVolume = this.safeFloat (ticker, 'volume');
        let vwap = this.safeFloat (ticker, 'vwap');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined)
            quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'average'),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        let market = this.market (symbol);
        return this.privatePostTrade (this.extend ({
            'type': side,
            'currency': market['baseId'],
            'amount': amount,
            'payment_currency': market['quoteId'],
            'rate': price,
        }, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    }

    isFiat (currency) {
        let fiatCurrencies = {
            'USD': true,
            'EUR': true,
            'PLN': true,
        };
        if (currency in fiatCurrencies)
            return true;
        return false;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let method = undefined;
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'quantity': amount,
        };
        if (this.isFiat (code)) {
            method = 'privatePostWithdraw';
            // request['account'] = params['account']; // they demand an account number
            // request['express'] = params['express']; // whatever it means, they don't explain
            // request['bic'] = '';
        } else {
            method = 'privatePostTransfer';
            if (tag !== undefined)
                address += '?dt=' + tag.toString ();
            request['address'] = address;
        }
        let response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            let query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params) + '.json';
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return;
        if ((body[0] === '{') || (body[0] === '[')) {
            if ('code' in response) {
                //
                // bitbay returns the integer 'success': 1 key from their private API
                // or an integer 'code' value from 0 to 510 and an error message
                //
                //      { 'success': 1, ... }
                //      { 'code': 502, 'message': 'Invalid sign' }
                //      { 'code': 0, 'message': 'offer funds not exceeding minimums' }
                //
                //      400 At least one parameter wasn't set
                //      401 Invalid order type
                //      402 No orders with specified currencies
                //      403 Invalid payment currency name
                //      404 Error. Wrong transaction type
                //      405 Order with this id doesn't exist
                //      406 No enough money or crypto
                //      408 Invalid currency name
                //      501 Invalid public key
                //      502 Invalid sign
                //      503 Invalid moment parameter. Request time doesn't match current server time
                //      504 Invalid method
                //      505 Key has no permission for this action
                //      506 Account locked. Please contact with customer service
                //      509 The BIC/SWIFT is required for this currency
                //      510 Invalid market name
                //
                let code = response['code']; // always an integer
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions;
                if (code in this.exceptions) {
                    throw new exceptions[code] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
