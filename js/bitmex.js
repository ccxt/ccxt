'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitmex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'CORS': false,
                'fetchOHLCV': true,
                'withdraw': true,
                'editOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': 'https://testnet.bitmex.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': 'https://www.bitmex.com',
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
                'fees': 'https://www.bitmex.com/app/fees',
                'referral': 'https://www.bitmex.com/register/rm3C16',
            },
            'api': {
                'public': {
                    'get': [
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ],
                    'put': [
                        'order',
                        'order/bulk',
                        'user',
                    ],
                    'delete': [
                        'apiKey',
                        'order',
                        'order/all',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'Invalid API Key.': AuthenticationError,
                    'Access Denied': PermissionDenied,
                    'Duplicate clOrdID': InvalidOrder,
                    'Signature not valid': AuthenticationError,
                },
                'broad': {
                    'overloaded': ExchangeNotAvailable,
                    'Account has insufficient Available Balance': InsufficientFunds,
                },
            },
            'options': {
                'api-expires': undefined,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const active = (market['state'] !== 'Unlisted');
            const id = market['symbol'];
            const baseId = market['underlying'];
            const quoteId = market['quoteCurrency'];
            const basequote = baseId + quoteId;
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const swap = (id === basequote);
            // 'positionCurrency' may be empty ("", as Bitmex currently returns for ETHUSD)
            // so let's take the quote currency first and then adjust if needed
            const positionId = this.safeString2 (market, 'positionCurrency', 'quoteCurrency');
            let type = undefined;
            let future = false;
            let prediction = false;
            let position = this.commonCurrencyCode (positionId);
            let symbol = id;
            if (swap) {
                type = 'swap';
                symbol = base + '/' + quote;
            } else if (id.indexOf ('B_') >= 0) {
                prediction = true;
                type = 'prediction';
            } else {
                future = true;
                type = 'future';
            }
            const precision = {
                'amount': undefined,
                'price': undefined,
            };
            const lotSize = this.safeFloat (market, 'lotSize');
            const tickSize = this.safeFloat (market, 'tickSize');
            if (lotSize !== undefined) {
                precision['amount'] = this.precisionFromString (this.truncate_to_string (lotSize, 16));
            }
            if (tickSize !== undefined) {
                precision['price'] = this.precisionFromString (this.truncate_to_string (tickSize, 16));
            }
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': tickSize,
                    'max': this.safeFloat (market, 'maxPrice'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            const limitField = (position === quote) ? 'cost' : 'amount';
            limits[limitField] = {
                'min': lotSize,
                'max': this.safeFloat (market, 'maxOrderQty'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'taker': market['takerFee'],
                'maker': market['makerFee'],
                'type': type,
                'spot': false,
                'swap': swap,
                'future': future,
                'prediction': prediction,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = { 'currency': 'all' };
        const response = await this.privateGetUserMargin (this.extend (request, params));
        const result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            const balance = response[b];
            let currencyId = this.safeString (balance, 'currency');
            currencyId = currencyId.toUpperCase ();
            const code = this.commonCurrencyCode (currencyId);
            const account = {
                'free': balance['availableMargin'],
                'used': 0.0,
                'total': balance['marginBalance'],
            };
            if (code === 'BTC') {
                account['free'] = account['free'] * 0.00000001;
                account['total'] = account['total'] * 0.00000001;
            }
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['depth'] = limit;
        let orderbook = await this.publicGetOrderBookL2 (this.extend (request, params));
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        for (let o = 0; o < orderbook.length; o++) {
            let order = orderbook[o];
            let side = (order['side'] === 'Sell') ? 'asks' : 'bids';
            let amount = order['size'];
            let price = order['price'];
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let filter = { 'filter': { 'orderID': id }};
        let result = await this.fetchOrders (symbol, undefined, undefined, this.deepExtend (filter, params));
        let numResults = result.length;
        if (numResults === 1)
            return result[0];
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined)
            request['startTime'] = this.iso8601 (since);
        if (limit !== undefined)
            request['count'] = limit;
        request = this.deepExtend (request, params);
        // why the hassle? urlencode in python is kinda broken for nested dicts.
        // E.g. self.urlencode({"filter": {"open": True}}) will return "filter={'open':+True}"
        // Bitmex doesn't like that. Hence resorting to this hack.
        if ('filter' in request)
            request['filter'] = this.json (request['filter']);
        let response = await this.privateGetOrder (request);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let filter_params = { 'filter': { 'open': true }};
        return await this.fetchOrders (symbol, since, limit, this.deepExtend (filter_params, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Bitmex barfs if you set 'open': false in the filter...
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['active']) {
            throw new ExchangeError (this.id + ': symbol ' + symbol + ' is delisted');
        }
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeValue (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' ticker symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetInstrumentActiveAndIndices (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = this.safeString (ticker, 'symbol');
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {                         symbol: "ETHH19",
        //                           rootSymbol: "ETH",
        //                                state: "Open",
        //                                  typ: "FFCCSX",
        //                              listing: "2018-12-17T04:00:00.000Z",
        //                                front: "2019-02-22T12:00:00.000Z",
        //                               expiry: "2019-03-29T12:00:00.000Z",
        //                               settle: "2019-03-29T12:00:00.000Z",
        //                       relistInterval:  null,
        //                           inverseLeg: "",
        //                              sellLeg: "",
        //                               buyLeg: "",
        //                     optionStrikePcnt:  null,
        //                    optionStrikeRound:  null,
        //                    optionStrikePrice:  null,
        //                     optionMultiplier:  null,
        //                     positionCurrency: "ETH",
        //                           underlying: "ETH",
        //                        quoteCurrency: "XBT",
        //                     underlyingSymbol: "ETHXBT=",
        //                            reference: "BMEX",
        //                      referenceSymbol: ".BETHXBT30M",
        //                         calcInterval:  null,
        //                      publishInterval:  null,
        //                          publishTime:  null,
        //                          maxOrderQty:  100000000,
        //                             maxPrice:  10,
        //                              lotSize:  1,
        //                             tickSize:  0.00001,
        //                           multiplier:  100000000,
        //                        settlCurrency: "XBt",
        //       underlyingToPositionMultiplier:  1,
        //         underlyingToSettleMultiplier:  null,
        //              quoteToSettleMultiplier:  100000000,
        //                             isQuanto:  false,
        //                            isInverse:  false,
        //                           initMargin:  0.02,
        //                          maintMargin:  0.01,
        //                            riskLimit:  5000000000,
        //                             riskStep:  5000000000,
        //                                limit:  null,
        //                               capped:  false,
        //                                taxed:  true,
        //                           deleverage:  true,
        //                             makerFee:  -0.0005,
        //                             takerFee:  0.0025,
        //                        settlementFee:  0,
        //                         insuranceFee:  0,
        //                    fundingBaseSymbol: "",
        //                   fundingQuoteSymbol: "",
        //                 fundingPremiumSymbol: "",
        //                     fundingTimestamp:  null,
        //                      fundingInterval:  null,
        //                          fundingRate:  null,
        //                indicativeFundingRate:  null,
        //                   rebalanceTimestamp:  null,
        //                    rebalanceInterval:  null,
        //                     openingTimestamp: "2019-02-13T08:00:00.000Z",
        //                     closingTimestamp: "2019-02-13T09:00:00.000Z",
        //                      sessionInterval: "2000-01-01T01:00:00.000Z",
        //                       prevClosePrice:  0.03347,
        //                       limitDownPrice:  null,
        //                         limitUpPrice:  null,
        //               bankruptLimitDownPrice:  null,
        //                 bankruptLimitUpPrice:  null,
        //                      prevTotalVolume:  1386531,
        //                          totalVolume:  1387062,
        //                               volume:  531,
        //                            volume24h:  17118,
        //                    prevTotalTurnover:  4741294246000,
        //                        totalTurnover:  4743103466000,
        //                             turnover:  1809220000,
        //                          turnover24h:  57919845000,
        //                      homeNotional24h:  17118,
        //                   foreignNotional24h:  579.19845,
        //                         prevPrice24h:  0.03349,
        //                                 vwap:  0.03383564,
        //                            highPrice:  0.03458,
        //                             lowPrice:  0.03329,
        //                            lastPrice:  0.03406,
        //                   lastPriceProtected:  0.03406,
        //                    lastTickDirection: "ZeroMinusTick",
        //                       lastChangePcnt:  0.017,
        //                             bidPrice:  0.03406,
        //                             midPrice:  0.034065,
        //                             askPrice:  0.03407,
        //                       impactBidPrice:  0.03406,
        //                       impactMidPrice:  0.034065,
        //                       impactAskPrice:  0.03407,
        //                         hasLiquidity:  true,
        //                         openInterest:  83679,
        //                            openValue:  285010674000,
        //                           fairMethod: "ImpactMidPrice",
        //                        fairBasisRate:  0,
        //                            fairBasis:  0,
        //                            fairPrice:  0.03406,
        //                           markMethod: "FairPrice",
        //                            markPrice:  0.03406,
        //                    indicativeTaxRate:  0,
        //                indicativeSettlePrice:  0.03406,
        //                optionUnderlyingPrice:  null,
        //                         settledPrice:  null,
        //                            timestamp: "2019-02-13T08:40:30.000Z",
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeValue (this.markets_by_id, marketId, market);
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const open = this.safeFloat (ticker, 'prevPrice24h');
        const last = this.safeFloat (ticker, 'lastPrice');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': this.sum (open, last) / 2,
            'baseVolume': this.safeFloat (ticker, 'homeNotional24h'),
            'quoteVolume': this.safeFloat (ticker, 'foreignNotional24h'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timestamp']);
        return [
            timestamp,
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // send JSON key/value pairs, such as {"key": "value"}
        // filter by individual fields and do advanced queries on timestamps
        // let filter = { 'key': 'value' };
        // send a bare series (e.g. XBU) to nearest expiring contract in that series
        // you can also send a timeframe, e.g. XBU:monthly
        // timeframes: daily, weekly, monthly, quarterly, and biquarterly
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'binSize': this.timeframes[timeframe],
            'partial': true,     // true == include yet-incomplete current bins
            // 'filter': filter, // filter by individual fields and do advanced queries
            // 'columns': [],    // will return all columns if omitted
            // 'start': 0,       // starting point for results (wtf?)
            // 'reverse': false, // true == newest first
            // 'endTime': '',    // ending date filter for results
        };
        if (limit !== undefined)
            request['count'] = limit; // default 100, max 500
        // if since is not set, they will return candles starting from 2017-01-01
        if (since !== undefined) {
            let ymdhms = this.ymdhms (since);
            request['startTime'] = ymdhms; // starting date filter for results
        }
        let response = await this.publicGetTradeBucketed (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['timestamp']);
        let symbol = undefined;
        if (market === undefined) {
            if ('symbol' in trade)
                market = this.markets_by_id[trade['symbol']];
        }
        if (market)
            symbol = market['symbol'];
        return {
            'id': trade['trdMatchID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': trade['side'].toLowerCase (),
            'price': trade['price'],
            'amount': trade['size'],
        };
    }

    parseOrderStatus (status) {
        let statuses = {
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'DoneForDay': 'open',
            'Canceled': 'canceled',
            'PendingCancel': 'open',
            'PendingNew': 'open',
            'Rejected': 'rejected',
            'Expired': 'expired',
            'Stopped': 'open',
            'Untriggered': 'open',
            'Triggered': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        let lastTradeTimestamp = this.parse8601 (this.safeString (order, 'transactTime'));
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'orderQty');
        let filled = this.safeFloat (order, 'cumQty', 0.0);
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (amount - filled, 0.0);
            }
        }
        let cost = undefined;
        if (price !== undefined)
            if (filled !== undefined)
                cost = price * filled;
        let result = {
            'info': order,
            'id': order['orderID'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': order['ordType'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined)
            request['startTime'] = this.iso8601 (since);
        if (limit !== undefined)
            request['count'] = limit;
        let response = await this.publicGetTrade (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
        };
        if (price !== undefined)
            request['price'] = price;
        let response = await this.privatePostOrder (this.extend (request, params));
        let order = this.parseOrder (response);
        let id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'orderID': id,
        };
        if (amount !== undefined)
            request['orderQty'] = amount;
        if (price !== undefined)
            request['price'] = price;
        let response = await this.privatePutOrder (this.extend (request, params));
        let order = this.parseOrder (response);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateDeleteOrder (this.extend ({ 'orderID': id }, params));
        let order = response[0];
        let error = this.safeString (order, 'error');
        if (error !== undefined)
            if (error.indexOf ('Unable to cancel order due to existing state') >= 0)
                throw new OrderNotFound (this.id + ' cancelOrder() failed: ' + error);
        order = this.parseOrder (order);
        this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    isFiat (currency) {
        if (currency === 'EUR')
            return true;
        if (currency === 'PLN')
            return true;
        return false;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        // let currency = this.currency (code);
        if (code !== 'BTC') {
            throw new ExchangeError (this.id + ' supoprts BTC withdrawals only, other currencies coming soon...');
        }
        let request = {
            'currency': 'XBt', // temporarily
            'amount': amount,
            'address': address,
            // 'otpToken': '123456', // requires if two-factor auth (OTP) is enabled
            // 'fee': 0.001, // bitcoin network fee
        };
        let response = await this.privatePostUserRequestWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': response['transactID'],
        };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code === 429)
            throw new DDoSProtection (this.id + ' ' + body);
        if (code >= 400) {
            if (body) {
                if (body[0] === '{') {
                    const error = this.safeValue (response, 'error', {});
                    const message = this.safeString (error, 'message');
                    const feedback = this.id + ' ' + body;
                    const exact = this.exceptions['exact'];
                    if (message in exact) {
                        throw new exact[message] (feedback);
                    }
                    const broad = this.exceptions['broad'];
                    const broadKey = this.findBroadlyMatchedKey (broad, message);
                    if (broadKey !== undefined) {
                        throw new broad[broadKey] (feedback);
                    }
                    if (code === 400) {
                        throw new BadRequest (feedback);
                    }
                    throw new ExchangeError (feedback); // unknown message
                }
            }
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = '/api/' + this.version + '/' + path;
        if (method !== 'PUT')
            if (Object.keys (params).length)
                query += '?' + this.urlencode (params);
        let url = this.urls['api'] + query;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let auth = method + query;
            let expires = this.safeInteger (this.options, 'api-expires');
            let nonce = this.nonce ().toString ();
            headers = {
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
            };
            if (expires !== undefined) {
                expires = this.sum (this.seconds (), expires);
                expires = expires.toString ();
                auth += expires;
                headers['api-expires'] = expires;
            } else {
                auth += nonce;
                headers['api-nonce'] = nonce;
            }
            if (method === 'POST' || method === 'PUT') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                    auth += body;
                }
            }
            headers['api-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
