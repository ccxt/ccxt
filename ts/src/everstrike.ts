
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import Exchange from './abstract/everstrike.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, OrderNotFound, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currencies, Currency, Dict, FundingRate, FundingRates, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, int, NullableDict } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class everstrike
 * @augments Exchange
 * @description Everstrike: order-book exchange for spot, perpetual futures and perpetual (floating-strike, non-expiring) options.
 *
 * Market ids follow the exchange's own conventions:
 *   spot:              BTC_USD             -> BTC/USD
 *   perpetual future:  USD_BTC_PERP        -> BTC/USD:USD
 *   perpetual option:  USD_BTCCALL5_PERP   -> BTC/USD:USD-PERP-0.95-C   (strike = EMA100(index) x 0.95, never expires)
 */
export default class everstrike extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'everstrike',
            'name': 'Everstrike',
            'countries': [ 'SC' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositAddress': false,
                'editOrder': false,
                'fetchLedger': false,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'setLeverage': true,
                'withdraw': false,
            },
            'timeframes': {
                '5m': '5m',
            },
            'urls': {
                'logo': 'https://everstrike.io/app/apple-touch-icon.png',
                'api': {
                    'public': 'https://api.everstrike.io',
                    'private': 'https://api.everstrike.io',
                },
                'test': {
                    'public': 'https://api.testnet.everstrike.io',
                    'private': 'https://api.testnet.everstrike.io',
                },
                'www': 'https://everstrike.io',
                'doc': [
                    'https://docs.everstrike.xyz/api/usage-examples',
                    'https://registry.scalar.com/@default-team-2onip/apis/everstrike-rest-api/latest',
                ],
                'fees': 'https://docs.everstrike.xyz/trading/trading-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'pairs': 1,
                        'assets': 1,
                        'ticker': 1,
                        'depth': 1,
                        'trades': 1,
                        'ohlcv': 1,
                    },
                },
                'private': {
                    'get': {
                        'personal': 1,
                        'order': 1,
                        'orders': 1,
                        'active_orders': 1,
                        'cancelled_orders': 1,
                        'completed_orders': 1,
                        'filled_orders': 1,
                        'partially_filled_orders': 1,
                        'fills': 1,
                        'triggers': 1,
                        'position': 1,
                        'active_positions': 1,
                        'completed_positions': 1,
                        'deposits': 1,
                        'withdrawals': 1,
                    },
                    'post': {
                        'auth/order': 1,
                        'auth/order/bulk': 1,
                        'auth/cancel': 1,
                        'auth/cancel/bulk': 1,
                        'auth/close': 1,
                        'leverage': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'recvWindow': undefined,
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': AuthenticationError,
                    '404': OrderNotFound,
                    '408': RequestTimeout,
                    '429': RateLimitExceeded,
                },
                'broad': {
                    'signature': AuthenticationError,
                    'hmac payload is invalid': AuthenticationError,
                    'api key': AuthenticationError,
                    'x-api-key': AuthenticationError,
                    'insufficient': InsufficientFunds,
                    'order was not found': OrderNotFound,
                    'timestamp': RequestTimeout,
                    'child "pair" fails': BadSymbol,
                    'child "qty" fails': InvalidOrder,
                    'child "price" fails': InvalidOrder,
                    'child "side" fails': InvalidOrder,
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': true,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name everstrike#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetTime (params);
        //
        //     { "code": 200, "msg": null, "result": 1794080008363 }
        //
        return this.safeInteger (response, 'result');
    }

    /**
     * @method
     * @name everstrike#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetAssets (params);
        //
        //     { "code": 200, "msg": null, "result": { "USDC": { "key": "USDC", "name": "USD Coin", "precision": 12, "withdrawable": true,
        //       "min_withdrawal": 1, "fees": { "withdrawal": 1, "deposit": 0 }, "filters": { "qty": { "min_qty": 0.1, ... } } }, ... } }
        //
        const assets = this.safeDict (response, 'result', {});
        const ids = Object.keys (assets);
        const result: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            const currencyId = ids[i];
            const asset = this.safeDict (assets, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            if (code === undefined) {
                continue;
            }
            const fees = this.safeDict (asset, 'fees', {});
            const filters = this.safeDict (asset, 'filters', {});
            const qtyFilter = this.safeDict (filters, 'qty', {});
            const withdrawable = this.safeBool (asset, 'withdrawable');
            result[code] = this.safeCurrencyStructure ({
                'id': currencyId,
                'code': code,
                'name': this.safeString (asset, 'name'),
                'type': 'crypto',
                'active': undefined,
                'deposit': undefined,
                'withdraw': withdrawable,
                'fee': this.safeNumber (fees, 'withdrawal'),
                'precision': this.parseNumber (this.parsePrecision (this.safeString (asset, 'display_precision'))),
                'limits': {
                    'amount': {
                        'min': this.safeNumber (qtyFilter, 'min_qty'),
                        'max': this.safeNumber (qtyFilter, 'max_qty'),
                    },
                    'withdraw': {
                        'min': this.safeNumber (asset, 'min_withdrawal'),
                        'max': undefined,
                    },
                },
                'networks': {},
                'info': asset,
            });
        }
        return result;
    }

    /**
     * @method
     * @name everstrike#fetchMarkets
     * @description retrieves data on all markets for everstrike
     * @see https://registry.scalar.com/@default-team-2onip/apis/everstrike-rest-api/latest
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetPairs (params);
        //
        //     { "code": 200, "msg": null, "result": { "USD_BTC_PERP": { "key": "USD_BTC_PERP", "base": "USD", "quote": "BTC",
        //       "category": "future", "contract": "PERP", "status": "TRADING", "active": true, "commission_maker": 0, "commission_taker": 0,
        //       "filters": { "price": { "filter_type": "PRICE_FILTER", "tick_size": 1e-10, ... }, "qty": { "filter_type": "LOT_SIZE", ... },
        //       "leverage": { "max_qty": 100, ... } }, ... }, ... } }
        //
        const pairs = this.safeDict (response, 'result', {});
        const ids = Object.keys (pairs);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const market = this.safeDict (pairs, ids[i], {});
            result.push (this.parseMarket (market));
        }
        return result;
    }

    override parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'key');
        const category = this.safeString (market, 'category');
        const filters = this.safeDict (market, 'filters', {});
        const priceFilter = this.safeDict (filters, 'price', {});
        const qtyFilter = this.safeDict (filters, 'qty', {});
        const leverageFilter = this.safeDict (filters, 'leverage', {});
        const status = this.safeString (market, 'status');
        const isActive = (status === 'TRADING') && this.safeBool (market, 'active', true);
        const isSpot = (category === 'spot');
        const isOption = (category === 'call') || (category === 'put');
        let baseId = undefined;
        let quoteId = undefined;
        let base = undefined;
        let quote = undefined;
        let settle = undefined;
        let settleId = undefined;
        let symbol = undefined;
        let marketType = 'spot';
        let optionType = undefined;
        let strikeMultiplier = undefined;
        if (isSpot) {
            baseId = this.safeString (market, 'base');
            quoteId = this.safeString (market, 'quote');
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        } else {
            // derivatives are keyed quote-first, e.g. USD_BTC_PERP has base=USD, quote=BTC in the raw data;
            // the unified market flips that so the underlying is the base and USD (evUSD) is quote and settle
            quoteId = this.safeString (market, 'base');
            baseId = this.safeStringN (market, [ 'underlier', 'quote' ]);
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            settleId = quoteId;
            settle = quote;
            symbol = base + '/' + quote + ':' + settle;
            marketType = 'swap';
            if (isOption) {
                marketType = 'option';
                optionType = (category === 'call') ? 'call' : 'put';
                // floating strike: EMA100(index) x price_multiplier; plain BTCCALL/BTCPUT have no multiplier field and are 1.00
                strikeMultiplier = this.safeString (market, 'price_multiplier', '1');
                const optionLetter = (optionType === 'call') ? 'C' : 'P';
                symbol = symbol + '-PERP-' + this.numberToString (this.parseNumber (strikeMultiplier)) + '-' + optionLetter;
            }
        }
        const isContract = !isSpot;
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': isSpot,
            'margin': false,
            'swap': (marketType === 'swap'),
            'future': false,
            'option': isOption,
            'active': isActive,
            'contract': isContract,
            'linear': isContract ? true : undefined,
            'inverse': isContract ? false : undefined,
            'taker': this.safeNumber (market, 'commission_taker'),
            'maker': this.safeNumber (market, 'commission_maker'),
            'contractSize': isContract ? this.parseNumber ('1') : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': optionType,
            'precision': {
                'amount': this.safeNumber (qtyFilter, 'tick_size'),
                'price': this.safeNumber (priceFilter, 'tick_size'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (leverageFilter, 'max_qty'),
                },
                'amount': {
                    'min': this.safeNumber (qtyFilter, 'min_qty'),
                    'max': this.safeNumber (qtyFilter, 'max_qty'),
                },
                'price': {
                    'min': this.safeNumber (priceFilter, 'min_price'),
                    'max': this.safeNumber (priceFilter, 'max_price'),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name everstrike#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        // the ticker endpoint is not wrapped in { code, msg, result }:
        //
        //     { "last_price": 75134.9, "open_price": 75695.5, "high_price": null, "low_price": 75592.2, "bid_price": 26666, "ask_price": 81224.2,
        //       "bid_qty": 0.036, "ask_qty": 0.0009, "base_volume": 0, "quote_volume": 0, "index_price": 75743.3, "mark_price": 75366.5,
        //       "funding_rate": -0.0045, "open_interest": 0.0176, "close_time": 1793993580000, ... }
        //
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name everstrike#fetchTickers
     * @description fetches price tickers for multiple markets
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const symbolsNormalized = this.marketSymbols (symbols);
        const response = await this.publicGetTicker (params);
        //
        //     { "USD_BTCCALL85_PERP": {}, "USD_BTCCALL90_PERP": { "last_price": 37.32, ... }, ... }
        //
        const ids = Object.keys (response);
        const result: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            const marketId = ids[i];
            const raw = this.safeDict (response, marketId, {});
            // the exchange returns empty objects for retired keys that are no longer in /pairs
            if ((this.markets_by_id === undefined) || !(marketId in this.markets_by_id) || (Object.keys (raw).length === 0)) {
                continue;
            }
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (raw, market);
            result[market['symbol']] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbolsNormalized);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'close_time');
        const last = this.safeString (ticker, 'last_price');
        // price_change from the exchange is not reliable (observed nonsense values), so change/percentage are derived from open and last by safeTicker
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high_price'),
            'low': this.safeString (ticker, 'low_price'),
            'bid': this.safeString (ticker, 'bid_price'),
            'bidVolume': this.safeString (ticker, 'bid_qty'),
            'ask': this.safeString (ticker, 'ask_price'),
            'askVolume': this.safeString (ticker, 'ask_qty'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open_price'),
            'close': last,
            'last': last,
            'previousClose': this.safeString (ticker, 'prev_last_price'),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name everstrike#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     { "code": 200, "msg": null, "result": { "bids": [ { "price": "26666", "qty": 0.0009 }, ... ],
        //       "asks": [ { "price": "81224", "qty": 0.036 }, ... ], "last_price": 0.0000133094 } }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrderBook (result, market['symbol'], undefined, 'bids', 'asks', 'price', 'qty');
    }

    /**
     * @method
     * @name everstrike#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'pair': market['id'],
        };
        request = this.addTimeRange (request, since, limit, params);
        const query = this.omit (params, 'until');
        const response = await this.publicGetTrades (this.extend (request, query));
        //
        //     { "code": 200, "msg": null, "result": [ { "pair": "USD_BTC_PERP", "is_buyer_maker": true, "qty": 0.0001, "price": 75134.9,
        //       "id": "db12e520d96c11f1b6f429295d96c8d7", "time": 1793919698034 } ] }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    addTimeRange (request: Dict, since: Int, limit: Int, params: Dict): Dict {
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['end'] = until;
        }
        return request;
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public trade
        //
        //     { "pair": "USD_BTC_PERP", "is_buyer_maker": true, "is_best_match": true, "qty": 0.0001, "price": 75134.9,
        //       "id": "db12e520d96c11f1b6f429295d96c8d7", "time": 1793919698034, "date": "2026-11-05T23:01:38.108Z" }
        //
        // private fill (from /fills or order.fills): same core fields plus order id, side and commission when present
        //
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        let side = this.safeStringLower (trade, 'side');
        const isBuyerMaker = this.safeBool (trade, 'is_buyer_maker');
        if ((side === undefined) && (isBuyerMaker !== undefined)) {
            // the taker sold into a resting bid when the buyer was the maker
            side = isBuyerMaker ? 'sell' : 'buy';
        }
        let fee = undefined;
        const feeCost = this.safeString2 (trade, 'net_commission', 'commission');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'net_commission_asset', market['settle'])),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString2 (trade, 'order_id', 'order'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name everstrike#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents (the public API serves 5m candles)
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '5m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'pair': market['id'],
        };
        request = this.addTimeRange (request, since, limit, params);
        const query = this.omit (params, 'until');
        const response = await this.publicGetOhlcv (this.extend (request, query));
        //
        //     { "code": 200, "msg": null, "result": [ { "interval": "5m", "open": 75134.9, "high": 75134.9, "low": 75134.9, "close": 75134.9,
        //       "base_volume": 0, "quote_volume": 0, "open_time": 1794079500000, "close_time": 1794079800000, ... } ] }
        //
        // the endpoint returns newest first
        //
        const result = this.safeList (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'open_time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'base_volume'),
        ];
    }

    /**
     * @method
     * @name everstrike#fetchFundingRate
     * @description fetch the current funding rate (perpetual futures and perpetual options pay funding hourly)
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchFundingRate() does not support spot markets');
        }
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseFundingRate (response, market);
    }

    /**
     * @method
     * @name everstrike#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const symbolsNormalized = this.marketSymbols (symbols);
        const response = await this.publicGetTicker (params);
        const ids = Object.keys (response);
        const result: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            const marketId = ids[i];
            const raw = this.safeDict (response, marketId, {});
            if ((this.markets_by_id === undefined) || !(marketId in this.markets_by_id) || (Object.keys (raw).length === 0)) {
                continue;
            }
            const market = this.safeMarket (marketId);
            if (market['spot']) {
                continue;
            }
            const rate = this.parseFundingRate (raw, market);
            result[market['symbol']] = rate;
        }
        return this.indexBy (this.filterByArray (result, 'symbol', symbolsNormalized, false), 'symbol');
    }

    override parseFundingRate (ticker: any, market: Market = undefined): FundingRate {
        //
        //     { "funding_rate": -0.0045, "funding_avg": -0.00397, "mark_price": 75366.5, "index_price": 75743.3, "close_time": 1793993580000, ... }
        //
        const timestamp = this.safeInteger (ticker, 'close_time');
        const marketInfo = this.safeDict (market, 'info', {});
        const interval = this.safeInteger (marketInfo, 'funding_interval', 3600000);
        let nextFundingTimestamp = undefined;
        if (timestamp !== undefined) {
            nextFundingTimestamp = this.sum (timestamp - (timestamp % interval), interval);
        }
        return {
            'info': ticker,
            'symbol': this.safeString (market, 'symbol'),
            'markPrice': this.safeNumber (ticker, 'mark_price'),
            'indexPrice': this.safeNumber (ticker, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (ticker, 'funding_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '1h',
        } as FundingRate;
    }

    /**
     * @method
     * @name everstrike#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetPersonal (params);
        //
        //     { "code": 200, "msg": null, "result": { "actions": { ... }, "balances": { "USD": { "free": 0, "locked": 0, "withdrawn": 0,
        //       "welcome": 0, "pnl": 0, "margin": 0, "fees": 0, "credited": 0, "deposited": 0, "llm": 0.075 }, ... } } }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseBalance (result);
    }

    override parseBalance (response: Dict): Balances {
        const balances = this.safeDict (response, 'balances', {});
        const result: Dict = {
            'info': response,
        };
        const ids = Object.keys (balances);
        for (let i = 0; i < ids.length; i++) {
            const currencyId = ids[i];
            const balance = this.safeDict (balances, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            if (code === undefined) {
                continue;
            }
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            // "locked" is collateral held by open orders; "margin" is collateral held by open positions
            account['used'] = Precise.stringAdd (this.safeString (balance, 'locked', '0'), this.safeString (balance, 'margin', '0'));
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name everstrike#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base asset you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered
     * @param {bool} [params.postOnly] true to only add liquidity
     * @param {bool} [params.reduceOnly] true to only reduce a position
     * @param {float} [params.leverage] leverage for the position
     * @param {bool} [params.is_test] true to validate the order without placing it
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        const response = await this.privatePostAuthOrder (request);
        //
        //     { "code": 200, "msg": null, "result": { "order": { "id": "781a8e80393f11e98e2643f8c5a993ce", "pair": "USD_BTCCALL_PERP",
        //       "price": 200, "qty_orig": 0.02225, "qty_remaining": 0.02225, "qty_filled": 0, "side": "SELL", "status": "ACTIVE",
        //       "time": 1551128037224, "time_in_force": "GTC", "type": "LIMIT", ... } } }
        //
        const result = this.safeDict (response, 'result', {});
        const order = this.safeDict (result, 'order', result);
        return this.parseOrder (order, market);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Dict {
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'side': side.toUpperCase (),
            'qty': this.amountToPrecision (symbol, amount),
        };
        const isMarket = (type === 'market');
        if (!isMarket) {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for ' + type + ' orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            request['trigger_price'] = this.priceToPrecision (symbol, triggerPrice);
        }
        const postOnly = this.isPostOnly (isMarket, false, params);
        if (postOnly) {
            request['post_only'] = true;
        }
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only');
        if (reduceOnly) {
            request['reduce_only'] = true;
        }
        const leverage = this.safeString (params, 'leverage');
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        const query = this.omit (params, [ 'triggerPrice', 'stopPrice', 'reduceOnly', 'reduce_only', 'leverage', 'postOnly', 'timeInForce' ]);
        return this.extend (request, query);
    }

    /**
     * @method
     * @name everstrike#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in (unused)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privatePostAuthCancel (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        const order = this.safeDict (result, 'order', result);
        return this.parseOrder (order);
    }

    /**
     * @method
     * @name everstrike#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol (unused)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        // the server re-serialises arrays with indexed keys and verifies the signature against that form,
        // so the body must be ids%5B0%5D=a&ids%5B1%5D=b; repeated ids= or ids[]= fail the HMAC check
        const request: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            request['ids[' + i.toString () + ']'] = ids[i];
        }
        const response = await this.privatePostAuthCancelBulk (this.extend (request, params));
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result);
    }

    /**
     * @method
     * @name everstrike#cancelAllOrders
     * @description cancel all open orders (the exchange cancels across all markets)
     * @param {string} [symbol] unified market symbol, only used to filter the returned orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAuthCancelBulk (params);
        const result = this.safeList (response, 'result', []);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (result, market);
    }

    /**
     * @method
     * @name everstrike#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in (unused)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'id': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result);
    }

    async ordersFromEndpoint (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        request = this.addTimeRange (request, since, limit, params);
        const query = this.omit (params, 'until');
        const response = await this[method] (this.extend (request, query));
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    /**
     * @method
     * @name everstrike#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const rows = await this.ordersFromEndpoint ('privateGetOrders', symbol, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Order[];
    }

    /**
     * @method
     * @name everstrike#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const rows = await this.ordersFromEndpoint ('privateGetActiveOrders', symbol, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Order[];
    }

    /**
     * @method
     * @name everstrike#fetchClosedOrders
     * @description fetches information on fully filled orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const rows = await this.ordersFromEndpoint ('privateGetCompletedOrders', symbol, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Order[];
    }

    /**
     * @method
     * @name everstrike#fetchCanceledOrders
     * @description fetches information on cancelled orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const rows = await this.ordersFromEndpoint ('privateGetCancelledOrders', symbol, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Order[];
    }

    /**
     * @method
     * @name everstrike#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        request = this.addTimeRange (request, since, limit, params);
        const query = this.omit (params, 'until');
        const response = await this.privateGetFills (this.extend (request, query));
        const result = this.safeList (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'ACTIVE': 'open',
            'PENDING': 'open',
            'UNTRIGGERED': 'open',
            'COMPLETED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     { "id": "781a8e80393f11e98e2643f8c5a993ce", "fills": [], "pair": "USD_BTCCALL_PERP", "price": 200, "price_orig": 200,
        //       "qty_orig": 0.02225, "qty_orig_usd": 3.09956993634425, "qty_remaining": 0.02225, "qty_filled": 0, "side": "SELL",
        //       "status": "ACTIVE", "time": 1551128037224, "time_in_force": "GTC", "type": "LIMIT", "oco": null, "icebergs": null,
        //       "trigger_price": null, "trigger_event": null, "close_on_trigger": false, "reduce_only": false, "post_only": false, "hidden": false }
        //
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'time');
        const fills = this.safeList (order, 'fills', []);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.safeStringLower (order, 'type'),
            'timeInForce': this.safeString (order, 'time_in_force'),
            'postOnly': this.safeBool (order, 'post_only'),
            'reduceOnly': this.safeBool (order, 'reduce_only'),
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString2 (order, 'price_orig', 'price'),
            'triggerPrice': this.safeString (order, 'trigger_price'),
            'amount': this.safeString (order, 'qty_orig'),
            'filled': this.safeString (order, 'qty_filled'),
            'remaining': this.safeString (order, 'qty_remaining'),
            'cost': undefined,
            'average': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': fills,
        }, market);
    }

    /**
     * @method
     * @name everstrike#fetchPositions
     * @description fetch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const symbolsNormalized = this.marketSymbols (symbols);
        const response = await this.privateGetActivePositions (params);
        //
        // the exchange returns an entry for every derivative market, including flat ones (size 0), which are skipped:
        //
        //     { "code": 200, "msg": null, "result": { "USD_BTCCALL90_PERP": { "id": "8d4f...", "pair": "USD_BTCCALL90_PERP", "free": 0,
        //       "locked": 0, "size": 0, "initial": 0, "realized": 0, "funding": 0, "fees": 0, "cum_pnl": 0, ... }, ... } }
        //
        const positions = this.safeDict (response, 'result', {});
        const ids = Object.keys (positions);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const position = this.safeDict (positions, ids[i], {});
            const size = this.safeString (position, 'size', '0');
            if (Precise.stringEq (size, '0')) {
                continue;
            }
            result.push (this.parsePosition (position));
        }
        return this.filterByArrayPositions (result, 'symbol', symbolsNormalized);
    }

    override parsePosition (position: Dict, market: Market = undefined) {
        const marketId = this.safeString (position, 'pair');
        market = this.safeMarket (marketId, market);
        const size = this.safeString (position, 'size');
        let side = undefined;
        if (size !== undefined) {
            side = Precise.stringLt (size, '0') ? 'short' : 'long';
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'id'),
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.safeNumber (position, 'initial'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'unrealizedPnl': undefined,
            'realizedPnl': this.safeNumber (position, 'realized'),
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': market['contractSize'],
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': 'cross',
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'hedged': false,
        });
    }

    /**
     * @method
     * @name everstrike#fetchTradingFees
     * @description fetch the trading fees for all markets (maker and taker are 0% on every market; read from the market data)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const symbols = this.symbols;
        const result: Dict = {};
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            result[symbol] = this.parseTradingFee (this.safeDict (market, 'info', {}), market);
        }
        return result;
    }

    /**
     * @method
     * @name everstrike#fetchTradingFee
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    override async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        return this.parseTradingFee (market['info'], market);
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        // a pair from /pairs:  { "key": "USD_BTC_PERP", "commission_maker": 0, "commission_taker": 0, ... }
        //
        const marketId = this.safeString (fee, 'key');
        return {
            'info': fee,
            'symbol': this.safeSymbol (marketId, market),
            'maker': this.safeNumber (fee, 'commission_maker'),
            'taker': this.safeNumber (fee, 'commission_taker'),
            'percentage': true,
            'tierBased': false,
        };
    }

    /**
     * @method
     * @name everstrike#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://registry.scalar.com/@default-team-2onip/apis/everstrike-rest-api/latest
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const rows = await this.transactionsFromEndpoint ('privateGetDeposits', 'deposit', code, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Transaction[];
    }

    /**
     * @method
     * @name everstrike#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://registry.scalar.com/@default-team-2onip/apis/everstrike-rest-api/latest
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const rows = await this.transactionsFromEndpoint ('privateGetWithdrawals', 'withdrawal', code, since, limit, params);
        const items = this.safeList ({ 'items': rows }, 'items', []);
        return items as Transaction[];
    }

    /**
     * @method
     * @name everstrike#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        const deposits = await this.fetchDeposits (code, undefined, undefined, params);
        const withdrawals = await this.fetchWithdrawals (code, undefined, undefined, params);
        const all = this.arrayConcat (deposits, withdrawals);
        const sorted = this.sortBy (all, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit);
    }

    async transactionsFromEndpoint (method: string, type: string, code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        // the endpoints take no filters, so currency, since and limit are applied client-side
        const response = await this[method] (params);
        //
        //     { "code": 200, "msg": null, "result": [ { "id": "ETH0x4bab...a7c3", "customer_id": "5f9c...8e19", "asset": "ETH",
        //       "address": "0x90d1...", "time": 1551120600023, "qty": 0.1, "net": 0.1, "status": "COMPLETED", "qty_usd": 14.3,
        //       "manually_approved": true, "transaction": { "hash": "0x...", "from": "0x..." } } ] }
        //
        const result = this.safeList (response, 'result', []);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const transactions = [];
        for (let i = 0; i < result.length; i++) {
            const transaction = this.extend (result[i], { 'type': type });
            transactions.push (transaction);
        }
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'PENDING': 'pending',
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // see transactionsFromEndpoint; "type" is added by that method, the exchange does not return it
        //
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'time');
        const tx = this.safeDict (transaction, 'transaction', {});
        const gross = this.safeString (transaction, 'qty');
        const net = this.safeString (transaction, 'net');
        let fee = undefined;
        if ((gross !== undefined) && (net !== undefined)) {
            fee = {
                'cost': this.parseNumber (Precise.stringSub (gross, net)),
                'currency': code,
            };
        }
        const transactionType = this.safeString (transaction, 'type');
        const address = this.safeString (transaction, 'address');
        const fromAddress = this.safeString (tx, 'from');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (tx, 'hash'),
            'type': transactionType,
            'currency': code,
            'network': undefined,
            // amount is the gross quantity; the exchange's fee is qty - net
            'amount': this.parseNumber (gross),
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressFrom': fromAddress,
            'addressTo': address,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
        } as Transaction;
    }

    /**
     * @method
     * @name everstrike#setLeverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    override async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'leverage': leverage,
        };
        const response = await this.privatePostLeverage (this.extend (request, params));
        const result = this.safeDict ({ 'result': response }, 'result', {});
        return result;
    }

    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        let url = this.urls['api'][apiName] + '/' + path;
        let body: Str = undefined;
        if (apiName === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': undefined };
        }
        this.checkRequiredCredentials ();
        const headers: Dict = {
            'x-api-key': this.apiKey,
        };
        if (method === 'GET') {
            // read-only account endpoints authenticate with the API key header alone
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            // write endpoints: HMAC-SHA256 over the exact form-urlencoded body, base64-encoded, in x-signature
            // /leverage is signed but rejects a timestamp field ("\"timestamp\" is not allowed")
            let request: Dict = params;
            if (path !== 'leverage') {
                request = this.extend ({
                    'timestamp': this.milliseconds (),
                }, params);
                const recvWindow = this.safeInteger (this.options, 'recvWindow');
                if ((recvWindow !== undefined) && !('recv_window' in request)) {
                    request['recv_window'] = recvWindow;
                }
            }
            body = this.urlencode (request);
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            headers['x-signature'] = this.hmac (this.encode (body), this.encode (this.secret), sha256, 'base64');
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str) {
        if (response === undefined) {
            return undefined;
        }
        //
        // application errors use "msg", request-validation errors use "message":
        //
        //     { "code": 403, "msg": "Missing API key.", "result": null }
        //     { "code": 404, "msg": "The order was not found: abc", "result": null }
        //     { "code": 400, "message": "Bad request: child \"x-api-key\" fails because [...]", "context": { "failing_part": "headers", "failing_keys": [ "x-api-key" ] } }
        //     { "code": 400, "message": "Bad request: child \"pair\" fails because [\"pair\" must be one of [...]]", "context": { ... } }
        //
        const code = this.safeString (response, 'code');
        if ((code === undefined) || (code === '200')) {
            return undefined;
        }
        const message = this.safeString2 (response, 'msg', 'message', '');
        const feedback = this.id + ' ' + body;
        // message text is more specific than the numeric code (e.g. a malformed key is reported as 400)
        this.throwBroadlyMatchedException (this.exceptions['broad'], message.toLowerCase (), feedback);
        this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
        throw new ExchangeError (feedback);
    }
}
