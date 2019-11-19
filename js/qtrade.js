'use strict';

//  ---------------------------------------------------------------------------

const crypto = require ('crypto');
const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');

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
                        'market/{market_id}',
                        'orders',
                        'order/{order_id}',
                        'withdraw/{withdraw_id}',
                        'withdraws',
                        'deposit{deposit_id}',
                        'deposits',
                        'transfers',
                        'deposit_address/{currency}',
                        '',
                    ],
                    'post': [
                        'withdraw',
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
        //  [ 1573862400000, 3e-7, 3.1e-7, 3.1e-7, 3.1e-7, 0.0095045 ],
        //  [ 1573948800000, 3.1e-7, 3.2e-7, 3e-7, 3e-7, 0.04184538 ],
        //  [ 1574035200000, 3e-7, 3.2e-7, 3e-7, 3.1e-7, 0.06711341 ]
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
        const request = {
            'market_string': market['id'],
        };
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
        const response = await this.privateGetBalances (params);
        // const response = await this.privateGetOrders ({ 'queryParams': { 'open': 'true' } });
        // const response = await this.privatePostSellLimit ({ 'amount': 12, 'market_id': 1 });
        console.log (JSON.stringify (response, null, 4));
        return {};
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
