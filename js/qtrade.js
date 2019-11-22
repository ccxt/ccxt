'use strict';

//  ---------------------------------------------------------------------------

const crypto = require ('crypto');
const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class qtrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'qtrade',
            'name': 'qTrade',
            'countries': [ 'US' ],
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://raw.githubusercontent.com/qtrade-exchange/media-assets/6dafa59/logos/logo_inline_text/logo-full-white.png',
                'api': 'https://api.qtrade.io',
                'www': 'https://qtrade.io',
                'doc': 'https://qtrade-exchange.github.io/qtrade-docs',
            },
            'has': {
                'fetchTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'createOrder': true,
                'cancelOrder': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 'fivemin',
                '15m': 'fifteenmin',
                '30m': 'thirtymin',
                '1h': 'onehour',
                '2h': 'twohour',
                '4h': 'fourhour',
                '1d': 'oneday',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'tickers',
                        'currency/{currency_code}',
                        'currencies',
                        'common',
                        'market/{market_string}',
                        'markets',
                        'market/{market_string}/trades',
                        'orderbook/{market_string}',
                        'market/{market_string}/ohlcv/{interval}',
                    ],
                },
                'private': {
                    'get': [
                        'me',
                        'balances',
                        'balances_all',
                        'market/{market_id}',
                        'orders',
                        'order/{order_id}',
                        'withdraw/{withdraw_id}',
                        'withdraws',
                        'deposit/{deposit_id}',
                        'deposits',
                        'transfers',
                        'order/{order_id}',
                        'trades',
                    ],
                    'post': [
                        'withdraw',
                        'sell_limit',
                        'buy_limit',
                        'cancel_order',
                        'deposit_address/{currency}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0025,
                    'maker': 0.0,
                },
                'funding': {
                    'withdraw': {},
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommon (params);
        //  'BTC/BIS': {
        //      limits: { amount: [Object], price: [Object], cost: [Object] },
        //      precision: { amount: 8, price: 8 },
        //      tierBased: true,
        //      percentage: true,
        //      taker: 0.0025,
        //      maker: 0,
        //      symbol: 'BTC/BIS',
        //      id: 20,
        //      baseId: 'BTC',
        //      quoteId: 'BIS',
        //      base: 'BTC',
        //      quote: 'BIS',
        //      active: false,
        //      info: {
        //        id: 20,
        //        market_currency: 'BIS',
        //        base_currency: 'BTC',
        //        maker_fee: '0',
        //        taker_fee: '0.005',
        //        metadata: [Object],
        //        can_trade: true,
        //        can_cancel: true,
        //        can_view: true
        //      }
        //  }
        const result = [];
        const markets = this.safeValue (response.data, 'markets', []);
        const currencies = this.safeValue (response.data, 'currencies', []);
        const currenciesByCode = this.indexBy (currencies, 'code');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = market['id'];
            const base = this.safeCurrencyCode (market['base_currency']);
            const quote = this.safeCurrencyCode (market['market_currency']);
            const baseCurrency = this.safeValue (currenciesByCode, base, {});
            const quoteCurrency = this.safeValue (currenciesByCode, base, {});
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (baseCurrency, 'precision'),
                'price': this.safeInteger (quoteCurrency, 'precision'),
            };
            const active = this.safeValue (market, 'allow_trading', false);
            // TODO: backend needs imp work
            // const minCost = this.safeFloat (baseCurrency, 'minimum_total_order');
            // const defaultMinAmount = Math.pow (10, -precision['amount']);
            // const minAmount = this.safeFloat (currency, 'minimum_order_amount', defaultMinAmount);
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'baseId': base,
                'quoteId': quote,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
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
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        const currencies = this.safeValue (response.data, 'currencies', []);
        //  CCX: {
        //      id: 'CCX',
        //      code: 'CCX',
        //      info: {
        //        code: 'CCX',
        //        long_name: 'ConcealCoin',
        //        type: 'monero_like',
        //        status: 'ok',
        //        precision: 6,
        //        config: {},           // internal data about the coin
        //        metadata: {},         // additional info, delisting notices, etc.
        //        can_withdraw: true
        //      },
        //      type: 'monero_like',
        //      name: 'ConcealCoin',
        //      status: 'ok',
        //      fee: 1,
        //      precision: 6,
        //      limits: {
        //        amount: [Object],
        //        price: [Object],
        //        cost: [Object],
        //        withdraw: [Object]
        //      }
        //  },
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'long_name');
            const type = this.safeString (currency, 'type');
            const precision = this.safeInteger (currency, 'precision');
            const can_withdraw = this.safeString (currency, 'can_withdraw');
            const fee = this.safeFloat (currency.config, 'withdraw_fee');
            const status = this.safeString (currency, 'status');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': name,
                'status': status,
                'fee': fee,
                'precision': precision,
                'can_withdraw': can_withdraw,
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
                        'min': 3 * fee,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_string': market['id'],
            'interval': this.timeframes[timeframe],
        };
        const response = await this.publicGetMarketMarketStringOhlcvInterval (this.extend (request, params));
        //
        //  [ 1573862400000, 3e-7, 3.1e-7, 3.1e-7, 3.1e-7, 0.0095045 ],
        //  [ 1573948800000, 3.1e-7, 3.2e-7, 3e-7, 3e-7, 0.04184538 ],
        //  [ 1574035200000, 3e-7, 3.2e-7, 3e-7, 3.1e-7, 0.06711341 ]
        //
        return this.parseOHLCVs (response['data']['slices'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = { 'market_string': marketId };
        const response = await this.publicGetOrderbookMarketString (this.extend (request, params));
        const orderbook = { 'bids': [], 'asks': [], 'timestamp': undefined, 'datetime': undefined, 'nonce': undefined };
        for (let i = 0; i < Object.keys (response['data']['buy']).length; i++) {
            const price = parseFloat (Object.keys (response['data']['buy'])[i]);
            const amount = parseFloat (Object.values (response['data']['buy'])[i]);
            orderbook['bids'].push ([price, amount]);
        }
        for (let i = 0; i < Object.keys (response['data']['sell']).length; i++) {
            const price = parseFloat (Object.keys (response['data']['sell'])[i]);
            const amount = parseFloat (Object.values (response['data']['sell'])[i]);
            orderbook['asks'].push ([price, amount]);
        }
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        let marketId = this.safeString (ticker, 'id_hr');
        if (marketId !== undefined) {
            marketId = marketId.replace ('-', '_');
        }
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market === undefined) {
            if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['id_hr'];
        }
        const previous = this.safeFloat (ticker, 'day_open');
        const last = this.safeFloat (ticker, 'last');
        const change = this.safeFloat (ticker, 'day_change') * previous;
        const percentage = this.safeFloat (ticker, 'day_change') * 100;
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'day_high'),
            'low': this.safeFloat (ticker, 'day_low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': (last + previous) / 2,
            'baseVolume': this.safeFloat (ticker, 'day_volume_base'),
            'quoteVolume': this.safeFloat (ticker, 'day_volume_market'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.safeValue (response['data'], 'markets', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = { 'market_string': market['id'] };
        const response = await this.publicGetMarketMarketStringTrades (this.extend (request, params));
        return this.parseTrades (response['data']['trades'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const orderId = this.safeString (trade, 'order_id');
        let side = undefined;
        if (trade['seller_taker'] === true) {
            side = 'sell';
        } else {
            side = 'buy';
        }
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            market = this.safeValue (this.markets_by_id, marketId, market);
            if (market === undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const result = {
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
            'fee': undefined,
        };
        return result;
    }

    async fetchBalance (params = {}) {
        const response = await this.privateGetBalancesAll (params);
        const free = {};
        let bs = response['data']['balances'];
        for (let i = 0; i < bs.length; i++) {
            free[bs[i]['currency']] = this.safeFloat (bs[i], 'balance');
        }
        const used = {};
        bs = response['data']['order_balances'];
        for (let i = 0; i < bs.length; i++) {
            used[bs[i]['currency']] = this.safeFloat (bs[i], 'balance');
        }
        const result = { 'free': free, 'used': used, 'info': response['data'] };
        for (let i = 0; i < Object.keys (free).length; i++) {
            const byCoin = {};
            byCoin['free'] = Object.values (free)[i];
            result[Object.keys (free)[i]] = byCoin;
        }
        for (let i = 0; i < Object.keys (used).length; i++) {
            let byCoin = {};
            if (Object.keys (used)[i] in result) {
                byCoin = result[Object.keys (used)[i]];
            } else {
                byCoin['free'] = 0;
            }
            byCoin['used'] = Object.values (used)[i];
            byCoin['total'] = byCoin['used'] + byCoin['free'];
            result[Object.keys (used)[i]] = byCoin;
        }
        return result;
    }

    async createOrder (symbol, side, type, amount, price, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = { 'queryParams': { 'amount': amount, 'market_id': this.market (symbol)['id'], 'price': price }};
        let response = {};
        if (side === 'sell') {
            response = await this.privatePostSellLimit (this.extend (request, params));
        } else if (side === 'buy') {
            response = await this.privatePostBuyLimit (this.extend (request, params));
        }
        return this.parseOrder (response['data']['order']);
    }

    parseOrder (order) {
        const result = { 'info': order };
        result['id'] = this.safeString (order, 'id');
        result['datetime'] = this.safeString (order, 'created_at');
        result['timestamp'] = this.parse8601 (result['datetime']);
        if (order['open'] === true) {
            result['status'] = 'open';
        } else {
            result['status'] = 'closed';
        }
        result['trades'] = this.parseTrades (order['trades']);
        if (result['trades'][0] !== undefined) {
            result['lastTradeTimestamp'] = result['trades'][0]['timestamp'];
        } else {
            result['lastTradeTimestamp'] = undefined;
        }
        result['price'] = this.safeFloat (order, 'price');
        result['amount'] = this.safeFloat (order, 'market_amount');
        result['remaining'] = this.safeFloat (order, 'market_amount_remaining');
        result['filled'] = result['amount'] - result['remaining'];
        result['cost'] = result['filled'] * result['price'];
        result['fee'] = undefined;
        result['symbol'] = this.markets_by_id[order['market_id']]['symbol'];
        return result;
    }

    async cancelOrder (id, symbol, params = {}) {
        const request = { 'queryParams': { 'id': parseInt (id) }};
        // successful cancellation returns 200 with no payload
        this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = { 'queryParams': { 'order_id': parseInt (id) }};
        const response = await this.privateGetOrderOrderId (this.extend (request, params));
        return this.parseOrder (response['data']['order']);
    }

    async fetchAllOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privateGetOrders (params);
        return this.parseOrders (response['data']['orders'], symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'queryParams': { 'open': true }};
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response['data']['orders'], symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'queryParams': { 'open': false }};
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response['data']['orders'], symbol, since, limit);
    }

    parseOrders (orders, symbol = undefined, since = undefined, limit = undefined) {
        const result = [];
        if (typeof since === 'string') {
            since = this.parse8601 (since);
        }
        for (let i = 0; i < Math.min (orders.length); i++) {
            const order = this.parseOrder (orders[i]);
            if (symbol === undefined || symbol === order.symbol) {
                if (since === undefined || order.timestamp >= since) {
                    result.push (order);
                }
            }
        }
        return result.slice (0, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = (await this.privateGetTrades (symbol, since, limit))['data']['trades'];
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const trade = { 'info': response[i] };
            trade['id'] = this.safeString (response[i], 'id');
            trade['timestamp'] = this.parse8601 (this.safeString (response[i], 'created_at'));
            trade['datetime'] = this.safeString (response[i], 'created_at');
            trade['symbol'] = this.markets_by_id[response[i]['market_id']]['symbol'];
            trade['order'] = this.safeString (response[i], 'order_id');
            trade['type'] = 'limit';
            trade['side'] = undefined;
            if (response[i]['taker'] === true) {
                trade['takerOrMaker'] = 'taker';
            } else {
                trade['takerOrMaker'] = 'maker';
            }
            trade['price'] = this.safeFloat (response[i], 'price');
            trade['amount'] = this.safeFloat (response[i], 'market_amount');
            trade['cost'] = this.safeFloat (response[i], 'base_amount');
            trade['fee'] = undefined;
            result.push (trade);
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        const request = { 'currency': code };
        const response = await this.privatePostDepositAddressCurrency (this.extend (request, params));
        const result = {
            'currency': code,
            'info': response,
            'tag': undefined,
            'address': response['data']['address'],
        };
        return result;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privateGetDeposits (params);
        const result = [];
        if (typeof since === 'string') {
            since = this.parse8601 (since);
        }
        const ds = response['data']['deposits'];
        for (let i = 0; i < ds.length; i++) {
            const deposit = {};
            deposit['timestamp'] = this.parse8601 (this.safeString (ds[i], 'created_at'));
            if (deposit['timestamp'] < since) {
                break;
            }
            deposit['id'] = this.safeString (ds[i], 'id');
            deposit['txid'] = this.safeString (ds[i]['network_data'], 'txid');
            deposit['datetime'] = this.safeString (ds[i], 'created_at');
            let address = undefined;
            let tag = undefined;
            if (this.safeString (ds[i], 'address').includes (':')) {
                address = this.safeString (ds[i], 'address').split (':')[0];
                tag = this.safeString (ds[i], 'address').split (':')[1];
            } else {
                address = this.safeString (ds[i], 'address');
            }
            deposit['addressFrom'] = undefined;
            deposit['address'] = address;
            deposit['addressTo'] = address;
            deposit['tagFrom'] = undefined;
            deposit['tag'] = tag;
            deposit['tagTo'] = tag;
            deposit['type'] = 'deposit';
            deposit['amount'] = this.safeFloat (ds[i], 'amount');
            deposit['currency'] = this.safeString (ds[i], 'currency');
            deposit['status'] = this.safeString (ds[i], 'status');
            deposit['updated'] = undefined;
            deposit['comment'] = undefined;
            deposit['fee'] = undefined;
            deposit['info'] = ds[i];
            result.push (deposit);
        }
        return result;
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privateGetWithdraws (params);
        const result = [];
        if (typeof since === 'string') {
            since = this.parse8601 (since);
        }
        const ws = response['data']['withdraws'];
        for (let i = 0; i < ws.length; i++) {
            const withdraw = {};
            withdraw['timestamp'] = this.parse8601 (this.safeString (ws[i], 'created_at'));
            if (withdraw['timestamp'] < since) {
                break;
            }
            withdraw['id'] = this.safeString (ws[i], 'id');
            withdraw['txid'] = this.safeString (ws[i]['network_data'], 'txid');
            withdraw['datetime'] = this.safeString (ws[i], 'created_at');
            let address = undefined;
            let tag = undefined;
            if (this.safeString (ws[i], 'address').includes (':')) {
                address = this.safeString (ws[i], 'address').split (':')[0];
                tag = this.safeString (ws[i], 'address').split (':')[1];
            } else {
                address = this.safeString (ws[i], 'address');
            }
            withdraw['addressFrom'] = undefined;
            withdraw['address'] = address;
            withdraw['addressTo'] = address;
            withdraw['tagFrom'] = undefined;
            withdraw['tag'] = tag;
            withdraw['tagTo'] = tag;
            withdraw['type'] = 'withdrawal';
            withdraw['amount'] = this.safeFloat (ws[i], 'amount');
            withdraw['currency'] = this.safeString (ws[i], 'currency');
            withdraw['status'] = this.safeString (ws[i], 'status');
            withdraw['updated'] = undefined;
            withdraw['comment'] = undefined;
            withdraw['fee'] = undefined;
            withdraw['info'] = ws[i];
            result.push (withdraw);
        }
        return result;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const deposits = await this.fetchDeposits (code, since, limit);
        const withdraws = await this.fetchWithdrawals (code, since, limit);
        return [...deposits, ...withdraws];
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        const request = { 'address': address, 'amount': amount, 'currency': code };
        if (tag !== undefined) {
            request['address'] = address + ':' + tag;
        }
        return await this.privatePostWithdraw (this.extend (request, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        if (method === 'GET') {
            const queryParams = params.queryParams || {};
            if (queryParams) {
                path = path + '?' + this.urlencode (queryParams);
            }
            delete params.queryParams;
        } else {
            body = JSON.stringify (params);
        }
        let endpoint = '';
        if (api === 'private') {
            endpoint = '/' + this.version + '/user/' + path;
        } else {
            endpoint = '/' + this.version + '/' + path;
        }
        const url = this.urls['api'] + endpoint;
        if (api === 'private') {
            const split = this.apiKey.split (':');
            const keyID = split[0];
            const key = split[1];
            const timestamp = Math.floor (Date.now () / 1000);
            // Create hmac sig
            let sig_text = method + '\n';
            sig_text += endpoint + '\n';
            sig_text += timestamp + '\n';
            sig_text += (body || '') + '\n';
            sig_text += key;
            const hash = crypto.createHash ('sha256').update (sig_text, 'utf8').digest ().toString ('base64');
            headers = this.extend (headers, {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'HMAC-SHA256 ' + keyID + ':' + hash,
                'HMAC-Timestamp': timestamp,
            });
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
