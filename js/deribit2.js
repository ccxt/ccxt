'use strict';

const Exchange = require ('./base/Exchange');
const { AuthenticationError, BadRequest, ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, OrderNotFound, DDoSProtection, NotSupported, ExchangeNotAvailable, InsufficientFunds, InvalidAddress } = require ('./base/errors');

module.exports = class deribit2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deribit2',
            'name': 'Deribit',
            'countries': ['NL'], // Netherlands
            'version': 'v2',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchTickers': false,
            },
            'urls': {
                'test': 'https://test.deribit.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg',
                'api': 'https://www.deribit.com',
                'www': 'https://www.deribit.com',
                'doc': [
                    'https://docs.deribit.com',
                    'https://github.com/deribit',
                ],
                'fees': 'https://www.deribit.com/pages/information/fees',
                'referral': 'https://www.deribit.com/reg-1189.4038',
            },
            'api': {
                'public': {
                    'get': [
                        'test',
                        'ticker',
                        'get_time',
                        'get_index',
                        'get_summary',
                        'get_currencies',
                        'get_order_book',
                        'get_instruments',
                        'get_trade_volumes',
                        'get_announcements',
                        'get_last_trades_by_instrument',
                    ],
                },
                'private': {
                    'get': [
                        'get_positions',
                        'get_order_state',
                        'get_account_summary',
                        'get_new_announcements',
                        'get_open_orders_by_instrument',
                        'get_user_trades_by_instrument',
                        'get_order_history_by_instrument',
                    ],
                    'post': [
                        'buy',
                        'sell',
                        'edit',
                        'cancel',
                        'cancel_all',
                    ],
                },
            },
            'exceptions': {
                // 0 or absent Success, No error
                '9999': PermissionDenied,           // "api_not_enabled" User didn't enable API for the Account
                '10000': AuthenticationError,       // "authorization_required" Authorization issue, invalid or absent signature etc
                '10001': ExchangeError,             // "error" Some general failure, no public information available
                '10002': InvalidOrder,              // "qty_too_low" Order quantity is too low
                '10003': InvalidOrder,              // "order_overlap" Rejection, order overlap is found and self-trading is not enabled
                '10004': OrderNotFound,             // "order_not_found" Attempt to operate with order that can't be found by specified id
                '10005': InvalidOrder,              // "price_too_low <Limit>" Price is too low, <Limit> defines current limit for the operation
                '10006': InvalidOrder,              // "price_too_low4idx <Limit>" Price is too low for current index, <Limit> defines current bottom limit for the operation
                '10007': InvalidOrder,              // "price_too_high <Limit>" Price is too high, <Limit> defines current up limit for the operation
                '10008': InvalidOrder,              // "price_too_high4idx <Limit>" Price is too high for current index, <Limit> defines current up limit for the operation
                '10009': InsufficientFunds,         // "not_enough_funds" Account has not enough funds for the operation
                '10010': OrderNotFound,             // "already_closed" Attempt of doing something with closed order
                '10011': InvalidOrder,              // "price_not_allowed" This price is not allowed for some reason
                '10012': InvalidOrder,              // "book_closed" Operation for instrument which order book had been closed
                '10013': PermissionDenied,          // "pme_max_total_open_orders <Limit>" Total limit of open orders has been exceeded, it is applicable for PME users
                '10014': PermissionDenied,          // "pme_max_future_open_orders <Limit>" Limit of count of futures' open orders has been exceeded, it is applicable for PME users
                '10015': PermissionDenied,          // "pme_max_option_open_orders <Limit>" Limit of count of options' open orders has been exceeded, it is applicable for PME users
                '10016': PermissionDenied,          // "pme_max_future_open_orders_size <Limit>" Limit of size for futures has been exceeded, it is applicable for PME users
                '10017': PermissionDenied,          // "pme_max_option_open_orders_size <Limit>" Limit of size for options has been exceeded, it is applicable for PME users
                '10019': PermissionDenied,          // "locked_by_admin" Trading is temporary locked by admin
                '10020': ExchangeError,             // "invalid_or_unsupported_instrument" Instrument name is not valid
                '10022': InvalidOrder,              // "invalid_quantity" quantity was not recognized as a valid number
                '10023': InvalidOrder,              // "invalid_price" price was not recognized as a valid number
                '10024': InvalidOrder,              // "invalid_max_show" max_show parameter was not recognized as a valid number
                '10025': InvalidOrder,              // "invalid_order_id" Order id is missing or its format was not recognized as valid
                '10026': InvalidOrder,              // "price_precision_exceeded" Extra precision of the price is not supported
                '10027': InvalidOrder,              // "non_integer_contract_amount" Futures contract amount was not recognized as integer
                '10028': DDoSProtection,            // "too_many_requests" Allowed request rate has been exceeded
                '10029': OrderNotFound,             // "not_owner_of_order" Attempt to operate with not own order
                '10030': ExchangeError,             // "must_be_websocket_request" REST request where Websocket is expected
                '10031': ExchangeError,             // "invalid_args_for_instrument" Some of arguments are not recognized as valid
                '10032': InvalidOrder,              // "whole_cost_too_low" Total cost is too low
                '10033': NotSupported,              // "not_implemented" Method is not implemented yet
                '10034': InvalidOrder,              // "stop_price_too_high" Stop price is too high
                '10035': InvalidOrder,              // "stop_price_too_low" Stop price is too low
                '10036': InvalidOrder,              // Max Show Amount is not valid.
                '10040': ExchangeNotAvailable,      // Request can't be processed right now and should be retried.
                '10041': ExchangeNotAvailable,      // Settlement is in progress.
                '10043': InvalidOrder,              // Price has to be rounded to a certain tick size.
                '10044': InvalidOrder,              // Stop Price has to be rounded to a certain tick size.
                '10045': InvalidOrder,              // Liquidation order can't be canceled.
                '10046': InvalidOrder,              // Liquidation order can't be edited.
                '10048': PermissionDenied,          // The requested operation is not available on this server.
                '11008': InvalidOrder,              // This request is not allowed in regards to the filled order.
                '11029': BadRequest,                // Some invalid input has been detected.
                '11030': ExchangeError,             // Some rejects which are not considered as very often, more info may be specified in <Reason>.
                '11031': ExchangeError,             // Some errors which are not considered as very often, more info may be specified in <Error>.
                '11035': InvalidOrder,              // Allowed amount of stop orders has been exceeded.
                '11036': InvalidOrder,              // Invalid StopPx (too high or too low) as to current index or market.
                '11037': InvalidOrder,              // Instrument already not available for trading.
                '11038': InvalidOrder,              // Advanced orders are not available for futures.
                '11039': InvalidOrder,              // Advanced post-only orders are not supported yet.
                '11041': InvalidOrder,              // Advanced order properties can't be set if the order is not advanced.
                '11042': PermissionDenied,          // Permission for the operation has been denied.
                '11043': BadRequest,                // Bad argument has been passed.
                '11044': BadRequest,                // Attempt to do open order operations with the not open order.
                '11045': BadRequest,                // Event name has not been recognized.
                '11046': InvalidOrder,              // At several minutes to instrument expiration, corresponding advanced implied volatility orders are not allowed.
                '11047': BadRequest,                // The specified combination of arguments is not supported.
                '11048': BadRequest,                // Wrong Max Show for options.
                '11049': BadRequest,                // Several bad arguments have been passed.
                '11050': BadRequest,                // Request has not been parsed properly.
                '11051': ExchangeNotAvailable,      // System is under maintenance.
                '11052': ExchangeError,             // Subscription error. However, subscription may fail without this error, please check list of subscribed channels returned, as some channels can be not subscribed due to wrong input or lack of permissions.
                '11053': ExchangeError,             // Specified transfer is not found.
                '11090': InvalidAddress,            // Invalid address.
                '11091': InvalidAddress,            // Invalid address for the transfer.
                '11092': InvalidAddress,            // The address already exists.
                '11093': ExchangeError,             // Limit of allowed addresses has been reached.
                '11094': ExchangeError,             // Some unhandled error on server. Please report to admin. The details of the request will help to locate the problem.
                '11095': PermissionDenied,          // Deposit address creation has been disabled by admin.
                '11096': ExchangeError,             // Withdrawal instead of transfer.
                '12000': PermissionDenied,          // Wrong TFA code
                '12001': ExchangeError,             // Limit of subbacounts is reached.
                '12002': ExchangeError,             // The input is not allowed as name of subaccount.
                '12998': AuthenticationError,       // The number of failed TFA attempts is limited.
                '12003': PermissionDenied,          // The number of failed login attempts is limited.
                '12004': PermissionDenied,          // The number of registration requests is limited.
                '12005': PermissionDenied,          // The country is banned (possibly via IP check).
                '12100': PermissionDenied,          // Transfer is not allowed. Possible wrong direction or other mistake.
                '12999': AuthenticationError,       // TFA code is correct but it is already used. Please, use next code.
                '13000': AuthenticationError,       // Login name is invalid (not allowed or it contains wrong characters).
                '13001': AuthenticationError,       // Account must be activated.
                '13002': PermissionDenied,          // Account is blocked by admin.
                '13003': AuthenticationError,       // This action requires TFA authentication.
                '13004': AuthenticationError,       // Invalid credentials has been used.
                '13005': AuthenticationError,       // Password confirmation error.
                '13006': AuthenticationError,       // Invalid Security Code.
                '13007': AuthenticationError,       // User's security code has been changed or wrong.
                '13008': BadRequest,                // Request failed because of invalid input or internal failure.
                '13009': AuthenticationError,       // Wrong or expired authorization token or bad signature. For example, please check scope of the token, "connection" scope can't be reused for other connections.
                '13010': BadRequest,                // Invalid input, missing value.
                '13011': BadRequest,                // Input is too short.
                '13012': BadRequest,                // Subaccount restrictions.
                '13013': BadRequest,                // Unsupported or invalid phone number.
                '13014': ExchangeError,             // SMS sending failed -- phone number is wrong.
                '13015': AuthenticationError,       // Invalid SMS code.
                '13016': BadRequest,                // Invalid input.
                '13017': BadRequest,                // Subscription hailed, invalid subscription parameters.
                '13018': BadRequest,                // Invalid content type of the request.
                '13019': InvalidOrder,              // Closed, expired order book.
                '13020': InvalidOrder,              // Instrument is not found, invalid instrument name.
                '13021': PermissionDenied,          // Not enough permissions to execute the request, forbidden.
                '-32000': BadRequest,
                '-32601': BadRequest,
                '-32602': BadRequest,
                '-32700': BadRequest,
            },
            'options': {
                'fetchTickerQuotes': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        let allInstruments = [];
        // Fetch available currencies
        const currenciesResponse = await this.publicGetGetCurrencies ();
        const currencies = this.safeValue (currenciesResponse, 'result');
        // Fetch instruments per currency
        for (let i = 0; i < currencies.length; i++) {
            const instrumentsResponse = await this.publicGetGetInstruments ({ 'currency': currencies[i]['currency'] });
            const instruments = this.safeValue (instrumentsResponse, 'result');
            allInstruments = allInstruments.concat (instruments);
        }
        // Result object formatting
        const result = [];
        for (let i = 0; i < allInstruments.length; i++) {
            const market = allInstruments[i];
            const id = this.safeString (market, 'instrument_name');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': id,
                'base': base,
                'quote': quote,
                'active': market['is_active'],
                'precision': {
                    'amount': market['min_trade_amount'],
                    'price': market['tick_size'],
                },
                'limits': {
                    'amount': {
                        'min': market['min_trade_amount'],
                    },
                    'price': {
                        'min': market['tick_size'],
                    },
                },
                'type': market['kind'],
                'spot': false,
                'future': market['kind'] === 'future',
                'option': market['kind'] === 'option',
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetCurrencies (params);
        const currencies = this.safeValue (response, 'result');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = this.safeCurrencyCode (this.safeString (currency['currency'], 'altname'));
            result[code] = {
                'id': currency['currency'],
                'code': code,
                'info': currency,
                'name': currency['currency_long'],
                'active': true,
                'fee': undefined, // todo check: which fee
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const allBalances = {};
        // Fetch available currencies
        const currenciesResponse = await this.publicGetGetCurrencies ({});
        const currencies = this.safeValue (currenciesResponse, 'result');
        // Assign all account summaries (per currency)
        for (let i = 0; i < currencies.length; i++) {
            const currentCurrency = this.safeString (currencies[i], 'currency');
            const accountSummaryResponse = await this.privateGetGetAccountSummary ({ 'currency': currentCurrency });
            allBalances[currentCurrency] = {
                'free': this.safeFloat (accountSummaryResponse['result'], 'available_funds'),
                'used': this.safeFloat (accountSummaryResponse['result'], 'maintenance_margin'),
                'total': this.safeFloat (accountSummaryResponse['result'], 'equity'),
            };
        }
        return this.parseBalance (allBalances);
    }

    async fetchDepositAddress (currency, params = {}) {
        const response = await this.privateGetGetAccountSummary ({ 'currency': currency });
        const address = this.safeString (response, 'deposit_address');
        return {
            'currency': this.safeCurrencyCode ('BTC'),
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = this.findSymbol (this.safeString (ticker, 'instrument_name'), market);
        const last = this.safeFloat (ticker, 'last_price');
        const stats = this.safeValue (ticker, 'stats');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (stats, 'high'),
            'low': this.safeFloat (stats, 'low'),
            'bid': this.safeFloat (ticker, 'best_bid_price'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask_price'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (stats, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response['result'], market);
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'trade_id');
        const orderId = this.safeString (trade, 'order_id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'direction');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        } else {
            request['count'] = 1000;
        }
        const response = await this.publicGetGetLastTradesByInstrument (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const timestamp = this.nonce ();
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response['result'], timestamp, 'bids', 'asks');
        return this.extend (orderbook, {
            'nonce': this.safeInteger (response['result'], 'timestamp'),
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const lastUpdate = this.safeInteger (order, 'last_update_timestamp');
        let lastTradeTimestamp = this.safeInteger (order, 'last_update_timestamp');
        const id = this.safeString (order, 'order_id');
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'average_price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled_amount');
        if (lastTradeTimestamp === undefined) {
            if (filled !== undefined) {
                if (filled > 0) {
                    lastTradeTimestamp = lastUpdate;
                }
            }
        }
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (price !== undefined) {
                cost = price * filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'order_state'));
        let side = this.safeString (order, 'direction');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let feeCost = this.safeFloat (order, 'commission');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        const fee = {
            'cost': feeCost,
            'currency': 'BTC',
        };
        const type = this.safeString (order, 'order_type');
        const marketId = this.safeString (order, 'instrument_name');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined, // todo: parse trades
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetOrderState (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        if (result === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() ' + this.json (response));
        }
        return this.parseOrder (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'instrument_name': this.marketId (symbol),
            'amount': amount,
            'type': type,
            // 'post_only': 'false' or 'true', https://github.com/ccxt/ccxt/issues/5159
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        const method = 'privatePost' + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        const order = this.safeValue (response['result'], 'order');
        if (order === undefined) {
            return response;
        }
        return this.parseOrder (order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        if (amount !== undefined) {
            request['amount'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePostEdit (this.extend (request, params));
        return this.parseOrder (response['result']['order']);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostCancel (this.extend (request, params));
        return this.parseOrder (response['result']['order']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetOpenOrdersByInstrument (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.privateGetGetOrderHistoryByInstrument (this.extend (request, params));
        return this.parseOrders (response['result'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // default = 20
        }
        const response = await this.privateGetGetUserTradesByInstrument (this.extend (request, params));
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    randomNonce (length) {
        const result = this.hash (this.encode (this.apiKey + this.nonce ().toString ()), 'sha512', 'base64');
        return result.slice (0, length);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = '/' + 'api/' + this.version + '/' + api + '/' + path;
        let url = this.urls['api'] + query;
        // If public or private endpoint
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            let uri = query;
            if (Object.keys (params).length) {
                uri += '?' + this.urlencode (params);
                params = this.keysort (params);
            }
            let requestBody = '';
            if (body) {
                requestBody = body;
            }
            const timestamp = (this.nonce ());
            const randomNonce = this.randomNonce (16);
            // Craft relevant data
            const requestData = method.toUpperCase () + '\n' + uri + '\n' + requestBody + '\n';
            const stringToSign = timestamp + '\n' + randomNonce + '\n' + requestData;
            const signature = this.hmac (this.encode (stringToSign), this.encode (this.secret), 'sha256');
            // Craft header
            const headerVal = 'deri-hmac-sha256 ' + 'id=' + this.apiKey + ',ts=' + timestamp + ',nonce=' + randomNonce + ',sig=' + this.encode (signature);
            headers = {
                'Authorization': headerVal,
            };
            if (method !== 'GET') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = this.urlencode (params);
            } else if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (!response) {
            return; // fallback to default error handler
        }
        const error = this.safeString (response, 'error');
        if ((error !== undefined) && (error !== '0')) {
            const feedback = this.id + ' ' + body;
            const exceptions = this.exceptions;
            if (error in exceptions) {
                throw new exceptions[error] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
