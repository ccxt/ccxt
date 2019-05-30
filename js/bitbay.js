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
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www': 'https://bitbay.net',
                'api': {
                    'public': 'https://bitbay.net/API/Public',
                    'private': 'https://bitbay.net/API/Trading/tradingApi.php',
                    'v1_01Public': 'https://api.bitbay.net/rest',
                    'v1_01Private': 'https://api.bitbay.net/rest',
                },
                'doc': [
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/en/private-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                    'https://docs.bitbay.net/v1.0.1-en/reference',
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
                'v1_01Public': {
                    'get': [
                        'trading/ticker',
                        'trading/ticker/{symbol}',
                        'trading/stats',
                        'trading/orderbook/{symbol}',
                        'trading/transactions/{symbol}',
                        'trading/candle/history/{symbol}/{resolution}',
                    ],
                },
                'v1_01Private': {
                    'get': [
                        'payments/withdrawal/{detailId}',
                        'payments/deposit/{detailId}',
                        'trading/offer',
                        'trading/config/{symbol}',
                        'trading/history/transactions',
                        'balances/BITBAY/history',
                        'balances/BITBAY/balance',
                        'fiat_cantor/rate/{baseId}/{quoteId}',
                        'fiat_cantor/history',
                    ],
                    'post': [
                        'trading/offer/{symbol}',
                        'trading/config/{symbol}',
                        'balances/BITBAY/balance',
                        'balances/BITBAY/balance/transfer/{source}/{destination}',
                        'fiat_cantor/exchange',
                    ],
                    'delete': [
                        'trading/offer/{symbol}/{id}/{side}/{price}',
                    ],
                    'put': [
                        'balances/BITBAY/balance/{id}',
                    ],
                },
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

    async fetchMarkets (params = {}) {
        //   { status: 'Ok',
        //     items:
        //     { 'BSV-USD':
        //      { market:
        //        { code: 'BSV-USD',
        //          first: { currency: 'BSV', minOffer: '0.00035', scale: 8 },
        //          second: { currency: 'USD', minOffer: '5', scale: 2 } },
        //       time: '1557569762154',
        //           highestBid: '52.31',
        //       lowestAsk: '62.99',
        //       rate: '63',
        //       previousRate: '51.21' },
        //      ...
        const response = await this.v1_01PublicGetTradingTicker ({});
        if (response['status'] !== 'Ok')
            throw new ExchangeError (this.id + ' tickers query failed ' + this.json (response));
        const result = [];
        const symbols = Object.keys (response['items']);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const item = response['items'][symbol];
            const nativeMarket = item['market'];
            const baseId = this.safeString (nativeMarket['first'], 'currency');
            const quoteId = this.safeString (nativeMarket['second'], 'currency');
            const id = baseId + quoteId;
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const precision = this.safeInteger (nativeMarket['second'], 'scale');
            // todo: check that the limits have ben interpreted correctly
            // todo: parse the fees page
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'active': undefined,
                'fee': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (nativeMarket['first'], 'minOffer'),
                    },
                    'cost': {
                        'min': this.safeFloat (nativeMarket['second'], 'minOffer'),
                    },
                },
                'info': item,
            });
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.extend ({
            'markets': symbol ? [this.marketId (symbol)] : [],
        }, params);
        const response = await this.v1_01PrivateGetTradingHistoryTransactions ({ 'query': this.json (request) });
        if (response['status'] !== 'Ok')
            throw new ExchangeError (this.id + ' balances query failed ' + this.json (response));
        //   { status: 'Ok',
        //     totalRows: '67',
        //     items:
        //     [ { id: 'b54659a0-51b5-42a0-80eb-2ac5357ccee2',
        //         market: 'BTC-EUR',
        //         time: '1541697096247',
        //         amount: '0.00003',
        //         rate: '4341.44',
        //         initializedBy: 'Sell',
        //         wasTaker: false,
        //         userAction: 'Buy',
        //         offerId: 'bd19804a-6f89-4a69-adb8-eb078900d006',
        //         commissionValue: null }, ...
        const items = response['items'];
        const result = this.parseTrades (items, undefined, since, limit);
        if (symbol === undefined)
            return result;
        return this.filterBySymbol (result, symbol);
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
        if ('tid' in trade) {
            return this.parsePublicTrade (trade, market);
        } else {
            return this.parseMyTrade (trade, market);
        }
    }

    parseMyTrade (trade, market) {
        //   { id: '5b6780e2-5bac-4ac7-88f4-b49b5957d33a',
        //     market: 'BTC-EUR',
        //     time: '1520719374684',
        //     amount: '0.3',
        //     rate: '7502',
        //     initializedBy: 'Sell',
        //     wasTaker: true,
        //     userAction: 'Sell',
        //     offerId: 'd093b0aa-b9c9-4a52-b3e2-673443a6188b',
        //     commissionValue: null },
        const timestamp = this.safeInteger (trade, 'time');
        const userAction = this.safeString (trade, 'userAction');
        const takerOrMaker = this.safeString (trade, 'wasTaker') === 'true' ? 'taker' : 'maker';
        const price = this.safeFloat (trade, 'rate');
        const amount = this.safeFloat (trade, 'amount');
        const commissionValue = this.safeFloat (trade, 'commissionValue');
        let fee = undefined;
        if (commissionValue !== undefined) {
            // it always seems to be null so don't know what currency to use
            fee = {
                'currency': undefined,
                'cost': commissionValue,
            };
        }
        const marketId = this.safeString (trade, 'market');
        const order = this.safeString (trade, 'offerId');
        // todo: check this logic
        const type = order ? 'limit' : 'market';
        return {
            'id': this.safeString (trade, 'id'),
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.findSymbol (marketId.replace ('-', '')),
            'type': type,
            'side': userAction === 'Buy' ? 'buy' : 'sell',
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        };
    }

    parsePublicTrade (trade, market) {
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
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params) + '.json';
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            const nonce = this.now ();
            let payload = this.apiKey + nonce;
            if (body !== undefined) {
                body = this.json (body);
            }
            headers = {
                'Request-Timestamp': nonce,
                'Operation-Id': this.uuid (),
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (payload), this.encode (this.secret), 'sha512'),
                'Content-Type': 'application/json',
            };
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
