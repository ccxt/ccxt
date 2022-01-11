/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-trailing-spaces */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable padding-line-between-statements */
/* eslint-disable func-call-spacing */

'use strict';

//                              User
// +-------------------------------------------------------------+
// |                            CCXT                             |
// +------------------------------+------------------------------+
// |            Public            |           Private            |
// +=============================================================+
// │                              .                              |
// │                    The Unified CCXT API                     |
// │                              .                              |
// |       loadMarkets           .           fetchBalance       |
// |       fetchMarkets           .            createOrder       |
// |       fetchCurrencies        .            cancelOrder       |
// |       fetchTicker            .             fetchOrder       |
// |       fetchTickers           .            fetchOrders       |
// |       fetchOrderBook         .        fetchOpenOrders       |
// |       fetchOHLCV             .      fetchClosedOrders       |
// |       fetchStatus            .          fetchMyTrades       |
// |       fetchTrades            .                deposit       |
// |                              .               withdraw       |
// │                              .                              |
// +=============================================================+
// │                              .                              |
// |                     Custom Exchange API                     |
// |         (Derived Classes And Their Implicit Methods)        |
// │                              .                              |
// |       publicGet...           .          privateGet...       |
// |       publicPost...          .         privatePost...       |
// |                              .          privatePut...       |
// |                              .       privateDelete...       |
// |                              .                   sign       |
// │                              .                              |
// +=============================================================+
// │                              .                              |
// |                      Base Exchange Class                    |
// │                              .                              |
// +=============================================================+

