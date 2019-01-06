'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, RequestTimeout, AuthenticationError, PermissionDenied, DDoSProtection, InsufficientFunds, OrderNotFound, OrderNotCached, InvalidOrder, AccountSuspended, CancelPending, InvalidNonce } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class poloniex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': [ 'US' ],
            'rateLimit': 1000, // up to 6 calls per second
            'has': {
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'editOrder': true,
                'createMarketOrder': false,
                'fetchOHLCV': true,
                'fetchOrderTrades': true,
                'fetchMyTrades': true,
                'fetchOrderBooks': true,
                'fetchOrder': 'emulated',
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': true,
                'fetchTradingFees': true,
                'fetchCurrencies': true,
                'withdraw': true,
                'fetchTransactions': true,
                'fetchWithdrawals': 'emulated', // but almost true )
                'fetchDeposits': 'emulated',
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://poloniex.com',
                'doc': [
                    'https://poloniex.com/support/api/',
                    'http://pastebin.com/dMX7mZE0',
                ],
                'fees': 'https://poloniex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
            // Fees are tier-based. More info: https://poloniex.com/fees/
            // Rates below are highest possible.
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.002,
                },
                'funding': {},
            },
            'limits': {
                'amount': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'APH': 'AphroditeCoin',
                'BCC': 'BTCtalkcoin',
                'BDG': 'Badgercoin',
                'BTM': 'Bitmark',
                'CON': 'Coino',
                'GOLD': 'GoldEagles',
                'GPUC': 'GPU',
                'HOT': 'Hotcoin',
                'ITC': 'Information Coin',
                'PLX': 'ParallaxCoin',
                'KEY': 'KEYCoin',
                'STR': 'XLM',
                'SOC': 'SOCC',
                'XAP': 'API Coin',
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.0001,
                            'XMR': 0.0001,
                            'USDT': 1.0,
                        },
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'You may only place orders that reduce your position.': InvalidOrder,
                    'Invalid order number, or you are not the person who placed the order.': OrderNotFound,
                    'Permission denied': PermissionDenied,
                    'Connection timed out. Please try again.': RequestTimeout,
                    'Internal error. Please try again.': ExchangeNotAvailable,
                    'Order not found, or you are not the person who placed it.': OrderNotFound,
                    'Invalid API key/secret pair.': AuthenticationError,
                    'Please do not make more than 8 API calls per second.': DDoSProtection,
                    'Rate must be greater than zero.': InvalidOrder, // {"error":"Rate must be greater than zero."}
                },
                'broad': {
                    'Total must be at least': InvalidOrder, // {"error":"Total must be at least 0.0001."}
                    'This account is frozen.': AccountSuspended,
                    'Not enough': InsufficientFunds,
                    'Nonce must be greater': InvalidNonce,
                    'You have already called cancelOrder or moveOrder on this order.': CancelPending,
                    'Amount must be at least': InvalidOrder, // {"error":"Amount must be at least 0.000001."}
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
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['date'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['quoteVolume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (since === undefined)
            since = 0;
        let request = {
            'currencyPair': market['id'],
            'period': this.timeframes[timeframe],
            'start': parseInt (since / 1000),
        };
        if (limit !== undefined)
            request['end'] = this.sum (request['start'], limit * this.timeframes[timeframe]);
        let response = await this.publicGetReturnChartData (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetReturnTicker ();
        let keys = Object.keys (markets);
        let result = [];
        for (let p = 0; p < keys.length; p++) {
            let id = keys[p];
            let market = markets[id];
            let [ quoteId, baseId ] = id.split ('_');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let minCost = this.safeFloat (this.options['limits']['cost']['min'], quote, 0.0);
            let precision = {
                'amount': 6,
                'price': 8,
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': market['isFrozen'] !== '1',
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
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostReturnCompleteBalances (this.extend ({
            'account': 'all',
        }, params));
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let c = 0; c < currencies.length; c++) {
            let id = currencies[c];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['onOrders']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let fees = await this.privatePostReturnFeeInfo ();
        return {
            'info': fees,
            'maker': this.safeFloat (fees, 'makerFee'),
            'taker': this.safeFloat (fees, 'takerFee'),
            'withdraw': {},
            'deposit': {},
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currencyPair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        let response = await this.publicGetReturnOrderBook (this.extend (request, params));
        let orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'seq');
        return orderbook;
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'currencyPair': 'all',
        };
        //
        //     if (limit !== undefined) {
        //         request['depth'] = limit; // 100
        //     }
        //
        let response = await this.publicGetReturnOrderBook (this.extend (request, params));
        let marketIds = Object.keys (response);
        let result = {};
        for (let i = 0; i < marketIds.length; i++) {
            let marketId = marketIds[i];
            let symbol = undefined;
            if (marketId in this.markets_by_id) {
                symbol = this.markets_by_id[marketId]['symbol'];
            } else {
                let [ quoteId, baseId ] = marketId.split ('_');
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            let orderbook = this.parseOrderBook (response[marketId]);
            orderbook['nonce'] = this.safeInteger (response[marketId], 'seq');
            result[symbol] = orderbook;
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let open = undefined;
        let change = undefined;
        let average = undefined;
        let last = this.safeFloat (ticker, 'last');
        let relativeChange = this.safeFloat (ticker, 'percentChange');
        if (relativeChange !== -1) {
            open = last / this.sum (1, relativeChange);
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': relativeChange * 100,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetReturnTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let [ quoteId, baseId ] = id.split ('_');
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetReturnCurrencies (params);
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let precision = 8; // default precision, todo: fix "magic constants"
            let code = this.commonCurrencyCode (id);
            let active = (currency['delisted'] === 0) && !currency['disabled'];
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': this.safeFloat (currency, 'txFee'), // todo: redesign
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
                        'min': currency['txFee'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetReturnTicker (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['date']);
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if ((!market) && ('currencyPair' in trade)) {
            let currencyPair = trade['currencyPair'];
            if (currencyPair in this.markets_by_id) {
                market = this.markets_by_id[currencyPair];
            } else {
                let parts = currencyPair.split ('_');
                quote = parts[0];
                base = parts[1];
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let side = trade['type'];
        let fee = undefined;
        let cost = this.safeFloat (trade, 'total');
        let amount = this.safeFloat (trade, 'amount');
        if ('fee' in trade) {
            let rate = this.safeFloat (trade, 'fee');
            let feeCost = undefined;
            let currency = undefined;
            if (side === 'buy') {
                currency = base;
                feeCost = amount * rate;
            } else {
                currency = quote;
                if (cost !== undefined)
                    feeCost = cost * rate;
            }
            fee = {
                'type': undefined,
                'rate': rate,
                'cost': feeCost,
                'currency': currency,
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tradeID'),
            'order': this.safeString (trade, 'orderNumber'),
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (trade, 'rate'),
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currencyPair': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds (); // last 50000 trades by default
        }
        let trades = await this.publicGetReturnTradeHistory (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let request = { 'currencyPair': pair };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
            request['end'] = this.seconds () + 1; // adding 1 is a fix for #3411
        }
        // limit is disabled (does not really work as expected)
        if (limit !== undefined)
            request['limit'] = parseInt (limit);
        let response = await this.privatePostReturnTradeHistory (this.extend (request, params));
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (response, market);
        } else {
            if (response) {
                let ids = Object.keys (response);
                for (let i = 0; i < ids.length; i++) {
                    let id = ids[i];
                    let market = undefined;
                    if (id in this.markets_by_id) {
                        market = this.markets_by_id[id];
                        let trades = this.parseTrades (response[id], market);
                        for (let j = 0; j < trades.length; j++) {
                            result.push (trades[j]);
                        }
                    } else {
                        let [ baseId, quoteId ] = id.split ('_');
                        let base = this.commonCurrencyCode (baseId);
                        let quote = this.commonCurrencyCode (quoteId);
                        let symbol = base + '/' + quote;
                        let trades = response[id];
                        for (let j = 0; j < trades.length; j++) {
                            result.push (this.extend (this.parseTrade (trades[j]), {
                                'symbol': symbol,
                            }));
                        }
                    }
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'timestamp');
        if (!timestamp)
            timestamp = this.parse8601 (order['date']);
        let trades = undefined;
        if ('resultingTrades' in order)
            trades = this.parseTrades (order['resultingTrades'], market);
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let price = this.safeFloat (order, 'price');
        let remaining = this.safeFloat (order, 'amount');
        let amount = this.safeFloat (order, 'startingAmount', remaining);
        let filled = undefined;
        let cost = 0;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                if (price !== undefined)
                    cost = filled * price;
            }
        }
        if (filled === undefined) {
            if (trades !== undefined) {
                filled = 0;
                cost = 0;
                for (let i = 0; i < trades.length; i++) {
                    let trade = trades[i];
                    let tradeAmount = trade['amount'];
                    let tradePrice = trade['price'];
                    filled = this.sum (filled, tradeAmount);
                    cost += tradePrice * tradeAmount;
                }
            }
        }
        return {
            'info': order,
            'id': order['orderNumber'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': order['status'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
        };
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            let extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined)
            market = this.market (symbol);
        let pair = market ? market['id'] : 'all';
        let response = await this.privatePostReturnOpenOrders (this.extend ({
            'currencyPair': pair,
        }));
        let openOrders = [];
        if (market !== undefined) {
            openOrders = this.parseOpenOrders (response, market, openOrders);
        } else {
            let marketIds = Object.keys (response);
            for (let i = 0; i < marketIds.length; i++) {
                let marketId = marketIds[i];
                let orders = response[marketId];
                let m = this.markets_by_id[marketId];
                openOrders = this.parseOpenOrders (orders, m, openOrders);
            }
        }
        for (let j = 0; j < openOrders.length; j++) {
            this.orders[openOrders[j]['id']] = openOrders[j];
        }
        let openOrdersIndexedById = this.indexBy (openOrders, 'id');
        let cachedOrderIds = Object.keys (this.orders);
        let result = [];
        for (let k = 0; k < cachedOrderIds.length; k++) {
            let id = cachedOrderIds[k];
            if (id in openOrdersIndexedById) {
                this.orders[id] = this.extend (this.orders[id], openOrdersIndexedById[id]);
            } else {
                let order = this.orders[id];
                if (order['status'] === 'open') {
                    order = this.extend (order, {
                        'status': 'closed',
                        'cost': undefined,
                        'filled': order['amount'],
                        'remaining': 0.0,
                    });
                    if (order['cost'] === undefined) {
                        if (order['filled'] !== undefined)
                            order['cost'] = order['filled'] * order['price'];
                    }
                    this.orders[id] = order;
                }
            }
            let order = this.orders[id];
            if (market !== undefined) {
                if (order['symbol'] === symbol)
                    result.push (order);
            } else {
                result.push (order);
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let since = this.safeValue (params, 'since');
        let limit = this.safeValue (params, 'limit');
        let request = this.omit (params, [ 'since', 'limit' ]);
        let orders = await this.fetchOrders (symbol, since, limit, request);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['id'] === id)
                return orders[i];
        }
        throw new OrderNotCached (this.id + ' order id ' + id.toString () + ' is not in "open" state and not found in cache');
    }

    filterOrdersByStatus (orders, status) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status)
                result.push (orders[i]);
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'closed');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let market = this.market (symbol);
        let request = {
            'currencyPair': market['id'],
            'rate': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        let response = await this[method] (this.extend (request, params));
        let timestamp = this.milliseconds ();
        let order = this.parseOrder (this.extend ({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market);
        let id = order['id'];
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        price = parseFloat (price);
        let request = {
            'orderNumber': id,
            'rate': this.priceToPrecision (symbol, price),
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        let response = await this.privatePostMoveOrder (this.extend (request, params));
        let result = undefined;
        if (id in this.orders) {
            this.orders[id]['status'] = 'canceled';
            let newid = response['orderNumber'];
            this.orders[newid] = this.extend (this.orders[id], {
                'id': newid,
                'price': price,
                'status': 'open',
            });
            if (amount !== undefined)
                this.orders[newid]['amount'] = amount;
            result = this.extend (this.orders[newid], { 'info': response });
        } else {
            let market = undefined;
            if (symbol !== undefined)
                market = this.market (symbol);
            result = this.parseOrder (response, market);
            this.orders[result['id']] = result;
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'orderNumber': id,
            }, params));
        } catch (e) {
            if (e instanceof CancelPending) {
                // A request to cancel the order has been sent already.
                // If we then attempt to cancel the order the second time
                // before the first request is processed the exchange will
                // throw a CancelPending exception. Poloniex won't show the
                // order in the list of active (open) orders and the cached
                // order will be marked as 'closed' (see #1801 for details).
                // To avoid that we proactively mark the order as 'canceled'
                // here. If for some reason the order does not get canceled
                // and still appears in the active list then the order cache
                // will eventually get back in sync on a call to `fetchOrder`.
                if (id in this.orders)
                    this.orders[id]['status'] = 'canceled';
            }
            throw e;
        }
        if (id in this.orders)
            this.orders[id]['status'] = 'canceled';
        return response;
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let orders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        let indexed = this.indexBy (orders, 'id');
        return (id in indexed) ? 'open' : 'closed';
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let trades = await this.privatePostReturnOrderTrades (this.extend ({
            'orderNumber': id,
        }, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostGenerateNewAddress ({
            'currency': currency['id'],
        });
        let address = undefined;
        let tag = undefined;
        if (response['success'] === 1)
            address = this.safeString (response, 'response');
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostReturnDepositAddresses ();
        let currencyId = currency['id'];
        let address = this.safeString (response, currencyId);
        let tag = undefined;
        this.checkAddress (address);
        const depositAddress = this.safeString (currency['info'], 'depositAddress');
        if (depositAddress !== undefined) {
            tag = address;
            address = depositAddress;
        }
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
            'amount': amount,
            'address': address,
        };
        if (tag)
            request['paymentId'] = tag;
        let result = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': result,
            'id': result['response'],
        };
    }

    async fetchTransactionsHelper (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const year = 31104000; // 60 * 60 * 24 * 30 * 12 = one year of history, why not
        const now = this.seconds ();
        let start = (since !== undefined) ? parseInt (since / 1000) : now - 10 * year;
        let request = {
            'start': start, // UNIX timestamp, required
            'end': now, // UNIX timestamp, required
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privatePostReturnDepositsWithdrawals (this.extend (request, params));
        //
        //     {    deposits: [ {      currency: "BTC",
        //                              address: "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //                               amount: "0.01063000",
        //                        confirmations:  1,
        //                                 txid: "952b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //                            timestamp:  1507916888,
        //                               status: "COMPLETE"                                                          },
        //                      {      currency: "ETH",
        //                              address: "0x20108ba20b65c04d82909e91df06618107460197",
        //                               amount: "4.00000000",
        //                        confirmations:  38,
        //                                 txid: "0x4be260073491fe63935e9e0da42bd71138fdeb803732f41501015a2d46eb479d",
        //                            timestamp:  1525060430,
        //                               status: "COMPLETE"                                                            }  ],
        //       withdrawals: [ { withdrawalNumber:  8224394,
        //                                currency: "EMC2",
        //                                 address: "EYEKyCrqTNmVCpdDV8w49XvSKRP9N3EUyF",
        //                                  amount: "63.10796020",
        //                                     fee: "0.01000000",
        //                               timestamp:  1510819838,
        //                                  status: "COMPLETE: d37354f9d02cb24d98c8c4fc17aa42f475530b5727effdf668ee5a43ce667fd6",
        //                               ipAddress: "5.220.220.200"                                                               },
        //                      { withdrawalNumber:  9290444,
        //                                currency: "ETH",
        //                                 address: "0x191015ff2e75261d50433fbd05bd57e942336149",
        //                                  amount: "0.15500000",
        //                                     fee: "0.00500000",
        //                               timestamp:  1514099289,
        //                                  status: "COMPLETE: 0x12d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //                               ipAddress: "5.228.227.214"                                                                 },
        //                      { withdrawalNumber:  11518260,
        //                                currency: "BTC",
        //                                 address: "8JoDXAmE1GY2LRK8jD1gmAmgRPq54kXJ4t",
        //                                  amount: "0.20000000",
        //                                     fee: "0.00050000",
        //                               timestamp:  1527918155,
        //                                  status: "COMPLETE: 1864f4ebb277d90b0b1ff53259b36b97fa1990edc7ad2be47c5e0ab41916b5ff",
        //                               ipAddress: "211.8.195.26"                                                                }    ] }
        //
        return response;
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        let deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        let transactions = this.arrayConcat (deposits, withdrawals);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['withdrawals'].length; i++) {
            response['withdrawals'][i]['type'] = 'withdrawal';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let withdrawals = this.parseTransactions (response['withdrawals'], currency, since, limit);
        return this.filterByCurrencySinceLimit (withdrawals, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        let response = await this.fetchTransactionsHelper (code, since, limit, params);
        for (let i = 0; i < response['deposits'].length; i++) {
            response['deposits'][i]['type'] = 'deposit';
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        let deposits = this.parseTransactions (response['deposits'], currency, since, limit);
        return this.filterByCurrencySinceLimit (deposits, code, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'COMPLETE': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // deposits
        //
        //      {      currency: "BTC",
        //              address: "1MEtiqJWru53FhhHrfJPPvd2tC3TPDVcmW",
        //               amount: "0.01063000",
        //        confirmations:  1,
        //                 txid: "6b2b0e1888d6d491591facc0d37b5ebec540ac1efb241fdbc22bcc20d1822fb6",
        //            timestamp:  1507916888,
        //               status: "COMPLETE"                                                          }
        //
        // withdrawals
        //
        //      { withdrawalNumber:  9290444,
        //                currency: "ETH",
        //                 address: "0x731015ff2e75261d50433fbd05bd57e942336149",
        //                  amount: "0.15500000",
        //                     fee: "0.00500000",
        //               timestamp:  1514099289,
        //                  status: "COMPLETE: 0x74d444493b4bca668992021fd9e54b5292b8e71d9927af1f076f554e4bea5b2d",
        //               ipAddress: "5.228.227.214"                                                                 },
        //
        let timestamp = this.safeInteger (transaction, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let code = undefined;
        let currencyId = this.safeString (transaction, 'currency');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency === undefined) {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let status = this.safeString (transaction, 'status', 'pending');
        let txid = this.safeString (transaction, 'txid');
        if (status !== undefined) {
            let parts = status.split (': ');
            let numParts = parts.length;
            status = parts[0];
            if ((numParts > 1) && (txid === undefined)) {
                txid = parts[1];
            }
            status = this.parseTransactionStatus (status);
        }
        const id = this.safeString (transaction, 'withdrawalNumber');
        const type = (id !== undefined) ? 'withdrawal' : 'deposit';
        let amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        let feeCost = this.safeFloat (transaction, 'fee');
        if (type === 'deposit') {
            if (feeCost === undefined) {
                // according to https://poloniex.com/fees/
                feeCost = 0; // FIXME: remove hardcoded value that may change any time
            }
        } else {
            // poloniex withdrawal amount includes the fee
            amount = amount - feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.extend ({ 'command': path }, params);
        if (api === 'public') {
            url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query['nonce'] = this.nonce ();
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        // {"error":"Permission denied."}
        if ('error' in response) {
            const message = response['error'];
            const feedback = this.id + ' ' + this.json (response);
            let exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
