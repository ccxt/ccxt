'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, PermissionDenied, AddressPending } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'uex',
            'name': 'UEX',
            'countries': [ 'SG', 'US' ],
            'version': 'v1.0.3',
            'rateLimit': 1500,
            'certified': true,
            // new metainfo interface
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15m',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': 'https://open-api.uex.com/open/api',
                'www': 'https://www.uex.com',
                'doc': 'https://download.uex.com/doc/UEX-API-English-1.0.3.pdf',
                'fees': 'https://www.uex.com/footer/ufees.html',
                'referral': 'https://www.uex.com/signup.html?code=VAGQLL',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbols',
                        'get_records', // ohlcvs
                        'get_ticker',
                        'get_trades',
                        'market_dept', // dept here is not a typo... they mean depth
                    ],
                },
                'private': {
                    'get': [
                        'user/account',
                        'market', // Docs: Get the latest transaction price of each currency pair (??)
                        'order_info',
                        'new_order', // open orders
                        'all_order',
                        'all_trade',
                    ],
                    'post': [
                        'create_order',
                        'cancel_order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.002,
                        'POT': 0.002,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'VTC': 0,
                        'PPC': 0,
                        'FTC': 0,
                        'RDD': 0,
                        'NXT': 0,
                        'DASH': 0,
                        'POT': 0,
                    },
                },
            },
            'exceptions': {
                // // 'Call to Cancel was throttled. Try again in 60 seconds.': DDoSProtection,
                // // 'Call to GetBalances was throttled. Try again in 60 seconds.': DDoSProtection,
                // 'APISIGN_NOT_PROVIDED': AuthenticationError,
                // 'INVALID_SIGNATURE': AuthenticationError,
                // 'INVALID_CURRENCY': ExchangeError,
                // 'INVALID_PERMISSION': AuthenticationError,
                // 'INSUFFICIENT_FUNDS': InsufficientFunds,
                // 'QUANTITY_NOT_PROVIDED': InvalidOrder,
                // 'MIN_TRADE_REQUIREMENT_NOT_MET': InvalidOrder,
                // 'ORDER_NOT_OPEN': OrderNotFound,
                // 'INVALID_ORDER': InvalidOrder,
                // 'UUID_INVALID': OrderNotFound,
                // 'RATE_NOT_PROVIDED': InvalidOrder, // createLimitBuyOrder ('ETH/BTC', 1, 0)
                // 'WHITELIST_VIOLATION_IP': PermissionDenied,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
                'countryCode': true,
                'phoneNumber': true,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetCommonSymbols ();
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: [ {           symbol: "btcusdt",
        //                       count_coin: "usdt",
        //                 amount_precision:  3,
        //                        base_coin: "btc",
        //                  price_precision:  2         },
        //               {           symbol: "ethusdt",
        //                       count_coin: "usdt",
        //                 amount_precision:  3,
        //                        base_coin: "eth",
        //                  price_precision:  2         },
        //               {           symbol: "ethbtc",
        //                       count_coin: "btc",
        //                 amount_precision:  3,
        //                        base_coin: "eth",
        //                  price_precision:  6        },
        //
        let result = [];
        let markets = response['data'];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let baseId = market['base_coin'];
            let quoteId = market['count_coin'];
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['amount_precision'],
                'price': market['price_precision'],
            };
            let active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
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
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserAccount (params);
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { total_asset:   "0.00000000",
        //                 coin_list: [ {      normal: "0.00000000",
        //                                btcValuatin: "0.00000000",
        //                                     locked: "0.00000000",
        //                                       coin: "usdt"        },
        //                              {      normal: "0.00000000",
        //                                btcValuatin: "0.00000000",
        //                                     locked: "0.00000000",
        //                                       coin: "btc"         },
        //                              {      normal: "0.00000000",
        //                                btcValuatin: "0.00000000",
        //                                     locked: "0.00000000",
        //                                       coin: "eth"         },
        //                              {      normal: "0.00000000",
        //                                btcValuatin: "0.00000000",
        //                                     locked: "0.00000000",
        //                                       coin: "ren"         },
        //
        let balances = response['data']['coin_list'];
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['coin'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            let free = parseFloat (balance['normal']);
            let used = parseFloat (balance['locked']);
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketDept (this.extend ({
            'symbol': this.marketId (symbol),
            'type': 'step0', // step1, step2 from most detailed to least detailed
        }, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { tick: { asks: [ ["0.05824200", 9.77],
        //                               ["0.05830000", 7.81],
        //                               ["0.05832900", 8.59],
        //                               ["0.10000000", 0.001]  ],
        //                       bids: [ ["0.05780000", 8.25],
        //                               ["0.05775000", 8.12],
        //                               ["0.05773200", 8.57],
        //                               ["0.00010000", 0.79]   ],
        //                       time:    1533412622463            } } }
        //
        return this.parseOrderBook (response['data']['tick'], response['data']['time']);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { symbol: "ETHBTC",
        //                 high:  0.058426,
        //                  vol:  19055.875,
        //                 last:  0.058019,
        //                  low:  0.055802,
        //               change:  0.03437271,
        //                  buy: "0.05780000",
        //                 sell: "0.05824200",
        //                 time:  1533413083184 } }
        //
        let timestamp = this.safeInteger (ticker, 'time');
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (ticker, 'symbol');
            marketId = marketId.toLowerCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let last = this.safeFloat (ticker, 'last');
        let change = this.safeFloat (ticker, 'change');
        let percentage = change * 100;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { symbol: "ETHBTC",
        //                 high:  0.058426,
        //                  vol:  19055.875,
        //                 last:  0.058019,
        //                  low:  0.055802,
        //               change:  0.03437271,
        //                  buy: "0.05780000",
        //                 sell: "0.05824200",
        //                 time:  1533413083184 } }
        //
        return this.parseTicker (response['data'], market);
    }

    parseTrade (trade, market = undefined) {
        //
        //   {      amount:  0.88,
        //     create_time:  1533414358000,
        //           price:  0.058019,
        //              id:  406531,
        //            type: "sell"          },
        //
        let timestamp = this.safeInteger (trade, 'create_time');
        let side = this.safeString (trade, 'type');
        let id = this.safeString (trade, 'id');
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        }
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (typeof amount !== 'undefined') {
            if (typeof price !== 'undefined') {
                cost = amount * price;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetGetTrades (this.extend ({
            'symbol': market['id'],
        }, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: [ {      amount:  0.88,
        //                 create_time:  1533414358000,
        //                       price:  0.058019,
        //                          id:  406531,
        //                        type: "sell"          },
        //               {      amount:  4.88,
        //                 create_time:  1533414331000,
        //                       price:  0.058019,
        //                          id:  406530,
        //                        type: "buy"           },
        //               {      amount:  0.5,
        //                 create_time:  1533414311000,
        //                       price:  0.058019,
        //                          id:  406529,
        //                        type: "sell"          },
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000, // timestamp
            ohlcv[1], // open
            ohlcv[2], // high
            ohlcv[3], // low
            ohlcv[4], // close
            ohlcv[5], // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe], // in minutes
        };
        let response = await this.publicGetGetRecords (this.extend (request, params));
        //
        //     { code: '0',
        //        msg: 'suc',
        //       data:
        //        [ [ 1533402420, 0.057833, 0.057833, 0.057833, 0.057833, 18.1 ],
        //          [ 1533402480, 0.057833, 0.057833, 0.057833, 0.057833, 29.88 ],
        //          [ 1533402540, 0.057833, 0.057833, 0.057833, 0.057833, 29.06 ],
        //
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.marketGetOpenorders (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'marketGet' + this.capitalize (side) + type;
        let order = {
            'market': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        // if (type == 'limit')
        //     order['rate'] = this.priceToPrecision (symbol, price);
        let response = await this[method] (this.extend (order, params));
        let orderIdField = this.getOrderIdField ();
        let result = {
            'info': response,
            'id': response['result'][orderIdField],
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
        };
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'order_id': id,
            'symbol': market['id'],
        };
        let response = await this.pivatePostCancelOrder (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'OrderType');
        if (typeof side === 'undefined')
            side = this.safeString (order, 'Type');
        let isBuyOrder = (side === 'LIMIT_BUY') || (side === 'BUY');
        let isSellOrder = (side === 'LIMIT_SELL') || (side === 'SELL');
        if (isBuyOrder) {
            side = 'buy';
        }
        if (isSellOrder) {
            side = 'sell';
        }
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (('Opened' in order) && order['Opened'])
            status = 'open';
        if (('Closed' in order) && order['Closed'])
            status = 'closed';
        if (('CancelInitiated' in order) && order['CancelInitiated'])
            status = 'canceled';
        if (('Status' in order) && this.options['parseOrderStatus'])
            status = this.parseOrderStatus (order['Status']);
        let symbol = undefined;
        if ('Exchange' in order) {
            let marketId = order['Exchange'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (typeof market !== 'undefined') {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('Opened' in order)
            timestamp = this.parse8601 (order['Opened'] + '+00:00');
        if ('Created' in order)
            timestamp = this.parse8601 (order['Created'] + '+00:00');
        let lastTradeTimestamp = undefined;
        if (('TimeStamp' in order) && (typeof order['TimeStamp'] !== 'undefined'))
            lastTradeTimestamp = this.parse8601 (order['TimeStamp'] + '+00:00');
        if (('Closed' in order) && (typeof order['Closed'] !== 'undefined'))
            lastTradeTimestamp = this.parse8601 (order['Closed'] + '+00:00');
        if (typeof timestamp === 'undefined')
            timestamp = lastTradeTimestamp;
        let iso8601 = (typeof timestamp !== 'undefined') ? this.iso8601 (timestamp) : undefined;
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': parseFloat (order[commission]),
            };
            if (typeof market !== 'undefined') {
                fee['currency'] = market['quote'];
            } else if (typeof symbol !== 'undefined') {
                let currencyIds = symbol.split ('/');
                let quoteCurrencyId = currencyIds[1];
                if (quoteCurrencyId in this.currencies_by_id)
                    fee['currency'] = this.currencies_by_id[quoteCurrencyId]['code'];
                else
                    fee['currency'] = this.commonCurrencyCode (quoteCurrencyId);
            }
        }
        let price = this.safeFloat (order, 'Limit');
        let cost = this.safeFloat (order, 'Price');
        let amount = this.safeFloat (order, 'Quantity');
        let remaining = this.safeFloat (order, 'QuantityRemaining');
        let filled = undefined;
        if (typeof amount !== 'undefined' && typeof remaining !== 'undefined') {
            filled = amount - remaining;
        }
        if (!cost) {
            if (price && filled)
                cost = price * filled;
        }
        if (!price) {
            if (cost && filled)
                price = cost / filled;
        }
        let average = this.safeFloat (order, 'PricePerUnit');
        let id = this.safeString (order, 'OrderUuid');
        if (typeof id === 'undefined')
            id = this.safeString (order, 'OrderId');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let orderIdField = this.getOrderIdField ();
            let request = {};
            request[orderIdField] = id;
            response = await this.accountGetOrder (this.extend (request, params));
        } catch (e) {
            if (this.last_json_response) {
                let message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID')
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
            }
            throw e;
        }
        if (!response['result']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['result']);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.accountGetOrderhistory (this.extend (request, params));
        let orders = this.parseOrders (response['result'], market, since, limit);
        if (typeof symbol !== 'undefined')
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.accountGetDepositaddress (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response['result'], 'Address');
        let message = this.safeString (response, 'message');
        if (!address || message === 'ADDRESS_GENERATING')
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        let tag = undefined;
        if ((code === 'XRP') || (code === 'XLM')) {
            tag = address;
            address = currency['address'];
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
        let currency = this.currency (code);
        let request = {
            'currency': currency['id'],
            'quantity': amount,
            'address': address,
        };
        if (tag)
            request['paymentid'] = tag;
        let response = await this.accountGetWithdraw (this.extend (request, params));
        let id = undefined;
        if ('result' in response) {
            if ('uuid' in response['result'])
                id = response['result']['uuid'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined') {
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            // pageSize optional page size
            // page optional page number
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined') {
            request['pageSize'] = limit;
        }
        let response = await this.privateGetAllTrade (this.extend (request, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: {      count:    0,
        //               resultList: [ {     volume: "1.000",
        //                                     side: "BUY",
        //                                  feeCoin: "YLB",
        //                                    price: "0.10000000",
        //                                      fee: "0.16431104",
        //                                    ctime:  1510996571195,
        //                               deal_price: "0.10000000",
        //                                       id:  306,
        //                                     type: "Buy-in"        } ] } }
        //
        let trades = this.safeValue (response['data'], 'resultList', []);
        return this.parseTrades (trades, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let timestamp = this.seconds ().toString ();
            let auth = '';
            let query = this.keysort (this.extend (params, {
                'api_key': this.apiKey,
                'time': timestamp,
            }));
            let keys = Object.keys (query);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                auth += key;
                auth += query[key].toString ();
            }
            let signature = this.hash (this.encode (auth + this.secret));
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query) + '&sign=' + signature;
            } else {
                url += '?sign=' + signature;
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            //
            // {"code":"0","msg":"suc","data":[{"
            //
            const code = this.safeString (response, 'code');
            // const message = this.safeString (response, 'msg');
            const feedback = this.id + ' ' + this.json (response);
            const exceptions = this.exceptions;
            if (code !== '0') {
                if (code in exceptions) {
                    throw new exceptions[code] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
