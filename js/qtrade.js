'use strict';

//  ---------------------------------------------------------------------------

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
                'logo': 'https://qtrade.io/images/logo.png',
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
                'fetchMyTrades': true,
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
                        'ticker/{market_string}',
                        'tickers',
                        'currency/{code}',
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
                        'balances_all', // undocumented
                        'market/{market_string}',
                        'orders',
                        'order/{order_id}',
                        'trades',
                        'withdraw/{withdraw_id}',
                        'withdraws',
                        'deposit/{deposit_id}',
                        'deposits',
                        'transfers',
                    ],
                    'post': [
                        'cancel_order',
                        'withdraw',
                        'deposit_address/{currency}',
                        'sell_limit',
                        'buy_limit',
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
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'privateKey': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data":{
        //             "markets":[
        //                 {
        //                     "id":5,
        //                     "market_currency":"BAC",
        //                     "base_currency":"BTC",
        //                     "maker_fee":"0.0025",
        //                     "taker_fee":"0.0025",
        //                     "metadata":{
        //                         "delisting_date":"7/15/2018",
        //                         "market_notices":[
        //                             {
        //                                 "message":"Delisting Notice: This market has been delisted due to low volume. Please cancel your orders and withdraw your funds by 7/15/2018.",
        //                                 "type":"warning"
        //                             }
        //                         ]
        //                     },
        //                     "can_trade":false,
        //                     "can_cancel":true,
        //                     "can_view":false,
        //                     "market_string":"BAC_BTC",
        //                     "minimum_sell_amount":"0.0001",
        //                     "minimum_buy_value":"0.0001",
        //                     "market_precision":8,
        //                     "base_precision":8
        //                 },
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const markets = this.safeValue (data, 'markets', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'market_string');
            const numericId = this.safeInteger (market, 'id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'market_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'base_precision'),
                'price': this.safeInteger (market, 'market_precision'),
            };
            const canView = this.safeValue (market, 'can_view', false);
            const canTrade = this.safeValue (market, 'can_trade', false);
            const active = canTrade && canView;
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'numericId': numericId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'taker': this.safeFloat (market, 'taker_fee'),
                'maker': this.safeFloat (market, 'maker_fee'),
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minimum_buy_value'),
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
        //
        //     {
        //         "data":{
        //             "currencies":[
        //                 {
        //                     "code":"DGB",
        //                     "long_name":"Digibyte",
        //                     "type":"bitcoin_like",
        //                     "precision":8,
        //                     "config":{
        //                         "price":0.0035,
        //                         "withdraw_fee":"10",
        //                         "deposit_types":[
        //                             {
        //                                 "label":"Address",
        //                                 "lookup_mode":"address",
        //                                 "render_type":"address",
        //                                 "deposit_type":"address",
        //                                 "lookup_config":{}
        //                             }
        //                         ],
        //                         "default_signer":103,
        //                         "address_version":30,
        //                         "satoshi_per_byte":300,
        //                         "required_confirmations":200,
        //                         "required_generate_confirmations":300
        //                     },
        //                     "metadata":{},
        //                     "minimum_order":"0.0001",
        //                     "status":"ok",
        //                     "can_withdraw":true,
        //                     "delisted":false,
        //                     "deposit_disabled":false,
        //                     "withdraw_disabled":false,
        //                     "deposit_warn_codes":[],
        //                     "withdraw_warn_codes":[]
        //                 },
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'long_name');
            const type = this.safeString (currency, 'type');
            const canWithdraw = this.safeString (currency, 'can_withdraw');
            const config = this.safeValue (currency, 'config', {});
            const status = this.safeString (currency, 'status');
            const active = canWithdraw && (status === 'ok');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': name,
                'fee': this.safeFloat (config, 'withdraw_fee'),
                'precision': this.safeInteger (currency, 'precision'),
                'active': active,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minimum_order'),
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        const result = [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
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
        const result = this.parseOHLCVs (response['data']['slices'], market, timeframe, since, limit);
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = { 'market_string': marketId };
        const response = await this.publicGetOrderbookMarketString (this.extend (request, params));
        const orderbook = { 'bids': [], 'asks': [], 'timestamp': undefined, 'datetime': undefined, 'nonce': undefined };
        const buyKeys = Object.keys (response['data']['buy']);
        const buyKeysLen = buyKeys.length;
        for (let i = 0; i < buyKeys.length; i++) {
            const price = this.safeFloat (buyKeys, this.sum (buyKeysLen, -i, -1));
            const priceString = this.safeString (buyKeys, this.sum (buyKeysLen, -i, -1));
            const amount = this.safeFloat (response['data']['buy'], priceString);
            orderbook['bids'].push ([price, amount]);
        }
        const sellKeys = Object.keys (response['data']['sell']);
        const sellKeysLen = sellKeys.length;
        for (let i = 0; i < sellKeysLen; i++) {
            const price = this.safeFloat (sellKeys, i);
            const priceString = this.safeString (sellKeys, i);
            const amount = this.safeFloat (response['data']['sell'], priceString);
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
                symbol = quote + '/' + base;
            }
        }
        if (market !== undefined) {
            symbol = market['id_hr'];
        }
        const previous = this.safeFloat (ticker, 'day_open');
        const last = this.safeFloat (ticker, 'last');
        const day_change = this.safeFloat (ticker, 'day_change');
        let percentage = undefined;
        let change = undefined;
        let average = undefined;
        if (day_change !== undefined) {
            percentage = day_change * 100;
            if (previous !== undefined) {
                change = day_change * previous;
            }
        }
        if (last !== undefined && previous !== undefined) {
            average = this.sum (last, previous) / 2;
        }
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
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'day_volume_market'),
            'quoteVolume': this.safeFloat (ticker, 'day_volume_base'),
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetTrades ();
        return this.parseTrades (response['data']['trades'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const orderId = this.safeString (trade, 'order_id');
        const side = this.safeString (trade, 'side');
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
        let amount = this.safeFloat (trade, 'amount');
        if (amount === undefined) {
            // workaround for private trades, which use market_amount key
            amount = this.safeFloat (trade, 'market_amount');
        }
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
        const freeKeys = Object.keys (free);
        const result = { 'free': free, 'used': used, 'total': {}, 'info': response['data'] };
        for (let i = 0; i < freeKeys.length; i++) {
            const byCoin = {};
            const k = Object.keys (free)[i];
            byCoin['free'] = free[k];
            result[k] = byCoin;
        }
        const usedKeys = Object.keys (used);
        for (let i = 0; i < usedKeys.length; i++) {
            const k = Object.keys (used)[i];
            let byCoin = {};
            if (k in result) {
                byCoin = result[k];
            } else {
                byCoin['free'] = 0;
            }
            byCoin['used'] = used[k];
            byCoin['total'] = byCoin['used'] + byCoin['free'];
            result[k] = byCoin;
            result['total'][k] = byCoin['total'];
        }
        return result;
    }

    async createOrder (symbol, side, type, amount, price = undefined, params = {}) {
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
        const t = this.safeValue (order, 'trades');
        if (t !== undefined) {
            let side = undefined;
            if (order['order_type'] === 'buy_limit') {
                side = 'buy';
            } else if (order['order_type'] === 'sell_limit') {
                side = 'sell';
            }
            for (let i = 0; i < order['trades'].length; i++) {
                order['trades'][i]['side'] = side;
            }
            result['trades'] = this.parseTrades (order['trades']);
            result['lastTradeTimestamp'] = result['trades'][0]['timestamp'];
        } else {
            result['trades'] = {};
            result['lastTradeTimestamp'] = undefined;
        }
        result['price'] = this.safeFloat (order, 'price');
        result['amount'] = this.safeFloat (order, 'market_amount');
        result['remaining'] = this.safeFloat (order, 'market_amount_remaining');
        result['filled'] = result['amount'] - result['remaining'];
        result['cost'] = result['filled'] * result['price'];
        result['fee'] = undefined;
        const market_coin = this.safeString (order, 'market_string').split ('_')[0];
        const base_coin = this.safeString (order, 'market_string').split ('_')[1];
        result['symbol'] = market_coin + '/' + base_coin;
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = { 'queryParams': { 'id': parseInt (id) }};
        // successful cancellation returns 200 with no payload
        this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = { 'queryParams': { 'order_id': parseInt (id) }};
        const response = await this.privateGetOrderOrderId (this.extend (request, params));
        return this.parseOrder (response['data']['order']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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

    parseOrders (orders, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        if (typeof since === 'string') {
            since = this.parse8601 (since);
        }
        for (let i = 0; i < orders.length; i++) {
            const order = this.parseOrder (orders[i]);
            if (symbol === undefined || symbol === order['symbol']) {
                if (since === undefined || order['timestamp'] >= since) {
                    result.push (order);
                }
            }
        }
        return result.slice (0, limit);
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
        if (since === undefined) {
            since = 0;
        } else if (typeof since === 'string') {
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
            if (this.safeString (ds[i], 'address').indexOf (':') !== -1) {
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
        if (since === undefined) {
            since = 0;
        } else if (typeof since === 'string') {
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
            if (this.safeString (ws[i], 'address').indexOf (':') !== -1) {
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
        const result = [];
        for (let i = 0; i < deposits.length; i++) {
            result.push (deposits[i]);
        }
        for (let i = 0; i < withdraws.length; i++) {
            result.push (withdraws[i]);
        }
        return result;
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
            if ('queryParams' in params) {
                path = path + '?' + this.urlencode (params['queryParams']);
            }
            // delete params['queryParams'];
        } else {
            body = this.json (params);
        }
        let endpoint = '';
        if (api === 'private') {
            endpoint = '/' + this.version + '/user/' + path;
        } else {
            endpoint = '/' + this.version + '/' + path;
        }
        const url = this.urls['api'] + endpoint;
        if (api === 'private') {
            const split = this.privateKey.split (':');
            const keyID = split[0];
            const key = split[1];
            const timestamp = this.milliseconds ().toString ();
            // Create hmac sig
            let sig_text = method + '\n';
            sig_text += endpoint + '\n';
            sig_text += timestamp + '\n';
            sig_text += (body || '') + '\n';
            sig_text += key;
            const hash = this.binaryToBase64 (this.hash (this.encode (sig_text), 'sha256', 'binary'));
            const auth = 'HMAC-SHA256 ' + keyID + ':' + hash;
            const content_type = 'application/json; charset=utf-8';
            const more_headers = {
                'Content-Type': content_type,
                'Authorization': auth,
                'HMAC-Timestamp': timestamp,
            };
            if (headers !== undefined) {
                headers = this.extend (headers, more_headers);
            } else {
                headers = more_headers;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
