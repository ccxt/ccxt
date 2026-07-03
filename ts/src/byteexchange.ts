//  ---------------------------------------------------------------------------
import Exchange from './abstract/byteexchange.js';
import { ExchangeError, AuthenticationError, InsufficientFunds, InvalidNonce, BadSymbol, PermissionDenied, RateLimitExceeded, InvalidOrder } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, int, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction } from './base/types.js';
//  ---------------------------------------------------------------------------

/**
 * @class byteexchange
 * @augments Exchange
 */
export default class byteexchange extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'byteexchange',
            'name': 'Byte Exchange',
            'countries': [ 'EE' ], // Estonia
            'version': 'v1',
            'rateLimit': 34, // published limit is 30 req/s per IP / per key
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingRate': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://bexc.io/favicon-512.png',
                'api': {
                    'public': 'https://bexc.io',
                    'private': 'https://bexc.io',
                },
                'www': 'https://bexc.io',
                'doc': [
                    'https://bexc.io/api-docs',
                ],
                'fees': 'https://bexc.io/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/markets': 1,
                        'api/v1/currencies': 1,
                        'api/v1/ticker': 1,
                        'api/v1/ticker/24h': 1,
                        'api/v1/orderbook/{symbol}': 1,
                        'api/v1/trades/{symbol}': 1,
                        'api/v1/klines': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/order/{id}': 1,
                        'api/v1/orders': 1,
                        'api/v1/trades/my': 1,
                        'api/v1/wallet/balances': 1,
                        'api/v1/deposit-address/{currency}': 1,
                        'api/v1/deposits': 1,
                        'api/v1/wallet/withdrawals': 1,
                    },
                    'post': {
                        'api/v1/order': 1,
                        'api/v1/order/cancel': 1,
                        'api/v1/wallet/withdraw': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'recvWindow': 10, // server accepts a +/-10s timestamp window
            },
            'exceptions': {
                'exact': {
                    'Insufficient balance': InsufficientFunds,
                    'Invalid API key': AuthenticationError,
                    'Invalid signature': AuthenticationError,
                    'Timestamp expired (±10s window)': InvalidNonce,
                    'Signature replay detected': InvalidNonce,
                    'Market not found': BadSymbol,
                    'Market is not active': BadSymbol,
                    'IP address not in whitelist': PermissionDenied,
                    'API key rate limit exceeded': RateLimitExceeded,
                },
                'broad': {
                    'precision': InvalidOrder,
                    'minimum': InvalidOrder,
                    'maximum': InvalidOrder,
                },
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // message   = timestamp + METHOD + path + bodyHash   (concatenated, no separators)
        // timestamp = unix seconds (server accepts a +/-10s window)
        // path      = request path only, the query string is excluded
        // bodyHash  = sha256 hex of the body for POST/PUT/PATCH, otherwise ''
        // key       = sha256 hex of the api secret (not the raw secret)
        // signature = hmac sha256 hex (key, message)
        const endpoint = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + endpoint;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            let bodyHash = '';
            if ((method === 'POST') || (method === 'PUT') || (method === 'PATCH')) {
                body = this.json (query);
                bodyHash = this.hash (this.encode (body), sha256, 'hex');
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            const secretHash = this.hash (this.encode (this.secret), sha256, 'hex');
            const message = timestamp + method + endpoint + bodyHash;
            const signature = this.hmac (this.encode (message), this.encode (secretHash), sha256, 'hex');
            headers = {
                'X-BEXC-API-KEY': this.apiKey,
                'X-BEXC-TIMESTAMP': timestamp,
                'X-BEXC-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
            if (bodyHash.length > 0) {
                headers['X-BEXC-BODY-HASH'] = bodyHash;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name byteexchange#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetApiV1Markets (params);
        const markets = this.safeList (response, 'markets', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "base_asset": "BTC",
        //         "quote_asset": "USDT",
        //         "is_active": true,
        //         "maker_fee": "0.001000",
        //         "taker_fee": "0.002000",
        //         "min_quantity": "0.000100000000000000",
        //         "price_precision": "2",
        //         "quantity_precision": "6"
        //     }
        //
        const id = this.safeString (market, 'symbol'); // e.g. 'BTC_USDT'
        const baseId = this.safeString (market, 'base_asset');
        const quoteId = this.safeString (market, 'quote_asset');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const active = this.safeBool (market, 'is_active');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': 'spot',
            'spot': true,
            'active': active,
            'maker': this.safeNumber (market, 'maker_fee'),
            'taker': this.safeNumber (market, 'taker_fee'),
            'precision': {
                'amount': this.safeInteger (market, 'quantity_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'min_quantity'),
                    'max': undefined,
                },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'info': market,
        });
    }

    /**
     * @method
     * @name byteexchange#fetchCurrencies
     * @description fetches all available currencies on the exchange
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetApiV1Currencies (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const networksRaw = this.safeList (currency, 'networks', []);
            const networks: Dict = {};
            for (let j = 0; j < networksRaw.length; j++) {
                const net = networksRaw[j];
                const networkId = this.safeString (net, 'id');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'active': this.safeBool (net, 'active'),
                    'deposit': this.safeBool (net, 'deposit'),
                    'withdraw': this.safeBool (net, 'withdraw'),
                    'fee': this.safeNumber (net, 'fee'),
                    'info': net,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'active': this.safeBool (currency, 'active'),
                'deposit': this.safeBool (currency, 'deposit'),
                'withdraw': this.safeBool (currency, 'withdraw'),
                'fee': this.safeNumber (currency, 'fee'),
                'precision': this.safeInteger (currency, 'precision'),
                'networks': networks,
                'info': currency,
            });
        }
        return result;
    }

    /**
     * @method
     * @name byteexchange#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of fee structures indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.publicGetApiV1Markets (params);
        const markets = this.safeList (response, 'markets', []);
        const result: Dict = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'symbol');
            const symbol = this.safeSymbol (marketId);
            result[symbol] = {
                'info': market,
                'symbol': symbol,
                'maker': this.safeNumber (market, 'maker_fee'),
                'taker': this.safeNumber (market, 'taker_fee'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    /**
     * @method
     * @name byteexchange#fetchTickers
     * @description fetches price tickers for multiple markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of ticker structures
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetApiV1Ticker (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    /**
     * @method
     * @name byteexchange#fetchTicker
     * @description fetches a price ticker for a single market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a ticker structure
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (tickers, symbol) as Ticker;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "base_asset": "BTC",
        //         "quote_asset": "USDT",
        //         "symbol": "BTC_USDT",
        //         "last_price": "65000.00",
        //         "high_24h": "66000.00",
        //         "low_24h": "64000.00",
        //         "change_24h": "1.5",
        //         "volume_24h": "123.45",
        //         "quote_volume_24h": "8000000.00"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high_24h'),
            'low': this.safeString (ticker, 'low_24h'),
            'bid': undefined,
            'ask': undefined,
            'last': last,
            'close': last,
            'percentage': this.safeString (ticker, 'change_24h'),
            'baseVolume': this.safeString (ticker, 'volume_24h'),
            'quoteVolume': this.safeString (ticker, 'quote_volume_24h'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name byteexchange#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of order book structures indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetApiV1OrderbookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'quantity');
    }

    /**
     * @method
     * @name byteexchange#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of trade structures
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetApiV1TradesSymbol (this.extend (request, params));
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "id": "t1",
        //         "symbol": "BTC_USDT",
        //         "price": "65000.00",
        //         "quantity": "0.01",
        //         "taker_side": "buy",
        //         "created_at": "2026-06-03T19:53:09.494Z"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const id = this.safeString (trade, 'id');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const side = this.safeStringLower (trade, 'taker_side');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name byteexchange#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetApiV1Klines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "open_time": 1780509600000,
        //         "open": "65000.00",
        //         "high": "65500.00",
        //         "low": "64800.00",
        //         "close": "65200.00",
        //         "volume": "10.5",
        //         "close_time": 1780513199999,
        //         "quote_volume": "0",
        //         "trade_count": 5
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'open_time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name byteexchange#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a balance structure
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetApiV1WalletBalances (params);
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        //
        //     {
        //         "balances": [
        //             { "symbol": "BTC", "available": "1.0", "locked": "0.5", "total": "1.5" },
        //             { "symbol": "USDT", "available": "1000.0", "locked": "0", "total": "1000.0" }
        //         ]
        //     }
        //
        const balances = this.safeList (response, 'balances', []);
        const result: Dict = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name byteexchange#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side,
            'order_type': type,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostApiV1Order (this.extend (request, params));
        const order = this.safeDict (response, 'order', response);
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name byteexchange#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = { 'order_id': id };
        const response = await this.privatePostApiV1OrderCancel (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name byteexchange#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order structure
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request: Dict = { 'id': id };
        const response = await this.privateGetApiV1OrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name byteexchange#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of order structures
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
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
        const response = await this.privateGetApiV1Orders (this.extend (request, params));
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name byteexchange#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of order structures
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'open') as Order[];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "id": "1",
        //         "symbol": "BTC_USDT",
        //         "side": "buy",
        //         "order_type": "limit",
        //         "price": "50000.00",
        //         "quantity": "1.0",
        //         "filled_quantity": "0.0",
        //         "avg_fill_price": "0",
        //         "status": "open",
        //         "created_at": "2026-06-03T19:53:09.494Z"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const amount = this.safeString2 (order, 'quantity', 'amount');
        const filled = this.safeString2 (order, 'filled_quantity', 'filled');
        const price = this.safeString (order, 'price');
        const average = this.safeString2 (order, 'avg_fill_price', 'average');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.safeStringLower2 (order, 'order_type', 'type'),
            'side': this.safeStringLower (order, 'side'),
            'price': price,
            'amount': amount,
            'filled': filled,
            'average': average,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'partially_filled': 'open',
            'PartiallyFilled': 'open',
            'filled': 'closed',
            'Filled': 'closed',
            'closed': 'closed',
            'canceled': 'canceled',
            'cancelled': 'canceled',
            'Cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name byteexchange#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of trade structures
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        const response = await this.privateGetApiV1TradesMy (this.extend (request, params));
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name byteexchange#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an address structure
     */
    async fetchDepositAddress (code: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = { 'currency': currency['id'] };
        const response = await this.privateGetApiV1DepositAddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'network': this.networkIdToCode (this.safeString (response, 'network')),
            'address': address,
            'tag': this.safeString (response, 'tag'),
        };
    }

    /**
     * @method
     * @name byteexchange#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of transaction structures
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetApiV1Deposits (this.extend (request, params));
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    /**
     * @method
     * @name byteexchange#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of transaction structures
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.privateGetApiV1WalletWithdrawals (this.extend (request, params));
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' });
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "id": "d1",
        //         "txid": "0xabc0000000000000000000000000000000000000000000000000000000000001",
        //         "timestamp": 1766145344000,
        //         "currency": "USDT",
        //         "network": "ethereum",
        //         "address": "0x1234567890abcdef1234567890abcdef12345678",
        //         "type": "deposit",
        //         "amount": 200,
        //         "status": "ok"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.networkIdToCode (this.safeString (transaction, 'network')),
            'address': this.safeString (transaction, 'address'),
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.safeString (transaction, 'type'),
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': undefined,
        } as Transaction;
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'ok': 'ok',
            'pending': 'pending',
            'failed': 'failed',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name byteexchange#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] a memo or tag for the withdrawal where required
     * @see https://bexc.io/api-docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a transaction structure
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
            'amount': this.numberToString (amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostApiV1WalletWithdraw (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
