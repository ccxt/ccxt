'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class therock extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'therock',
            'name': 'TheRockTrading',
            'countries': [ 'MT' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
                'api': 'https://api.therocktrading.com',
                'www': 'https://therocktrading.com',
                'doc': [
                    'https://api.therocktrading.com/doc/v1/index.html',
                    'https://api.therocktrading.com/doc/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'funds',
                        'funds/{id}/orderbook',
                        'funds/{id}/ticker',
                        'funds/{id}/trades',
                        'funds/tickers',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'balances/{id}',
                        'discounts',
                        'discounts/{id}',
                        'funds',
                        'funds/{id}',
                        'funds/{id}/trades',
                        'funds/{fund_id}/orders',
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/position_balances',
                        'funds/{fund_id}/positions',
                        'funds/{fund_id}/positions/{id}',
                        'transactions',
                        'transactions/{id}',
                        'withdraw_limits/{id}',
                        'withdraw_limits',
                    ],
                    'post': [
                        'atms/withdraw',
                        'funds/{fund_id}/orders',
                    ],
                    'delete': [
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/orders/remove_all',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.0005,
                        'BCH': 0.0005,
                        'PPC': 0.02,
                        'ETH': 0.001,
                        'ZEC': 0.001,
                        'LTC': 0.002,
                        'EUR': 2.5,  // worst-case scenario: https://therocktrading.com/en/pages/fees
                    },
                    'deposit': {
                        'BTC': 0,
                        'BCH': 0,
                        'PPC': 0,
                        'ETH': 0,
                        'ZEC': 0,
                        'LTC': 0,
                        'EUR': 0,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetFunds ();
        //
        //     { funds: [ {                      id:   "BTCEUR",
        //                              description:   "Trade Bitcoin with Euro",
        //                                     type:   "currency",
        //                            base_currency:   "EUR",
        //                           trade_currency:   "BTC",
        //                                  buy_fee:    0.2,
        //                                 sell_fee:    0.2,
        //                      minimum_price_offer:    0.01,
        //                   minimum_quantity_offer:    0.0005,
        //                   base_currency_decimals:    2,
        //                  trade_currency_decimals:    4,
        //                                leverages: []                           },
        //                {                      id:   "LTCEUR",
        //                              description:   "Trade Litecoin with Euro",
        //                                     type:   "currency",
        //                            base_currency:   "EUR",
        //                           trade_currency:   "LTC",
        //                                  buy_fee:    0.2,
        //                                 sell_fee:    0.2,
        //                      minimum_price_offer:    0.01,
        //                   minimum_quantity_offer:    0.01,
        //                   base_currency_decimals:    2,
        //                  trade_currency_decimals:    2,
        //                                leverages: []                            } ] }
        //
        let markets = this.safeValue (response, 'funds');
        let result = [];
        if (markets === undefined) {
            throw new ExchangeError (this.id + ' fetchMarkets got an unexpected response');
        } else {
            for (let i = 0; i < markets.length; i++) {
                let market = markets[i];
                let id = this.safeString (market, 'id');
                let baseId = this.safeString (market, 'trade_currency');
                let quoteId = this.safeString (market, 'base_currency');
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                let symbol = base + '/' + quote;
                let buy_fee = this.safeFloat (market, 'buy_fee');
                let sell_fee = this.safeFloat (market, 'sell_fee');
                let taker = Math.max (buy_fee, sell_fee);
                let maker = taker;
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                    'active': true,
                    'maker': maker,
                    'taker': taker,
                    'precision': {
                        'amount': this.safeInteger (market, 'trade_currency_decimals'),
                        'price': this.safeInteger (market, 'base_currency_decimals'),
                    },
                    'limits': {
                        'amount': {
                            'min': this.safeFloat (market, 'minimum_quantity_offer'),
                            'max': undefined,
                        },
                        'price': {
                            'min': this.safeFloat (market, 'minimum_price_offer'),
                            'max': undefined,
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                });
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances ();
        let balances = response['balances'];
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currency = balance['currency'];
            let free = balance['trading_balance'];
            let total = balance['balance'];
            let used = total - free;
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetFundsIdOrderbook (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        let timestamp = this.parse8601 (orderbook['date']);
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (ticker['date']);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
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
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'close'), // previous day close, if any
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_traded'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetFundsTickers (params);
        let tickers = this.indexBy (response['tickers'], 'fund_id');
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetFundsIdTicker (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        if (!market)
            market = this.markets_by_id[trade['fund_id']];
        let timestamp = this.parse8601 (trade['date']);
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['side'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetFundsIdTrades (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market')
            price = 0;
        let response = await this.privatePostFundsFundIdOrders (this.extend ({
            'fund_id': this.marketId (symbol),
            'side': side,
            'amount': amount,
            'price': price,
        }, params));
        return {
            'info': response,
            'id': response['id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteFundsFundIdOrdersId (this.extend ({
            'id': id,
            'fund_id': this.marketId (symbol),
        }, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = nonce + url;
            headers = {
                'X-TRT-KEY': this.apiKey,
                'X-TRT-NONCE': nonce,
                'X-TRT-SIGN': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
            if (Object.keys (query).length) {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('errors' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
