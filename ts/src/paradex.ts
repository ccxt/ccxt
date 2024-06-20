
//  ---------------------------------------------------------------------------

import { Precise } from '../ccxt.js';
import Exchange from './abstract/paradex.js';
import { ExchangeError, PermissionDenied, AuthenticationError, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Dict, Int, Market, OrderBook, Strings, Ticker, Tickers, Trade } from './base/types.js';
import { ecdsa } from './base/functions/crypto.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
//  ---------------------------------------------------------------------------

/**
 * @class paradex
 * @augments Exchange
 */
export default class paradex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'paradex',
            'name': 'Paradex',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
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
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
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
            'hostname': 'paradex.trade',
            'urls': {
                'logo': 'https://x.com/tradeparadex/photo',
                'api': {
                    'v1': 'https://api.prod.{hostname}/v1',
                },
                'test': {
                    'v1': 'https://api.testnet.{hostname}/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'bbo/{market}': 1,
                        'funding/data': 1,
                        'markets': 1,
                        'markets/summary': 1,
                        'orderbook/{market}': 1,
                        'insurance': 1,
                        'referrals/config': 1,
                        'system/config': 1,
                        'system/state': 1,
                        'system/time': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'account': 1,
                        'account/profile': 1,
                        'balance': 1,
                        'fills': 1,
                        'funding/payments': 1,
                        'positions': 1,
                        'tradebusts': 1,
                        'transactions': 1,
                        'liquidations': 1,
                        'orders': 1,
                        'orders-history': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
                        'points_data/{market}/{program}': 1,
                        'referrals/summary': 1,
                        'transfers': 1,
                    },
                    'post': {
                        'account/profile/referral_code': 1,
                        'account/profile/username': 1,
                        'auth': 1,
                        'onboarding': 1,
                        'orders': 1,
                    },
                    'delete': {
                        'orders': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
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
                    '-32700': BadRequest, // Parse error
                    '-32600': BadRequest, // Invalid request
                    '-32601': BadRequest, // Method not found
                    '-32602': BadRequest, // Invalid parameterss
                    '-32603': ExchangeError, // Internal error
                    '100': BadRequest, // Method error
                    '40110': AuthenticationError, // Malformed Bearer Token
                    '40111': AuthenticationError, // Invalid Bearer Token
                    '40112': PermissionDenied, // Geo IP blocked
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {},
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name paradex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.api.testnet.paradex.trade/#get-system-time-unix-milliseconds
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetSystemTime (params);
        //
        //     {
        //         "server_time": "1681493415023"
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name paradex#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://docs.api.testnet.paradex.trade/#get-system-state
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetSystemState (params);
        //
        //     {
        //         "status": "ok"
        //     }
        //
        const status = this.safeString (response, 'status');
        return {
            'status': (status === 'ok') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name paradex#fetchMarkets
         * @description retrieves data on all markets for bitget
         * @see https://docs.api.testnet.paradex.trade/#list-available-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BODEN-USD-PERP",
        //                 "base_currency": "BODEN",
        //                 "quote_currency": "USD",
        //                 "settlement_currency": "USDC",
        //                 "order_size_increment": "1",
        //                 "price_tick_size": "0.00001",
        //                 "min_notional": "200",
        //                 "open_at": 1717065600000,
        //                 "expiry_at": 0,
        //                 "asset_kind": "PERP",
        //                 "position_limit": "2000000",
        //                 "price_bands_width": "0.2",
        //                 "max_open_orders": 50,
        //                 "max_funding_rate": "0.05",
        //                 "delta1_cross_margin_params": {
        //                     "imf_base": "0.2",
        //                     "imf_shift": "180000",
        //                     "imf_factor": "0.00071",
        //                     "mmf_factor": "0.5"
        //                 },
        //                 "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //                 "oracle_ewma_factor": "0.14999987905913592",
        //                 "max_order_size": "520000",
        //                 "max_funding_rate_change": "0.0005",
        //                 "max_tob_spread": "0.2"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'results');
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "BODEN-USD-PERP",
        //         "base_currency": "BODEN",
        //         "quote_currency": "USD",
        //         "settlement_currency": "USDC",
        //         "order_size_increment": "1",
        //         "price_tick_size": "0.00001",
        //         "min_notional": "200",
        //         "open_at": 1717065600000,
        //         "expiry_at": 0,
        //         "asset_kind": "PERP",
        //         "position_limit": "2000000",
        //         "price_bands_width": "0.2",
        //         "max_open_orders": 50,
        //         "max_funding_rate": "0.05",
        //         "delta1_cross_margin_params": {
        //             "imf_base": "0.2",
        //             "imf_shift": "180000",
        //             "imf_factor": "0.00071",
        //             "mmf_factor": "0.5"
        //         },
        //         "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //         "oracle_ewma_factor": "0.14999987905913592",
        //         "max_order_size": "520000",
        //         "max_funding_rate_change": "0.0005",
        //         "max_tob_spread": "0.2"
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quote_currency');
        const baseId = this.safeString (market, 'base_currency');
        const quote = this.safeCurrencyCode (quoteId);
        const base = this.safeCurrencyCode (baseId);
        const settleId = this.safeString (market, 'settlement_currency');
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const expiry = this.safeInteger (market, 'expiry_at');
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': true,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool (market, 'enableTrading'),
            'contract': true,
            'linear': undefined,
            'inverse': undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': (expiry === 0) ? undefined : expiry,
            'expiryDatetime': (expiry === 0) ? undefined : this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
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
            'created': undefined,
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name paradex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        if (symbols !== undefined) {
            if (Array.isArray (symbols)) {
                request['market'] = this.marketId (symbols[0]);
            } else {
                request['market'] = this.marketId (symbols);
            }
        } else {
            request['market'] = 'ALL';
        }
        const response = await this.publicGetMarketsSummary (this.extend (request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'results', []);
        return this.parseTickers (data, symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name paradex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsSummary (this.extend (request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'results', []);
        const ticker = this.safeDict (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "symbol": "BTC-USD-PERP",
        //         "oracle_price": "68465.17449906",
        //         "mark_price": "68465.17449906",
        //         "last_traded_price": "68495.1",
        //         "bid": "68477.6",
        //         "ask": "69578.2",
        //         "volume_24h": "5815541.397939004",
        //         "total_volume": "584031465.525259686",
        //         "created_at": 1718170156580,
        //         "underlying_price": "67367.37268422",
        //         "open_interest": "162.272",
        //         "funding_rate": "0.01629574927887",
        //         "price_change_rate_24h": "0.009032"
        //     }
        //
        let percentage = this.safeString (ticker, 'price_change_rate_24h');
        if (percentage !== undefined) {
            percentage = Precise.stringMul (percentage, '100');
        }
        const last = this.safeString (ticker, 'last_traded_price');
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'created_at');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sdk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'volume_24h'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name paradex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.api.testnet.paradex.trade/#get-market-orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'market': market['id'] };
        const response = await this.publicGetOrderbookMarket (this.extend (request, params));
        //
        //     {
        //         "market": "BTC-USD-PERP",
        //         "seq_no": 14115975,
        //         "last_updated_at": 1718172538340,
        //         "asks": [
        //             [
        //                 "69578.2",
        //                 "3.019"
        //             ]
        //         ],
        //         "bids": [
        //             [
        //                 "68477.6",
        //                 "0.1"
        //             ]
        //         ]
        //     }
        //
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const timestamp = this.safeInteger (response, 'last_updated_at');
        const orderbook = this.parseOrderBook (response, market['symbol'], timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'seq_no');
        return orderbook;
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name paradex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.api.testnet.paradex.trade/#trade-tape
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'next', 'cursor', undefined, 100) as Trade[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        [ request, params ] = this.handleUntilOption ('end_at', request, params);
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "next": "...",
        //         "prev": "...",
        //         "results": [
        //             {
        //                 "id": "1718154353750201703989430001",
        //                 "market": "BTC-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "0.026",
        //                 "price": "69578.2",
        //                 "created_at": 1718154353750,
        //                 "trade_type": "FILL"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'results', []);
        for (let i = 0; i < trades.length; i++) {
            trades[i]['next'] = this.safeString (response, 'next');
        }
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": "1718154353750201703989430001",
        //         "market": "BTC-USD-PERP",
        //         "side": "BUY",
        //         "size": "0.026",
        //         "price": "69578.2",
        //         "created_at": 1718154353750,
        //         "trade_type": "FILL"
        //     }
        //
        const marketId = this.safeString (trade, 'market');
        market = this.safeMarket (marketId, market);
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeInteger (trade, 'created_at');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const side = this.safeString (trade, 'side');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': 'taker',
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        }, market);
    }

    async fetchOpenInterest (symbol: string, params = {}) {
        /**
         * @method
         * @name paradex#fetchOpenInterest
         * @description retrieves the open interest of a contract trading pair
         * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
         * @param {string} symbol unified CCXT market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsSummary (this.extend (request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'results', []);
        const interest = this.safeDict (data, 0, {});
        return this.parseOpenInterest (interest, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTC-USD-PERP",
        //         "oracle_price": "68465.17449906",
        //         "mark_price": "68465.17449906",
        //         "last_traded_price": "68495.1",
        //         "bid": "68477.6",
        //         "ask": "69578.2",
        //         "volume_24h": "5815541.397939004",
        //         "total_volume": "584031465.525259686",
        //         "created_at": 1718170156580,
        //         "underlying_price": "67367.37268422",
        //         "open_interest": "162.272",
        //         "funding_rate": "0.01629574927887",
        //         "price_change_rate_24h": "0.009032"
        //     }
        //
        const timestamp = this.safeInteger (interest, 'created_at');
        const marketId = this.safeString (interest, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        return this.safeOpenInterest ({
            'symbol': symbol,
            'openInterestAmount': this.safeNumber (interest, 'open_interest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    hashMessage (message) {
        return '0x' + this.hash (message, keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16 (this.sum (27, signature['v']));
        return '0x' + r.padStart (64, '0') + s.padStart (64, '0') + v;
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    async getSystemConfig () {
        const cachedConfig: Dict = this.safeDict (this.options, 'systemConfig');
        if (cachedConfig !== undefined) {
            return cachedConfig;
        }
        const response = await this.publicGetSystemConfig ();
        //
        // {
        //     "starknet_gateway_url": "https://potc-testnet-sepolia.starknet.io",
        //     "starknet_fullnode_rpc_url": "https://pathfinder.api.testnet.paradex.trade/rpc/v0_7",
        //     "starknet_chain_id": "PRIVATE_SN_POTC_SEPOLIA",
        //     "block_explorer_url": "https://voyager.testnet.paradex.trade/",
        //     "paraclear_address": "0x286003f7c7bfc3f94e8f0af48b48302e7aee2fb13c23b141479ba00832ef2c6",
        //     "paraclear_decimals": 8,
        //     "paraclear_account_proxy_hash": "0x3530cc4759d78042f1b543bf797f5f3d647cde0388c33734cf91b7f7b9314a9",
        //     "paraclear_account_hash": "0x41cb0280ebadaa75f996d8d92c6f265f6d040bb3ba442e5f86a554f1765244e",
        //     "oracle_address": "0x2c6a867917ef858d6b193a0ff9e62b46d0dc760366920d631715d58baeaca1f",
        //     "bridged_tokens": [
        //         {
        //             "name": "TEST USDC",
        //             "symbol": "USDC",
        //             "decimals": 6,
        //             "l1_token_address": "0x29A873159D5e14AcBd63913D4A7E2df04570c666",
        //             "l1_bridge_address": "0x8586e05adc0C35aa11609023d4Ae6075Cb813b4C",
        //             "l2_token_address": "0x6f373b346561036d98ea10fb3e60d2f459c872b1933b50b21fe6ef4fda3b75e",
        //             "l2_bridge_address": "0x46e9237f5408b5f899e72125dd69bd55485a287aaf24663d3ebe00d237fc7ef"
        //         }
        //     ],
        //     "l1_core_contract_address": "0x582CC5d9b509391232cd544cDF9da036e55833Af",
        //     "l1_operator_address": "0x11bACdFbBcd3Febe5e8CEAa75E0Ef6444d9B45FB",
        //     "l1_chain_id": "11155111",
        //     "liquidation_fee": "0.2"
        // }
        //
        this.options['systemConfig'] = response;
        return response;
    }

    async prepareParadexDomain (l1 = false) {
        const systemConfig = await this.getSystemConfig ();
        if (l1 === true) {
            return {
                'name': 'Paradex',
                'chainId': systemConfig['l1_chain_id'],
                'version': '1',
            };
        }
        return {
            'name': 'Paradex',
            'chainId': systemConfig['starknet_chain_id'],
            'version': '1',
        };
    }

    async retrieveAccount () {
        const cachedAccount: Dict = this.safeDict (this.options, 'paradexAccount');
        if (cachedAccount !== undefined) {
            return cachedAccount;
        }
        const systemConfig = await this.getSystemConfig ();
        const domain = await this.prepareParadexDomain (true);
        const messageTypes = {
            'Constant': [
                { 'name': 'action', 'type': 'string' },
            ],
        };
        const message = {
            'action': 'STARK Key',
        };
        const msg = this.ethEncodeStructuredData (domain, messageTypes, message);
        const signature = this.signMessage (msg, this.privateKey);
        const account = this.retrieveStarkAccount (
            signature,
            systemConfig['paraclear_account_hash'],
            systemConfig['paraclear_account_proxy_hash']
        );
        this.options['paradexAccount'] = account;
        return account;
    }

    async onboarding (params = {}) {
        const account = await this.retrieveAccount ();
        const req = {
            'action': 'Onboarding',
        };
        const domain = await this.prepareParadexDomain ();
        const messageTypes = {
            'Constant': [
                { 'name': 'action', 'type': 'felt' },
            ],
        };
        const msg = this.starknetEncodeStructuredData (domain, messageTypes, req, account.address);
        const signature = this.starknetSign (msg, account.pri);
        params['signature'] = signature;
        params['account'] = account.address;
        params['public_key'] = account.pub;
        const response = await this.privatePostOnboarding (params);
        return response;
    }

    async authenticateRest (params = {}) {
        const cachedToken: String = this.safeString (this.options, 'authToken');
        if (cachedToken !== undefined) {
            return cachedToken;
        }
        const account = await this.retrieveAccount ();
        const now = this.nonce ();
        const req = {
            'method': 'POST',
            'path': '/v1/auth',
            'body': '',
            'timestamp': now,
            'expiration': now + 86400 * 7,
        };
        const domain = await this.prepareParadexDomain ();
        const messageTypes = {
            'Request': [
                { 'name': 'method', 'type': 'felt' },
                { 'name': 'path', 'type': 'felt' },
                { 'name': 'body', 'type': 'felt' },
                { 'name': 'timestamp', 'type': 'felt' },
                { 'name': 'expiration', 'type': 'felt' },
            ],
        };
        const msg = this.starknetEncodeStructuredData (domain, messageTypes, req, account.address);
        const signature = this.starknetSign (msg, account.pri);
        params['signature'] = signature;
        params['account'] = account.address;
        params['timestamp'] = req['timestamp'];
        params['expiration'] = req['expiration'];
        const response = await this.privatePostAuth (params);
        //
        // {
        //     jwt_token: "ooooccxtooootoooootheoooomoonooooo"
        // }
        //
        const token = this.safeString (response, 'jwt_token');
        this.options['authToken'] = token;
        return token;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][this.version]) + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            headers = {
                'Accept': 'application/json',
            };
            // TODO: optimize
            if (path === 'auth') {
                headers['PARADEX-STARKNET-ACCOUNT'] = query['account'];
                headers['PARADEX-STARKNET-SIGNATURE'] = query['signature'];
                headers['PARADEX-TIMESTAMP'] = query['timestamp'];
                headers['PARADEX-SIGNATURE-EXPIRATION'] = query['expiration'];
            } else if (path === 'onboarding') {
                headers['PARADEX-ETHEREUM-ACCOUNT'] = this.walletAddress;
                headers['PARADEX-STARKNET-ACCOUNT'] = query['account'];
                headers['PARADEX-STARKNET-SIGNATURE'] = query['signature'];
                headers['PARADEX-TIMESTAMP'] = this.nonce ();
                headers['Content-Type'] = 'application/json';
                body = this.json ({
                    'public_key': query['public_key'],
                });
            } else {
                const token = this.options['authToken'];
                headers['Content-Type'] = 'application/json';
                headers['Authorization'] = 'Bearer ' + token;
                body = this.json (query);
            }
            // headers = {
            //     'Accept': 'application/json',
            //     'Authorization': 'Bearer ' + this.apiKey,
            // };
            // if (method === 'POST') {
            //     body = this.json (query);
            //     headers['Content-Type'] = 'application/json';
            // } else {
            //     if (Object.keys (query).length) {
            //         url += '?' + this.urlencode (query);
            //     }
            // }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
