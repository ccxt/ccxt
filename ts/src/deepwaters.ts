//  ---------------------------------------------------------------------------

import { Exchange } from './base/Exchange.js';
import { Precise } from './base/Precise.js';
import { ExchangeError, ArgumentsRequired, InvalidNonce } from './base/errors.js';
import { DECIMAL_PLACES, TRUNCATE } from './base/functions/number.js';
import { keccak_256 } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';

//  ---------------------------------------------------------------------------

export default class deepwaters extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'deepwaters',
            'name': 'Deepwaters',
            'countries': [ 'US' ],
            'rateLimit': 5,
            'certified': false,
            'version': 'v1',
            'dwnonce': 0,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositionMode': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
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
                    'feeSide': 'get',
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'networksById': {
                    'ETHEREUM_MAINNET': 'ETH',
                    'BINANCE_SMART_CHAIN_MAINNET': 'BSC',
                    'POLYGON_MAINNET': 'MATIC',
                    'AVALANCHE_C_CHAIN': 'AVAX',
                },
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
                    'get': [
                        'customer',
                        'customer/api-key-status',
                        'orders',
                        'orders/by-venue-order-id/{id}',
                        'orders/by-customer-object-id/{id}',
                        'trades',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders',
                        'orders/by-customer-object-id/{id}',
                        'orders/by-venue-order-id/{id}',
                    ],
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
        const response = await (this as any).publicGetPairs ();
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
         * @description fetches market data from deepwaters
         * @returns {[object]} an array of market data objects
         */
        const response = await (this as any).publicGetPairs ();
        const markets = this.safeValue (response, 'result', {});
        const result = [];
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
            const id = this.safeValue (market, 'name');
            const lowercaseId = this.safeStringLower (market, 'name');
            const base = this.safeValue (market, 'baseAssetRootSymbol');
            const quote = this.safeValue (market, 'quoteAssetRootSymbol');
            const symbol = base + '/' + quote;
            const baseId = this.safeValue (market, 'baseAssetID');
            const quoteId = this.safeValue (market, 'quoteAssetID');
            const baseAssetIncrementPrecision = this.parseNumber (this.safeString (market, 'baseAssetIncrementPrecision'));
            const quoteAssetIncrementPrecision = this.parseNumber (this.safeString (market, 'quoteAssetIncrementPrecision'));
            result.push ({
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': symbol,
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
                    'amount': baseAssetIncrementPrecision,
                    'base': baseAssetIncrementPrecision,
                    'quote': quoteAssetIncrementPrecision,
                    'cost': undefined,
                },
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
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchCurrencies
         * @description Fetches all available currencies an exchange and returns an associative dictionary of currencies.
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {object} a dictionary of [currency structure]{@link https://docs.ccxt.com/en/latest/manual.html#currency-structure}
         */
        const response = await (this as any).publicGetAssets ();
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const currencies = this.safeValue (response, 'result', {});
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            // {
            //     chainID: '5',
            //     chainName: 'GOERLI',
            //     assetAddress: '0x53948de192afe6c531894337799881702115b6b6',
            //     rootSymbol: 'ZRB',
            //     assetID: 'ZRB.GOERLI.5.TESTNET.PROD',
            //     parentSymbol: 'ZRB.DW',
            //     frontEndSymbol: 'ZRB',
            //     name: 'Zorb',
            //     ticker: 'ZRB',
            //     frontEndName: '',
            //     uiDecimals: '5',
            //     databaseDecimals: '25',
            //     contractDecimals: '18',
            //     createdAtMicros: '1677695274753017'
            // }
            const currency = currencies[i];
            const id = this.safeString (currency, 'assetID');
            const code = this.safeString (currency, 'rootSymbol');
            const name = this.safeString (currency, 'name');
            const precision = this.parseNumber (this.safeString (currency, 'uiDecimals'));
            const chainName = this.safeString (currency, 'chainName');
            const chainId = this.safeString (currency, 'chainID');
            const networkCode = this.networkIdToCode (chainName);
            const assetAddress = this.safeString (currency, 'assetAddress');
            const network = {
                'id': chainId,
                'name': chainName,
                'network': networkCode,
                'active': true,
                'address': assetAddress,
            };
            const networks = {
                'networkCode': network,
            };
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'deposit': true,
                'withdraw': true,
                'fee': undefined,
                'precision': precision,
                'networks': networks,
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
                'info': currency,
            };
        }
        return result;
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
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook() requires a symbol argument');
        }
        await this.loadMarkets (); // this will load only the first time
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await (this as any).publicGetPairsPairOrderbook (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        // {
        //     snapshotAtMicros: '1677844033163585',
        //     bids: [
        //       { depth: '0', price: '320.0100', quantity: '4457663.494' },
        //       { depth: '1', price: '320.0000', quantity: '103676273.148' },
        //       { depth: '2', price: '319.9900', quantity: '1.327' },
        //       { depth: '3', price: '319.8700', quantity: '96.225' },
        //       { depth: '4', price: '319.6600', quantity: '95.303' },
        //       { depth: '5', price: '319.4500', quantity: '103.147' },
        //       { depth: '6', price: '319.2300', quantity: '100.198' },
        //       { depth: '7', price: '319.0200', quantity: '104.780' },
        //       { depth: '8', price: '318.8100', quantity: '102.695' },
        //       { depth: '9', price: '318.5900', quantity: '96.233' }
        //     ],
        //     asks: []
        // }
        const snapshotAtMicros = this.safeString (result, 'snapshotAtMicros', '0');
        const timestamp = this.parseNumber (Precise.stringDiv (snapshotAtMicros, '1000', 0));
        return this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
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
        const response = await (this as any).privateGetCustomer ();
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

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchOrders
         * @description fetches a list of all orders (either open or closed/canceled) made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadNonce ();
        const request = {};
        const market = this.market (symbol);
        request['pair'] = market['id'];
        const precision = market['precision']['price'];
        if (since !== undefined) {
            const precision = market['precision']['price'];
            since = Precise.stringMul (this.decimalToPrecision (since, TRUNCATE, precision), '1000');
            request['created-at-or-after-micros'] = since;
        }
        if (limit !== undefined) {
            limit = this.decimalToPrecision (limit, TRUNCATE, precision);
            request['limit'] = limit;
        }
        const response = await (this as any).privateGetOrders (this.extend (request, params));
        // [
        //     {
        //       "averagePrice": "string",
        //       "baseAssetID": "string",
        //       "createdAtMicros": 0,
        //       "customerObjectID": "string",
        //       "durationType": "GOOD_TILL_CANCEL",
        //       "expiresAtMicros": 0,
        //       "modifiedAtMicros": 0,
        //       "originalQuantity": "string",
        //       "price": "string",
        //       "quantity": "string",
        //       "quoteAssetID": "string",
        //       "side": "BUY",
        //       "status": "ACTIVE",
        //       "type": "LIMIT",
        //       "venueOrderID": "string",
        //       "volume": "string"
        //     }
        //   ]
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'orders', []);
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
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            // 'pair': '',
            // 'type': '',
            // 'created-at-or-after-micros': '',
            // 'created-before-micros': '',
            // 'skip': '',
            // 'limit': ''
        };
        const market = this.market (symbol);
        request['pair'] = market['id'];
        const precision = market['precision']['price'];
        if (since !== undefined) {
            since = Precise.stringMul (this.decimalToPrecision (since, TRUNCATE, precision), '1000');
            request['created-at-or-after-micros'] = since;
        }
        if (limit !== undefined) {
            limit = this.decimalToPrecision (limit, TRUNCATE, precision);
            request['limit'] = limit;
        }
        const response = await (this as any).privateGetTrades (this.extend (request, params));
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
            const createdAtMicros = this.safeValue (trade, 'createdAtMicros');
            const timestamp = this.parseNumber (Precise.stringDiv (createdAtMicros, '1000', 0));
            const datetime = this.iso8601 (timestamp);
            const baseAssetID = this.safeValue (trade, 'baseAssetID');
            const quoteAssetID = this.safeValue (trade, 'quoteAssetID');
            const market = this.market (baseAssetID + '-' + quoteAssetID);
            const symbol = this.safeValue (market, 'symbol');
            const makerWasBuyer = this.safeValue (market, 'makerWasBuyer');
            const userWasMaker = this.safeValue (market, 'userWasMaker');
            const maker = userWasMaker ? 'maker' : 'taker';
            const side = userWasMaker === makerWasBuyer ? 'buy' : 'sell';
            const price = this.safeNumber (market, 'price');
            const amount = this.safeNumber (market, 'quantity');
            const cost = Precise.stringMul (this.safeValue (market, 'price'), this.safeValue (market, 'quantity'));
            const userWasAggressor = this.safeValue (market, 'userWasAggressor');
            const type = userWasAggressor ? 'market' : 'limit';
            output.push (this.safeTrade ({
                'info': trade,
                'id': id,
                'timestamp': timestamp,
                'datetime': datetime,
                'symbol': symbol,
                'order': undefined,
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
        /**
         * @method
         * @name deepwaters#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const paramsWithFilters = this.extend (params, { 'status-in': 'ACTIVE-PARTIALLY_FILLED' });
        // [
        //     {
        //       "averagePrice": "string",
        //       "baseAssetID": "string",
        //       "createdAtMicros": 0,
        //       "customerObjectID": "string",
        //       "durationType": "GOOD_TILL_CANCEL",
        //       "expiresAtMicros": 0,
        //       "modifiedAtMicros": 0,
        //       "originalQuantity": "string",
        //       "price": "string",
        //       "quantity": "string",
        //       "quoteAssetID": "string",
        //       "side": "BUY",
        //       "status": "ACTIVE-PARTIALLY_FILLED",
        //       "type": "LIMIT",
        //       "venueOrderID": "string",
        //       "volume": "string"
        //     }
        //   ]
        return this.fetchOrders (symbol, since, limit, paramsWithFilters);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name deepwaters#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a symbol argument');
        }
        const paramsWithFilters = this.extend (params, { 'status-in': 'FILLED' });
        // [
        //     {
        //       "averagePrice": "string",
        //       "baseAssetID": "string",
        //       "createdAtMicros": 0,
        //       "customerObjectID": "string",
        //       "durationType": "GOOD_TILL_CANCEL",
        //       "expiresAtMicros": 0,
        //       "modifiedAtMicros": 0,
        //       "originalQuantity": "string",
        //       "price": "string",
        //       "quantity": "string",
        //       "quoteAssetID": "string",
        //       "side": "BUY",
        //       "status": "FILLED",
        //       "type": "LIMIT",
        //       "venueOrderID": "string",
        //       "volume": "string"
        //     }
        //   ]
        return this.fetchOrders (symbol, since, limit, paramsWithFilters);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const paramsWithFilters = this.extend (params, { 'status-in': 'CANCELLED' });
        // [
        //     {
        //       "averagePrice": "string",
        //       "baseAssetID": "string",
        //       "createdAtMicros": 0,
        //       "customerObjectID": "string",
        //       "durationType": "GOOD_TILL_CANCEL",
        //       "expiresAtMicros": 0,
        //       "modifiedAtMicros": 0,
        //       "originalQuantity": "string",
        //       "price": "string",
        //       "quantity": "string",
        //       "quoteAssetID": "string",
        //       "side": "BUY",
        //       "status": "CANCELLED",
        //       "type": "LIMIT",
        //       "venueOrderID": "string",
        //       "volume": "string"
        //     }
        //   ]
        return this.fetchOrders (symbol, since, limit, paramsWithFilters);
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
        await this.loadNonce ();
        const response = await (this as any).privatePostOrders (request);
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
        const id = this.safeValue (result, 'venueOrderID');
        const respondedAtMicros = this.safeValue (result, 'respondedAtMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (respondedAtMicros, '1000', 0));
        const datetime = this.iso8601 (timestamp);
        const exchangeStatus = this.safeValue (result, 'status');
        const status = this.parseOrderStatus (exchangeStatus);
        const originalQuantitiy = this.safeValue (result, 'originalQuantitiy');
        const order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': originalQuantitiy,
            'info': result,
        };
        if (exchangeStatus === 'FILLED') {
            order['filled'] = originalQuantitiy;
        }
        if (type === 'limit') {
            order['price'] = price;
        }
        return this.safeOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // params and symbol are unused
        await this.loadMarkets ();
        await this.loadNonce ();
        if (typeof id !== 'string') {
            throw new ArgumentsRequired (this.id + ' fetchOrder () requires a string id');
        }
        const isVenueId = id.slice (0, 2) === '0x';
        let response = undefined;
        const request = {
            'id': id,
        };
        if (isVenueId) {
            response = await (this as any).privateGetOrdersByVenueOrderIdId (this.extend (request, params));
        } else {
            response = await (this as any).privateGetOrdersByCustomerObjectIdId (this.extend (request, params));
        }
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        // {
        //     "averagePrice": "string",
        //     "baseAssetID": "string",
        //     "createdAtMicros": 0,
        //     "customerObjectID": "string",
        //     "durationType": "GOOD_TILL_CANCEL",
        //     "expiresAtMicros": 0,
        //     "modifiedAtMicros": 0,
        //     "originalQuantity": "string",
        //     "price": "string",
        //     "quantity": "string",
        //     "quoteAssetID": "string",
        //     "side": "BUY",
        //     "status": "ACTIVE",
        //     "type": "LIMIT",
        //     "venueOrderID": "string",
        //     "volume": "string"
        //   }
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
        await this.loadNonce ();
        params = {
            'id': id,
        };
        if (typeof id !== 'string') {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a string id');
        }
        const isVenueId = id.slice (0, 2) === '0x';
        let response = undefined;
        if (isVenueId) {
            // "results": [
            //     {
            //       "customerObjectID": "string",
            //       "error": "string",
            //       "respondedAtMicros": 0,
            //       "status": "ACTIVE",
            //       "success": true,
            //       "venueOrderID": "string"
            //     }
            //   ]
            response = await (this as any).privateDeleteOrdersByVenueOrderIdId (params);
        } else {
            // "results": [
            //     {
            //       "customerObjectID": "string",
            //       "error": "string",
            //       "respondedAtMicros": 0,
            //       "status": "ACTIVE",
            //       "success": true,
            //       "venueOrderID": "string"
            //     }
            //   ]
            response = await (this as any).privateDeleteOrdersByCustomerObjectIdId (params);
        }
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
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
        await this.loadNonce ();
        if (symbol) {
            const market = this.market (symbol);
            const pairParam = {
                'pair': market.id,
            };
            params = this.extend (params, pairParam);
        }
        const response = await (this as any).privateDeleteOrders (params);
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
        // Get array of params from the path
        const pathParams = this.extractParams (path);
        // this is the path with any variable segments substituted from provided params
        // currently only relevant for 'pairs/{marketId}/orderbook', which isn't signed
        path = '/' + this.implodeParams (path, params);
        // Remove params which were substituted in path, required for signing
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
            const hash = this.hash (this.encode (message), keccak_256);
            const signature = this.signHash (hash, this.secret);
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

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        };
    }

    async loadNonce () {
        // nonce is needed for signing transactions but since the sign method
        // is not async, the #loadNonce method should be called
        // by methods who must be signed with nonce beforehand
        const response = await (this as any).privateGetCustomerApiKeyStatus ();
        // "result": {
        //     "APIKey": "string",
        //     "createdAtMicros": 0,
        //     "expiresAtMicros": 0,
        //     "label": "string",
        //     "modifiedAtMicros": 0,
        //     "nonce": 0,
        //     "status": "string"
        //   },
        const success = this.safeValue (response, 'success', false);
        if (!success) {
            return this.handleError (response);
        }
        const result = this.safeValue (response, 'result', {});
        const nonce = this.safeString (result, 'nonce');
        if (!nonce) {
            throw new InvalidNonce ('Nonce could not be found');
        }
        (this as any).dwnonce = this.parseNumber (nonce);
    }

    getNonce () {
        if (!(this as any).dwnonce) {
            return 0;
        }
        return (this as any).dwnonce;
    }

    handleError (response = {}) {
        const error = this.safeString (response, 'error', '');
        const code = this.safeString (response, 'code', '');
        const status = this.safeString (response, 'status', '');
        throw new ExchangeError (code + ': ' + error + ' ' + status);
    }

    parseOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'FILLED': 'closed',
            'PARTIALLY_FILLED': 'open',
            'REJECTED': 'rejected',
            'CANCELLED': 'canceled',
            'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        // {
        //     venueOrderID: '0x1a5f344dcfeae6fbf1949b3f79139e0618ca95964d7512d3e0cc4d0569b4aab8',
        //     type: 'LIMIT',
        //     side: 'SELL',
        //     status: 'FILLED',
        //     originalQuantity: '1.00',
        //     quantity: '0.00',
        //     baseAssetID: 'WAVAX.AVALANCHE_FUJI.43113.TESTNET.PROD',
        //     quoteAssetID: 'USDC.AVALANCHE_FUJI.43113.TESTNET.PROD',
        //     price: '16.5',
        //     averagePrice: '16.529',
        //     volume: '16.529',
        //     durationType: 'GOOD_TILL_CANCEL',
        //     createdAtMicros: '1677875410433286',
        //     modifiedAtMicros: '1677875410452713'
        // }
        const id = this.safeValue (order, 'venueOrderID');
        const type = this.safeStringLower (order, 'type');
        const side = this.safeStringLower (order, 'side');
        const exchangeStatus = this.safeValue (order, 'status');
        const status = this.parseOrderStatus (exchangeStatus);
        const createdAtMicros = this.safeValue (order, 'createdAtMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (createdAtMicros, '1000', 0));
        const datetime = this.iso8601 (timestamp);
        const modifiedAtMicros = this.safeValue (order, 'modifiedAtMicros');
        const lastTradeTimestamp = this.parseNumber (Precise.stringDiv (modifiedAtMicros, '1000', 0));
        const baseAssetID = this.safeValue (order, 'baseAssetID');
        const quoteAssetID = this.safeValue (order, 'quoteAssetID');
        market = market ? market : this.market (baseAssetID + '-' + quoteAssetID);
        const symbol = this.safeValue (market, 'symbol');
        const price = this.safeNumber (order, 'price');
        const average = this.safeNumber (order, 'averagePrice');
        const amount = this.safeNumber (order, 'originalQuantity');
        const filled = Precise.stringSub (this.safeValue (order, 'originalQuantity'), this.safeValue (order, 'quantity'));
        const remaining = Precise.stringSub (this.safeValue (order, 'originalQuantity'), filled);
        const cost = Precise.stringMul (this.safeValue (order, 'price'), filled);
        const output = {
            'id': id,
            'status': status,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'info': order,
        };
        return this.safeOrder (output);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name deepwaters#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the deepwaters server
         * @param {object} params extra parameters specific to the deepwaters api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the deepwaters server
         */
        const response = await (this as any).publicGetTime ();
        const timestampMicros = this.safeValue (response, 'timestampMicros');
        const timestamp = this.parseNumber (Precise.stringDiv (timestampMicros, '1000', 0));
        return timestamp;
    }
}
