'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, RateLimitExceeded, ArgumentsRequired } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class coinfalcon extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinfalcon',
            'name': 'CoinFalcon',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradinFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg',
                'api': 'https://coinfalcon.com',
                'www': 'https://coinfalcon.com',
                'doc': 'https://docs.coinfalcon.com',
                'fees': 'https://coinfalcon.com/fees',
                'referral': 'https://coinfalcon.com/?ref=CFJSVGTUPASB',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market}',
                        'markets/{market}/orders',
                        'markets/{market}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'user/accounts',
                        'user/orders',
                        'user/orders/{id}',
                        'user/orders/{id}/trades',
                        'user/trades',
                        'user/fees',
                        'account/withdrawals/{id}',
                        'account/withdrawals',
                        'account/deposit/{id}',
                        'account/deposits',
                        'account/deposit_address',
                    ],
                    'post': [
                        'user/orders',
                        'account/withdraw',
                    ],
                    'delete': [
                        'user/orders/{id}',
                        'account/withdrawals/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'maker': 0.0,
                    'taker': 0.002, // tiered fee starts at 0.2%
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //    {
        //        "data": [
        //            {
        //                "name": "ETH-BTC",
        //                "precision": 6,
        //                "min_volume": "0.00000001",
        //                "min_price": "0.000001",
        //                "volume": "0.015713",
        //                "last_price": "0.069322",
        //                "highest_bid": "0.063892",
        //                "lowest_ask": "0.071437",
        //                "change_in_24h": "2.85",
        //                "size_precision": 8,
        //                "price_precision": 6
        //            },
        //            ...
        //        ]
        //    }
        //
        const markets = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const [ baseId, quoteId ] = market['name'].split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': market['name'],
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'size_precision'),
                    'price': this.safeInteger (market, 'price_precision'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minPrice'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minVolume'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "name":"ETH-BTC",
        //         "precision":6,
        //         "min_volume":"0.00000001",
        //         "min_price":"0.000001",
        //         "volume":"0.000452",
        //         "last_price":"0.079059",
        //         "highest_bid":"0.073472",
        //         "lowest_ask":"0.079059",
        //         "change_in_24h":"8.9",
        //         "size_precision":8,
        //         "price_precision":6
        //     }
        //
        const marketId = this.safeString (ticker, 'name');
        market = this.safeMarket (marketId, market, '-');
        const timestamp = this.milliseconds ();
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'highest_bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'lowest_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change_in_24h'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "name":"ETH-BTC",
        //                 "precision":6,
        //                 "min_volume":"0.00000001",
        //                 "min_price":"0.000001",
        //                 "volume":"0.000452",
        //                 "last_price":"0.079059",
        //                 "highest_bid":"0.073472",
        //                 "lowest_ask":"0.079059",
        //                 "change_in_24h":"8.9",
        //                 "size_precision":8,
        //                 "price_precision":6
        //             }
        //         ]
        //     }
        //
        const tickers = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'level': '3',
        };
        const response = await this.publicGetMarketsMarketOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, symbol, undefined, 'bids', 'asks', 'price', 'size');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id":"5ec36295-5c8d-4874-8d66-2609d4938557",
        //          "price":"4050.06","size":"0.0044",
        //          "market_name":"ETH-USDT",
        //          "side":"sell",
        //          "created_at":"2021-12-07T17:47:36.811000Z"
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //              "id": "0718d520-c796-4061-a16b-915cd13f20c6",
        //              "price": "0.00000358",
        //              "size": "50.0",
        //              "market_name": "DOGE-BTC",
        //              "order_id": "ff2616d8-58d4-40fd-87ae-937c73eb6f1c",
        //              "side": "buy",
        //              "fee': "0.00000036",
        //              "fee_currency_code": "btc",
        //              "liquidity": "T",
        //              "created_at": "2021-12-08T18:26:33.840000Z"
        //      }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const symbol = market['symbol'];
        const tradeId = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'order_id');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyCode = this.safeString (trade, 'fee_currency_code');
            fee = {
                'cost': feeCostString,
                'currency': this.safeCurrencyCode (feeCurrencyCode),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetUserTrades (this.extend (request, params));
        //
        //      {
        //          "data": [
        //              {
        //                  "id": "0718d520-c796-4061-a16b-915cd13f20c6",
        //                  "price": "0.00000358",
        //                  "size": "50.0",
        //                  "market_name": "DOGE-BTC",
        //                  "order_id": "ff2616d8-58d4-40fd-87ae-937c73eb6f1c",
        //                  "side": "buy",
        //                  "fee': "0.00000036",
        //                  "fee_currency_code": "btc",
        //                  "liquidity": "T",
        //                  "created_at": "2021-12-08T18:26:33.840000Z"
        //              },
        //          ]
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        //
        //      {
        //          "data":[
        //              {
        //                  "id":"5ec36295-5c8d-4874-8d66-2609d4938557",
        //                  "price":"4050.06","size":"0.0044",
        //                  "market_name":"ETH-USDT",
        //                  "side":"sell",
        //                  "created_at":"2021-12-07T17:47:36.811000Z"
        //              },
        //          ]
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserFees (params);
        //
        //    {
        //        data: {
        //            maker_fee: '0.0',
        //            taker_fee: '0.2',
        //            btc_volume_30d: '0.0'
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const makerString = this.safeString (data, 'maker_fee');
        const takerString = this.safeString (data, 'taker_fee');
        const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
        const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    parseBalance (response) {
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available_balance');
            account['used'] = this.safeString (balance, 'hold_balance');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetUserAccounts (params);
        return this.parseBalance (response);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address":"0x77b5051f97efa9cc52c9ad5b023a53fc15c200d3",
        //         "tag":"0"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'tag');
        this.checkAddress (address);
        return {
            'currency': this.safeCurrencyCode (undefined, currency),
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.safeCurrency (code);
        const request = {
            'currency': this.safeStringLower (currency, 'id'),
        };
        const response = await this.privateGetAccountDepositAddress (this.extend (request, params));
        //
        //     {
        //         data: {
        //             address: '0x9918987bbe865a1a9301dc736cf6cf3205956694',
        //             tag:null
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    parseOrderStatus (status) {
        const statuses = {
            'fulfilled': 'closed',
            'canceled': 'canceled',
            'pending': 'open',
            'open': 'open',
            'partially_filled': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id":"8bdd79f4-8414-40a2-90c3-e9f4d6d1eef4"
        //         "market":"IOT-BTC"
        //         "price":"0.0000003"
        //         "size":"4.0"
        //         "size_filled":"3.0"
        //         "fee":"0.0075"
        //         "fee_currency_code":"iot"
        //         "funds":"0.0"
        //         "status":"canceled"
        //         "order_type":"buy"
        //         "post_only":false
        //         "operation_type":"market_order"
        //         "created_at":"2018-01-12T21:14:06.747828Z"
        //     }
        //
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const priceString = this.safeString (order, 'price');
        const amountString = this.safeString (order, 'size');
        const filledString = this.safeString (order, 'size_filled');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let type = this.safeString (order, 'operation_type');
        if (type !== undefined) {
            type = type.split ('_');
            type = type[0];
        }
        const side = this.safeString (order, 'order_type');
        const postOnly = this.safeValue (order, 'post_only');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': side,
            'price': priceString,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amountString,
            'filled': filledString,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // price/size must be string
        const request = {
            'market': market['id'],
            'size': this.amountToPrecision (symbol, amount),
            'order_type': side,
        };
        if (type === 'limit') {
            price = this.priceToPrecision (symbol, price);
            request['price'] = price.toString ();
        }
        request['operation_type'] = type + '_order';
        const response = await this.privatePostUserOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateDeleteUserOrdersId (this.extend (request, params));
        const market = this.market (symbol);
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetUserOrdersId (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['since_time'] = this.iso8601 (since);
        }
        // TODO: test status=all if it works for closed orders too
        const response = await this.privateGetUserOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const orders = this.filterByArray (data, 'status', [ 'pending', 'open', 'partially_filled' ], false);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // currency: 'xrp', // optional: currency code in lowercase
            // status: 'completed', // optional: withdrawal status
            // since_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
            // end_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
            // start_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = this.safeStringLower (currency, 'id');
        }
        if (since !== undefined) {
            request['since_time'] = this.iso8601 (since);
        }
        const response = await this.privateGetAccountDeposits (this.extend (request, params));
        //
        //     data: [
        //         {
        //             id: '6e2f18b5-f80e-xxx-xxx-xxx',
        //             amount: '0.1',
        //             status: 'completed',
        //             currency_code: 'eth',
        //             txid: '0xxxx',
        //             address: '0xxxx',
        //             tag: null,
        //             type: 'deposit'
        //         },
        //     ]
        //
        const transactions = this.safeValue (response, 'data', []);
        transactions.reverse (); // no timestamp but in reversed order
        return this.parseTransactions (transactions, currency, undefined, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // currency: 'xrp', // optional: currency code in lowercase
            // status: 'completed', // optional: withdrawal status
            // since_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
            // end_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
            // start_time // datetime in ISO8601 format (2017-11-06T09:53:08.383210Z)
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = this.safeStringLower (currency, 'id');
        }
        if (since !== undefined) {
            request['since_time'] = this.iso8601 (since);
        }
        const response = await this.privateGetAccountWithdrawals (this.extend (request, params));
        //
        //     data: [
        //         {
        //             id: '25f6f144-3666-xxx-xxx-xxx',
        //             amount: '0.01',
        //             status: 'completed',
        //             fee: '0.0005',
        //             currency_code: 'btc',
        //             txid: '4xxx',
        //             address: 'bc1xxx',
        //             tag: null,
        //             type: 'withdraw'
        //         },
        //     ]
        //
        const transactions = this.safeValue (response, 'data', []);
        transactions.reverse (); // no timestamp but in reversed order
        return this.parseTransactions (transactions, currency, undefined, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': this.safeStingLower (currency, 'id'),
            'address': address,
            'amount': amount,
            // 'tag': 'string', // withdraw tag/memo
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostAccountWithdraw (this.extend (request, params));
        //
        //     data: [
        //         {
        //             id: '25f6f144-3666-xxx-xxx-xxx',
        //             amount: '0.01',
        //             status: 'approval_pending',
        //             fee: '0.0005',
        //             currency_code: 'btc',
        //             txid: null,
        //             address: 'bc1xxx',
        //             tag: null,
        //             type: 'withdraw'
        //         },
        //     ]
        //
        const transaction = this.safeValue (response, 'data', []);
        return this.parseTransaction (transaction, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'completed': 'ok',
            'denied': 'failed',
            'approval_pending': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals, withdraw
        //
        //     {
        //         id: '25f6f144-3666-xxx-xxx-xxx',
        //         amount: '0.01',
        //         status: 'completed',
        //         fee: '0.0005',
        //         currency_code: 'btc',
        //         txid: '4xxx',
        //         address: 'bc1xxx',
        //         tag: null,
        //         type: 'withdraw'
        //     },
        //
        // fetchDeposits
        //
        //     {
        //         id: '6e2f18b5-f80e-xxx-xxx-xxx',
        //         amount: '0.1',
        //         status: 'completed',
        //         currency_code: 'eth',
        //         txid: '0xxxx',
        //         address: '0xxxx',
        //         tag: null,
        //         type: 'deposit'
        //     },
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'tag');
        const txid = this.safeString (transaction, 'txid');
        const currencyId = this.safeString (transaction, 'currency_code');
        const code = this.safeCurrencyCode (currencyId, currency);
        let type = this.safeString (transaction, 'type');
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amountString = this.safeString (transaction, 'amount');
        const amount = this.parseNumber (amountString);
        const feeCostString = this.safeString (transaction, 'fee');
        let feeCost = 0;
        if (feeCostString !== undefined) {
            feeCost = this.parseNumber (feeCostString);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
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
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    request += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
            }
            const seconds = this.seconds ().toString ();
            let payload = [ seconds, method, request ].join ('|');
            if (body) {
                payload += '|' + body;
            }
            const signature = this.hmac (this.encode (payload), this.encode (this.secret));
            headers = {
                'CF-API-KEY': this.apiKey,
                'CF-API-TIMESTAMP': seconds,
                'CF-API-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code < 400) {
            return;
        }
        const ErrorClass = this.safeValue ({
            '401': AuthenticationError,
            '429': RateLimitExceeded,
        }, code, ExchangeError);
        throw new ErrorClass (body);
    }
};
