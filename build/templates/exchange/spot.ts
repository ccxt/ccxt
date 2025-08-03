
//  ---------------------------------------------------------------------------

import Exchange from './base/Exchange';
// import { ExchangeError, ArgumentsRequired, OperationFailed, OperationRejected, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance, BadResponse, RequestTimeout, OrderNotFillable, MarginModeAlreadySet, MarketClosed } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { Int, OrderSide, OrderType, OHLCV, Order, Str, Transaction, Ticker, Tickers, Market, Strings, Currency, Num, Currencies, Dict, int, LedgerEntry, Bool } from './base/types.js';
// import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import { rsa } from './base/functions/rsa.js';
// import { eddsa } from './base/functions/crypto.js';
// import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';

//  ---------------------------------------------------------------------------

/**
 * @class template_exchange_name
 * @augments Exchange
 */
export default class template_exchange_name extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'template_exchange_name',
            'name': 'template_exchange_name',  // TODO: update if different than id
            'countries': [ ], // TODO: add country code
            'rateLimit': 0, // TODO: see https://github.com/ccxt/ccxt/pull/10605#issuecomment-988431119
            'certified': false,
            'pro': false,
            'has': {
                // TODO: update all supported methods to true, unsupported methods to false, and leave supported but unimplemented methods as undefined
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': undefined,
                'createDepositAddress': undefined,
                'createLimitBuyOrder': undefined,
                'createLimitSellOrder': undefined,
                'createMarketBuyOrder': undefined,
                'createMarketBuyOrderWithCost': undefined,
                'createMarketOrderWithCost': undefined,
                'createMarketSellOrder': undefined,
                'createMarketSellOrderWithCost': undefined,
                'createOrder': undefined,
                'createOrders': undefined,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': undefined,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': undefined,
                'createStopLossOrder': undefined,
                'createStopMarketOrder': undefined,
                'createStopOrder': undefined,
                'createTakeProfitOrder': undefined,
                'createTrailingPercentOrder': undefined,
                'createTriggerOrder': undefined,
                'editOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchConvertCurrencies': undefined,
                'fetchConvertQuote': undefined,
                'fetchConvertTrade': undefined,
                'fetchConvertTradeHistory': undefined,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': undefined,
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchDepositsWithdrawals': undefined,
                'fetchDepositWithdrawFee': undefined,
                'fetchDepositWithdrawFees': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': undefined,
                'fetchLastPrices': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': undefined,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': undefined,
                'fetchTransfer': undefined,
                'fetchTransfers': undefined,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'fetchWithdrawalWhitelist': undefined,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': undefined,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                // TODO: Add missing timeframes and fill in righthand side with the exchange specific value
                '1m': 'VALUE_ON_EXCHANGE',
                '5m': 'VALUE_ON_EXCHANGE',
                '15m': 'VALUE_ON_EXCHANGE',
                '30m': 'VALUE_ON_EXCHANGE',
                '1h': 'VALUE_ON_EXCHANGE',
                '1d': 'VALUE_ON_EXCHANGE',
            },
            'urls': {
                'logo': '', // TODO: url for logo image file
                'test': {
                    // TODO: testnet urls
                    'public': '',
                    'private': '',
                },
                'api': {
                    'public': '',
                    'private': '',
                },
                // 'www': '',
                'referral': {
                    'url': '', // TODO: contact CCXT about adding a referral code
                    'discount': 0.0, // TODO: add referral discount
                },
                // 'doc': [
                //     '',
                // ],
                // 'api_management': '',
                'fees': '',
            },
            'api': {
                // TODO: add all api paths
                'public': {
                    'get': {
                        // 'ping': 0.2, // Weight(IP): 1 => cost = 0.2 * 1 = 0.2
                    },
                    // 'post': {
                    // },
                    // 'put': {
                    // },
                    // 'delete': {
                    // },
                },
                'private': {
                    'get': {
                        // 'order': 0.8,
                    },
                    'post': {
                        // 'order': 0.2,
                    },
                    'put': {
                        // 'order': 0.2,
                    },
                    'delete': {
                        // 'order': 0.2,
                    },
                },
            },
            'fees': {
                'trading': {
                    // TODO
                    // 'feeSide': 'get',
                    // 'tierBased': false,
                    // 'percentage': true,
                    // 'taker': this.parseNumber (),
                    // 'maker': this.parseNumber (),
                },
            },
            'commonCurrencies': {
                // TODO: Exchange specific currencies on the left and unified CCXT currency codes on the right
                // 'XBT': 'BTC',
                // 'USDt': 'USDT',
            },
            // TODO: fill in the precisionMode
            // 'precisionMode': TICK_SIZE,  //  The exchange decimal precision counting mode, read more at https://github.com/ccxt/ccxt/wiki/Manual#precision-and-limits
            // exchange-specific options
            'options': {
                'sandboxMode': false,  // TODO: set to true if a sandbox api exists
                // TODO: update the defaultTimeInForce
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                // 'recvWindow': 5 * 1000, // the number of milliseconds after timestamp the request is valid for
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'quoteOrderQty': true, // whether market orders support amounts in quote currency
                // 'broker': "broker_id"
                // 'accountsByType': {
                //     'spot': 'SPOT',
                //     'funding': 'FUNDING',
                // },
                // 'accountsById': {
                //     'SPOT': 'spot',
                //     'FUNDING': 'funding',
                // },
                'networks': {  // dictionary of other names for networks to unfied networkCodes used by CCXT
                    // TODO
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                },
                'networksById': {  // dictionary of unfied networkCodes used by CCXT to exchange specific ids
                    // TODO
                    // 'ETH': 'ERC20',
                    // 'TRX': 'TRC20',
                },
                'impliedNetworks': {
                    // TODO: the networks implied to be used by these currencies when no network is given
                    // 'ETH': { 'ERC20': 'ETH' },
                    // 'TRX': { 'TRC20': 'TRX' },
                },
                'legalMoney': {
                    // TODO
                    // 'USD': true,
                    // 'EUR': true,
                },
            },
            'exceptions': {
                'exact': {
                    // TODO: error codes
                    // '-1008': OperationFailed, // undocumented, but mentioned: This is sent whenever the servers are overloaded with requests.
                    // '-1099': AuthenticationError, // {"code":-1099,"msg":"Not found, authenticated, or authorized"}
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see // TODO: api url
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.implicitMethodName (params);  // TODO: replace implicitMethodName with the actual implicit method
        //
        //   copy and paste the raw response returned from the api call above
        //
        return response; // TODO: return the timestamp value from response
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name template_exchange_name#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see // TODO: api url
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.implicitMethodName (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'key_from_response');
            const code = this.safeCurrencyCode (id);
            const networks: Dict = {};
            const chains = this.safeList (currency, api_response_key, []);
            let currencyMaxPrecision = this.parsePrecision (this.safeString (currency, api_response_key));
            let currencyDepositEnabled: Bool = undefined;
            let currencyWithdrawEnabled: Bool = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, api_response_key);
                const networkCode = this.networkIdToCode (networkId);
                const deposit = this.safeBool (chain, api_response_key);
                const withdraw = this.safeBool (chain, api_response_key);
                const precision = this.parsePrecision (this.safeString (chain, api_response_key));
                networks[networkCode] = {
                    'info': chain,
                    'id': networkId,
                    'network': networkCode,
                    'margin': false,
                    'deposit': deposit,
                    'withdraw': withdraw,
                    'active': (deposit && withdraw),
                    'fee': this.safeNumber (chain, api_response_key),
                    'precision': this.parseNumber (precision),
                    'limits': {
                        'deposit': {
                            'min': this.safeString (chain, api_response_key),
                            'max': this.safeString (chain, api_response_key),
                        },
                        'withdraw': {
                            'min': this.safeString (chain, api_response_key),
                            'max': this.safeString (chain, api_response_key),
                        },
                    },
                };
                // fill global values
                currencyDepositEnabled = (currencyDepositEnabled === undefined) || deposit ? deposit : currencyDepositEnabled;
                currencyWithdrawEnabled = (currencyWithdrawEnabled === undefined) || withdraw ? withdraw : currencyWithdrawEnabled;
                currencyMaxPrecision = (currencyMaxPrecision === undefined) || Precise.stringGt (currencyMaxPrecision, precision) ? precision : currencyMaxPrecision;
            }
            result[code] = this.safeCurrencyStructure ({
                'info': currency,
                'id': id,
                'code': code,
                'name': this.safeString (currency, api_response_key),
                'type': this.safeString (currency, api_response_key),  // TODO: must be 'fiat' or 'crypto'
                'active': this.safeBool (currency, api_response_key),
                'deposit': currencyDepositEnabled,
                'withdraw': currencyWithdrawEnabled,
                'fee': this.safeString (currency, api_response_key),
                'precision': this.parseNumber (currencyMaxPrecision),
                'limits': {
                    'amount': {
                        'min': this.safeString (currency, api_response_key),
                        'max': this.safeString (currency, api_response_key),
                    },
                    'withdraw': {
                        'min': this.safeString (currency, api_response_key),
                        'max': this.safeString (currency, api_response_key),
                    },
                },
                'networks': networks,
            });
        }
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name template_exchange_name#fetchMarkets
         * @description retrieves data on all markets for template_exchange_name
         * @see // TODO: api url
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.implicitMethodName (params);
        //
        //   copy and paste the raw response returned from the api call above
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, api_response_key);
        const baseId = this.safeString (market, api_response_key);
        const quoteId = this.safeString (market, api_response_key);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return {
            'info': market,
            'id': marketId,
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
            'active': this.safeBool (response, api_response_key),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (response, api_response_key),
                'price': this.safeNumber (response, api_response_key),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (response, api_response_key),
                    'max': this.safeNumber (response, api_response_key),
                },
                'price': {
                    'min': this.safeNumber (response, api_response_key),
                    'max': this.safeNumber (response, api_response_key),
                },
                'cost': {
                    'min': this.safeNumber (response, api_response_key),
                    'max': this.safeNumber (response, api_response_key),
                },
            },
            'created': this.safeNumber (market, api_response_key),
        };
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see // TODO: api url
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.implicitMethodName (params);
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseBalance (response);
    }

    parseBalance (response) {
        //
        //   copy and paste the unparsed value stored in response
        //
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const currencyId = this.safeString (response, api_response_key);
            const code = this.safeCurrencyCode (currencyId);
            const account: Dict = {
                // TODO: fill at least 2 of the 3 keys below
                // 'free': this.safeString (balance, 'freeze'),
                // 'used': this.safeString (balance, 'available'),
                // 'total': this.safeString (balance, 'total'),
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see // TODO: api url
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            api_request_key: market['id'],
            // TODO: add any other required parameters
        };
        // if (limit !== undefined) {  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        //     request[api_request_key] = limit;
        // }
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        const timestamp = this.safeInteger (response, api_response_key);
        return this.parseOrderBook (response, market['symbol'], timestamp, asks_key, price_key, amount_key, count_or_id_key);  // TODO: update asks_key, price_key, amount_key, count_or_id_key, remove timestamp if value does not exist
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //   TODO: copy and paste the unparsed response value stored in ticker
        //
        const timestamp = this.safeInteger (ticker, api_response_key);
        const last = this.safeString (ticker, api_response_key);
        return this.safeTicker ({
            'info': ticker,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, api_response_key),
            'low': this.safeString (ticker, api_response_key),
            'bid': this.safeString (ticker, api_response_key),
            'bidVolume': this.safeString (ticker, api_response_key),
            'ask': this.safeString (ticker, api_response_key),
            'askVolume': this.safeString (ticker, api_response_key),
            'vwap': this.safeString (ticker, api_response_key),
            'open': this.safeString (ticker, api_response_key),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, api_response_key),
            'change': this.safeString (ticker, api_response_key),
            'percentage': this.safeString (ticker, api_response_key),
            'average': this.safeString (ticker, api_response_key),
            'baseVolume': this.safeString (ticker, api_response_key),
            'quoteVolume': this.safeString (ticker, api_response_key),
        }, market);
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see // TODO: api url
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.implicitMethodName (params);
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return {
            'status': this.safeString (response, api_response_key),
            'updated': this.safeString (response, api_response_key),
            'eta': this.safeString (response, api_response_key),
            'url': this.safeString (response, api_response_key),
            'info': response,
        };
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name template_exchange_name#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see // TODO: api url
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            api_request_key: market['id'],
            // TODO: add any other required parameters
        };
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name template_exchange_name#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see // TODO: api url
         * @param {[string[]]} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // const marketIds = [];
        // if (symbols !== undefined) {
        //     for (let i = 0; i < symbols.length; i++) {
        //         const symbol = this.safeString (symbols, i);
        //         const market = this.market (symbol);
        //         marketIds.push(market['id']);
        //     }
        // }
        const request = {
            // TODO: add any other required parameters
            // api_request_key: marketIds.join (','),
        };
        const response = await this.implicitMethodName (params);
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseTickers (response, symbols);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //   TODO: copy and paste the unparsed response value stored in ohlcv
        //
        return [
            this.safeInteger (ohlcv, api_response_key),
            this.safeNumber (ohlcv, api_response_key),
            this.safeNumber (ohlcv, api_response_key),
            this.safeNumber (ohlcv, api_response_key),
            this.safeNumber (ohlcv, api_response_key),
            this.safeNumber (ohlcv, api_response_key),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV> {
        /**
         * @method
         * @name template_exchange_name#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see // TODO: api url
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            api_request_key: market['id'],
            api_request_key: this.timeframes[timeframe],
            // TODO: add any other required parameters
        };
        // if (since !== undefined) {  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined) {
        //
        //   TODO: copy and paste the unparsed response value stored in trade
        //
        const timestamp = this.safeInteger (trade, api_response_key);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, api_response_key),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (market, api_response_key),
            'order': this.safeString (trade, api_response_key),
            'type': this.safeString (trade, api_response_key),
            'side': this.safeString (trade, api_response_key),
            'takerOrMaker': this.safeString (trade, api_response_key),
            'price': this.safeString (trade, api_response_key),
            'amount': this.safeString (trade, api_response_key),
            'cost': this.safeString (trade, api_response_key),
            'fee': {
                'currency': this.safeString (market, 'quote'),
                'cost': this.safeString (trade, api_response_key),
                'rate': this.safeString (trade, api_response_key),
            },
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see // TODO: api url
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            api_request_key: market['id'],
            // TODO: add any other required parameters
        };
        // if (since !== undefined) {  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        //     request[api_request_key] = since ;
        // }
        // if (limit !== undefined) {  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);  // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseTrades (response, market, since, limit);
    }

    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#editOrder
         * @description edit a trade order
         * @see // TODO: api url
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] stop loss trigger price  // TODO: remove if there are no trigger orders
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            api_request_key: market['id'],
            // TODO: any any other missing parameters
        };
        // if (amount !== undefined) {
        //     request[api_request_key] = this.amountToPrecision (symbol, amount);
        // }
        // if (price !== undefined) {
        //     request[api_request_key] = this.priceToPrecision (symbol, price);
        // }
        // const triggerPrice = this.safeString (params, 'triggerPrice');
        // if (triggerPrice !== undefined) {
        //     request[api_request_key] = this.priceToPrecision (symbol, triggerPrice);
        // }
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            // TODO: exchange status values as keys and unified values as values
            // 'NEW': 'open',
            // 'FILLED': 'closed',
            // 'CANCELED': 'canceled',
            // 'REJECTED': 'rejected',
            // 'EXPIRED': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //   TODO: copy and paste the unparsed response value stored in order
        //
        const timestamp = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, api_response_key);
        market = this.safeMarket (marketId, market);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, api_response_key),
            'clientOrderId': this.safeString (order, api_response_key),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': this.safeString (order, api_response_key),
            'symbol': this.safeString (order, api_response_key),
            'type': this.safeString (order, api_response_key),
            'timeInForce': this.safeString (order, api_response_key),
            'postOnly': this.safeString (order, api_response_key),
            'side': this.safeString (order, api_response_key),
            'price': this.safeString (order, api_response_key),
            'stopPrice': this.safeString (order, api_response_key),
            'amount': this.safeString (order, api_response_key),
            'cost': this.safeString (order, api_response_key),
            'average': this.safeString (order, api_response_key),
            'filled': this.safeString (order, api_response_key),
            'remaining': this.safeString (order, api_response_key),
            'status': this.safeString (order, api_response_key),
            'fee': {
                'currency': this.safeString (order, api_response_key),
                'cost': this.safeString (order, api_response_key),
                'rate': this.safeString (order, api_response_key),
            },
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name template_exchage_name#createOrder
         * @description create a trade order
         * @see // TODO: api url
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type must be 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * TODO: remove 4 params below if not applicable
         * @param {object} [params.until] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
         * @param {string} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // const triggerPrice = this.safeString (params, 'triggerPrice');
        // const timeInForce = this.safeString (params, 'timeInForce');
        // const postOnly = this.isPostOnly (type === 'market', undefined, params);
        const request: Dict = {
            api_request_key: market['id'],
            api_request_key: side,
            api_request_key: type,
            api_request_key: this.amountToPrecision (symbol, amount),
            // TODO: any any other missing parameters
        };
        if (price !== undefined) {
            request[api_request_key] = this.priceToPrecision (symbol, price);
        }
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        // if (triggerPrice !== undefined) {
        //     request[api_request_key] = this.priceToPrecision (symbol, triggerPrice);
        // }
        // if (timeInForce !== undefined) {
        //     request[api_request_key] = this.priceToPrecision (symbol, timeInForce);
        // }
        // if (postOnly !== undefined) {
        //     request[api_request_key] = this.priceToPrecision (symbol, postOnly);
        // }
        // params = this.omit (params, [ 'triggerPrice', 'timeInForce', 'postOnly' ]);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchOrder
         * @description fetch an order
         * @see // TODO: api url
         * @param {string} id Order id
         * @param {string} symbol unified market symbol
         * @param {object} [params] exchange specific parameters
         * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // api_request_key: market['id'],
            // TODO: add any other required parameters
        };
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see // TODO: api url
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name template_exchange_name#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see // TODO: api url
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see // TODO: api url
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#cancelOrder
         * @description cancels an open order
         * @see // TODO: api url
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#cancelAllOrders
         * @description cancel all open orders
         * @see // TODO: api url
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseOrders (response, market);  // TODO: uncomment and remove above return statement if market is defined
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchMyTrades
         * @description fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours
         * @see // TODO: api url
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // const until = this.safeInteger (params, 'until');
        // if (until === undefined) {
        //     if (since === undefined) {
        //         until = this.milliseconds ();
        //     } else {
        //         until = since + 86400000;
        //     }
        // }
        // if (since === undefined) {
        //     since = until - 86400000;
        // }
        // if ((until - since) > 86400000) {
        //     throw new BadRequest (this.id + ' fetchMyTrades () the time between since and params["until"] cannot be greater than 24 hours');
        // }
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // TODO: add any other required parameters
            // api_request_key: market['id'],
        };
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // if (until !== undefined) {
        //     request[api_request_key] = until;
        // }
        // params = this.omit (params, [ 'until' ])
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //    {
        //        "success": true,
        //        "errorCode": "",
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name template_exchange_name#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see // TODO: api url
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
         * @param {int} [limit] max number of deposit/withdrawals to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const currency = (code !== undefined) ? this.currency (code) : undefined;
        const request = {
            // TODO: add any other required parameters
            // api_request_key: currency['id'],
        };
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        const transactions = this.parseTransactions (response, currency, since, limit);
        return this.filterByCurrencySinceLimit (this.sortBy (transactions, 'timestamp'), code, since, limit);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            // TODO: exchange transaction values as keys and unified values as values
            // 'COMPLETE': 'ok',
            // 'AWAITING_APPROVAL': 'pending',
            // 'PENDING': 'pending',
            // 'COMPLETE ERROR': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //   TODO: copy and paste the unparsed response value stored in order
        //
        const timestamp = this.safeTimestamp (transaction, api_response_key);
        const currencyId = this.safeString (transaction, api_response_key);
        currency = this.safeCurrency (currencyId, currency);
        return {
            'info': transaction,
            'id': currency['id'],
            'currency': currency['code'],
            'amount': this.safeNumber (transaction, api_response_key),
            'network': this.safeString (transaction, api_response_key),
            'address': this.safeString (transaction, api_response_key),
            'addressTo': this.safeString (transaction, api_response_key),
            'addressFrom': this.safeString (transaction, api_response_key),
            'tag': this.safeString (transaction, api_response_key),
            'tagTo': this.safeString (transaction, api_response_key),
            'tagFrom': this.safeString (transaction, api_response_key),
            'status': this.parseTransactionStatus (this.safeString (transaction, api_response_key)),
            'type': this.safeString (transaction, api_response_key),
            'updated': this.safeInteger (transaction, api_response_key),
            'txid': this.safeString (transaction, api_response_key),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'comment': this.safeString (transaction, api_response_key),
            'internal': this.safeBool (transaction, api_response_key),
            'fee': {
                'currency': currency['code'],
                'cost': this.safeNumber (transaction, api_response_key),
                'rate': undefined,
            },
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name template_exchange_name#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see // TODO: api url
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network] unified network code  // TODO: remove if not applicable
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            api_request_key: currency['id'],
            // TODO: add any other required parameters
        };
        const networkCode = this.safeStringUpper (params, 'network');
        if (networkCode !== undefined) {
            const networkId = this.networkCodeToId (networkCode);
            request['chainName'] = networkId;
            params = this.omit (params, [ 'network', 'networkCode' ] );
        }
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseDepositAddress (response);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //   TODO: copy and paste the unparsed response value stored in order
        //
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        const currencyId = this.safeString (depositAddress, api_response_key);
        const code = this.safeCurrencyCode (currencyId, currency);
        const networkId = this.safeString (depositAddress, api_response_key);
        return {
            'info': depositAddress,
            'currency': code,
            'address': address,
            'tag': this.safeString (depositAddress, api_response_key),
            'network': this.networkIdToCode (networkId, code),
        };
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name template_exchange_name#withdraw
         * @description make a withdrawal
         * @see // TODO: api url
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network] unified network code  // TODO: remove if not applicable
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            api_request_key: currency['id'],
            api_request_key: this.amountToPrecision (code, amount),
            api_request_key: address,
            // TODO: add any other required parameters
        };
        if (tag !== undefined) {
            request[api_request_key] = tag;
        }
        const network = this.safeStringUpper (params, 'network');
        if (network !== undefined) {
            request['network'] = this.networkCodeToId (network);
            params = this.omit (params, 'network');
        }
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseTransaction (response, currency);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        /**
         * @method
         * @name template_exchange_name#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
         * @see // TODO: api url
         * @param {string} [code] unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entries to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for  // TODO: remove if not applicable
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        await this.loadAccounts ();
        const request: Dict = {
            // TODO: add any other required parameters
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        // TODO: uncomment and update api_request_key or remove and update docstring that the value is unused
        // if (since !== undefined) {
        //     request[api_request_key] = since;
        // }
        // if (limit !== undefined) {
        //     request[api_request_key] = limit;
        // }
        // [ request, params ] = this.handleUntilOption (api_request_key, request, params);
        const response = await this.implicitMethodName (this.extend (request, params));
        //
        //   TODO: copy and paste the raw response returned from the api call above
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        //
        //   TODO: copy and paste the unparsed response value stored in order
        //
        const currencyId = this.safeString (item, api_response_key);
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, api_response_key);
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'currency': currency['code'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': this.safeString (item, api_response_key),
            'account': this.safeString (item, api_response_key),
            'referenceAccount': this.safeString (item, api_response_key),
            'referenceId': this.safeString (item, api_response_key),
            'type': this.parseLedgerEntryType (this.safeString (item, api_response_key)),
            'amount': this.safeString (item, api_response_key),
            'before': this.safeString (item, api_response_key),
            'after': this.safeString (item, api_response_key),
            'status': this.safeString (item, api_response_key),
            'fee': {
                'currency': this.safeString (currency, 'code'),
                'cost': this.safeString (item, api_response_key),
                'rate': this.safeString (item, api_response_key)
            },
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (type) {
        const ledgerType: Dict = {
            // TODO: exchange ledger values as keys and unified values as values
            // 'FEE': 'fee',
            // 'CONTRACT': 'trade',
            // 'INTERNAL_TRANSFER': 'transfer',
            // 'COIN_SWAP_DEPOSIT': 'deposit',
            // 'COIN_SWAP_WITHDRAW': 'withdrawal',
            // 'OPTIONS_SETTLE_PROFIT': 'settlement',
            // 'WELCOME_BONUS': 'cashback',
            // 'CONTEST_REWARD': 'cashback',
            // 'COMMISSION_REBATE': 'rebate',
            // 'API_REBATE': 'rebate',
            // 'REFERRAL_KICKBACK': 'referral',
            // 'COMMISSION': 'commission',
        };
        return this.safeString (ledgerType, type, type);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // TODO: update sign method to send requests correctly
        const url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            // if (Object.keys (params).length) {
            //     url += '?' + this.urlencode (params);
            // }
        }
        if (api === 'private') {
            // params['nonce'] = this.nonce ().toString ();
            // const payload = this.stringToBase64 (this.json (params));  // Body json encoded in base64
            // headers = {
            //     'Content-Type': 'application/json',
            //     'X-TXC-APIKEY': this.apiKey,
            //     'X-TXC-PAYLOAD': payload,
            //     'X-TXC-SIGNATURE': this.hmac (this.encode (payload), this.encode (this.secret), sha512),
            // };
            // body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // TODO: update to handle errors properly
        if (response === undefined) {
            return undefined;
        }
        // const errorCode = this.safeString (response, api_response_key);
        // const message = this.safeString (response, api_response_key, '');
        // const feedback = this.id + ' ' + body;
        // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        // this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        // this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        return undefined;
    }
}
