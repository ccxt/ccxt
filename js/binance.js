'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'JP', // Japan
            'rateLimit': 500,
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchBidsAsks': true,
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasFetchMyTrades': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'withdraw': true,
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
                    ],
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
                'v1': {
                    'put': [ 'userDataStream' ],
                    'post': [ 'userDataStream' ],
                    'delete': [ 'userDataStream' ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BNB': 0.7, 
                        'BTC': 0.001, 
                        'NEO': 0.0,
                        'ETH': 0.01, 
                        'LTC': 0.01, 
                        'QTUM': 0.01, 
                        'EOS': 1.0, 
                        'SNT': 32.0, 
                        'BNT': 1.5, 
                        'GAS': 0, 
                        'BCH': 0.001,
                        'BTM': 5.0, 
                        'USDT': 23.0, 
                        'HCC': 0.0005, 
                        'HSR': 0.0001, 
                        'OAX': 8.3, 
                        'DNT': 51.0, 
                        'MCO': 0.86, 
                        'ICN': 3.5, 
                        'ZRX': 5.7, 
                        'OMG': 0.57, 
                        'WTC': 0.5, 
                        'LRC': 9.1, 
                        'LLT': 54.0, 
                        'YOYO': 39.0, 
                        'TRX': 129.0, 
                        'STRAT': 0.1, 
                        'SNGLS': 42, 
                        'BQX': 1.6, 
                        'KNC': 2.6, 
                        'SNM': 29.0, 
                        'FUN': 85.0, 
                        'LINK': 12.8, 
                        'XVG': 0.1, 
                        'CTR': 5.4, 
                        'SALT': 1.3, 
                        'MDA': 4.7, 
                        'IOTA': 0.5, 
                        'SUB': 7.4, 
                        'ETC': 0.01, 
                        'MTL': 1.9, 
                        'MTH': 34.0, 
                        'ENG': 2.1, 
                        'AST': 10.0, 
                        'DASH': 0.002, 
                        'BTG': 0.001, 
                        'EVX': 2.5, 
                        'REQ': 18.1, 
                        'VIB': 28.0, 
                        'POWR': 8.6, 
                        'ARK': 0.1, 
                        'XRP': 0.25, 
                        'MOD': 2.0, 
                        'ENJ': 42.0, 
                        'STORJ': 5.9, 
                        'VEN': 1.8, 
                        'KMD': 0.002, 
                        'RCN': 35.0, 
                        'NULS': 2.1, 
                        'RDN': 2.2, 
                        'XMR': 0.04, 
                        'DLT': 11.7, 
                        'AMB': 11.4, 
                        'BAT': 18.0, 
                        'ZEC': 0.005, 
                        'BCPT': 10.2, 
                        'ARN': 3.1, 
                        'GVT': 0.53, 
                        'CDT': 67.0, 
                        'GXS': 0.3, 
                        'POE': 88.0, 
                        'QSP': 21.0, 
                        'BTS': 1.0, 
                        'XZC': 0.02, 
                        'LSK': 0.1, 
                        'TNT': 47.0, 
                        'FUEL': 45.0, 
                        'MANA': 74.0, 
                        'BCD': 1.0, 
                        'DGD': 0.06, 
                        'ADX': 4.7, 
                        'ADA': 1.0, 
                        'PPT': 0.25, 
                        'CMT': 37.0, 
                        'XLM': 0.01, 
                        'CND': 47.0, 
                        'LEND': 54.0, 
                        'WABI': 3.5, 
                        'SBTC': 1.0, 
                        'BCX': 1.0, 
                        'WAVES': 0.002, 
                        'TNB': 82.0, 
                        'GTO': 20.0, 
                        'ICX': 1.3, 
                        'OST': 17.0, 
                        'ELF': 6.5, 
                        'AION': 1.9, 
                        'ETF': 1.0, 
                        'BRD': 6.4, 
                        'NEBL': 0.01, 
                        'VIBE': 7.2, 
                        'LUN': 0.29, 
                        'RLC': 4.1, 
                        'INS': 1.5, 
                        'EDO': 2.5, 
                        'WINGS': 9.3, 
                        'NAV': 0.2, 
                        'TRIG': 6.7, 
                        'APPC': 6.5, 
                    },
                    'deposit': {
                        'BNB': 0,
                        'BTC': 0,
                        'ETH': 0,
                        'LTC': 0,
                        'NEO': 0,
                        'QTUM': 0,
                        'SNT': 0,
                        'BNT': 0,
                        'EOS': 0,
                        'BCH': 0,
                        'GAS': 0,
                        'USDT': 0,
                        'OAX': 0,
                        'DNT': 0,
                        'MCO': 0,
                        'ICN': 0,
                        'WTC': 0,
                        'OMG': 0,
                        'ZRX': 0,
                        'STRAT': 0,
                        'SNGLS': 0,
                        'BQX': 0,
                        'KNC': 0,
                        'FUN': 0,
                        'SNM': 0,
                        'LINK': 0,
                        'XVG': 0,
                        'CTR': 0,
                        'SALT': 0,
                        'IOTA': 0,
                        'MDA': 0,
                        'MTL': 0,
                        'SUB': 0,
                        'ETC': 0,
                        'MTH': 0,
                        'ENG': 0,
                        'AST': 0,
                        'BTG': 0,
                        'DASH': 0,
                        'EVX': 0,
                        'REQ': 0,
                        'LRC': 0,
                        'VIB': 0,
                        'HSR': 0,
                        'TRX': 0,
                        'POWR': 0,
                        'ARK': 0,
                        'YOYO': 0,
                        'XRP': 0,
                        'MOD': 0,
                        'ENJ': 0,
                        'STORJ': 0,
                    },
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetExchangeInfo ();
        let markets = response['symbols'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
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
            let lot = -1 * Math.log10 (precision['amount']);
            let entry = this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'lot': lot,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': -1 * Math.log10 (precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': lot,
                        'max': undefined,
                    },
                },
            });
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
                entry['lot'] = parseFloat (filter['stepSize']);
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
            let asset = balance['asset'];
            let currency = this.commonCurrencyCode (asset);
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

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'symbol': market['id'],
            'limit': 100, // default = maximum = 100
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'closeTime');
        if (typeof timestamp === 'undefined')
            timestamp = this.milliseconds ();
        let symbol = ticker['symbol'];
        if (!market) {
            if (symbol in this.markets_by_id) {
                market = this.markets_by_id[symbol];
            }
        }
        if (market)
            symbol = market['symbol'];
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
            'close': this.safeFloat (ticker, 'prevClosePrice'),
            'first': undefined,
            'last': this.safeFloat (ticker, 'lastPrice'),
            'change': this.safeFloat (ticker, 'priceChangePercent'),
            'percentage': undefined,
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
        let tickersBySymbol = this.indexBy (tickers, 'symbol');
        // return all of them if no symbols were passed in the first argument
        if (typeof symbols === 'undefined')
            return tickersBySymbol;
        // otherwise filter by symbol
        let result = {};
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (symbol in tickersBySymbol)
                result[symbol] = tickersBySymbol[symbol];
        }
        return result;
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

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        request['limit'] = (limit) ? limit : 500; // default == max == 500
        if (since)
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
        if (since) {
            request['startTime'] = since;
            request['endTime'] = since + 3600000;
        }
        if (limit)
            request['limit'] = limit;
        // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit': 500,     // default = maximum = 500
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrderStatus (status) {
        if (status === 'NEW')
            return 'open';
        if (status === 'PARTIALLY_FILLED')
            return 'open';
        if (status === 'FILLED')
            return 'closed';
        if (status === 'CANCELED')
            return 'canceled';
        return status.toLowerCase ();
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        else
            throw new ExchangeError (this.id + ' malformed order: ' + this.json (order));
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['origQty']);
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let result = {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': price * amount,
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
        let response = await this.privatePostOrder (this.extend (order, params));
        return this.parseOrder (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
        }, params));
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
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOpenOrders (this.extend ({
            'symbol': market['id'],
        }, params));
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
        let response = undefined;
        try {
            response = await this.privateDeleteOrder (this.extend ({
                'symbol': market['id'],
                'orderId': parseInt (id),
                // 'origClientOrderId': id,
            }, params));
        } catch (e) {
            if (this.last_http_response.indexOf ('UNKNOWN_ORDER') >= 0)
                throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
            throw e;
        }
        return response;
    }

    nonce () {
        return this.milliseconds ();
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

    commonCurrencyCode (currency) {
        if (currency === 'BCC')
            return 'BCH';
        return currency;
    }

    currencyId (currency) {
        if (currency === 'BCH')
            return 'BCC';
        return currency;
    }

    async fetchDepositAddress (currency, params = {}) {
        let response = await this.wapiGetDepositAddress (this.extend ({
            'asset': this.currencyId (currency),
        }, params));
        if ('success' in response) {
            if (response['success']) {
                let address = this.safeString (response, 'address');
                let tag = this.safeString (response, 'addressTag');
                return {
                    'currency': currency,
                    'address': address,
                    'tag': tag,
                    'status': 'ok',
                    'info': response,
                };
            }
        }
        throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + this.last_http_response);
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        let request = {
            'asset': this.currencyId (currency),
            'address': address,
            'amount': parseFloat (amount),
            'name': address,
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
            let nonce = this.milliseconds ();
            let query = this.urlencode (this.extend ({
                'timestamp': nonce,
                'recvWindow': 100000,
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
        if (code >= 400) {
            if (code === 418)
                throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
            if (body.indexOf ('Price * QTY is zero or less') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            if (body.indexOf ('MIN_NOTIONAL') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is too small ' + body);
            if (body.indexOf ('LOT_SIZE') >= 0)
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size, use this.amountToLots (symbol, amount) ' + body);
            if (body.indexOf ('PRICE_FILTER') >= 0)
                throw new InvalidOrder (this.id + ' order price exceeds allowed price precision or invalid, use this.priceToPrecision (symbol, amount) ' + body);
            if (body.indexOf ('Order does not exist') >= 0)
                throw new OrderNotFound (this.id + ' ' + body);
        }
        if (body[0] === '{') {
            let response = JSON.parse (body);
            let error = this.safeValue (response, 'code');
            if (typeof error !== 'undefined') {
                if (error === -2010) {
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                } else if (error === -2011) {
                    throw new OrderNotFound (this.id + ' ' + this.json (response));
                } else if (error === -1013) { // Invalid quantity
                    throw new InvalidOrder (this.id + ' ' + this.json (response));
                }
            }
        }
    }
}
