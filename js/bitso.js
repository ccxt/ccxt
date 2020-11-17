'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, AuthenticationError, OrderNotFound } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitso extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': [ 'MX' ], // Mexico
            'rateLimit': 2000, // 30 requests per minute
            'version': 'v3',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
                'fees': 'https://bitso.com/fees',
                'referral': 'https://bitso.com/?ref=itej',
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'precision': {
                    'XRP': 0.000001,
                    'MXN': 0.01,
                    'TUSD': 0.01,
                },
                'defaultPrecision': 0.00000001,
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
            'exceptions': {
                '0201': AuthenticationError, // Invalid Nonce or Invalid Credentials
                '104': InvalidNonce, // Cannot perform request - nonce must be higher than 1520307203724237
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAvailableBooks (params);
        //
        //     {
        //         "success":true,
        //         "payload":[
        //             {
        //                 "book":"btc_mxn",
        //                 "minimum_price":"500",
        //                 "maximum_price":"10000000",
        //                 "minimum_amount":"0.00005",
        //                 "maximum_amount":"500",
        //                 "minimum_value":"5",
        //                 "maximum_value":"10000000",
        //                 "tick_size":"0.01",
        //                 "fees":{
        //                     "flat_rate":{"maker":"0.500","taker":"0.650"},
        //                     "structure":[
        //                         {"volume":"1500000","maker":"0.00500","taker":"0.00650"},
        //                         {"volume":"2000000","maker":"0.00490","taker":"0.00637"},
        //                         {"volume":"5000000","maker":"0.00480","taker":"0.00624"},
        //                         {"volume":"7000000","maker":"0.00440","taker":"0.00572"},
        //                         {"volume":"10000000","maker":"0.00420","taker":"0.00546"},
        //                         {"volume":"15000000","maker":"0.00400","taker":"0.00520"},
        //                         {"volume":"35000000","maker":"0.00370","taker":"0.00481"},
        //                         {"volume":"50000000","maker":"0.00300","taker":"0.00390"},
        //                         {"volume":"150000000","maker":"0.00200","taker":"0.00260"},
        //                         {"volume":"250000000","maker":"0.00100","taker":"0.00130"},
        //                         {"volume":"9999999999","maker":"0.00000","taker":"0.00130"},
        //                     ]
        //                 }
        //             },
        //         ]
        //     }
        const markets = this.safeValue (response, 'payload');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'book');
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minimum_amount'),
                    'max': this.safeFloat (market, 'maximum_amount'),
                },
                'price': {
                    'min': this.safeFloat (market, 'minimum_price'),
                    'max': this.safeFloat (market, 'maximum_price'),
                },
                'cost': {
                    'min': this.safeFloat (market, 'minimum_value'),
                    'max': this.safeFloat (market, 'maximum_value'),
                },
            };
            const defaultPricePrecision = this.safeFloat (this.options['precision'], quote, this.options['defaultPrecision']);
            const pricePrecision = this.safeFloat (market, 'tick_size', defaultPricePrecision);
            const precision = {
                'amount': this.safeFloat (this.options['precision'], base, this.options['defaultPrecision']),
                'price': pricePrecision,
            };
            const fees = this.safeValue (market, 'fees', {});
            const flatRate = this.safeValue (fees, 'flat_rate', {});
            const maker = this.safeFloat (flatRate, 'maker');
            const taker = this.safeFloat (flatRate, 'taker');
            const feeTiers = this.safeValue (fees, 'structure', []);
            const fee = {
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
            const takerFees = [];
            const makerFees = [];
            for (let i = 0; i < feeTiers.length; i++) {
                const tier = feeTiers[i];
                const volume = this.safeFloat (tier, 'volume');
                const takerFee = this.safeFloat (tier, 'taker');
                const makerFee = this.safeFloat (tier, 'maker');
                takerFees.push ([ volume, takerFee ]);
                makerFees.push ([ volume, makerFee ]);
                if (i === 0) {
                    fee['taker'] = taker;
                    fee['maker'] = maker;
                }
            }
            const tiers = {
                'taker': takerFees,
                'maker': makerFees,
            };
            fee['tiers'] = tiers;
            result.push (this.extend ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'limits': limits,
                'precision': precision,
                'active': undefined,
            }, fee));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        const balances = this.safeValue (response['payload'], 'balances');
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'locked'),
                'total': this.safeFloat (balance, 'total'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'book': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'payload');
        const timestamp = this.parse8601 (this.safeString (orderbook, 'updated_at'));
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'book': this.marketId (symbol),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'payload');
        const timestamp = this.parse8601 (this.safeString (ticker, 'created_at'));
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
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const marketId = this.safeString (trade, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const side = this.safeString2 (trade, 'side', 'maker_side');
        let amount = this.safeFloat2 (trade, 'amount', 'major');
        if (amount !== undefined) {
            amount = Math.abs (amount);
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fees_amount');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fees_currency');
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let cost = this.safeFloat (trade, 'minor');
        if (cost !== undefined) {
            cost = Math.abs (cost);
        }
        const price = this.safeFloat (trade, 'price');
        const orderId = this.safeString (trade, 'oid');
        const id = this.safeString (trade, 'tid');
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
            'book': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchMyTrades does not support fetching trades starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'book': this.marketId (symbol),
            'side': side,
            'type': type,
            'major': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const id = this.safeString (response['payload'], 'oid');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'oid': id,
        };
        return await this.privateDeleteOrdersOid (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'partial-fill': 'open', // this is a common substitution in ccxt
            'completed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'oid');
        const side = this.safeString (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const orderType = this.safeString (order, 'type');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'original_amount');
        const remaining = this.safeFloat (order, 'unfilled_amount');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
        }
        const clientOrderId = this.safeString (order, 'client_id');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': undefined,
            'average': undefined,
            'trades': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchOpenOrders does not support fetching orders starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const orders = this.parseOrders (response['payload'], market, since, limit);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetOrdersOid ({
            'oid': id,
        });
        const payload = this.safeValue (response, 'payload');
        if (Array.isArray (payload)) {
            const numOrders = response['payload'].length;
            if (numOrders === 1) {
                return this.parseOrder (payload[0]);
            }
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'oid': id,
        };
        const response = await this.privateGetOrderTradesOid (this.extend (request, params));
        return this.parseTrades (response['payload'], market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'fund_currency': currency['id'],
        };
        const response = await this.privateGetFundingDestination (this.extend (request, params));
        let address = this.safeString (response['payload'], 'account_identifier');
        let tag = undefined;
        if (address.indexOf ('?dt=') >= 0) {
            const parts = address.split ('?dt=');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const methods = {
            'BTC': 'Bitcoin',
            'ETH': 'Ether',
            'XRP': 'Ripple',
            'BCH': 'Bcash',
            'LTC': 'Litecoin',
        };
        const method = (code in methods) ? methods[code] : undefined;
        if (method === undefined) {
            throw new ExchangeError (this.id + ' not valid withdraw coin: ' + code);
        }
        const request = {
            'amount': amount,
            'address': address,
            'destination_tag': tag,
        };
        const classMethod = 'privatePost' + method + 'Withdrawal';
        const response = await this[classMethod] (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response['payload'], 'wid'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let request = [ nonce, method, endpoint ].join ('');
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    request += body;
                }
            }
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            const auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': 'Bitso ' + auth,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            //     {"success":false,"error":{"code":104,"message":"Cannot perform request - nonce must be higher than 1520307203724237"}}
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const feedback = this.id + ' ' + this.json (response);
                const error = this.safeValue (response, 'error');
                if (error === undefined) {
                    throw new ExchangeError (feedback);
                }
                const code = this.safeString (error, 'code');
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (response['success']) {
                return response;
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
