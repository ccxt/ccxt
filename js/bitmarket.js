'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitmarket extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmarket',
            'name': 'BitMarket',
            'countries': [ 'PL', 'EU' ],
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'withdraw': true,
                'fetchWithdrawals': true,
                'fetchDeposits': false,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '90m': '90m',
                '6h': '6h',
                '1d': '1d',
                '1w': '7d',
                '1M': '1m',
                '3M': '3m',
                '6M': '6m',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api': {
                    'public': 'https://www.bitmarket.net',
                    'private': 'https://www.bitmarket.pl/api2/', // last slash is critical
                },
                'www': [
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ],
                'doc': [
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ],
                'referral': 'https://www.bitmarket.net/?ref=23323',
            },
            'api': {
                'public': {
                    'get': [
                        'json_internal/all/ticker',
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ],
                },
            },
            'commonCurrencies': {
                'BCC': 'BCH',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.45 / 100,
                    'maker': 0.15 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.45 / 100],
                            [99.99, 0.44 / 100],
                            [299.99, 0.43 / 100],
                            [499.99, 0.42 / 100],
                            [999.99, 0.41 / 100],
                            [1999.99, 0.40 / 100],
                            [2999.99, 0.39 / 100],
                            [4999.99, 0.38 / 100],
                            [9999.99, 0.37 / 100],
                            [19999.99, 0.36 / 100],
                            [29999.99, 0.35 / 100],
                            [49999.99, 0.34 / 100],
                            [99999.99, 0.33 / 100],
                            [199999.99, 0.32 / 100],
                            [299999.99, 0.31 / 100],
                            [499999.99, 0.0 / 100],
                        ],
                        'maker': [
                            [0, 0.15 / 100],
                            [99.99, 0.14 / 100],
                            [299.99, 0.13 / 100],
                            [499.99, 0.12 / 100],
                            [999.99, 0.11 / 100],
                            [1999.99, 0.10 / 100],
                            [2999.99, 0.9 / 100],
                            [4999.99, 0.8 / 100],
                            [9999.99, 0.7 / 100],
                            [19999.99, 0.6 / 100],
                            [29999.99, 0.5 / 100],
                            [49999.99, 0.4 / 100],
                            [99999.99, 0.3 / 100],
                            [199999.99, 0.2 / 100],
                            [299999.99, 0.1 / 100],
                            [499999.99, 0.0 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.0008,
                        'LTC': 0.005,
                        'BCH': 0.0008,
                        'BTG': 0.0008,
                        'DOGE': 1,
                        'EUR': 2,
                        'PLN': 2,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'BCH': 0,
                        'BTG': 0,
                        'DOGE': 25,
                        'EUR': 2, // SEPA. Transfer INT (SHA): 5 EUR
                        'PLN': 0,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    '501': AuthenticationError, // {"error":501,"errorMsg":"Invalid API key","time":1560869976}
                },
                'broad': {
                },
            },
            'options': {
                'fetchMarketsWarning': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetJsonInternalAllTicker (this.extend ({}, params));
        const ids = Object.keys (response);
        const result = [];
        const maxIdLength = 6;
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const item = response[id];
            if (id.length > 6) {
                if (this.options['fetchMarketsWarning']) {
                    throw new NotSupported (this.id + ' fetchMarkets encountered a market id `' + id + '` (length > ' + maxIdLength + ". Set exchange.options['fetchMarketsWarning'] = false to suppress this warning and skip this market."); // eslint-disable-line quotes
                } else {
                    continue;
                }
            }
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'info': item,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined,
            });
        }
        return result;
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        const items = response['data']['results'];
        return this.parseTransactions (items, undefined, since, limit);
    }

    parseTransaction (item, currency = undefined) {
        //
        //     {
        //         id: 240565,
        //         transaction_id: '78cbf0405f07a578164644aa67f5c6a08197574bc100a50aaee40ef2e11dc2d7',
        //         received_in: '1EdAqY4cqHoJGAgNfUFER7yZpg1Jc9DUa3',
        //         currency: 'BTC',
        //         amount: 0.49926113,
        //         time: 1518353534,
        //         commission: 0.0008,
        //         withdraw_type: 'Cryptocurrency'
        //     }
        //
        let timestamp = this.safeInteger (item, 'time');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let type = undefined;
        if ('withdraw_type' in item) {
            type = 'withdrawal';
            // only withdrawals are supported right now
        }
        return {
            'id': this.safeString (item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'tag': undefined,
            'type': type,
            'amount': this.safeFloat (item, 'amount'),
            'currency': code,
            'status': 'ok',
            'address': this.safeString (item, 'received_in'),
            'txid': this.safeString (item, 'transaction_id'),
            'updated': undefined,
            'fee': {
                'cost': this.safeFloat (item, 'commission'),
                'currency': code,
            },
            'info': item,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'count': limit,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const results = this.safeValue (data, 'results', []);
        return this.parseTrades (results, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostInfo (params);
        const data = this.safeValue (response, 'data', {});
        const balances = this.safeValue (data, 'balances', {});
        const available = this.safeValue (balances, 'available', {});
        const blocked = this.safeValue (balances, 'blocked', {});
        const result = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currencyId = this.currencyId (code);
            const free = this.safeFloat (available, currencyId);
            if (free !== undefined) {
                const account = this.account ();
                account['free'] = this.safeFloat (available, currencyId);
                account['used'] = this.safeFloat (blocked, currencyId);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        const orderbook = await this.publicGetJsonMarketOrderbook (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        const ticker = await this.publicGetJsonMarketTicker (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let side = this.safeString (trade, 'type');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        let timestamp = this.safeInteger2 (trade, 'date', 'time');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const id = this.safeString2 (trade, 'tid', 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat2 (trade, 'price', 'rate');
        const amount = this.safeFloat2 (trade, 'amount', 'amountCrypto');
        let cost = this.safeFloat (trade, 'amountFiat');
        if (cost === undefined) {
            if (price !== undefined) {
                if (amount !== undefined) {
                    cost = price * amount;
                }
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
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
            'market': market['id'],
        };
        const response = await this.publicGetJsonMarketTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '90m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'] * 1000,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['vol']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '90m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'publicGetGraphsMarket' + this.timeframes[timeframe];
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this[method] (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        const result = {
            'info': response,
        };
        if ('id' in response['data']) {
            result['id'] = response['id'];
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostCancel ({ 'id': id });
    }

    isFiat (currency) {
        if (currency === 'EUR') {
            return true;
        }
        if (currency === 'PLN') {
            return true;
        }
        return false;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let method = undefined;
        const request = {
            'currency': currency['id'],
            'quantity': amount,
        };
        if (this.isFiat (code)) {
            method = 'privatePostWithdrawFiat';
            if ('account' in params) {
                request['account'] = params['account']; // bank account code for withdrawal
            } else {
                throw new ExchangeError (this.id + ' requires account parameter to withdraw fiat currency');
            }
            if ('account2' in params) {
                request['account2'] = params['account2']; // bank SWIFT code (EUR only)
            } else {
                if (currency === 'EUR') {
                    throw new ExchangeError (this.id + ' requires account2 parameter to withdraw EUR');
                }
            }
            if ('withdrawal_note' in params) {
                request['withdrawal_note'] = params['withdrawal_note']; // a 10-character user-specified withdrawal note (PLN only)
            } else {
                if (currency === 'PLN') {
                    throw new ExchangeError (this.id + ' requires withdrawal_note parameter to withdraw PLN');
                }
            }
        } else {
            method = 'privatePostWithdraw';
            request['address'] = address;
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.implodeParams (path + '.json', params);
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const query = this.extend ({
                'tonce': nonce,
                'method': path,
            }, params);
            body = this.urlencode (query);
            headers = {
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"error":501,"errorMsg":"Invalid API key","time":1560869976}
        //
        const code = this.safeString (response, 'error');
        const message = this.safeString (response, 'errorMsg');
        const feedback = this.id + ' ' + this.json (response);
        const exact = this.exceptions['exact'];
        if (code in exact) {
            throw new exact[code] (feedback);
        } else if (message in exact) {
            throw new exact[message] (feedback);
        }
        const broad = this.exceptions['broad'];
        const broadKey = this.findBroadlyMatchedKey (broad, message);
        if (broadKey !== undefined) {
            throw new broad[broadKey] (feedback);
        }
        // throw new ExchangeError (feedback); // unknown message
    }
};
