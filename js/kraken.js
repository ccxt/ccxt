'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, OrderNotFound, DDoSProtection, InvalidNonce, InsufficientFunds, CancelPending, InvalidOrder, InvalidAddress } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kraken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': 'US',
            'version': '0',
            'rateLimit': 3000,
            'has': {
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'fetchTradingFees': true,
                'CORS': false,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'marketsByAltname': {},
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
                '1w': '10080',
                '2w': '21600',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api': {
                    'public': 'https://api.kraken.com',
                    'private': 'https://api.kraken.com',
                    'zendesk': 'https://support.kraken.com/hc/en-us/articles',
                },
                'www': 'https://www.kraken.com',
                'doc': [
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ],
                'fees': 'https://www.kraken.com/en-us/help/fees',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.26 / 100,
                    'maker': 0.16 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.0026],
                            [50000, 0.0024],
                            [100000, 0.0022],
                            [250000, 0.0020],
                            [500000, 0.0018],
                            [1000000, 0.0016],
                            [2500000, 0.0014],
                            [5000000, 0.0012],
                            [10000000, 0.0001],
                        ],
                        'maker': [
                            [0, 0.0016],
                            [50000, 0.0014],
                            [100000, 0.0012],
                            [250000, 0.0010],
                            [500000, 0.0008],
                            [1000000, 0.0006],
                            [2500000, 0.0004],
                            [5000000, 0.0002],
                            [10000000, 0.0],
                        ],
                    },
                },
                // this is a bad way of hardcoding fees that change on daily basis
                // hardcoding is now considered obsolete, we will remove all of it eventually
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'ETH': 0.005,
                        'XRP': 0.02,
                        'XLM': 0.00002,
                        'LTC': 0.02,
                        'DOGE': 2,
                        'ZEC': 0.00010,
                        'ICN': 0.02,
                        'REP': 0.01,
                        'ETC': 0.005,
                        'MLN': 0.003,
                        'XMR': 0.05,
                        'DASH': 0.005,
                        'GNO': 0.01,
                        'EOS': 0.5,
                        'BCH': 0.001,
                        'USD': 5, // if domestic wire
                        'EUR': 5, // if domestic wire
                        'CAD': 10, // CAD EFT Withdrawal
                        'JPY': 300, // if domestic wire
                    },
                    'deposit': {
                        'BTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'XLM': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'ZEC': 0,
                        'ICN': 0,
                        'REP': 0,
                        'ETC': 0,
                        'MLN': 0,
                        'XMR': 0,
                        'DASH': 0,
                        'GNO': 0,
                        'EOS': 0,
                        'BCH': 0,
                        'USD': 5, // if domestic wire
                        'EUR': 0, // free deposit if EUR SEPA Deposit
                        'CAD': 5, // if domestic wire
                        'JPY': 0, // Domestic Deposit (Free, ¥5,000 deposit minimum)
                    },
                },
            },
            'api': {
                'zendesk': {
                    'get': [
                        // we should really refrain from putting fixed fee numbers and stop hardcoding
                        // we will be using their web APIs to scrape all numbers from these articles
                        '205893708-What-is-the-minimum-order-size-',
                        '201396777-What-are-the-deposit-fees-',
                        '201893608-What-are-the-withdrawal-fees-',
                    ],
                },
                'public': {
                    'get': [
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ],
                },
                'private': {
                    'post': [
                        'AddOrder',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ],
                },
            },
            'options': {
                'cacheDepositMethodsOnFetchDepositAddress': true, // will issue up to two calls in fetchDepositAddress
                'depositMethods': {},
            },
            'exceptions': {
                'EFunding:Unknown withdraw key': ExchangeError,
                'EFunding:Invalid amount': InsufficientFunds,
                'EService:Unavailable': ExchangeNotAvailable,
                'EDatabase:Internal error': ExchangeNotAvailable,
                'EService:Busy': ExchangeNotAvailable,
                'EAPI:Rate limit exceeded': DDoSProtection,
                'EQuery:Unknown asset': ExchangeError,
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.truncate (parseFloat (cost), this.markets[symbol]['precision']['price']);
    }

    feeToPrecision (symbol, fee) {
        return this.truncate (parseFloat (fee), this.markets[symbol]['precision']['amount']);
    }

    async fetchMinOrderSizes () {
        let html = undefined;
        try {
            this.parseJsonResponse = false;
            html = await this.zendeskGet205893708WhatIsTheMinimumOrderSize ();
            this.parseJsonResponse = true;
        } catch (e) {
            // ensure parseJsonResponse is restored no matter what
            this.parseJsonResponse = true;
            throw e;
        }
        let parts = html.split ('ul>');
        let ul = parts[1];
        let listItems = ul.split ('</li');
        let result = {};
        const separator = '):' + ' ';
        for (let l = 0; l < listItems.length; l++) {
            let listItem = listItems[l];
            let chunks = listItem.split (separator);
            let numChunks = chunks.length;
            if (numChunks > 1) {
                let limit = parseFloat (chunks[1]);
                let name = chunks[0];
                chunks = name.split ('(');
                let currency = chunks[1];
                result[currency] = limit;
            }
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetAssetPairs ();
        let limits = await this.fetchMinOrderSizes ();
        let keys = Object.keys (markets['result']);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets['result'][id];
            let baseId = market['base'];
            let quoteId = market['quote'];
            let base = baseId;
            let quote = quoteId;
            if ((base[0] === 'X') || (base[0] === 'Z'))
                base = base.slice (1);
            if ((quote[0] === 'X') || (quote[0] === 'Z'))
                quote = quote.slice (1);
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let darkpool = id.indexOf ('.d') >= 0;
            let symbol = darkpool ? market['altname'] : (base + '/' + quote);
            let maker = undefined;
            if ('fees_maker' in market) {
                maker = parseFloat (market['fees_maker'][0][1]) / 100;
            }
            let precision = {
                'amount': market['lot_decimals'],
                'price': market['pair_decimals'],
            };
            let minAmount = Math.pow (10, -precision['amount']);
            if (base in limits)
                minAmount = limits[base];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'darkpool': darkpool,
                'info': market,
                'altname': market['altname'],
                'maker': maker,
                'taker': parseFloat (market['fees'][0][1]) / 100,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        result = this.appendInactiveMarkets (result);
        this.marketsByAltname = this.indexBy (result, 'altname');
        return result;
    }

    appendInactiveMarkets (result = []) {
        let precision = { 'amount': 8, 'price': 8 };
        let costLimits = { 'min': 0, 'max': undefined };
        let priceLimits = { 'min': Math.pow (10, -precision['price']), 'max': undefined };
        let amountLimits = { 'min': Math.pow (10, -precision['amount']), 'max': Math.pow (10, precision['amount']) };
        let limits = { 'amount': amountLimits, 'price': priceLimits, 'cost': costLimits };
        let defaults = {
            'darkpool': false,
            'info': undefined,
            'maker': undefined,
            'taker': undefined,
            'active': false,
            'precision': precision,
            'limits': limits,
        };
        let markets = [
            // { 'id': 'XXLMZEUR', 'symbol': 'XLM/EUR', 'base': 'XLM', 'quote': 'EUR', 'altname': 'XLMEUR' },
        ];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.extend (defaults, markets[i]));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetAssets (params);
        let currencies = response['result'];
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (currency['altname']);
            let precision = currency['decimals'];
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': true,
                'status': 'ok',
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        let response = await this.privatePostTradeVolume (params);
        let tradedVolume = this.safeFloat (response['result'], 'volume');
        let tiers = this.fees['trading']['tiers'];
        let taker = tiers['taker'][1];
        let maker = tiers['maker'][1];
        for (let i = 0; i < tiers['taker'].length; i++) {
            if (tradedVolume >= tiers['taker'][i][0])
                taker = tiers['taker'][i][1];
        }
        for (let i = 0; i < tiers['maker'].length; i++) {
            if (tradedVolume >= tiers['maker'][i][0])
                maker = tiers['maker'][i][1];
        }
        return {
            'info': response,
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (market['darkpool'])
            throw new ExchangeError (this.id + ' does not provide an order book for darkpool symbol ' + symbol);
        let request = {
            'pair': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['count'] = limit; // 100
        let response = await this.publicGetDepth (this.extend (request, params));
        let orderbook = response['result'][market['id']];
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let baseVolume = parseFloat (ticker['v'][1]);
        let vwap = parseFloat (ticker['p'][1]);
        let quoteVolume = baseVolume * vwap;
        let last = parseFloat (ticker['c'][0]);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h'][1]),
            'low': parseFloat (ticker['l'][1]),
            'bid': parseFloat (ticker['b'][0]),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['a'][0]),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let pairs = [];
        for (let s = 0; s < this.symbols.length; s++) {
            let symbol = this.symbols[s];
            let market = this.markets[symbol];
            if (market['active'])
                if (!market['darkpool'])
                    pairs.push (market['id']);
        }
        let filter = pairs.join (',');
        let response = await this.publicGetTicker (this.extend ({
            'pair': filter,
        }, params));
        let tickers = response['result'];
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
        let darkpool = symbol.indexOf ('.d') >= 0;
        if (darkpool)
            throw new ExchangeError (this.id + ' does not provide a ticker for darkpool symbol ' + symbol);
        let market = this.market (symbol);
        let response = await this.publicGetTicker (this.extend ({
            'pair': market['id'],
        }, params));
        let ticker = response['result'][market['id']];
        return this.parseTicker (ticker, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[6]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (typeof since !== 'undefined')
            request['since'] = parseInt (since / 1000);
        let response = await this.publicGetOHLC (this.extend (request, params));
        let ohlcvs = response['result'][market['id']];
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        let order = undefined;
        let fee = undefined;
        if (!market)
            market = this.findMarketByAltnameOrId (trade['pair']);
        if ('ordertxid' in trade) {
            order = trade['ordertxid'];
            id = trade['id'];
            timestamp = parseInt (trade['time'] * 1000);
            side = trade['type'];
            type = trade['ordertype'];
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'vol');
            if ('fee' in trade) {
                let currency = undefined;
                if (market)
                    currency = market['quote'];
                fee = {
                    'cost': this.safeFloat (trade, 'fee'),
                    'currency': currency,
                };
            }
        } else {
            timestamp = parseInt (trade[2] * 1000);
            side = (trade[3] === 's') ? 'sell' : 'buy';
            type = (trade[4] === 'l') ? 'limit' : 'market';
            price = parseFloat (trade[0]);
            amount = parseFloat (trade[1]);
            let tradeLength = trade.length;
            if (tradeLength > 6)
                id = trade[6]; // artificially added as per #1794
        }
        let symbol = (market) ? market['symbol'] : undefined;
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let id = market['id'];
        let response = await this.publicGetTrades (this.extend ({
            'pair': id,
        }, params));
        // { result: { marketid: [ ... trades ] }, last: "last_trade_id"}
        let result = response['result'];
        let trades = result[id];
        // trades is a sorted array: last (most recent trade) goes last
        let length = trades.length;
        if (length <= 0)
            return [];
        let lastTrade = trades[length - 1];
        let lastTradeId = this.safeString (result, 'last');
        lastTrade.push (lastTradeId);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let balances = this.safeValue (response, 'result');
        if (typeof balances === 'undefined')
            throw new ExchangeNotAvailable (this.id + ' fetchBalance failed due to a malformed response ' + this.json (response));
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let code = currency;
            if (code in this.currencies_by_id) {
                code = this.currencies_by_id[code]['code'];
            } else {
                // X-ISO4217-A3 standard currency codes
                if (code[0] === 'X') {
                    code = code.slice (1);
                } else if (code[0] === 'Z') {
                    code = code.slice (1);
                }
                code = this.commonCurrencyCode (code);
            }
            let balance = parseFloat (balances[currency]);
            let account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit')
            order['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostAddOrder (this.extend (order, params));
        let id = this.safeValue (response['result'], 'txid');
        if (typeof id !== 'undefined') {
            if (Array.isArray (id)) {
                let length = id.length;
                id = (length > 1) ? id : id[0];
            }
        }
        return {
            'info': response,
            'id': id,
        };
    }

    findMarketByAltnameOrId (id) {
        if (id in this.marketsByAltname) {
            return this.marketsByAltname[id];
        } else if (id in this.markets_by_id) {
            return this.markets_by_id[id];
        }
        return undefined;
    }

    parseOrder (order, market = undefined) {
        let description = order['descr'];
        let side = description['type'];
        let type = description['ordertype'];
        let symbol = undefined;
        if (typeof market === 'undefined')
            market = this.findMarketByAltnameOrId (description['pair']);
        let timestamp = parseInt (order['opentm'] * 1000);
        let amount = this.safeFloat (order, 'vol');
        let filled = this.safeFloat (order, 'vol_exec');
        let remaining = amount - filled;
        let fee = undefined;
        let cost = this.safeFloat (order, 'cost');
        let price = this.safeFloat (description, 'price');
        if (!price)
            price = this.safeFloat (order, 'price');
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            if ('fee' in order) {
                let flags = order['oflags'];
                let feeCost = this.safeFloat (order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf ('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                } else if (flags.indexOf ('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': order['status'],
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined) {
        let result = [];
        let ids = Object.keys (orders);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.parseOrder (order, market));
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostQueryOrders (this.extend ({
            'trades': true, // whether or not to include trades in output (optional, default false)
            'txid': id, // comma delimited list of transaction ids to query info about (20 maximum)
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        }, params));
        let orders = response['result'];
        let order = this.parseOrder (this.extend ({ 'id': id }, orders[id]));
        return this.extend ({ 'info': response }, order);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            // 'type': 'all', // any position, closed position, closing position, no position
            // 'trades': false, // whether or not to include trades related to position in output
            // 'start': 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
            // 'end': 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
            // 'ofs' = result offset
        };
        if (typeof since !== 'undefined')
            request['start'] = parseInt (since / 1000);
        let response = await this.privatePostTradesHistory (this.extend (request, params));
        let trades = response['result']['trades'];
        let ids = Object.keys (trades);
        for (let i = 0; i < ids.length; i++) {
            trades[ids[i]]['id'] = ids[i];
        }
        let result = this.parseTrades (trades, undefined, since, limit);
        if (typeof symbol === 'undefined')
            return result;
        return this.filterBySymbol (result, symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'txid': id,
            }, params));
        } catch (e) {
            if (this.last_http_response)
                if (this.last_http_response.indexOf ('EOrder:Unknown order') >= 0)
                    throw new OrderNotFound (this.id + ' cancelOrder() error ' + this.last_http_response);
            throw e;
        }
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof since !== 'undefined')
            request['start'] = parseInt (since / 1000);
        let response = await this.privatePostOpenOrders (this.extend (request, params));
        let orders = this.parseOrders (response['result']['open'], undefined, since, limit);
        if (typeof symbol === 'undefined')
            return orders;
        return this.filterBySymbol (orders, symbol);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof since !== 'undefined')
            request['start'] = parseInt (since / 1000);
        let response = await this.privatePostClosedOrders (this.extend (request, params));
        let orders = this.parseOrders (response['result']['closed'], undefined, since, limit);
        if (typeof symbol === 'undefined')
            return orders;
        return this.filterBySymbol (orders, symbol);
    }

    async fetchDepositMethods (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostDepositMethods (this.extend ({
            'asset': currency['id'],
        }, params));
        return response['result'];
    }

    async createDepositAddress (code, params = {}) {
        let request = {
            'new': 'true',
        };
        let response = await this.fetchDepositAddress (code, this.extend (request, params));
        let address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        // eslint-disable-next-line quotes
        let method = this.safeString (params, 'method');
        if (typeof method === 'undefined') {
            if (this.options['cacheDepositMethodsOnFetchDepositAddress']) {
                // cache depositMethods
                if (!(code in this.options['depositMethods']))
                    this.options['depositMethods'][code] = await this.fetchDepositMethods (code);
                method = this.options['depositMethods'][code][0]['method'];
            } else {
                throw new ExchangeError (this.id + ' fetchDepositAddress() requires an extra `method` parameter. Use fetchDepositMethods ("' + code + '") to get a list of available deposit methods or enable the exchange property .options["cacheDepositMethodsOnFetchDepositAddress"] = true');
            }
        }
        let request = {
            'asset': currency['id'],
            'method': method,
        };
        let response = await this.privatePostDepositAddresses (this.extend (request, params)); // overwrite methods
        let result = response['result'];
        let numResults = result.length;
        if (numResults < 1)
            throw new InvalidAddress (this.id + ' privatePostDepositAddresses() returned no addresses');
        let address = this.safeString (result[0], 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        if ('key' in params) {
            await this.loadMarkets ();
            let response = await this.privatePostWithdraw (this.extend ({
                'asset': currency,
                'amount': amount,
                // 'address': address, // they don't allow withdrawals to direct addresses
            }, params));
            return {
                'info': response,
                'id': response['result'],
            };
        }
        throw new ExchangeError (this.id + " withdraw requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            let auth = this.encode (nonce + body);
            let hash = this.hash (auth, 'sha256', 'binary');
            let binary = this.stringToBinary (this.encode (url));
            let binhash = this.binaryConcat (binary, hash);
            let secret = this.base64ToBinary (this.secret);
            let signature = this.hmac (binhash, secret, 'sha512', 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': this.decode (signature),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            url = '/' + path;
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body.indexOf ('Invalid order') >= 0)
            throw new InvalidOrder (this.id + ' ' + body);
        if (body.indexOf ('Invalid nonce') >= 0)
            throw new InvalidNonce (this.id + ' ' + body);
        if (body.indexOf ('Insufficient funds') >= 0)
            throw new InsufficientFunds (this.id + ' ' + body);
        if (body.indexOf ('Cancel pending') >= 0)
            throw new CancelPending (this.id + ' ' + body);
        if (body.indexOf ('Invalid arguments:volume') >= 0)
            throw new InvalidOrder (this.id + ' ' + body);
        if (body[0] === '{') {
            let response = JSON.parse (body);
            if (typeof response !== 'string') {
                if ('error' in response) {
                    let numErrors = response['error'].length;
                    if (numErrors) {
                        let message = this.id + ' ' + this.json (response);
                        for (let i = 0; i < response['error'].length; i++) {
                            if (response['error'][i] in this.exceptions) {
                                throw new this.exceptions[response['error'][i]] (message);
                            }
                        }
                        throw new ExchangeError (message);
                    }
                }
            }
        }
    }
};
