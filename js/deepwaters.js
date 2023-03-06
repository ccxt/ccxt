'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidNonce, BadSymbol } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class deepwaters extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deepwaters',
            'name': 'Deepwaters',
            'countries': [ 'US' ],
            'rateLimit': 5,
            'certified': false,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,                       // DELETE /orders?pair= (pair is optional)
                'cancelOrder': true,                           // DELETE /orders/by-venue-order-id/:orderId
                'createOrder': true,                           // POST /orders
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,                          // GET /customer {.result.balances[]}
                'fetchBidsAsks': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,                      // GET /orders?status-in=FILLED&pair=XXX (pair is optional, returns max 100 orders)
                'fetchCanceledOrders': true,                    // GET /orders?status-in=CANCELLED&pair=XXX (pair is optional, returns max 100 orders)
                'fetchCurrencies': true,                        // GET /assets
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,                           // GET /pairs
                'fetchMyTrades': true,                          // GET /trades?pair=:marketName (pair is optional, returns max 100 results)
                'fetchOHLCV': false,                            // Currently not supported
                'fetchOpenOrders': true,                        // GET /orders?status-in=ACTIVE-PARTIALLY_FILLED&pair=XXX (pair is optional, returns max 100 orders)
                'fetchOrder': true,                             // GET /orders/by-venue-order-id/:orderId
                'fetchOrderBook': true,                         // GET /pairs/:marketId/orderbook
                'fetchOrders': true,                            // GET /orders?pair=:marketId (pair is optional, returns max 100 orders)
                'fetchPositionMode': false,
                'fetchStatus': false,                           // could maybe use customer endpoint?
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': undefined,
            'urls': {
                'test': {
                    'public': 'https://testnet.api.deepwaters.xyz/rest/v1',
                    'private': 'https://testnet.api.deepwaters.xyz/rest/v1',
                },
                'api': {
                    'public': 'https://api.deepwaters.xyz/rest/v1',
                    'private': 'https://api.deepwaters.xyz/rest/v1',
                },
                'www': 'https://deepwaters.xyz',
                'referral': '',
                'doc': [
                    'https://rest.docs.api.deepwaters.xyz/',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.0015,
                    // 'feeside': TODO
                    'feeSide': 'get',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'pairs',
                        'pairs/{pair}/orderbook',
                        'time',
                    ],
                },
                'private': {
                    'get': {
                        'customer': 1,
                        'customer/api-key-status': 1,
                        'orders': 1,
                        'trades': 1,
                        'orders/by-venue-order-id/{id}': 1,
                        'orders/by-customer-object-id/{id}': 1,
                    },
                    'post': {
                        'orders': 1,
                    },
                    'delete': {
                        'orders': 1,
                        'orders/by-venue-order-id/{id}': 1,
                        'orders/by-customer-object-id/{id}': 1,
                    },
                },
            },
            'precisionMode': DECIMAL_PLACES,
        });
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        return await this.fetchTickers (symbols, params);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        if (!symbol) {
            throw new ArgumentsRequired ('symbol must be provided to deepwaters#fetchTicket()');
        }
        const tickers = await this.fetchTickers ([ symbol ]);
        if (tickers.length === 0) {
            throw new BadSymbol ('Symbol not found. Is it available in  deepwaters#fetchMarkets()?');
        }
        return tickers[symbol];
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetPairs ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const markets = this.safeValue (response, 'result', {});
        const tickers = [];
        for (let i = 0; i < markets.length; i++) {
            // {
            //     baseAssetRootSymbol: 'AVAX',
            //     quoteAssetRootSymbol: 'USDC',
            //     baseAssetParentSymbol: 'WAVAX.DW',
            //     quoteAssetParentSymbol: 'USDC.DW',
            //     baseAssetID: 'WAVAX.AVALANCHE_FUJI.43113.TESTNET.PROD',
            //     quoteAssetID: 'USDC.AVALANCHE_FUJI.43113.TESTNET.PROD',
            //     name: 'WAVAX.AVALANCHE_FUJI.43113.TESTNET.PROD-USDC.AVALANCHE_FUJI.43113.TESTNET.PROD',
            //     baseAssetIncrementSize: '.01',
            //     baseAssetIncrementPrecision: '2',
            //     quoteAssetIncrementSize: '.001',
            //     quoteAssetIncrementPrecision: '3',
            //     createdAtMicros: '1677695274781348',
            //     quotedAtMicros: '1677838210968536',
            //     ask: '16.418',
            //     bid: '16.396'
            // }
            const market = markets[i];
            const base = this.safeValue (market, 'baseAssetRootSymbol');
            const quote = this.safeValue (market, 'quoteAssetRootSymbol');
            const symbol = base + '/' + quote;
            const quotedAtMicros = this.safeValue (market, 'quotedAtMicros');
            const timestamp = this.parseNumber (Precise.stringDiv (quotedAtMicros, '1000', 0));
            const datetime = this.iso8601 (timestamp);
            const ask = this.safeNumber (market, 'ask');
            const bid = this.safeNumber (market, 'bid');
            tickers.push (this.safeTicker ({
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': datetime,
                'ask': ask,
                'bid': bid,
                'info': market,
            }));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchMarkets
         * @description retrieves data on all markets for deepwaters
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetPairs ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        // {
        //     "success": true,
        //     "result": [
        //       {
        //         "baseAssetRootSymbol": "ETH",
        //         "quoteAssetRootSymbol": "USDC",
        //         "baseAssetParentSymbol": "WETH.DW",
        //         "quoteAssetParentSymbol": "USDC.DW",
        //         "baseAssetID": "WETH_EM_MB",
        //         "quoteAssetID": "USDC_EM_MB",
        //         "name": "WETH_EM_MB-USDC_EM_MB",
        //         "baseAssetIncrementSize": ".00001",
        //         "baseAssetIncrementPrecision": 5,
        //         "quoteAssetIncrementSize": ".01",
        //         "quoteAssetIncrementPrecision": 2,
        //         "createdAtMicros": 1677434515360241,
        //         "quotedAtMicros": 1677452326283803,
        //         "ask": "1636.39",
        //         "bid": "1631.15"
        //       },
        //       ...
        const markets = this.safeValue (response, 'result');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const lowercaseId = this.safeStringLower (market, 'name');
            const exchangeBaseId = this.safeString (market, 'baseAssetID');
            const exchangeQuoteId = this.safeString (market, 'quoteAssetID');
            const baseId = this.safeString (market, 'baseAssetRootSymbol');
            const quoteId = this.safeString (market, 'quoteAssetRootSymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const pricePrecision = this.safeString (market, 'quoteAssetIncrementPrecision');
            const amountPrecision = this.safeString (market, 'baseAssetIncrementPrecision');
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': exchangeBaseId,
                'quoteId': exchangeQuoteId,
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
                    'amount': this.parseNumber (this.parsePrecision (amountPrecision)),
                    'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                    // base and quote precisions not defined
                    'cost': undefined,
                },
                // Docs don't explain what the order limits are
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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
                'info': market,
            };
            if (base !== quote) {
                // Don't push this market if base and quote are the same
                // This is currently only true on testnet which has several USDC/USDC markets
                result.push (entry);
            }
        }
        return result;
    }

    getNonce () {
        if (!this.dwnonce) {
            return 0;
        }
        return this.dwnonce;
    }

    async fetchNonce () {
        const response = await this.privateGetCustomerApiKeyStatus ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        const nonce = this.safeString (result, 'nonce', '0');
        this.dwnonce = this.parseNumber (nonce);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchCurrencies
         * @description Fetches all available currencies an exchange and returns an associative dictionary of currencies.
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a dictionary of [currency structure]{@link https://docs.ccxt.com/en/latest/manual.html#currency-structure}
         */
        const response = await this.publicGetAssets ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        // {
        //     "success": true,
        //     "result": [
        //       {
        //         "chainID": 1,
        //         "chainName": "ETHEREUM_MAINNET",
        //         "assetAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //         "rootSymbol": "USDC",
        //         "assetID": "USDC_EM_MB",
        //         "parentSymbol": "USDC.DW",
        //         "frontEndSymbol": "USDC",
        //         "name": "USD Coin",
        //         "ticker": "USDC",
        //         "frontEndName": "",
        //         "uiDecimals": 2,
        //         "databaseDecimals": 25,
        //         "contractDecimals": 6,
        //         "createdAtMicros": 1677434515342102
        //       },
        //       ...
        const currencies = this.safeValue (response, 'result', {});
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'assetID');
            const code = this.safeString (currency, 'rootSymbol');
            const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'uiDecimals')));
            // assumes all currencies are active except those listed above
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseBalance (response) {
        const timestamp = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const responseResult = this.safeValue (response, 'result', {});
        const responseBalances = this.safeValue (responseResult, 'balances', []);
        const balances = this.isArray (responseBalances) ? responseBalances : [];
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'assetID');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeNumber (balance, 'amount');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
            'ACTIVE': 'open',
            'FILLED': 'closed',
            'PARTIALLY_FILLED': 'open',
            'EXPIRED': 'closed',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        // console.log('parseorder', order, market);
        if (market === undefined) {
            const baseId = this.safeString (order, 'baseAssetID');
            const base = this.safeCurrencyCode (baseId);
            const quoteId = this.safeString (order, 'quoteAssetID');
            let quote = this.safeCurrencyCode (quoteId);
            if ((!(quoteId in this.currencies_by_id)) && (quoteId.indexOf ('USDC') === 0)) {
                // Their testnet has multiple USDC currencies with different IDs.
                // This causes the currencies list USDC entry to be overwritten when currencies
                // are parsed, which means the above will have an undefined quote.
                // As of right now, there isn't any ambiguity with mainnet currencies
                quote = 'USDC';
            }
            const marketSymbol = base + '/' + quote;
            market = this.market (marketSymbol);
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        // Deepwaters appears to have 2 unique IDs per order: customerObjectID and
        // venueOrderID. customerObjectID is something the user can set, but is otherwise
        // autogenerated
        const id = this.safeString (order, 'venueOrderID');
        const clientOrderId = this.safeString (order, 'customerObjectID');
        const createdTimestampMicros = this.safeString (order, 'createdAtMicros');
        const updatedTimestampMicros = this.safeString (order, 'modifiedAtMicros');
        let createdTimestampMs = undefined;
        let updatedTimestampMs = undefined;
        if (createdTimestampMicros) {
            createdTimestampMs = Precise.stringDiv (createdTimestampMicros, '1000', 0);
        }
        if (updatedTimestampMs) {
            updatedTimestampMs = Precise.stringDiv (updatedTimestampMicros, '1000', 0);
        }
        let timeInForce = 'GTC';
        if (this.safeString (order, 'durationType') === 'GOOD_TILL_EXPIRY') {
            // GTE doesn't seem to be used anywhere else in ccxt,
            // but deepwaters' api has a distinction
            timeInForce = 'GTE';
        }
        let type = 'limit';
        if (this.safeString (order, 'type') === 'MARKET') {
            type = 'market';
        }
        let side = 'buy';
        if (this.safeString (order, 'side') === 'SELL') {
            side = 'sell';
        }
        const price = this.safeString (order, 'price');
        const remaining = this.safeString (order, 'quantity');
        const amount = this.safeString (order, 'originalQuantity');
        const filled = Precise.stringSub (amount, remaining);
        const parsedOrder = {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': this.parseNumber (createdTimestampMs),
            'datetime': this.iso8601 (createdTimestampMs),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'status': status,
            'trades': undefined,
            // 'average': this.parseNumber (average), TODO
            // 'cost': this.parseNumber (cost), TODO
            'fee': undefined, // Not available via API
            'stopPrice': undefined, // N/A
            'triggerPrice': undefined, // N/A
            'postOnly': undefined, // N/A
        };
        if (status === 'closed') {
            parsedOrder['lastTradetimestamp'] = this.parseNumber (updatedTimestampMs);
        }
        if ((status === 'open') && (amount !== remaining)) {
            parsedOrder['lastTradeTimestamp'] = this.parseNumber (updatedTimestampMs);
        }
        return this.safeOrder (parsedOrder, market);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetCustomer ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        // {
        //     customerAddress: '0x4db55abc5e7532439501bc6aed40b6281382959a',
        //     nonce: '1',
        //     createdAtMicros: '1677829125843454',
        //     modifiedAtMicros: '1677829125843553',
        //     lastCustomerObjectID: null,
        //     balances: []
        // }
        const result = this.safeValue (response, 'result', {});
        const balances = this.safeValue (result, 'balances');
        const modifiedAtMicros = this.safeValue (result, 'modifiedAtMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (modifiedAtMicros, '1000', 0));
        const datetime = this.iso8601 (timestamp);
        const output = {
            'timestamp': timestamp,
            'datetime': datetime,
            'info': result,
            'free': {},
            'used': {},
            'total': {},
        };
        for (let i = 0; i < balances.length; i++) {
            // {
            //     'amount': 'string',
            //     'assetID': 'string',
            //     'serviceDescription': 'string',
            //     'serviceName': 'string'
            // }
            const balance = balances[i];
            const currencyId = this.safeValue (balance, 'assetID');
            const currency = this.safeValue (this.currencies_by_id, currencyId);
            if (!currency) {
                // this is only needed in sandbox mode, if you get airdrops
                continue;
            }
            const currencyCode = this.safeValue (currency, 'code');
            if (!output[currencyCode]) {
                output[currencyCode] = {
                    'used': '0',
                    'free': '0',
                };
                output['used'][currencyCode] = '0';
                output['free'][currencyCode] = '0';
            }
            const amount = this.safeValue (balance, 'amount');
            const serviceName = this.safeValue (balance, 'serviceName');
            if (serviceName === 'accounting.available') {
                output[currencyCode]['free'] = amount;
                output['free'][currencyCode] = amount;
            } else if (serviceName === 'fee' || serviceName === 'swap.engine') {
                const used = Precise.stringAdd (output[currencyCode]['used'], amount);
                output[currencyCode]['used'] = used;
                output['used'][currencyCode] = used;
            }
        }
        const keys = Object.keys (output['used']);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const total = Precise.stringAdd (output['used'][key], output['free'][key]);
            output['total'][key] = total;
            output[key]['total'] = total;
        }
        return this.safeBalance (output);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetPairsPairOrderbook (this.extend (request, params));
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        //
        // {
        //   snapshotAtMicros: '1641562961192',
        //   asks: [
        //     { price: '0.921', quantity: '76.01', depth: 0 },
        //     { price: '0.933', quantity: '477.10', depth: 1 },
        //     ...
        //   ],
        //   bids: [
        //     { price: '0.940', quantity: '13502.47', depth: 0 },
        //     { price: '0.932', quantity: '43.91', depth: 1 },
        //     ...
        //   ]
        // }
        //
        const timestampMicros = this.safeString (result, 'snapshotAtMicros', '0');
        const timestamp = this.parseNumber (Precise.stringDiv (timestampMicros, '1000', 0));
        return this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            since = Precise.stringMul (this.decimalToPrecision (since), '1000');
            request['created-at-or-after-micros'] = since;
        }
        if (limit !== undefined) {
            limit = this.decimalToPrecision (limit);
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'orders', []);
        // const success = this.safeValue (response, 'success', false);
        return this.parseOrders (orders);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'pair': '',
            // 'type': '',
            // 'created-at-or-after-micros': '',
            // 'created-before-micros': '',
            // 'skip': '',
            'limit': 100,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            since = Precise.stringMul (this.decimalToPrecision (since), '1000');
            request['created-at-or-after-micros'] = since;
        }
        if (limit !== undefined) {
            limit = this.decimalToPrecision (limit);
            request['limit'] = limit;
        }
        const type = this.safeString (params, 'type');
        if (typeof type === 'string') {
            params = this.omit (params, 'type');
            if (type.toUpperCase === 'LIMIT') {
                request['type'] = 'LIMIT';
            }
            if (type.toUpperCase () === 'MARKET') {
                // Getting the following error right now with type === 'MARKET' despite what the docs say
                //     handleRestResponse:
                //     deepwaters GET https://testnet.api.deepwaters.xyz/rest/v1/trades?limit=10&pair=WAVAX.AVALANCHE_FUJI.43113.TESTNET.PROD-USDC.AVALANCHE_FUJI.43113.TESTNET.PROD&created-at-or-after-micros=1677982036376000&type=MARKET 400 Bad Request
                //    ResponseHeaders:
                //     {
                //      'Alt-Svc': 'h3=":443"; ma=2592000',
                //      Connection: 'close',
                //      'Content-Length': '112',
                //      'Content-Type': 'application/json; charset=utf-8',
                //      Date: 'Sun, 05 Mar 2023 05:27:16 GMT',
                //      Server: 'Caddy',
                //      Vary: 'Origin'
                //    }
                //    ResponseBody:
                //     {"success":false,"status":"invalid request","error":"MARKET is an invalid type. Valid are: FILL, PARTIAL_FILL"}
                request['type'] = 'PARTIAL_FILL';
            }
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        const trades = this.safeValue (result, 'trades', []);
        const output = [];
        for (let i = 0; i < trades.length; i++) {
            // {
            //     "aggressorCustomerObjectID": "string",
            //     "aggressorFeesTotalValueInQuoteAsset": "string",
            //     "aggressorFeesQuoteAssetAmount": "string",
            //     "aggressorFeesWTRAmount": "string",
            //     "aggressorRemainingQuantity": "string",
            //     "aggressorVenueOrderID": "string",
            //     "baseAssetID": "string",
            //     "createdAtMicros": 0,
            //     "makerCustomerObjectID": "string",
            //     "makerFeesTotalValueInQuoteAsset": "string",
            //     "makerFeesQuoteAssetAmount": "string",
            //     "makerFeesWTRAmount": "string",
            //     "makerRemainingQuantity": "string",
            //     "makerVenueOrderID": "string",
            //     "makerWasBuyer": true,
            //     "price": "string",
            //     "quantity": "string",
            //     "quoteAssetID": "string",
            //     "tradeID": "string",
            //     "tradeType": "FILL",
            //     "userWasAggressor": true,
            //     "userWasMaker": true
            // }
            const trade = trades[i];
            const id = this.safeValue (trade, 'tradeID');
            const createdAtMicros = this.safeString (trade, 'createdAtMicros');
            const timestamp = this.parseNumber (Precise.stringDiv (createdAtMicros, '1000', 0));
            const datetime = this.iso8601 (timestamp);
            const baseAssetID = this.safeValue (trade, 'baseAssetID');
            const quoteAssetID = this.safeValue (trade, 'quoteAssetID');
            const market = this.market (baseAssetID + '-' + quoteAssetID);
            const symbol = this.safeValue (market, 'symbol');
            const makerWasBuyer = this.safeValue (market, 'makerWasBuyer');
            const userWasMaker = this.safeValue (market, 'userWasMaker');
            const maker = userWasMaker ? 'maker' : 'taker';
            let orderId = undefined;
            if (maker) {
                orderId = this.safeString (trade, 'makerVenueOrderID');
            } else {
                orderId = this.safeString (trade, 'aggressorVenueOrderID');
            }
            const side = userWasMaker === makerWasBuyer ? 'buy' : 'sell';
            const price = this.safeNumber (trade, 'price');
            const amount = this.safeNumber (trade, 'quantity');
            const cost = Precise.stringMul (this.safeString (trade, 'price'), this.safeString (trade, 'quantity'));
            const userWasAggressor = this.safeValue (market, 'userWasAggressor');
            const type = userWasAggressor ? 'market' : 'limit';
            output.push (this.safeTrade ({
                'info': trade,
                'id': id,
                'timestamp': timestamp,
                'datetime': datetime,
                'symbol': symbol,
                'order': orderId,
                'type': type,
                'side': side,
                'takerOrMaker': maker,
                'price': price,
                'amount': amount,
                'cost': cost,
            }));
        }
        return output;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const suppliedFilters = this.safeString (params, 'status-in', '').split ('-');
        const constructedFilters = [ 'ACTIVE', 'PARTIALLY_FILLED' ];
        const remainingAvailableFilters = [ 'FILLED', 'REJECTED', 'CANCELLED', 'EXPIRED' ];
        for (let i = 0; i < remainingAvailableFilters.length; i++) {
            const filter = remainingAvailableFilters[i];
            if (this.inArray (filter, suppliedFilters)) {
                constructedFilters.push (filter);
            }
        }
        params = this.extend (params, { 'status-in': constructedFilters.join ('-') });
        // console.log(symbol, since, limit, params);
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const suppliedFilters = this.safeString (params, 'status-in', '').split ('-');
        const constructedFilters = [ 'FILLED' ];
        const remainingAvailableFilters = [ 'ACTIVE', 'REJECTED', 'CANCELLED', 'EXPIRED', 'PARTIALLY_FILLED' ];
        for (let i = 0; i < remainingAvailableFilters.length; i++) {
            const filter = remainingAvailableFilters[i];
            if (this.inArray (filter, suppliedFilters)) {
                constructedFilters.push (filter);
            }
        }
        params = this.extend (params, { 'status-in': constructedFilters.join ('-') });
        return this.fetchOrders (symbol, since, limit, params);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const suppliedFilters = this.safeString (params, 'status-in', '').split ('-');
        const constructedFilters = [ 'CANCELLED' ];
        const remainingAvailableFilters = [ 'ACTIVE', 'REJECTED', 'CANCELLED', 'EXPIRED', 'PARTIALLY_FILLED' ];
        for (let i = 0; i < remainingAvailableFilters.length; i++) {
            const filter = remainingAvailableFilters[i];
            if (this.inArray (filter, suppliedFilters)) {
                constructedFilters.push (filter);
            }
        }
        params = this.extend (params, { 'status-in': constructedFilters.join ('-') });
        return this.fetchOrders (symbol, since, limit, params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#createOrder
         * @description create an order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const durationType = this.safeString (params, 'durationType', 'GOOD_TILL_CANCEL');
        const orderType = type.toUpperCase ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const customerObjectId = this.safeString (params, 'customerObjectId');
        const expiresAtMicros = this.safeNumber (params, 'expiresAtMicros', 0);
        const expiresIn = this.safeValue (params, 'expiresIn', '');
        const precisionQuantity = this.amountToPrecision (symbol, amount);
        // {
        //     "baseAssetID": "string",
        //     "customerObjectID": "string",
        //     "durationType": "GOOD_TILL_CANCEL",
        //     "expiresAtMicros": 0,
        //     "expiresIn": "string",
        //     "price": "string",
        //     "quantity": "string",
        //     "quoteAssetID": "string",
        //     "side": "BUY",
        //     "type": "LIMIT"
        //   }
        const request = {
            'baseAssetID': market['baseId'],
            'durationType': durationType,
            'customerObjectID': customerObjectId,
            'type': orderType,
            'side': orderSide,
            'quoteAssetID': market['quoteId'],
            'quantity': precisionQuantity,
        };
        if (type === 'limit') {
            const precisionPrice = this.priceToPrecision (symbol, price);
            request['price'] = precisionPrice;
            if (durationType === 'GOOD_TILL_EXPIRY') {
                request['expiresIn'] = expiresIn ? expiresIn : null;
                request['expiresAtMicros'] = expiresAtMicros ? expiresAtMicros : null;
            }
        }
        await this.fetchNonce ();
        const response = await this.privatePostOrders (request);
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        // Market Order
        // {
        //     status: 'FILLED',
        //     respondedAtMicros: '1677872186295635',
        //     venueOrderID: '0x85b3e1dd0c9f4609a3b611f991c54c51d85ab510745b11a039af52c0bab46b1a',
        //     originalQuantity: '1.00',
        //     quantity: '0.00'
        // }
        // Limit Order
        const result = this.safeValue (response, 'result', {});
        const id = this.safeString (result, 'venueOrderID');
        const respondedAtMicros = this.safeString (result, 'respondedAtMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (respondedAtMicros, '1000', 0));
        const datetime = this.iso8601 (timestamp);
        const exchangeStatus = this.safeValue (result, 'status');
        const status = this.parseOrderStatus (exchangeStatus);
        const originalQuantity = this.safeString (result, 'originalQuantity');
        const order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': originalQuantity,
            'info': result,
        };
        if (exchangeStatus === 'FILLED') {
            order['filled'] = originalQuantity;
        }
        if (type === 'limit') {
            order['price'] = price;
        }
        return this.safeOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // params and symbol are unused
        await this.loadMarkets ();
        params = {
            'id': id,
        };
        if (typeof id !== 'string') {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a string id');
        }
        const isVenueId = id.slice (0, 2) === '0x';
        let response = undefined;
        if (isVenueId) {
            response = await this.privateGetOrdersByVenueOrderIdId (params);
        } else {
            response = await this.privateGetOrdersByCustomerObjectIdId (params);
        }
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unused
         * @param {object} params unused
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        await this.fetchNonce ();
        params = {
            'id': id,
        };
        if (typeof id !== 'string') {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a string id');
        }
        const isVenueId = id.slice (0, 2) === '0x';
        let response = undefined;
        if (isVenueId) {
            response = await this.privateDeleteOrdersByVenueOrderIdId (params);
        } else {
            response = await this.privateDeleteOrdersByCustomerObjectIdId (params);
        }
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        // Deepwaters doesn't respond with any order information on cancelation
        const result = this.safeValue (response, 'result');
        const respondedAtMicros = this.safeValue (result, 'respondedAtMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (respondedAtMicros, '1000', 0));
        const datetime = this.iso8601 (timestamp);
        const order = {
            'status': 'canceled',
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'symbol': symbol,
            'info': result,
        };
        return this.safeOrder (order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.fetchNonce ();
        if (symbol) {
            const market = this.market (symbol);
            const pairParam = {
                'pair': market.id,
            };
            params = this.extend (params, pairParam);
        }
        const response = await this.privateDeleteOrders (params);
        // EXAMPLE response
        // {
        //     "result": {
        //       "numCancelled": 0,
        //       "respondedAtMicros": 0
        //     },
        //     "success": true
        //   }
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        return this.safeValue (response, 'result', {});
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        /**
         * @method
         * @name deepwaters#sign
         * @description Signs an api request to deepwaters exchange
         * @see https://rest.docs.api.deepwaters.xyz/cutting_edge/index.html
        */
        // Get array of params which need to be substituted in path
        const pathParams = this.extractParams (path);
        // this is the path with any variable segments substituted from provided params
        // currently only relevant for 'pairs/{marketId}/orderbook', which isn't signed
        path = '/' + this.implodeParams (path, params);
        // Remove params which were substituted in path, important for signing
        params = this.omit (params, pathParams);
        let nonce = '';
        let bodyString = '';
        if (api === 'private') {
            headers = {};
            const timestamp = this.numberToString (this.microseconds () + 10);
            this.checkRequiredCredentials ();
            if ((method === 'GET') || (method === 'DELETE')) {
                const keys = Object.keys (params);
                if (keys.length) {
                    path = path + '?' + this.urlencode (params);
                }
            }
            if ((method === 'POST') || (method === 'DELETE')) {
                if (method === 'POST') {
                    body = params;
                    bodyString = JSON.stringify (body);
                }
                nonce = this.numberToString (this.getNonce ());
                const postDeleteHeaders = {
                    'content-type': 'application/json',
                    'X-DW-NONCE': nonce,
                };
                headers = this.extend (headers, postDeleteHeaders);
            }
            const message = method + '/rest/v1' + path.toLowerCase () + timestamp + nonce + bodyString;
            // calculate signature
            const signature = this.signHash (this.hash (message, 'keccak'), this.secret);
            signature.v = signature.v - 27;
            let vByte = signature.v.toString (16);
            if (vByte.length === 1) {
                vByte = '0' + vByte;
            }
            const signatureString = signature.r + signature.s.slice (2) + vByte;
            const sigHeaders = {
                'X-DW-APIKEY': this.apiKey,
                'X-DW-TSUS': timestamp,
                'X-DW-SIGHEX': signatureString,
            };
            headers = this.extend (headers, sigHeaders);
        }
        const url = this.urls['api'][api] + path;
        if (bodyString.length) {
            return { 'url': url, 'method': method, 'body': bodyString, 'headers': headers };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleError (response = {}) {
        const error = this.safeString (response, 'error', '');
        const code = this.safeString (response, 'code', '');
        const status = this.safeString (response, 'status', '');
        throw new ExchangeError (code + ': ' + error + ' ' + status);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the deepwaters server
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the deepwaters server
         */
        const response = await this.publicGetTime ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const timestampMicros = this.safeValue (response, 'timestampMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (timestampMicros, '1000', 0));
        return timestamp;
    }
};
