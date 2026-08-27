//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitpandafusion.js';
import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Balances, Currencies, CurrencyInterface, Dict, Endpoint, int, Int, List, Market, NullableDict, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitpandafusion
 * @augments Exchange
 */
export default class bitpandafusion extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitpandafusion',
            'name': 'Bitpanda Fusion',
            'countries': [ 'AT' ],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'ws': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            'urls': {
                'api': {
                    'public': 'https://api.fusion.bitpanda.com',
                    'private': 'https://api.fusion.bitpanda.com',
                },
                'www': 'https://www.bitpanda.com/fusion',
                'doc': 'https://docs.fusion.bitpanda.com/',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/time': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/tickers': { 'cost': 1 } as Endpoint<List>,
                        'v1/pairs': { 'cost': 1 } as Endpoint<List>,
                        'v1/orderbook/{pair}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/candles/{pair}': { 'cost': 1 } as Endpoint<List>,
                        'v1/assets': { 'cost': 1 } as Endpoint<List>,
                    },
                },
                'private': {
                    'get': {
                        'v1/account': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/balances': { 'cost': 1 } as Endpoint<List>,
                        'v1/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/orders/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/account/trades/{tradeId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'v1/account/orders/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
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
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1440,
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name bitpandafusion#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.fusion.bitpanda.com/get-server-time-4295526e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetV1Time (params);
        return this.safeInteger (response, 'epochMs');
    }

    /**
     * @method
     * @name bitpandafusion#fetchMarkets
     * @description retrieves data on all markets for Bitpanda Fusion
     * @see https://docs.fusion.bitpanda.com/get-trading-pairs-4295528e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1Pairs (params);
        return this.parseMarkets (response);
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseMarket
     * @description parses an exchange market into a CCXT market structure
     * @param {object} market exchange market
     * @returns {object} a CCXT market structure
     */
    override parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'pair');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return this.safeMarketStructure ({
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
                'amount': this.safeNumber (market, 'sizeIncrement'),
                'price': this.safeNumber (market, 'tickSize'),
                'cost': this.safeNumber (market, 'amountIncrement'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': this.safeNumber (market, 'maxOrderSize'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'minOrderAmount'),
                    'max': this.safeNumber (market, 'maxOrderAmount'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name bitpandafusion#fetchCurrencies
     * @description fetches all available currencies on Bitpanda Fusion
     * @see https://docs.fusion.bitpanda.com/get-assets-4295529e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetV1Assets (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = this.parseCurrency (response[i]);
            result[currency['code']] = currency;
        }
        return result;
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseCurrency
     * @description parses an exchange currency into a CCXT currency structure
     * @param {object} currency exchange currency
     * @returns {object} a CCXT currency structure
     */
    override parseCurrency (currency: Dict): CurrencyInterface {
        const id = this.safeString (currency, 'symbol');
        const code = this.safeCurrencyCode (id);
        return this.safeCurrencyStructure ({
            'id': id,
            'code': code,
            'precision': undefined,
            'type': this.safeString (currency, 'type'),
            'name': this.safeString (currency, 'name'),
            'active': true,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': {},
            'info': currency,
        });
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseTicker
     * @description parses a ticker from the exchange
     * @param {object} ticker exchange ticker
     * @param {object} [market] market structure
     * @returns {object} a CCXT ticker structure
     */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'pair');
        const resolvedMarket = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'symbol': resolvedMarket['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bitpandafusion#fetchTicker
     * @description fetches a price ticker, whose last field contains Bitpanda Fusion's documented current mid price
     * @see https://docs.fusion.bitpanda.com/get-tickers-4295527e0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a ticker structure
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicGetV1Tickers (this.extend (request, params));
        const ticker = this.safeDict (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name bitpandafusion#fetchTickers
     * @description fetches price tickers, whose last fields contain Bitpanda Fusion's documented current mid prices
     * @see https://docs.fusion.bitpanda.com/get-tickers-4295527e0
     * @param {string[]} [symbols] unified symbols of the markets to fetch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of ticker structures indexed by market symbols
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['pair'] = marketIds.join (',');
        }
        const response = await this.publicGetV1Tickers (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name bitpandafusion#fetchOrderBook
     * @description fetches information on open orders with bid and ask prices, volumes and other data
     * @see https://docs.fusion.bitpanda.com/get-orderbook-4205406e0
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum number of order book entries to return, between 1 and 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order book structure
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetV1OrderbookPair (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseOHLCV
     * @description parses an OHLCV entry from the exchange
     * @param {object} ohlcv exchange OHLCV entry
     * @param {object} [market] market structure
     * @returns {object} a CCXT OHLCV structure
     */
    override parseOHLCV (ohlcv: Dict, market: Market = undefined): OHLCV {
        const seconds = this.safeString (ohlcv, 'timestamp');
        const timestamp = this.parseToInt (Precise.stringMul (seconds, '1000'));
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name bitpandafusion#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.fusion.bitpanda.com/get-candles-4311313e0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return, between 1 and 1440
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of OHLCV candle structures
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            const sinceSeconds = this.parseToInt (Precise.stringDiv (this.numberToString (since), '1000'));
            if (limit === undefined) {
                request['from'] = sinceSeconds;
            } else {
                const duration = this.parseTimeframe (timeframe);
                const span = Precise.stringMul (this.numberToString (duration), this.numberToString (limit));
                request['to'] = this.parseToInt (Precise.stringAdd (this.numberToString (sinceSeconds), span));
            }
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1CandlesPair (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name bitpandafusion#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.fusion.bitpanda.com/get-account-balances-4204527e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a balance structure
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetV1AccountBalances (params);
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const free = this.safeString (balance, 'available');
            const used = this.safeString (balance, 'locked');
            if (code !== undefined) {
                result[code] = {
                    'free': this.parseNumber (free),
                    'used': this.parseNumber (used),
                    'total': this.parseNumber (Precise.stringAdd (free, used)),
                };
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseTradingFee
     * @description parses the uniform account fee into a CCXT trading fee structure. The live API returns camelCase fields and a decimal fee rate for QuoteCurrency mode, while the documented legacy response uses snake_case fields and a percentage value.
     * @param {object} response exchange account response
     * @param {string} [symbol] unified market symbol
     * @returns {object} a CCXT trading fee structure
     */
    parseTradingFee (response: Dict, symbol: Str = undefined): TradingFeeInterface {
        const tier = this.safeDict2 (response, 'currentTier', 'current_tier', {});
        const feeString = this.safeString (tier, 'fee');
        const feeMode = this.safeStringLower2 (tier, 'feeMode', 'fee_mode');
        let fee = this.parseNumber (feeString);
        if (feeMode === 'percentage') {
            fee = this.parseNumber (Precise.stringDiv (feeString, '100'));
        }
        return {
            'info': response,
            'symbol': symbol,
            'maker': fee,
            'taker': fee,
            'percentage': true,
            'tierBased': true,
        };
    }

    /**
     * @method
     * @name bitpandafusion#fetchTradingFee
     * @description fetches the account's trading fee for a market
     * @see https://docs.fusion.bitpanda.com/get-account-4295525e0
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a trading fee structure
     */
    override async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.privateGetV1Account (params);
        return this.parseTradingFee (response, market['symbol']);
    }

    /**
     * @method
     * @name bitpandafusion#fetchTradingFees
     * @description fetches the account's uniform trading fee for all markets
     * @see https://docs.fusion.bitpanda.com/get-account-4295525e0
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of trading fee structures indexed by market symbols
     */
    override async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.privateGetV1Account (params);
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = this.parseTradingFee (response, symbol);
        }
        return result;
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseOrderStatus
     * @description parses an exchange order status into a CCXT order status
     * @param {string} status exchange order status
     * @returns {string} a CCXT order status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'new': 'open',
            'partially-filled': 'open',
            'closed': 'closed',
            'filled': 'closed',
            'canceled': 'canceled',
            'filled-and-canceled': 'canceled',
            'done-for-day': 'expired',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseOrder
     * @description parses an exchange order into a CCXT order structure
     * @param {object} order exchange order
     * @param {object} [market] market structure
     * @returns {object} a CCXT order structure
     */
    override parseOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 'pair');
        const resolvedMarket = this.safeMarket (marketId, market);
        const amountString = this.safeString (order, 'quantity');
        const filledString = this.safeString (order, 'filledQuantity');
        let remainingString: Str = undefined;
        if ((amountString !== undefined) && (filledString !== undefined)) {
            remainingString = Precise.stringSub (amountString, filledString);
        }
        const feeData = this.safeDict (order, 'fee');
        let fee: any = undefined;
        if (feeData !== undefined) {
            const feeCost = this.safeNumber (feeData, 'amount');
            const feeCurrency = this.safeString2 (feeData, 'currency', 'symbol');
            if ((feeCost !== undefined) || (feeCurrency !== undefined)) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        let lastTradeTimestamp: Int = undefined;
        if ((filledString !== undefined) && Precise.stringGt (filledString, '0')) {
            lastTradeTimestamp = this.parse8601 (this.safeString (order, 'executedAt'));
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': this.parse8601 (this.safeString (order, 'updatedAt')),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': resolvedMarket['symbol'],
            'type': this.safeStringLower (order, 'type'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeNumber (order, 'limitPrice'),
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
            'cost': this.safeNumber (order, 'filledAmount'),
            'amount': this.parseNumber (amountString),
            'filled': this.parseNumber (filledString),
            'remaining': this.parseNumber (remainingString),
            'average': this.safeNumber (order, 'filledAveragePrice'),
            'fee': fee,
            'trades': undefined,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bitpandafusion#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.fusion.bitpanda.com/get-order-by-id-4203922e0
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetV1AccountOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name bitpandafusion#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.fusion.bitpanda.com/get-orders-4203921e0
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @param {string} [params.cursor] cursor from the previous page
     * @param {string} [params.status] exchange order status filter
     * @returns {object[]} a list of order structures
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.parseToInt (Precise.stringDiv (this.numberToString (since), '1000'));
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = this.parseToInt (Precise.stringDiv (this.numberToString (until), '1000'));
        }
        params = this.omit (params, 'until');
        const response = await this.privateGetV1AccountOrders (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name bitpandafusion#fetchOpenOrders
     * @description fetches information on currently open orders made by the user
     * @see https://docs.fusion.bitpanda.com/get-orders-4203921e0
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of order structures
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrders (symbol, since, limit, this.extend (params, { 'status': 'open' }));
    }

    /**
     * @method
     * @name bitpandafusion#fetchClosedOrders
     * @description fetches information on closed orders made by the user
     * @see https://docs.fusion.bitpanda.com/get-orders-4203921e0
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of order structures
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrders (symbol, since, limit, this.extend (params, { 'status': 'closed' }));
    }

    /**
     * @method
     * @name bitpandafusion#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost in quote currency
     * @see https://docs.fusion.bitpanda.com/create-order-4204526e0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    override async createMarketOrderWithCost (symbol: string, side: OrderSide, cost: number, params: Dict = {}): Promise<Order> {
        const request: Dict = {
            'cost': cost,
        };
        return await this.createOrder (symbol, 'market', side, 0, undefined, this.extend (request, params));
    }

    /**
     * @method
     * @name bitpandafusion#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost in quote currency
     * @see https://docs.fusion.bitpanda.com/create-order-4204526e0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    override async createMarketBuyOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createMarketOrderWithCost (symbol, 'buy', cost, params);
    }

    /**
     * @method
     * @name bitpandafusion#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost in quote currency
     * @see https://docs.fusion.bitpanda.com/create-order-4204526e0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    override async createMarketSellOrderWithCost (symbol: string, cost: number, params: Dict = {}): Promise<Order> {
        return await this.createMarketOrderWithCost (symbol, 'sell', cost, params);
    }

    /**
     * @method
     * @name bitpandafusion#createOrder
     * @description create a market or limit order
     * @see https://docs.fusion.bitpanda.com/create-order-4204526e0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] quote-currency amount for a market order; use createMarketOrderWithCost instead
     * @returns {object} an order structure
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = type.toLowerCase ();
        const orderSide = (side as string).toLowerCase ();
        if ((orderType !== 'limit') && (orderType !== 'market')) {
            throw new NotSupported (this.id + ' createOrder() supports market and limit orders only');
        }
        if ((orderSide !== 'buy') && (orderSide !== 'sell')) {
            throw new InvalidOrder (this.id + ' createOrder() side must be buy or sell');
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            throw new NotSupported (this.id + ' createOrder() does not support clientOrderId');
        }
        const triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            throw new NotSupported (this.id + ' createOrder() does not support trigger orders');
        }
        const request: Dict = {
            'pair': market['id'],
            'side': this.capitalize (orderSide),
            'type': this.capitalize (orderType),
        };
        const cost = this.safeString (params, 'cost');
        if (cost === undefined) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else {
            if (orderType !== 'market') {
                throw new InvalidOrder (this.id + ' createOrder() quote-currency cost is supported for market orders only');
            }
            request['amount'] = this.costToPrecision (symbol, cost);
        }
        if (orderType === 'limit') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price for limit orders');
            }
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        params = this.omit (params, [ 'clientOrderId', 'client_order_id', 'triggerPrice', 'stopPrice', 'cost' ]);
        const response = await this.privatePostV1AccountOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bitpandafusion#cancelOrder
     * @description cancels an open order
     * @see https://docs.fusion.bitpanda.com/cancel-order-by-id-4203923e0
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateDeleteV1AccountOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#parseTrade
     * @description parses an exchange trade into a CCXT trade structure
     * @param {object} trade exchange trade
     * @param {object} [market] market structure
     * @returns {object} a CCXT trade structure
     */
    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 'pair');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'executedAt'));
        const feeData = this.safeDict (trade, 'fee');
        let fee: any = undefined;
        if (feeData !== undefined) {
            fee = {
                'cost': this.safeNumber (feeData, 'amount'),
                'currency': this.safeString2 (feeData, 'currency', 'symbol'),
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolvedMarket['symbol'],
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeNumber (trade, 'price'),
            'amount': this.safeNumber2 (trade, 'quantity', 'amount'),
            'cost': this.safeNumber2 (trade, 'totalAmount', 'total'),
            'fee': fee,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bitpandafusion#fetchMyTrades
     * @description fetches all trades made by the user
     * @see https://docs.fusion.bitpanda.com/get-trades-4203920e0
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.cursor] cursor from the previous page
     * @param {string} [params.orderId] filter by exchange order id
     * @returns {object[]} a list of trade structures
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = this.parseToInt (Precise.stringDiv (this.numberToString (since), '1000'));
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = this.parseToInt (Precise.stringDiv (this.numberToString (until), '1000'));
        }
        params = this.omit (params, 'until');
        const response = await this.privateGetV1AccountTrades (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#sign
     * @description signs an API request using the required x-api-key header
     * @returns {object} signed request
     */
    override sign (path: string, api: string = 'public', method: string = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        this.checkRequiredCredentials ();
        const baseUrl = this.urls['api'][api];
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let requestHeaders: Dict = {
            'Accept': 'application/json',
            'x-api-key': this.apiKey,
        };
        if (headers !== undefined) {
            requestHeaders = this.extend (requestHeaders, headers);
        }
        if (method === 'POST') {
            requestHeaders['Content-Type'] = 'application/json';
            body = this.json (query);
        } else if (this.isEmpty (query) === false) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': requestHeaders };
    }

    /**
     * @method
     * @ignore
     * @name bitpandafusion#handleErrors
     * @description handles HTTP errors returned by Bitpanda Fusion
     * @returns {void}
     */
    override handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any) {
        if (statusCode < 400) {
            return undefined;
        }
        const feedback = this.id + ' ' + responseBody;
        if (statusCode === 401) {
            throw new AuthenticationError (feedback);
        } else if (statusCode === 403) {
            throw new PermissionDenied (feedback);
        } else if (statusCode === 429) {
            throw new RateLimitExceeded (feedback);
        } else if (statusCode === 422) {
            if ((method === 'POST') && (url.indexOf ('/v1/account/orders') >= 0)) {
                throw new InvalidOrder (feedback);
            }
            throw new BadRequest (feedback);
        } else if (statusCode === 404) {
            if (url.indexOf ('/v1/account/orders/') >= 0) {
                throw new OrderNotFound (feedback);
            }
            if ((url.indexOf ('/v1/orderbook/') >= 0) || (url.indexOf ('/v1/candles/') >= 0)) {
                throw new BadSymbol (feedback);
            }
            throw new ExchangeError (feedback);
        } else if ((statusCode === 409) && (method === 'DELETE')) {
            throw new InvalidOrder (feedback);
        }
        throw new ExchangeError (feedback);
    }
}