//  ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const {BadRequest, DDoSProtection, ExchangeError } = require ('./base/errors');
// const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

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
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchMarkOHLCV': false,
                'fetchOHLCV': true,
                'fetchStatus': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
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
                        'portfolio/open-orders',
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
        //TODO
        await this.loadMarkets();
        const market = this.market (symbol);
        // console.log (market)
        const request = {
            'symbol': market['symbol'].replace('/', '-'),
            'resolution': this.timeframes[timeframe],
            'from': since,
            'to': params && params.to || null,
        };

        try {
            const response = await this.publicGetUdfHistory(this.extend(request, params));
            return response;
        } catch (error) {
            return error;
        }
    }

    async fetchMarkets (params = {}) {
        try {
            const response = await this.publicGetMarketList();
            const parsedData = [];
            for (const info in response) {
                const obj = {};
                obj.id = response[info].iso.replace('-', '').toLowerCase();
                obj.symbol = response[info].iso.replace('-', '/');
                obj.base = response[info].iso.split('-')[0];
                obj.quote = response[info].iso.split('-')[1];
                obj.baseId = response[info].iso.split('-')[0].toLowerCase();
                obj.quoteId = response[info].iso.split('-')[1].toLowerCase();
                obj.active = true;
                obj.taker = response[info].config && response[info].config.taker_fee || 0;
                obj.maker = response[info].config && response[info].config.maker_fee || 0;
                obj.percentage = true;
                obj.tierBased = false;
                obj.feeSide = 'quote';
                obj.precision = {
                    'price': response[info].config && response[info].config.rate_step.length - 2 || 8,
                    'amount': response[info].config && response[info].config.base_qty_step.length - 2 || 8,
                    'cost': response[info].config && response[info].config.quote_qty_step.length - 2 || 8,
                };
                obj.limit = {
                    'price': {
                        'min': response[info].config && response[info].config.rate_min || 0,
                        'max': response[info].config && response[info].config.rate_max || 0,
                    },
                    'amount': {
                        'min': response[info].config && response[info].config.base_qty_min || 0,
                    },
                    'cost': {
                        'min': response[info].config && response[info].config.quote_qty_min || 0,
                    },
                };
                obj.info = response[info];
                parsedData.push(obj);
            }
            return parsedData;
        } catch (error) {
            return error;
        }
    }

    async fetchCurrencies (params = {}) {
        try {
            const response = await this.publicGetMarketAssets();
            const parsedData = {};
            for (const info in response) {
                const obj = {};
                const fee = (response[info].chains || [])[0];
                obj.id = info.toLowerCase();
                obj.code = info;
                obj.name = response[info].name;
                obj.active = true;
                obj.fee = fee && fee.withdraw_fee || 0;
                obj.precision = 8;
                obj.limits = {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {  
                        'min': fee && fee.min_withdraw || 0,
                        'max': fee && fee.max_withdraw || 0,
                    },
                };

                const original = {};
                original[info] = response[info];
                obj.info = original;
            
                parsedData[info] = obj;
            }
            return parsedData;
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
            const parsedData = [];

            for (const i in response) {
                const obj = {};
                // obj.info = response[i];
                obj.id = response[i].id;
                obj.txid = response[i].txid;
                obj.timestamp = response[i].time;
                obj.datetime = response[i].time;
                obj.address = response[i].address;
                obj.tag = response[i].tag;
                obj.type = Math.sign(response[i].quantity) >= 0 ? 'deposit' : 'withdrawal';
                obj.amount = response[i].quantity;
                obj.currency = response[i].iso;
                obj.status = (!response[i].pending && !response[i].canceled ? 'ok' : 'canceled');
                obj.updated = response[i].update_time;
                obj.comment = null;
                obj.fee = {
                    'currency': response[i].fee_iso,
                    'cost': response[i].fee,
                    'rate': undefined,
                };

                parsedData.push(obj);
            }

            return parsedData || [];
        } catch (error) {
            return error;
        }
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const request = {};
        request.simulation = params.simulation;
        request.iso = code;
        request.quantity = amount;
        request.address = tag ? address + ':' + tag : address;
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

    async fetchTicker (symbols = undefined, params = {}) {
        try {
            const response = await this.fetchTickers();
            return response[''] || [];
        } catch (error) {
            return error;
        }
    }

    async fetchTickers (symbols = undefined, params = {}) {
        try {
            const response = await this.publicGetMarketSummaries();
            const parsedData = {};
            for (const info in response) {
                const symbol = response[info].market.replace('-', '/');
                const obj = {};
                obj.symbol = symbol;
                obj.timestamp = undefined;
                obj.datetime = undefined;
                obj.symbol = symbol;
                obj.high = response[info].high;
                obj.low = response[info].low;
                obj.bid = response[info].bid;
                obj.bidVolume = undefined;
                obj.ask = response[info].ask;
                obj.askVolume = undefined;
                obj.open = response[info].open;
                obj.close = response[info].close;
                obj.last = response[info].last;
                obj.previousClose = response[info].prevDay;
                obj.change = undefined;
                obj.percentage = undefined;
                obj.average = undefined;
                obj.baseVolume = undefined;
                obj.quoteVolume = undefined;
                obj.info = response[info];
               
                obj.info = response[info];
            
                parsedData[symbol] = obj;
            }
            return parsedData;
        } catch (error) {
            return error;
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // since is currently not implemented in our api, we use pagination index default is 0

        const request = {};
        request.simulation = params.simulation;
        request.market = symbol || '';
        request.page = since;
        request.limit = limit;
        
        try {
            const response = await this.privatePostOrderList (this.extend (request));
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {};
        request.simulation = params.simulation;
        request.txid = id;

        try {
            const response = await this.privatePostOrderInfo (this.extend (request));
            return response || [];
        } catch (error) {
            return error;
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = params;
        
        try {
            const response = await this.privatePostPortfolioOpenOrders (this.extend (request));
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
        request.simulation = params.simulation; // demo mode
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
        const request = {};

        // if no rate is provided, the order will be executed at the current market rate
        if (type === 'limit' && price) {
            request.rate = price;
        }

        request.simulation = params.simulation; // demo mode
        request.market = symbol;
        request.type = side; // ENUM Buy or sell
        request.quantity = amount;
        request.quantity_iso = params.quantity_iso ? params.quantity_iso : null;
        request.time_in_force = params.time_in_force ? params.time_in_force : null; // Default: 'GTC' - Enum: "GTC" "IOC" "FOK" "GTD" "DAY"
        request.client_order_id = params.client_order_id ? params.client_order_id : null;
        request.expires_at = params.expires_at ? params.expires_at : null;

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
            const response = await this.privatePostWalletBalances(this.extend (request));
            return response || [];
        } catch (error) {
            return error;
        }
    }
    
    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const request = {
            'market': symbol,
        };

        try {
            const response = await this.publicPostMarketOrderbook (this.extend (request, params));
            return response || [];
        } catch (error) {
            return error;
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));

        if (method === 'POST') {
            body = JSON.parse(this.json(query));
            if (body && body.simulation === undefined) {
                body.simulation = this.simulation;
            }
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
        return { 'url': url, 'method': method, 'body': this.json(body), 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (code >= 400) {
            const error = this.safeValue (response, 'error', {});
            const message = this.safeString (error, 'message');
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
