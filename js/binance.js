'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': [ 'JP' ], // Japan
            'rateLimit': 500,
            'certified': true,
            // new metainfo interface
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchFundingFees': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://api.binance.com/wapi/v3',
                    'public': 'https://api.binance.com/api/v1',
                    'private': 'https://api.binance.com/api/v3',
                    'v3': 'https://api.binance.com/api/v3',
                    'v1': 'https://api.binance.com/api/v1',
                },
                'www': 'https://www.binance.com',
                'referral': 'https://www.binance.com/?ref=10205187',
                'doc': 'https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md',
                'fees': 'https://www.binance.com/en/fee/schedule',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                        'assetWithdraw/getAllAsset.html',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                    ],
                    'get': [
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                        'accountStatus',
                        'systemStatus',
                        'userAssetDribbletLog',
                        'tradeFee',
                        'assetDetail',
                    ],
                },
                'v3': {
                    'get': [
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                        'ticker/price',
                        'ticker/bookTicker',
                        'exchangeInfo',
                    ],
                    'put': [ 'userDataStream' ],
                    'post': [ 'userDataStream' ],
                    'delete': [ 'userDataStream' ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order',
                        'order/test',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                // should be deleted, these are outdated and inaccurate
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ADA': 1.0,
                        'ADX': 4.7,
                        'AION': 1.9,
                        'AMB': 11.4,
                        'APPC': 6.5,
                        'ARK': 0.1,
                        'ARN': 3.1,
                        'AST': 10.0,
                        'BAT': 18.0,
                        'BCD': 1.0,
                        'BCH': 0.001,
                        'BCPT': 10.2,
                        'BCX': 1.0,
                        'BNB': 0.7,
                        'BNT': 1.5,
                        'BQX': 1.6,
                        'BRD': 6.4,
                        'BTC': 0.001,
                        'BTG': 0.001,
                        'BTM': 5.0,
                        'BTS': 1.0,
                        'CDT': 67.0,
                        'CMT': 37.0,
                        'CND': 47.0,
                        'CTR': 5.4,
                        'DASH': 0.002,
                        'DGD': 0.06,
                        'DLT': 11.7,
                        'DNT': 51.0,
                        'EDO': 2.5,
                        'ELF': 6.5,
                        'ENG': 2.1,
                        'ENJ': 42.0,
                        'EOS': 1.0,
                        'ETC': 0.01,
                        'ETF': 1.0,
                        'ETH': 0.01,
                        'EVX': 2.5,
                        'FUEL': 45.0,
                        'FUN': 85.0,
                        'GAS': 0,
                        'GTO': 20.0,
                        'GVT': 0.53,
                        'GXS': 0.3,
                        'HCC': 0.0005,
                        'HSR': 0.0001,
                        'ICN': 3.5,
                        'ICX': 1.3,
                        'INS': 1.5,
                        'IOTA': 0.5,
                        'KMD': 0.002,
                        'KNC': 2.6,
                        'LEND': 54.0,
                        'LINK': 12.8,
                        'LLT': 54.0,
                        'LRC': 9.1,
                        'LSK': 0.1,
                        'LTC': 0.01,
                        'LUN': 0.29,
                        'MANA': 74.0,
                        'MCO': 0.86,
                        'MDA': 4.7,
                        'MOD': 2.0,
                        'MTH': 34.0,
                        'MTL': 1.9,
                        'NAV': 0.2,
                        'NEBL': 0.01,
                        'NEO': 0.0,
                        'NULS': 2.1,
                        'OAX': 8.3,
                        'OMG': 0.57,
                        'OST': 17.0,
                        'POE': 88.0,
                        'POWR': 8.6,
                        'PPT': 0.25,
                        'QSP': 21.0,
                        'QTUM': 0.01,
                        'RCN': 35.0,
                        'RDN': 2.2,
                        'REQ': 18.1,
                        'RLC': 4.1,
                        'SALT': 1.3,
                        'SBTC': 1.0,
                        'SNGLS': 42,
                        'SNM': 29.0,
                        'SNT': 32.0,
                        'STORJ': 5.9,
                        'STRAT': 0.1,
                        'SUB': 7.4,
                        'TNB': 82.0,
                        'TNT': 47.0,
                        'TRIG': 6.7,
                        'TRX': 129.0,
                        'USDT': 23.0,
                        'VEN': 1.8,
                        'VIB': 28.0,
                        'VIBE': 7.2,
                        'WABI': 3.5,
                        'WAVES': 0.002,
                        'WINGS': 9.3,
                        'WTC': 0.5,
                        'XLM': 0.01,
                        'XMR': 0.04,
                        'XRP': 0.25,
                        'XVG': 0.1,
                        'XZC': 0.02,
                        'YOYOW': 39.0,
                        'ZEC': 0.005,
                        'ZRX': 5.7,
                    },
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'YOYO': 'YOYOW',
                'BCC': 'BCH',
            },
            // exchange-specific options
            'options': {
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                },
            },
            'exceptions': {
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1128': ExchangeError, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.publicGetTime ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - response['serverTime']);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetExchangeInfo ();
        if (this.options['adjustForTimeDifference'])
            await this.loadTimeDifference ();
        let markets = response['symbols'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            // "123456" is a "test symbol/market"
            if (id === '123456')
                continue;
            let baseId = market['baseAsset'];
            let quoteId = market['quoteAsset'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let filters = this.indexBy (market['filters'], 'filterType');
            let precision = {
                'base': market['baseAssetPrecision'],
                'quote': market['quotePrecision'],
                'amount': market['baseAssetPrecision'],
                'price': market['quotePrecision'],
            };
            let active = (market['status'] === 'TRADING');
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': -1 * Math.log10 (precision['amount']),
                        'max': undefined,
                    },
                },
            };
            if ('PRICE_FILTER' in filters) {
                let filter = filters['PRICE_FILTER'];
                // PRICE_FILTER reports zero values for minPrice and maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['min'] and limits['price']['max]
                // don't have any meaningful value except undefined
                //
                //     entry['limits']['price'] = {
                //         'min': this.safeFloat (filter, 'minPrice'),
                //         'max': this.safeFloat (filter, 'maxPrice'),
                //     };
                //
                entry['precision']['price'] = this.precisionFromString (filter['tickSize']);
            }
            if ('LOT_SIZE' in filters) {
                let filter = filters['LOT_SIZE'];
                entry['precision']['amount'] = this.precisionFromString (filter['stepSize']);
                entry['limits']['amount'] = {
                    'min': this.safeFloat (filter, 'minQty'),
                    'max': this.safeFloat (filter, 'maxQty'),
                };
            }
            if ('MIN_NOTIONAL' in filters) {
                entry['limits']['cost']['min'] = parseFloat (filters['MIN_NOTIONAL']['minNotional']);
            }
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccount (params);
        let result = { 'info': response };
        let balances = response['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['asset'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            let account = {
                'free': parseFloat (balance['free']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
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
            request['limit'] = limit; // default = maximum = 100
        let response = await this.publicGetDepth (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'closeTime');
        let symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        let last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQty'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQty'),
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'), // previous day close
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTicker24hr (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        let tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let rawTickers = await this.publicGetTickerBookTicker (params);
        return this.parseTickers (rawTickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let method = this.options['fetchTickersMethod'];
        let rawTickers = await this[method] (params);
        return this.parseTickers (rawTickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestampField = ('T' in trade) ? 'T' : 'time';
        let timestamp = this.safeInteger (trade, timestampField);
        let priceField = ('p' in trade) ? 'p' : 'price';
        let price = this.safeFloat (trade, priceField);
        let amountField = ('q' in trade) ? 'q' : 'qty';
        let amount = this.safeFloat (trade, amountField);
        let idField = ('a' in trade) ? 'a' : 'id';
        let id = this.safeString (trade, idField);
        let side = undefined;
        let order = undefined;
        if ('orderId' in trade)
            order = this.safeString (trade, 'orderId');
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else {
            if ('isBuyer' in trade)
                side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'commission'),
                'currency': this.commonCurrencyCode (trade['commissionAsset']),
            };
        }
        let takerOrMaker = undefined;
        if ('isMaker' in trade)
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
            request['endTime'] = this.sum (since, 3600000);
        }
        if (limit !== undefined)
            request['limit'] = limit;
        // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit': 500,     // default = 500, maximum = 1000
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling', // currently unused
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'origQty');
        let filled = this.safeFloat (order, 'executedQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        let id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'type');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined)
            side = side.toLowerCase ();
        let fee = undefined;
        let trades = undefined;
        const fills = this.safeValue (order, 'fills');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
            let numTrades = trades.length;
            if (numTrades > 0) {
                cost = trades[0]['cost'];
                fee = {
                    'cost': trades[0]['fee']['cost'],
                    'currency': trades[0]['fee']['currency'],
                };
                for (let i = 1; i < trades.length; i++) {
                    cost = this.sum (cost, trades[i]['cost']);
                    fee['cost'] = this.sum (fee['cost'], trades[i]['fee']['cost']);
                }
            }
        }
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // the next 5 lines are added to support for testing orders
        let method = 'privatePostOrder';
        let test = this.safeValue (params, 'test', false);
        if (test) {
            method += 'Test';
            params = this.omit (params, 'test');
        }
        let uppercaseType = type.toUpperCase ();
        const newOrderRespType = this.safeValue (this.options['newOrderRespType'], type, 'RESULT');
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': uppercaseType,
            'side': side.toUpperCase (),
            'newOrderRespType': newOrderRespType, // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
        };
        let timeInForceIsRequired = false;
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            stopPriceIsRequired = true;
        } else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            stopPriceIsRequired = true;
            priceIsRequired = true;
            timeInForceIsRequired = true;
        } else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
            }
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (timeInForceIsRequired) {
            order['timeInForce'] = this.options['defaultTimeInForce']; // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
        }
        if (stopPriceIsRequired) {
            let stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder method requires a stopPrice extra param for a ' + type + ' order');
            } else {
                params = this.omit (params, 'stopPrice');
                order['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        let response = await this[method] (this.extend (order, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let origClientOrderId = this.safeValue (params, 'origClientOrderId');
        let request = {
            'symbol': market['id'],
        };
        if (origClientOrderId !== undefined)
            request['origClientOrderId'] = origClientOrderId;
        else
            request['orderId'] = parseInt (id);
        let response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetAllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else if (this.options['warnOnFetchOpenOrdersWithoutSymbol']) {
            let symbols = this.symbols;
            let numSymbols = symbols.length;
            let fetchOpenOrdersRateLimit = parseInt (numSymbols / 2);
            throw new ExchangeError (this.id + ' fetchOpenOrders WARNING: fetching open orders without specifying a symbol is rate-limited to one call per ' + fetchOpenOrdersRateLimit.toString () + ' seconds. Do not call this method frequently to avoid ban. Set ' + this.id + '.options["warnOnFetchOpenOrdersWithoutSymbol"] = false to suppress this warning message.');
        }
        let response = await this.privateGetOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
            // 'origClientOrderId': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetDepositHistory (this.extend (request, params));
        //
        //     {     success:    true,
        //       depositList: [ { insertTime:  1517425007000,
        //                            amount:  0.3,
        //                           address: "0x0123456789abcdef",
        //                        addressTag: "",
        //                              txId: "0x0123456789abcdef",
        //                             asset: "ETH",
        //                            status:  1                                                                    } ] }
        //
        return this.parseTransactions (response['depositList'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetWithdrawHistory (this.extend (request, params));
        //
        //     { withdrawList: [ {      amount:  14,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1514489710000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ETH",
        //                           applyTime:  1514488724000,
        //                              status:  6                       },
        //                       {      amount:  7600,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1515323226000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ICN",
        //                           applyTime:  1515322539000,
        //                              status:  6                       }  ],
        //            success:    true                                         }
        //
        return this.parseTransactions (response['withdrawList'], currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        let statuses = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //      { insertTime:  1517425007000,
        //            amount:  0.3,
        //           address: "0x0123456789abcdef",
        //        addressTag: "",
        //              txId: "0x0123456789abcdef",
        //             asset: "ETH",
        //            status:  1                                                                    }
        //
        // fetchWithdrawals
        //
        //       {      amount:  14,
        //             address: "0x0123456789abcdef...",
        //         successTime:  1514489710000,
        //          addressTag: "",
        //                txId: "0x0123456789abcdef...",
        //                  id: "0123456789abcdef...",
        //               asset: "ETH",
        //           applyTime:  1514488724000,
        //              status:  6                       }
        //
        let id = this.safeString (transaction, 'id');
        let address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'txId');
        let code = undefined;
        let currencyId = this.safeString (transaction, 'asset');
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let timestamp = undefined;
        let insertTime = this.safeInteger (transaction, 'insertTime');
        let applyTime = this.safeInteger (transaction, 'applyTime');
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        let status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        let amount = this.safeFloat (transaction, 'amount');
        const feeCost = undefined;
        let fee = {
            'cost': feeCost,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.wapiGetDepositAddress (this.extend ({
            'asset': currency['id'],
        }, params));
        if ('success' in response) {
            if (response['success']) {
                let address = this.safeString (response, 'address');
                let tag = this.safeString (response, 'addressTag');
                return {
                    'currency': code,
                    'address': this.checkAddress (address),
                    'tag': tag,
                    'info': response,
                };
            }
        }
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        let response = await this.wapiGetAssetDetail ();
        //
        //     {
        //         "success": true,
        //         "assetDetail": {
        //             "CTR": {
        //                 "minWithdrawAmount": "70.00000000", //min withdraw amount
        //                 "depositStatus": false,//deposit status
        //                 "withdrawFee": 35, // withdraw fee
        //                 "withdrawStatus": true, //withdraw status
        //                 "depositTip": "Delisted, Deposit Suspended" //reason
        //             },
        //             "SKY": {
        //                 "minWithdrawAmount": "0.02000000",
        //                 "depositStatus": true,
        //                 "withdrawFee": 0.01,
        //                 "withdrawStatus": true
        //             }
        //         }
        //     }
        //
        let detail = this.safeValue (response, 'assetDetail');
        let ids = Object.keys (detail);
        let withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = this.commonCurrencyCode (id);
            withdrawFees[code] = this.safeFloat (detail[id], 'withdrawFee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let name = address.slice (0, 20);
        let request = {
            'asset': currency['id'],
            'address': address,
            'amount': parseFloat (amount),
            'name': name,
        };
        if (tag)
            request['addressTag'] = tag;
        let response = await this.wapiPostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'wapi')
            url += '.html';
        // v1 special case for userDataStream
        if (path === 'userDataStream') {
            body = this.urlencode (params);
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else if ((api === 'private') || (api === 'wapi')) {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            let signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if ((code === 418) || (code === 429))
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            if (body.indexOf ('LOT_SIZE') >= 0)
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            if (body.indexOf ('PRICE_FILTER') >= 0)
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                // check success value for wapi endpoints
                // response in format {'msg': 'The coin does not exist.', 'success': true/false}
                let success = this.safeValue (response, 'success', true);
                if (!success) {
                    let message = this.safeString (response, 'msg');
                    let parsedMessage = undefined;
                    if (message !== undefined) {
                        try {
                            parsedMessage = JSON.parse (message);
                        } catch (e) {
                            // do nothing
                            parsedMessage = undefined;
                        }
                        if (parsedMessage !== undefined) {
                            response = parsedMessage;
                        }
                    }
                }
                // checks against error codes
                let error = this.safeString (response, 'code');
                if (error !== undefined) {
                    const exceptions = this.exceptions;
                    if (error in exceptions) {
                        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
                        // despite that their message is very confusing, it is raised by Binance
                        // on a temporary ban (the API key is valid, but disabled for a while)
                        if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                            throw new DDoSProtection (this.id + ' temporary banned: ' + body);
                        }
                        const message = this.safeString (response, 'msg');
                        if (message === 'Order would trigger immediately.') {
                            throw new InvalidOrder (this.id + ' ' + body);
                        } else if (message === 'Account has insufficient balance for requested action.') {
                            throw new InsufficientFunds (this.id + ' ' + body);
                        } else if (message === 'Rest API trading is not enabled.') {
                            throw new ExchangeNotAvailable (this.id + ' ' + body);
                        }
                        throw new exceptions[error] (this.id + ' ' + body);
                    } else {
                        throw new ExchangeError (this.id + ' ' + body);
                    }
                }
                if (!success) {
                    throw new ExchangeError (this.id + ' ' + body);
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
        if ((api === 'private') || (api === 'wapi'))
            this.options['hasAlreadyAuthenticatedSuccessfully'] = true;
        return response;
    }
};
