'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class protondex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'protondex',
            'name': 'protondex',
            'countries': [ 'US' ],
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
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrdersHistory': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchRecentTrades': true,
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
            'hostname': 'https://metallicus-dbapi-dev01.binfra.one',
            'urls': {
                'logo': 'https://testnet.protonswap.com/img/logo.svg',
                'api': {
                    'rest': 'https://metallicus-dbapi-dev01.binfra.one/dex',
                    'public': 'https://metallicus-dbapi-dev01.binfra.one/dex',
                    'private': 'https://metallicus-dbapi-dev01.binfra.one/dex',
                },
                'www': 'https://www.protonswap.com',
                'doc': [
                    'https://www.docs.protondex.com',
                ],
                'fees': [
                    'https://www.docs.protondex.com/dex/what-is-proton-dex/dex-fees-and-discounts',
                ],
                'referral': 'https://www.protonswap.com',
            },
            'api': {
                'public': {
                    'get': [
                        'markets/all',
                        'orders/open', // ?{account}/{marketid}/{offset}/{limit}'
                        'orders/history', // ?{account}/{marketid}/{offset}/{limit}'
                        'orders/depth', // ?{marketid}/{step}/{limit}'
                        'trades/recent', // ?{marketid}/{offset}/{limit}'
                        'trades/daily',
                        'chart/ohlcv', // ?{interval}/{dateFrom}/{dateTo}/{marketid}/{limit}'
                        'status/sync',
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
                    'maker': 0.001,
                    'taker': 0.002, // tiered fee starts at 0.2%
                },
            },
            'precision': {
                'amount': this.parseNumber ('0.00000001'),
                'price': this.parseNumber ('0.00000001'),
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name protondex#fetchMarkets
         * @description retrieves data on all markets for protondex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarketsAll (params);
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
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const [ baseId, quoteId ] = market['symbol'].split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': market['symbol'],
                'symbol': market['symbol'],
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
                'linear': false,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'size_precision'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_precision'))),
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
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name protondex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
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
        const tickers = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, step, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
            'step': step,
        };
        const response = await this.publicGetOrdersDepth (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrderBook (data, market['symbol'], undefined, 'bids', 'asks', 'bid', 'ask');
    }

    safeTrade (trade, market = undefined) {
        const amount = this.safeString (trade, 'amount');
        const price = this.safeString (trade, 'price');
        const cost = this.safeString (trade, 'cost');
        const parseFee = this.safeValue (trade, 'fee') === undefined;
        const parseFees = this.safeValue (trade, 'fees') === undefined;
        const shouldParseFees = parseFee || parseFees;
        const fees = [];
        if (shouldParseFees) {
            const tradeFees = this.safeValue (trade, 'fees');
            if (tradeFees !== undefined) {
                for (let j = 0; j < tradeFees.length; j++) {
                    const tradeFee = tradeFees[j];
                    fees.push (this.extend ({}, tradeFee));
                }
            } else {
                const tradeFee = this.safeValue (trade, 'fee');
                if (tradeFee !== undefined) {
                    fees.push (this.extend ({}, tradeFee));
                }
            }
        }
        const fee = this.safeValue (trade, 'fee');
        if (shouldParseFees) {
            const reducedFees = this.reduceFees ? this.reduceFeesByCurrency (fees) : fees;
            const reducedLength = reducedFees.length;
            for (let i = 0; i < reducedLength; i++) {
                reducedFees[i]['cost'] = this.safeNumber (reducedFees[i], 'cost');
                if ('rate' in reducedFees[i]) {
                    reducedFees[i]['rate'] = this.safeNumber (reducedFees[i], 'rate');
                }
            }
            if (!parseFee && (reducedLength === 0)) {
                fee['cost'] = this.safeNumber (fee, 'cost');
                if ('rate' in fee) {
                    fee['rate'] = this.safeNumber (fee, 'rate');
                }
                reducedFees.push (fee);
            }
            if (parseFees) {
                trade['fees'] = reducedFees;
            }
            if (parseFee && (reducedLength === 1)) {
                trade['fee'] = reducedFees[0];
            }
            const tradeFee = this.safeValue (trade, 'fee');
            if (tradeFee !== undefined) {
                tradeFee['cost'] = this.safeNumber (tradeFee, 'cost');
                if ('rate' in tradeFee) {
                    tradeFee['rate'] = this.safeNumber (tradeFee, 'rate');
                }
                trade['fee'] = tradeFee;
            }
        }
        trade['amount'] = this.parseNumber (amount);
        trade['price'] = this.parseNumber (price);
        trade['cost'] = this.parseNumber (cost);
        return trade;
    }

    parseTrade (trade, symbol, market = undefined) {
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
        const timestamp = this.parse8601 (this.safeString (trade, 'block_time'));
        const priceString = this.safeString (trade, 'price');
        const amountString = undefined;
        const tradeId = this.safeString (trade, 'trade_id');
        const side = this.safeString (trade, 'order_side');
        const orderId = this.safeString (trade, 'order_id');
        const fee = undefined;
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
        /**
         * @method
         * @name poloniex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            // 'from': 12345678, // A 'trade Id'. The query begins at ‘from'.
            // 'direction': 'PRE', // PRE, NEXT The direction before or after ‘from'.
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = parseInt (limit);
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "32164924331503616",
        //             "symbol": "LINK_USDT",
        //             "accountType": "SPOT",
        //             "orderId": "32164923987566592",
        //             "side": "SELL",
        //             "type": "MARKET",
        //             "matchRole": "TAKER",
        //             "createTime": 1648635115525,
        //             "price": "11",
        //             "quantity": "0.5",
        //             "amount": "5.5",
        //             "feeCurrency": "USDT",
        //             "feeAmount": "0.007975",
        //             "pageId": "32164924331503616",
        //             "clientOrderId": "myOwnId-321"
        //         }
        //     ]
        //
        const result = this.parseTrades (response, market);
        return this.filterBySinceLimit (result, since, limit);
    }

    async fetchRecentTrades (symbol, offset = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} offset offset value
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['symbol'],
        };
        if (offset !== undefined) {
            request['offset'] = offset;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesRecent (this.extend (request, params));
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
        return this.parseTrades (data);
    }

    async fetchOrdersHistory (symbol, account, offset, limit, params = {}) {
        /**
         * @method
         * @name protondex#fetchOrdersHistory
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'account': account,
            'symbol': market['symbol'],
        };
        if (offset !== undefined) {
            request['offset'] = offset;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersHistory (this.extend (request, params));
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
        return this.parseTrades (data, limit);
    }

    async fetchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        const response = await this.publicGetTradesDaily ();
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
        const data = this.safeValue (response, 'data', []);
        return data;
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name protondex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
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
        const balances = this.safeValue (response, 'data', []);
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
        /**
         * @method
         * @name protondex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
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
        /**
         * @method
         * @name protondex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
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
        const timestamp = this.parse8601 (this.safeString (order, 'block_time'));
        const priceString = this.safeString (order, 'price');
        const amountString = this.safeString (order, 'quantity_init');
        const remainingString = this.safeString (order, 'quantity_curr');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let type = this.safeString (order, 'order_type');
        if (type !== undefined) {
            type = type.split ('_');
            type = type[0];
        }
        const side = this.safeString (order, 'order_side');
        return this.safeOrder ({
            'id': this.safeString (order, 'market_id'),
            'clientOrderId': this.safeString (order, 'order_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'stopPrice': this.safeString (order, 'trigger_price'),
            'cost': undefined,
            'amount': amountString,
            'remaining': remainingString,
            'fee': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name protondex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
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
        /**
         * @method
         * @name protondex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
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
        /**
         * @method
         * @name protondex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetUserOrdersId (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol, account, offset = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {string} account account holder name
         * @param {int|undefined} offset the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'account': account,
            'symbol': symbol,
        };
        if (offset !== undefined) {
            request['offset'] = offset;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // TODO: test status=all if it works for closed orders too
        const response = await this.publicGetOrdersOpen (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        const market = this.market (symbol);
        return this.parseOrders (data, market);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
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
        /**
         * @method
         * @name protondex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
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
        /**
         * @method
         * @name protondex#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': this.safeStringLower (currency, 'id'),
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

    async fetchStatusSync (params = {}) {
        /**
         * @method
         * @name protondex#fetchStatusSync
         * @description fetch synchronization time
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const response = await this.publicGetStatusSync ();
        //
        //     [
        //         {
        //           "dbSecondsBehind": 0,
        //           "chronicleSecondsBehind": 0,
        //           "maxSecondsBehind": 0
        //         }
        //     ]
        return response;
    }

    async fetchOHLCV (interval, symbol, from_time, to_time, limit = undefined, params = {}) {
        /**
         * @method
         * @name protondex#fetchOhlcv
         * @description retrive ohlcv charts
         * @param {int} interval duration of the input
         * @param {string} symbol unified market symbol
         * @param {timestamp} from_time start date and time
         * @param {timestamp} to_time end date and time
         * @param {integer|undefined} limit count to fetch
         * @param {object} params extra parameters specific to the protondex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'interval': interval,
            'from': this.ymdhms (this.parseDate (from_time)),
            'to': this.ymdhms (this.parseDate (to_time)),
            'symbol': symbol,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetChartOhlcv (this.extend (request, params));
        //
        //   [
        //      {
        //           'close': '0.76',
        //           'count': '0',
        //           'high': '0.76',
        //           'low': '0.76',
        //           'open': '0.76',
        //           'time': '1665950400000',
        //           'volume': '0',
        //           'volume_bid': '0'
        //       }
        //   ]
        const transResults = this.safeValue (response, 'data', []);
        const results = [];
        for (let i = 0; i < transResults.length; i++) {
            results.push (this.parseOHLCV (transResults[i], market));
        }
        return results;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.version + '/' + this.implodeParams (path, params);
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
        const url = this.urls['api']['rest'] + request;
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
