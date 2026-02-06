
// ---------------------------------------------------------------------------

import Exchange from './abstract/deluthium.js';
import { Precise } from './base/Precise.js';
import { BadRequest, BadSymbol, InvalidOrder, OrderNotFound, ExchangeError, ExchangeNotAvailable, AuthenticationError, RequestTimeout, InsufficientFunds, ArgumentsRequired } from './base/errors.js';
import type { Dict, Int, Num, Str, Market, Currency, Ticker, OHLCV, Order, OrderSide, OrderType } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class deluthium
 * @augments Exchange
 * @description Deluthium (DarkPool) DEX - RFQ-based swap system supporting BSC, Base, and Ethereum chains.
 * Note: All amounts sent to the API must be in wei (integer strings). This class handles the conversion.
 */
export default class deluthium extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'deluthium',
            'name': 'Deluthium',
            'countries': [],
            'version': 'v1',
            'rateLimit': 100,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createOrder': true,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchQuote': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': false,
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
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://deluthium.ai/logo.png',
                'api': {
                    'private': 'https://rfq-api.deluthium.ai',
                },
                'www': 'https://deluthium.ai',
                'doc': 'https://deluthium.ai/docs',
            },
            'api': {
                'private': {
                    'get': {
                        'v1/listing/pairs': 1,
                        'v1/listing/tokens': 1,
                        'v1/market/pair': 1,
                        'v1/market/klines': 1,
                    },
                    'post': {
                        'v1/quote/indicative': 1,
                        'v1/quote/firm': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'walletAddress': false,
                'privateKey': false,
            },
            'options': {
                'nativeTokenAddress': '0x0000000000000000000000000000000000000000',
                'wrappedTokens': {
                    '56': '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                    '8453': '0x4200000000000000000000000000000000000006',
                    '1': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                },
                'defaultChainId': 56,
                'defaultSlippage': 0.5,
                'pairIdCache': {},
                'tokenDecimalsCache': {},
            },
            'exceptions': {
                'exact': {
                    'INVALID_INPUT': BadRequest,
                    'INVALID_TOKEN': BadSymbol,
                    'INVALID_AMOUNT': InvalidOrder,
                    'INVALID_PAIR': BadSymbol,
                    'INVALID_DEADLINE': InvalidOrder,
                    'QUOTE_EXPIRED': OrderNotFound,
                    'INSUFFICIENT_LIQUIDITY': InsufficientFunds,
                    'MM_NOT_AVAILABLE': ExchangeNotAvailable,
                    'NO_QUOTES': ExchangeError,
                    'SLIPPAGE_EXCEEDED': InvalidOrder,
                    'INTERNAL_ERROR': ExchangeError,
                    'SIGNING_ERROR': AuthenticationError,
                    'TIMEOUT_ERROR': RequestTimeout,
                },
                'broad': {
                    '10095': BadRequest,
                    '20003': ExchangeError,
                    '20004': BadSymbol,
                },
            },
        });
    }

    /**
     * @method
     * @name deluthium#toWei
     * @description Converts a human-readable amount to wei (integer string) based on token decimals
     * @param {number|string} amount the amount to convert
     * @param {number} decimals the token decimals (default 18)
     * @returns {string} the amount in wei as a string
     */
    toWei (amount: number | string, decimals: number = 18): string {
        const amountStr = typeof amount === 'number' ? String (amount) : amount;
        // Calculate 10^decimals
        let scale = '1';
        for (let i = 0; i < decimals; i++) {
            scale = Precise.stringMul (scale, '10');
        }
        const result = Precise.stringMul (amountStr, scale);
        // Remove decimal point if present (wei must be integer)
        const parts = result.split ('.');
        return parts[0];
    }

    /**
     * @method
     * @name deluthium#fromWei
     * @description Converts wei (integer string) to human-readable amount based on token decimals
     * @param {string} wei the wei amount to convert
     * @param {number} decimals the token decimals (default 18)
     * @returns {string} the human-readable amount as a string
     */
    fromWei (wei: string, decimals: number = 18): string {
        // Calculate 10^decimals
        let scale = '1';
        for (let i = 0; i < decimals; i++) {
            scale = Precise.stringMul (scale, '10');
        }
        return Precise.stringDiv (wei, scale);
    }

    /**
     * @method
     * @name deluthium#fetchMarkets
     * @description retrieves data on all markets for deluthium
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] filter by chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {Market[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        const request: Dict = {
            'chain_id': chainId,
        };
        const response = await this.privateGetV1ListingPairs (this.extend (request, params));
        //
        // {
        //     "code": 10000,
        //     "message": "Success",
        //     "data": { "pairs": [...] }  // or "data": [...]
        // }
        //
        // HIGH-001 FIX: Handle both { pairs: [...] } and direct array [...] formats
        const data = this.safeValue (response, 'data', []);
        const pairs = Array.isArray (data) ? data : this.safeList (data, 'pairs', []);
        return this.parseMarkets (pairs);
    }

    parseMarket (market: Dict): Market {
        const baseToken = this.safeDict (market, 'base_token', {});
        const quoteToken = this.safeDict (market, 'quote_token', {});
        // BUG-001 FIX: pairId stored as string
        const pairId = this.safeString (market, 'pair_id');
        const chainId = this.safeInteger (market, 'chain_id');
        const pairSymbol = this.safeString (market, 'pair_symbol', '');
        const symbol = pairSymbol.replace ('-', '/');
        const baseId = this.safeString (baseToken, 'token_address');
        const quoteId = this.safeString (quoteToken, 'token_address');
        const base = this.safeString (baseToken, 'token_symbol');
        const quote = this.safeString (quoteToken, 'token_symbol');
        const isEnabled = this.safeBool (market, 'is_enabled', true);
        const feeRate = this.safeInteger (market, 'fee_rate', 0);
        // MED-002 FIX: Handle both 'decimals' and 'token_decimals' field names
        const baseDecimals = this.safeInteger2 (baseToken, 'decimals', 'token_decimals', 18);
        const quoteDecimals = this.safeInteger2 (quoteToken, 'decimals', 'token_decimals', 18);
        // MED-003 FIX: Use chain-qualified cache key
        const cacheKey = `${symbol}:${chainId}`;
        this.options['pairIdCache'][cacheKey] = {
            'pairId': pairId,
            'chainId': chainId,
        };
        // Cache token decimals for wei conversion
        this.options['tokenDecimalsCache'][baseId] = baseDecimals;
        this.options['tokenDecimalsCache'][quoteId] = quoteDecimals;
        return {
            'id': pairId,
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
            'active': isEnabled,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': feeRate / 10000,
            'maker': feeRate / 10000,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': baseDecimals,
                'price': quoteDecimals,
            },
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
            'created': undefined,
            'info': market,
        };
    }

    /**
     * @method
     * @name deluthium#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] filter by chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Dict> {
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        const request: Dict = {
            'chain_id': chainId,
        };
        const response = await this.privateGetV1ListingTokens (this.extend (request, params));
        //
        // HIGH-001 FIX: Handle both { tokens: [...] } and direct array [...] formats
        //
        const data = this.safeValue (response, 'data', []);
        const tokens = Array.isArray (data) ? data : this.safeList (data, 'tokens', []);
        const result: Dict = {};
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const currency = this.parseCurrency (token);
            result[currency['code']] = currency;
        }
        return result;
    }

    parseCurrency (token: Dict): Currency {
        const address = this.safeString (token, 'token_address');
        const code = this.safeString (token, 'token_symbol');
        const name = this.safeString (token, 'token_name');
        // MED-002 FIX: Handle both 'decimals' and 'token_decimals' field names
        const decimals = this.safeInteger2 (token, 'decimals', 'token_decimals', 18);
        const chainId = this.safeInteger (token, 'chain_id');
        // Cache token decimals for wei conversion
        this.options['tokenDecimalsCache'][address] = decimals;
        return {
            'id': address,
            'code': code,
            'name': name,
            'type': 'crypto',
            'active': true,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': decimals,
            'limits': {
                'amount': { 'min': undefined, 'max': undefined },
                'withdraw': { 'min': undefined, 'max': undefined },
            },
            'networks': {
                [chainId]: {
                    'id': address,
                    'network': String (chainId),
                    'active': true,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': decimals,
                    'limits': {
                        'amount': { 'min': undefined, 'max': undefined },
                        'withdraw': { 'min': undefined, 'max': undefined },
                    },
                    'info': token,
                },
            },
            'info': token,
        } as Currency;
    }

    /**
     * @method
     * @name deluthium#getTokenDecimals
     * @description Gets the decimals for a token address from cache or defaults to 18
     * @param {string} tokenAddress the token contract address
     * @returns {number} the token decimals
     */
    getTokenDecimals (tokenAddress: string): number {
        const cache = this.safeDict (this.options, 'tokenDecimalsCache', {});
        return this.safeInteger (cache, tokenAddress, 18);
    }

    /**
     * @method
     * @name deluthium#fetchTicker
     * @description fetches a price ticker for a specific market
     * @param {string} symbol unified symbol of the market to fetch ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID override (56=BSC, 8453=Base, 1=ETH)
     * @param {string} [params.interval] interval for price data (default '1h')
     * @returns {Ticker} a ticker structure
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        // MED-003 FIX: Use chain-qualified cache key
        const cacheKey = `${symbol}:${chainId}`;
        const pairCache = this.safeDict (this.options, 'pairIdCache', {});
        const cached = this.safeDict (pairCache, cacheKey, {});
        // BUG-001 FIX: Use safeString instead of safeInteger for pairId
        const pairId = this.safeString (cached, 'pairId');
        // MED-004 FIX: Allow interval parameter
        const interval = this.safeString (params, 'interval', '1h');
        const request: Dict = {
            'chainId': chainId,
            'pairId': pairId,
            'interval': interval,
        };
        const response = await this.privateGetV1MarketPair (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const symbol = market !== undefined ? market['symbol'] : undefined;
        const price = this.safeString (ticker, 'price');
        const change24h = this.safeString (ticker, 'change_24h');
        const baseVolume = this.safeString (ticker, 'volume_base_24h');
        const quoteVolume = this.safeString (ticker, 'volume_quote_24h');
        let percentage = undefined;
        if (change24h !== undefined) {
            const changeNum = parseFloat (change24h);
            if (!isNaN (changeNum)) {
                percentage = changeNum * 100;
            }
        }
        return this.safeTicker ({
            'symbol': symbol,
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
            'close': price,
            'last': price,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name deluthium#fetchOHLCV
     * @description fetches historical candlestick data containing OHLCV
     * @param {string} symbol unified symbol of the market to fetch OHLCV for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID override (56=BSC, 8453=Base, 1=ETH)
     * @returns {int[][]} a list of candles ordered as [timestamp, open, high, low, close, volume]
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        // MED-003 FIX: Use chain-qualified cache key
        const cacheKey = `${symbol}:${chainId}`;
        const pairCache = this.safeDict (this.options, 'pairIdCache', {});
        const cached = this.safeDict (pairCache, cacheKey, {});
        // BUG-001 FIX: Use safeString instead of safeInteger for pairId
        const pairId = this.safeString (cached, 'pairId');
        if (limit === undefined) {
            limit = 500;
        }
        const request: Dict = {
            'chainId': chainId,
            'pairId': pairId,
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        if (since !== undefined) {
            request['start'] = Math.floor (since / 1000);
        }
        const response = await this.privateGetV1MarketKlines (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        const timestamp = this.safeTimestamp (ohlcv, 'open_time');
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume_base'),
        ];
    }

    /**
     * @method
     * @name deluthium#fetchQuote
     * @description fetches an indicative quote for a swap without executing it.
     * Note: The amount parameter should be in human-readable format (e.g., 1.5 for 1.5 tokens).
     * The method automatically converts to wei before sending to the API.
     * @param {string} symbol unified symbol of the market
     * @param {number} amount the amount to quote for (in human-readable format)
     * @param {string} side 'buy' or 'sell'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID (56=BSC, 8453=Base, 1=ETH)
     * @returns {object} a quote structure with estimated output amount (in wei)
     */
    async fetchQuote (symbol: string, amount: number, side: string = 'buy', params = {}): Promise<Dict> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        const tokenIn = side === 'buy' ? market['quoteId'] : market['baseId'];
        const tokenOut = side === 'buy' ? market['baseId'] : market['quoteId'];
        // BUG-002 FIX: Convert amount to wei
        const tokenInDecimals = this.getTokenDecimals (tokenIn as string);
        const amountInWei = this.toWei (amount, tokenInDecimals);
        const request: Dict = {
            'src_chain_id': chainId,
            'dst_chain_id': chainId,
            'token_in': tokenIn,
            'token_out': tokenOut,
            'amount_in': amountInWei,
        };
        const response = await this.privatePostV1QuoteIndicative (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseQuote (data, market);
    }

    parseQuote (quote: Dict, market: Market = undefined): Dict {
        return {
            'symbol': market !== undefined ? market['symbol'] : undefined,
            'amount_in': this.safeString (quote, 'amount_in'),
            'amount_out': this.safeString (quote, 'amount_out'),
            'fee_rate': this.safeInteger (quote, 'fee_rate'),
            'fee_amount': this.safeString (quote, 'fee_amount'),
            'info': quote,
        };
    }

    /**
     * @method
     * @name deluthium#createOrder
     * @description Creates a firm quote and returns calldata for on-chain execution.
     * IMPORTANT: CCXT does NOT broadcast the transaction. The user must submit
     * the returned calldata to the blockchain using their own wallet/signer.
     * Note: The amount parameter should be in human-readable format. It is automatically converted to wei.
     * @param {string} symbol unified symbol of the market
     * @param {string} type order type (only 'market' supported for RFQ)
     * @param {string} side 'buy' or 'sell'
     * @param {number} amount the amount to trade (in human-readable format)
     * @param {number} [price] not used for RFQ
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.chainId] chain ID (56=BSC, 8453=Base, 1=ETH)
     * @param {number} [params.dstChainId] destination chain for cross-chain swaps
     * @param {number} [params.slippage] slippage tolerance in percentage (default 0.5)
     * @param {string} [params.walletAddress] user's wallet address (required)
     * @param {string} [params.toAddress] recipient address (defaults to walletAddress)
     * @param {string} [params.indicative_amount_out] optional for slippage pre-validation
     * @param {number} [params.expiryTimeSec] quote expiry time in seconds (default 60)
     * @returns {Order} an order structure with calldata in order.info.calldata
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        // HIGH-004 FIX: Validate order type
        if (type !== 'market') {
            throw new InvalidOrder (this.id + ' createOrder() only supports market orders (RFQ-based exchange)');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chainId = this.safeInteger (params, 'chainId', this.safeInteger (this.options, 'defaultChainId', 56));
        const dstChainId = this.safeInteger (params, 'dstChainId', chainId);
        const slippage = this.safeNumber (params, 'slippage', this.safeNumber (this.options, 'defaultSlippage', 0.5));
        const walletAddress = this.safeString2 (params, 'walletAddress', 'from_address');
        if (walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires params.walletAddress');
        }
        const tokenIn = side === 'buy' ? market['quoteId'] : market['baseId'];
        const tokenOut = side === 'buy' ? market['baseId'] : market['quoteId'];
        // BUG-002 FIX: Convert amount to wei
        const tokenInDecimals = this.getTokenDecimals (tokenIn as string);
        const amountInWei = this.toWei (amount, tokenInDecimals);
        // MED-005 FIX: Handle both snake_case and camelCase for toAddress
        const toAddress = this.safeString2 (params, 'to_address', 'toAddress', walletAddress);
        const request: Dict = {
            'src_chain_id': chainId,
            'dst_chain_id': dstChainId,
            'from_address': walletAddress,
            'to_address': toAddress,
            'token_in': tokenIn,
            'token_out': tokenOut,
            'amount_in': amountInWei,
            'slippage': slippage,
            'expiry_time_sec': this.safeInteger (params, 'expiryTimeSec', 60),
        };
        const indicativeAmountOut = this.safeString (params, 'indicative_amount_out');
        if (indicativeAmountOut !== undefined) {
            request['indicative_amount_out'] = indicativeAmountOut;
        }
        const response = await this.privatePostV1QuoteFirm (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        // HIGH-003 FIX: Pass side to parseOrder
        return this.parseOrder (data, market, side);
    }

    // HIGH-003 FIX: Accept side parameter
    parseOrder (order: Dict, market: Market = undefined, side: OrderSide = undefined): Order {
        const quoteId = this.safeString (order, 'quote_id');
        const symbol = market !== undefined ? market['symbol'] : undefined;
        const amountIn = this.safeString (order, 'amount_in');
        const amountOut = this.safeString (order, 'amount_out');
        const deadline = this.safeInteger (order, 'deadline');
        const deadlineTimestamp = deadline !== undefined ? deadline * 1000 : undefined;
        return {
            'id': quoteId,
            'clientOrderId': undefined,
            'timestamp': this.milliseconds (),
            'datetime': this.iso8601 (this.milliseconds ()),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'market',
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': undefined,
            'triggerPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'average': undefined,
            'amount': this.parseNumber (amountIn),
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': this.parseNumber (this.safeString (order, 'fee_amount')),
                'currency': market !== undefined ? market['quote'] : undefined,
            },
            'info': {
                ...order,
                'expected_output': amountOut,
                'deadline_timestamp': deadlineTimestamp,
            },
        } as Order;
    }

    sign (path: string, api = 'private', method = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.apiKey,
        };
        if (method === 'GET') {
            if (Object.keys (params).length > 0) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    // BUG-003 FIX: Completely refactored error handling logic
    handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        // MED-001 FIX: Check HTTP 401 for authentication errors
        if (httpCode === 401) {
            throw new AuthenticationError (this.id + ' ' + body);
        }
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeValue (response, 'code');
        // Handle success codes first (both numeric 10000 and string "10000")
        if (code === 10000 || code === '10000') {
            return undefined;
        }
        // String error codes (Trading Service errors like "INVALID_INPUT")
        if (typeof code === 'string') {
            const exactExceptions = this.safeDict (this.exceptions, 'exact', {});
            if (code in exactExceptions) {
                const ExceptionClass = exactExceptions[code];
                throw new ExceptionClass (this.id + ' ' + body);
            }
            // Unknown string error code
            const message = this.safeString (response, 'message', code);
            throw new ExchangeError (this.id + ' ' + message);
        }
        // Numeric error codes (Market Data Service errors like 10095, 20003, 20004)
        if (typeof code === 'number') {
            const broadExceptions = this.safeDict (this.exceptions, 'broad', {});
            const codeStr = String (code);
            if (codeStr in broadExceptions) {
                const ExceptionClass = broadExceptions[codeStr];
                throw new ExceptionClass (this.id + ' ' + body);
            }
            // Unknown numeric error code
            const message = this.safeString (response, 'message', 'Unknown error');
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }
}
