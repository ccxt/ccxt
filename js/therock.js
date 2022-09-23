'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, OrderNotFound, InvalidAddress } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class therock extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'therock',
            'name': 'TheRockTrading',
            'countries': [ 'MT' ],
            // 10 requests per second => 1000ms / 10 => 100 ms between requests (all endpoints)
            'rateLimit': 100,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but unimplemented
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
                'api': {
                    'rest': 'https://api.therocktrading.com',
                },
                'www': 'https://therocktrading.com',
                'doc': [
                    'https://api.therocktrading.com/doc/v1/index.html',
                    'https://api.therocktrading.com/doc/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'funds': 1,
                        'funds/{id}': 1,
                        'funds/{id}/orderbook': 1,
                        'funds/{id}/ticker': 1,
                        'funds/{id}/trades': 1,
                        'funds/{id}/ohlc_statistics': 1,
                        'funds/tickers': 1,
                    },
                },
                'private': {
                    'get': {
                        'balances': 1,
                        'balances/{id}': 1,
                        'discounts': 1,
                        'discounts/{id}': 1,
                        'funds': 1,
                        'funds/{id}': 1,
                        'funds/{id}/trades': 1,
                        'funds/{fund_id}/orders': 1,
                        'funds/{fund_id}/orders/{id}': 1,
                        'funds/{fund_id}/position_balances': 1,
                        'funds/{fund_id}/positions': 1,
                        'funds/{fund_id}/positions/{id}': 1,
                        'transactions': 1,
                        'transactions/{id}': 1,
                        'withdraw_limits/{id}': 1,
                        'withdraw_limits': 1,
                    },
                    'post': {
                        'atms/withdraw': 1,
                        'funds/{fund_id}/orders': 1,
                    },
                    'delete': {
                        'funds/{fund_id}/orders/{id}': 1,
                        'funds/{fund_id}/orders/remove_all': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {
                        'BTC': 0,
                        'BCH': 0,
                        'PPC': 0,
                        'ETH': 0,
                        'ZEC': 0,
                        'LTC': 0,
                        'EUR': 0,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Request already running': BadRequest,
                    'cannot specify multiple address types': BadRequest,
                    'Currency is not included in the list': BadRequest,
                    'Record not found': OrderNotFound,
                },
                'broad': {
                    'before must be greater than after param': BadRequest,
                    'must be shorter than 60 days': BadRequest,
                    'must be a multiple of (period param) in minutes': BadRequest,
                    'Address allocation limit reached for currency': InvalidAddress,
                    'is not a valid value for param currency': BadRequest,
                    ' is invalid': InvalidAddress,
                },
            },
            'options': {
                'withdraw': {
                    'fillResponseFromRequest': true,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name therock#fetchMarkets
         * @description retrieves data on all markets for therock
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetFunds (params);
        //
        //    {
        //        funds: [
        //            {
        //                id: "BTCEUR",
        //                description: "Trade Bitcoin with Euro",
        //                type: "currency",
        //                base_currency: "EUR",
        //                trade_currency: "BTC",
        //                buy_fee: 0.2,
        //                sell_fee: 0.2,
        //                minimum_price_offer: 0.01,
        //                minimum_quantity_offer: 0.0005,
        //                base_currency_decimals: 2,
        //                trade_currency_decimals: 4,
        //                leverages: []
        //            },
        //            ...
        //        ]
        //    }
        //
        const markets = this.safeValue (response, 'funds');
        const result = [];
        if (markets === undefined) {
            throw new ExchangeError (this.id + ' fetchMarkets() got an unexpected response');
        } else {
            for (let i = 0; i < markets.length; i++) {
                const market = markets[i];
                const id = this.safeString (market, 'id');
                const baseId = this.safeString (market, 'trade_currency');
                const quoteId = this.safeString (market, 'base_currency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const buy_fee = this.safeString (market, 'buy_fee');
                const sell_fee = this.safeString (market, 'sell_fee');
                let taker = Precise.stringMax (buy_fee, sell_fee);
                taker = this.parseNumber (Precise.stringDiv (taker, '100'));
                const leverages = this.safeValue (market, 'leverages');
                const leveragesLength = leverages.length;
                result.push ({
                    'id': id,
                    'symbol': base + '/' + quote,
                    'base': base,
                    'quote': quote,
                    'settle': undefined,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'settleId': undefined,
                    'type': 'spot',
                    'spot': true,
                    'margin': leveragesLength > 0,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'contract': false,
                    'linear': undefined,
                    'inverse': undefined,
                    'taker': taker,
                    'maker': taker,
                    'contractSize': undefined,
                    'active': true,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'precision': {
                        'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'trade_currency_decimals'))),
                        'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'base_currency_decimals'))),
                    },
                    'limits': {
                        'leverage': {
                            'min': 1,
                            'max': this.safeValue (leverages, leveragesLength - 1, 1),
                        },
                        'amount': {
                            'min': this.safeNumber (market, 'minimum_quantity_offer'),
                            'max': undefined,
                        },
                        'price': {
                            'min': this.safeNumber (market, 'minimum_price_offer'),
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
        }
        return result;
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'balances', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'trading_balance');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name therock#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const orderbook = await this.publicGetFundsIdOrderbook (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (orderbook, 'date'));
        return this.parseOrderBook (orderbook, market['symbol'], timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "date":"2022-01-16T00:05:08.192Z",
        //         "fund_id":"ETHBTC",
        //         "bid":0.07707802,
        //         "ask":0.07733404,
        //         "last":0.07739053,
        //         "open":0.07628192,
        //         "close":0.07687651,
        //         "low":0.07612047,
        //         "high":0.07703306,
        //         "volume":1.10179665,
        //         "volume_traded":14.273
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'date'));
        market = this.safeMarket (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'close'), // previous day close, if any
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume_traded'),
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetFundsTickers (params);
        const tickers = this.indexBy (response['tickers'], 'fund_id');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name therock#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetFundsIdTicker (this.extend (request, params));
        //
        //     {
        //         "date":"2022-01-16T00:05:08.192Z",
        //         "fund_id":"ETHBTC",
        //         "bid":0.07707802,
        //         "ask":0.07733404,
        //         "last":0.07739053,
        //         "open":0.07628192,
        //         "close":0.07687651,
        //         "low":0.07612047,
        //         "high":0.07703306,
        //         "volume":1.10179665,
        //         "volume_traded":14.273
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades, fetchOrder trades
        //
        //     {      id:  4493548,
        //       fund_id: "ETHBTC",
        //        amount:  0.203,
        //         price:  0.02783576,
        //          side: "buy",
        //          dark:  false,
        //          date: "2018-11-30T08:19:18.236Z" }
        //
        // fetchMyTrades
        //
        //     {           id:    237338,
        //            fund_id:   "BTCEUR",
        //             amount:    0.348,
        //              price:    348,
        //               side:   "sell",
        //               dark:    false,
        //           order_id:    14920648,
        //               date:   "2015-06-03T00:49:49.000Z",
        //       transactions: [ {       id:  2770768,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "sold_currency_to_fund",
        //                            price:  121.1,
        //                         currency: "EUR"                       },
        //                       {       id:  2770769,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "released_currency_to_fund",
        //                            price:  0.348,
        //                         currency: "BTC"                        },
        //                       {       id:  2770772,
        //                             date: "2015-06-03T00:49:49.000Z",
        //                             type: "paid_commission",
        //                            price:  0.06,
        //                         currency: "EUR",
        //                         trade_id:  440492                     }   ] }
        //
        const marketId = this.safeString (trade, 'fund_id');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'date'));
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const side = this.safeString (trade, 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        let fee = undefined;
        let feeCostString = undefined;
        const transactions = this.safeValue (trade, 'transactions', []);
        const transactionsByType = this.groupBy (transactions, 'type');
        const feeTransactions = this.safeValue (transactionsByType, 'paid_commission', []);
        for (let i = 0; i < feeTransactions.length; i++) {
            if (feeCostString === undefined) {
                feeCostString = '0.0';
            }
            feeCostString = Precise.stringAdd (feeCostString, this.safeString (feeTransactions[i], 'price'));
        }
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    parseLedgerEntryDirection (direction) {
        const directions = {
            'affiliate_earnings': 'in',
            'atm_payment': 'in',
            'bought_currency_from_fund': 'out',
            'bought_shares': 'out',
            'paid_commission': 'out',
            'paypal_payment': 'in',
            'pos_payment': 'in',
            'released_currency_to_fund': 'out',
            'rollover_commission': 'out',
            'sold_currency_to_fund': 'in',
            'sold_shares': 'in',
            'transfer_received': 'in',
            'transfer_sent': 'out',
            'withdraw': 'out',
            // commented types will be shown as-is
            // 'acquired_currency_from_fund': '',
            // 'acquired_insurance': '',
            // 'dividend_distributed_to_holders': '',
            // 'dividend_from_shares': '',
            // 'exposed_position': '',
            // 'insurances_reimbursement': '',
            // 'lent_currency': '',
            // 'linden_lab_assessment': '',
            // 'position_transfer_received': '',
            // 'return_lent_currency': '',
            // 'returned_lent_currency': '',
            // 'the_rock_assessment': '',
        };
        return this.safeString (directions, direction, direction);
    }

    parseLedgerEntryType (type) {
        const types = {
            'affiliate_earnings': 'referral',
            'atm_payment': 'transaction',
            'bought_currency_from_fund': 'trade',
            'bought_shares': 'trade',
            'paid_commission': 'fee',
            'paypal_payment': 'transaction',
            'pos_payment': 'transaction',
            'released_currency_to_fund': 'trade',
            'rollover_commission': 'fee',
            'sold_currency_to_fund': 'trade',
            'sold_shares': 'trade',
            'transfer_received': 'transfer',
            'transfer_sent': 'transfer',
            'withdraw': 'transaction',
            // commented types will be shown as-is
            // 'acquired_currency_from_fund': '',
            // 'acquired_insurance': '',
            // 'dividend_distributed_to_holders': '',
            // 'dividend_from_shares': '',
            // 'exposed_position': '',
            // 'insurances_reimbursement': '',
            // 'lent_currency': '',
            // 'linden_lab_assessment': '',
            // 'position_transfer_received': '',
            // 'return_lent_currency': '',
            // 'returned_lent_currency': '',
            // 'the_rock_assessment': '',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // withdrawal
        //
        //     {
        //         "id": 21311223,
        //         "date": "2015-06-30T13:55:11.000Z",
        //         "type": "withdraw",
        //         "price": 103.00,
        //         "currency": "EUR",
        //         "fund_id": null,
        //         "order_id": null,
        //         "trade_id": null,
        //         "transfer_detail": {
        //             "method": "wire_transfer",
        //             "id": "F112DD3",
        //             "recipient": "IT123456789012",
        //             "confirmations": 0
        //         }
        //     }
        //
        // deposit
        //
        //     {
        //         "id": 21311222,
        //         "date": "2015-06-30T13:55:11.000Z",
        //         "type": "atm_payment",
        //         "price": 2.01291,
        //         "currency": "BTC",
        //         "fund_id": "null",
        //         "order_id": null,
        //         "trade_id": null,
        //         "transfer_detail": {
        //             "method": "bitcoin",
        //             "id": "0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098",
        //             "recipient": "mzb3NgX9Dr6jgGAu31L6jsPGB2zkaFxxyf",
        //             "confirmations": 3
        //         }
        //     }
        //
        // trade fee
        //
        //     {
        //         "id": 21311221,
        //         "date": "2015-06-30T13:55:11.000Z",
        //         "type": "paid_commission",
        //         "price": 0.0001,
        //         "fund_id": "BTCEUR",
        //         "order_id": 12832371,
        //         "trade_id": 12923212,
        //         "currency": "BTC",
        //         "transfer_detail": null
        //     }
        //
        const id = this.safeString (item, 'id');
        let referenceId = undefined;
        let type = this.safeString (item, 'type');
        const direction = this.parseLedgerEntryDirection (type);
        type = this.parseLedgerEntryType (type);
        if (type === 'trade' || type === 'fee') {
            referenceId = this.safeString (item, 'trade_id');
        }
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (item, 'price');
        const timestamp = this.parse8601 (this.safeString (item, 'date'));
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @param {string|undefined} code unified currency code, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int|undefined} limit max number of ledger entrys to return, default is undefined
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'page': 1,
            // 'fund_id': 'ETHBTC', // filter by fund symbol
            // 'currency': 'BTC', // filter by currency
            // 'after': '2015-02-06T08:47:26Z', // filter after a certain timestamp
            // 'before': '2015-02-06T08:47:26Z',
            // 'type': 'withdraw',
            // 'order_id': '12832371', // filter by a specific order ID
            // 'trade_id': '12923212', // filter by a specific trade ID
            // 'transfer_method': 'bitcoin', // wire_transfer, ripple, greenaddress, bitcoin, litecoin, namecoin, peercoin, dogecoin
            // 'transfer_recipient': '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm', // filter by a specific recipient (e.g. Bitcoin address, IBAN)
            // 'transfer_id': '8261949194985b01985006724dca5d6059989e096fa95608271d00dd902327fa', // filter by a specific transfer ID (e.g. Bitcoin TX hash)
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.privateGetTransactions (this.extend (request, params));
        //
        //     {
        //         "transactions": [
        //             {
        //                 "id": 21311223,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "withdraw",
        //                 "price": 103.00,
        //                 "currency": "EUR",
        //                 "fund_id": null,
        //                 "order_id": null,
        //                 "trade_id": null,
        //                 "transfer_detail": {
        //                     "method": "wire_transfer",
        //                     "id": "F112DD3",
        //                     "recipient": "IT123456789012",
        //                     "confirmations": 0
        //                 }
        //             },
        //             {
        //                 "id": 21311222,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "atm_payment",
        //                 "price": 2.01291,
        //                 "currency": "BTC",
        //                 "fund_id": "null",
        //                 "order_id": null,
        //                 "trade_id": null,
        //                 "transfer_detail": {
        //                     "method": "bitcoin",
        //                     "id": "0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098",
        //                     "recipient": "mzb3NgX9Dr6jgGAu31L6jsPGB2zkaFxxyf",
        //                     "confirmations": 3
        //                 }
        //             },
        //             {
        //                 "id": 21311221,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "paid_commission",
        //                 "price": 0.0001,
        //                 "fund_id": "BTCEUR",
        //                 "order_id": 12832371,
        //                 "trade_id": 12923212,
        //                 "currency": "BTC",
        //                 "transfer_detail": null
        //             }
        //         ],
        //         "meta": {
        //             "total_count": 1221,
        //             "first": { "page": 1, "href": "https://api.therocktrading.com/v1/transactions?page=1" },
        //             "previous": null,
        //             "current": { "page": 1, "href": "https://api.therocktrading.com/v1/transactions?page=1" },
        //             "next": { "page": 2, "href": "https://api.therocktrading.com/v1/transactions?page=2" },
        //             "last": { "page": 1221, "href": "https://api.therocktrading.com/v1/transactions?page=1221" }
        //         }
        //     }
        //
        const transactions = this.safeValue (response, 'transactions', []);
        return this.parseLedger (transactions, currency, since, limit);
    }

    parseTransactionType (type) {
        const types = {
            'withdraw': 'withdrawal',
            'atm_payment': 'deposit',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchWithdrawals
        //
        //     // fiat
        //
        //     {
        //         "id": 21311223,
        //         "date": "2015-06-30T13:55:11.000Z",
        //         "type": "withdraw",
        //         "price": 103.00,
        //         "currency": "EUR",
        //         "fund_id": null,
        //         "order_id": null,
        //         "trade_id": null,
        //         "transfer_detail": {
        //             "method": "wire_transfer",
        //             "id": "F112DD3",
        //             "recipient": "IT123456789012",
        //             "confirmations": 0
        //         }
        //     }
        //
        //     {
        //         "id": 12564223,
        //         "date": "2017-08-07T08:13:50.023Z",
        //         "note": "GB7IDL401573388",
        //         "type": "withdraw",
        //         "price": 4345.93,
        //         "fund_id": null,
        //         "currency": "EUR",
        //         "order_id": null,
        //         "trade_id": null,
        //         "transfer_detail": {
        //             "id": "EXECUTEDBUTUNCHECKED",
        //             "method": "wire_transfer",
        //             "recipient": "GB7IDL401573388",
        //             "confirmations": 0
        //         }
        //     }
        //
        //     // crypto
        //
        //     {
        //         id: 20914695,
        //         date: '2018-02-24T07:13:23.002Z',
        //         type: 'withdraw',
        //         price: 2.70883607,
        //         currency: 'BCH',
        //         fund_id: null,
        //         order_id: null,
        //         trade_id: null,
        //         note: '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm',
        //         transfer_detail: {
        //             method: 'bitcoin_cash',
        //             id: '8261949194985b01985006724dca5d6059989e096fa95608271d00dd902327fa',
        //             recipient: '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm',
        //             confirmations: 0
        //         }
        //     }
        //
        //
        // fetchDeposits
        //
        //     // fiat
        //
        //     {
        //         id: 16176632,
        //         date: '2017-11-20T21:00:13.355Z',
        //         type: 'atm_payment',
        //         price: 5000,
        //         currency: 'EUR',
        //         fund_id: null,
        //         order_id: null,
        //         trade_id: null,
        //         note: 'Mistral deposit',
        //         transfer_detail: {
        //             method: 'wire_transfer',
        //             id: '972JQ49337DX769T',
        //             recipient: null,
        //             confirmations: 0
        //         }
        //     }
        //
        //     // crypto
        //
        //     {
        //         "id": 21311222,
        //         "date": "2015-06-30T13:55:11.000Z",
        //         "type": "atm_payment",
        //         "price": 2.01291,
        //         "currency": "BTC",
        //         "fund_id": "null",
        //         "order_id": null,
        //         "trade_id": null,
        //         "transfer_detail": {
        //             "method": "bitcoin",
        //             "id": "0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098",
        //             "recipient": "mzb3NgX9Dr6jgGAu31L6jsPGB2zkaFxxyf",
        //             "confirmations": 3
        //         }
        //     }
        //
        // privatePostAtmsWithdraw
        //    { "transaction_id": 65088485 }
        //
        const id = this.safeString2 (transaction, 'id', 'transaction_id');
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const detail = this.safeValue (transaction, 'transfer_detail', {});
        const method = this.safeString (detail, 'method');
        let txid = undefined;
        let address = undefined;
        if (method !== undefined) {
            if (method !== 'wire_transfer') {
                txid = this.safeString (detail, 'id');
                address = this.safeString (detail, 'recipient');
            }
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const amount = this.safeNumber (transaction, 'price');
        const timestamp = this.parse8601 (this.safeString (transaction, 'date'));
        const status = 'ok';
        const network = this.safeString (detail, 'method');
        // todo parse tags
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': network,
            'addressFrom': undefined,
            'addressTo': address,
            'address': address,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'type': 'withdraw',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        const request = {
            'type': 'atm_payment',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'page': 1,
            // 'fund_id': 'ETHBTC', // filter by fund symbol
            // 'currency': 'BTC', // filter by currency
            // 'after': '2015-02-06T08:47:26Z', // filter after a certain timestamp
            // 'before': '2015-02-06T08:47:26Z',
            // 'type': 'withdraw',
            // 'order_id': '12832371', // filter by a specific order ID
            // 'trade_id': '12923212', // filter by a specific trade ID
            // 'transfer_method': 'bitcoin', // wire_transfer, ripple, greenaddress, bitcoin, litecoin, namecoin, peercoin, dogecoin
            // 'transfer_recipient': '1MAHLhJoz9W2ydbRf972WSgJYJ3Ui7aotm', // filter by a specific recipient (e.g. Bitcoin address, IBAN)
            // 'transfer_id': '8261949194985b01985006724dca5d6059989e096fa95608271d00dd902327fa', // filter by a specific transfer ID (e.g. Bitcoin TX hash)
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        params = this.extend (request, params);
        const response = await this.privateGetTransactions (params);
        //
        //     {
        //         "transactions": [
        //             {
        //                 "id": 21311223,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "withdraw",
        //                 "price": 103.00,
        //                 "currency": "EUR",
        //                 "fund_id": null,
        //                 "order_id": null,
        //                 "trade_id": null,
        //                 "transfer_detail": {
        //                     "method": "wire_transfer",
        //                     "id": "F112DD3",
        //                     "recipient": "IT123456789012",
        //                     "confirmations": 0
        //                 }
        //             },
        //             {
        //                 "id": 21311222,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "atm_payment",
        //                 "price": 2.01291,
        //                 "currency": "BTC",
        //                 "fund_id": "null",
        //                 "order_id": null,
        //                 "trade_id": null,
        //                 "transfer_detail": {
        //                     "method": "bitcoin",
        //                     "id": "0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098",
        //                     "recipient": "mzb3NgX9Dr6jgGAu31L6jsPGB2zkaFxxyf",
        //                     "confirmations": 3
        //                 }
        //             },
        //             {
        //                 "id": 21311221,
        //                 "date": "2015-06-30T13:55:11.000Z",
        //                 "type": "paid_commission",
        //                 "price": 0.0001,
        //                 "fund_id": "BTCEUR",
        //                 "order_id": 12832371,
        //                 "trade_id": 12923212,
        //                 "currency": "BTC",
        //                 "transfer_detail": null
        //             }
        //         ],
        //         "meta": {
        //             "total_count": 1221,
        //             "first": { "page": 1, "href": "https://api.therocktrading.com/v1/transactions?page=1" },
        //             "previous": null,
        //             "current": { "page": 1, "href": "https://api.therocktrading.com/v1/transactions?page=1" },
        //             "next": { "page": 2, "href": "https://api.therocktrading.com/v1/transactions?page=2" },
        //             "last": { "page": 1221, "href": "https://api.therocktrading.com/v1/transactions?page=1221" }
        //         }
        //     }
        //
        const transactions = this.safeValue (response, 'transactions', []);
        const transactionTypes = [ 'withdraw', 'atm_payment' ];
        const depositsAndWithdrawals = this.filterByArray (transactions, 'type', transactionTypes, false);
        return this.parseTransactions (depositsAndWithdrawals, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name therock#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        amount = this.currencyToPrecision (code, amount);
        const request = {
            'currency': currency['id'],
            'destination_address': address,
            'amount': parseFloat (amount),
        };
        if (tag !== undefined) {
            request['destination_tag'] = tag;
        }
        // requires write permission on the wallet
        const response = await this.privatePostAtmsWithdraw (this.extend (request, params));
        //
        //    { "transaction_id": 65088485 }
        //
        const transaction = this.parseTransaction (response, currency);
        const withdrawOptions = this.safeValue (this.options, 'withdraw', {});
        const fillResponseFromRequest = this.safeValue (withdrawOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            if (transaction['addressTo'] === address) {
                transaction['addressTo'] = address;
            }
            if (transaction['address'] === undefined) {
                transaction['address'] = address;
            }
            if (transaction['tagTo'] === undefined) {
                transaction['tagTo'] = tag;
            }
            if (transaction['tag'] === undefined) {
                transaction['tag'] = tag;
            }
            if (transaction['amount'] === undefined) {
                transaction['amount'] = amount;
            }
        }
        return transaction;
    }

    parseOrderStatus (status) {
        const statuses = {
            'active': 'open',
            'executed': 'closed',
            'deleted': 'canceled',
            // don't know what this status means
            // 'conditional': '?',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id": 4325578,
        //         "fund_id":"BTCEUR",
        //         "side":"buy",
        //         "type":"limit",
        //         "status":"executed",
        //         "price":0.0102,
        //         "amount": 50.0,
        //         "amount_unfilled": 0.0,
        //         "conditional_type": null,
        //         "conditional_price": null,
        //         "date":"2015-06-03T00:49:48.000Z",
        //         "close_on": nil,
        //         "leverage": 1.0,
        //         "position_id": null,
        //         "trades": [
        //             {
        //                 "id":237338,
        //                 "fund_id":"BTCEUR",
        //                 "amount":50,
        //                 "price":0.0102,
        //                 "side":"buy",
        //                 "dark":false,
        //                 "date":"2015-06-03T00:49:49.000Z"
        //             }
        //         ]
        //     }
        //
        const id = this.safeString (order, 'id');
        const marketId = this.safeString (order, 'fund_id');
        const symbol = this.safeSymbol (marketId, market);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.parse8601 (this.safeString (order, 'date'));
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const amount = this.safeNumber (order, 'amount');
        const remaining = this.safeNumber (order, 'amount_unfilled');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
        }
        const price = this.safeNumber (order, 'price');
        let trades = this.safeValue (order, 'trades');
        let cost = undefined;
        let average = undefined;
        let lastTradeTimestamp = undefined;
        if (trades !== undefined) {
            const numTrades = trades.length;
            if (numTrades > 0) {
                trades = this.parseTrades (trades, market, undefined, undefined, {
                    'orderId': id,
                });
                // todo: determine the cost and the average price from trades
                cost = 0;
                filled = 0;
                for (let i = 0; i < numTrades; i++) {
                    const trade = trades[i];
                    cost = this.sum (cost, trade['cost']);
                    filled = this.sum (filled, trade['amount']);
                }
                if (filled > 0) {
                    average = cost / filled;
                }
                lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
            } else {
                cost = 0;
            }
        }
        const stopPrice = this.safeNumber (order, 'conditional_price');
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': remaining,
            'fee': undefined,
            'trades': trades,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'active',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'status': 'executed',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'fund_id': market['id'],
            // 'after': '2015-02-06T08:47:26Z',
            // 'before': '2015-02-06T08:47:26Z'
            // 'status': 'active', // 'executed', 'conditional'
            // 'side': 'buy', // 'sell'
            // 'position_id': 123, // filter orders by margin position id
        };
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.privateGetFundsFundIdOrders (this.extend (request, params));
        //
        //     {
        //         orders: [
        //             {
        //                 id: 299333648,
        //                 fund_id: 'BTCEUR',
        //                 side: 'sell',
        //                 type: 'limit',
        //                 status: 'executed',
        //                 price: 5821,
        //                 amount: 0.1,
        //                 amount_unfilled: 0,
        //                 conditional_type: null,
        //                 conditional_price: null,
        //                 date: '2018-06-18T17:38:16.129Z',
        //                 close_on: null,
        //                 dark: false,
        //                 leverage: 1,
        //                 position_id: 0
        //             }
        //         ]
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchOrder
         * @description fetches information on an order made by the user
         * @param {strs} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': id,
            'fund_id': market['id'],
        };
        const response = await this.privateGetFundsFundIdOrdersId (this.extend (request, params));
        //
        //     {
        //         "id": 4325578,
        //         "fund_id":"BTCEUR",
        //         "side":"buy",
        //         "type":"limit",
        //         "status":"executed",
        //         "price":0.0102,
        //         "amount": 50.0,
        //         "amount_unfilled": 0.0,
        //         "conditional_type": null,
        //         "conditional_price": null,
        //         "date":"2015-06-03T00:49:48.000Z",
        //         "close_on": null,
        //         "leverage": 1.0,
        //         "position_id": null,
        //         "trades": [
        //             {
        //                 "id":237338,
        //                 "fund_id":"BTCEUR",
        //                 "amount":50,
        //                 "price":0.0102,
        //                 "side":"buy",
        //                 "dark":false,
        //                 "date":"2015-06-03T00:49:49.000Z"
        //             }
        //         ]
        //     }
        //
        return this.parseOrder (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name therock#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        if (type === 'market') {
            price = 0;
        }
        const market = this.market (symbol);
        const request = {
            'fund_id': market['id'],
            'side': side,
            'amount': amount,
            'price': price,
        };
        const response = await this.privatePostFundsFundIdOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name therock#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
            'fund_id': this.marketId (symbol),
        };
        const response = await this.privateDeleteFundsFundIdOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents in minutes
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const periodInSeconds = this.parseTimeframe (timeframe);
        const periodInMinutes = parseInt (periodInSeconds / 60);
        const request = {
            'id': market['id'],
            'period': periodInMinutes,
        };
        if (since === undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.publicGetFundsIdOhlcStatistics (this.extend (request, params));
        //
        //     [
        //         {
        //             "fund_id": "BTCUSDT",
        //             "open": 31500.0,
        //             "high": 31500.0,
        //             "low": 31500.0,
        //             "close": 31500.0,
        //             "average": 31500.0,
        //             "weighted_average": 31500.0,
        //             "base_volume": 0.0,
        //             "traded_volume": 0.0,
        //             "interval_starts_at": "2022-06-06T16:40:00.000Z",
        //             "interval_ends_at": "2022-06-06T16:50:00.000Z"
        //         }
        //         ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "fund_id": "BTCUSDT",
        //         "open": 31500.0,
        //         "high": 31500.0,
        //         "low": 31500.0,
        //         "close": 31500.0,
        //         "average": 31500.0,
        //         "weighted_average": 31500.0,
        //         "base_volume": 0.0,
        //         "traded_volume": 0.0,
        //         "interval_starts_at": "2022-06-06T16:40:00.000Z",
        //         "interval_ends_at": "2022-06-06T16:50:00.000Z"
        //     }
        //
        const dateTime = this.safeString (ohlcv, 'interval_starts_at');
        return [
            this.parse8601 (dateTime),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'base_volume'),
        ];
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['per_page'] = limit; // default 25 max 200
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.privateGetFundsIdTrades (this.extend (request, params));
        //
        //     {
        //         "trades": [
        //             {
        //                 "id":237338,
        //                 "fund_id":"BTCEUR",
        //                 "amount":0.348,
        //                 "price":348.0,
        //                 "side":"sell",
        //                 "dark": false,
        //                 "order_id":14920648,
        //                 "date":"2015-06-03T00:49:49.000Z",
        //                 "transactions": [
        //                     { "id": 2770768, "date": "2015-06-03T00:49:49.000Z", "type": "sold_currency_to_fund", "price": 121.1, "currency": "EUR" },
        //                     { "id": 2770769, "date": "2015-06-03T00:49:49.000Z", "type": "released_currency_to_fund", "price": 0.348, "currency": "BTC" },
        //                     { "id": 2770772, "date": "2015-06-03T00:49:49.000Z", "type": "paid_commission", "price": 0.06, "currency": "EUR", "trade_id": 440492 },
        //                 ]
        //             }
        //         ],
        //         "meta": {
        //             "total_count": 31,
        //             "first": { "href": "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=1" },
        //             "previous": null,
        //             "current": { "href": "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=1" },
        //             "next": { "href": "https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=2" },
        //             "last":{ "href":"https://api.therocktrading.com/v1/funds/BTCXRP/trades?page=2" }
        //         }
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name therock#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['per_page'] = limit; // default 25 max 200
        }
        if (since !== undefined) {
            request['after'] = this.iso8601 (since);
        }
        const response = await this.publicGetFundsIdTrades (this.extend (request, params));
        //
        //     {
        //         trades: [
        //             {
        //                 id:  4493548,
        //                 fund_id: "ETHBTC",
        //                 amount:  0.203,
        //                 price:  0.02783576,
        //                 side: "buy",
        //                 dark:  false,
        //                 date: "2018-11-30T08:19:18.236Z"
        //             },
        //             {
        //                 id:  4492926,
        //                 fund_id: "ETHBTC",
        //                 amount:  0.04,
        //                 price:  0.02767034,
        //                 side: "buy",
        //                 dark:  false,
        //                 date: "2018-11-30T07:03:03.897Z"
        //             }
        //         ],
        //         meta: {
        //             total_count: null,
        //             first: { page: 1, href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=1" },
        //             previous: null,
        //             current: { page:  1, href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=1" },
        //             next: { page:  2, href: "https://api.therocktrading.com/v1/funds/ETHBTC/trades?page=2" },
        //             last: null
        //         }
        //     }
        //
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name therock#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'id': market['id'],
        };
        const response = await this.publicGetFundsId (this.extend (request, params));
        //
        //     {
        //         id: 'ETHBTC',
        //         description: 'Trade Ether with Bitcoin',
        //         type: 'currency',
        //         base_currency: 'BTC',
        //         trade_currency: 'ETH',
        //         buy_fee: '0.2',
        //         sell_fee: '0.2',
        //         minimum_price_offer: '0.00000001',
        //         minimum_quantity_offer: '0.005',
        //         base_currency_decimals: '8',
        //         trade_currency_decimals: '3',
        //         leverages: []
        //     }
        //
        request = {
            'id': market['quoteId'],
        };
        const discount = await this.privateGetDiscountsId (this.extend (request, params));
        //
        //     {
        //         "currency":"BTC",
        //         "discount":50.0,
        //         "details": {
        //             "personal_discount": 50.0,
        //             "commissions_related_discount": 0.0
        //         }
        //     }
        //
        return this.parseTradingFee (response, discount, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name therock#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the therock api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetFunds (params);
        //
        //     {
        //         funds: [
        //             {
        //                 id: 'BTCEUR',
        //                 description: 'Trade Bitcoin with Euro',
        //                 type: 'currency',
        //                 base_currency: 'EUR',
        //                 trade_currency: 'BTC',
        //                 buy_fee: '0.2',
        //                 sell_fee: '0.2',
        //                 minimum_price_offer: '0.01',
        //                 minimum_quantity_offer: '0.0005',
        //                 base_currency_decimals: '2',
        //                 trade_currency_decimals: '4',
        //                 leverages: []
        //             },
        //         ]
        //     }
        //
        const discountsResponse = await this.privateGetDiscounts (params);
        //
        //     {
        //         "discounts": [
        //             {
        //                 "currency":"BTC",
        //                 "discount":50.0,
        //                 "details": {
        //                     "personal_discount": 50.0,
        //                     "commissions_related_discount": 0.0
        //                 }
        //             }
        //         ]
        //     }
        //
        const funds = this.safeValue (response, 'funds', []);
        const discounts = this.safeValue (discountsResponse, 'discounts', []);
        const result = {};
        for (let i = 0; i < funds.length; i++) {
            const fund = funds[i];
            const marketId = this.safeString (fund, 'id');
            const market = this.safeMarket (marketId);
            const quoteId = this.safeValue (market, 'quoteId');
            const discount = this.filterBy (discounts, 'currency', quoteId);
            const fee = this.parseTradingFee (fund, discount, market);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    parseTradingFee (fee, discount = undefined, market = undefined) {
        const marketId = this.safeString (fee, 'id');
        const takerString = this.safeString (fee, 'buy_fee');
        const makerString = this.safeString (fee, 'sell_fee');
        // TotalFee = (100 - discount) * fee / 10000
        const discountString = this.safeString (discount, 'discount', '0');
        const feePercentage = Precise.stringSub ('100', discountString);
        const taker = this.parseNumber (Precise.stringDiv (Precise.stringMul (takerString, feePercentage), '10000'));
        const maker = this.parseNumber (Precise.stringDiv (Precise.stringMul (makerString, feePercentage), '10000'));
        return {
            'info': fee,
            'symbol': this.safeSymbol (marketId, market),
            'maker': maker,
            'taker': taker,
            'percentage': true,
            'tierBased': true,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = (headers === undefined) ? {} : headers;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (Object.keys (query).length) {
                if (method === 'POST') {
                    body = this.json (query);
                    headers['Content-Type'] = 'application/json';
                } else {
                    const queryString = this.rawencode (query);
                    if (queryString.length) {
                        url += '?' + queryString;
                    }
                }
            }
            const nonce = this.nonce ().toString ();
            const auth = nonce + url;
            headers['X-TRT-KEY'] = this.apiKey;
            headers['X-TRT-NONCE'] = nonce;
            headers['X-TRT-SIGN'] = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
        } else if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.rawencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {
        //         "errors": [
        //             { "message": ":currency is not a valid value for param currency","code": "11","meta": { "key":"currency","value":":currency"} },
        //             { "message": "Address allocation limit reached for currency :currency.","code": "13" },
        //             { "message": "Request already running", "code": "50"},
        //             { "message": "cannot specify multiple address types", "code": "12" },
        //             { "message": ":address_type is invalid", "code": "12" }
        //         ]
        //     }
        //
        const errors = this.safeValue (response, 'errors', []);
        const numErrors = errors.length;
        if (numErrors > 0) {
            const feedback = this.id + ' ' + body;
            // here we throw the first error we can identify
            for (let i = 0; i < numErrors; i++) {
                const error = errors[i];
                const message = this.safeString (error, 'message');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
