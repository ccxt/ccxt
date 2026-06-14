
// ---------------------------------------------------------------------------

import Exchange from './abstract/o2.js';
import { ExchangeError, AuthenticationError, BadSymbol, InsufficientFunds, InvalidOrder, OrderNotFound, RateLimitExceeded, BadRequest, ExchangeNotAvailable } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Balances, Currencies, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, Transaction, Num, Dict, Strings, int, Tickers } from './base/types.js';

// ---------------------------------------------------------------------------

export default class o2 extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'o2',
            'name': 'O2 Exchange',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 200,
            'certified': false,
            'pro': true,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
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
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://o2.app/logo.png',
                'api': {
                    'public': 'https://api.o2.app',
                    'private': 'https://api.o2.app',
                },
                'test': {
                    'public': 'https://api.testnet.o2.app',
                    'private': 'https://api.testnet.o2.app',
                },
                'www': 'https://o2.app',
                'doc': [
                    'https://docs.o2.app',
                ],
                'fees': 'https://docs.o2.app',
            },
            'api': {
                'public': {
                    'get': {
                        'health': 1,
                        'v1/markets': 1,
                        'v1/aggregated/coingecko/tickers': 1,
                        'v1/aggregated/summary': 1,
                        'v1/aggregated/assets': 1,
                        'v1/aggregated/orderbook': 1,
                        'v1/aggregated/coingecko/orderbook': 1,
                        'v1/aggregated/trades': 1,
                        'v1/aggregated/ticker': 1,
                        'v1/bars': 1,
                        'v1/depth': 1,
                        'v1/trades': 1,
                        'v1/markets/ticker': 1,
                        'v1/markets/summary': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/balance': 1,
                        'v1/orders': 1,
                        'v1/order': 1,
                        'v1/trades_by_account': 1,
                        'v1/accounts': 1,
                    },
                    'post': {
                        'v1/session/actions': 1,
                        'v1/accounts': 1,
                        'v1/accounts/withdraw': 1,
                    },
                    'put': {
                        'v1/session': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.0001'),
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
                'wBTC': 'WBTC',
            },
            'exceptions': {
                'exact': {
                    '1000': ExchangeError,
                    '1003': RateLimitExceeded,
                    '2000': BadSymbol,
                    '3000': OrderNotFound,
                    '4000': AuthenticationError,
                    '4001': AuthenticationError,
                    '4002': AuthenticationError,
                    '7004': BadRequest,
                },
                'broad': {
                    'NotEnoughBalance': InsufficientFunds,
                    'PricePrecision': InvalidOrder,
                    'RateLimitExceeded': RateLimitExceeded,
                    'MarketNotFound': BadSymbol,
                    'OrderNotFound': OrderNotFound,
                },
            },
            'options': {
                'sessionExpiryDays': 7,
                'defaultType': 'spot',
            },
        });
    }

    async fetchStatus (params = {}): Promise<Dict> {
        /**
         * @method
         * @name o2#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a status structure
         */
        const response = await this.publicGetHealth (params);
        const isOk = (response !== undefined);
        return {
            'status': isOk ? 'ok' : 'maintenance',
            'updated': this.milliseconds (),
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    stripHexPrefix (hex: string): string {
        if ((hex.length > 2) && (hex[0] === '0') && (hex[1] === 'x')) {
            return hex.slice (2);
        }
        return hex;
    }

    powerOfTen (exponent: number): string {
        let result = '1';
        for (let i = 0; i < exponent; i++) {
            result = Precise.stringMul (result, '10');
        }
        return result;
    }

    scaleChainToHuman (chainValue: Str, decimals: number): Str {
        // convert chain integer string to human-readable decimal
        // human = chainInt / 10^decimals
        if (chainValue === undefined) {
            return undefined;
        }
        const divisor = this.powerOfTen (decimals);
        return Precise.stringDiv (chainValue, divisor);
    }

    scaleHumanToChain (value: string, decimals: number, maxPrecision: number): string {
        // scale human decimal to chain integer:
        // 1. multiply by 10^decimals to get raw chain value
        // 2. truncate to precision grid: round down to nearest 10^(decimals - maxPrecision)
        const multiplier = this.powerOfTen (decimals);
        const scaled = Precise.stringMul (value, multiplier);
        // truncate any decimal part
        let intPart = scaled;
        const dotIndex = scaled.indexOf ('.');
        if (dotIndex >= 0) {
            intPart = scaled.slice (0, dotIndex);
        }
        // truncate to precision grid
        const truncFactor = decimals - maxPrecision;
        if (truncFactor > 0) {
            const truncDiv = this.powerOfTen (truncFactor);
            const divided = Precise.stringDiv (intPart, truncDiv, 0);
            const divDot = divided.indexOf ('.');
            const intDivided = (divDot >= 0) ? divided.slice (0, divDot) : divided;
            return Precise.stringMul (intDivided, truncDiv);
        }
        return intPart;
    }

    stringToHex (str: string): string {
        // convert UTF-8 string to hex using transpile-safe base methods
        const binary = this.encode (str);
        return this.binaryToBase16 (binary);
    }

    u64BE (value: string): string {
        // encode a numeric string as u64 big-endian (16 hex chars)
        // manual hex conversion via repeated division (transpiler-safe, no BigInt)
        let val = value;
        if (val === '0') {
            return '0000000000000000';
        }
        let hex = '';
        const isNegative = (val[0] === '-');
        if (isNegative) {
            val = val.slice (1);
        }
        while (Precise.stringGt (val, '0')) {
            const remainder = Precise.stringMod (val, '16');
            const remDot = remainder.indexOf ('.');
            const remInt = (remDot >= 0) ? remainder.slice (0, remDot) : remainder;
            const remNum = this.safeInteger ({ 'v': remInt }, 'v', 0);
            const digits = '0123456789abcdef';
            hex = digits[remNum] + hex;
            const divided = Precise.stringDiv (val, '16', 0);
            const divDot = divided.indexOf ('.');
            val = (divDot >= 0) ? divided.slice (0, divDot) : divided;
        }
        // pad to 16 hex chars
        hex = hex.padStart (16, '0');
        return hex;
    }

    functionSelectorHex (name: string): string {
        // Fuel ABI function selector: u64_be(len(name)) + hex(name)
        const nameHex = this.stringToHex (name);
        const lenHex = this.u64BE (this.numberToString (name.length));
        return lenHex + nameHex;
    }

    findAssetId (code: string): Str {
        const marketsInfo = this.safeList (this.options, 'marketsInfo', []);
        for (let i = 0; i < marketsInfo.length; i++) {
            const marketInfo = marketsInfo[i];
            const baseInfo = this.safeDict (marketInfo, 'base', {});
            const quoteInfo = this.safeDict (marketInfo, 'quote', {});
            if (this.safeString (baseInfo, 'symbol') === code) {
                return this.safeString (baseInfo, 'asset');
            }
            if (this.safeString (quoteInfo, 'symbol') === code) {
                return this.safeString (quoteInfo, 'asset');
            }
        }
        return undefined;
    }

    getMarketDecimals (market: Market): any {
        const info = this.safeDict (market, 'info', {});
        const baseInfo = this.safeDict (info, 'base', {});
        const quoteInfo = this.safeDict (info, 'quote', {});
        return {
            'baseDecimals': this.safeInteger (baseInfo, 'decimals', 9),
            'baseMaxPrecision': this.safeInteger (baseInfo, 'max_precision', 0),
            'quoteDecimals': this.safeInteger (quoteInfo, 'decimals', 9),
            'quoteMaxPrecision': this.safeInteger (quoteInfo, 'max_precision', 0),
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name o2#fetchMarkets
         * @description retrieves data on all markets for o2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Market[]} an array of objects representing market data
         */
        const response = await this.publicGetV1Markets (params);
        const markets = this.safeList (response, 'markets', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseInfo = this.safeDict (market, 'base', {});
            const quoteInfo = this.safeDict (market, 'quote', {});
            const baseId = this.safeString (baseInfo, 'symbol');
            const quoteId = this.safeString (quoteInfo, 'symbol');
            // skip markets with empty symbols (testnet garbage data)
            if ((baseId === undefined) || (baseId === '') || (quoteId === undefined) || (quoteId === '')) {
                continue;
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const marketId = this.safeString (market, 'market_id');
            const baseMaxPrecision = this.safeInteger (baseInfo, 'max_precision', 0);
            const quoteMaxPrecision = this.safeInteger (quoteInfo, 'max_precision', 0);
            const makerFeeRaw = this.safeString (market, 'maker_fee', '0');
            const takerFeeRaw = this.safeString (market, 'taker_fee', '0');
            const makerFee = Precise.stringDiv (makerFeeRaw, '1000000');
            const takerFee = Precise.stringDiv (takerFeeRaw, '1000000');
            result.push ({
                'id': marketId,
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
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber (takerFee),
                'maker': this.parseNumber (makerFee),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.numberToString (baseMaxPrecision))),
                    'price': this.parseNumber (this.parsePrecision (this.numberToString (quoteMaxPrecision))),
                },
                'limits': {
                    'leverage': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'created': undefined,
                'info': market,
            } as Market);
        }
        return result;
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name o2#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetV1AggregatedAssets (params);
        const ids = Object.keys (response);
        const result: Dict = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = this.safeDict (response, id, {});
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'deposit': this.safeBool (currency, 'can_deposit'),
                'withdraw': this.safeBool (currency, 'can_withdraw'),
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': this.safeNumber (currency, 'min_withdraw'), 'max': undefined },
                    'deposit': { 'min': this.safeNumber (currency, 'min_deposit'), 'max': undefined },
                },
                'networks': {},
                'info': currency,
            };
        }
        return result;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name o2#fetchTickers
         * @description fetches price tickers for multiple markets
         * @param {string[]} [symbols] unified symbols of the markets to fetch tickers for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of ticker structures
         */
        await this.loadMarkets ();
        const response = await this.publicGetV1AggregatedCoingeckoTickers (params);
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers (result, 'symbol', symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name o2#fetchTicker
         * @description fetches a price ticker for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a ticker structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
        };
        const response = await this.publicGetV1MarketsTicker (this.extend (request, params));
        // response is an array with one element containing chain-integer values
        const rawTicker = this.safeDict (response, 0, {});
        const decimals = this.getMarketDecimals (market);
        const quoteDecimals = decimals['quoteDecimals'];
        const baseDecimals = decimals['baseDecimals'];
        const timestamp = this.safeInteger (rawTicker, 'timestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.scaleChainToHuman (this.safeString (rawTicker, 'high'), quoteDecimals),
            'low': this.scaleChainToHuman (this.safeString (rawTicker, 'low'), quoteDecimals),
            'bid': this.scaleChainToHuman (this.safeString (rawTicker, 'bid'), quoteDecimals),
            'bidVolume': this.scaleChainToHuman (this.safeString (rawTicker, 'bid_volume'), baseDecimals),
            'ask': this.scaleChainToHuman (this.safeString (rawTicker, 'ask'), quoteDecimals),
            'askVolume': this.scaleChainToHuman (this.safeString (rawTicker, 'ask_volume'), baseDecimals),
            'vwap': undefined,
            'open': this.scaleChainToHuman (this.safeString (rawTicker, 'open'), quoteDecimals),
            'close': this.scaleChainToHuman (this.safeString (rawTicker, 'close'), quoteDecimals),
            'last': this.scaleChainToHuman (this.safeString (rawTicker, 'last'), quoteDecimals),
            'previousClose': this.scaleChainToHuman (this.safeString (rawTicker, 'previous_close'), quoteDecimals),
            'change': this.scaleChainToHuman (this.safeString (rawTicker, 'change'), quoteDecimals),
            'percentage': this.safeString (rawTicker, 'percentage'),
            'average': this.scaleChainToHuman (this.safeString (rawTicker, 'average'), quoteDecimals),
            'baseVolume': this.scaleChainToHuman (this.safeString (rawTicker, 'base_volume'), baseDecimals),
            'quoteVolume': this.scaleChainToHuman (this.safeString (rawTicker, 'quote_volume'), quoteDecimals),
            'info': rawTicker,
        }, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const tickerId = this.safeString (ticker, 'ticker_id');
        let symbol = undefined;
        if (tickerId !== undefined) {
            const parts = tickerId.split ('_');
            const baseId = this.safeString (parts, 0);
            const quoteId = this.safeString (parts, 1);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
            market = this.safeMarket (tickerId, market, '_');
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'target_volume'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name o2#fetchOrderBook
         * @description fetches information on open orders with bid and ask prices
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of order book structures indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketPair = market['baseId'] + '_' + market['quoteId'];
        const request: Dict = {
            'market_pair': marketPair,
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetV1AggregatedOrderbook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bids', 'asks');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name o2#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of trade structures
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketPair = market['baseId'] + '_' + market['quoteId'];
        const request: Dict = {
            'market_pair': marketPair,
        };
        const response = await this.publicGetV1AggregatedTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeStringLower (trade, 'type');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'base_volume');
        const costString = this.safeString (trade, 'quote_volume');
        const id = this.safeString (trade, 'trade_id');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': undefined,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name o2#fetchOHLCV
         * @description fetches historical candlestick data
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
            'market_id': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['count_back'] = limit;
        }
        const now = this.milliseconds ();
        if (since === undefined) {
            request['from'] = now - 86400000;
        }
        if (!('to' in params)) {
            request['to'] = now;
        }
        const response = await this.publicGetV1Bars (this.extend (request, params));
        const bars = this.safeList (response, 'bars', []);
        return this.parseOHLCVs (bars, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        //  bars returns chain integers, scale by 10^decimals
        //  { "open": "2278400000000", "close": "2279240000000", ... }
        //
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        const decimals = this.getMarketDecimals (market);
        const quoteDecimals = decimals['quoteDecimals'];
        const baseDecimals = decimals['baseDecimals'];
        const open = this.scaleChainToHuman (this.safeString (ohlcv, 'open'), quoteDecimals);
        const high = this.scaleChainToHuman (this.safeString (ohlcv, 'high'), quoteDecimals);
        const low = this.scaleChainToHuman (this.safeString (ohlcv, 'low'), quoteDecimals);
        const close = this.scaleChainToHuman (this.safeString (ohlcv, 'close'), quoteDecimals);
        const buyVolume = this.scaleChainToHuman (this.safeString (ohlcv, 'buy_volume'), baseDecimals);
        const sellVolume = this.scaleChainToHuman (this.safeString (ohlcv, 'sell_volume'), baseDecimals);
        let volume = undefined;
        if ((buyVolume !== undefined) && (sellVolume !== undefined)) {
            volume = Precise.stringAdd (buyVolume, sellVolume);
        }
        return [
            timestamp,
            this.parseNumber (open),
            this.parseNumber (high),
            this.parseNumber (low),
            this.parseNumber (close),
            this.parseNumber (volume),
        ];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name o2#fetchBalance
         * @description query for balance and get the amount of funds available for trading
         * @see https://docs.o2.app
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a balance structure
         */
        // O2 API requires a separate request per asset
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        const result: Dict = {
            'info': {},
            'timestamp': undefined,
            'datetime': undefined,
        };
        const assetsSeen: Dict = {};
        const marketsList = this.safeList (this.options, 'marketsInfo', []);
        for (let i = 0; i < marketsList.length; i++) {
            const marketInfo = marketsList[i];
            const baseInfo = this.safeDict (marketInfo, 'base', {});
            const quoteInfo = this.safeDict (marketInfo, 'quote', {});
            const baseAsset = this.safeString (baseInfo, 'asset');
            const quoteAsset = this.safeString (quoteInfo, 'asset');
            const baseCode = this.safeCurrencyCode (this.safeString (baseInfo, 'symbol'));
            const quoteCode = this.safeCurrencyCode (this.safeString (quoteInfo, 'symbol'));
            if (assetsSeen[baseAsset] === undefined) {
                assetsSeen[baseAsset] = baseCode;
            }
            if (assetsSeen[quoteAsset] === undefined) {
                assetsSeen[quoteAsset] = quoteCode;
            }
        }
        const assetIds = Object.keys (assetsSeen);
        for (let i = 0; i < assetIds.length; i++) {
            const assetId = assetIds[i];
            const code = assetsSeen[assetId];
            const request: Dict = {
                'address': tradeAccountId,
                'asset_id': assetId,
            };
            try {
                const balanceResponse = await this.privateGetV1Balance (this.extend (request, params));
                const totalUnlocked = this.safeString (balanceResponse, 'total_unlocked', '0');
                const totalLocked = this.safeString (balanceResponse, 'total_locked', '0');
                const account = this.account ();
                account['free'] = totalUnlocked;
                account['used'] = totalLocked;
                result[code] = account;
                result['info'] = this.extend (result['info'], balanceResponse);
            } catch (e) {
                // skip assets that error
                continue;
            }
        }
        return this.safeBalance (result);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name o2#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} id the order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An order structure
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        if (market !== undefined) {
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetV1Order (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name o2#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of order structures
         */
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name o2#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of order structures
         */
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchOrdersByStatus (status: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        let market = undefined;
        const request: Dict = {
            'contract': tradeAccountId,
            'is_open': (status === 'open'),
            'direction': 'desc',
            'count': (limit !== undefined) ? limit : 50,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetV1Orders (this.extend (request, params));
        const orders = this.safeList (response, 'orders', response);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // REST /v1/orders returns chain integers for price/quantity
        //
        const id = this.safeString (order, 'order_id');
        const side = this.safeStringLower (order, 'side');
        const timestamp = this.safeInteger (order, 'timestamp');
        const isClosed = this.safeBool (order, 'close', false);
        const isCancelled = this.safeBool (order, 'cancel', false);
        const isPartiallyFilled = this.safeBool (order, 'partially_filled', false);
        let status = 'open';
        if (isCancelled) {
            status = 'canceled';
        } else if (isClosed) {
            status = 'closed';
        } else if (isPartiallyFilled) {
            status = 'open';
        }
        const rawType = this.safeString (order, 'order_type');
        let type = 'limit';
        if (rawType === 'Market') {
            type = 'market';
        }
        // scale chain integers to human-readable if market is available
        let price = this.safeString (order, 'price');
        let amount = this.safeString (order, 'quantity');
        let filled = this.safeString (order, 'quantity_fill');
        let average = this.safeString (order, 'price_fill');
        if (market !== undefined) {
            const decimals = this.getMarketDecimals (market);
            price = this.scaleChainToHuman (price, decimals['quoteDecimals']);
            amount = this.scaleChainToHuman (amount, decimals['baseDecimals']);
            filled = this.scaleChainToHuman (filled, decimals['baseDecimals']);
            average = this.scaleChainToHuman (average, decimals['quoteDecimals']);
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (undefined, market),
            'type': type,
            'timeInForce': undefined,
            'postOnly': (rawType === 'PostOnly'),
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name o2#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of trade structures
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        let market = undefined;
        const request: Dict = {
            'account': tradeAccountId,
            'direction': 'desc',
            'count': (limit !== undefined) ? limit : 50,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetV1TradesByAccount (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name o2#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {number} amount how much you want to trade
         * @param {number} [price] the price at which the order is to be fulfilled
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an order structure
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        const market = this.market (symbol);
        const decimals = this.getMarketDecimals (market);
        const quantityScaled = this.scaleHumanToChain (this.numberToString (amount), decimals['baseDecimals'], decimals['baseMaxPrecision']);
        let priceScaled = '0';
        if (price !== undefined) {
            priceScaled = this.scaleHumanToChain (this.numberToString (price), decimals['quoteDecimals'], decimals['quoteMaxPrecision']);
        }
        let orderType = 'Spot';
        if (type === 'market') {
            orderType = 'Market';
        }
        const postOnly = this.safeBool (params, 'postOnly', false);
        if (postOnly) {
            orderType = 'PostOnly';
        }
        params = this.omit (params, 'postOnly');
        const sideStr = (side === 'buy') ? 'Buy' : 'Sell';
        const actions = [
            {
                'market_id': market['id'],
                'actions': [
                    {
                        'CreateOrder': {
                            'side': sideStr,
                            'price': priceScaled,
                            'quantity': quantityScaled,
                            'order_type': orderType,
                        },
                    },
                ],
            },
        ];
        const response = await this.submitSessionActions (actions, true, params);
        const orders = this.safeList (response, 'orders', []);
        if (orders.length > 0) {
            return this.parseOrder (orders[0], market);
        }
        return this.safeOrder ({ 'info': response, 'symbol': market['symbol'] }, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name o2#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An order structure
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const marketId = (market !== undefined) ? market['id'] : this.safeString (params, 'market_id');
        if (marketId === undefined) {
            throw new BadRequest (this.id + ' cancelOrder() requires a symbol argument or market_id parameter');
        }
        const actions = [
            {
                'market_id': marketId,
                'actions': [
                    {
                        'CancelOrder': {
                            'order_id': id,
                        },
                    },
                ],
            },
        ];
        const response = await this.submitSessionActions (actions, false, params);
        const cancelSymbol = this.safeSymbol (undefined, market);
        return this.safeOrder ({
            'id': id,
            'info': response,
            'status': 'canceled',
            'symbol': cancelSymbol,
        }, market);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name o2#cancelAllOrders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of order structures
         */
        await this.loadMarkets ();
        await this.ensureSession ();
        if (symbol === undefined) {
            throw new BadRequest (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        const openOrders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        if (openOrders.length === 0) {
            return [];
        }
        const cancelActions = [];
        for (let i = 0; i < openOrders.length; i++) {
            cancelActions.push ({
                'CancelOrder': {
                    'order_id': openOrders[i]['id'],
                },
            });
        }
        // batch in groups of 5
        const result = [];
        for (let i = 0; i < cancelActions.length; i += 5) {
            const batch = cancelActions.slice (i, i + 5);
            const actions = [ { 'market_id': market['id'], 'actions': batch } ];
            await this.submitSessionActions (actions, false, params);
        }
        for (let i = 0; i < openOrders.length; i++) {
            result.push (this.extend (openOrders[i], { 'status': 'canceled' }) as Order);
        }
        return result;
    }

    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        /**
         * @method
         * @name o2#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {number} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a transaction structure
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        await this.ensureSession ();
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        const nonce = this.safeString (session, 'nonce');
        const chainId = this.safeString (this.options, 'chainId');
        const assetId = this.findAssetId (code);
        if (assetId === undefined) {
            throw new BadRequest (this.id + ' withdraw() could not find asset ID for ' + code);
        }
        const withdrawSigningBytes = this.buildWithdrawSigningBytesHex (nonce, chainId, address, assetId, this.numberToString (amount));
        const signature = this.fuelPersonalSign (this.secret, withdrawSigningBytes);
        const request: Dict = {
            'trade_account_id': tradeAccountId,
            'nonce': nonce,
            'to': address,
            'amount': this.numberToString (amount),
            'asset_id': assetId,
            'signature': { 'Secp256k1': signature },
        };
        const response = await this.privatePostV1AccountsWithdraw (this.extend (request, params));
        return this.parseTransaction (response);
    }

    parseTransaction (transaction: Dict, currency = undefined): Transaction {
        const id = this.safeString (transaction, 'tx_id');
        return {
            'info': transaction,
            'id': id,
            'txid': id,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': undefined,
            'currency': this.safeCurrencyCode (undefined, currency),
            'status': 'ok',
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        } as Transaction;
    }

    async ensureSession (): Promise<void> {
        const session = this.safeDict (this.options, 'session');
        if (session !== undefined) {
            const expiry = this.safeInteger (session, 'expiry', 0);
            const nowSeconds = this.parseToInt (this.milliseconds () / 1000);
            if ((expiry > 0) && (nowSeconds < (expiry - 300))) {
                return;
            }
        }
        await this.createSession ();
    }

    async createSession (): Promise<void> {
        this.checkRequiredCredentials ();
        const walletAddress = this.apiKey;
        // Step 1: Ensure account exists
        let accountResponse = undefined;
        try {
            accountResponse = await this.privateGetV1Accounts ({ 'owner': walletAddress, 'O2-Owner-Id': walletAddress });
        } catch (e) {
            accountResponse = await this.privatePostV1Accounts ({
                'identity': { 'Address': walletAddress },
                'O2-Owner-Id': walletAddress,
            });
        }
        // trade_account_id is at top level, nonce is inside trade_account
        const tradeAccountId = this.safeString (accountResponse, 'trade_account_id');
        const tradeAccount = this.safeDict (accountResponse, 'trade_account', {});
        const nonce = this.safeString (tradeAccount, 'nonce', '0');
        // Step 2: Fetch chain config
        const marketsResponse = await this.publicGetV1Markets ({});
        const chainId = this.safeString (marketsResponse, 'chain_id');
        const markets = this.safeList (marketsResponse, 'markets', []);
        const contractIds = [];
        for (let i = 0; i < markets.length; i++) {
            const contractId = this.safeString (markets[i], 'contract_id');
            if (contractId !== undefined) {
                contractIds.push (contractId);
            }
        }
        // Step 3: Generate session keypair (crypto-safe)
        const sessionPrivateKey = this.generateSessionKey ();
        const sessionAddress = this.deriveAddress (sessionPrivateKey);
        // Step 4: Expiry
        const expiryDays = this.safeInteger (this.options, 'sessionExpiryDays', 7);
        const expiry = this.parseToInt (this.milliseconds () / 1000) + (expiryDays * 86400);
        // Step 5: Sign session creation
        const signingBytes = this.buildSessionSigningBytesHex (nonce, chainId, sessionAddress, contractIds, this.numberToString (expiry));
        const signature = this.fuelPersonalSign (this.secret, signingBytes);
        // Step 6: Submit
        const sessionRequest: Dict = {
            'contract_id': tradeAccountId,
            'session_id': { 'Address': sessionAddress },
            'signature': { 'Secp256k1': signature },
            'contract_ids': contractIds,
            'nonce': nonce,
            'expiry': this.numberToString (expiry),
        };
        await this.privatePutV1Session (this.extend (sessionRequest, { 'O2-Owner-Id': walletAddress }));
        this.options['session'] = {
            'tradeAccountId': tradeAccountId,
            'nonce': Precise.stringAdd (nonce, '1'),
            'sessionPrivateKey': sessionPrivateKey,
            'sessionAddress': sessionAddress,
            'ownerAddress': walletAddress,
            'expiry': expiry,
        };
        this.options['chainId'] = chainId;
        this.options['marketsInfo'] = markets;
    }

    async submitSessionActions (actions: any[], collectOrders = false, params = {}): Promise<any> {
        const session = this.safeDict (this.options, 'session', {});
        const tradeAccountId = this.safeString (session, 'tradeAccountId');
        const sessionPrivateKey = this.safeString (session, 'sessionPrivateKey');
        const sessionAddress = this.safeString (session, 'sessionAddress');
        const ownerAddress = this.safeString (session, 'ownerAddress');
        const nonce = this.safeString (session, 'nonce', '0');
        const marketsInfo = this.safeList (this.options, 'marketsInfo', []);
        const calls = this.actionsToContractCalls (actions, marketsInfo);
        const signingBytes = this.buildActionsSigningBytesHex (nonce, calls);
        const signature = this.fuelRawSign (sessionPrivateKey, signingBytes);
        const request: Dict = {
            'actions': actions,
            'signature': { 'Secp256k1': signature },
            'nonce': nonce,
            'trade_account_id': tradeAccountId,
            'session_id': { 'Address': sessionAddress },
            'collect_orders': collectOrders,
        };
        let response = undefined;
        try {
            response = await this.privatePostV1SessionActions (this.extend (request, { 'O2-Owner-Id': ownerAddress }));
            this.options['session']['nonce'] = Precise.stringAdd (nonce, '1');
        } catch (e) {
            this.options['session']['nonce'] = Precise.stringAdd (nonce, '1');
            throw e;
        }
        return response;
    }

    encodeOrderArgsHex (price: string, quantity: string, orderType: string): string {
        const parts = [ this.u64BE (price), this.u64BE (quantity) ];
        if (orderType === 'Spot') {
            parts.push (this.u64BE ('1'));
        } else if (orderType === 'FillOrKill') {
            parts.push (this.u64BE ('2'));
        } else if (orderType === 'PostOnly') {
            parts.push (this.u64BE ('3'));
        } else if (orderType === 'Market') {
            parts.push (this.u64BE ('4'));
        } else {
            parts.push (this.u64BE ('1'));
        }
        return parts.join ('');
    }

    actionsToContractCalls (actions: any[], marketsInfo: any[]): any[] {
        const calls = [];
        const GAS_MAX = '18446744073709551615';
        const ZERO_ASSET = '0000000000000000000000000000000000000000000000000000000000000000';
        for (let i = 0; i < actions.length; i++) {
            const group = actions[i];
            const marketId = this.safeString (group, 'market_id');
            let marketInfo = undefined;
            for (let j = 0; j < marketsInfo.length; j++) {
                if (this.safeString (marketsInfo[j], 'market_id') === marketId) {
                    marketInfo = marketsInfo[j];
                    break;
                }
            }
            if (marketInfo === undefined) {
                throw new BadSymbol (this.id + ' market not found: ' + marketId);
            }
            const contractIdHex = this.stripHexPrefix (this.safeString (marketInfo, 'contract_id'));
            const baseInfo = this.safeDict (marketInfo, 'base', {});
            const quoteInfo = this.safeDict (marketInfo, 'quote', {});
            const baseAssetHex = this.stripHexPrefix (this.safeString (baseInfo, 'asset'));
            const quoteAssetHex = this.stripHexPrefix (this.safeString (quoteInfo, 'asset'));
            const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
            const groupActions = this.safeList (group, 'actions', []);
            for (let k = 0; k < groupActions.length; k++) {
                const action = groupActions[k];
                if (action['CreateOrder'] !== undefined) {
                    const data = action['CreateOrder'];
                    const priceStr = this.safeString (data, 'price');
                    const quantityStr = this.safeString (data, 'quantity');
                    const orderTypeStr = this.safeString (data, 'order_type');
                    const sideStr = this.safeString (data, 'side');
                    const callData = this.encodeOrderArgsHex (priceStr, quantityStr, orderTypeStr);
                    let amount = '0';
                    let assetIdHex = ZERO_ASSET;
                    if (sideStr === 'Buy') {
                        // amount = (price * quantity) / 10^baseDecimals
                        const product = Precise.stringMul (priceStr, quantityStr);
                        const divisor = this.powerOfTen (baseDecimals);
                        const divided = Precise.stringDiv (product, divisor, 0);
                        const divDot = divided.indexOf ('.');
                        amount = (divDot >= 0) ? divided.slice (0, divDot) : divided;
                        assetIdHex = quoteAssetHex;
                    } else {
                        amount = quantityStr;
                        assetIdHex = baseAssetHex;
                    }
                    calls.push ({
                        'contractId': contractIdHex,
                        'selector': this.functionSelectorHex ('create_order'),
                        'amount': amount,
                        'assetId': assetIdHex,
                        'gas': GAS_MAX,
                        'callData': callData,
                    });
                } else if (action['CancelOrder'] !== undefined) {
                    const orderId = this.safeString (action['CancelOrder'], 'order_id');
                    const orderIdHex = this.stripHexPrefix (orderId);
                    calls.push ({
                        'contractId': contractIdHex,
                        'selector': this.functionSelectorHex ('cancel_order'),
                        'amount': '0',
                        'assetId': ZERO_ASSET,
                        'gas': GAS_MAX,
                        'callData': orderIdHex,
                    });
                } else if (action['SettleBalance'] !== undefined) {
                    const toObj = this.safeDict (action['SettleBalance'], 'to', {});
                    const addr = this.safeString2 (toObj, 'Address', 'ContractId');
                    const disc = (toObj['ContractId'] !== undefined) ? '1' : '0';
                    const addrHex = this.stripHexPrefix (addr);
                    const identityHex = this.u64BE (disc) + addrHex;
                    calls.push ({
                        'contractId': contractIdHex,
                        'selector': this.functionSelectorHex ('settle_balance'),
                        'amount': '0',
                        'assetId': ZERO_ASSET,
                        'gas': GAS_MAX,
                        'callData': identityHex,
                    });
                }
            }
        }
        return calls;
    }

    buildActionsSigningBytesHex (nonce: string, calls: any[]): string {
        const parts = [
            this.u64BE (nonce),
            this.u64BE (this.numberToString (calls.length)),
        ];
        for (let i = 0; i < calls.length; i++) {
            const call = calls[i];
            const selector = call['selector'];
            parts.push (call['contractId']);
            parts.push (this.u64BE (this.numberToString (selector.length / 2)));
            parts.push (selector);
            parts.push (this.u64BE (call['amount']));
            parts.push (call['assetId']);
            parts.push (this.u64BE (call['gas']));
            const callData = call['callData'];
            if ((callData !== undefined) && (callData.length > 0)) {
                parts.push (this.u64BE ('1'));
                parts.push (this.u64BE (this.numberToString (callData.length / 2)));
                parts.push (callData);
            } else {
                parts.push (this.u64BE ('0'));
            }
        }
        return parts.join ('');
    }

    chainIdToDecimal (chainId: string): string {
        // convert chain_id from hex or decimal string to decimal string
        // the API may return either "0x..." (hex) or "1" (decimal)
        if ((chainId.length > 2) && (chainId[0] === '0') && (chainId[1] === 'x')) {
            // hex string — convert to decimal via Precise
            const hexDigits = this.stripHexPrefix (chainId);
            const hexChars = '0123456789abcdef';
            let result = '0';
            for (let i = 0; i < hexDigits.length; i++) {
                const digit = hexChars.indexOf (hexDigits[i]);
                result = Precise.stringAdd (Precise.stringMul (result, '16'), this.numberToString (digit));
            }
            return result;
        }
        return chainId;
    }

    buildSessionSigningBytesHex (nonce: string, chainId: string, sessionAddress: string, contractIds: string[], expiry: string): string {
        const chainIdDecimal = this.chainIdToDecimal (chainId);
        const sessionAddrHex = this.stripHexPrefix (sessionAddress);
        const funcNameHex = this.stringToHex ('set_session');
        const parts = [
            this.u64BE (nonce),
            this.u64BE (chainIdDecimal),
            this.u64BE ('11'),
            funcNameHex,
            this.u64BE ('1'),
            this.u64BE ('0'),
            sessionAddrHex,
            this.u64BE (expiry),
            this.u64BE (this.numberToString (contractIds.length)),
        ];
        for (let i = 0; i < contractIds.length; i++) {
            parts.push (this.stripHexPrefix (contractIds[i]));
        }
        return parts.join ('');
    }

    buildWithdrawSigningBytesHex (nonce: string, chainId: string, toAddress: string, assetId: string, amount: string): string {
        const chainIdDecimal = this.chainIdToDecimal (chainId);
        const funcNameHex = this.stringToHex ('withdraw');
        const toAddrHex = this.stripHexPrefix (toAddress);
        const assetHex = this.stripHexPrefix (assetId);
        const parts = [
            this.u64BE (nonce),
            this.u64BE (chainIdDecimal),
            this.u64BE ('8'),
            funcNameHex,
            this.u64BE ('0'),
            toAddrHex,
            assetHex,
            this.u64BE (amount),
        ];
        return parts.join ('');
    }

    generateSessionKey (): string {
        // crypto-safe random 32-byte private key (returned as hex string)
        return this.randomBytes (32);
    }

    deriveAddress (privateKeyHex: string): string {
        // Fuel address = sha256(uncompressedPublicKey[1:65])
        // 1. get uncompressed public key (65 bytes)
        // 2. skip first byte (0x04 prefix), take bytes 1-64
        // 3. sha256 hash to get 32-byte address
        const cleanPriv = this.stripHexPrefix (privateKeyHex);
        const publicKey = secp256k1.getPublicKey (cleanPriv, false);
        // convert to hex, skip first byte (2 hex chars)
        const publicKeyHex = this.binaryToBase16 (publicKey);
        const publicKeyBodyHex = publicKeyHex.slice (2);  // skip 0x04 prefix byte
        const publicKeyBodyBinary = this.base16ToBinary (publicKeyBodyHex);
        const addressHash = this.hash (publicKeyBodyBinary, sha256, 'hex');
        return '0x' + addressHash;
    }

    fuelPersonalSign (privateKeyHex: string, messageHex: string): string {
        // Fuel personalSign: sha256("\x19Fuel Signed Message:\n" + str(byteLen) + message)
        const prefixHex = this.stringToHex ('\x19Fuel Signed Message:\n');
        const messageBytesLen = messageHex.length / 2;
        const lenStr = this.numberToString (messageBytesLen);
        const lenHex = this.stringToHex (lenStr);
        const fullMessageHex = prefixHex + lenHex + messageHex;
        const fullMessageBinary = this.base16ToBinary (fullMessageHex);
        const digest = this.hash (fullMessageBinary, sha256, 'hex');
        return this.fuelCompactSign (privateKeyHex, digest);
    }

    fuelRawSign (privateKeyHex: string, messageHex: string): string {
        // Raw sign: sha256(messageBytes) then secp256k1 sign
        const messageBinary = this.base16ToBinary (messageHex);
        const digest = this.hash (messageBinary, sha256, 'hex');
        return this.fuelCompactSign (privateKeyHex, digest);
    }

    fuelCompactSign (privateKeyHex: string, digestHex: string): string {
        // secp256k1 sign, return Fuel compact signature (recovery in MSB of s[0])
        // uses ecdsa() helper which returns {r, s} as hex strings (transpile-safe)
        const cleanPriv = this.stripHexPrefix (privateKeyHex);
        const cleanDigest = this.stripHexPrefix (digestHex);
        const sig = ecdsa (cleanDigest, cleanPriv, secp256k1, undefined);
        const rHex = this.safeString (sig, 'r', '').padStart (64, '0');
        const sHex = this.safeString (sig, 's', '').padStart (64, '0');
        const recovery = this.safeInteger (sig, 'v', 0);
        // embed recovery ID in MSB of s[0]
        // convert first byte of s from hex using lookup table (transpile-safe)
        const hexDigits = '0123456789abcdef';
        const sChar0 = sHex.slice (0, 1);
        const sChar1 = sHex.slice (1, 2);
        const sNib0 = hexDigits.indexOf (sChar0);
        const sNib1 = hexDigits.indexOf (sChar1);
        const sByte0 = (sNib0 * 16) + sNib1;
        const sByte0WithRecovery = (recovery * 128) + (sByte0 % 128);
        const newByte = this.intToBase16 (sByte0WithRecovery).padStart (2, '0');
        const finalSHex = newByte + sHex.slice (2);
        return '0x' + rHex + finalSHex;
    }

    sign (path: string, api = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined): any {
        let url = this.urls['api'][api] + '/' + path;
        // strip O2-Owner-Id from params — it goes in headers, not body
        const ownerIdFromParams = this.safeString (params, 'O2-Owner-Id');
        const omitKeys = this.extractParams (path);
        omitKeys.push ('O2-Owner-Id');
        const query = this.omit (params, omitKeys);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const ownerAddress = ownerIdFromParams || this.safeString (this.safeDict (this.options, 'session', {}), 'ownerAddress', this.apiKey);
            headers = {
                'Content-Type': 'application/json',
                'O2-Owner-Id': ownerAddress,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any {
        if (response === undefined) {
            if (httpCode === 401) {
                throw new AuthenticationError (this.id + ' ' + body);
            }
            if (httpCode === 403) {
                throw new AuthenticationError (this.id + ' ' + body);
            }
            if (httpCode === 429) {
                throw new RateLimitExceeded (this.id + ' ' + body);
            }
            if (httpCode >= 500) {
                throw new ExchangeNotAvailable (this.id + ' ' + body);
            }
            return undefined;
        }
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message', '');
        const responseReason = this.safeString (response, 'reason', '');
        const error = this.safeString (response, 'error', '');
        if (code !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], responseReason, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
