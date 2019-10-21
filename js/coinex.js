'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinex',
            'name': 'CoinEx',
            'version': 'v1',
            'countries': [ 'CN' ],
            'rateLimit': 1000,
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg',
                'api': 'https://api.coinex.com',
                'www': 'https://www.coinex.com',
                'doc': 'https://github.com/coinexcom/coinex_exchange_api/wiki',
                'fees': 'https://www.coinex.com/fees',
                'referral': 'https://www.coinex.com/register?refer_code=yw5fz',
            },
            'api': {
                'public': {
                    'get': [
                        'common/currency/rate',
                        'common/asset/config',
                        'market/info',
                        'market/list',
                        'market/ticker',
                        'market/ticker/all',
                        'market/depth',
                        'market/deals',
                        'market/kline',
                    ],
                },
                'private': {
                    'get': [
                        'balance/coin/deposit',
                        'balance/coin/withdraw',
                        'balance/info',
                        'future/account',
                        'future/config',
                        'future/limitprice',
                        'future/loan/history',
                        'future/market',
                        'margin/account',
                        'margin/config',
                        'margin/loan/history',
                        'margin/market',
                        'order',
                        'order/deals',
                        'order/finished',
                        'order/finished/{id}',
                        'order/pending',
                        'order/status',
                        'order/status/batch',
                        'order/user/deals',
                    ],
                    'post': [
                        'balance/coin/withdraw',
                        'future/flat',
                        'future/loan',
                        'future/transfer',
                        'margin/flat',
                        'margin/loan',
                        'margin/transfer',
                        'order/batchlimit',
                        'order/ioc',
                        'order/limit',
                        'order/market',
                        'sub_account/transfer',
                    ],
                    'delete': [
                        'balance/coin/withdraw',
                        'order/pending/batch',
                        'order/pending',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketInfo (params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "WAVESBTC": {
        //                 "name": "WAVESBTC",
        //                 "min_amount": "1",
        //                 "maker_fee_rate": "0.001",
        //                 "taker_fee_rate": "0.001",
        //                 "pricing_name": "BTC",
        //                 "pricing_decimal": 8,
        //                 "trading_name": "WAVES",
        //                 "trading_decimal": 8
        //             }
        //         }
        //     }
        //
        const markets = this.safeValue (response, 'data', {});
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            const id = this.safeString (market, 'name');
            const tradingName = this.safeString (market, 'trading_name');
            const baseId = tradingName;
            const quoteId = this.safeString (market, 'pricing_name');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            if (tradingName === id) {
                symbol = id;
            }
            const precision = {
                'amount': this.safeInteger (market, 'trading_decimal'),
                'price': this.safeInteger (market, 'pricing_decimal'),
            };
            const active = undefined;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': this.safeFloat (market, 'taker_fee_rate'),
                'maker': this.safeFloat (market, 'maker_fee_rate'),
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'date');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        ticker = this.safeValue (ticker, 'ticker', {});
        const last = this.safeFloat (ticker, 'last');
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
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat2 (ticker, 'vol', 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketTicker (this.extend (request, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickerAll (params);
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (data, 'date');
        const tickers = this.safeValue (data, 'ticker');
        const marketIds = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            let symbol = marketId;
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
            const ticker = {
                'date': timestamp,
                'ticker': tickers[marketId],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = 20, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': this.marketId (symbol),
            'merge': '0.0000000001',
            'limit': limit.toString (),
        };
        const response = await this.publicGetMarketDepth (this.extend (request, params));
        return this.parseOrderBook (response['data']);
    }

    parseTrade (trade, market = undefined) {
        // this method parses both public and private trades
        let timestamp = this.safeTimestamp (trade, 'create_time');
        if (timestamp === undefined) {
            timestamp = this.safeInteger (trade, 'date_ms');
        }
        const tradeId = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const marketId = this.safeString (trade, 'market');
        market = this.safeValue (this.markets_by_id, marketId, market);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = this.safeFloat (trade, 'deal_money');
        if (!cost) {
            cost = parseFloat (this.costToPrecision (symbol, price * amount));
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_asset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const takerOrMaker = this.safeString (trade, 'role');
        const side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketDeals (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
        };
        const response = await this.publicGetMarketKline (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalanceInfo (params);
        //
        //     {
        //       "code": 0,
        //       "data": {
        //         "BCH": {                     # BCH account
        //           "available": "13.60109",   # Available BCH
        //           "frozen": "0.00000"        # Frozen BCH
        //         },
        //         "BTC": {                     # BTC account
        //           "available": "32590.16",   # Available BTC
        //           "frozen": "7000.00"        # Frozen BTC
        //         },
        //         "ETH": {                     # ETH account
        //           "available": "5.06000",    # Available ETH
        //           "frozen": "0.00000"        # Frozen ETH
        //         }
        //       },
        //       "message": "Ok"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (balances, currencyId, {});
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'not_deal': 'open',
            'part_deal': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder
        //
        //     {
        //         "amount": "0.1",
        //         "asset_fee": "0.22736197736197736197",
        //         "avg_price": "196.85000000000000000000",
        //         "create_time": 1537270135,
        //         "deal_amount": "0.1",
        //         "deal_fee": "0",
        //         "deal_money": "19.685",
        //         "fee_asset": "CET",
        //         "fee_discount": "0.5",
        //         "id": 1788259447,
        //         "left": "0",
        //         "maker_fee_rate": "0",
        //         "market": "ETHUSDT",
        //         "order_type": "limit",
        //         "price": "170.00000000",
        //         "status": "done",
        //         "taker_fee_rate": "0.0005",
        //         "type": "sell",
        //     }
        //
        const timestamp = this.safeTimestamp (order, 'create_time');
        const price = this.safeFloat (order, 'price');
        const cost = this.safeFloat (order, 'deal_money');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'deal_amount');
        const average = this.safeFloat (order, 'avg_price');
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        market = this.safeValue (this.markets_by_id, marketId);
        const feeCurrencyId = this.safeString (order, 'fee_asset');
        let feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        if (market !== undefined) {
            symbol = market['symbol'];
            if (feeCurrency === undefined) {
                feeCurrency = market['quote'];
            }
        }
        const remaining = this.safeFloat (order, 'left');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.safeString (order, 'order_type');
        const side = this.safeString (order, 'type');
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeFloat (order, 'deal_fee'),
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostOrder' + this.capitalize (type);
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'type': side,
        };
        amount = parseFloat (amount);
        // for market buy it requires the amount of quote currency to spend
        if ((type === 'market') && (side === 'buy')) {
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                } else {
                    price = parseFloat (price);
                    request['amount'] = this.costToPrecision (symbol, amount * price);
                }
            } else {
                request['amount'] = this.costToPrecision (symbol, amount);
            }
        } else {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if ((type === 'limit') || (type === 'ioc')) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response['data'], market);
        const id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'market': market['id'],
        };
        const response = await this.privateDeleteOrderPending (this.extend (request, params));
        return this.parseOrder (response['data'], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'market': market['id'],
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.1",
        //             "asset_fee": "0.22736197736197736197",
        //             "avg_price": "196.85000000000000000000",
        //             "create_time": 1537270135,
        //             "deal_amount": "0.1",
        //             "deal_fee": "0",
        //             "deal_money": "19.685",
        //             "fee_asset": "CET",
        //             "fee_discount": "0.5",
        //             "id": 1788259447,
        //             "left": "0",
        //             "maker_fee_rate": "0",
        //             "market": "ETHUSDT",
        //             "order_type": "limit",
        //             "price": "170.00000000",
        //             "status": "done",
        //             "taker_fee_rate": "0.0005",
        //             "type": "sell",
        //         },
        //         "message": "Ok"
        //     }
        //
        return this.parseOrder (response['data'], market);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const method = 'privateGetOrder' + this.capitalize (status);
        const response = await this[method] (this.extend (request, params));
        return this.parseOrders (response['data']['data'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('pending', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('finished', symbol, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'limit': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrderUserDeals (this.extend (request, params));
        return this.parseTrades (response['data']['data'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag) {
            address = address + ':' + tag;
        }
        const request = {
            'coin_type': currency['id'],
            'coin_address': address, // must be authorized, inter-user transfer by a registered mobile phone number or an email address is supported
            'actual_amount': parseFloat (amount), // the actual amount without fees, https://www.coinex.com/fees
            'transfer_method': '1', // '1' = normal onchain transfer, '2' = internal local transfer from one user to another
        };
        const response = await this.privatePostBalanceCoinWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "actual_amount": "1.00000000",
        //             "amount": "1.00000000",
        //             "coin_address": "1KAv3pazbTk2JnQ5xTo6fpKK7p1it2RzD4",
        //             "coin_type": "BCH",
        //             "coin_withdraw_id": 206,
        //             "confirmations": 0,
        //             "create_time": 1524228297,
        //             "status": "audit",
        //             "tx_fee": "0",
        //             "tx_id": ""
        //         },
        //         "message": "Ok"
        //     }
        //
        const transaction = this.safeValue (response, 'data', {});
        return this.parseTransaction (transaction, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'audit': 'pending',
            'pass': 'pending',
            'processing': 'pending',
            'confirming': 'pending',
            'not_pass': 'failed',
            'cancel': 'canceled',
            'finish': 'ok',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "actual_amount": "120.00000000",
        //         "actual_amount_display": "120",
        //         "add_explorer": "XXX",
        //         "amount": "120.00000000",
        //         "amount_display": "120",
        //         "coin_address": "XXXXXXXX",
        //         "coin_address_display": "XXXXXXXX",
        //         "coin_deposit_id": 1866,
        //         "coin_type": "USDT",
        //         "confirmations": 0,
        //         "create_time": 1539595701,
        //         "explorer": "",
        //         "remark": "",
        //         "status": "finish",
        //         "status_display": "finish",
        //         "transfer_method": "local",
        //         "tx_id": "",
        //         "tx_id_display": "XXXXXXXXXX"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "actual_amount": "0.10000000",
        //         "amount": "0.10000000",
        //         "coin_address": "15sr1VdyXQ6sVLqeJUJ1uPzLpmQtgUeBSB",
        //         "coin_type": "BCH",
        //         "coin_withdraw_id": 203,
        //         "confirmations": 11,
        //         "create_time": 1515806440,
        //         "status": "finish",
        //         "tx_fee": "0",
        //         "tx_id": "896371d0e23d64d1cac65a0b7c9e9093d835affb572fec89dd4547277fbdd2f6"
        //     }
        //
        const id = this.safeString2 (transaction, 'coin_withdraw_id', 'coin_deposit_id');
        const address = this.safeString (transaction, 'coin_address');
        let tag = this.safeString (transaction, 'remark'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'tx_id');
        if (txid !== undefined) {
            if (txid.length < 1) {
                txid = undefined;
            }
        }
        const currencyId = this.safeString (transaction, 'coin_type');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'create_time');
        const type = ('coin_withdraw_id' in transaction) ? 'withdraw' : 'deposit';
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'), type);
        const amount = this.safeFloat (transaction, 'amount');
        let feeCost = this.safeFloat (transaction, 'tx_fee');
        if (type === 'deposit') {
            feeCost = 0;
        }
        const fee = {
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

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinWithdraw (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "actual_amount": "1.00000000",
        //                 "amount": "1.00000000",
        //                 "coin_address": "1KAv3pazbTk2JnQ5xTo6fpKK7p1it2RzD4",
        //                 "coin_type": "BCH",
        //                 "coin_withdraw_id": 206,
        //                 "confirmations": 0,
        //                 "create_time": 1524228297,
        //                 "status": "audit",
        //                 "tx_fee": "0",
        //                 "tx_id": ""
        //             },
        //             {
        //                 "actual_amount": "0.10000000",
        //                 "amount": "0.10000000",
        //                 "coin_address": "15sr1VdyXQ6sVLqeJUJ1uPzLpmQtgUeBSB",
        //                 "coin_type": "BCH",
        //                 "coin_withdraw_id": 203,
        //                 "confirmations": 11,
        //                 "create_time": 1515806440,
        //                 "status": "finish",
        //                 "tx_fee": "0",
        //                 "tx_id": "896371d0e23d64d1cac65a0b7c9e9093d835affb572fec89dd4547277fbdd2f6"
        //             },
        //             {
        //                 "actual_amount": "0.00100000",
        //                 "amount": "0.00100000",
        //                 "coin_address": "1GVVx5UBddLKrckTprNi4VhHSymeQ8tsLF",
        //                 "coin_type": "BCH",
        //                 "coin_withdraw_id": 27,
        //                 "confirmations": 0,
        //                 "create_time": 1513933541,
        //                 "status": "cancel",
        //                 "tx_fee": "0",
        //                 "tx_id": ""
        //             }
        //         ],
        //         "message": "Ok"
        //     }
        //
        return this.parseTransactions (response['data'], currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin_type': currency['id'],
        };
        if (limit !== undefined) {
            request['Limit'] = limit;
        }
        const response = await this.privateGetBalanceCoinDeposit (this.extend (request, params));
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "actual_amount": "4.65397682",
        //                 "actual_amount_display": "4.65397682",
        //                 "add_explorer": "https://etherscan.io/address/0x361XXXXXX",
        //                 "amount": "4.65397682",
        //                 "amount_display": "4.65397682",
        //                 "coin_address": "0x36dabcdXXXXXX",
        //                 "coin_address_display": "0x361X*****XXXXX",
        //                 "coin_deposit_id": 966191,
        //                 "coin_type": "ETH",
        //                 "confirmations": 30,
        //                 "create_time": 1531661445,
        //                 "explorer": "https://etherscan.io/tx/0x361XXXXXX",
        //                 "remark": "",
        //                 "status": "finish",
        //                 "status_display": "finish",
        //                 "transfer_method": "onchain",
        //                 "tx_id": "0x361XXXXXX",
        //                 "tx_id_display": "0x361XXXXXX"
        //             }
        //         ],
        //         "message": "Ok"
        //     }
        //
        return this.parseTransactions (response['data'], currency, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend ({
                'access_id': this.apiKey,
                'tonce': nonce.toString (),
            }, query);
            query = this.keysort (query);
            const urlencoded = this.urlencode (query);
            const signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret));
            headers = {
                'Authorization': signature.toUpperCase (),
                'Content-Type': 'application/json',
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + urlencoded;
            } else {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        const code = this.safeString (response, 'code');
        const data = this.safeValue (response, 'data');
        const message = this.safeString (response, 'message');
        if ((code !== '0') || (data === undefined) || ((message !== 'Ok') && !data)) {
            const responseCodes = {
                '24': AuthenticationError,
                '25': AuthenticationError,
                '107': InsufficientFunds,
                '600': OrderNotFound,
                '601': InvalidOrder,
                '602': InvalidOrder,
                '606': InvalidOrder,
            };
            const ErrorClass = this.safeValue (responseCodes, code, ExchangeError);
            throw new ErrorClass (response['message']);
        }
        return response;
    }
};
