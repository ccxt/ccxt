'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InvalidAddress, InsufficientFunds, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class uex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'uex',
            'name': 'UEX',
            'countries': [ 'SG', 'US' ],
            'version': 'v1.0.3',
            'rateLimit': 1000,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
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
                'logo': 'https://user-images.githubusercontent.com/1294454/43999923-051d9884-9e1f-11e8-965a-76948cb17678.jpg',
                'api': 'https://open-api.uex.com/open/api',
                'www': 'https://www.uex.com',
                'doc': 'https://download.uex.com/doc/UEX-API-English-1.0.3.pdf',
                'fees': 'https://www.uex.com/footer/ufees.html',
                'referral': 'https://www.uex.com/signup.html?code=VAGQLL',
            },
            'api': {
                'public': {
                    'get': [
                        'common/coins', // funding limits
                        'common/symbols',
                        'get_records', // ohlcvs
                        'get_ticker',
                        'get_trades',
                        'market_dept', // dept here is not a typo... they mean depth
                    ],
                },
                'private': {
                    'get': [
                        'deposit_address_list',
                        'withdraw_address_list',
                        'deposit_history',
                        'withdraw_history',
                        'user/account',
                        'market', // an assoc array of market ids to corresponding prices traded most recently (prices of last trades per market)
                        'order_info',
                        'new_order', // a list of currently open orders
                        'all_order',
                        'all_trade',
                    ],
                    'post': [
                        'create_order',
                        'cancel_order',
                        'create_withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0010,
                    'taker': 0.0010,
                },
            },
            'exceptions': {
                // descriptions from ↓ exchange
                // '0': 'no error', // succeed
                '4': InsufficientFunds, // {"code":"4","msg":"余额不足:0E-16","data":null}
                '5': InvalidOrder, // fail to order {"code":"5","msg":"Price fluctuates more than1000.0%","data":null}
                '6': InvalidOrder, // the quantity value less than the minimum one {"code":"6","msg":"数量小于最小值:0.001","data":null}
                '7': InvalidOrder, // the quantity value more than the maximum one {"code":"7","msg":"数量大于最大值:10000","data":null}
                '8': InvalidOrder, // fail to cancel order
                '9': ExchangeError, // transaction be frozen
                '13': ExchangeError, // Sorry, the program made an error, please contact with the manager.
                '19': InsufficientFunds, // Available balance is insufficient.
                '22': OrderNotFound, // The order does not exist. {"code":"22","msg":"not exist order","data":null}
                '23': InvalidOrder, // Lack of parameters of numbers of transaction
                '24': InvalidOrder, // Lack of parameters of transaction price
                '100001': ExchangeError, // System is abnormal
                '100002': ExchangeNotAvailable, // Update System
                '100004': ExchangeError, // {"code":"100004","msg":"request parameter illegal","data":null}
                '100005': AuthenticationError, // {"code":"100005","msg":"request sign illegal","data":null}
                '100007': PermissionDenied, // illegal IP
                '110002': ExchangeError, // unknown currency code
                '110003': AuthenticationError, // fund password error
                '110004': AuthenticationError, // fund password error
                '110005': InsufficientFunds, // Available balance is insufficient.
                '110020': AuthenticationError, // Username does not exist.
                '110023': AuthenticationError, // Phone number is registered.
                '110024': AuthenticationError, // Email box is registered.
                '110025': PermissionDenied, // Account is locked by background manager
                '110032': PermissionDenied, // The user has no authority to do this operation.
                '110033': ExchangeError, // fail to recharge
                '110034': ExchangeError, // fail to withdraw
                '-100': ExchangeError, // {"code":"-100","msg":"Your request path is not exist or you can try method GET/POST.","data":null}
                '-1000': ExchangeNotAvailable, // {"msg":"System maintenance!","code":"-1000","data":null}
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'limits': {
                    'BTC/USDT': { 'amount': { 'min': 0.001 }, 'price': { 'min': 0.01 }},
                    'ETH/USDT': { 'amount': { 'min': 0.001 }, 'price': { 'min': 0.01 }},
                    'BCH/USDT': { 'amount': { 'min': 0.001 }, 'price': { 'min': 0.01 }},
                    'ETH/BTC': { 'amount': { 'min': 0.001 }, 'price': { 'min': 0.000001 }},
                    'BCH/BTC': { 'amount': { 'min': 0.001 }, 'price': { 'min': 0.000001 }},
                    'LEEK/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'CTXC/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'COSM/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'MANA/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'LBA/BTC': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'OLT/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'DTA/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'KNT/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'REN/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'LBA/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'EXC/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'ZIL/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'RATING/ETH': { 'amount': { 'min': 100 }, 'price': { 'min': 100 }},
                    'CENNZ/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                    'TTC/ETH': { 'amount': { 'min': 10 }, 'price': { 'min': 10 }},
                },
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.currencyToPrecision (market[key], cost)),
        };
    }

    async fetchMarkets (params = {}) {
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
        //                  price_precision:  6        }]}
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
            let defaultLimits = this.safeValue (this.options['limits'], symbol, {});
            let limits = this.deepExtend ({
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
            }, defaultLimits);
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
                'limits': limits,
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
        //                                       coin: "ren"         }]}}
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
        let timestamp = this.safeInteger (response['data']['tick'], 'time');
        return this.parseOrderBook (response['data']['tick'], timestamp);
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
        if (market === undefined) {
            let marketId = this.safeString (ticker, 'symbol');
            marketId = marketId.toLowerCase ();
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
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
        // public fetchTrades
        //
        //   {      amount:  0.88,
        //     create_time:  1533414358000,
        //           price:  0.058019,
        //              id:  406531,
        //            type: "sell"          },
        //
        // private fetchMyTrades, fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //   {     volume: "0.010",
        //           side: "SELL",
        //        feeCoin: "BTC",
        //          price: "0.05816200",
        //            fee: "0.00000029",
        //          ctime:  1533616674000,
        //     deal_price: "0.00058162",
        //             id:  415779,
        //           type: "卖出",
        //         bid_id:  3669539, // only in fetchMyTrades
        //         ask_id:  3669583, // only in fetchMyTrades
        //   }
        //
        let timestamp = this.safeInteger2 (trade, 'create_time', 'ctime');
        if (timestamp === undefined) {
            let timestring = this.safeString (trade, 'created_at');
            if (timestring !== undefined) {
                timestamp = this.parse8601 ('2018-' + timestring + ':00Z');
            }
        }
        let side = this.safeString2 (trade, 'side', 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let id = this.safeString (trade, 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat2 (trade, 'volume', 'amount');
        let cost = this.safeFloat (trade, 'deal_price');
        if (cost === undefined) {
            if (amount !== undefined) {
                if (price !== undefined) {
                    cost = amount * price;
                }
            }
        }
        let fee = undefined;
        let feeCost = this.safeFloat2 (trade, 'fee', 'deal_fee');
        if (feeCost !== undefined) {
            let feeCurrency = this.safeString (trade, 'feeCoin');
            if (feeCurrency !== undefined) {
                let currencyId = feeCurrency.toLowerCase ();
                if (currencyId in this.currencies_by_id) {
                    feeCurrency = this.currencies_by_id[currencyId]['code'];
                }
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let orderIdField = (side === 'sell') ? 'ask_id' : 'bid_id';
        let orderId = this.safeString (trade, orderIdField);
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
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
        //                        type: "sell"          } ] }
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
        //          [ 1533402540, 0.057833, 0.057833, 0.057833, 0.057833, 29.06 ] ] }
        //
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        amount = amount * price;
                    }
                }
            }
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderType = (type === 'limit') ? '1' : '2';
        let orderSide = side.toUpperCase ();
        let amountToPrecision = this.amountToPrecision (symbol, amount);
        let request = {
            'side': orderSide,
            'type': orderType,
            'symbol': market['id'],
            'volume': amountToPrecision,
            // An excerpt from their docs:
            // side required Trading Direction
            // type required pending order types，1:Limit-price Delegation 2:Market- price Delegation
            // volume required
            //     Purchase Quantity（polysemy，multiplex field）
            //     type=1: Quantity of buying and selling
            //     type=2: Buying represents gross price, and selling represents total number
            //     Trading restriction user/me-user information
            // price optional Delegation Price：type=2：this parameter is no use.
            // fee_is_user_exchange_coin optional
            //     0，when making transactions with all platform currencies,
            //     this parameter represents whether to use them to pay
            //     fees or not and 0 is no, 1 is yes.
        };
        let priceToPrecision = undefined;
        if (type === 'limit') {
            priceToPrecision = this.priceToPrecision (symbol, price);
            request['price'] = priceToPrecision;
        }
        let response = await this.privatePostCreateOrder (this.extend (request, params));
        //
        //     { code: '0',
        //        msg: 'suc',
        //       data: { 'order_id' : 34343 } }
        //
        let result = this.parseOrder (response['data'], market);
        return this.extend (result, {
            'info': response,
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
            'price': parseFloat (priceToPrecision),
            'amount': parseFloat (amountToPrecision),
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'order_id': id,
            'symbol': market['id'],
        };
        let response = await this.privatePostCancelOrder (this.extend (request, params));
        let order = this.safeValue (response, 'data', {});
        return this.extend (this.parseOrder (order), {
            'id': id,
            'symbol': symbol,
            'status': 'canceled',
        });
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'open', // INIT(0,"primary order，untraded and not enter the market")
            '1': 'open', // NEW_(1,"new order，untraded and enter the market ")
            '2': 'closed', // FILLED(2,"complete deal")
            '3': 'open', // PART_FILLED(3,"partial deal")
            '4': 'canceled', // CANCELED(4,"already withdrawn")
            '5': 'canceled', // PENDING_CANCEL(5,"pending withdrawak")
            '6': 'canceled', // EXPIRED(6,"abnormal orders")
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {"order_id":34343}
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {          side:   "BUY",
        //         total_price:   "0.10000000",
        //          created_at:    1510993841000,
        //           avg_price:   "0.10000000",
        //           countCoin:   "btc",
        //              source:    1,
        //                type:    1,
        //            side_msg:   "买入",
        //              volume:   "1.000",
        //               price:   "0.10000000",
        //          source_msg:   "WEB",
        //          status_msg:   "完全成交",
        //         deal_volume:   "1.00000000",
        //                  id:    424,
        //       remain_volume:   "0.00000000",
        //            baseCoin:   "eth",
        //           tradeList: [ {     volume: "1.000",
        //                             feeCoin: "YLB",
        //                               price: "0.10000000",
        //                                 fee: "0.16431104",
        //                               ctime:  1510996571195,
        //                          deal_price: "0.10000000",
        //                                  id:  306,
        //                                type: "买入"            } ],
        //              status:    2                                 }
        //
        // fetchOrder
        //
        //      { trade_list: [ {     volume: "0.010",
        //                           feeCoin: "BTC",
        //                             price: "0.05816200",
        //                               fee: "0.00000029",
        //                             ctime:  1533616674000,
        //                        deal_price: "0.00058162",
        //                                id:  415779,
        //                              type: "卖出"            } ],
        //        order_info: {          side:   "SELL",
        //                        total_price:   "0.010",
        //                         created_at:    1533616673000,
        //                          avg_price:   "0.05816200",
        //                          countCoin:   "btc",
        //                             source:    3,
        //                               type:    2,
        //                           side_msg:   "卖出",
        //                             volume:   "0.010",
        //                              price:   "0.00000000",
        //                         source_msg:   "API",
        //                         status_msg:   "完全成交",
        //                        deal_volume:   "0.01000000",
        //                                 id:    3669583,
        //                      remain_volume:   "0.00000000",
        //                           baseCoin:   "eth",
        //                          tradeList: [ {     volume: "0.010",
        //                                            feeCoin: "BTC",
        //                                              price: "0.05816200",
        //                                                fee: "0.00000029",
        //                                              ctime:  1533616674000,
        //                                         deal_price: "0.00058162",
        //                                                 id:  415779,
        //                                               type: "卖出"            } ],
        //                             status:    2                                 } }
        //
        let side = this.safeString (order, 'side');
        if (side !== undefined)
            side = side.toLowerCase ();
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            let baseId = this.safeString (order, 'baseCoin');
            let quoteId = this.safeString (order, 'countCoin');
            let marketId = baseId + quoteId;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                if ((baseId !== undefined) && (quoteId !== undefined)) {
                    let base = baseId.toUpperCase ();
                    let quote = quoteId.toUpperCase ();
                    base = this.commonCurrencyCode (base);
                    quote = this.commonCurrencyCode (quote);
                    symbol = base + '/' + quote;
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'created_at');
        if (timestamp === undefined) {
            let timestring = this.safeString (order, 'created_at');
            if (timestring !== undefined) {
                timestamp = this.parse8601 ('2018-' + timestring + ':00Z');
            }
        }
        let lastTradeTimestamp = undefined;
        let fee = undefined;
        let average = this.safeFloat (order, 'avg_price');
        let price = this.safeFloat (order, 'price');
        if (price === 0) {
            price = average;
        }
        let amount = this.safeFloat (order, 'volume');
        let filled = this.safeFloat (order, 'deal_volume');
        let remaining = this.safeFloat (order, 'remain_volume');
        let cost = this.safeFloat (order, 'total_price');
        let id = this.safeString2 (order, 'id', 'order_id');
        let trades = undefined;
        let tradeList = this.safeValue (order, 'tradeList', []);
        let feeCurrencies = {};
        let feeCost = undefined;
        for (let i = 0; i < tradeList.length; i++) {
            let trade = this.parseTrade (tradeList[i], market);
            if (feeCost === undefined) {
                feeCost = 0;
            }
            feeCost = feeCost + trade['fee']['cost'];
            let tradeFeeCurrency = trade['fee']['currency'];
            feeCurrencies[tradeFeeCurrency] = trade['fee']['cost'];
            if (trades === undefined) {
                trades = [];
            }
            lastTradeTimestamp = trade['timestamp'];
            trades.push (this.extend (trade, {
                'order': id,
            }));
        }
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            let keys = Object.keys (feeCurrencies);
            let numCurrencies = keys.length;
            if (numCurrencies === 1) {
                feeCurrency = keys[0];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
            'trades': trades,
        };
        return result;
    }

    async fetchOrdersWithMethod (method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersWithMethod() requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            // pageSize optional page size
            // page optional page number
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let response = await this[method] (this.extend (request, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: {     count:    1,
        //               orderList: [ {          side:   "SELL",
        //                                total_price:   "0.010",
        //                                 created_at:    1533616673000,
        //                                  avg_price:   "0.05816200",
        //                                  countCoin:   "btc",
        //                                     source:    3,
        //                                       type:    2,
        //                                   side_msg:   "卖出",
        //                                     volume:   "0.010",
        //                                      price:   "0.00000000",
        //                                 source_msg:   "API",
        //                                 status_msg:   "完全成交",
        //                                deal_volume:   "0.01000000",
        //                                         id:    3669583,
        //                              remain_volume:   "0.00000000",
        //                                   baseCoin:   "eth",
        //                                  tradeList: [ {     volume: "0.010",
        //                                                    feeCoin: "BTC",
        //                                                      price: "0.05816200",
        //                                                        fee: "0.00000029",
        //                                                      ctime:  1533616674000,
        //                                                 deal_price: "0.00058162",
        //                                                         id:  415779,
        //                                                       type: "卖出"            } ],
        //                                     status:    2                                 } ] } }
        //
        // privateGetNewOrder returns resultList, privateGetAllOrder returns orderList
        let orders = this.safeValue2 (response['data'], 'orderList', 'resultList', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersWithMethod ('privateGetNewOrder', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersWithMethod ('privateGetAllOrder', symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'order_id': id,
            'symbol': market['id'],
        };
        let response = await this.privateGetOrderInfo (this.extend (request, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { trade_list: [ {     volume: "0.010",
        //                                  feeCoin: "BTC",
        //                                    price: "0.05816200",
        //                                      fee: "0.00000029",
        //                                    ctime:  1533616674000,
        //                               deal_price: "0.00058162",
        //                                       id:  415779,
        //                                     type: "卖出"            } ],
        //               order_info: {          side:   "SELL",
        //                               total_price:   "0.010",
        //                                created_at:    1533616673000,
        //                                 avg_price:   "0.05816200",
        //                                 countCoin:   "btc",
        //                                    source:    3,
        //                                      type:    2,
        //                                  side_msg:   "卖出",
        //                                    volume:   "0.010",
        //                                     price:   "0.00000000",
        //                                source_msg:   "API",
        //                                status_msg:   "完全成交",
        //                               deal_volume:   "0.01000000",
        //                                        id:    3669583,
        //                             remain_volume:   "0.00000000",
        //                                  baseCoin:   "eth",
        //                                 tradeList: [ {     volume: "0.010",
        //                                                   feeCoin: "BTC",
        //                                                     price: "0.05816200",
        //                                                       fee: "0.00000029",
        //                                                     ctime:  1533616674000,
        //                                                deal_price: "0.00058162",
        //                                                        id:  415779,
        //                                                      type: "卖出"            } ],
        //                                    status:    2                                 } } }
        //
        return this.parseOrder (response['data']['order_info'], market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            // pageSize optional page size
            // page optional page number
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let response = await this.privateGetAllTrade (this.extend (request, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: {      count:    1,
        //               resultList: [ {     volume: "0.010",
        //                                     side: "SELL",
        //                                  feeCoin: "BTC",
        //                                    price: "0.05816200",
        //                                      fee: "0.00000029",
        //                                    ctime:  1533616674000,
        //                               deal_price: "0.00058162",
        //                                       id:  415779,
        //                                     type: "卖出",
        //                                   bid_id:  3669539,
        //                                   ask_id:  3669583        } ] } }
        //
        let trades = this.safeValue (response['data'], 'resultList', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'coin': currency['id'],
        };
        // https://github.com/UEX-OpenAPI/API_Docs_en/wiki/Query-deposit-address-of-assigned-token
        let response = await this.privateGetDepositAddressList (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": {
        //             "addressList": [
        //                 {
        //                     "address": "0x198803ef8e0df9e8812c0105421885e843e6d2e2",
        //                     "tag": "",
        //                 },
        //             ],
        //         },
        //     }
        //
        let data = this.safeValue (response, 'data');
        if (data === undefined) {
            throw new InvalidAddress (this.id + ' privateGetDepositAddressList() returned no data');
        }
        let addressList = this.safeValue (data, 'addressList');
        if (addressList === undefined) {
            throw new InvalidAddress (this.id + ' privateGetDepositAddressList() returned no address list');
        }
        let numAddresses = addressList.length;
        if (numAddresses < 1) {
            throw new InvalidAddress (this.id + ' privatePostDepositAddresses() returned no addresses');
        }
        let firstAddress = addressList[0];
        let address = this.safeString (firstAddress, 'address');
        let tag = this.safeString (firstAddress, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals requires a currency code argument');
        }
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 10
        }
        const transactionType = (type === 'deposit') ? 'deposit' : 'withdraw'; // instead of withdrawal...
        const method = 'privateGet' + this.capitalize (transactionType) + 'History';
        // https://github.com/UEX-OpenAPI/API_Docs_en/wiki/Query-deposit-record-of-assigned-token
        // https://github.com/UEX-OpenAPI/API_Docs_en/wiki/Query-withdraw-record-of-assigned-token
        const response = await this[method] (this.extend (request, params));
        //
        //     { code:   "0",
        //        msg:   "suc",
        //       data: { depositList: [ {     createdAt:  1533615955000,
        //                                       amount: "0.01",
        //                                     updateAt:  1533616311000,
        //                                         txid: "0x0922fde6ab8270fe6eb31cb5a37dc732d96dc8193f81cf46c4ab29fde…",
        //                                          tag: "",
        //                                confirmations:  30,
        //                                    addressTo: "0x198803ef8e0df9e8812c0105421885e843e6d2e2",
        //                                       status:  1,
        //                                         coin: "ETH"                                                           } ] } }
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": {
        //             "withdrawList": [{
        //                 "updateAt": 1540344965000,
        //                 "createdAt": 1539311971000,
        //                 "status": 0,
        //                 "addressTo": "tz1d7DXJXU3AKWh77gSmpP7hWTeDYs8WF18q",
        //                 "tag": "100128877",
        //                 "id": 5,
        //                 "txid": "",
        //                 "fee": 0.0,
        //                 "amount": "1",
        //                 "symbol": "XTZ"
        //             }]
        //         }
        //     }
        //
        const transactions = this.safeValue (response['data'], transactionType + 'List');
        return this.parseTransactionsByType (type, transactions, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
    }

    parseTransactionsByType (type, transactions, code = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.parseTransaction (this.extend ({
                'type': type,
            }, transactions[i]));
            result.push (transaction);
        }
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //      {     createdAt:  1533615955000,
        //               amount: "0.01",
        //             updateAt:  1533616311000,
        //                 txid: "0x0922fde6ab8270fe6eb31cb5a37dc732d96dc8193f81cf46c4ab29fde…",
        //                  tag: "",
        //        confirmations:  30,
        //            addressTo: "0x198803ef8e0df9e8812c0105421885e843e6d2e2",
        //               status:  1,
        //                 coin: "ETH"                                                           } ] } }
        //
        // withdrawals
        //
        //     {
        //         "updateAt": 1540344965000,
        //         "createdAt": 1539311971000,
        //         "status": 0,
        //         "addressTo": "tz1d7DXJXU3AKWh77gSmpP7hWTeDYs8WF18q",
        //         "tag": "100128877",
        //         "id": 5,
        //         "txid": "",
        //         "fee": 0.0,
        //         "amount": "1",
        //         "symbol": "XTZ"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        let timestamp = this.safeInteger (transaction, 'createdAt');
        let updated = this.safeInteger (transaction, 'updateAt');
        let code = undefined;
        let currencyId = this.safeString2 (transaction, 'symbol', 'coin');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        const address = this.safeString (transaction, 'addressTo');
        const tag = this.safeString (transaction, 'tag');
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const type = this.safeString (transaction, 'type'); // injected from the outside
        let feeCost = this.safeFloat (transaction, 'fee');
        if ((type === 'deposit') && (feeCost === undefined)) {
            feeCost = 0;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // unaudited
            '1': 'ok', // audited
            '2': 'failed', // audit failed
            '3': 'pending', // "payment"
            '4': 'failed', // payment failed
            '5': 'ok',
            '6': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const fee = this.safeFloat (params, 'fee');
        if (fee === undefined) {
            throw new ArgumentsRequired (this.id + 'requires a "fee" extra parameter in its last argument');
        }
        this.checkAddress (address);
        let currency = this.currency (code);
        let request = {
            'coin': currency['id'],
            'address': address, // only supports existing addresses in your withdraw address list
            'amount': amount,
            'fee': fee, // balance >= this.sum (amount, fee)
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        // https://github.com/UEX-OpenAPI/API_Docs_en/wiki/Withdraw
        let response = await this.privatePostCreateWithdraw (this.extend (request, params));
        let id = undefined;
        return {
            'info': response,
            'id': id,
        };
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
                if (method === 'GET') {
                    url += '?' + this.urlencode (query) + '&sign=' + signature;
                } else {
                    body = this.urlencode (query) + '&sign=' + signature;
                }
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            //
            // {"code":"0","msg":"suc","data":{}}
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
