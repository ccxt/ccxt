'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'JP', // Japan
            'rateLimit': 500,
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
                'doc': 'https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md',
                'fees': [
                    'https://binance.zendesk.com/hc/en-us/articles/115000429332',
                    'https://support.binance.com/hc/en-us/articles/115000583311',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
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
                        'withdrawFee',
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
                        'exchangeInfo',
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
                'NANO': 'XRB',
            },
            // exchange-specific options
            'options': {
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
            },
            'exceptions': {
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-2010': InsufficientFunds, // createOrder -> 'Account has insufficient balance for requested action.'
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
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

    async fetchMarkets () {
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
            // lot size is deprecated as of 2018.02.06
            let lot = -1 * Math.log10 (precision['amount']);
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'lot': lot, // lot size is deprecated as of 2018.02.06
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': lot,
                        'max': undefined,
                    },
                },
            };
            if ('PRICE_FILTER' in filters) {
                let filter = filters['PRICE_FILTER'];
                entry['precision']['price'] = this.precisionFromString (filter['tickSize']);
                entry['limits']['price'] = {
                    'min': parseFloat (filter['minPrice']),
                    'max': parseFloat (filter['maxPrice']),
                };
            }
            if ('LOT_SIZE' in filters) {
                let filter = filters['LOT_SIZE'];
                entry['precision']['amount'] = this.precisionFromString (filter['stepSize']);
                entry['lot'] = parseFloat (filter['stepSize']); // lot size is deprecated as of 2018.02.06
                entry['limits']['amount'] = {
                    'min': parseFloat (filter['minQty']),
                    'max': parseFloat (filter['maxQty']),
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
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
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
        if (typeof limit !== 'undefined')
            request['limit'] = limit; // default = maximum = 100
        let response = await this.publicGetDepth (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'closeTime');
        let iso8601 = (typeof timestamp === 'undefined') ? undefined : this.iso8601 (timestamp);
        let symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        let last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': iso8601,
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

    async fetchBidAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let rawTickers = await this.publicGetTickerBookTicker (params);
        return this.parseTickers (rawTickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let rawTickers = await this.publicGetTicker24hr (params);
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 500, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
            'limit': limit, // default == max == 500
        };
        if (typeof since !== 'undefined')
            request['startTime'] = since;
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestampField = ('T' in trade) ? 'T' : 'time';
        let timestamp = trade[timestampField];
        let priceField = ('p' in trade) ? 'p' : 'price';
        let price = parseFloat (trade[priceField]);
        let amountField = ('q' in trade) ? 'q' : 'qty';
        let amount = parseFloat (trade[amountField]);
        let idField = ('a' in trade) ? 'a' : 'id';
        let id = trade[idField].toString ();
        let side = undefined;
        let order = undefined;
        if ('orderId' in trade)
            order = trade['orderId'].toString ();
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else {
            side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': parseFloat (trade['commission']),
                'currency': this.commonCurrencyCode (trade['commissionAsset']),
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': undefined,
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
        if (typeof since !== 'undefined') {
            request['startTime'] = since;
            request['endTime'] = since + 3600000;
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit': 500,     // default = maximum = 500
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        let statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status.toLowerCase ();
    }

    parseOrder (order, market = undefined) {
        let status = this.safeValue (order, 'status');
        if (typeof status !== 'undefined')
            status = this.parseOrderStatus (status);
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        let iso8601 = undefined;
        if (typeof timestamp !== 'undefined')
            iso8601 = this.iso8601 (timestamp);
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'origQty');
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = undefined;
        let cost = undefined;
        if (typeof filled !== 'undefined') {
            if (typeof amount !== 'undefined')
                remaining = Math.max (amount - filled, 0.0);
            if (typeof price !== 'undefined')
                cost = price * filled;
        }
        let id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'type');
        if (typeof type !== 'undefined')
            type = type.toLowerCase ();
        let side = this.safeString (order, 'side');
        if (typeof side !== 'undefined')
            side = side.toLowerCase ();
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': iso8601,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
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
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToString (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (type === 'limit') {
            order = this.extend (order, {
                'price': this.priceToPrecision (symbol, price),
                'timeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            });
        }
        let response = await this[method] (this.extend (order, params));
        return this.parseOrder (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let origClientOrderId = this.safeValue (params, 'origClientOrderId');
        let request = {
            'symbol': market['id'],
        };
        if (typeof origClientOrderId !== 'undefined')
            request['origClientOrderId'] = origClientOrderId;
        else
            request['orderId'] = parseInt (id);
        let response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetAllOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (typeof symbol !== 'undefined') {
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
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
            // 'origClientOrderId': id,
        }, params));
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
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
                    'status': 'ok',
                    'info': response,
                };
            }
        }
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        let withdrawFees = {};
        let info = {};
        if (typeof codes === 'undefined')
            codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currency (code);
            let response = await this.wapiGetWithdrawFee ({
                'asset': currency['id'],
            });
            withdrawFees[code] = this.safeFloat (response, 'withdrawFee');
            info[code] = response;
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': info,
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
            if ((method === 'GET') || (api === 'wapi')) {
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

    handleErrors (code, reason, url, method, headers, body) {
        if ((code === 418) || (code === 429))
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            if (body.indexOf ('LOT_SIZE') >= 0)
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size, use this.amountToLots (symbol, amount) ' + body);
            if (body.indexOf ('PRICE_FILTER') >= 0)
                throw new InvalidOrder (this.id + ' order price exceeds allowed price precision or invalid, use this.priceToPrecision (symbol, amount) ' + body);
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                let response = JSON.parse (body);
                // check success value for wapi endpoints
                // response in format {'msg': 'The coin does not exist.', 'success': true/false}
                let success = this.safeValue (response, 'success', true);
                if (!success) {
                    if ('msg' in response)
                        try {
                            response = JSON.parse (response['msg']);
                        } catch (e) {
                            response = {};
                        }
                }
                // checks against error codes
                let error = this.safeString (response, 'code');
                if (typeof error !== 'undefined') {
                    const exceptions = this.exceptions;
                    if (error in exceptions) {
                        throw new exceptions[error] (this.id + ' ' + body);
                    } else {
                        throw new ExchangeError (this.id + ': unknown error code: ' + body + ' ' + error);
                    }
                }
                if (!success) {
                    throw new ExchangeError (this.id + ': success value false: ' + body);
                }
            }
        }
    }
};
