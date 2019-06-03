'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

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
                'fetchMyTrades': true,
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

    async fetchMarkets (params = {}) {
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
                taker = taker / 100;
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
        //
        // fetchTrades
        //
        //     {      id:  4493548,
        //       fund_id: "ETHBTC",
        //        amount:  0.203,
        //         price:  0.02783576,
        //          side: "buy",
        //          dark:  false,
        //          date: "2018-11-30T08:19:18.236Z" }
        //
        // fetchMyTrades
        //
        //     {           id:    237338,
        //            fund_id:   "BTCEUR",
        //             amount:    0.348,
        //              price:    348,
        //               side:   "sell",
        //               dark:    false,
        //           order_id:    14920648,
        //               date:   "2015-06-03T00:49:49.000Z",
        //       transactions: [ {       id:  2770768,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "sold_currency_to_fund",
        //                            price:  121.1,
        //                         currency: "EUR"                       },
        //                       {       id:  2770769,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "released_currency_to_fund",
        //                            price:  0.348,
        //                         currency: "BTC"                        },
        //                       {       id:  2770772,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "paid_commission",
        //                            price:  0.06,
        //                         currency: "EUR",
        //                         trade_id:  440492                     }   ] }
        //
        if (!market)
            market = this.markets_by_id[trade['fund_id']];
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const side = this.safeString (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let fee = undefined;
        let feeCost = undefined;
        const transactions = this.safeValue (trade, 'transactions', []);
        const transactionsByType = this.groupBy (transactions, 'type');
        const feeTransactions = this.safeValue (transactionsByType, 'paid_commission', []);
        for (let i = 0; i < feeTransactions.length; i++) {
            if (feeCost === undefined) {
                feeCost = 0;
            }
            feeCost = this.sum (feeCost, this.safeFloat (feeTransactions[i], 'price'));
        }
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': market['quote'],
            };
        }
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return this._fetchTransactions ('withdraw', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return this._fetchTransactions ('atm_payment', code, since, limit, params);
    }

    async _fetchTransactions (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        // types:
        //     'affiliate_earnings'
        //     'returned_lent_currency'
        //     'the_rock_assessment'
        //     'sold_shares'
        //     'transfer_received'
        //     'dividend_from_shares'
        //     'insurances_reimbursement'
        //     'pos_payment'
        //     'paypal_payment'
        //     'exposed_position'
        //     'return_lent_currency'
        //     'lent_currency'
        //     'transfer_sent'
        //     'linden_lab_assessment'
        //     'position_transfer_received'
        //     'dividend_distributed_to_holders'
        //     'bought_shares'
        //     'acquired_insurance'
        //     'rollover_commission'
        //     'acquired_currency_from_fund'
        //     'paid_commission'
        //     'withdraw'
        //     'released_currency_to_fund'
        //     'atm_payment'
        //     'sold_currency_to_fund'
        //     'bought_currency_from_fund'
        const request = {
            'after': since,
            'type': type,
        };
        if (code) {
            request['currency'] = this.currencyId (code);
        }
        const types = {
            'withdraw': 'withdrawal',
            'atm_payment': 'deposit',
        };
        const response = await this.privateGetTransactions (this.extend (request, params));
        const items = response['transactions'];
        const result = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // fiat deposit:
            //   { id: 16176632,
            //     date: '2017-11-20T21:00:13.355Z',
            //     type: 'atm_payment',
            //     price: 5000,
            //     currency: 'EUR',
            //     fund_id: null,
            //     order_id: null,
            //     trade_id: null,
            //     note: 'Mistral deposit',
            //     transfer_detail:
            //     { method: 'wire_transfer',
            //         id: '972JQ49337DX769T',
            //         recipient: null,
            //         confirmations: 0 } }
            //
            // crypto deposit
            //   { id: 12320397,
            //     date: '2017-08-01T14:12:32.583Z',
            //     type: 'atm_payment',
            //     price: 0.01744831,
            //     currency: 'BCH',
            //     fund_id: null,
            //     order_id: null,
            //     trade_id: null,
            //     note: null,
            //     transfer_detail: null }
            //
            // fiat withdrawal
            //   { id: 14512143,
            //     date: '2017-09-28T08:22:21.369Z',
            //     type: 'withdraw',
            //     price: 2946.1,
            //     currency: 'USD',
            //     fund_id: null,
            //     order_id: null,
            //     trade_id: null,
            //     note: '9120474235',
            //     transfer_detail: null }
            //
            // crypto withdrawal
            //   { id: 20914695,
            //     date: '2018-02-24T07:13:23.002Z',
            //     type: 'withdraw',
            //     price: 2.70883607,
            //     currency: 'BCH',
            //     fund_id: null,
            //     order_id: null,
            //     trade_id: null,
            //     note: '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm',
            //     transfer_detail:
            //       { method: 'bitcoin_cash',
            //         id: '8261949194985b01985006724dca5d6059989e096fa95608271d00dd902327fa',
            //         recipient: '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm',
            //         confirmations: 0 } }
            const type = this.safeString (item, 'type');
            const date = this.safeString (item, 'date');
            const currency = this.safeString (item, 'currency');
            const timestamp = this.parse8601 (date);
            let address = undefined;
            let tag = undefined;
            let txid = undefined;
            const transferDetail = item['transfer_detail'];
            if (transferDetail) {
                address = this.safeString (transferDetail, 'recipient');
                txid = this.safeString (transferDetail, 'id');
            }
            result.push ({
                'id': this.safeString (item, 'id'),
                'type': this.safeValue (types, type, type),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'amount': this.safeFloat (item, 'price'),
                'currency': this.commonCurrencyCode (currency),
                'txid': txid,
                'address': address,
                'tag': tag,
                'info': item,
            });
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'fund_id': market['id'],
        };
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.privateGetFundsFundIdOrders (this.extend (request, params));
        //   { orders:
        //     [ { id: 299333648,
        //         fund_id: 'BTCEUR',
        //         side: 'sell',
        //         type: 'limit',
        //         status: 'executed',
        //         price: 5821,
        //         amount: 0.1,
        //         amount_unfilled: 0,
        //         conditional_type: null,
        //         conditional_price: null,
        //         date: '2018-06-18T17:38:16.129Z',
        //         close_on: null,
        //         dark: false,
        //         leverage: 1,
        //         position_id: 0 },...
        //
        const result = [];
        const items = response['orders'];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const marketId = this.safeString (item, 'fund_id');
            const timestamp = this.parse8601 (this.safeString (item, 'date'));
            let status = this.safeString (item, 'status');
            if (status === 'executed')
                status = 'closed';
            else if (status === 'active')
                status = 'open';
            const amount = this.safeFloat (item, 'amount');
            const unfilled = this.safeFloat (item, 'amount_unfilled');
            const filled = amount - unfilled;
            result.push ({
                'id': this.safeString (item, 'id'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'side': this.safeString (item, 'side'),
                'type': this.safeString (item, 'type'),
                'price': this.safeFloat (item, 'price'),
                'amount': amount,
                'remaining': unfilled,
                'filled': filled,
                'status': status,
                'symbol': this.findSymbol (marketId),
                'info': item,
            });
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['per_page'] = limit; // default 25 max 200
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.privateGetFundsIdTrades (this.extend (request, params));
        //
        //     { trades: [ {           id:    237338,
        //                        fund_id:   "BTCEUR",
        //                         amount:    0.348,
        //                          price:    348,
        //                           side:   "sell",
        //                           dark:    false,
        //                       order_id:    14920648,
        //                           date:   "2015-06-03T00:49:49.000Z",
        //                   transactions: [ {       id:  2770768,
        //                                         date: "2015-06-03T00:49:49.000Z",
        //                                         type: "sold_currency_to_fund",
        //                                        price:  121.1,
        //                                     currency: "EUR"                       },
        //                                   {       id:  2770769,
        //                                         date: "2015-06-03T00:49:49.000Z",
        //                                         type: "released_currency_to_fund",
        //                                        price:  0.348,
        //                                     currency: "BTC"                        },
        //                                   {       id:  2770772,
        //                                         date: "2015-06-03T00:49:49.000Z",
        //                                         type: "paid_commission",
        //                                        price:  0.06,
        //                                     currency: "EUR",
        //                                     trade_id:  440492                     }   ] } ],
        //         meta: { total_count:    31,
        //                       first: { href: "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=1" },
        //                    previous:    null,
        //                     current: { href: "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=1" },
        //                        next: { href: "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=2" },
        //                        last: { href: "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=2" }  } }
        //
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['per_page'] = limit; // default 25 max 200
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.publicGetFundsIdTrades (this.extend (request, params));
        //
        //     { trades: [ {      id:  4493548,
        //                   fund_id: "ETHBTC",
        //                    amount:  0.203,
        //                     price:  0.02783576,
        //                      side: "buy",
        //                      dark:  false,
        //                      date: "2018-11-30T08:19:18.236Z" },
        //                 {      id:  4492926,
        //                   fund_id: "ETHBTC",
        //                    amount:  0.04,
        //                     price:  0.02767034,
        //                      side: "buy",
        //                      dark:  false,
        //                      date: "2018-11-30T07:03:03.897Z" }  ],
        //         meta: { total_count:    null,
        //                       first: { page:  1,
        //                                href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=1" },
        //                    previous:    null,
        //                     current: { page:  1,
        //                                href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=1" },
        //                        next: { page:  2,
        //                                href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=2" },
        //                        last:    null                                                                   } }
        //
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

    parseOrderStatus (status) {
        const statuses = {
            'active': 'open',
            'executed': 'closed',
            'deleted': 'canceled',
            // don't know what this status means
            // 'conditional': '?',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (Object.keys (query).length) {
                if (method === 'post') {
                    body = this.json (query);
                    headers['Content-Type'] = 'application/json';
                } else {
                    const queryString = this.rawencode (query);
                    if (queryString.length)
                        url += '?' + queryString;
                }
            }
            let nonce = this.nonce ().toString ();
            let auth = nonce + url;
            headers = {
                'X-TRT-KEY': this.apiKey,
                'X-TRT-NONCE': nonce,
                'X-TRT-SIGN': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
        } else if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.rawencode (query);
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
