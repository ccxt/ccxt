
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bittrex.js';
import { ArgumentsRequired, BadSymbol, ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound, DDoSProtection, PermissionDenied, AddressPending, OnMaintenance, BadRequest, InvalidAddress } from './base/errors.js';
import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class bittrex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': [ 'US' ],
            'version': 'v3',
            'rateLimit': 1500,
            'certified': false,
            'pro': true,
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
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
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': undefined,
                'fetchTransactions': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'MINUTE_1',
                '5m': 'MINUTE_5',
                '1h': 'HOUR_1',
                '1d': 'DAY_1',
            },
            'hostname': 'bittrex.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg',
                'api': {
                    'public': 'https://api.bittrex.com',
                    'private': 'https://api.bittrex.com',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.github.io/api/v3',
                ],
                'fees': [
                    'https://bittrex.zendesk.com/hc/en-us/articles/115003684371-BITTREX-SERVICE-FEES-AND-WITHDRAWAL-LIMITATIONS',
                    'https://bittrex.zendesk.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
                'referral': 'https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B',
            },
            'api': {
                'public': {
                    'get': [
                        'ping',
                        'currencies',
                        'currencies/{symbol}',
                        'markets',
                        'markets/tickers',
                        'markets/summaries',
                        'markets/{marketSymbol}',
                        'markets/{marketSymbol}/summary',
                        'markets/{marketSymbol}/orderbook',
                        'markets/{marketSymbol}/trades',
                        'markets/{marketSymbol}/ticker',
                        'markets/{marketSymbol}/candles/{candleInterval}/recent',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}/{month}/{day}',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}/{month}',
                        'markets/{marketSymbol}/candles/{candleInterval}/historical/{year}',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'account/fees/fiat',
                        'account/fees/fiat/{currencySymbol}',
                        'account/fees/trading',
                        'account/fees/trading/{marketSymbol}',
                        'account/volume',
                        'account/permissions/markets',
                        'account/permissions/markets/{marketSymbol}',
                        'account/permissions/currencies',
                        'account/permissions/currencies/{currencySymbol}',
                        'addresses',
                        'addresses/{currencySymbol}',
                        'balances',
                        'balances/{currencySymbol}',
                        'deposits/open',
                        'deposits/closed',
                        'deposits/ByTxId/{txId}',
                        'deposits/{depositId}',
                        'executions',
                        'executions/last-id',
                        'executions/{executionId}',
                        'orders/closed',
                        'orders/open',
                        'orders/{orderId}',
                        'orders/{orderId}/executions',
                        'ping',
                        'subaccounts/{subaccountId}',
                        'subaccounts',
                        'subaccounts/withdrawals/open',
                        'subaccounts/withdrawals/closed',
                        'subaccounts/deposits/open',
                        'subaccounts/deposits/closed',
                        'withdrawals/open',
                        'withdrawals/closed',
                        'withdrawals/ByTxId/{txId}',
                        'withdrawals/{withdrawalId}',
                        'withdrawals/allowed-addresses',
                        'conditional-orders/{conditionalOrderId}',
                        'conditional-orders/closed',
                        'conditional-orders/open',
                        'transfers/sent',
                        'transfers/received',
                        'transfers/{transferId}',
                        'funds-transfer-methods/{fundsTransferMethodId}',
                    ],
                    'post': [
                        'addresses',
                        'orders',
                        'subaccounts',
                        'withdrawals',
                        'conditional-orders',
                        'transfers',
                        'batch',
                    ],
                    'delete': [
                        'orders/open',
                        'orders/{orderId}',
                        'withdrawals/{withdrawalId}',
                        'conditional-orders/{conditionalOrderId}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0075'),
                    'taker': this.parseNumber ('0.0075'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'BAD_REQUEST': BadRequest, // {"code":"BAD_REQUEST","detail":"Refer to the data field for specific field validation failures.","data":{"invalidRequestParameter":"day"}}
                    'STARTDATE_OUT_OF_RANGE': BadRequest, // {"code":"STARTDATE_OUT_OF_RANGE"}
                    // 'Call to Cancel was throttled. Try again in 60 seconds.': DDoSProtection,
                    // 'Call to GetBalances was throttled. Try again in 60 seconds.': DDoSProtection,
                    'APISIGN_NOT_PROVIDED': AuthenticationError,
                    'APIKEY_INVALID': AuthenticationError,
                    'INVALID_SIGNATURE': AuthenticationError,
                    'INVALID_CURRENCY': ExchangeError,
                    'INVALID_PERMISSION': AuthenticationError,
                    'INSUFFICIENT_FUNDS': InsufficientFunds,
                    'INVALID_CEILING_MARKET_BUY': InvalidOrder,
                    'INVALID_FIAT_ACCOUNT': InvalidOrder,
                    'INVALID_ORDER_TYPE': InvalidOrder,
                    'QUANTITY_NOT_PROVIDED': InvalidOrder,
                    'MIN_TRADE_REQUIREMENT_NOT_MET': InvalidOrder,
                    'NOT_FOUND': OrderNotFound,
                    'ORDER_NOT_OPEN': OrderNotFound,
                    'INVALID_ORDER': InvalidOrder,
                    'UUID_INVALID': OrderNotFound,
                    'RATE_NOT_PROVIDED': InvalidOrder, // createLimitBuyOrder ('ETH/BTC', 1, 0)
                    'INVALID_MARKET': BadSymbol, // {"success":false,"message":"INVALID_MARKET","result":null,"explanation":null}
                    'WHITELIST_VIOLATION_IP': PermissionDenied,
                    'DUST_TRADE_DISALLOWED_MIN_VALUE': InvalidOrder,
                    'RESTRICTED_MARKET': BadSymbol,
                    'We are down for scheduled maintenance, but we\u2019ll be back up shortly.': OnMaintenance, // {"success":false,"message":"We are down for scheduled maintenance, but we\u2019ll be back up shortly.","result":null,"explanation":null}
                },
                'broad': {
                    'throttled': DDoSProtection,
                    'problem': ExchangeNotAvailable,
                },
            },
            'options': {
                'fetchTicker': {
                    'method': 'publicGetMarketsMarketSymbolTicker', // publicGetMarketsMarketSymbolSummary
                },
                'fetchTickers': {
                    'method': 'publicGetMarketsTickers', // publicGetMarketsSummaries
                },
                'fetchDeposits': {
                    'status': 'ok',
                },
                'fetchWithdrawals': {
                    'status': 'ok',
                },
                'parseOrderStatus': false,
                'hasAlreadyAuthenticatedSuccessfully': false, // a workaround for APIKEY_INVALID
                'subaccountId': undefined,
                // see the implementation of fetchClosedOrdersV3 below
                // 'fetchClosedOrdersMethod': 'fetch_closed_orders_v3',
                'fetchClosedOrdersFilterBySince': true,
                // 'createOrderMethod': 'create_order_v1',
            },
            'commonCurrencies': {
                'BIFI': 'Bifrost Finance',
                'BTR': 'BTRIPS',
                'GMT': 'GMT Token',
                'MEME': 'Memetic', // conflict with Meme Inu
                'MER': 'Mercury', // conflict with Mercurial Finance
                'PROS': 'Pros.Finance',
                'REPV2': 'REP',
                'TON': 'Tokamak Network',
            },
        });
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], this.precisionMode);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bittrex#fetchMarkets
         * @description retrieves data on all markets for bittrex
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //     [
        //         {
        //             "symbol":"LTC-BTC",
        //             "baseCurrencySymbol":"LTC",
        //             "quoteCurrencySymbol":"BTC",
        //             "minTradeSize":"0.01686767",
        //             "precision":8,
        //             "status":"ONLINE", // "OFFLINE"
        //             "createdAt":"2014-02-13T00:00:00Z"
        //         },
        //         {
        //             "symbol":"VDX-USDT",
        //             "baseCurrencySymbol":"VDX",
        //             "quoteCurrencySymbol":"USDT",
        //             "minTradeSize":"300.00000000",
        //             "precision":8,
        //             "status":"ONLINE", // "OFFLINE"
        //             "createdAt":"2019-05-23T00:41:21.843Z",
        //             "notice":"USDT has swapped to an ERC20-based token as of August 5, 2019."
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'baseCurrencySymbol');
            const quoteId = this.safeString (market, 'quoteCurrencySymbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const status = this.safeString (market, 'status');
            result.push ({
                'id': this.safeString (market, 'symbol'),
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
                'active': (status === 'ONLINE'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber ('1e-8'), // seems exchange has same amount-precision across all pairs in UI too. This is same as 'minTradeSize' digits after dot
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minTradeSize'),
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

    parseBalance (response) {
        const result = { 'info': response };
        const indexed = this.indexBy (response, 'currencySymbol');
        const currencyIds = Object.keys (indexed);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const balance = indexed[currencyId];
            account['free'] = this.safeString (balance, 'available');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name bittrex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': market['id'],
        };
        if (limit !== undefined) {
            if ((limit !== 1) && (limit !== 25) && (limit !== 500)) {
                throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 1, 25 or 500, default is 25');
            }
            request['depth'] = limit;
        }
        const response = await this.publicGetMarketsMarketSymbolOrderbook (this.extend (request, params));
        //
        //     {
        //         "bid":[
        //             {"quantity":"0.01250000","rate":"10718.56200003"},
        //             {"quantity":"0.10000000","rate":"10718.56200002"},
        //             {"quantity":"0.39648292","rate":"10718.56200001"},
        //         ],
        //         "ask":[
        //             {"quantity":"0.05100000","rate":"10724.30099631"},
        //             {"quantity":"0.10000000","rate":"10724.30099632"},
        //             {"quantity":"0.26000000","rate":"10724.30099634"},
        //         ]
        //     }
        //
        const sequence = this.safeInteger (this.last_response_headers, 'Sequence');
        const orderbook = this.parseOrderBook (response, market['symbol'], undefined, 'bid', 'ask', 'rate', 'quantity');
        orderbook['nonce'] = sequence;
        return orderbook;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bittrex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             "symbol":"1ST",
        //             "name":"Firstblood",
        //             "coinType":"ETH_CONTRACT",
        //             "status":"ONLINE",
        //             "minConfirmations":36,
        //             "notice":"",
        //             "txFee":"4.50000000",
        //             "logoUrl":"https://bittrexblobstorage.blob.core.windows.net/public/5685a7be-1edf-4ba0-a313-b5309bb204f8.png",
        //             "prohibitedIn":[],
        //             "baseAddress":"0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98",
        //             "associatedTermsOfService":[]
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const precision = this.parseNumber ('1e-8'); // default precision, seems exchange has same amount-precision across all pairs in UI too. todo: fix "magic constants"
            const fee = this.safeNumber (currency, 'txFee'); // todo: redesign
            const isActive = this.safeString (currency, 'status');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': this.safeString (currency, 'coinType'),
                'name': this.safeString (currency, 'name'),
                'active': (isActive === 'ONLINE'),
                'deposit': undefined,
                'withdraw': undefined,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // ticker
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "lastTradeRate":"0.03284496",
        //         "bidRate":"0.03284523",
        //         "askRate":"0.03286857"
        //     }
        //
        // summary
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "high":"0.03369528",
        //         "low":"0.03282442",
        //         "volume":"4307.83794556",
        //         "quoteVolume":"143.08608869",
        //         "percentChange":"0.79",
        //         "updatedAt":"2020-09-29T07:36:57.823Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'updatedAt'));
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const percentage = this.safeString (ticker, 'percentChange');
        const last = this.safeString (ticker, 'lastTradeRate');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bidRate'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'askRate'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const options = this.safeValue (this.options, 'fetchTickers', {});
        const defaultMethod = this.safeString (options, 'method', 'publicGetMarketsTickers');
        const method = this.safeString (params, 'method', defaultMethod);
        params = this.omit (params, 'method');
        const response = await this[method] (params);
        //
        // publicGetMarketsTickers
        //
        //     [
        //         {
        //             "symbol":"4ART-BTC",
        //             "lastTradeRate":"0.00000210",
        //             "bidRate":"0.00000210",
        //             "askRate":"0.00000215"
        //         }
        //     ]
        //
        // publicGetMarketsSummaries
        //
        //     [
        //         {
        //             "symbol":"4ART-BTC",
        //             "high":"0.00000206",
        //             "low":"0.00000196",
        //             "volume":"14871.32000233",
        //             "quoteVolume":"0.02932756",
        //             "percentChange":"1.48",
        //             "updatedAt":"2020-09-29T07:34:32.757Z"
        //         }
        //     ]
        //
        const tickers = [];
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            tickers.push (ticker);
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bittrex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': market['id'],
        };
        const options = this.safeValue (this.options, 'fetchTicker', {});
        const defaultMethod = this.safeString (options, 'method', 'publicGetMarketsMarketSymbolTicker');
        const method = this.safeString (params, 'method', defaultMethod);
        params = this.omit (params, 'method');
        const response = await this[method] (this.extend (request, params));
        //
        // publicGetMarketsMarketSymbolTicker
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "lastTradeRate":"0.03284496",
        //         "bidRate":"0.03284523",
        //         "askRate":"0.03286857"
        //     }
        //
        //
        // publicGetMarketsMarketSymbolSummary
        //
        //     {
        //         "symbol":"ETH-BTC",
        //         "high":"0.03369528",
        //         "low":"0.03282442",
        //         "volume":"4307.83794556",
        //         "quoteVolume":"143.08608869",
        //         "percentChange":"0.79",
        //         "updatedAt":"2020-09-29T07:36:57.823Z"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchBidsAsks (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple markets
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetMarketsTickers (params);
        //
        //     [
        //       {
        //         "symbol":"ETH-BTC",
        //         "lastTradeRate":"0.03284496",
        //         "bidRate":"0.03284523",
        //         "askRate":"0.03286857"
        //       }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //      {
        //          "id": "8a614d4e-e455-45b0-9aac-502b0aeb433f",
        //          "executedAt": "2021-11-25T14:54:44.65Z",
        //          "quantity": "30.00000000",
        //          "rate": "1.72923112",
        //          "takerSide": "SELL"
        //      }
        //
        // private fetchOrderTrades
        //      {
        //          "id": "8a614d4e-e455-45b0-9aac-502b0aeb433f",
        //          "marketSymbol": "ADA-USDT",
        //          "executedAt": "2021-11-25T14:54:44.65Z",
        //          "quantity": "30.00000000",
        //          "rate": "1.72923112",
        //          "orderId": "6f7abf18-6901-4659-a48c-db0e88440ea4",
        //          "commission": "0.38907700",
        //          "isTaker":  true
        //      }
        //
        // private fetchMyTrades
        //      {
        //          "id":"7e6488c9-294f-4137-b0f2-9f86578186fe",
        //          "marketSymbol":"DOGE-USDT",
        //          "executedAt":"2022-08-12T21:27:37.92Z",
        //          "quantity":"100.00000000",
        //          "rate":"0.071584100000",
        //          "orderId":"2d53f11a-fb22-4820-b04d-80e5f48e6005",
        //          "commission":"0.05368807",
        //          "isTaker":true,
        //          "direction":"BUY"
        //      }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
        const id = this.safeString (trade, 'id');
        const order = this.safeString (trade, 'orderId');
        const marketId = this.safeString (trade, 'marketSymbol');
        market = this.safeMarket (marketId, market, '-');
        const priceString = this.safeString (trade, 'rate');
        const amountString = this.safeString (trade, 'quantity');
        let takerOrMaker = undefined;
        let side = this.safeStringLower2 (trade, 'takerSide', 'direction');
        const isTaker = this.safeValue (trade, 'isTaker');
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
            if (!isTaker) { // as noted in PR #15655 this API provides confusing value - when it's 'maker' trade, then side value should reversed
                if (side === 'buy') {
                    side = 'sell';
                } else if (side === 'sell') {
                    side = 'buy';
                }
            }
        }
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'commission');
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': market['quote'],
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bittrex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetPing (params);
        //
        //     {
        //         "serverTime": 1594596023162
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': market['id'],
        };
        const response = await this.publicGetMarketsMarketSymbolTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"9c5589db-42fb-436c-b105-5e2edcb95673",
        //             "executedAt":"2020-10-03T11:48:43.38Z",
        //             "quantity":"0.17939626",
        //             "rate":"0.03297952",
        //             "takerSide":"BUY"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name bittrex#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketSymbol': market['id'],
        };
        const response = await this.privateGetAccountFeesTradingMarketSymbol (this.extend (request, params));
        //
        //     {
        //         "marketSymbol":"1INCH-ETH",
        //         "makerRate":"0.00750000",
        //         "takerRate":"0.00750000"
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name bittrex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetAccountFeesTrading (params);
        //
        //     [
        //         {"marketSymbol":"1ECO-BTC","makerRate":"0.00750000","takerRate":"0.00750000"},
        //         {"marketSymbol":"1ECO-USDT","makerRate":"0.00750000","takerRate":"0.00750000"},
        //         {"marketSymbol":"1INCH-BTC","makerRate":"0.00750000","takerRate":"0.00750000"},
        //         {"marketSymbol":"1INCH-ETH","makerRate":"0.00750000","takerRate":"0.00750000"},
        //         {"marketSymbol":"1INCH-USD","makerRate":"0.00750000","takerRate":"0.00750000"},
        //     ]
        //
        return this.parseTradingFees (response);
    }

    parseTradingFee (fee, market = undefined) {
        const marketId = this.safeString (fee, 'marketSymbol');
        const maker = this.safeNumber (fee, 'makerRate');
        const taker = this.safeNumber (fee, 'takerRate');
        return {
            'info': fee,
            'symbol': this.safeSymbol (marketId, market),
            'maker': maker,
            'taker': taker,
        };
    }

    parseTradingFees (fees) {
        const result = {
            'info': fees,
        };
        for (let i = 0; i < fees.length; i++) {
            const fee = this.parseTradingFee (fees[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "startsAt":"2020-06-12T02:35:00Z",
        //         "open":"0.02493753",
        //         "high":"0.02493753",
        //         "low":"0.02493753",
        //         "close":"0.02493753",
        //         "volume":"0.09590123",
        //         "quoteVolume":"0.00239153"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'startsAt')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const reverseId = market['baseId'] + '-' + market['quoteId'];
        const request = {
            'candleInterval': this.safeString (this.timeframes, timeframe, timeframe),
            'marketSymbol': reverseId,
        };
        let method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalRecent';
        if (since !== undefined) {
            const now = this.milliseconds ();
            const difference = Math.abs (now - since);
            const sinceDate = this.yyyymmdd (since);
            const parts = sinceDate.split ('-');
            const sinceYear = this.safeInteger (parts, 0);
            const sinceMonth = this.safeInteger (parts, 1);
            const sinceDay = this.safeInteger (parts, 2);
            if (timeframe === '1d') {
                // if the since argument is beyond one year into the past
                if (difference > 31622400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYear';
                    request['year'] = sinceYear;
                }
                // request['year'] = year;
            } else if (timeframe === '1h') {
                // if the since argument is beyond 31 days into the past
                if (difference > 2678400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonth';
                    request['year'] = sinceYear;
                    request['month'] = sinceMonth;
                }
            } else {
                // if the since argument is beyond 1 day into the past
                if (difference > 86400000) {
                    method = 'publicGetMarketsMarketSymbolCandlesCandleIntervalHistoricalYearMonthDay';
                    request['year'] = sinceYear;
                    request['month'] = sinceMonth;
                    request['day'] = sinceDay;
                }
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {"startsAt":"2020-06-12T02:35:00Z","open":"0.02493753","high":"0.02493753","low":"0.02493753","close":"0.02493753","volume":"0.09590123","quoteVolume":"0.00239153"},
        //         {"startsAt":"2020-06-12T02:40:00Z","open":"0.02491874","high":"0.02491874","low":"0.02490970","close":"0.02490970","volume":"0.04515695","quoteVolume":"0.00112505"},
        //         {"startsAt":"2020-06-12T02:45:00Z","open":"0.02490753","high":"0.02493143","low":"0.02490753","close":"0.02493143","volume":"0.17769640","quoteVolume":"0.00442663"}
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        const stop = this.safeValue (params, 'stop');
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketSymbol'] = market['id'];
        }
        let method = 'privateGetOrdersOpen';
        if (stop) {
            method = 'privateGetConditionalOrdersOpen';
        }
        const query = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     [
        //         {
        //             "id": "df6cf5ee-fc27-4b61-991a-cc94b6459ac9",
        //             "marketSymbol": "BTC-USDT",
        //             "direction": "BUY",
        //             "type": "LIMIT",
        //             "quantity": "0.00023277",
        //             "limit": "30000.00000000",
        //             "timeInForce": "GOOD_TIL_CANCELLED",
        //             "fillQuantity": "0.00000000",
        //             "commission": "0.00000000",
        //             "proceeds": "0.00000000",
        //             "status": "OPEN",
        //             "createdAt": "2022-04-20T02:33:53.16Z",
        //             "updatedAt": "2022-04-20T02:33:53.16Z"
        //         }
        //     ]
        //
        // Stop
        //
        //     [
        //         {
        //             "id": "f64f7c4f-295c-408b-9cbc-601981abf100",
        //             "marketSymbol": "BTC-USDT",
        //             "operand": "LTE",
        //             "triggerPrice": "0.10000000",
        //             "orderToCreate": {
        //                 "marketSymbol": "BTC-USDT",
        //                 "direction": "BUY",
        //                 "type": "LIMIT",
        //                 "quantity": "0.00020000",
        //                 "limit": "30000.00000000",
        //                 "timeInForce": "GOOD_TIL_CANCELLED"
        //             },
        //             "status": "OPEN",
        //             "createdAt": "2022-04-20T02:38:12.26Z",
        //             "updatedAt": "2022-04-20T02:38:12.26Z"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrdersOrderIdExecutions (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // A ceiling order is a market or limit order that allows you to specify
        // the amount of quote currency you want to spend (or receive, if selling)
        // instead of the quantity of the market currency (e.g. buy $100 USD of BTC
        // at the current market BTC price)
        await this.loadMarkets ();
        const market = this.market (symbol);
        let uppercaseType = undefined;
        if (type !== undefined) {
            uppercaseType = type.toUpperCase ();
        }
        const reverseId = market['baseId'] + '-' + market['quoteId'];
        const stop = this.safeValue (params, 'stop');
        const stopPrice = this.safeNumber2 (params, 'triggerPrice', 'stopPrice');
        const request = {
            'marketSymbol': reverseId, // SPOT and STOP
            // 'direction': side.toUpperCase (), // SPOT, STOP 'orderToCreate'
            // 'type': uppercaseType, // SPOT: LIMIT, MARKET, CEILING_LIMIT, CEILING_MARKET
            // 'quantity': this.amountToPrecision (symbol, amount), // SPOT, required for limit orders, excluded for ceiling orders
            // 'ceiling': this.priceToPrecision (symbol, price), // SPOT, required for ceiling orders, excluded for non-ceiling orders
            // 'limit': this.priceToPrecision (symbol, price), // SPOT, required for limit orders, excluded for market orders
            // 'timeInForce': 'GOOD_TIL_CANCELLED', // SPOT, IMMEDIATE_OR_CANCEL, FILL_OR_KILL, POST_ONLY_GOOD_TIL_CANCELLED
            // 'useAwards': false, // SPOT, optional
            // 'operand': 'LTE', // STOP, price above (GTE) or below (LTE) which the conditional order will trigger. either this or trailingStopPercent must be specified.
            // 'triggerPrice': this.priceToPrecision (symbol, stopPrice), // STOP
            // 'trailingStopPercent': this.priceToPrecision (symbol, stopPrice), // STOP, either this or triggerPrice must be set
            // 'orderToCreate': {direction:side,type:uppercaseType}, // STOP, The spot order to be triggered
            // 'orderToCancel': {id:'f03d5e98-b5ac-48fb-8647-dd4db828a297',type:uppercaseType}, // STOP, The spot order to be canceled
            // 'clineConditionalOrderId': 'f03d5e98-b5ac-48fb-8647-dd4db828a297', // STOP
        };
        let method = 'privatePostOrders';
        if (stop || stopPrice) {
            method = 'privatePostConditionalOrders';
            const operand = this.safeString (params, 'operand');
            if (operand === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires an operand parameter');
            }
            const trailingStopPercent = this.safeNumber (params, 'trailingStopPercent');
            const orderToCreate = this.safeValue (params, 'orderToCreate');
            const orderToCancel = this.safeValue (params, 'orderToCancel');
            if (stopPrice === undefined) {
                request['trailingStopPercent'] = this.priceToPrecision (symbol, trailingStopPercent);
            }
            if (orderToCreate) {
                const isCeilingLimit = (uppercaseType === 'CEILING_LIMIT');
                const isCeilingMarket = (uppercaseType === 'CEILING_MARKET');
                const isCeilingOrder = isCeilingLimit || isCeilingMarket;
                let ceiling = undefined;
                let limit = undefined;
                let timeInForce = undefined;
                if (isCeilingOrder) {
                    let cost = undefined;
                    if (isCeilingLimit) {
                        limit = this.priceToPrecision (symbol, price);
                        cost = this.safeNumber2 (params, 'ceiling', 'cost', amount);
                    } else if (isCeilingMarket) {
                        cost = this.safeNumber2 (params, 'ceiling', 'cost');
                        if (cost === undefined) {
                            if (price === undefined) {
                                cost = amount;
                            } else {
                                cost = amount * price;
                            }
                        }
                    }
                    ceiling = this.costToPrecision (symbol, cost);
                    timeInForce = 'IMMEDIATE_OR_CANCEL';
                } else {
                    if (uppercaseType === 'LIMIT') {
                        limit = this.priceToPrecision (symbol, price);
                        timeInForce = 'GOOD_TIL_CANCELLED';
                    } else {
                        timeInForce = 'IMMEDIATE_OR_CANCEL';
                    }
                }
                request['orderToCreate'] = {
                    'marketSymbol': reverseId,
                    'direction': side.toUpperCase (),
                    'type': uppercaseType,
                    'quantity': this.amountToPrecision (symbol, amount),
                    'ceiling': ceiling,
                    'limit': limit,
                    'timeInForce': timeInForce,
                    'clientOrderId': this.safeString (params, 'clientOrderId'),
                    'useAwards': this.safeValue (params, 'useAwards'),
                };
            }
            if (orderToCancel) {
                request['orderToCancel'] = orderToCancel;
            }
            request['triggerPrice'] = this.priceToPrecision (symbol, stopPrice);
            request['operand'] = operand;
        } else {
            if (side !== undefined) {
                request['direction'] = side.toUpperCase ();
            }
            request['type'] = uppercaseType;
            const isCeilingLimit = (uppercaseType === 'CEILING_LIMIT');
            const isCeilingMarket = (uppercaseType === 'CEILING_MARKET');
            const isCeilingOrder = isCeilingLimit || isCeilingMarket;
            if (isCeilingOrder) {
                let cost = undefined;
                if (isCeilingLimit) {
                    request['limit'] = this.priceToPrecision (symbol, price);
                    cost = this.safeNumber2 (params, 'ceiling', 'cost', amount);
                } else if (isCeilingMarket) {
                    cost = this.safeNumber2 (params, 'ceiling', 'cost');
                    if (cost === undefined) {
                        if (price === undefined) {
                            cost = amount;
                        } else {
                            cost = amount * price;
                        }
                    }
                }
                request['ceiling'] = this.costToPrecision (symbol, cost);
                // bittrex only accepts IMMEDIATE_OR_CANCEL or FILL_OR_KILL for ceiling orders
                request['timeInForce'] = 'IMMEDIATE_OR_CANCEL';
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
                if (uppercaseType === 'LIMIT') {
                    request['limit'] = this.priceToPrecision (symbol, price);
                    request['timeInForce'] = 'GOOD_TIL_CANCELLED';
                } else {
                    // bittrex does not allow GOOD_TIL_CANCELLED for market orders
                    request['timeInForce'] = 'IMMEDIATE_OR_CANCEL';
                }
            }
        }
        const query = this.omit (params, [ 'stop', 'stopPrice', 'ceiling', 'cost', 'operand', 'trailingStopPercent', 'orderToCreate', 'orderToCancel' ]);
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     {
        //         id: 'f03d5e98-b5ac-48fb-8647-dd4db828a297',
        //         marketSymbol: 'BTC-USDT',
        //         direction: 'SELL',
        //         type: 'LIMIT',
        //         quantity: '0.01',
        //         limit: '6000',
        //         timeInForce: 'GOOD_TIL_CANCELLED',
        //         fillQuantity: '0.00000000',
        //         commission: '0.00000000',
        //         proceeds: '0.00000000',
        //         status: 'OPEN',
        //         createdAt: '2020-03-18T02:37:33.42Z',
        //         updatedAt: '2020-03-18T02:37:33.42Z'
        //       }
        //
        // Stop
        //
        //     {
        //         "id": "9791fe52-a3e5-4ac3-ae03-e327b2993571",
        //         "marketSymbol": "BTC-USDT",
        //         "operand": "LTE",
        //         "triggerPrice": "0.1",
        //         "orderToCreate": {
        //             "marketSymbol": "BTC-USDT",
        //             "direction": "BUY",
        //             "type": "LIMIT",
        //             "quantity": "0.0002",
        //             "limit": "30000",
        //             "timeInForce": "GOOD_TIL_CANCELLED"
        //         },
        //         "status": "OPEN",
        //         "createdAt": "2022-04-19T21:02:14.17Z",
        //         "updatedAt": "2022-04-19T21:02:14.17Z"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue (params, 'stop');
        let request = {};
        let method = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (stop) {
            method = 'privateDeleteConditionalOrdersConditionalOrderId';
            request = {
                'conditionalOrderId': id,
            };
        } else {
            method = 'privateDeleteOrdersOrderId';
            request = {
                'orderId': id,
            };
        }
        const query = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     [
        //         {
        //             "id": "df6cf5ee-fc27-4b61-991a-cc94b6459ac9",
        //             "marketSymbol": "BTC-USDT",
        //             "direction": "BUY",
        //             "type": "LIMIT",
        //             "quantity": "0.00023277",
        //             "limit": "30000.00000000",
        //             "timeInForce": "GOOD_TIL_CANCELLED",
        //             "fillQuantity": "0.00000000",
        //             "commission": "0.00000000",
        //             "proceeds": "0.00000000",
        //             "status": "CANCELLED",
        //             "createdAt": "2022-04-20T02:33:53.16Z",
        //             "updatedAt": "2022-04-20T02:33:53.16Z"
        //         }
        //     ]
        //
        // Stop
        //
        //     [
        //         {
        //             "id": "f64f7c4f-295c-408b-9cbc-601981abf100",
        //             "marketSymbol": "BTC-USDT",
        //             "operand": "LTE",
        //             "triggerPrice": "0.10000000",
        //             "orderToCreate": {
        //                 "marketSymbol": "BTC-USDT",
        //                 "direction": "BUY",
        //                 "type": "LIMIT",
        //                 "quantity": "0.00020000",
        //                 "limit": "30000.00000000",
        //                 "timeInForce": "GOOD_TIL_CANCELLED"
        //             },
        //             "status": "CANCELLED",
        //             "createdAt": "2022-04-20T02:38:12.26Z",
        //             "updatedAt": "2022-04-20T02:38:12.26Z"
        //             "closedAt": "2022-04-20T03:47:24.69Z"
        //         }
        //     ]
        //
        return this.extend (this.parseOrder (response, market), {
            'id': id,
            'info': response,
            'status': 'canceled',
        });
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketSymbol'] = market['id'];
        }
        const response = await this.privateDeleteOrdersOpen (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"66582be0-5337-4d8c-b212-c356dd525801",
        //             "statusCode":"SUCCESS",
        //             "result":{
        //                 "id":"66582be0-5337-4d8c-b212-c356dd525801",
        //                 "marketSymbol":"BTC-USDT",
        //                 "direction":"BUY",
        //                 "type":"LIMIT",
        //                 "quantity":"0.01000000",
        //                 "limit":"3000.00000000",
        //                 "timeInForce":"GOOD_TIL_CANCELLED",
        //                 "fillQuantity":"0.00000000",
        //                 "commission":"0.00000000",
        //                 "proceeds":"0.00000000",
        //                 "status":"CLOSED",
        //                 "createdAt":"2020-10-06T12:31:53.39Z",
        //                 "updatedAt":"2020-10-06T12:54:28.8Z",
        //                 "closedAt":"2020-10-06T12:54:28.8Z"
        //             }
        //         }
        //     ]
        //
        const orders = [];
        for (let i = 0; i < response.length; i++) {
            const result = this.safeValue (response[i], 'result', {});
            orders.push (result);
        }
        return this.parseOrders (orders, market);
    }

    async fetchDeposit (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchDeposit
         * @description fetch data on a currency deposit via the deposit id
         * @param {string} id deposit id
         * @param {string|undefined} code filter by currency code
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'txId': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetDepositsByTxIdTxId (this.extend (request, params));
        const transactions = this.parseTransactions (response, currency, undefined, undefined);
        return this.safeValue (transactions, 0);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @param {int|undefined} params.endDate Filters out result after this timestamp. Uses ISO-8602 format.
         * @param {string|undefined} params.nextPageToken The unique identifier of the item that the resulting query result should start after, in the sort order of the given endpoint. Used for traversing a paginated set in the forward direction.
         * @param {string|undefined} params.previousPageToken The unique identifier of the item that the resulting query result should end before, in the sort order of the given endpoint. Used for traversing a paginated set in the reverse direction.
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencySymbol'] = currency['id'];
        }
        if (since !== undefined) {
            const startDate = this.parseToInt (since / 1000) * 1000;
            request['startDate'] = this.iso8601 (startDate);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let method = undefined;
        const options = this.safeValue (this.options, 'fetchDeposits', {});
        const defaultStatus = this.safeString (options, 'status', 'ok');
        const status = this.safeString (params, 'status', defaultStatus);
        if (status === 'pending') {
            method = 'privateGetDepositsOpen';
        } else {
            method = 'privateGetDepositsClosed';
        }
        params = this.omit (params, 'status');
        const response = await this[method] (this.extend (request, params));
        // we cannot filter by `since` timestamp, as it isn't set by Bittrex
        // see https://github.com/ccxt/ccxt/issues/4067
        // return this.parseTransactions (response, currency, since, limit);
        return this.parseTransactions (response, currency, undefined, limit);
    }

    async fetchPendingDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchPendingDeposits
         * @description fetch all pending deposits made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @param {int|undefined} params.endDate Filters out result after this timestamp. Uses ISO-8602 format.
         * @param {string|undefined} params.nextPageToken The unique identifier of the item that the resulting query result should start after, in the sort order of the given endpoint. Used for traversing a paginated set in the forward direction.
         * @param {string|undefined} params.previousPageToken The unique identifier of the item that the resulting query result should end before, in the sort order of the given endpoint. Used for traversing a paginated set in the reverse direction.
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        return this.fetchDeposits (code, since, limit, this.extend (params, { 'status': 'pending' }));
    }

    async fetchWithdrawal (id: string, code: string = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @param {string} id withdrawal id
         * @param {string|undefined} code filter by currency code
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'txId': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetWithdrawalsByTxIdTxId (this.extend (request, params));
        const transactions = this.parseTransactions (response, currency, undefined, undefined);
        return this.safeValue (transactions, 0);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @param {int|undefined} params.endDate Filters out result after this timestamp. Uses ISO-8602 format.
         * @param {string|undefined} params.nextPageToken The unique identifier of the item that the resulting query result should start after, in the sort order of the given endpoint. Used for traversing a paginated set in the forward direction.
         * @param {string|undefined} params.previousPageToken The unique identifier of the item that the resulting query result should end before, in the sort order of the given endpoint. Used for traversing a paginated set in the reverse direction.
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        // https://support.bittrex.com/hc/en-us/articles/115003723911
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencySymbol'] = currency['id'];
        }
        if (since !== undefined) {
            const startDate = this.parseToInt (since / 1000) * 1000;
            request['startDate'] = this.iso8601 (startDate);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        let method = undefined;
        const options = this.safeValue (this.options, 'fetchWithdrawals', {});
        const defaultStatus = this.safeString (options, 'status', 'ok');
        const status = this.safeString (params, 'status', defaultStatus);
        if (status === 'pending') {
            method = 'privateGetWithdrawalsOpen';
        } else {
            method = 'privateGetWithdrawalsClosed';
        }
        params = this.omit (params, 'status');
        const response = await this[method] (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchPendingWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchPendingWithdrawals
         * @description fetch all pending withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @param {int|undefined} params.endDate Filters out result after this timestamp. Uses ISO-8602 format.
         * @param {string|undefined} params.nextPageToken The unique identifier of the item that the resulting query result should start after, in the sort order of the given endpoint. Used for traversing a paginated set in the forward direction.
         * @param {string|undefined} params.previousPageToken The unique identifier of the item that the resulting query result should end before, in the sort order of the given endpoint. Used for traversing a paginated set in the reverse direction.
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        return this.fetchWithdrawals (code, since, limit, this.extend (params, { 'status': 'pending' }));
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //      {
        //          "id": "77f2e4f0-a33d-4285-9140-ed5b20533a17",
        //          "currencySymbol": "ETH",
        //          "quantity": "0.36487773",
        //          "cryptoAddress": "0xeee7cff0f587706acdddfc1ff65968936fcf621e",
        //          "txId": "0x059fd3279452a245b308a944a0ee341ff9d17652a8a1bc663e6006282128c782",
        //          "confirmations": 44,
        //          "updatedAt": "2017-12-28T13:57:42.753Z",
        //          "completedAt": "2017-12-28T13:57:42.753Z",
        //          "status": "COMPLETED",
        //          "source": "BLOCKCHAIN"
        //      }
        //
        // fetchWithdrawals
        //
        //      {
        //          "id":"d20d556c-59ac-4480-95d8-268f8d4adedb",
        //          "currencySymbol":"OMG",
        //          "quantity":"2.67000000",
        //          "cryptoAddress":"0xa7daa9acdb41c0c476966ee23d388d6f2a1448cd",
        //          "cryptoAddressTag":"",
        //          "txCost":"0.10000000",
        //          "txId":"0xb54b8c5fb889aa9f9154e013cc5dd67b3048a3e0ae58ba845868225cda154bf5",
        //          "status":"COMPLETED",
        //          "createdAt":"2017-12-16T20:46:22.5Z",
        //          "completedAt":"2017-12-16T20:48:03.887Z",
        //          "target":"BLOCKCHAIN"
        //      }
        //
        // withdraw
        //
        //     {
        //         "currencySymbol": "string",
        //         "quantity": "number (double)",
        //         "cryptoAddress": "string",
        //         "cryptoAddressTag": "string",
        //         "fundsTransferMethodId": "string (uuid)",
        //         "clientWithdrawalId": "string (uuid)"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'clientWithdrawalId');
        const amount = this.safeNumber (transaction, 'quantity');
        const address = this.safeString (transaction, 'cryptoAddress');
        let addressTo = undefined;
        let addressFrom = undefined;
        const isDeposit = this.safeString (transaction, 'source') === 'BLOCKCHAIN';
        if (isDeposit) {
            addressFrom = address;
        } else {
            addressTo = address;
        }
        const txid = this.safeString (transaction, 'txId');
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const opened = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const timestamp = opened ? opened : updated;
        const type = (opened === undefined) ? 'deposit' : 'withdrawal';
        const currencyId = this.safeString (transaction, 'currencySymbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        let status = 'pending';
        if (type === 'deposit') {
            //
            // deposits numConfirmations never reach the minConfirmations number
            // we set all of them to 'ok', otherwise they'd all be 'pending'
            //
            //     const numConfirmations = this.safeInteger (transaction, 'Confirmations', 0);
            //     const minConfirmations = this.safeInteger (currency['info'], 'MinConfirmation');
            //     if (numConfirmations >= minConfirmations) {
            //         status = 'ok';
            //     }
            //
            status = 'ok';
        } else {
            const responseStatus = this.safeString (transaction, 'status');
            if (responseStatus === 'ERROR_INVALID_ADDRESS') {
                status = 'failed';
            } else if (responseStatus === 'CANCELLED') {
                status = 'canceled';
            } else if (responseStatus === 'PENDING') {
                status = 'pending';
            } else if (responseStatus === 'COMPLETED') {
                status = 'ok';
            } else if (responseStatus === 'AUTHORIZED' && (txid !== undefined)) {
                status = 'ok';
            }
        }
        let feeCost = this.safeNumber (transaction, 'txCost');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                // according to https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-
                feeCost = 0;
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'GOOD_TIL_CANCELLED': 'GTC',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
            'POST_ONLY_GOOD_TIL_CANCELLED': 'PO',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // Spot createOrder, fetchOpenOrders, fetchClosedOrders, fetchOrder, cancelOrder
        //
        //     {
        //         id: '1be35109-b763-44ce-b6ea-05b6b0735c0c',
        //         marketSymbol: 'LTC-ETH',
        //         direction: 'BUY',
        //         type: 'LIMIT',
        //         quantity: '0.50000000',
        //         limit: '0.17846699',
        //         timeInForce: 'GOOD_TIL_CANCELLED',
        //         clientOrderId: 'ff156d39-fe01-44ca-8f21-b0afa19ef228',
        //         fillQuantity: '0.50000000',
        //         commission: '0.00022286',
        //         proceeds: '0.08914915',
        //         status: 'CLOSED',
        //         createdAt: '2018-06-23T13:14:28.613Z',
        //         updatedAt: '2018-06-23T13:14:30.19Z',
        //         closedAt: '2018-06-23T13:14:30.19Z'
        //     }
        //
        // Stop createOrder, fetchOpenOrders, fetchClosedOrders, fetchOrder, cancelOrder
        //
        //     {
        //         "id": "9791fe52-a3e5-4ac3-ae03-e327b2993571",
        //         "marketSymbol": "BTC-USDT",
        //         "operand": "LTE",
        //         "triggerPrice": "0.1",
        //         "orderToCreate": {
        //             "marketSymbol": "BTC-USDT",
        //             "direction": "BUY",
        //             "type": "LIMIT",
        //             "quantity": "0.0002",
        //             "limit": "30000",
        //             "timeInForce": "GOOD_TIL_CANCELLED"
        //         },
        //         "status": "OPEN",
        //         "createdAt": "2022-04-19T21:02:14.17Z",
        //         "updatedAt": "2022-04-19T21:02:14.17Z",
        //         "closedAt": "2022-04-20T03:47:24.69Z"
        //     }
        //
        const marketSymbol = this.safeString (order, 'marketSymbol');
        market = this.safeMarket (marketSymbol, market, '-');
        const symbol = market['symbol'];
        const feeCurrency = market['quote'];
        const createdAt = this.safeString (order, 'createdAt');
        const updatedAt = this.safeString (order, 'updatedAt');
        const closedAt = this.safeString (order, 'closedAt');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        let lastTradeTimestamp = undefined;
        if (closedAt !== undefined) {
            lastTradeTimestamp = this.parse8601 (closedAt);
        } else if (updatedAt) {
            lastTradeTimestamp = this.parse8601 (updatedAt);
        }
        const timestamp = this.parse8601 (createdAt);
        let direction = this.safeStringLower (order, 'direction');
        if (direction === undefined) {
            let conditionalOrder = this.safeValue (order, 'orderToCreate');
            if (conditionalOrder === undefined) {
                conditionalOrder = this.safeValue (order, 'orderToCancel');
            }
            direction = this.safeStringLower (conditionalOrder, 'direction');
        }
        let type = this.safeStringLower (order, 'type');
        if (type === undefined) {
            let conditionalOrder = this.safeValue (order, 'orderToCreate');
            if (conditionalOrder === undefined) {
                conditionalOrder = this.safeValue (order, 'orderToCancel');
            }
            type = this.safeStringLower (conditionalOrder, 'type');
        }
        let quantity = this.safeString (order, 'quantity');
        if (quantity === undefined) {
            let conditionalOrder = this.safeValue (order, 'orderToCreate');
            if (conditionalOrder === undefined) {
                conditionalOrder = this.safeValue (order, 'orderToCancel');
            }
            quantity = this.safeString (conditionalOrder, 'quantity');
        }
        let limit = this.safeString (order, 'limit');
        if (limit === undefined) {
            let conditionalOrder = this.safeValue (order, 'orderToCreate');
            if (conditionalOrder === undefined) {
                conditionalOrder = this.safeValue (order, 'orderToCancel');
            }
            limit = this.safeString (conditionalOrder, 'limit');
        }
        let timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        if (timeInForce === undefined) {
            let conditionalOrder = this.safeValue (order, 'orderToCreate');
            if (conditionalOrder === undefined) {
                conditionalOrder = this.safeValue (order, 'orderToCancel');
            }
            timeInForce = this.parseTimeInForce (this.safeString (conditionalOrder, 'timeInForce'));
        }
        const fillQuantity = this.safeString (order, 'fillQuantity');
        const commission = this.safeNumber (order, 'commission');
        const proceeds = this.safeString (order, 'proceeds');
        const status = this.safeStringLower (order, 'status');
        const postOnly = (timeInForce === 'PO');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': direction,
            'price': limit,
            'stopPrice': this.safeString (order, 'triggerPrice'),
            'triggerPrice': this.safeString (order, 'triggerPrice'),
            'cost': proceeds,
            'average': undefined,
            'amount': quantity,
            'filled': fillQuantity,
            'remaining': undefined,
            'status': status,
            'fee': {
                'cost': commission,
                'currency': feeCurrency,
            },
            'info': order,
            'trades': undefined,
        }, market);
    }

    parseOrders (orders, market = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (this.options['fetchClosedOrdersFilterBySince']) {
            return super.parseOrders (orders, market, since, limit, params);
        } else {
            return super.parseOrders (orders, market, undefined, limit, params);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'CLOSED': 'closed',
            'OPEN': 'open',
            'CANCELLED': 'canceled',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue (params, 'stop');
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let response = undefined;
        let method = undefined;
        try {
            const request = {};
            if (stop) {
                method = 'privateGetConditionalOrdersConditionalOrderId';
                request['conditionalOrderId'] = id;
            } else {
                method = 'privateGetOrdersOrderId';
                request['orderId'] = id;
            }
            const query = this.omit (params, 'stop');
            response = await this[method] (this.extend (request, query));
        } catch (e) {
            if (this.last_json_response) {
                const message = this.safeString (this.last_json_response, 'message');
                if (message === 'UUID_INVALID') {
                    throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.last_http_response);
                }
            }
            throw e;
        }
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.ymdhms (since, 'T') + 'Z';
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            request['marketSymbol'] = market['id'];
        }
        const response = await this.privateGetExecutions (this.extend (request, params));
        const trades = this.parseTrades (response, market);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit) as any;
    }

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue (params, 'stop');
        const request = {};
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startDate'] = this.ymdhms (since, 'T') + 'Z';
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            // because of this line we will have to rethink the entire v3
            // in other words, markets define all the rest of the API
            // and v3 market ids are reversed in comparison to v1
            // v3 has to be a completely separate implementation
            // otherwise we will have to shuffle symbols and currencies everywhere
            // which is prone to errors, as was shown here
            // https://github.com/ccxt/ccxt/pull/5219#issuecomment-499646209
            request['marketSymbol'] = market['base'] + '-' + market['quote'];
        }
        let method = 'privateGetOrdersClosed';
        if (stop) {
            method = 'privateGetConditionalOrdersClosed';
        }
        const query = this.omit (params, 'stop');
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
        //
        //     [
        //         {
        //             "id": "df6cf5ee-fc27-4b61-991a-cc94b6459ac9",
        //             "marketSymbol": "BTC-USDT",
        //             "direction": "BUY",
        //             "type": "LIMIT",
        //             "quantity": "0.00023277",
        //             "limit": "30000.00000000",
        //             "timeInForce": "GOOD_TIL_CANCELLED",
        //             "fillQuantity": "0.00000000",
        //             "commission": "0.00000000",
        //             "proceeds": "0.00000000",
        //             "status": "OPEN",
        //             "createdAt": "2022-04-20T02:33:53.16Z",
        //             "updatedAt": "2022-04-20T02:33:53.16Z"
        //         }
        //     ]
        //
        // Stop
        //
        //     [
        //         {
        //             "id": "f64f7c4f-295c-408b-9cbc-601981abf100",
        //             "marketSymbol": "BTC-USDT",
        //             "operand": "LTE",
        //             "triggerPrice": "0.10000000",
        //             "orderToCreate": {
        //                 "marketSymbol": "BTC-USDT",
        //                 "direction": "BUY",
        //                 "type": "LIMIT",
        //                 "quantity": "0.00020000",
        //                 "limit": "30000.00000000",
        //                 "timeInForce": "GOOD_TIL_CANCELLED"
        //             },
        //             "status": "OPEN",
        //             "createdAt": "2022-04-20T02:38:12.26Z",
        //             "updatedAt": "2022-04-20T02:38:12.26Z"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async createDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bittrex#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencySymbol': currency['id'],
        };
        const response = await this.privatePostAddresses (this.extend (request, params));
        //
        //     {
        //         "status":"PROVISIONED",
        //         "currencySymbol":"XRP",
        //         "cryptoAddress":"rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy",
        //         "cryptoAddressTag":"392034158"
        //     }
        //
        const address = this.safeString (response, 'cryptoAddress');
        const message = this.safeString (response, 'status');
        if (!address || message === 'REQUESTED') {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': this.safeString (response, 'cryptoAddressTag'),
            'network': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name bittrex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencySymbol': currency['id'],
        };
        const response = await this.privateGetAddressesCurrencySymbol (this.extend (request, params));
        //
        //     {
        //         "status":"PROVISIONED",
        //         "currencySymbol":"XRP",
        //         "cryptoAddress":"rPVMhWBsfF9iMXYj3aAzJVkPDTFNSyWdKy",
        //         "cryptoAddressTag":"392034158"
        //     }
        //
        const address = this.safeString (response, 'cryptoAddress');
        const message = this.safeString (response, 'status');
        if (!address || message === 'REQUESTED') {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': this.safeString (response, 'cryptoAddressTag'),
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bittrex#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the bittrex api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currencySymbol': currency['id'],
            'quantity': amount,
            'cryptoAddress': address,
        };
        if (tag !== undefined) {
            request['cryptoAddressTag'] = tag;
        }
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        //
        //     {
        //         "currencySymbol": "string",
        //         "quantity": "number (double)",
        //         "cryptoAddress": "string",
        //         "cryptoAddressTag": "string",
        //         "fundsTransferMethodId": "string (uuid)",
        //         "clientWithdrawalId": "string (uuid)"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    sign (path, api = 'v3', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api === 'private') {
            url += this.version + '/';
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            params = this.omit (params, this.extractParams (path));
            let hashString = '';
            if (method === 'POST') {
                body = this.json (params);
                hashString = body;
            } else {
                if (Object.keys (params).length) {
                    url += '?' + this.rawencode (params);
                }
            }
            const contentHash = this.hash (this.encode (hashString), sha512, 'hex');
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + url + method + contentHash;
            const subaccountId = this.safeValue (this.options, 'subaccountId');
            if (subaccountId !== undefined) {
                auth += subaccountId;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha512);
            headers = {
                'Api-Key': this.apiKey,
                'Api-Timestamp': timestamp,
                'Api-Content-Hash': contentHash,
                'Api-Signature': signature,
            };
            if (subaccountId !== undefined) {
                headers['Api-Subaccount-Id'] = subaccountId;
            }
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            if (api === 'public') {
                url += this.version + '/';
            }
            url += this.implodeParams (path, params);
            params = this.omit (params, this.extractParams (path));
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     { success: false, message: "message" }
        //
        if (body[0] === '{') {
            const feedback = this.id + ' ' + body;
            let success = this.safeValue (response, 'success');
            if (success === undefined) {
                const codeInner = this.safeString (response, 'code');
                if ((codeInner === 'NOT_FOUND') && (url.indexOf ('addresses') >= 0)) {
                    throw new InvalidAddress (feedback);
                }
                if (codeInner !== undefined) {
                    this.throwExactlyMatchedException (this.exceptions['exact'], codeInner, feedback);
                    this.throwBroadlyMatchedException (this.exceptions['broad'], codeInner, feedback);
                }
                // throw new ExchangeError (this.id + ' malformed response ' + this.json (response));
                return undefined;
            }
            if (typeof success === 'string') {
                // bleutrade uses string instead of boolean
                success = (success === 'true');
            }
            if (!success) {
                const message = this.safeString (response, 'message');
                if (message === 'APIKEY_INVALID') {
                    if (this.options['hasAlreadyAuthenticatedSuccessfully']) {
                        throw new DDoSProtection (feedback);
                    } else {
                        throw new AuthenticationError (feedback);
                    }
                }
                // https://github.com/ccxt/ccxt/issues/4932
                // the following two lines are now redundant, see line 171 in describe()
                //
                //     if (message === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                //         throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
                //
                if (message === 'INVALID_ORDER') {
                    // Bittrex will return an ambiguous INVALID_ORDER message
                    // upon canceling already-canceled and closed orders
                    // therefore this special case for cancelOrder
                    // let url = 'https://bittrex.com/api/v1.1/market/cancel?apikey=API_KEY&uuid=ORDER_UUID'
                    const cancel = 'cancel';
                    const indexOfCancel = url.indexOf (cancel);
                    if (indexOfCancel >= 0) {
                        const urlParts = url.split ('?');
                        const numParts = urlParts.length;
                        if (numParts > 1) {
                            const query = urlParts[1];
                            const params = query.split ('&');
                            const numParams = params.length;
                            let orderId = undefined;
                            for (let i = 0; i < numParams; i++) {
                                const param = params[i];
                                const keyValue = param.split ('=');
                                if (keyValue[0] === 'uuid') {
                                    orderId = keyValue[1];
                                    break;
                                }
                            }
                            if (orderId !== undefined) {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + orderId + ' ' + this.json (response));
                            } else {
                                throw new OrderNotFound (this.id + ' cancelOrder ' + this.json (response));
                            }
                        }
                    }
                }
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                if (message !== undefined) {
                    this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
