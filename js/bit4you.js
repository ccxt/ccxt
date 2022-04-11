'use strict';

const Exchange = require ('./base/Exchange');
const { BadRequest, DDoSProtection, ExchangeError } = require ('./base/errors');

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
                'CORS': undefined,
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
                'fetchTicker': true,
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        // console.log (market)
        const request = {
            'symbol': market['symbol'].replace ('/', '-'),
            'resolution': this.timeframes[timeframe],
            'from': since,
            'to': params && params.to || null,
        };
        try {
            const response = await this.publicGetUdfHistory (this.extend (request, params));
            return response;
        } catch (error) {
            return error;
        }
    }

    async fetchMarkets (params = {}) {
        try {
            const markets = await this.publicGetMarketList ();
            const marketIds = Object.keys (markets);
            const result = [];
            for (let i = 0; i < marketIds.length; i++) {
                const marketId = marketIds[i];
                const market = this.safeValue (markets, marketId);
                const id = this.safeString (market, 'iso').replace ('-', '').toLowerCase ();
                const symbol = this.safeString (market, 'iso').replace ('-', '/').toUpperCase ();
                const baseId = this.safeString (market, 'iso').split ('-')[0].toLowerCase ();
                const quoteId = this.safeString (market, 'iso').split ('-')[1].toLowerCase ();
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const active = true;
                const config = market.config;
                const precision = {
                    'price': (this.safeNumber (config, 'rate_step').length - 2) || 8,
                    'amount': (this.safeNumber (config, 'base_qty_step').length - 2) || 8,
                    'cost': (this.safeNumber (config, 'quote_qty_step').length - 2) || 8,
                };
                const limits = {
                    'price': {
                        'min': this.safeNumber (config, 'config.rate_min') || 0,
                        'max': this.safeNumber (config, 'config.rate_max') || 0,
                    },
                    'amount': {
                        'min': this.safeNumber (config, 'config.base_qty_min') || 0,
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
        } catch (error) {
            return error;
        }
    }

    async fetchCurrencies (params = {}) {
        try {
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
        } catch (error) {
            return error;
        }
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        request.since = since;
        request.limit = limit;
        request.iso = code;
        request.after_id = params.after_id;
        request.before_id = params.before_id;
        try {
            const response = await this.privatePostWalletBlockchainHistory (this.extend (request));
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
        } catch (error) {
            return error;
        }
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const request = {};
        request.iso = code;
        request.quantity = amount;
        if (tag) {
            request.addres = address + ':' + tag;
        } else {
            request.address = address;
        }
        request.chain = params.network + '-mainnet' || '';
        try {
            const response = await this.privatePostWalletSend (this.extend (request));
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async fetchStatus (params = {}) {
        return {
            'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
            'updated': this.milliseconds (), // integer, last updated timestamp in milliseconds if updated via the API
            'eta': undefined, // when the maintenance or outage is expected to end
            'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
        };
    }

    async fetchTicker (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const cached = this.market (symbol);
        const market = cached['symbol'];
        try {
            const response = await this.fetchTickers ();
            return response[market] || [];
        } catch (error) {
            return error;
        }
    }

    async fetchTickers (symbols = undefined, params = {}) {
        try {
            const response = await this.publicGetMarketSummaries ();
            const result = {};
            const tickerIds = Object.keys (response);
            for (let i = 0; i < tickerIds.length; i++) {
                const key = tickerIds[i];
                const ticker = response[key];
                const symbol = this.safeString (ticker, 'market').replace ('-', '/');
                result[symbol] = {
                    'symbol': symbol,
                    'info': ticker,
                    'timestamp': undefined,
                    'datetime': undefined,
                    'high': this.safeFloat (ticker, 'high'),
                    'low': this.safeFloat (ticker, 'low'),
                    'bid': this.safeFloat (ticker, 'bid'),
                    'bidVolume': undefined,
                    'ask': this.safeFloat (ticker, 'ask'),
                    'askVolume': undefined,
                    'vwap': undefined,
                    'open': this.safeFloat (ticker, 'open'),
                    'close': this.safeFloat (ticker, 'last'),
                    'last': this.safeFloat (ticker, 'last'),
                    'previousClose': this.safeFloat (ticker, 'prevDay'),
                    'change': undefined,
                    'percentage': undefined,
                    'average': undefined,
                    'baseVolume': this.safeFloat (ticker, 'volume'),
                    'quoteVolume': undefined,
                };
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        request.market = symbol || '';
        request.page = since;
        request.limit = limit;
        try {
            const response = await this.privatePostOrderList (this.extend (request));
            const orderIds = Object.keys (response);
            const result = [];
            for (let i = 0; i < orderIds.length; i++) {
                const key = orderIds[i];
                const order = response[key];
                const remaining = order.remaining;
                const filled = this.safeFloat (order, 'base_quantity');
                const price = this.safeFloat (order, 'quantity');
                const feeObj = order.fee;
                let status = '';
                let type = '';
                if (this.safeString (order, 'isOpen')) {
                    status = 'open';
                } else {
                    status = 'closed';
                }
                if (this.safeNumber (order, 'requested_rate')) {
                    type = 'limit';
                } else {
                    type = 'market';
                }
                result.push ({
                    'id': this.safeString (order, 'txid'),
                    'clientOrderId': undefined,
                    'datetime': this.iso8601 (this.safeTimestamp (order, 'open_time')),
                    'timestamp': this.safeTimestamp (order, 'open_time'),
                    'lastTradeTimestamp': this.safeTimestamp (order, 'update_time'),
                    'status': status,
                    'symbol': this.safeString (order, 'market').replace ('-', '/'),
                    'type': type,
                    'timeInForce': undefined,
                    'side': this.safeString (order, 'type'),
                    'price': price,
                    'average': this.safeFloat (order, 'quantity'),
                    'amount': this.safeFloat (order, 'base_quantity'),
                    'filled': filled,
                    'remaining': this.safeFloat (remaining, 'quantity'),
                    'cost': filled * price,
                    'trades': order.position,
                    'fee': {
                        'currency': this.safeString (feeObj, 'iso'),
                        'cost': this.safeFloat (feeObj, 'quantity'),
                        'rate': undefined,
                    },
                    'info': order,
                });
            }
            return result;
        } catch (error) {
            return error;
        }
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {};
        request.txid = id;
        try {
            const response = await this.privatePostOrderInfo (this.extend (request));
            const parsedData = {};
            parsedData.id = response.txid;
            parsedData.clientOrderId = undefined;
            parsedData.datetime = this.iso8601 (response.open_time);
            parsedData.timestamp = response.open_time;
            parsedData.lastTradeTimestamp = response.update_time;
            if (response.isOpen) {
                parsedData.status = 'open';
            } else {
                parsedData.status = 'closed';
            }
            parsedData.symbol = response.market.replace ('-', '/');
            if (response.requested_rate) {
                parsedData.type = 'limit';
            } else {
                parsedData.type = 'market';
            }
            parsedData.timeInForce = undefined;
            parsedData.side = response.type;
            parsedData.price = response.quantity;
            parsedData.average = response.quantity;
            parsedData.amount = response.base_quantity;
            parsedData.filled = response.base_quantity;
            parsedData.remaining = response.remaining.quantity || undefined;
            parsedData.cost = parseFloat (parsedData.filled * parsedData.price);
            parsedData.trades = response.position;
            parsedData.fee = {
                'currency': response.fee.iso,
                'cost': response.fee.quantity,
                'rate': undefined,
            };
            parsedData.info = response;
            return parsedData || [];
        } catch (error) {
            return error;
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = params;
        try {
            const response = await this.privatePostOrderPending (this.extend (request));
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = params;
        try {
            const response = await this.privatePostPortfolioHistory (request);
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // side type be limit or Market
        const request = {};
        request.txid = id;
        try {
            const response = await this.privatePostOrderCancel (request);
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // side type be limit or Market
        await this.loadMarkets ();
        const market = this.market (symbol);
        const iso = market['symbol'].replace ('/', '-');
        const request = {};
        // if no rate is provided, the order will be executed at the current market rate
        if (type === 'limit' && price) {
            request.rate = price;
        }
        request.market = iso;
        request.type = side; // ENUM Buy or sell
        request.quantity = amount;
        if (params && params.quantity_iso) {
            request.quantity_iso = params.quantity_iso;
        } else {
            request.quantity_iso = market.quote;
        }
        if (params && params.time_in_force) {
            request.time_in_force = params.time_in_force;
        } else {
            request.time_in_force = 'GTC';
        }
        if (params && params.client_order_id) {
            request.client_order_id = params.client_order_id;
        } else {
            request.client_order_id = undefined;
        }
        if (params && params.expires_at) {
            request.expires_at = params.expires_at;
        } else {
            request.expires_at = undefined;
        }
        try {
            const response = await this.privatePostOrderCreate (request);
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async fetchBalance (params = {}) {
        const request = params;
        try {
            const response = await this.privatePostWalletBalances (this.extend (request));
            return response;
        } catch (error) {
            return error;
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['symbol'].replace ('/', '-'),
        };
        try {
            const response = await this.publicPostMarketOrderbook (this.extend (request, params));
            return this.parseOrderBook (response, symbol, undefined, 'bid', 'ask', 'rate', 'quantity');
        } catch (error) {
            return error;
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'POST') {
            body = JSON.parse (this.json (query));
            body.simulation = this.simulation;
        }
        headers = {
            'Content-Type': 'application/json',
        };
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'].url + fullPath;
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
