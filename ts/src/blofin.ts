
//  ---------------------------------------------------------------------------

import Exchange from './abstract/blofin.js';
import { ExchangeError, ExchangeNotAvailable, ArgumentsRequired, BadRequest, InvalidOrder, AuthenticationError, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, FundingRateHistory, OrderRequest, Str, Ticker, OrderBook, Balances, Tickers, Market, Strings, MarketInterface } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class blofin
 * @augments Exchange
 */
export default class blofin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blofin',
            'name': 'BloFin',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100 * 1.03, // 3% tolerance because of #20229
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': false,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPermissions': undefined,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
                '3M': '3M',
            },
            'hostname': 'www.blofin.com', // or aws.okx.com
            'urls': {
                'logo': '',
                'api': {
                    'rest': 'https://openapi.blofin.com',
                },
                'www': 'https://www.blofin.com',
                'doc': 'https://blofin.com/docs',
            },
            'api': {
                'public': {
                    'get': {
                        'market/instruments': 1,
                        'market/tickers': 1,
                        'market/books': 1,
                        'market/trades': 1,
                        'market/candles': 1,
                        'market/mark-price': 1,
                        'market/funding-rate': 1,
                        'market/funding-rate-history': 1,
                    },
                },
                'private': {
                    'get': {
                        'asset/balances': 1,
                        'trade/orders-pending': 1,
                        'trade/fills-history': 1,
                        'asset/deposit-history': 1,
                        'asset/withdrawal-history': 1,
                        'asset/bills': 1,
                        'account/balance': 1,
                        'account/positions': 1,
                        'account/leverage-info': 1,
                        'trade/orders-tpsl-pending': 1,
                        'trade/orders-history': 1,
                        'trade/orders-tpsl-history': 1,
                    },
                    'post': {
                        'trade/order': 1,
                        'trade/cancel-order': 1,
                        'account/set-leverage': 1,
                        'trade/batch-orders': 1,
                        'trade/order-tpsl': 1,
                        'trade/cancel-batch-orders': 1,
                        'trade/cancel-tpsl': 1,
                        'trade/close-position': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.00060'),
                    'maker': this.parseNumber ('0.00020'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': false,
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Body can not be empty
                    '401': AuthenticationError,  // Invalid signature
                    '500': ExchangeError,  // Internal Server Error
                    '404': BadRequest,  // not found
                    '405': BadRequest,  // Method Not Allowed
                    '406': BadRequest,  // Not Acceptable
                    '429': RateLimitExceeded,  // Too Many Requests
                    '152001': BadRequest,  // Parameter {} cannot be empty
                    '152002': BadRequest,  // Parameter {} error
                    '152003': BadRequest,  // Either parameter {} or {} is required
                    '152004': BadRequest,  // JSON syntax error
                    '152005': BadRequest,  // Parameter error: wrong or empty
                    '152006': InvalidOrder,  // Batch orders can be placed for up to 20 at once
                    '152007': InvalidOrder,  // Batch orders can only be placed with the same instId and marginMode
                    '152008': InvalidOrder,  // Only the same field is allowed for bulk cancellation of orders, orderId is preferred
                    '152009': InvalidOrder,  // {} must be a combination of numbers, letters, or underscores, and the maximum length of characters is 32
                    '150003': InvalidOrder,  // clientId already exist
                    '150004': InvalidOrder,  // Insufficient balance. please adjust the amount and try again
                    '542': InvalidOrder,  // Exceeded the maximum order size limit
                    '102002': InvalidOrder,  // Duplicate customized order ID
                    '102005': InvalidOrder,  // Position had been closed
                    '102014': InvalidOrder,  // Limit order exceeds maximum order size limit
                    '102015': InvalidOrder,  // Market order exceeds maximum order size limit
                    '102022': InvalidOrder,  // Failed to place order. You don’t have any positions of this contract. Turn off Reduce-only to continue.
                    '102037': InvalidOrder,  // TP trigger price should be higher than the latest trading price
                    '102038': InvalidOrder,  // SL trigger price should be lower than the latest trading price
                    '102039': InvalidOrder,  // TP trigger price should be lower than the latest trading price
                    '102040': InvalidOrder,  // SL trigger price should be higher than the latest trading price
                    '102047': InvalidOrder,  // Stop loss trigger price should be higher than the order price
                    '102048': InvalidOrder,  // stop loss trigger price must be higher than the best bid price
                    '102049': InvalidOrder,  // Take profit trigger price should be lower than the order price
                    '102050': InvalidOrder,  // stop loss trigger price must be lower than the best ask price
                    '102051': InvalidOrder,  // stop loss trigger price should be lower than the order price
                    '102052': InvalidOrder,  // take profit trigger price should be higher than the order price
                    '102053': InvalidOrder,  // take profit trigger price should be lower than the best bid price
                    '102054': InvalidOrder,  // take profit trigger price should be higher than the best ask price
                    '102055': InvalidOrder,  // stop loss trigger price should be lower than the best ask price
                    '102064': BadRequest,  // Buy price is not within the price limit (Minimum: 310.40; Maximum:1,629.40)
                    '102065': BadRequest,  // Sell price is not within the price limit
                    '102068': BadRequest,  // Cancel failed as the order has been filled, triggered, canceled or does not exist
                    '103013': ExchangeError,  // Internal error; unable to process your request. Please try again.
                },
                'broad': {
                    'Internal Server Error': ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"Internal Server Error","msg":"Internal Server Error"}
                    'server error': ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"server error 1236805249","msg":"server error 1236805249"}
                },
            },
            'httpExceptions': {
                '429': ExchangeNotAvailable, // https://github.com/ccxt/ccxt/issues/9612
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'sandboxMode': false,
                'defaultNetwork': 'ERC20',
                'defaultNetworks': {
                    'ETH': 'ERC20',
                    'BTC': 'BTC',
                    'USDT': 'TRC20',
                },
                'networks': {
                    'BTC': 'Bitcoin',
                    'BEP20': 'BSC',
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                },
                'fetchOpenInterestHistory': {
                    'timeframes': {
                        '5m': '5m',
                        '1h': '1H',
                        '8h': '8H',
                        '1d': '1D',
                        '5M': '5m',
                        '1H': '1H',
                        '8H': '8H',
                        '1D': '1D',
                    },
                },
                'fetchOHLCV': {
                    // 'type': 'Candles', // Candles or HistoryCandles, IndexCandles, MarkPriceCandles
                    'timezone': 'UTC', // UTC, HK
                },
                'fetchPositions': {
                    'method': 'privateGetAccountPositions', // privateGetAccountPositions or privateGetAccountPositionsHistory
                },
                'createOrder': 'privatePostTradeOrder', // or 'privatePostTradeOrderTpsl'
                'createMarketBuyOrderRequiresPrice': false,
                'fetchMarkets': [ 'swap' ],
                'defaultType': 'swap',
                'fetchLedger': {
                    'method': 'privateGetAssetBills',
                },
                'fetchOpenOrders': {
                    'method': 'privateGetTradeOrdersPending',
                },
                'cancelOrders': {
                    'method': 'privatePostTradeCancelBatchOrders',
                },
                'fetchCanceledOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersTpslHistory
                },
                'fetchClosedOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersTpslHistory
                },
                'withdraw': {
                    // a funding password credential is required by the exchange for the
                    // withdraw call (not to be confused with the api password credential)
                    'password': undefined,
                    'pwd': undefined, // password or pwd both work
                },
                'exchangeType': {
                    'spot': 'SPOT',
                    'swap': 'SWAP',
                    'SPOT': 'SPOT',
                    'SWAP': 'SWAP',
                },
            },
        });
    }

    handleMarketTypeAndParams (methodName, market = undefined, params = {}) {
        const instType = this.safeString (params, 'instType');
        params = this.omit (params, 'instType');
        const type = this.safeString (params, 'type');
        if ((type === undefined) && (instType !== undefined)) {
            params['type'] = instType;
        }
        return super.handleMarketTypeAndParams (methodName, market, params);
    }

    convertToInstrumentType (type) {
        const exchangeTypes = this.safeValue (this.options, 'exchangeType', {});
        return this.safeString (exchangeTypes, type, type);
    }

    convertExpireDate (date) {
        // parse YYMMDD to timestamp
        const year = date.slice (0, 2);
        const month = date.slice (2, 4);
        const day = date.slice (4, 6);
        const reconstructedDate = '20' + year + '-' + month + '-' + day + 'T00:00:00Z';
        return reconstructedDate;
    }

    createExpiredOptionMarket (symbol) {
        // support expired option contracts
        const quote = 'USD';
        const optionParts = symbol.split ('-');
        const symbolBase = symbol.split ('/');
        let base = undefined;
        if (symbol.indexOf ('/') > -1) {
            base = this.safeString (symbolBase, 0);
        } else {
            base = this.safeString (optionParts, 0);
        }
        const settle = base;
        const expiry = this.safeString (optionParts, 2);
        const strike = this.safeString (optionParts, 3);
        const optionType = this.safeString (optionParts, 4);
        const datetime = this.convertExpireDate (expiry);
        const timestamp = this.parse8601 (datetime);
        return {
            'id': base + '-' + quote + '-' + expiry + '-' + strike + '-' + optionType,
            'symbol': base + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'active': false,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': true,
            'future': false,
            'option': false,
            'margin': false,
            'contract': true,
            'contractSize': this.parseNumber ('1'),
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': this.parseNumber (strike),
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
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
            'info': undefined,
        } as MarketInterface;
    }

    market (symbol) {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                return this.markets[symbol];
            } else if (symbol in this.markets_by_id) {
                const markets = this.markets_by_id[symbol];
                return markets[0];
            } else if ((symbol.indexOf ('-C') > -1) || (symbol.indexOf ('-P') > -1)) {
                return this.createExpiredOptionMarket (symbol);
            }
        }
        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol);
    }

    safeMarket (marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf ('-C') > -1) || (marketId.indexOf ('-P') > -1));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket (marketId);
        }
        return super.safeMarket (marketId, market, delimiter, marketType);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name blofin#fetchMarkets
         * @description retrieves data on all markets for blofin
         * @see https://blofin.com/docs#get-instruments
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        // const types = this.safeValue (this.options, 'fetchMarkets');
        // let promises = [];
        // let result = [];
        // for (let i = 0; i < types.length; i++) {
        //     promises.push (this.fetchMarketsByType (types[i], params));
        // }
        const response = await this.publicGetMarketInstruments (params);
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'instId');
        let type = this.safeStringLower (market, 'instType');
        if (type === 'futures') {
            type = 'future';
        }
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const contract = swap || future;
        let baseId = this.safeString (market, 'baseCurrency');
        let quoteId = this.safeString (market, 'quoteCurrency');
        const underlying = this.safeString (market, 'uly');
        if ((underlying !== undefined) && !spot) {
            const parts = underlying.split ('-');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let expiry = undefined;
        const strikePrice = undefined;
        const optionType = undefined;
        if (contract) {
            expiry = this.safeInteger (market, 'expireTime');
            if (future) {
                const ymd = this.yymmdd (expiry);
                symbol = symbol + '-' + ymd;
            }
        }
        const tickSize = this.safeString (market, 'tickSize');
        const fees = this.safeValue2 (this.fees, type, 'trading', {});
        let maxLeverage = this.safeString (market, 'maxLeverage', '1');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': type,
            'spot': spot,
            'margin': spot && (Precise.stringGt (maxLeverage, '1')),
            'swap': swap,
            'future': future,
            'linear': true,
            'inverse': false,
            'active': true,
            'contract': contract,
            'contractSize': contract ? this.safeNumber (market, 'contractValue') : undefined,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': strikePrice,
            'optionType': optionType,
            'created': this.safeInteger (market, 'listTime'),
            'precision': {
                'amount': this.safeNumber (market, 'lotSize'),
                'price': this.parseNumber (tickSize),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (market, 'minSize'),
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

    async fetchMarketsByType (type, params = {}) {
        const request = {
            'instType': this.convertToInstrumentType (type),
        };
        const response = await this.publicGetMarketInstruments (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    safeNetwork (networkId) {
        const networksById = {
            'Bitcoin': 'BTC',
            'Omni': 'OMNI',
            'TRON': 'TRC20',
        };
        return this.safeString (networksById, networkId, networkId);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name blofin#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://blofin.com/docs#get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        limit = (limit === undefined) ? 20 : limit;
        if (limit !== undefined) {
            request['size'] = limit; // max 100
        }
        const response = await this.publicGetMarketBooks (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "asks": [
        //                     ["0.07228","4.211619","0","2"], // price, amount, liquidated orders, total open orders
        //                     ["0.0723","299.880364","0","2"],
        //                     ["0.07231","3.72832","0","1"],
        //                 ],
        //                 "bids": [
        //                     ["0.07221","18.5","0","1"],
        //                     ["0.0722","18.5","0","1"],
        //                     ["0.07219","0.505407","0","1"],
        //                 ],
        //                 "ts": "1621438475342"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const timestamp = this.safeInteger (first, 'ts');
        return this.parseOrderBook (first, symbol, timestamp);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'ts');
        const marketId = this.safeString (ticker, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open24h');
        const spot = this.safeValue (market, 'spot', false);
        const quoteVolume = spot ? this.safeString (ticker, 'volCcy24h') : undefined;
        const baseVolume = this.safeString (ticker, 'vol24h');
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString (ticker, 'bidPx'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'askPx'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name blofin#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://blofin.com/docs#get-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTickers (this.extend (request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-BTC",
        //                 "last": "0.07319",
        //                 "lastSz": "0.044378",
        //                 "askPx": "0.07322",
        //                 "askSz": "4.2",
        //                 "bidPx": "0.0732",
        //                 "bidSz": "6.050058",
        //                 "open24h": "0.07801",
        //                 "high24h": "0.07975",
        //                 "low24h": "0.06019",
        //                 "volCcy24h": "11788.887619",
        //                 "vol24h": "167493.829229",
        //                 "ts": "1621440583784",
        //                 "sodUtc0": "0.07872",
        //                 "sodUtc8": "0.07345"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        return this.parseTicker (first, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name blofin#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://blofin.com/docs#get-tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const first = this.safeString (symbols, 0);
        let market = undefined;
        if (first !== undefined) {
            market = this.market (first);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        return await this.fetchTickersByType (type, symbols, query);
    }

    async fetchTickersByType (type, symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
        };
        const response = await this.publicGetMarketTickers (this.extend (request, params));
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeString2 (trade, 'fillPx', 'px');
        const amount = this.safeString2 (trade, 'fillSz', 'sz');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'ordId');
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostSigned,
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString (trade, 'execType');
        if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        } else if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://blofin.com/docs#get-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'tradeId', 'after', undefined, 100) as Trade[];
        }
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        let response = undefined;
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'method', 'publicGetMarketTrades');
        if (method === 'publicGetMarketTrades') {
            response = await this.publicGetMarketTrades (this.extend (request, params));
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         "1678928760000", // timestamp
        //         "24341.4", // open
        //         "24344", // high
        //         "24313.2", // low
        //         "24323", // close
        //         "628", // contract volume
        //         "2.5819", // base volume
        //         "62800", // quote volume
        //         "0" // candlestick state
        //     ]
        //
        const res = this.handleMarketTypeAndParams ('fetchOHLCV', market, undefined);
        const type = res[0];
        const volumeIndex = (type === 'spot') ? 5 : 6;
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, volumeIndex),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name blofin#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://blofin.com/docs#get-candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.price] "mark" or "index" for mark price and index price candles
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 200) as OHLCV[];
        }
        params = this.omit (params, 'price');
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const timezone = this.safeString (options, 'timezone', 'UTC');
        if (limit === undefined) {
            limit = 100; // default 100, max 100
        }
        const duration = this.parseTimeframe (timeframe);
        let bar = this.safeString (this.timeframes, timeframe, timeframe);
        if ((timezone === 'UTC') && (duration >= 21600)) { // if utc and timeframe >= 6h
            bar += timezone.toLowerCase ();
        }
        const request = {
            'instId': market['id'],
            'bar': bar,
            'limit': limit,
        };
        if (since !== undefined) {
            const durationInMilliseconds = duration * 1000;
            // if the since timestamp is more than limit candles back in the past
            // additional one bar for max offset to round the current day to UTC
            const startTime = Math.max (since - 1, 0);
            request['before'] = startTime;
            request['after'] = this.sum (startTime, durationInMilliseconds * limit);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['after'] = until;
            params = this.omit (params, 'until');
        }
        params = this.omit (params, 'type');
        let response = undefined;
        response = await this.publicGetMarketCandles (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://blofin.com/docs#get-funding-rate-history
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        if (since !== undefined) {
            request['before'] = Math.max (since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketFundingRateHistory (this.extend (request, params));
        const rates = [];
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rate = data[i];
            const timestamp = this.safeInteger (rate, 'fundingTime');
            rates.push ({
                'info': rate,
                'symbol': this.safeSymbol (this.safeString (rate, 'instId')),
                'fundingRate': this.safeNumber (rate, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    parseBalanceByType (type, response) {
        if (type === 'funding') {
            return this.parseFundingBalance (response);
        } else {
            return this.parseTradingBalance (response);
        }
    }

    parseTradingBalance (response) {
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0, {});
        const timestamp = this.safeInteger (first, 'uTime');
        const details = this.safeValue (first, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            const eq = this.safeString (balance, 'eq');
            const availEq = this.safeString (balance, 'availEq');
            if ((eq === undefined) || (availEq === undefined)) {
                account['free'] = this.safeString (balance, 'availBal');
                account['used'] = this.safeString (balance, 'frozenBal');
            } else {
                account['total'] = eq;
                account['free'] = availEq;
            }
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    parseFundingBalance (response) {
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'ccy');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeString (balance, 'bal');
            account['free'] = this.safeString (balance, 'availBal');
            account['used'] = this.safeString (balance, 'frozenBal');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    parseTradingFee (fee, market: Market = undefined) {
        return {
            'info': fee,
            'symbol': this.safeSymbol (undefined, market),
            // blofin returns the fees as negative values opposed to other exchanges, so the sign needs to be flipped
            'maker': this.parseNumber (Precise.stringNeg (this.safeString2 (fee, 'maker', 'makerU'))),
            'taker': this.parseNumber (Precise.stringNeg (this.safeString2 (fee, 'taker', 'takerU'))),
        };
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name blofin#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://blofin.com/docs#get-balance
         * @see https://blofin.com/docs#get-futures-account-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const marketType = this.safeString (params, 'accountType');
        const request = {
        };
        let response = undefined;
        if (marketType) {
            response = await this.privateGetAssetBalances (this.extend (request, params));
        } else {
            response = await this.privateGetAccountBalance (this.extend (request));
        }
        return this.parseBalanceByType (marketType, response);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'side': side,
            'orderType': type,
            'size': this.amountToPrecision (symbol, amount),
        };
        const marginMode = this.safeString2 (params, 'marginMode', 'cross'); // cross or isolated
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' createOrder() requires a marginMode parameter that must be either cross or isolated');
        }
        request['marginMode'] = marginMode;
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        const isMarketOrder = type === 'market';
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, type === 'post_only', params);
        params = this.omit (params, [ 'marginMode', 'timeInForce' ]);
        const ioc = (timeInForce === 'IOC') || (type === 'ioc');
        const fok = (timeInForce === 'FOK') || (type === 'fok');
        const marketIOC = (isMarketOrder && ioc);
        if (isMarketOrder || marketIOC) {
            request['orderType'] = 'market';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (postOnly) {
            request['ordType'] = 'post_only';
        } else if (ioc && !marketIOC) {
            request['ordType'] = 'ioc';
        } else if (fok) {
            request['ordType'] = 'fok';
        } else {
            request['ordType'] = 'limit';
        }
        return this.extend (request, params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name blofin#createOrder
         * @description create a trade order
         * @see https://blofin.com/docs#place-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'post_only' or 'ioc' or 'fok'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
         * @param {bool} [params.postOnly] true to place a post only order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostTradeOrder (request);
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        const order = this.parseOrder (first, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }

    createTpslOrderRequest (symbol: string, positionSide: string, side: OrderSide, params = {}) {
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'side': side,
            'positionSide': positionSide,
        };
        const size = this.safeString (params, 'size');
        if (size) {
            request['size'] = this.amountToPrecision (symbol, size);
        }
        const marginMode = this.safeString2 (params, 'marginMode', 'cross'); // cross or isolated
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' createTpslOrder() requires a marginMode parameter that must be either cross or isolated');
        }
        request['marginMode'] = marginMode;
        params = this.omit (params, [ 'marginMode', 'size' ]);
        return this.extend (request, params);
    }

    async createTpslOrder (symbol: string, positionSide: string, type: OrderType, side: OrderSide, params = {}) {
        /**
         * @method
         * @name blofin#createTpslOrder
         * @description create a trade tpsl order
         * @see https://blofin.com/docs#place-tpsl-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} positionSide 'long' or 'short' or 'net'
         * @param {string} type 'market' or 'limit' or 'post_only' or 'ioc' or 'fok'
         * @param {string} side 'buy' or 'sell'
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createTpslOrderRequest (symbol, type, side, params);
        const response = await this.privatePostTradeOrderTpsl (request);
        const data = this.safeValue (response, 'data', []);
        const first = this.safeValue (data, 0);
        const order = this.parseOrder (first, market);
        order['positionSide'] = type;
        order['side'] = side;
        return order;
    }

    async createOrders (orders: OrderRequest[], params = {}) {
        /**
         * @method
         * @name okx#createOrders
         * @description create a list of trade orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'instId');
            const type = this.safeString (rawOrder, 'orderType');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'size');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeValue (rawOrder, 'params', {});
            const extendedParams = this.extend (orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, extendedParams);
            ordersRequests.push (orderRequest);
        }
        const response = await this.privatePostTradeBatchOrders (ordersRequests);
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data);
    }

    // TODO: private 方法的部分需要按照 blofin 的需要处理，这里是从 OKX 直接 copy 过来的， public 的部分不用改
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray (params);
        const request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api']['rest']) + request;
        // const type = this.getPathAuthenticationType (path);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            // inject id in implicit api call
            if (method === 'POST' && (path === 'trade/batch-orders' || path === 'trade/order-algo' || path === 'trade/order')) {
                const brokerId = this.safeString (this.options, 'brokerId', 'e847386590ce4dBC');
                if (Array.isArray (params)) {
                    for (let i = 0; i < params.length; i++) {
                        const entry = params[i];
                        const clientOrderId = this.safeString (entry, 'clOrdId');
                        if (clientOrderId === undefined) {
                            entry['clOrdId'] = brokerId + this.uuid16 ();
                            entry['tag'] = brokerId;
                            params[i] = entry;
                        }
                    }
                } else {
                    const clientOrderId = this.safeString (params, 'clOrdId');
                    if (clientOrderId === undefined) {
                        params['clOrdId'] = brokerId + this.uuid16 ();
                        params['tag'] = brokerId;
                    }
                }
            }
            const timestamp = this.iso8601 (this.milliseconds ());
            headers = {
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-PASSPHRASE': this.password,
                'OK-ACCESS-TIMESTAMP': timestamp,
                // 'OK-FROM': '',
                // 'OK-TO': '',
                // 'OK-LIMIT': '',
            };
            let auth = timestamp + method + request;
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    const urlencodedQuery = '?' + this.urlencode (query);
                    url += urlencodedQuery;
                    auth += urlencodedQuery;
                }
            } else {
                if (isArray || Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            headers['OK-ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
