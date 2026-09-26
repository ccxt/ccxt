
//  ---------------------------------------------------------------------------

import Exchange from './abstract/jupiter.js';
import { ArgumentsRequired, ExchangeError, InvalidOrder, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import type { Dict, Endpoint, Int, List, Market, Num, NullableDict, Order, OrderBook, OrderSide, OrderType, Str, Ticker, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class jupiter
 * @augments Exchange
 * @description
 * Jupiter is a swap aggregator on Solana: there are no pairs, any token routes to any token.
 * Markets are synthesized as <verified token>/USDC, the deepest token wins when symbols collide.
 * createOrder returns an UNSIGNED base64 VersionedTransaction in order['info'], the caller signs and sends it.
 */
export default class jupiter extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'jupiter',
            'name': 'Jupiter',
            'countries': [],
            'rateLimit': 1000, // keyless lite-api allows ~60 requests per minute
            'dex': true,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'createOrder': true, // returns an unsigned tx, see createOrder
                'fetchBalance': false, // needs a solana rpc node, out of scope
                'fetchMarkets': true,
                'fetchOrderBook': false, // aggregator over AMMs, no order book
                'fetchTicker': true,
            },
            'urls': {
                'api': {
                    'rest': 'https://lite-api.jup.ag', // keyless; set to https://api.jup.ag with an apiKey for higher limits
                },
                'www': 'https://jup.ag',
                'doc': [
                    'https://dev.jup.ag/docs',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'tokens/v2/tag': { 'cost': 1 } as Endpoint<List>,
                        'tokens/v2/search': { 'cost': 1 } as Endpoint<List>,
                        'price/v3': { 'cost': 1 } as Endpoint<Dict>,
                        'swap/v1/quote': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'swap/v1/swap': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true, // solana public key of the signer, never a private key
            },
            'options': {
                'quoteMint': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
                'quoteCode': 'USDC', // unified code for quoteMint, change both together
                'marketsLimit': 300, // top verified tokens by liquidity
                'slippageBps': 50,
            },
        });
    }

    /**
     * @method
     * @name jupiter#fetchMarkets
     * @description maps the most liquid verified solana tokens to TOKEN/USDC spot markets
     * @see https://dev.jup.ag/docs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {
            'query': 'verified',
        };
        const response = await this.publicGetTokensV2Tag (this.extend (request, params));
        //
        //     [
        //         { "id": "So11111111111111111111111111111111111111112", "name": "Wrapped SOL", "symbol": "SOL", "decimals": 9, "liquidity": 946221959.13, "usdPrice": 116.65, ... },
        //         ...
        //     ]
        //
        // symbols are not unique even among verified tokens (two WBTC mints), keep the deepest one
        // some tokens omit liquidity, and python's sort_by raises on a missing key
        const withLiquidity = [];
        for (let i = 0; i < response.length; i++) {
            withLiquidity.push (this.extend (response[i], { 'liquidity': this.safeNumber (response[i], 'liquidity', 0) }));
        }
        const tokens = this.sortBy (withLiquidity, 'liquidity', true);
        const quoteMint = this.safeString (this.options, 'quoteMint');
        const limit = this.safeInteger (this.options, 'marketsLimit', 300);
        const result: Market[] = [];
        const seen: Dict = {};
        let numMarkets = 0; // not result.length, php transpiles that to strlen
        for (let i = 0; i < tokens.length; i++) {
            if (numMarkets >= limit) {
                break;
            }
            if (this.safeString (tokens[i], 'symbol') === undefined) {
                continue;
            }
            const market = this.parseMarket (tokens[i]);
            const symbol = this.safeSymbol (undefined, market);
            if (this.safeString (market, 'baseId') !== quoteMint && !(symbol in seen)) {
                seen[symbol] = true;
                result.push (market);
                numMarkets += 1;
            }
        }
        return result;
    }

    override parseMarket (token: Dict): Market {
        const baseId = this.safeString (token, 'id'); // mint address
        const base = this.safeCurrencyCode (this.safeStringUpper (token, 'symbol'));
        const quote = this.safeString (this.options, 'quoteCode', 'USDC');
        return this.safeMarketStructure ({
            'id': baseId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': this.safeString (this.options, 'quoteMint'),
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (token, 'decimals'))),
                'price': undefined,
            },
            'limits': {
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
                'leverage': { 'min': undefined, 'max': undefined },
            },
            'created': undefined,
            'info': token,
        });
    }

    /**
     * @method
     * @name jupiter#fetchTicker
     * @description fetches the aggregated usd price of a token, only last and percentage are available
     * @see https://dev.jup.ag/docs
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'ids': market['id'],
        };
        const response = await this.publicGetPriceV3 (this.extend (request, params));
        //
        //     {
        //         "So11111111111111111111111111111111111111112": { "usdPrice": 116.64, "priceChange24h": -0.37, "liquidity": 946221959.13, "decimals": 9, "blockId": 449691427, ... }
        //     }
        //
        return this.parseTicker (this.safeDict (response, market['id'], {}), market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        // ponytail: usd price stands in for the USDC quote, it is not a USDC order book price
        const last = this.safeString (ticker, 'usdPrice');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
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
            'percentage': this.safeString (ticker, 'priceChange24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name jupiter#createOrder
     * @description builds an unsigned swap transaction, it does NOT execute anything
     * @see https://dev.jup.ag/docs
     * @param {string} symbol unified symbol of the market
     * @param {string} type must be 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount amount of the base currency to buy or sell
     * @param {float} [price] ignored
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.userPublicKey] signer address, defaults to this.walletAddress
     * @param {int} [params.slippageBps] defaults to this.options.slippageBps
     * @param {object} [params.swapParams] extra fields for the swap/v1/swap body, e.g. { 'prioritizationFeeLamports': 10000, 'wrapAndUnwrapSol': false }; any other params go to swap/v1/quote, e.g. onlyDirectRoutes
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure} with status undefined and the unsigned tx in info.swapTransaction
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        if (type !== 'market') {
            throw new InvalidOrder (this.id + ' createOrder() supports market orders only, use the jupiter trigger api for limit orders');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const userPublicKey = this.safeString (params, 'userPublicKey', this.walletAddress);
        if (userPublicKey === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires this.walletAddress or params.userPublicKey');
        }
        const decimals = this.safeString (market['info'], 'decimals');
        if (decimals === undefined) {
            throw new ExchangeError (this.id + ' createOrder() cannot convert amount to base units, token decimals are unknown for ' + symbol);
        }
        // amount / 10^-decimals with precision 0 = integer base units, truncated
        const rawAmount = Precise.stringDiv (this.numberToString (amount), this.parsePrecision (decimals), 0);
        const isSell = (side === 'sell');
        // sell = spend exactly `amount` base, buy = receive exactly `amount` base
        const quoteRequest: Dict = {
            'inputMint': (isSell) ? market['baseId'] : market['quoteId'],
            'outputMint': (isSell) ? market['quoteId'] : market['baseId'],
            'amount': rawAmount,
            'swapMode': (isSell) ? 'ExactIn' : 'ExactOut',
            'slippageBps': this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps')),
        };
        const swapParams = this.safeDict (params, 'swapParams', {});
        params = this.omit (params, [ 'userPublicKey', 'slippageBps', 'swapParams' ]);
        const quote = await this.publicGetSwapV1Quote (this.extend (quoteRequest, params));
        const swapRequest: Dict = {
            'quoteResponse': quote,
            'userPublicKey': userPublicKey,
            'dynamicComputeUnitLimit': true,
        };
        const swap = await this.publicPostSwapV1Swap (this.extend (swapRequest, swapParams));
        //
        //     { "swapTransaction": "AQAAAA...base64", "lastValidBlockHeight": 327711234, "prioritizationFeeLamports": 5000 }
        //
        return this.safeOrder ({
            'id': undefined, // becomes the tx signature once sent
            'symbol': market['symbol'],
            'type': 'market',
            'side': side,
            'amount': amount,
            'status': undefined, // nothing happened on-chain yet
            'info': {
                'quote': quote,
                'swapTransaction': this.safeString (swap, 'swapTransaction'),
                'lastValidBlockHeight': this.safeInteger (swap, 'lastValidBlockHeight'),
            },
        }, market);
    }

    /**
     * @method
     * @name jupiter#fetchOrderBook
     * @description not supported, jupiter aggregates AMMs and has no resting orders
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] ignored
     * @param {object} [params] ignored
     * @returns {object} never returns
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        throw new NotSupported (this.id + ' fetchOrderBook() is not supported, use createOrder() quotes for executable prices');
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        let url = this.urls['api']['rest'] + '/' + path;
        headers = {};
        if (this.apiKey !== undefined && this.apiKey !== '') {
            headers['X-API-KEY'] = this.apiKey;
        }
        if (method === 'GET') {
            if (Object.keys (params).length > 0) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     { "error": "Could not find any route", "errorCode": "COULD_NOT_FIND_ANY_ROUTE" }
        //
        if (!Array.isArray (response) && ('error' in response)) {
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }
}
