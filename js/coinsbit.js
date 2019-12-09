'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, DDoSProtection, ExchangeError, InsufficientFunds, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': ['EE'],
            'urls': {
                'api': {
                    'public': 'https://coinsbit.io/api/',
                    'private': 'https://coinsbit.io/api/',
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                ],
                'fees': 'https://coinsbit.io/fee-schedule',
            },
            'version': 'v1',
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'ticker',
                        'book',
                        'history',
                        'history/result',
                        'products',
                        'symbols',
                        'depth/result',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'orders',
                        'account/balances',
                        'account/balance',
                        'account/order',
                        'account/order_history',
                    ],
                },
            },
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': false,
                'fetchTradingLimits': false,
                'fetchTradingFees': false,
                'fetchFundingLimits': false,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchBalance': false,
                'fetchAccounts': false,
                'createOrder': false,
                'cancelOrder': false,
                'editOrder': false,
                'fetchOrder': false,
                'fetchOpenOrders': false,
                'fetchAllOrders': false,
                'fetchMyTrades': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'fetchLedger': false,
                'withdraw': false,
                'transfer': false,
            },
            'rateLimit': 1000,
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
                'balance not enough': InsufficientFunds,
                'amount is less than': InvalidOrder,
                'Total is less than': InvalidOrder,
                'validation.total': InvalidOrder,
                'Too many requests': DDoSProtection,
                'This action is unauthorized.': AuthenticationError,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const marketsList = this.safeValue (response, 'result');
        const parsedMarketList = [];
        for (let marketIndex = 0; marketIndex < marketsList.length; marketIndex++) {
            const market = marketsList[marketIndex];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const isActive = true;
            const precision = {
                'amount': this.safeInteger (market, 'stockPrec'),
                'price': this.safeInteger (market, 'moneyPrec'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minAmount'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            parsedMarketList.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': isActive,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return parsedMarketList;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timestamp = this.milliseconds ();
        const response = await this.publicGetTicker (this.extend ({ 'market': market['id'] }, params));
        const ticker = this.safeValue (response, 'result');
        const dateTime = this.iso8601 (timestamp);
        const high = this.safeFloat (ticker, 'high');
        const low = this.safeFloat (ticker, 'low');
        const bid = this.safeFloat (ticker, 'bid');
        const ask = this.safeFloat (ticker, 'ask');
        const open = this.safeFloat (ticker, 'open');
        const close = this.safeFloat (ticker, 'last');
        const last = this.safeFloat (ticker, 'last');
        const change = last - open;
        const percentage = parseFloat (change / open) * parseFloat (100);
        const average = parseFloat (last + open) / parseFloat (2);
        const baseVolume = this.safeFloat (ticker, 'volume');
        const quoteVolume = this.safeFloat (ticker, 'deal');
        return {
            'symbol': symbol,
            'info': response,
            'timestamp': timestamp,
            'datetime': dateTime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepthResult (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // 'since' param of the request is required a tid as a value.
        // The exchange will return the trades, starting with this tid
        if (params.tid !== undefined) {
            request['since'] = params.tid;
        } else {
            request['since'] = 0;
        }
        const trades = await this.publicGetHistoryResult (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseTrade (trade, market) {
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'tid');
        let timestamp = undefined;
        if ('date' in trade) {
            timestamp = this.safeTimestamp (trade, 'date');
        } else {
            timestamp = this.safeTimestamp (trade, 'time');
        }
        const dateTime = this.iso8601 (timestamp);
        const side = this.safeString (trade, 'type');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const cost = this.safeFloat (trade, 'total');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': dateTime,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            const nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            body = this.json (query);
            const payload = this.stringToBase64 (this.encode (body));
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha512');
            headers = {
                'Content-type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code !== 200) {
            const feedback = '\nid: ' + this.id + '\nurl: ' + url + '\ncode: ' + code + '\nbody:\n' + body;
            this.throwExactlyMatchedException (this.httpExceptions, code.toString (), feedback);
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                const isSuccess = this.safeValue (response, 'success', true);
                if (!isSuccess) {
                    const messages = this.safeValue (response, 'message');
                    let errorMessage = '';
                    if (this.isObject (messages)) {
                        const messagesKeys = Object.keys (messages);
                        for (let messageIndex = 0; messageIndex < messagesKeys.length; messageIndex++) {
                            if (messageIndex > 0) {
                                errorMessage += ', ';
                            }
                            errorMessage += messages[messagesKeys[messageIndex]];
                        }
                    } else if (this.isArray (messages)) {
                        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
                            if (messageIndex > 0) {
                                errorMessage += ', ';
                            }
                            errorMessage += messages[messageIndex];
                        }
                    } else {
                        errorMessage = messages;
                    }
                    const feedback = '\nid: ' + this.id + '\nurl: ' + url + '\nError: ' + errorMessage + '\nbody:\n' + body;
                    this.throwExactlyMatchedException (this.exceptions, errorMessage, feedback);
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
