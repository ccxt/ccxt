'use strict';

const Exchange = require ('./base/Exchange');
const { BadRequest, NotSupported, ArgumentsRequired, DDoSProtection, ExchangeError } = require ('./base/errors');

module.exports = class bit4you extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bit4you',
            'name': 'Bit4you',
            'countries': [ 'BE' ], // Belgium
            'rateLimit': 1500,
            'simulation': false, // demo mode
            'requiredCredentials': {
                'token': true, // bearer token
                'apiKey': false,
                'secret': false,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false,
                'privateKey': false,
                'walletAddress': false,
            },
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': undefined,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchTransactions': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    'post': [
                        'market/orderbook',
                    ],
                    'get': [
                        'health/status',
                        'market/assets',
                        'market/list',
                        'market/summaries',
                        'udf/history', // ?iso={iso}&resolution={resolution}&from={from}&to={to}
                    ],
                },
                'private': {
                    'post': [
                        'wallet/balances',
                        'wallet/blockchain-history',
                        'wallet/send',
                        'portfolio/history',
                        'order/pending',
                        'order/info',
                        'order/list',
                        'order/create',
                        'order/cancel',
                    ],
                    'get': [],
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://www.bit4you.io/img/logo/logo.svg',
                'www': 'https://www.bit4you.io/',
                'doc': 'https://docs.bit4you.io/',
                'fees': 'https://www.bit4you.io/services#fees',
                'api': {
                    'coinmarketcap': 'https://www.bit4you.io/api/cmc/v1/', // ex:"/api/cmc/v1/summary"
                    'graphql': 'https://www.bit4you.io/api/markets/graphql',
                    'url': 'https://www.bit4you.io/api',
                },
            },
        });
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined || timeframe === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires symbol and timeframe as arguments');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['to'] = limit;
        }
        const response = await this.publicGetUdfHistory (this.extend (request, params));
        const result = [];
        const timestamp = this.safeValue (response, 't');
        for (let i = 0; i < timestamp.length; i++) {
            const t = timestamp[i];
            const o = this.safeValue (response, 'o');
            const h = this.safeValue (response, 'h');
            const lo = this.safeValue (response, 'l');
            const c = this.safeValue (response, 'c');
            const v = this.safeValue (response, 'v');
            const item = [
                t,
                o[i],
                h[i],
                lo[i],
                c[i],
                v[i],
            ];
            result.push (item);
        }
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarketList ();
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const iso = this.safeMarket (this.safeString (market, 'iso'), undefined, '-');
            const baseId = this.safeStringLower (iso, 'base');
            const quoteId = this.safeStringLower (iso, 'quote');
            const id = baseId + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = true;
            const config = this.safeValue (market, 'config');
            const precision = {
                'price': 8,
                'amount': 8,
                'cost': 8,
            };
            const limits = {
                'price': {
                    'min': this.safeNumber (config, 'rate_min') || 0,
                    'max': this.safeNumber (config, 'rate_max') || 0,
                },
                'amount': {
                    'min': this.safeNumber (config, 'base_qty_min') || 0,
                },
                'cost': {
                    'min': this.safeNumber (config, 'quote_qty_min') || 0,
                },
                'leverage': {
                    'max': undefined,
                },
            };
            const taker = this.safeNumber (config, 'taker_fee');
            const maker = this.safeNumber (config, 'maker_fee');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'spot': true,
                'margin': false,
                'percentage': true,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'tierBased': false,
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'feeSide': 'quote',
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetMarketAssets ();
        const result = {};
        const assetsIds = Object.keys (response);
        for (let i = 0; i < assetsIds.length; i++) {
            const key = assetsIds[i];
            const code = this.safeCurrencyCode (key);
            const asset = response[key];
            const name = this.safeString (asset, 'name');
            const fee = this.safeNumber (asset, 'withdraw_fee') || 0;
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': this.safeNumber (asset, 'min_withdraw') || 0,
                    'max': this.safeNumber (asset, 'max_withdraw') || 0,
                },
            };
            result[code] = {
                'id': key.toLowerCase (),
                'code': code,
                'name': name,
                'active': true,
                'fee': fee,
                'precision': 8,
                'info': asset,
                'limits': limits,
            };
        }
        return result;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (code !== undefined) {
            request['iso'] = code;
        }
        const after_id = this.safeString (params, 'after_id');
        const before_id = this.safeString (params, 'before_id');
        if (after_id !== undefined) {
            request['after_id'] = after_id;
        }
        if (before_id !== undefined) {
            request['before_id'] = before_id;
        }
        const response = await this.privatePostWalletBlockchainHistory (this.extend (request, params));
        const transactionIds = Object.keys (response);
        const result = [];
        for (let i = 0; i < transactionIds.length; i++) {
            const transactionId = transactionIds[i];
            const transaction = this.safeValue (response, transactionId);
            const timestamp = this.safeInteger (transaction, 'time');
            const datetime = this.iso8601 (timestamp);
            const qty = this.safeNumber (transaction, 'quantity');
            let type = '';
            if (qty >= 0) {
                type = 'deposit';
            } else {
                type = 'withdrawal';
            }
            const pending = this.safeInteger (transaction, 'pending');
            const canceled = this.safeInteger (transaction, 'canceled');
            let status = '';
            if (!pending && !canceled) {
                status = 'ok';
            } else {
                status = 'canceled';
            }
            const amount = this.safeNumber (transaction, 'quantity');
            const currency = this.safeString (transaction, 'iso');
            const updated = this.safeInteger (transaction, 'update_time');
            const comment = null;
            const fee = {
                'currency': this.safeString (transaction, 'fee_iso'),
                'cost': this.safeNumber (transaction, 'fee'),
                'rate': undefined,
            };
            result.push ({
                'info': transaction,
                'id': this.safeString (transaction, 'id'),
                'txid': this.safeString (transaction, 'txid'),
                'timestamp': timestamp,
                'datetime': datetime,
                'address': this.safeString (transaction, 'address'),
                'tag': this.safeString (transaction, 'tag'),
                'type': type,
                'amount': amount,
                'currency': currency,
                'status': status,
                'updated': updated,
                'comment': comment,
                'fee': fee,
            });
        }
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        if (code === undefined || amount === undefined || address === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires code, amount and address as arguments');
        }
        const request = {};
        request['iso'] = code;
        request['quantity'] = amount;
        if (tag) {
            request['addres'] = address + ':' + tag;
        } else {
            request['address'] = address;
        }
        const network = this.safeString (params, 'network');
        if (network !== undefined) {
            request['chain'] = network + '-mainnet' || '';
        }
        const response = await this.privatePostWalletSend (this.extend (request, params));
        return response || [];
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetHealthStatus (params);
        const status = this.safeValue (response, 'status');
        const updated = this.safeTimestamp (response, 'updated');
        this.status = this.extend (this.status, {
            'status': status,
            'updated': updated,
        });
        return this.status;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchTicker not supported yet');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketSummaries ();
        return this.parseTickers (response, symbols);
    }

    parseTickers (response, symbols = undefined, params = {}) {
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = response[i];
            const market = this.safeMarket (this.safeString (ticker, 'market'), undefined, '-');
            const symbol = market['symbol'];
            result[symbol] = this.extend (this.parseTicker (ticker, market), params);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const close = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'info': ticker,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': this.safeString (ticker, 'last', close),
            'previousClose': this.safeFloat (ticker, 'prevDay'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
        }, market, false);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        if (symbol !== undefined) {
            const market = this.safeMarket (symbol, undefined, '/');
            const orderSymbol = this.safeString (market, 'base') + '-' + this.safeString (market, 'quote');
            request['market'] = orderSymbol;
        }
        if (since !== undefined) {
            request['page'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrderList (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            result.push (this.parseOrder (order));
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {};
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a id argument');
        }
        request['txid'] = id;
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = params;
        const response = await this.privatePostOrderPending (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            result.push (this.parseOrder (order));
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = params;
        const response = await this.privatePostPortfolioHistory (request);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            result.push (this.parseOrder (order));
        }
        return this.parseOrder (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a id argument');
        }
        const request = {};
        request['txid'] = id;
        const response = await this.privatePostOrderCancel (request);
        return this.parseOrder (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined || type === undefined || side === undefined || amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires symbol, type, side, amount as arguments');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        // if no rate is provided, the order will be executed at the current market rate
        if (type === 'limit' && price) {
            request['rate'] = price;
        }
        request['market'] = market['symbol'].replace ('/', '-');
        request['type'] = side; // ENUM Buy or sell
        request['quantity'] = amount;
        if (this.safeNumber (params, 'quantity_iso') !== undefined) {
            request['quantity_iso'] = this.safeString (params, 'quantity_iso');
        } else {
            request['quantity_iso'] = market.quote;
        }
        if (this.safeString (params, 'time_in_force') !== undefined) {
            request['time_in_force'] = this.safeString (params, 'time_in_force');
        }
        if (this.safeString (params, 'client_order_id') !== undefined) {
            request['client_order_id'] = this.safeString (params, 'client_order_id');
        }
        if (this.safeString (params, 'expires_at') !== undefined) {
            request['expires_at'] = this.safeString (params, 'expires_at');
        }
        const response = await this.privatePostOrderCreate (request);
        return this.parseOrder (response);
    }

    parseOrder (order) {
        const toUniSym = this.safeString (order, 'market');
        let market = {};
        let amountOrder = 0;
        let fee = {};
        const feeObj = this.safeValue (order, 'fee');
        const feeCurrency = this.safeString (feeObj, 'iso');
        const feeCost = this.safeFloat (feeObj, 'quantity');
        if (toUniSym && toUniSym.indexOf ('-') === -1) {
            const symEx = this.safeString (order, 'market') + '-' + this.safeString (order, 'baseCurrency');
            market = this.safeMarket (symEx, undefined, '-');
            amountOrder = this.safeFloat (order, 'invested');
            fee = {
                'currency': this.safeString (market, 'quote'),
                'cost': this.safeFloat (order, 'fee'),
                'rate': undefined,
            };
        } else {
            market = this.safeMarket (this.safeString (order, 'market'), undefined, '-');
            amountOrder = this.safeFloat (order, 'base_quantity');
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
                'rate': undefined,
            };
        }
        const symbolOrder = this.safeString (market, 'symbol');
        const timestamp = this.safeTimestamp (order, 'open_time');
        const updateTime = this.safeTimestamp (order, 'update_time');
        const statusOrder = this.safeValue (order, 'isOpen');
        const rateType = this.safeValue (order, 'requested_rate');
        const sideOrder = this.safeString (order, 'type');
        const quantity = this.safeNumber (order, 'quantity');
        const remainingObj = this.safeValue (order, 'remaining');
        const remaining = this.safeFloat (remainingObj, 'quantity');
        const orderTrades = this.safeValue (order, 'position');
        const orderId = this.safeString (order, 'txid') || this.safeString (order, 'id');
        const parsedOrder = {
            'id': orderId,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': updateTime,
            'status': statusOrder ? 'open' : 'closed',
            'symbol': symbolOrder,
            'type': rateType ? 'limit' : 'market',
            'timeInForce': undefined,
            'side': sideOrder,
            'price': quantity,
            'average': quantity,
            'amount': amountOrder,
            'filled': amountOrder,
            'remaining': remaining,
            'cost': parseFloat (amountOrder * quantity),
            'trades': orderTrades,
            'fee': fee,
            'info': order,
        };
        return parsedOrder;
    }

    async fetchBalance (params = {}) {
        const request = params;
        const response = await this.privatePostWalletBalances (this.extend (request, params));
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const symbol = this.safeString (balance, 'iso');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['free'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['symbol'].replace ('/', '-'),
        };
        const response = await this.publicPostMarketOrderbook (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'bid', 'ask', 'rate', 'quantity');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (this.safeValue (params, 'simulation') === undefined) {
            params['simulation'] = this.simulation;
        }
        let fullPath = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'POST') {
            body = query;
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api']['url'] + fullPath;
        if (api === 'private') {
            const authorization = this.safeString (this.headers, 'Authorization');
            if (authorization !== undefined) {
                headers = {
                    'Authorization': authorization,
                    'Content-Type': 'application/json',
                };
            } else if (this.token) {
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': this.json (body), 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (code >= 400) {
            const feedback = this.id + ' ' + body;
            // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            // this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            if (code === 400) {
                throw new BadRequest (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
