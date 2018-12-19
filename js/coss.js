'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coss extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coss',
            'name': 'COSS',
            'country': [ 'SG', 'NL' ],
            'rateLimit': 1000,
            'version': 'v1',
            'comment': 'Certified exchange',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/50185321-88c99c00-0328-11e9-8bc1-0ce1f7606ef3.jpg',
                'api': {
                    'trade': 'https://trade.coss.io/c/api/v1',
                    'engine': 'https://engine.coss.io/api/v1',
                    'public': 'https://trade.coss.io/c/api/v1',
                    'web': 'https://trade.coss.io/c', // undocumented
                },
                'www': 'https://www.coss.io',
                'doc': 'https://api.coss.io/v1/spec',
            },
            'has': {
                'fetchTrades': false, // temporarily
                'fetchTicker': false, // temporarily
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchOHLCV': true,
                'createOrder': true,
                'cancelOrder': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarketsummaries', // broken on COSS's end
                        'market-price',
                        'exchange-info',
                    ],
                },
                'web': {
                    'get': [
                        'coins/getinfo/all', // undocumented
                        'order/symbols', // undocumented
                        'coins/get_base_list', // undocumented
                    ],
                },
                'engine': {
                    'get': [
                        'dp',
                        'ht',
                        'cs',
                    ],
                },
                'trade': {
                    'get': [
                        'account/balances',
                        'account/details',
                    ],
                    'post': [
                        'order/add',
                        'order/details',
                        'order/list/open',
                        'order/list/completed',
                        'order/list/all',
                    ],
                    'delete': [
                        'order/cancel',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeInfo (params);
        //
        //     {        timezone:   "UTC",
        //           server_time:    1545171487108,
        //           rate_limits: [ {     type: "REQUESTS",
        //                            interval: "MINUTE",
        //                               limit:  1000       } ],
        //       base_currencies: [ { currency_code: "BTC", minimum_total_order: "0.0001" },
        //                          { currency_code: "USDT", minimum_total_order: "1" },
        //                          { currency_code: "EUR", minimum_total_order: "1" } ],
        //                 coins: [ {        currency_code: "ADI",
        //                                            name: "Aditus",
        //                            minimum_order_amount: "0.00000001" },
        //                          ...
        //                          {        currency_code: "NPXSXEM",
        //                                            name: "PundiX-XEM",
        //                            minimum_order_amount: "0.00000001"  }                ],
        //               symbols: [ {               symbol: "ADI_BTC",
        //                            amount_limit_decimal:  0,
        //                             price_limit_decimal:  8,
        //                                   allow_trading:  true      },
        //                          ...
        //                          {               symbol: "ETH_GUSD",
        //                            amount_limit_decimal:  5,
        //                             price_limit_decimal:  3,
        //                                   allow_trading:  true       }     ]               }
        //
        const result = [];
        const markets = this.safeValue (response, 'symbols', []);
        const baseCurrencies = this.safeValue (response, 'base_currencies', []);
        const baseCurrenciesByIds = this.indexBy (baseCurrencies, 'currency_code');
        const currencies = this.safeValue (response, 'coins', []);
        const currenciesByIds = this.indexBy (currencies, 'currency_code');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = market['symbol'];
            const [ baseId, quoteId ] = marketId.split ('_');
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_limit_decimal'),
                'price': this.safeInteger (market, 'price_limit_decimal'),
            };
            const active = this.safeValue (market, 'allow_trading', false);
            const baseCurrency = this.safeValue (baseCurrenciesByIds, baseId, {});
            const minCost = this.safeFloat (baseCurrency, 'minimum_total_order');
            const currency = this.safeValue (currenciesByIds, baseId, {});
            const defaultMinAmount = Math.pow (10, -precision['amount']);
            const minAmount = this.safeFloat (currency, 'minimum_order_amount', defaultMinAmount);
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.webGetCoinsGetinfoAll (params);
        //
        //     [ {                 currency_code: "VET",
        //                                  name: "VeChain",
        //                             buy_limit:  0,
        //                            sell_limit:  0,
        //                                  usdt:  0,
        //                transaction_time_limit:  5,
        //                                status: "trade",
        //                         withdrawn_fee: "0.6",
        //              minimum_withdrawn_amount: "1.2",
        //                minimum_deposit_amount: "0.6",
        //                  minimum_order_amount: "0.00000001",
        //                        decimal_format: "0.########",
        //                            token_type:  null, // "erc", "eos", "stellar", "tron", "ripple"...
        //                                buy_at:  0,
        //                               sell_at:  0,
        //                              min_rate:  0,
        //                              max_rate:  0,
        //                       allow_withdrawn:  false,
        //                         allow_deposit:  false,
        //         explorer_website_mainnet_link:  null,
        //         explorer_website_testnet_link:  null,
        //            deposit_block_confirmation: "6",
        //           withdraw_block_confirmation: "0",
        //                              icon_url: "https://s2.coinmarketcap.com/static/img/coins/32x32/3077.png",
        //                               is_fiat:  false,
        //                            allow_sell:  true,
        //                             allow_buy:  true                                                           }]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const currencyId = this.safeString (currency, 'currency_code');
            const code = this.commonCurrencyCode (currencyId);
            const name = this.safeString (currency, 'name');
            const allowBuy = this.safeValue (currency, 'allow_buy');
            const allowSell = this.safeValue (currency, 'allow_sell');
            const allowWithdrawals = this.safeValue (currency, 'allow_withdrawn');
            const allowDeposits = this.safeValue (currency, 'allow_deposit');
            const active = allowBuy && allowSell && allowWithdrawals && allowDeposits;
            const fee = this.safeFloat (currency, 'withdrawn_fee');
            const type = this.safeString (currency, 'token_type');
            //
            // decimal_format can be anything...
            //
            //     0.########
            //     #.########
            //     0.##
            //     '' (empty string)
            //     0.000000
            //     null (undefined)
            //     0.0000
            //     0.###
            //
            const decimalFormat = this.safeString (currency, 'decimal_format');
            let precision = 8;
            if (decimalFormat !== undefined) {
                const parts = decimalFormat.split ('.');
                const numParts = parts.length; // transpiler workaround for array lengths
                if (numParts > 1) {
                    const decimalPart = parts[1];
                    const decimalsParts = decimalPart.split ('');
                    const numDecimalParts = decimalsParts.length;
                    if (numDecimalParts > 1) {
                        precision = numDecimalParts;
                    }
                }
            }
            result[code] = {
                'id': currencyId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'type': type,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minimum_order_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimum_withdrawn_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.tradeGetAccountBalances ();
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let info = response[i];
            let currencyId = info['currency_code'];
            let code = this.currencies_by_id[currencyId]['code'];
            let total = this.safeFloat (info, 'total');
            let used = this.safeFloat (info, 'in_order');
            let free = this.safeFloat (info, 'available');
            result[code] = {
                'total': total,
                'used': used,
                'free': free,
            };
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv[0]),   // timestamp
            parseFloat (ohlcv[1]), // Open
            parseFloat (ohlcv[2]), // High
            parseFloat (ohlcv[3]), // Low
            parseFloat (ohlcv[4]), // Close
            parseFloat (ohlcv[5]), // base Volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'tt': this.timeframes[timeframe],
        };
        let response = await this.engineGetCs (this.extend (request, params));
        //
        //     {       tt:   "1m",
        //         symbol:   "ETH_BTC",
        //       nextTime:    1545138960000,
        //         series: [ [  1545138960000,
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.02705000",
        //                     "0.00000000"    ],
        //                   ...
        //                   [  1545168900000,
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.02684000",
        //                     "0.00000000"    ]  ],
        //          limit:    500                    }
        //
        return this.parseOHLCVs (response['series'], market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let response = await this.engineGetDp (this.extend ({ 'symbol': marketId }, params));
        let timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderListAll (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        // returns partial fills also
        let response = await this.tradePostOrderListCompleted (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        let orders = this.parseOrders (response['list'], market, since, limit);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 10, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a symbol parameter to fetchOrders');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderListOpen (this.extend ({
            'symbol': marketId,
            'timestamp': this.nonce (),
            'limit': limit,
        }, params));
        return this.parseOrders (response['list'], market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.tradePostOrderDetails (this.extend ({
            'timestamp': this.nonce (),
            'order_id': id,
        }));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        let statuses = {
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'FILLED': 'closed',
            'PARTIAL_FILL': 'open',
            'CANCELLING': 'open',
        };
        return this.safeString (statuses, status.toUpperCase ());
    }

    parseOrder (order, market = undefined) {
        let symbol = this.markets_by_id[order['order_symbol']]['symbol'];
        let timestamp = this.safeInteger (order, 'createTime');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let price = this.safeFloat (order, 'order_price');
        let filled = this.safeFloat (order, 'executed');
        let type = this.safeString (order, 'type');
        let amount = this.safeFloat (order, 'order_size');
        let average = this.safeFloat (order, 'avg');
        let side = this.safeString (order, 'order_side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let cost = this.safeFloat (order, 'total');
        return {
            'id': this.safeString (order, 'order_id'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': status,
            'price': price,
            'filled': filled,
            'remaining': amount - filled,
            'type': type,
            'average': average,
            'side': side,
            'cost': cost,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['id'];
        let response = await this.tradePostOrderAdd (this.extend ({
            'order_symbol': marketId,
            'order_price': this.priceToPrecision (symbol, price),
            'order_size': this.amountToPrecision (symbol, amount),
            'order_side': side.toUpperCase (),
            'type': type,
            'timestamp': this.nonce (),
        }, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.tradeDeleteOrderCancel (this.extend ({
            'timestamp': this.nonce (),
            'order_id': id,
        }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'public' || api === 'engine' || api === 'web') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (params).length > 0) {
                    url = url + '&' + this.urlencode (params);
                }
                if (path.indexOf ('account') >= 0) {
                    const requestParams = { 'recvWindow': '10000', 'timestamp': this.nonce () };
                    const request = this.implodeParams ('recvWindow={recvWindow}&timestamp={timestamp}', requestParams);
                    url = url + '?' + request;
                    headers = {
                        'Signature': this.hmac (request, this.secret),
                        'Authorization': this.apiKey,
                    };
                }
            } else {
                body = this.json (params);
                headers = {
                    'Signature': this.hmac (body, this.secret),
                    'Authorization': this.apiKey,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
