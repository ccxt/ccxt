
//  ---------------------------------------------------------------------------

import Exchange from './abstract/vertex.js';
import { ExchangeError, ArgumentsRequired, NotSupported, InvalidOrder, OrderNotFound, BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE, ROUND, SIGNIFICANT_DIGITS, DECIMAL_PLACES } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Market, Ticker, Tickers, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, Num, MarginModification, Currencies, CancellationRequest } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class vertex
 * @augments Exchange
 */
export default class vertex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vertex',
            'name': 'Vertex',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
                '1w': 604800,
                '1M': 604800,
            },
            'hostname': 'vertexprotocol.com',
            'urls': {
                'logo': '',
                'api': {
                    'v1': {
                        'archive': 'https://archive.prod.{hostname}/v1',
                        'gateway': 'https://gateway.prod.{hostname}/v1',
                        'trigger': 'https://trigger.prod.{hostname}/v1',
                    },
                    'v2': {
                        'archive': 'https://archive.prod.{hostname}/v2',
                        'gateway': 'https://gateway.prod.{hostname}/v2',
                    },
                },
                'test': {
                    'v1': {
                        'archive': 'https://archive.sepolia-test.{hostname}/v1',
                        'gateway': 'https://gateway.sepolia-test.{hostname}/v1',
                        'trigger': 'https://trigger.sepolia-test.{hostname}/v1',
                    },
                    'v2': {
                        'archive': 'https://archive.sepolia-test.{hostname}/v2',
                        'gateway': 'https://gateway.sepolia-test.{hostname}/v2',
                    },
                },
                'www': 'https://vertexprotocol.com/',
                'doc': 'https://docs.vertexprotocol.com/',
                'fees': 'https://docs.vertexprotocol.com/basics/fees',
                'referral': '',
            },
            'api': {
                'v1': {
                    'archive': {
                        'post': {
                            '': 1,
                        },
                    },
                    'gateway': {
                        'get': {
                            'query': 1,
                            'symbols': 1,
                        },
                        'post': {
                            'query': 1,
                            'execute': 1,
                        },
                    },
                    'trigger': {
                        'post': {
                            'execute': 1,
                        },
                    },
                },
                'v2': {
                    'archive': {
                        'get': {
                            'tickers': 1,
                            'contracts': 1,
                            'trades': 1,
                            'vrtx': 1,
                        },
                    },
                    'gateway': {
                        'get': {
                            'assets': 0.6667,
                            'pairs': 1,
                            'orderbook': 1,
                        },
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
                'spot': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
                'defaultSlippage': 0.05,
                'zeroAddress': '0x0000000000000000000000000000000000000000',
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    convertToX18 (num) {
        if (typeof num === 'string') {
            return Precise.stringMul (num, '1000000000000000000');
        }
        const numStr = this.numberToString (num);
        return Precise.stringMul (numStr, '1000000000000000000');
    }

    convertFromX18 (num) {
        if (typeof num === 'string') {
            return Precise.stringDiv (num, '1000000000000000000');
        }
        const numStr = this.numberToString (num);
        return Precise.stringDiv (numStr, '1000000000000000000');
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name vertex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const request = {};
        const response = await this.v2GatewayGetAssets (this.extend (request, params));
        //
        // [
        //     {
        //         "product_id": 2,
        //         "ticker_id": "BTC-PERP_USDC",
        //         "market_type": "perp",
        //         "name": "Bitcoin Perp",
        //         "symbol": "BTC-PERP",
        //         "maker_fee": 0.0002,
        //         "taker_fee": 0,
        //         "can_withdraw": false,
        //         "can_deposit": false
        //     },
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC_USDC",
        //         "market_type": "spot",
        //         "name": "Bitcoin",
        //         "symbol": "BTC",
        //         "taker_fee": 0.0003,
        //         "maker_fee": 0,
        //         "can_withdraw": true,
        //         "can_deposit": true
        //     }
        // ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const data = this.safeDict (response, i, {});
            const tickerId = this.safeString (data, 'ticker_id');
            if ((tickerId !== undefined) && (tickerId.indexOf ('PERP') > 0)) {
                continue;
            }
            const id = i;
            const name = this.safeString (data, 'symbol');
            const code = this.safeCurrencyCode (name);
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': undefined,
                'info': data,
                'active': undefined,
                'deposit': this.safeBool (data, 'can_deposit'),
                'withdraw': this.safeBool (data, 'can_withdraw'),
                'networks': undefined,
                'fee': undefined,
                'limits': undefined,
            };
        }
        return result;
    }

    parseMarket (market): Market {
        //
        // {
        //     "type": "spot",
        //     "product_id": 3,
        //     "symbol": "WETH",
        //     "price_increment_x18": "100000000000000000",
        //     "size_increment": "10000000000000000",
        //     "min_size": "100000000000000000",
        //     "min_depth_x18": "5000000000000000000000",
        //     "max_spread_rate_x18": "2000000000000000",
        //     "maker_fee_rate_x18": "0",
        //     "taker_fee_rate_x18": "300000000000000",
        //     "long_weight_initial_x18": "900000000000000000",
        //     "long_weight_maintenance_x18": "950000000000000000"
        // }
        //
        const marketType = this.safeString (market, 'type');
        const quoteId = 'USDC';
        const quote = this.safeCurrencyCode (quoteId);
        const baseId = this.safeString (market, 'symbol');
        const base = this.safeCurrencyCode (baseId);
        const settleId = quoteId;
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const spot = marketType === 'spot';
        const contract = !spot;
        const swap = !spot;
        if (swap) {
            const splitSymbol = base.split ('-');
            symbol = splitSymbol[0] + '/' + quote + ':' + settle;
        }
        const priceIncrementX18 = this.safeString (market, 'price_increment_x18');
        const sizeIncrementX18 = this.safeString (market, 'size_increment');
        const minSizeX18 = this.safeString (market, 'min_size');
        const takerX18 = this.safeNumber (market, 'taker_fee_rate_x18');
        const makerX18 = this.safeNumber (market, 'maker_fee_rate_x18');
        return {
            'id': this.safeString (market, 'product_id'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': (spot) ? 'spot' : 'swap',
            'spot': spot,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': true,
            'contract': contract,
            'linear': swap,
            'inverse': false,
            'taker': this.parseNumber (this.convertFromX18 (takerX18)),
            'maker': this.parseNumber (this.convertFromX18 (makerX18)),
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.convertFromX18 (sizeIncrementX18)),
                'price': this.parseNumber (this.convertFromX18 (priceIncrementX18)),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.parseNumber (this.convertFromX18 (minSizeX18)),
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
            'created': undefined,
            'info': market,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name vertex#fetchMarkets
         * @description retrieves data on all markets for vertex
         * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'symbols',
        };
        const response = await this.v1GatewayGetQuery (this.extend (request, params));
        //
        // {
        //     "status": "success",
        //     "data": {
        //         "symbols": {
        //             "WETH": {
        //                 "type": "spot",
        //                 "product_id": 3,
        //                 "symbol": "WETH",
        //                 "price_increment_x18": "100000000000000000",
        //                 "size_increment": "10000000000000000",
        //                 "min_size": "100000000000000000",
        //                 "min_depth_x18": "5000000000000000000000",
        //                 "max_spread_rate_x18": "2000000000000000",
        //                 "maker_fee_rate_x18": "0",
        //                 "taker_fee_rate_x18": "300000000000000",
        //                 "long_weight_initial_x18": "900000000000000000",
        //                 "long_weight_maintenance_x18": "950000000000000000"
        //             }
        //         }
        //     },
        //     "request_type": "query_symbols"
        // }
        //
        const data = this.safeDict (response, 'data', {});
        const markets = this.safeDict (data, 'symbols', {});
        const symbols = Object.keys (markets);
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const rawMarket = this.safeDict (markets, symbol, {});
            result.push (this.parseMarket (rawMarket));
        }
        return result;
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name vertex#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const request = {
            'type': 'status',
        };
        const response = await this.v1GatewayGetQuery (this.extend (request, params));
        //
        // {
        //     "status": "success",
        //     "data": "active",
        //     "request_type": "query_status",
        // }
        //
        let status = this.safeString (response, 'data');
        if (status === 'active') {
            status = 'ok';
        } else {
            status = 'error';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // {
        //       "ticker_id": "ARB_USDC",
        //       "trade_id": 999994,
        //       "price": 1.1366122408151016,
        //       "base_filled": 175,
        //       "quote_filled": -198.90714214264278,
        //       "timestamp": 1691068943,
        //       "trade_type": "buy"
        // }
        //
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const tickerId = this.safeString (trade, 'ticker_id');
        const splitTickerId = tickerId.split ('_');
        const splitSymbol = splitTickerId[0].split ('-');
        const marketId = splitSymbol[0] + splitTickerId[1];
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'base_filled');
        const side = this.safeStringLower (trade, 'trade_type');
        const id = this.safeString (trade, 'trade_id');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name vertex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['baseId'] + '_USDC';
        const request = {
            'ticker_id': marketId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2ArchiveGetTrades (this.extend (request, params));
        //
        // [
        //     {
        //       "ticker_id": "ARB_USDC",
        //       "trade_id": 999994,
        //       "price": 1.1366122408151016,
        //       "base_filled": 175,
        //       "quote_filled": -198.90714214264278,
        //       "timestamp": 1691068943,
        //       "trade_type": "buy"
        //     },
        //     {
        //       "ticker_id": "ARB_USDC",
        //       "trade_id": 999978,
        //       "price": 1.136512210806099,
        //       "base_filled": 175,
        //       "quote_filled": -198.8896368910673,
        //       "timestamp": 1691068882,
        //       "trade_type": "buy"
        //     }
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name vertex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['baseId'] + '_USDC';
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'ticker_id': marketId,
            'depth': limit,
        };
        const response = await this.v2GatewayGetOrderbook (this.extend (request, params));
        //
        // {
        //     "ticker_id": "ETH-PERP_USDC",
        //     "bids": [
        //         [
        //             1612.3,
        //             0.31
        //         ],
        //         [
        //             1612.0,
        //             0.93
        //         ],
        //         [
        //             1611.5,
        //             1.55
        //         ],
        //         [
        //             1610.8,
        //             2.17
        //         ]
        //     ],
        //     "asks": [
        //         [
        //             1612.9,
        //             0.93
        //         ],
        //         [
        //             1613.4,
        //             1.55
        //         ],
        //         [
        //             1614.1,
        //             2.17
        //         ]
        //     ],
        //     "timestamp": 1694375362016
        // }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks');
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        // example response in fetchOHLCV
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.parseNumber (this.convertFromX18 (this.safeString (ohlcv, 'open_x18'))),
            this.parseNumber (this.convertFromX18 (this.safeString (ohlcv, 'high_x18'))),
            this.parseNumber (this.convertFromX18 (this.safeString (ohlcv, 'low_x18'))),
            this.parseNumber (this.convertFromX18 (this.safeString (ohlcv, 'close_x18'))),
            this.parseNumber (this.convertFromX18 (this.safeString (ohlcv, 'volume'))),
        ];
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name vertex#fetchOHLCV
         * @see https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/candlesticks
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ohlcvRequest = {
            'product_id': this.parseNumber (market['id']),
            'granularity': this.safeNumber (this.timeframes, timeframe),
        };
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            ohlcvRequest['max_time'] = until;
        }
        if (limit !== undefined) {
            ohlcvRequest['limit'] = Math.min (limit, 1000);
        }
        const request = {
            'candlesticks': ohlcvRequest,
        };
        const response = await this.v1ArchivePost (this.extend (request, params));
        //
        // {
        //     "candlesticks": [
        //       {
        //         "product_id": 1,
        //         "granularity": 60,
        //         "submission_idx": "627709",
        //         "timestamp": "1680118140",
        //         "open_x18": "27235000000000000000000",
        //         "high_x18": "27298000000000000000000",
        //         "low_x18": "27235000000000000000000",
        //         "close_x18": "27298000000000000000000",
        //         "volume": "1999999999999999998"
        //       },
        //       {
        //         "product_id": 1,
        //         "granularity": 60,
        //         "submission_idx": "627699",
        //         "timestamp": "1680118080",
        //         "open_x18": "27218000000000000000000",
        //         "high_x18": "27245000000000000000000",
        //         "low_x18": "27218000000000000000000",
        //         "close_x18": "27245000000000000000000",
        //         "volume": "11852999999999999995"
        //       }
        //     ]
        // }
        //
        const rows = this.safeList (response, 'candlesticks', []);
        return this.parseOHLCVs (rows, market, timeframe, since, limit);
    }

    parseFundingRate (ticker, market: Market = undefined) {
        //
        // {
        //     "product_id": 4,
        //     "funding_rate_x18": "2447900598160952",
        //     "update_time": "1680116326"
        // }
        //
        // {
        //     "ETH-PERP_USDC": {
        //         "ticker_id": "ETH-PERP_USDC",
        //         "base_currency": "ETH-PERP",
        //         "quote_currency": "USDC",
        //         "last_price": 1620.3,
        //         "base_volume": 1309.2,
        //         "quote_volume": 2117828.093867611,
        //         "product_type": "perpetual",
        //         "contract_price": 1620.372642114429,
        //         "contract_price_currency": "USD",
        //         "open_interest": 1635.2,
        //         "open_interest_usd": 2649633.3443855145,
        //         "index_price": 1623.293496279935,
        //         "mark_price": 1623.398589416731,
        //         "funding_rate": 0.000068613217104332,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        // }
        //
        let fundingRate = this.safeNumber (ticker, 'funding_rate');
        if (fundingRate === undefined) {
            const fundingRateX18 = this.safeString (ticker, 'funding_rate_x18');
            fundingRate = this.parseNumber (this.convertFromX18 (fundingRateX18));
        }
        const fundingTimestamp = this.safeTimestamp2 (ticker, 'update_time', 'next_funding_rate_timestamp');
        const markPrice = this.safeNumber (ticker, 'mark_price');
        const indexPrice = this.safeNumber (ticker, 'index_price');
        return {
            'info': ticker,
            'symbol': market['symbol'],
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name vertex#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'funding_rate': {
                'product_id': this.parseNumber (market['id']),
            },
        };
        const response = await this.v1ArchivePost (this.extend (request, params));
        //
        // {
        //     "product_id": 4,
        //     "funding_rate_x18": "2447900598160952",
        //     "update_time": "1680116326"
        // }
        //
        return this.parseFundingRate (response, market);
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name vertex#fetchFundingRates
         * @description fetches funding rates for multiple markets
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/contracts
         * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
        }
        const response = await this.v2ArchiveGetContracts (this.extend (request, params));
        //
        // {
        //     "ETH-PERP_USDC": {
        //         "ticker_id": "ETH-PERP_USDC",
        //         "base_currency": "ETH-PERP",
        //         "quote_currency": "USDC",
        //         "last_price": 1620.3,
        //         "base_volume": 1309.2,
        //         "quote_volume": 2117828.093867611,
        //         "product_type": "perpetual",
        //         "contract_price": 1620.372642114429,
        //         "contract_price_currency": "USD",
        //         "open_interest": 1635.2,
        //         "open_interest_usd": 2649633.3443855145,
        //         "index_price": 1623.293496279935,
        //         "mark_price": 1623.398589416731,
        //         "funding_rate": 0.000068613217104332,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        // }
        //
        let keys = Object.keys (response);
        const fundingRates = {};
        for (let i = 0; i < keys.length; i++) {
            const tickerId = keys[i];
            const parsedTickerId = tickerId.split ('-');
            const data = response[tickerId];
            const marketId = parsedTickerId[0] + '/USDC:USDC';
            const market = this.market (marketId);
            const ticker = this.parseFundingRate (data, market);
            const symbol = ticker['symbol'];
            fundingRates[symbol] = ticker;
        }
        return this.filterByArray (fundingRates, 'symbol', symbols);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        // {
        //     "ETH-PERP_USDC": {
        //         "ticker_id": "ETH-PERP_USDC",
        //         "base_currency": "ETH-PERP",
        //         "quote_currency": "USDC",
        //         "last_price": 1620.3,
        //         "base_volume": 1309.2,
        //         "quote_volume": 2117828.093867611,
        //         "product_type": "perpetual",
        //         "contract_price": 1620.372642114429,
        //         "contract_price_currency": "USD",
        //         "open_interest": 1635.2,
        //         "open_interest_usd": 2649633.3443855145,
        //         "index_price": 1623.293496279935,
        //         "mark_price": 1623.398589416731,
        //         "funding_rate": 0.000068613217104332,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        // }
        //
        const value = this.safeNumber (interest, 'open_interest_usd');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': undefined,
            'openInterestValue': value,
            'timestamp': undefined,
            'datetime': undefined,
            'info': interest,
        }, market);
    }

    async fetchOpenInterest (symbol: string, params = {}) {
        /**
         * @method
         * @name vertex#fetchOpenInterest
         * @description Retrieves the open interest of a derivative trading pair
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/contracts
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {};
        const response = await this.v2ArchiveGetContracts (this.extend (request, params));
        //
        // {
        //     "ETH-PERP_USDC": {
        //         "ticker_id": "ETH-PERP_USDC",
        //         "base_currency": "ETH-PERP",
        //         "quote_currency": "USDC",
        //         "last_price": 1620.3,
        //         "base_volume": 1309.2,
        //         "quote_volume": 2117828.093867611,
        //         "product_type": "perpetual",
        //         "contract_price": 1620.372642114429,
        //         "contract_price_currency": "USD",
        //         "open_interest": 1635.2,
        //         "open_interest_usd": 2649633.3443855145,
        //         "index_price": 1623.293496279935,
        //         "mark_price": 1623.398589416731,
        //         "funding_rate": 0.000068613217104332,
        //         "next_funding_rate_timestamp": 1694379600,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        // }
        //
        const tickerId = market['base'] + '_USDC';
        const openInterest = this.safeDict (response, tickerId, {});
        return this.parseOpenInterest (openInterest, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "ticker_id": "BTC_USDC",
        //         "base_currency": "BTC",
        //         "quote_currency": "USDC",
        //         "last_price": 25728.0,
        //         "base_volume": 552.048,
        //         "quote_volume": 14238632.207250029,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        //
        const base = this.safeString (ticker, 'base_currency');
        const quote = this.safeString (ticker, 'quote_currency');
        let marketId = base + '/' + quote;
        if (base.indexOf ('PERP') > 0) {
            marketId = marketId.replace ('-PERP', '') + ':USDC';
        }
        market = this.market (marketId);
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'price_change_percent_24h'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name vertex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        const request = {};
        const response = await this.v2ArchiveGetTickers (this.extend (request, params));
        //
        // {
        //     "ETH_USDC": {
        //         "ticker_id": "ETH_USDC",
        //         "base_currency": "ETH",
        //         "quote_currency": "USDC",
        //         "last_price": 1619.1,
        //         "base_volume": 1428.32,
        //         "quote_volume": 2310648.316391866,
        //         "price_change_percent_24h": -1.0509394462969588
        //     },
        //     "BTC_USDC": {
        //         "ticker_id": "BTC_USDC",
        //         "base_currency": "BTC",
        //         "quote_currency": "USDC",
        //         "last_price": 25728.0,
        //         "base_volume": 552.048,
        //         "quote_volume": 14238632.207250029,
        //         "price_change_percent_24h": -0.6348599635253989
        //     }
        // }
        //
        const tickers = Object.values (response);
        return this.parseTickers (tickers, symbols);
    }

    async queryContracts (params = {}): Promise<Currencies> {
        // query contract addresses for sending order
        const cachedContracts = this.safeDict (this.options, 'v1contracts');
        if (cachedContracts !== undefined) {
            return cachedContracts;
        }
        const request = {
            'type': 'contracts',
        }; 
        const response = await this.v1GatewayGetQuery (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        this.options['v1contracts'] = data;
        return data;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //
        const status = this.safeString (response, 'status', '');
        let message = undefined;
        if (status === 'err') {
            message = this.safeString (response, 'response');
        } else {
            const responsePayload = this.safeDict (response, 'response', {});
            const data = this.safeDict (responsePayload, 'data', {});
            const statuses = this.safeList (data, 'statuses', []);
            const firstStatus = this.safeDict (statuses, 0);
            message = this.safeString (firstStatus, 'error');
        }
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        if (nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (api, 0);
        const type = this.safeString (api, 1);
        let url = this.implodeHostname (this.urls['api'][version][type]);
        if (version !== 'v1' || type !== 'archive') {
            url = url + '/' + path;
        }
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
