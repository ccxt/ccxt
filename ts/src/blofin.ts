
//  ---------------------------------------------------------------------------

import Exchange from './abstract/blofin.js';
import { ExchangeError, ExchangeNotAvailable, ArgumentsRequired, BadRequest, InvalidOrder, AuthenticationError, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, Str, Transaction, Ticker, OrderBook, Balances, Tickers, Market, Strings, MarketInterface, Currency, Position } from './base/types.js';

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
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
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
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
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
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
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
            'hostname': 'www.blofin.com',
            'urls': {
                'logo': 'https://s2.blofin.com/logo/whiteground.png',
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
                        'asset/transfer': 1,
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

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name blofin#fetchMarkets
         * @description retrieves data on all markets for blofin
         * @see https://blofin.com/docs#get-instruments
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarketInstruments (params);
        const data = this.safeValue (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'instId');
        const type = this.safeStringLower (market, 'instType');
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const option = (type === 'option');
        const contract = swap || future;
        const baseId = this.safeString (market, 'baseCurrency');
        const quoteId = this.safeString (market, 'quoteCurrency');
        const settleId = this.safeString (market, 'quoteCurrency');
        const settle = this.safeCurrencyCode (settleId);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        if (swap) {
            symbol = symbol + ':' + settle;
        }
        const expiry = undefined;
        const strikePrice = undefined;
        const optionType = undefined;
        const tickSize = this.safeString (market, 'tickSize');
        const fees = this.safeValue2 (this.fees, type, 'trading', {});
        const taker = this.safeNumber (fees, 'taker');
        const maker = this.safeNumber (fees, 'maker');
        let maxLeverage = this.safeString (market, 'maxLeverage', '100');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        const isActive = (this.safeString (market, 'state') === 'live');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settle': settle,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'option': option,
            'margin': spot && (Precise.stringGt (maxLeverage, '1')),
            'swap': swap,
            'future': future,
            'active': isActive,
            'taker': taker,
            'maker': maker,
            'contract': contract,
            'linear': contract ? (quoteId === settleId) : undefined,
            'inverse': contract ? (baseId === settleId) : undefined,
            'contractSize': contract ? this.safeNumber (market, 'contractValue') : undefined,
            'expiry': expiry,
            'expiryDatetime': expiry,
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
        limit = (limit === undefined) ? 50 : limit;
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
        const quoteVolume = spot ? this.safeString (ticker, 'volCurrency24h') : undefined;
        const baseVolume = this.safeString (ticker, 'vol24h');
        const high = this.safeString (ticker, 'high24h');
        const low = this.safeString (ticker, 'low24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidSize'),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askSize'),
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
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketTickers (params);
        const tickers = this.safeValue (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'tradeId');
        const marketId = this.safeString (trade, 'instId');
        market = this.safeMarket (marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const side = this.safeString (trade, 'side');
        const orderId = this.safeString (trade, 'orderId');
        const fee = undefined;
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': undefined,
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
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 6),
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
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 100) as OHLCV[];
        }
        if (limit === undefined) {
            limit = 100; // default 100, max 100
        }
        const request = {
            'instId': market['id'],
            'bar': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
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
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (rate, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        //    {
        //        "fundingRate": "0.00027815",
        //        "fundingTime": "1634256000000",
        //        "instId": "BTC-USD-SWAP",
        //        "instType": "SWAP",
        //        "nextFundingRate": "0.00017",
        //        "nextFundingTime": "1634284800000"
        //    }
        //
        // in the response above nextFundingRate is actually two funding rates from now
        //
        const nextFundingRateTimestamp = this.safeInteger (contract, 'nextFundingTime');
        const marketId = this.safeString (contract, 'instId');
        const symbol = this.safeSymbol (marketId, market);
        const nextFundingRate = this.safeNumber (contract, 'nextFundingRate');
        const fundingTime = this.safeInteger (contract, 'fundingTime');
        // > The current interest is 0.
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601 (fundingTime),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': nextFundingRateTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingRateTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name blofin#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://blofin.com/docs#get-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new ExchangeError (this.id + ' fetchFundingRate() is only valid for swap markets');
        }
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketFundingRate (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "fundingRate": "0.00027815",
        //                "fundingTime": "1634256000000",
        //                "instId": "BTC-USD-SWAP",
        //                "instType": "SWAP",
        //                "nextFundingRate": "0.00017",
        //                "nextFundingTime": "1634284800000"
        //            }
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        const entry = this.safeValue (data, 0, {});
        return this.parseFundingRate (entry, market);
    }

    parseBalanceByType (type, response) {
        if (type) {
            return this.parseFundingBalance (response);
        } else {
            return this.parseTradingBalance (response);
        }
    }

    parseTradingBalance (response) {
        const result = { 'info': response };
        const data = this.safeValue (response, 'data', []);
        const timestamp = this.safeInteger (data, 'ts');
        const details = this.safeValue (data, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            const eq = this.safeString (balance, 'equity');
            const availEq = this.safeString (balance, 'available');
            if ((eq === undefined) || (availEq === undefined)) {
                account['free'] = this.safeString (balance, 'availableEquity');
                account['used'] = this.safeString (balance, 'frozen');
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
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeString (balance, 'balance');
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'frozen');
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
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
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
        const marginMode = this.safeString (params, 'marginMode', 'cross'); // cross or isolated
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' createOrder() requires a marginMode parameter that must be either cross or isolated');
        }
        request['marginMode'] = marginMode;
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        const isMarketOrder = type === 'market';
        [ params ] = this.handlePostOnly (isMarketOrder, type === 'post_only', params);
        params = this.omit (params, [ 'marginMode', 'timeInForce' ]);
        const ioc = (timeInForce === 'IOC') || (type === 'ioc');
        const marketIOC = (isMarketOrder && ioc);
        if (isMarketOrder || marketIOC) {
            request['orderType'] = 'market';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        return this.extend (request, params);
    }

    parseOrderStatus (status) {
        const statuses = {
            'canceled': 'canceled',
            'order_failed': 'canceled',
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'effective': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        const scode = this.safeString (order, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            const error_symbol = this.safeString (market, 'symbol');
            return this.safeError ({
                'code': scode,
                'id': this.safeString (order, 'orderId'),
                'symbol': error_symbol,
                'clientOrderId': this.safeString (order, 'clientOrderId'),
                'status': 'rejected',
                'info': order,
            });
        }
        const id = this.safeString2 (order, 'tpslId', 'orderId');
        const timestamp = this.safeInteger (order, 'createTime');
        const lastUpdateTimestamp = this.safeInteger (order, 'updateTime');
        const lastTradeTimestamp = this.safeInteger (order, 'fillTime');
        const side = this.safeString (order, 'side');
        let type = this.safeString (order, 'orderType');
        let postOnly = undefined;
        let timeInForce = undefined;
        if (type === 'post_only') {
            postOnly = true;
            type = 'limit';
        } else if (type === 'fok') {
            timeInForce = 'FOK';
            type = 'limit';
        } else if (type === 'ioc') {
            timeInForce = 'IOC';
            type = 'limit';
        }
        const marketId = this.safeString (order, 'instId');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market, '-');
        const filled = this.safeString (order, 'filledSize');
        const price = this.safeString2 (order, 'px', 'price');
        const average = this.safeString (order, 'averagePrice');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const feeCostString = this.safeString (order, 'fee');
        let amount = undefined;
        let cost = undefined;
        // spot market buy: "sz" can refer either to base currency units or to quote currency units
        const defaultTgtCcy = this.safeString (this.options, 'tgtCcy', 'base_ccy');
        const tgtCcy = this.safeString (order, 'tgtCcy', defaultTgtCcy);
        const instType = this.safeString (order, 'instType');
        if ((side === 'buy') && (type === 'market') && (instType === 'SPOT') && (tgtCcy === 'quote_ccy')) {
            // "sz" refers to the cost
            cost = this.safeString (order, 'size');
        } else {
            // "sz" refers to the trade currency amount
            amount = this.safeString (order, 'size');
        }
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise.stringNeg (feeCostString);
            const feeCurrencyId = this.safeString (order, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': this.parseNumber (feeCostSigned),
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString (order, 'clientOrderId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopLossTriggerPrice = this.safeNumber (order, 'slTriggerPrice');
        const stopLossPrice = this.safeNumber (order, 'slOrderPrice');
        const takeProfitTriggerPrice = this.safeNumber (order, 'tpTriggerPrice');
        const takeProfitPrice = this.safeNumber (order, 'tpOrderPrice');
        const reduceOnlyRaw = this.safeString (order, 'reduceOnly');
        const reduceOnly = (reduceOnlyRaw === 'true');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopLossTriggerPrice': stopLossTriggerPrice,
            'takeProfitTriggerPrice': takeProfitTriggerPrice,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'reduceOnly': reduceOnly,
        }, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}): Promise<Order> {
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
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
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
        const marginMode = this.safeString (params, 'marginMode', 'cross'); // cross or isolated
        if (marginMode !== 'cross' && marginMode !== 'isolated') {
            throw new BadRequest (this.id + ' createTpslOrder() requires a marginMode parameter that must be either cross or isolated');
        }
        request['marginMode'] = marginMode;
        params = this.omit (params, [ 'marginMode', 'size' ]);
        return this.extend (request, params);
    }

    async createTpslOrder (symbol: string, positionSide: string, side: OrderSide, params = {}) {
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
        const request = this.createTpslOrderRequest (symbol, positionSide, side, params);
        const response = await this.privatePostTradeOrderTpsl (request);
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        const order = this.parseOrder (data, market);
        order['positionSide'] = positionSide;
        order['side'] = side;
        return order;
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name blofin#cancelOrder
         * @description cancels an open order
         * @see https://blofin.com/docs#cancel-order
         * @see https://blofin.com/docs#cancel-tpsl-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const query = this.omit (params, [ 'orderId', 'clientOrderId' ]);
        const response = await this.privatePostTradeCancelOrder (this.extend (request, query));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'id': id,
                'symbol': market['symbol'],
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        return this.parseOrder (order, market);
    }

    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        /**
         * @method
         * @name blofin#createOrders
         * @description create a list of trade orders
         * @see https://blofin.com/docs#place-multiple-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'symbol');
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeValue (rawOrder, 'params', {});
            const extendedParams = this.extend (orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, extendedParams);
            ordersRequests.push (orderRequest);
        }
        const response = await this.privatePostTradeBatchOrders (ordersRequests);
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name blofin#fetchOpenOrders
         * @description Fetch orders that are still open
         * @description fetch all unfilled currently open orders
         * @see https://blofin.com/docs#get-active-orders
         * @see https://blofin.com/docs#get-active-tpsl-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.till] Timestamp in ms of the latest time to retrieve orders for
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
         * @param {string} [params.algoId] Algo ID "'433845797218942976'"
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchOpenOrders', symbol, since, limit, params) as Order[];
        }
        const request = {
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetTradeOrdersPending');
        const method = this.safeString (params, 'method', defaultMethod);
        const query = this.omit (params, [ 'method', 'stop' ]);
        let response = undefined;
        if (method === 'TPSL') {
            response = await this.privateGetTradeOrdersTpslPending (this.extend (request, query));
        } else {
            response = await this.privateGetTradeOrdersPending (this.extend (request, query));
        }
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://blofin.com/docs#get-trade-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] Timestamp in ms of the latest time to retrieve trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params) as Trade[];
        }
        let request = {
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        request['instType'] = this.convertToInstrumentType (type);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeFillsHistory (this.extend (request, query));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit, query);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name blofin#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://blofin.com/docs#get-deposite-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchDeposits', code, since, limit, params);
        }
        let request = {
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max (since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
        const response = await this.privateGetAssetDepositHistory (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name blofin#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://blofin.com/docs#get-withdraw-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchWithdrawals', code, since, limit, params);
        }
        let request = {
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max (since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [ request, params ] = this.handleUntilOption ('after', request, params);
        const response = await this.privateGetAssetWithdrawalHistory (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blofin#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://blofin.com/docs#get-funds-transfer-history
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params);
        }
        params = this.omit (params, 'method');
        let request = {
        };
        const [ query ] = this.handleMarketTypeAndParams ('fetchLedger', undefined, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        [ request, params ] = this.handleUntilOption ('end', request, params);
        let response = undefined;
        response = await this.privateGetAssetBills (this.extend (request, query));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            '1': 'transfer', // transfer
            '2': 'trade', // trade
            '3': 'trade', // delivery
            '4': 'rebate', // auto token conversion
            '5': 'trade', // liquidation
            '6': 'transfer', // margin transfer
            '7': 'trade', // interest deduction
            '8': 'fee', // funding rate
            '9': 'trade', // adl
            '10': 'trade', // clawback
            '11': 'trade', // system token conversion
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency: Currency = undefined) {
        const id = this.safeString (item, 'transferId');
        const referenceId = this.safeString (item, 'clientId');
        const fromAccount = this.safeString (item, 'fromAccount');
        const toAccount = this.safeString (item, 'toAccount');
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency'), currency);
        const amountString = this.safeString (item, 'amount');
        const amount = this.parseNumber (amountString);
        const timestamp = this.safeInteger (item, 'ts');
        const status = 'ok';
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'clientId': referenceId, // balance before
            'status': status,
        };
    }

    parseIds (ids) {
        /**
         * @ignore
         * @method
         * @name blofin#parseIds
         * @param {string[]|string} ids order ids
         * @returns {string[]} list of order ids
         */
        if (typeof ids === 'string') {
            return ids.split (',');
        } else {
            return ids;
        }
    }

    async cancelOrders (ids, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name blofin#cancelOrders
         * @description cancel multiple orders
         * @see https://blofin.com/docs#cancel-multiple-orders
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] whether the order is a stop/trigger order
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // TODO : the original endpoint signature differs, according to that you can skip individual symbol and assign ids in batch. At this moment, `params` is not being used too.
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = [];
        const options = this.safeValue (this.options, 'cancelOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privatePostTradeCancelBatchOrders');
        let method = this.safeString (params, 'method', defaultMethod);
        const clientOrderIds = this.parseIds (this.safeValue (params, 'clientOrderId'));
        const tpslIds = this.parseIds (this.safeValue (params, 'tpslId'));
        const stop = this.safeValue (params, 'tpsl');
        if (stop) {
            method = 'privatePostTradeCancelTpsl';
        }
        if (clientOrderIds === undefined) {
            ids = this.parseIds (ids);
            if (tpslIds !== undefined) {
                for (let i = 0; i < tpslIds.length; i++) {
                    request.push ({
                        'tpslId': tpslIds[i],
                        'instId': market['id'],
                    });
                }
            }
            for (let i = 0; i < ids.length; i++) {
                if (stop) {
                    request.push ({
                        'tpslId': ids[i],
                        'instId': market['id'],
                    });
                } else {
                    request.push ({
                        'orderId': ids[i],
                        'instId': market['id'],
                    });
                }
            }
        } else {
            for (let i = 0; i < clientOrderIds.length; i++) {
                request.push ({
                    'instId': market['id'],
                    'clientOrderId': clientOrderIds[i],
                });
            }
        }
        let response = undefined;
        if (method === 'privatePostTradeCancelTpsl') {
            response = await this.privatePostTradeCancelTpsl (request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        } else {
            response = await this.privatePostTradeCancelBatchOrders (request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const ordersData = this.safeValue (response, 'data', []);
        return this.parseOrders (ordersData, market, undefined, undefined, params);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name blofin#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://blofin.com/docs#funds-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        // TODO: 此处需要接入currency接口后实现
        // const currency = this.currency (code);
        const currency = code;
        const request = {
            'currency': currency,
            'amount': this.currencyToPrecision (code, amount),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        };
        const response = await this.privatePostAssetTransfer (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'clientOrderId': this.safeString (response, 'clientOrderId'),
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransfer (data, undefined);
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        const id = this.safeString (transfer, 'transferId');
        const clientId = this.safeString (transfer, 'clientTransferId');
        return {
            'info': transfer,
            'transferId': id,
            'clientId': clientId,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    safeError (response: object, market: Market = undefined) {
        const code = this.safeString (response, 'code');
        const status = 'rejected';
        return this.extend (response, {
            'code': code,
            'status': status,
        });
    }

    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        /**
         * @method
         * @name blofin#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://blofin.com/docs#get-positions
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ query ] = this.handleMarketTypeAndParams ('fetchPosition', market, params);
        const request = {
            'instId': market['id'],
        };
        const response = await this.privateGetAccountPositions (this.extend (request, query));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        const position = this.safeValue (data, 0);
        if (position === undefined) {
            return undefined;
        }
        return this.parsePosition (position, market);
    }

    parsePosition (position, market: Market = undefined) {
        const marketId = this.safeString (position, 'instId');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const pos = this.safeString (position, 'positions');
        const contractsAbs = Precise.stringAbs (pos);
        let side = this.safeString (position, 'positionSide');
        const hedged = side !== 'net';
        const contracts = this.parseNumber (contractsAbs);
        if (pos !== undefined) {
            if (side === 'net') {
                if (Precise.stringGt (pos, '0')) {
                    side = 'long';
                } else if (Precise.stringLt (pos, '0')) {
                    side = 'short';
                } else {
                    side = undefined;
                }
            }
        }
        const contractSize = this.safeNumber (market, 'contractSize');
        const contractSizeString = this.numberToString (contractSize);
        const markPriceString = this.safeString (position, 'markPrice');
        let notionalString = this.safeString (position, 'notionalUsd');
        if (market['inverse']) {
            notionalString = Precise.stringDiv (Precise.stringMul (contractsAbs, contractSizeString), markPriceString);
        }
        const notional = this.parseNumber (notionalString);
        const marginMode = this.safeString (position, 'marginMode');
        let initialMarginString = undefined;
        const entryPriceString = this.safeString (position, 'averagePrice');
        const unrealizedPnlString = this.safeString (position, 'unrealizedPnl');
        const leverageString = this.safeString (position, 'leverage');
        let initialMarginPercentage = undefined;
        let collateralString = undefined;
        if (marginMode === 'cross') {
            initialMarginString = this.safeString (position, 'initialMargin');
            collateralString = Precise.stringAdd (initialMarginString, unrealizedPnlString);
        } else if (marginMode === 'isolated') {
            initialMarginPercentage = Precise.stringDiv ('1', leverageString);
            collateralString = this.safeString (position, 'margin');
        }
        const maintenanceMarginString = this.safeString (position, 'maintenanceMargin');
        const maintenanceMargin = this.parseNumber (maintenanceMarginString);
        const maintenanceMarginPercentageString = Precise.stringDiv (maintenanceMarginString, notionalString);
        if (initialMarginPercentage === undefined) {
            initialMarginPercentage = this.parseNumber (Precise.stringDiv (initialMarginString, notionalString, 4));
        } else if (initialMarginString === undefined) {
            initialMarginString = Precise.stringMul (initialMarginPercentage, notionalString);
        }
        const rounder = '0.00005'; // round to closest 0.01%
        const maintenanceMarginPercentage = this.parseNumber (Precise.stringDiv (Precise.stringAdd (maintenanceMarginPercentageString, rounder), '1', 4));
        const liquidationPrice = this.safeNumber (position, 'liquidationPrice');
        const percentageString = this.safeString (position, 'unrealizedPnlRatio');
        const percentage = this.parseNumber (Precise.stringMul (percentageString, '100'));
        const timestamp = this.safeInteger (position, 'updateTime');
        const marginRatio = this.parseNumber (Precise.stringDiv (maintenanceMarginString, collateralString, 4));
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': notional,
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber (entryPriceString),
            'unrealizedPnl': this.parseNumber (unrealizedPnlString),
            'percentage': percentage,
            'contracts': contracts,
            'contractSize': contractSize,
            'markPrice': this.parseNumber (markPriceString),
            'lastPrice': undefined,
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': this.parseNumber (collateralString),
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'leverage': this.parseNumber (leverageString),
            'marginRatio': marginRatio,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    async fetchLeverage (symbol: string, params = {}) {
        /**
         * @method
         * @name blofin#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://blofin.com/docs#set-leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets ();
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('fetchLeverage', params);
        if (marginMode === undefined) {
            marginMode = this.safeString (params, 'marginMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new BadRequest (this.id + ' fetchLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const market = this.market (symbol);
        const request = {
            'instId': market['id'],
            'marginMode': marginMode,
        };
        const response = await this.privateGetAccountLeverageInfo (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        return response;
    }

    async setLeverage (leverage, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name blofin#setLeverage
         * @description set the level of leverage for a market
         * @see https://blofin.com/docs#set-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @param {string} [params.posSide] 'long' or 'short' for isolated margin long/short mode on futures and swap markets
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 125)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params);
        if (marginMode === undefined) {
            marginMode = this.safeString (params, 'marginMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new BadRequest (this.id + ' setLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const request = {
            'leverage': leverage,
            'marginMode': marginMode,
            'instId': market['id'],
        };
        const response = await this.privatePostAccountSetLeverage (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        return response;
    }

    async closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name blofin#closePosition
         * @description closes open positions for a market
         * @see https://blofin.com/docs#close-positions
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} [side] 'buy' or 'sell', leave as undefined in net mode
         * @param {object} [params] extra parameters specific to the blofin api endpoint
         * @param {string} [params.clientOrderId] a unique identifier for the order
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross;
         * @param {string} [params.code] *required in the case of closing cross MARGIN position for Single-currency margin* margin currency
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {boolean} [params.autoCxl] whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
         * @param {string} [params.tag] order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters
         * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let marginMode = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('closePosition', params, 'cross');
        const request = {
            'instId': market['id'],
            'marginMode': marginMode,
        };
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        const response = await this.privatePostTradeClosePosition (this.extend (request, params));
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'clientOrderId': this.safeString (response, 'clientOrderId'),
                'status': 'rejected',
                'info': response,
            });
        }
        return this.safeValue (response, 'data');
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name blofin#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://blofin.com/docs#get-order-history
         * @see https://blofin.com/docs#get-tpsl-order-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
         * @param {string} [params.algoId] Algo ID "'433845797218942976'"
         * @param {int} [params.until] timestamp in ms to fetch orders for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchClosedOrders', symbol, since, limit, params) as Order[];
        }
        const request = {
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetTradeOrdersHistory');
        const method = this.safeString (params, 'method', defaultMethod);
        if (since !== undefined) {
            request['begin'] = since;
        }
        const query = this.omit (params, [ 'method', 'stop' ]);
        let response = undefined;
        if (method === 'TPSL') {
            response = await this.privateGetTradeOrdersTpslHistory (this.extend (request, query));
        } else {
            response = await this.privateGetTradeOrdersHistory (this.extend (request, query));
        }
        const scode = this.safeString (response, 'code');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeError ({
                'code': scode,
                'status': 'rejected',
                'info': response,
            });
        }
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        // {"code":"152002","msg":"Parameter bar error."}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api']['rest']) + request;
        // const type = this.getPathAuthenticationType (path);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-PASSPHRASE': this.password,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-NONCE': timestamp,
            };
            let sign_body = '';
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    const urlencodedQuery = '?' + this.urlencode (query);
                    url += urlencodedQuery;
                    request += urlencodedQuery;
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    sign_body = body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const auth = request + method + timestamp + timestamp + sign_body;
            const signature = this.stringToBase64 (this.hmac (this.encode (auth), this.encode (this.secret), sha256));
            headers['ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
