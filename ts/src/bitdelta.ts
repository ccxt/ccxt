
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitdelta.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';
import { TICK_SIZE } from './base/functions/number.js';
import { AuthenticationError, ExchangeError, BadRequest, InsufficientFunds, InvalidOrder, OrderNotFound, RateLimitExceeded, PermissionDenied, ArgumentsRequired } from './base/errors.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitdelta
 * @augments Exchange
 */
export default class bitdelta extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bitdelta',
            'name': 'BitDelta',
            'countries': [ 'SC' ],
            'rateLimit': 120,
            'version': 'v1',
            'certified': false,
            'pro': false,
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
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '8h': '480',
                '12h': '720',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://media.bitdelta.com/web-assets/production-ab8e18ef4ebe/rebranding/light/logo.svg',
                'api': {
                    'public': 'https://api.bitdelta.com',
                    'private': 'https://public-api.bitdelta.com',
                },
                'www': 'https://bitdelta.com',
                'doc': [
                    'https://api-docs.bitdelta.com/',
                ],
                'fees': 'https://bitdelta.com/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'open/api/v1/pairs': 1,
                        'open/api/v1/ticker': 1,
                        'open/api/v1/assets': 1,
                        'open/api/v1/summary': 1,
                        'open/api/v1/orderbook': 1,
                        'open/api/v1/trades': 1,
                        'open/api/v1/tradingview/history': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/balance': 1,
                        'api/v1/open-orders': 1,
                        'api/v1/order-history': 1,
                        'api/v1/order': 1,
                        'api/v1/trade-history': 1,
                        'api/v1/sl-orders': 1,
                        'api/v1/transaction': 1,
                    },
                    'post': {
                        'api/v1/limit-order': 1,
                        'api/v1/market-order': 1,
                        'api/v1/sl-order': 1,
                        'api/v1/generate-address': 1,
                    },
                    'put': {
                        'api/v1/cancel-order': 1,
                        'api/v1/cancel-slorder': 1,
                        'api/v1/cancel-all-order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.0015'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': OrderNotFound,
                    '406': AuthenticationError,
                    '429': RateLimitExceeded,
                    '500': ExchangeError,
                    '503': ExchangeError,
                },
                'broad': {
                    'insufficient': InsufficientFunds,
                    'invalid': InvalidOrder,
                    'not found': OrderNotFound,
                },
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
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 10,
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
                        'limit': 10,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 20,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 300,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'options': {
                'defaultType': 'spot',
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bitdelta#fetchMarkets
         * @description retrieves data on all markets for bitdelta
         * @see https://api-docs.bitdelta.com/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetOpenApiV1Pairs (params);
        const markets = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            result.push (this.parseMarket (market));
        }
        return result;
    }

    parseMarket (market: any): Market {
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'currency1');
        const quoteId = this.safeString (market, 'currency2');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const status = this.safeString (market, 'status');
        const active = (status === 'trading');
        const makerFee = this.safeNumber (market, 'mfee');
        let maker = undefined;
        if (makerFee !== undefined) {
            maker = makerFee / 100;
        }
        const takerFee = this.safeNumber (market, 'tfee');
        let taker = undefined;
        if (takerFee !== undefined) {
            taker = takerFee / 100;
        }
        return {
            'id': id,
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
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'bamount'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'group_precision'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minBuyTradeAmt'),
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
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitdelta#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api-docs.bitdelta.com/
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOpenApiV1Pairs (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const ticker = this.safeDict (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name bitdelta#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api-docs.bitdelta.com/
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetOpenApiV1Pairs (params);
        const data = this.safeList (response, 'data', []);
        const tickers = [];
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            tickers.push (ticker);
        }
        return this.filterByArrayTickers (tickers, 'symbol', symbols);
    }

    parseTicker (ticker: any, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'last');
        const open = this.safeString (ticker, 'open');
        const high = this.safeString (ticker, 'high');
        const low = this.safeString (ticker, 'low');
        // note: highest_bid and lowest_ask from the API are actually 24h high/low, not real bid/ask
        const bid = undefined;
        const ask = undefined;
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'quote_volume');
        const percentage = this.safeString (ticker, 'change');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitdelta#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api-docs.bitdelta.com/
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'level': 2,
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOpenApiV1Orderbook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 0, 1);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitdelta#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://api-docs.bitdelta.com/
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOpenApiV1Trades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: any, market: Market = undefined): Trade {
        //
        // public trades from /open/api/v1/trades
        //     { "trade_id": "408536883", "price": "87.39", "base_volume": "0.01", "quote_volume": "0.8739", "timestamp": "1686037555756", "type": "Sell" }
        //
        // private trades from /api/v1/trade-history
        //     { "id": "403223533", "tradeid": "47232424615", "ordertype": "m", "feecoin": "BTC", "p": 26408.55, "q": 0.0005, "fee": "0.0000006", "s": 1, "symbol": "BTCUSDT", "currency1": "BTC", "currency2": "USDT", "timestamp": "2023-05-25T14:47:29.764Z", "feeString": "0.0198 BDTPOINT" }
        //
        const tradeId = this.safeString2 (trade, 'trade_id', 'id');
        let timestamp = undefined;
        const timestampString = this.safeString (trade, 'timestamp');
        if (timestampString !== undefined) {
            if (timestampString.indexOf ('T') >= 0) {
                timestamp = this.parse8601 (timestampString);
            } else {
                timestamp = this.safeInteger (trade, 'timestamp');
            }
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let side = undefined;
        const typeField = this.safeString (trade, 'type');
        if (typeField !== undefined) {
            side = (typeField === 'Buy') ? 'buy' : 'sell';
        }
        const sideInt = this.safeInteger (trade, 's');
        if (sideInt !== undefined) {
            side = (sideInt === 0) ? 'buy' : 'sell';
        }
        const priceString = this.safeString2 (trade, 'price', 'p');
        const amountString = this.safeString2 (trade, 'base_volume', 'q');
        const costString = this.safeString (trade, 'quote_volume');
        let fee = undefined;
        const feeString = this.safeString (trade, 'fee');
        if (feeString !== undefined) {
            const feeCoin = this.safeString (trade, 'feecoin');
            fee = {
                'cost': feeString,
                'currency': this.safeCurrencyCode (feeCoin),
            };
        }
        const orderType = this.safeString (trade, 'ordertype');
        let type = undefined;
        if (orderType !== undefined) {
            type = this.parseOrderType (orderType);
        }
        const orderId = this.safeString (trade, 'tradeid');
        return this.safeTrade ({
            'id': tradeId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitdelta#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api-docs.bitdelta.com/
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const now = this.seconds ();
        if (limit === undefined) {
            limit = 300;
        }
        request['countback'] = limit;
        if (since !== undefined) {
            request['from'] = this.parseToInt (since / 1000);
            const duration = this.parseTimeframe (timeframe);
            request['to'] = request['from'] + limit * duration;
        } else {
            request['to'] = now;
            const duration = this.parseTimeframe (timeframe);
            request['from'] = now - limit * duration;
        }
        const response = await this.publicGetOpenApiV1TradingviewHistory (this.extend (request, params));
        //
        // TradingView format (column-oriented):
        //     { "s": "ok", "t": ["1773313200", ...], "o": [70414.64, ...], "h": [...], "l": [...], "c": [...], "v": [...] }
        //
        const timestamps = this.safeList (response, 't', []);
        const opens = this.safeList (response, 'o', []);
        const highs = this.safeList (response, 'h', []);
        const lows = this.safeList (response, 'l', []);
        const closes = this.safeList (response, 'c', []);
        const volumes = this.safeList (response, 'v', []);
        const result = [];
        for (let i = 0; i < timestamps.length; i++) {
            const ts = this.safeInteger (timestamps, i);
            const timestamp = (ts !== undefined) ? ts * 1000 : undefined;
            result.push ([
                timestamp,
                this.safeNumber (opens, i),
                this.safeNumber (highs, i),
                this.safeNumber (lows, i),
                this.safeNumber (closes, i),
                this.safeNumber (volumes, i),
            ]);
        }
        return this.filterBySinceLimit (result, since, limit, 0, true) as OHLCV[];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitdelta#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://api-docs.bitdelta.com/
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetApiV1Balance (params);
        const balances = this.safeList (response, 'data', []);
        return this.parseBalance (balances);
    }

    parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const total = this.safeString (balance, 'amount');
            const used = this.safeString (balance, 'inorder');
            account['total'] = total;
            account['used'] = used;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitdelta#createOrder
         * @description create a trade order
         * @see https://api-docs.bitdelta.com/
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const sideNum = (side === 'buy') ? 0 : 1;
        const request: Dict = {
            'symbol': market['id'],
            'side': sideNum,
            'amount': this.amountToPrecision (symbol, amount),
        };
        let response = undefined;
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            response = await this.privatePostApiV1LimitOrder (this.extend (request, params));
        } else if (type === 'market') {
            response = await this.privatePostApiV1MarketOrder (this.extend (request, params));
        } else {
            throw new InvalidOrder (this.id + ' createOrder() does not support order type ' + type + ', only limit and market orders are supported');
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitdelta#cancelOrder
         * @description cancels an open order
         * @see https://api-docs.bitdelta.com/
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'buy' or 'sell' - required by the exchange
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const sideRaw = this.safeValue (params, 'side');
        if (sideRaw === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a side parameter ("buy" or "sell")');
        }
        let side = undefined;
        if ((sideRaw === 'buy') || (sideRaw === 0)) {
            side = 0;
        } else if ((sideRaw === 'sell') || (sideRaw === 1)) {
            side = 1;
        } else {
            throw new BadRequest (this.id + ' cancelOrder() side parameter must be "buy", "sell", 0, or 1');
        }
        const request: Dict = {
            'trade_id': id,
            'side': side,
        };
        params = this.omit (params, 'side');
        const response = await this.privatePutApiV1CancelOrder (this.extend (request, params));
        return this.parseOrder (response, undefined);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitdelta#cancelAllOrders
         * @description cancel all open orders
         * @see https://api-docs.bitdelta.com/
         * @param {string} [symbol] not used by bitdelta cancelAllOrders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePutApiV1CancelAllOrder (params);
        return [ this.parseOrder (response) ];
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name bitdelta#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://api-docs.bitdelta.com/
         * @param {string} id the order id
         * @param {string} symbol not used by bitdelta fetchOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'buy' or 'sell' - required by the exchange
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const sideRaw = this.safeValue (params, 'side');
        if (sideRaw === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a side parameter ("buy" or "sell")');
        }
        let side = undefined;
        if ((sideRaw === 'buy') || (sideRaw === 0)) {
            side = 0;
        } else if ((sideRaw === 'sell') || (sideRaw === 1)) {
            side = 1;
        } else {
            throw new BadRequest (this.id + ' fetchOrder() side parameter must be "buy", "sell", 0, or 1');
        }
        const request: Dict = {
            'order_id': id,
            'side': side,
        };
        params = this.omit (params, 'side');
        const response = await this.privateGetApiV1Order (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        const order = this.safeDict (data, 0, {});
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitdelta#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://api-docs.bitdelta.com/
         * @param {string} [symbol] unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetApiV1OpenOrders (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitdelta#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://api-docs.bitdelta.com/
         * @param {string} [symbol] unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetApiV1OrderHistory (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const orders = this.safeList (data, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order: any, market: Market = undefined): Order {
        //
        // createOrder response
        //     { "order_id": "2267993162" }
        //
        // open-orders / order-history / order response
        //     { "id": "47321330932", "symbol": "BTCUSDT", "mfee": 0.15, "tfee": 0.15, "timestamp": "2023-06-06T09:59:06.206Z", "p": "26000", "q": 0.00124, "oq": 0.00124, "type": "l", "s": 1, "total": "32.24 USDT", "status": "Pending", "avgprice": "26000", "filled": 0, "filled_amount": 0 }
        //
        const orderId = this.safeString2 (order, 'id', 'order_id');
        const timestampString = this.safeString (order, 'timestamp');
        let timestamp = undefined;
        if (timestampString !== undefined) {
            timestamp = this.parse8601 (timestampString);
        }
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const typeId = this.safeString (order, 'type');
        const type = this.parseOrderType (typeId);
        const sideInt = this.safeInteger (order, 's');
        let side = undefined;
        if (sideInt !== undefined) {
            side = (sideInt === 0) ? 'buy' : 'sell';
        }
        const price = this.safeString2 (order, 'p', 'avgprice');
        const amount = this.safeString (order, 'oq');
        const remaining = this.safeString (order, 'q');
        const filledAmount = this.safeString (order, 'filled_amount');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const average = this.safeString (order, 'avgprice');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filledAmount,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': average,
        }, market);
    }

    parseOrderStatus (status: Str): string {
        const statuses: Dict = {
            'Pending': 'open',
            'Filled': 'closed',
            'Cancelled': 'canceled',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): string {
        const types: Dict = {
            'm': 'market',
            'l': 'limit',
            'sl': 'limit',
        };
        return this.safeString (types, type, type);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitdelta#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://api-docs.bitdelta.com/
         * @param {string} [symbol] unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetApiV1TradeHistory (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitdelta#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://api-docs.bitdelta.com/
         * @param {string} [code] unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {
            'type': 'deposit',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetApiV1Transaction (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const transactions = this.safeList (data, 'result', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitdelta#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://api-docs.bitdelta.com/
         * @param {string} [code] unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {
            'type': 'withdrawal',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.privateGetApiV1Transaction (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        const transactions = this.safeList (data, 'result', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransaction (transaction: any, currency = undefined): Transaction {
        //
        //     { "id": 12158, "coin": "USDT", "amount": "50", "type": "deposit", "status": "Completed", "txhash": "Internal transfer", "txid": "Internal transfer", "timestamp": "2023-05-01T13:29:52.923Z", "fee": 0 }
        //
        const id = this.safeString (transaction, 'id');
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'timestamp'));
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const txid = this.safeString (transaction, 'txid');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'address': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status: Str): string {
        const statuses: Dict = {
            'Completed': 'ok',
            'Pending': 'pending',
            'Failed': 'failed',
            'Cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
            }
            headers = {
                'x-api-key': this.apiKey,
                'secret-key': this.secret,
                'Content-Type': 'application/json',
                'Accept-Language': 'en',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: any, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        const statusCode = this.safeInteger (response, 'statusCode');
        if (statusCode === undefined) {
            return undefined;
        }
        if ((statusCode === 200) || (statusCode === 201)) {
            return undefined;
        }
        const message = this.safeString (response, 'message', '');
        const statusText = this.safeString (response, 'statusText', '');
        const feedback = this.id + ' ' + body;
        const statusCodeString = this.safeString (response, 'statusCode');
        this.throwExactlyMatchedException (this.exceptions['exact'], statusCodeString, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], statusText, feedback);
        throw new ExchangeError (feedback);
    }
}
