'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const {
    ArgumentsRequired,
    BadSymbol,
    PermissionDenied,
    ExchangeError,
    ExchangeNotAvailable,
    OrderNotFound,
    InsufficientFunds,
    InvalidOrder,
    RequestTimeout,
    AuthenticationError,
} = require ('./base/errors');
const {
    TRUNCATE,
    DECIMAL_PLACES,
    TICK_SIZE,
} = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class decoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'decoin',
            'name': 'Decoin',
            'countries': [ 'EN', 'JA', 'ZH', 'KO', 'PT', 'RU' ],
            'rateLimit': 1500,
            'version': '*',
            'has': {
                'createDepositAddress': false,
                'fetchDepositAddress': true,
                'CORS': false,
                'editOrder': false,
                'fetchCurrencies': true,
                'fetchOHLCV': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchMyTrades': true,
                'fetchTrades': true,
                'withdraw': true,
                'fetchOrderTrades': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
                'fetchTradingFees': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
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
                'logo': 'http://cdn1.decoin.io/images/logo.png',
                'api': {
                    'public': 'https://apiv1.decoin.io',
                    'private': 'https://apiv1.decoin.io',
                },
                'www': 'https://www.decoin.io',
                'doc': [
                    'https://github.com/decoin-exchange/decoin-official-api-docs/blob/master/rest-api.md',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'market/get-currencies',
                        'market/get-ticker',
                        'market/get-ticker/{symbol}',
                        'market/get-market-history/{symbol}',
                        'market/get-orderbook/{symbol}',
                        'market/get-chart-data',
                        'market/exchangeInfo',
                    ],
                },
                'private': {
                    'get': [
                        'trade/actual-fee-rates',
                        'wallet/get-wallets',
                        'trade/get-wallet-history',
                        'trade/get-deposit-history',
                        'order/get-order',
                        'market/get-user-market',
                        'wallet/funding-limits',
                        'order/getall',
                    ],
                    'post': [
                        'order/create-order',
                        'wallet/withdraw-funds',
                        'order/cancel-order',
                    ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.15,
                    'taker': 0.15,
                },
            },
            'options': {
                'defaultTimeInForce': 'FOK',
                'symbolSeparator': '-',
            },
            'commonCurrencies': {
                'DTEP': 'DTEP',
                'USDT': 'USDT',
                'BTC': 'BTC',
            },
            'exceptions': {
                '504': RequestTimeout, // {'error':{'code':504,'message':'Gateway Timeout'}}
                '1002': AuthenticationError, // {'error':{'code':1002,'message':'Authorization failed','description':''}}
                '1003': PermissionDenied, // 'Action is forbidden for this API key'
                '2010': InvalidOrder, // 'Quantity not a valid number'
                '2001': BadSymbol, // 'Symbol not found'
                '2011': InvalidOrder, // 'Quantity too low'
                '2020': InvalidOrder, // 'Price not a valid number'
                '20002': OrderNotFound, // canceling non-existent order
                '20001': InsufficientFunds, // {'error':{'code':20001,'message':'Insufficient funds','description':'Check that the funds are sufficient, given commissions'}}
            },
        });
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, 8, DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        // public
        const response = await this.publicGetMarketExchangeInfo (params);
        const result = [];
        for (let i = 0; i < response['Symbols'].length; i++) {
            const market = response['Symbols'][i];
            const PairSymbol = response['Symbols'][i]['Symbol'];
            const ar = PairSymbol.split ('/');
            const baseId = ar[0];
            const quoteId = ar[1];
            const id = baseId + this.options['symbolSeparator'] + quoteId;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const pricePrecision = this.safeInteger (market, 'precision', 8);
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            const taker = 0.15;
            const maker = 0.15;
            result.push (
                this.extend (this.fees['trading'], {
                    'info': market,
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': true,
                    'taker': taker,
                    'maker': maker,
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
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                })
            );
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        // public
        const response = await this.publicGetMarketGetCurrencies (params);
        //
        //     [
        //         {
        //             "id":"DDF",
        //             "fullName":"DDF",
        //             "crypto":true,
        //             "payinEnabled":false,
        //             "payinPaymentId":false,
        //             "payinConfirmations":20,
        //             "payoutEnabled":true,
        //             "payoutIsPaymentId":false,
        //             "transferEnabled":true,
        //             "delisted":false,
        //             "payoutFee":"646.000000000000"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'Symbol');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const precision = 8; // default precision, todo: fix 'magic constants'
            const code = this.safeCurrencyCode (id);
            const active = true;
            // let type = 'fiat';
            // if ('crypto' in currency && currency['crypto']) {
            //     type = 'crypto';
            // }
            const name = this.safeString (currency, 'Name');
            result[code] = {
                'id': id,
                'code': code,
                'type': undefined,
                'info': currency,
                'name': name,
                'active': active,
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
        const response = await this.privateGetTradeActualFeeRates (params);
        for (let i = 0; i < response.length; i++) {
            if (response[i]['Level'] === 1) {
                return {
                    'info': response[i],
                    'maker': this.safeFloat (response[i], 'MakerFee'),
                    'taker': this.safeFloat (response[i], 'TakerFee'),
                };
            }
        }
    }

    async fetchBalance (params = {}) {
        // private
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', 'wallet');
        const method = 'privateGet' + this.capitalize (type) + 'GetWallets';
        const request = this.extend ({
            'Currency': params,
        });
        // const query = params;
        const response = await this[method] (request);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'Name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'Available');
            account['total'] = this.safeFloat (balance, 'Balance');
            account['used'] = account['total'] - account['free'];
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         'timestamp':'2015-08-20T19:01:00.000Z',
        //         'open':'0.006',
        //         'close':'0.006',
        //         'min':'0.006',
        //         'max':'0.006',
        //         'volume':'0.003',
        //         'volumeQuote':'0.000018'
        //     }
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': market['id'],
            'tick': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = since;
            request['to'] = this.milliseconds ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const obj = [];
        const response = await this.publicGetMarketGetChartData (this.extend (request, params));
        for (let i = 0; i < response['c'].length; i++) {
            const arr = [];
            arr.push (this.safeString (response['t'], i) + '000');
            arr.push (response['o'][i]);
            arr.push (response['h'][i]);
            arr.push (response['l'][i]);
            arr.push (response['c'][i]);
            arr.push (response['v'][i]);
            obj.push (arr);
        }
        // if ('Message' in response) {
        //     throw new ExchangeError (response['Message']);
        // }
        //
        //     [
        //         {'timestamp':'2015-08-20T19:01:00.000Z','open':'0.006','close':'0.006','min':'0.006','max':'0.006','volume':'0.003','volumeQuote':'0.000018'},
        //         {'timestamp':'2015-08-20T19:03:00.000Z','open':'0.006','close':'0.006','min':'0.006','max':'0.006','volume':'0.013','volumeQuote':'0.000078'},
        //         {'timestamp':'2015-08-20T19:06:00.000Z','open':'0.0055','close':'0.005','min':'0.005','max':'0.0055','volume':'0.003','volumeQuote':'0.0000155'},
        //     ]
        //
        return this.parseOHLCVs (obj, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'symbol': symbol.replace ('/', '-'),
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 100, 0 = unlimited
        }
        const response = await this.publicGetMarketGetOrderbookSymbol (
            this.extend (request, params)
        );
        return this.parseOrderBook (
            response,
            undefined,
            'BuyOrders',
            'SellOrders',
            'Rate',
            'Quantity'
        );
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = ticker['Name'];
        if (market !== undefined) {
            symbol = ticker['Name'];
        }
        const baseVolume = this.safeFloat (ticker, 'volume');
        const quoteVolume = this.safeFloat (ticker, 'volumeQuote');
        const open = this.safeFloat (ticker, 'open');
        const last = this.safeFloat (ticker, 'LastPrice');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = (change / open) * 100;
            }
        }
        let vwap = undefined;
        if (quoteVolume !== undefined) {
            if (baseVolume !== undefined) {
                if (baseVolume > 0) {
                    vwap = quoteVolume / baseVolume;
                }
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'HighPrice'),
            'low': this.safeFloat (ticker, 'LowPrice'),
            'bid': this.safeFloat (ticker, 'BidPrice'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'AskPrice'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'last': last,
            'close': last,
            'previousClose': this.safeFloat (ticker, 'PrevDayPrice'),
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        // public
        await this.loadMarkets ();
        const response = await this.publicGetMarketGetTicker (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = response[i];
            const marketId = this.safeString (ticker, 'Name');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    const market = this.markets_by_id[marketId];
                    const symbol = market['symbol'];
                    result[symbol] = this.parseTicker (ticker, market);
                } else {
                    result[marketId] = this.parseTicker (ticker);
                }
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        // public
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['base'] + '-' + market['quote'],
        };
        const response = await this.publicGetMarketGetTickerSymbol (
            this.extend (request, params)
        );
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + response['message']);
        }
        return this.parseTicker (response[0], market);
    }

    parseTrade (trade, market = undefined) {
        //
        // createMarketOrder
        //
        //  {       fee: '0.0004644',
        //           id:  386394956,
        //        price: '0.4644',
        //     quantity: '1',
        //    timestamp: '2018-10-25T16:41:44.780Z' }
        //
        // fetchTrades ...
        //
        // fetchMyTrades ...
        //
        const timestamp = this.parse8601 (trade['Date']);
        let symbol = undefined;
        const marketId = this.safeString (trade, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                symbol = marketId;
            }
        }
        if (symbol === undefined && market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyCode = market ? market['feeCurrency'] : undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'clientOrderId');
        const price = this.safeFloat (trade, 'Rate');
        const amount = this.safeFloat (trade, 'Amount');
        const cost = price * amount;
        let side = this.safeString (trade, 'OrderType');
        if (side === '1') {
            side = 'sell';
        } else if (side === '0') {
            side = 'buy';
        }
        const id = this.safeString (trade, 'Id');
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        // private
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['name'];
        }
        if (since !== undefined) {
            request['Date'] = since.toString ();
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetTradeGetDepositHistory (
            this.extend (request, params)
        );
        const result = [];
        for (let i = 0; i < response.length; i++) {
            if (currency !== undefined) {
                if (response[i]['Currency'] === currency['name']) {
                    result.push (response[i]);
                }
            } else {
                result.push (response[i]);
            }
        }
        if (currency !== undefined) {
            return this.parseTransactions (result, currency['name'], since, limit);
        } else {
            return this.parseTransactions (result, currency, since, limit);
        }
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        // private
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['name'];
        }
        if (since !== undefined) {
            request['Date'] = since.toString ();
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetTradeGetDepositHistory (
            this.extend (request, params)
        );
        const result = [];
        for (let i = 0; i < response.length; i++) {
            if (currency !== undefined) {
                if (response[i]['Currency'] === currency['name']) {
                    result.push (response[i]);
                }
            } else {
                result.push (response[i]);
            }
        }
        if (currency !== undefined) {
            return this.parseTransactions (result, currency['name'], since, limit);
        } else {
            return this.parseTransactions (result, currency, since, limit);
        }
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'Id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'Date'));
        const updated = this.parse8601 (this.safeString (transaction, 'Date'));
        const currencyId = this.safeString (transaction, 'Currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (
            this.safeString (transaction, 'Status')
        );
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString (transaction, 'ToAddress');
        const txid = this.safeString (transaction, 'Txid');
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const type = this.parseTransactionType (
            this.safeString (transaction, 'type')
        );
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'failed': 'failed',
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'payin': 'deposit',
            'payout': 'withdrawal',
            'withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['base'] + '-' + market['quote'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['sort'] = 'ASC';
            request['from'] = this.iso8601 (since);
        }
        const response = await this.publicGetMarketGetMarketHistorySymbol (
            this.extend (request, params)
        );
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // private
        await this.loadMarkets ();
        const market = this.market (symbol);
        amount = parseFloat (amount);
        const request = {
            'OrderType': side,
            'PairName': market['id'],
            'Quantity': amount.toString (),
            'Type': type,
        };
        if (type === 'MarketOrder' && price !== undefined) {
            throw new InvalidOrder ('Price field is not required in MarketOrder');
        }
        if (type === 'LimitOrder') {
            request['Rate'] = price;
        } else if (type === 'StopOrder') {
            request['Rate'] = price;
            request['Stop'] = this.safeFloat (params, 'Stop');
        } else if (type === 'CocoOrder') {
            request['Rate'] = price;
            request['Stop'] = this.safeFloat (params, 'Stop');
            request['Limit'] = this.safeFloat (params, 'Limit');
        }
        const response = await this.privatePostOrderCreateOrder (
            this.extend (request, params)
        );
        if (!(response['Status'])) {
            throw new InvalidOrder (this.id + ' order was rejected by the exchange: ' + response['Message']);
        }
        const order = this.parseOrder (response['Result'], market);
        if (order['status'] === 'rejected') {
            throw new InvalidOrder (this.id + ' order was rejected by the exchange ' + this.json (order));
        }
        const id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'Id': id,
        };
        const response = await this.privatePostOrderCancelOrder (
            this.extend (request, params)
        );
        if ('Message' in response && !response['Status']) {
            throw new ExchangeError (response['Message']);
        }
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'complete',
            '2': 'cancelled',
            '3': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createMarketOrder
        //
        //   { clientOrderId:   'fe36aa5e190149bf9985fb673bbb2ea0',
        //         createdAt:   '2018-10-25T16:41:44.780Z',
        //       cumQuantity:   '1',
        //                id:   '66799540063',
        //          quantity:   '1',
        //              side:   'sell',
        //            status:   'filled',
        //            symbol:   'XRPUSDT',
        //       timeInForce:   'FOK',
        //      tradesReport: [ {       fee: '0.0004644',
        //                               id:  386394956,
        //                            price: '0.4644',
        //                         quantity: '1',
        //                        timestamp: '2018-10-25T16:41:44.780Z' } ],
        //              type:   'market',
        //         updatedAt:   '2018-10-25T16:41:44.780Z'                   }
        //
        const created = this.parse8601 (this.safeString (order, 'DateAdded'));
        const updated = this.parse8601 (this.safeString (order, 'LastUpdated'));
        const marketId = this.safeString (market, 'symbol');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                symbol = marketId;
            } else {
                symbol = marketId;
            }
        } else {
            symbol = this.safeString (order, 'Name');
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = this.safeString (market, 'id');
            }
        }
        const amount = this.safeFloat (order, 'Quantity');
        const remaining = this.safeFloat (order, 'QuantityRemaining');
        const filled = amount - remaining;
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const id = this.safeString (order, 'Id');
        const price = this.safeFloat (order, 'Rate');
        let type = this.safeString (order, 'Type');
        if (type === '0') {
            type = 'market';
        } else if (type === '1') {
            type = 'limit';
        } else if (type === '2') {
            type = 'stop_limit';
        } else if (type === '3') {
            type = 'coco_limit';
        } else if (type === '4') {
            type = 'coco_stop';
        }
        let side = this.safeString (order, 'OrderType');
        if (side === '0') {
            side = 'buy';
        } else {
            side = 'sell';
        }
        const trades = this.safeValue (order, 'tradesReport');
        const fee = this.safeValue (order, 'Fee');
        const average = undefined;
        return {
            'id': id,
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'trades': trades,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // private
        await this.loadMarkets ();
        const request = {
            'Id': id,
        };
        const response = await this.privateGetOrderGetOrder (
            this.extend (request, params)
        );
        if (response === '') {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        if ('Message' in response) {
            throw new ExchangeError (response['Message']);
        }
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'PairName': market['id'],
        };
        if (since !== undefined) {
            request['Date'] = since.toString ();
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetOrderGetall (
            this.extend (request, params)
        );
        const numOrders = response.length;
        if (numOrders > 0) {
            return this.parseOrders (response, market, since, limit);
        }
        throw new OrderNotFound (this.id + ' orders not found');
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['name'];
        }
        if (since !== undefined) {
            request['Date'] = since;
        }
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetTradeGetWalletHistory (
            this.extend (request, params)
        );
        if (currency !== undefined) {
            return this.parseTransactions (response, currency['name'], since, limit);
        } else {
            return this.parseTransactions (response, currency, since, limit);
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['PairName'] = market['id'];
            request['Status'] = 'Open';
        }
        const response = await this.privateGetOrderGetall (
            this.extend (request, params)
        );
        return this.parseOrders (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = { };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['Id'] = market['base'] + '-' + market['quote'];
        }
        if (since !== undefined) {
            request['Lastdate'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetMarketGetUserMarket (
            this.extend (request, params)
        );
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'Currency': currency['name'],
        };
        const response = await this.privateGetWalletGetWallets (
            this.extend (request, params)
        );
        const address = this.safeString (response[0], 'Address');
        this.checkAddress (address);
        const tag = this.safeString (response[0], 'paymentId');
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'info': response[0],
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // private
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const label = address.slice (0, 20);
        const request = {
            'Address': address,
            'Amount': amount,
            'Currency': currency['name'],
        };
        if (tag) {
            request['Label'] = tag;
        } else {
            request['Label'] = label;
        }
        const response = await this.privatePostWalletWithdrawFunds (
            this.extend (request, params)
        );
        return {
            'info': response,
            'id': this.safeString (response, 'Result'),
        };
    }

    async fetchFundingLimits (code = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingLimits requires a code argument');
        }
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['name'];
        }
        const response = await this.privateGetWalletFundingLimits (
            this.extend (request, params)
        );
        response['Result']['Currency'] = currency['name'];
        return response['Result'];
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            const time = this.milliseconds ();
            const exp_time = time + 50000; // add expiration time of signature in milliseconds
            // parameters required to request, in LimitOrder rate is mendatory
            // create string by concating all the required values in gives sequence
            url = url.replace ('%20', ' ');
            const signatureString = this.apiKey + this.urls['api'][api] + url + method + this.json (params) + time.toString () + exp_time.toString ();
            // Remember: signature should be in HmacSHA256
            const signature = this.hmac (this.encode (signatureString), this.encode (this.secret));
            headers = {
                'KEY-X': this.apiKey,
                'SIG-X': signature,
                'TIME-X': time.toString (),
                'EXP-X': exp_time.toString (),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
            };
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            const feedback = this.id + ' ' + body;
            // {'code':504,'message':'Gateway Timeout','description':''}
            if (code === 503 || code === 504) {
                throw new ExchangeNotAvailable (feedback);
            }
            // fallback to default error handler on rate limit errors
            // {'code':429,'message':'Too many requests','description':'Too many requests'}
            if (code === 429) {
                return;
            }
            // {'error':{'code':20002,'message':'Order not found','description':''}}
            if (body[0] === '{') {
                if ('error' in response) {
                    const errorCode = this.safeString (response['error'], 'code');
                    this.throwExactlyMatchedException (
                        this.exceptions,
                        errorCode,
                        feedback
                    );
                }
            }
            throw new ExchangeError (feedback);
        }
    }
};
