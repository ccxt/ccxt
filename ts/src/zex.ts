//  ---------------------------------------------------------------------------

import Exchange from './abstract/zex.js';
import {
    ExchangeError,
    ArgumentsRequired,
    InvalidOrder,
    OrderNotFound,
    BadRequest,
    InsufficientFunds,
    RateLimitExceeded,
    AuthenticationError,
    NotSupported,
    ExchangeNotAvailable,
} from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type {
    Balances,
    Currencies,
    Currency,
    DepositAddress,
    DepositWithdrawFee,
    Dict,
    Int,
    Market,
    Num,
    Order,
    OrderBook,
    OrderRequest,
    OrderSide,
    OrderType,
    Str,
    Strings,
    Ticker,
    Tickers,
    Trade,
    Transaction,
    TransferEntry,
    int,
} from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zex
 * @augments Exchange
 */
export default class zex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'zex',
            'name': 'ZEX',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': false,
                'createOrder': true,
                'createOrders': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': true,
                'fetchFundingHistory': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchLedger': false,
                'fetchLiquidations': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {},
            'hostname': 'zex.finance',
            'urls': {
                'logo': 'https://zex.finance/images/navbar/logo.svg',
                // mainnet not launched yet — testnet is the current production environment.
                // when mainnet ships, move the testnet URLs under 'test' and add the mainnet URLs under 'api'.
                'api': {
                    'public': 'https://api-testnet.zex.finance/v1',
                    'private': 'https://api-testnet.zex.finance/v1',
                },
                'test': {
                    'public': 'https://api-testnet.zex.finance/v1',
                    'private': 'https://api-testnet.zex.finance/v1',
                },
                'www': 'https://zex.finance',
                'doc': 'https://docs.zex.finance',
                'fees': 'https://help.zex.finance/docs/fees-and-pricing/01-trading-rules-and-fees#spot-trading-fee-tiers',
                'referral': 'https://zex.finance/referral',
            },
            'api': {
                'public': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': 1,
                        'ticker/price': 1,
                        'ticker': 1,
                        'withdraw/fee': 1,
                        'status/deposit': 1,
                    },
                },
                'private': {
                    'get': {
                        'user/id': 1,
                        'user/public': 1,
                        'user/address': 1,
                        'user/nonce': 1,
                        'user/nft-signature': 1,
                        'user/orders': 1,
                        'user/trades': 1,
                        'user/deposits': 1,
                        'user/withdraws': 1,
                        'asset/getUserAsset': 1,
                        'capital/config/getall': 1,
                        'tx/latest': 1,
                        'faucet/info': 1,
                    },
                    'post': {
                        'order': 1,
                        'withdraw': 1,
                        'transfer': 1,
                        'batch': 1,
                        'faucet/request': 1,
                    },
                    'delete': {
                        'order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': false,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest, // Bad Request -- Invalid request format
                    '401': AuthenticationError, // Unauthorized -- Invalid API Key
                    '403': NotSupported, // Forbidden -- The request is forbidden
                    '404': NotSupported, // Not Found -- The specified resource could not be found
                    '429': RateLimitExceeded, // Too Many Requests -- Access limit breached
                    '500': ExchangeNotAvailable, // Internal Server Error -- We had a problem with our server. Try again later.
                    '503': ExchangeNotAvailable, // Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
                },
                'broad': {
                    'insufficient balance': InsufficientFunds,
                    'Insufficient balance': InsufficientFunds,
                    'invalid signature': AuthenticationError,
                    'Invalid signature': AuthenticationError,
                    'order not found': OrderNotFound,
                    'Order not found': OrderNotFound,
                    'rate limit': RateLimitExceeded,
                    'Rate limit': RateLimitExceeded,
                    'Illegal characters': BadRequest,
                    'invalid symbol': BadRequest,
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
                'sandboxMode': false,
                'userId': undefined,
                'orderNonceCache': {},
            },
        });
    }

    /**
     * @ignore
     * @method
     * @description derive a tick-size precision value from a numeric string by counting decimal places
     */
    zexPrecisionFromString (str: string): Num {
        const dotIndex = str.indexOf ('.');
        if (dotIndex === -1) {
            return 1;
        }
        const decimals = str.length - dotIndex - 1;
        let precision = 1;
        for (let i = 0; i < decimals; i++) {
            precision = precision / 10;
        }
        return precision;
    }

    /**
     * @ignore
     * @method
     * @description format a number as a decimal string with at least one decimal place and no trailing zeros
     */
    zexFormatDecimal (value: number): string {
        const str = value.toString ();
        const dotIndex = str.indexOf ('.');
        if (dotIndex === -1) {
            return str + '.0';
        }
        let end = str.length - 1;
        while (end > dotIndex + 1 && str[end] === '0') {
            end = end - 1;
        }
        return str.slice (0, end + 1);
    }

    /**
     * @ignore
     * @method
     * @description sign a message using Ethereum personal sign with secp256k1 and return compact 128-char hex (no 0x prefix)
     */
    zexSign (message: string): string {
        const msgBytes = this.encode (message);
        const msgLen = this.binaryLength (msgBytes);
        const x19 = this.base16ToBinary ('19');
        const newline = this.base16ToBinary ('0a');
        const prefix = this.binaryConcat (x19, this.encode ('Ethereum Signed Message:'), newline, this.encode (this.numberToString (msgLen)));
        const hashHex = this.hash (this.binaryConcat (prefix, msgBytes), keccak, 'hex');
        const rawKey = this.privateKey;
        let cleanKey = rawKey;
        if (rawKey.indexOf ('0x') === 0) {
            cleanKey = rawKey.slice (2);
        }
        const sig = ecdsa (hashHex, cleanKey, secp256k1, undefined);
        const r = sig['r'];
        const s = sig['s'];
        return r.padStart (64, '0') + s.padStart (64, '0');
    }

    /**
     * @ignore
     * @method
     * @description derive the Ethereum address from the private key
     */
    zexDeriveAddress (): string {
        return this.ethGetAddressFromPrivateKey (this.privateKey);
    }

    /**
     * @ignore
     * @method
     * @description resolve and cache the on-chain userId for the configured privateKey. Throws if the wallet is not yet registered with zex — register out of band via the zex web app first.
     */
    async initializeClient (): Promise<int> {
        const cachedUserId = this.safeInteger (this.options, 'userId');
        if (cachedUserId !== undefined) {
            return cachedUserId;
        }
        const address = this.zexDeriveAddress ();
        const response = await this.privateGetUserId ({ 'address': address });
        const userId = this.safeInteger (response, 'id');
        if (userId === undefined) {
            throw new AuthenticationError (this.id + ' initializeClient: wallet ' + address + ' is not registered with zex; register via the zex app first');
        }
        this.options['userId'] = userId;
        return userId as int;
    }

    /**
     * @ignore
     * @method
     * @description get the cached userId or throw if not initialized
     */
    async getUserId (): Promise<int> {
        return this.initializeClient ();
    }

    /**
     * @method
     * @name zex#setSandboxMode
     * @description enable or disable sandbox mode
     * @param {bool} enabled true to enable sandbox, false to disable
     */
    setSandboxMode (enabled: boolean) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    /**
     * @method
     * @name zex#fetchStatus
     * @description fetch the status of the exchange
     * @see https://docs.zex.finance/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}): Promise<Dict> {
        await this.publicGetPing (params);
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': {},
        };
    }

    /**
     * @method
     * @name zex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.zex.finance/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetTime (params);
        return this.safeInteger (response, 'serverTime');
    }

    /**
     * @method
     * @name zex#fetchMarkets
     * @description retrieves data on all markets for zex
     * @see https://docs.zex.finance/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetExchangeInfo (params);
        const symbols = this.safeList (response, 'symbols', []);
        const tickers = await this.fetchTickersRaw (params);
        const tickersLength = tickers.length;
        const tickersByMarketId: Dict = {};
        for (let i = 0; i < tickersLength; i++) {
            const ticker = this.safeDict (tickers, i, {});
            const marketId = this.safeString (ticker, 'symbol');
            if (marketId !== undefined) {
                tickersByMarketId[marketId] = ticker;
            }
        }
        const result = [];
        const symbolsLength = symbols.length;
        for (let i = 0; i < symbolsLength; i++) {
            const symbol = this.safeDict (symbols, i, {});
            const marketId = this.safeString (symbol, 'symbol');
            const ticker = this.safeDict (tickersByMarketId, marketId, {});
            const market = this.parseMarket (this.extend (symbol, { 'ticker': ticker }));
            result.push (market);
        }
        return result;
    }

    /**
     * @ignore
     * @method
     * @description fetch raw ticker data for markets without loading markets recursively
     */
    async fetchTickersRaw (params = {}): Promise<any[]> {
        const response = await this.publicGetTicker (params);
        return Array.isArray (response) ? response : [ response ];
    }

    /**
     * @ignore
     * @method
     * @description parse a single market from exchangeInfo
     */
    parseMarket (market): Market {
        const id = this.safeString (market, 'symbol');
        const parts = id.split ('-');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const status = this.safeString (market, 'status');
        const active = status === 'TRADING';
        let pricePrecision = undefined;
        let amountPrecision = undefined;
        let minCost = undefined;
        let minAmount = undefined;
        let maxAmount = undefined;
        const filters = this.safeList (market, 'filters', []);
        const filtersLength = filters.length;
        for (let j = 0; j < filtersLength; j++) {
            const filter = this.safeDict (filters, j, {});
            const filterType = this.safeString (filter, 'filterType');
            if (filterType === 'PRICE_FILTER') {
                pricePrecision = this.safeNumber (filter, 'tickSize');
            } else if (filterType === 'LOT_SIZE') {
                amountPrecision = this.safeNumber (filter, 'stepSize');
                minAmount = this.safeNumber (filter, 'minQty');
                maxAmount = this.safeNumber (filter, 'maxQty');
            } else if (filterType === 'MIN_NOTIONAL') {
                minCost = this.safeNumber (filter, 'minNotional');
            }
        }
        const ticker = this.safeDict (market, 'ticker', {});
        if (pricePrecision === undefined) {
            const priceStr = this.safeString (ticker, 'lastPrice');
            if (priceStr !== undefined) {
                pricePrecision = this.zexPrecisionFromString (priceStr);
            }
        }
        if (amountPrecision === undefined) {
            // ticker.volume is a cumulative sum and not safe to derive a quantum from;
            // fall back to baseAssetPrecision (decimals → tick size) when filters are absent.
            const baseAssetPrecision = this.safeInteger (market, 'baseAssetPrecision');
            if (baseAssetPrecision !== undefined) {
                amountPrecision = this.parseNumber (this.parsePrecision (this.numberToString (baseAssetPrecision)));
            }
        }
        return this.safeMarketStructure ({
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
            'taker': this.safeNumber (this.safeDict (this.fees, 'trading', {}), 'taker'),
            'maker': this.safeNumber (this.safeDict (this.fees, 'trading', {}), 'maker'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
                    'max': maxAmount,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name zex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.zex.finance/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.privateGetCapitalConfigGetall (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = this.safeDict (response, i, {});
            const coinId = this.safeString (entry, 'coin');
            const code = this.safeCurrencyCode (coinId);
            const networkList = this.safeList (entry, 'networkList', []);
            const networks = {};
            let depositEnabled = false;
            let withdrawEnabled = false;
            let minWithdraw = undefined;
            let maxWithdraw = undefined;
            let fee = undefined;
            for (let j = 0; j < networkList.length; j++) {
                const network = this.safeDict (networkList, j, {});
                const networkId = this.safeString (network, 'network');
                const networkCode = this.networkIdToCode (networkId);
                const netDeposit = this.safeBool (network, 'depositEnable', false);
                const netWithdraw = this.safeBool (network, 'withdrawEnable', false);
                if (netDeposit) {
                    depositEnabled = true;
                }
                if (netWithdraw) {
                    withdrawEnabled = true;
                }
                const netFee = this.safeNumber (network, 'withdrawFee');
                if (fee === undefined) {
                    fee = netFee;
                }
                const netMinWithdraw = this.safeNumber (network, 'withdrawMin');
                if (minWithdraw === undefined) {
                    minWithdraw = netMinWithdraw;
                }
                const netMaxWithdraw = this.safeNumber (network, 'withdrawMax');
                if (maxWithdraw === undefined) {
                    maxWithdraw = netMaxWithdraw;
                }
                networks[networkCode] = {
                    'info': network,
                    'id': networkId,
                    'network': networkCode,
                    'active': netDeposit || netWithdraw,
                    'deposit': netDeposit,
                    'withdraw': netWithdraw,
                    'fee': netFee,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': netMinWithdraw,
                            'max': netMaxWithdraw,
                        },
                    },
                };
            }
            result[code] = {
                'info': entry,
                'id': coinId,
                'code': code,
                'name': undefined,
                'active': depositEnabled || withdrawEnabled,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': fee,
                'precision': undefined,
                'limits': {
                    'withdraw': {
                        'min': minWithdraw,
                        'max': maxWithdraw,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }

    /**
     * @method
     * @name zex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.zex.finance/
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    /**
     * @method
     * @name zex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.zex.finance/
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name zex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
     * @see https://docs.zex.finance/
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbols'] = '[' + marketIds.join (',') + ']';
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        const result: Dict = {};
        const tickers = Array.isArray (response) ? response : [ response ];
        const tickersLength = tickers.length;
        for (let i = 0; i < tickersLength; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    /**
     * @ignore
     * @method
     * @description parse a raw ticker
     */
    parseTicker (ticker, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (ticker, 'closeTime');
        const last = this.safeNumber (ticker, 'lastPrice');
        const open = this.safeNumber (ticker, 'openPrice');
        return this.safeTicker (
            {
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': this.safeNumber (ticker, 'highPrice'),
                'low': this.safeNumber (ticker, 'lowPrice'),
                'bid': undefined,
                'bidVolume': undefined,
                'ask': undefined,
                'askVolume': undefined,
                'vwap': this.safeNumber (ticker, 'weightedAvgPrice'),
                'open': open,
                'close': last,
                'last': last,
                'previousClose': undefined,
                'change': this.safeNumber (ticker, 'priceChange'),
                'percentage': this.safeNumber (ticker, 'priceChangePercent'),
                'average': undefined,
                'baseVolume': this.safeNumber (ticker, 'volume'),
                'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
                'info': ticker,
            },
            market
        );
    }

    /**
     * @method
     * @name zex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.zex.finance/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const request: Dict = {
            'id': userId,
        };
        const response = await this.privateGetAssetGetUserAsset (
            this.extend (request, params)
        );
        return this.parseBalance (response);
    }

    /**
     * @ignore
     * @method
     * @description parse balance
     */
    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const entry = this.safeDict (response, i, {});
            const currencyId = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const free = this.safeNumber (entry, 'free');
            const usedSum = Precise.stringAdd (
                this.safeString (entry, 'locked', '0'),
                Precise.stringAdd (
                    this.safeString (entry, 'freeze', '0'),
                    this.safeString (entry, 'withdrawing', '0')
                )
            );
            result[code] = {
                'free': free,
                'used': this.parseNumber (usedSum),
                'total': undefined,
            };
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name zex#createOrder
     * @description create a trade order (LIMIT only)
     * @see https://docs.zex.finance/
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' (only LIMIT orders are supported)
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' createOrder only supports limit orders');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a price for limit orders');
        }
        const userId = await this.getUserId ();
        let nonce = this.safeInteger (params, 'nonce');
        if (nonce === undefined) {
            const nonceResponse = await this.privateGetUserNonce ({ 'id': userId });
            nonce = this.safeInteger (nonceResponse, 'nonce');
        }
        params = this.omit (params, 'nonce');
        const t = Math.floor (this.milliseconds () / 1000);
        const marketId = market['id'];
        const parts = marketId.split ('-');
        const baseToken = this.safeString (parts, 0);
        const quoteToken = this.safeString (parts, 1);
        const sideStr = side.toLowerCase ();
        const amountStr = this.zexFormatDecimal (amount);
        const priceStr = this.zexFormatDecimal (price);
        const nl = "\n"; // eslint-disable-line quotes
        const msgLines = [
            'v: 1',
            'name: ' + sideStr,
            'base token: ' + baseToken,
            'quote token: ' + quoteToken,
            'amount: ' + amountStr,
            'price: ' + priceStr,
            't: ' + t.toString (),
            'nonce: ' + nonce.toString (),
            'user_id: ' + userId.toString (),
        ];
        const msg = msgLines.join (nl) + nl;
        const signature = this.zexSign (msg);
        const request: Dict = {
            'operation': sideStr,
            'base_token': baseToken,
            'quote_token': quoteToken,
            'amount': amountStr,
            'price': priceStr,
            'user_id': userId,
            'nonce': nonce,
            'timestamp': t,
            'signature_type': 'secp256k1',
            'signature': signature,
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        // response is typically { status: 'ok' } (ack, not order status); drop it before merging so parseOrder treats the order as open
        const merged: Dict = this.extend ({
            'nonce': nonce,
            'name': sideStr,
            'base_token': baseToken,
            'quote_token': quoteToken,
            'amount': amountStr,
            'price': priceStr,
            'filled_amount': '0',
            'timestamp': t,
            'status': 'open',
        }, this.omit (response, 'status'));
        const order = this.parseOrder (merged, market);
        const orderId = this.safeString (order, 'id');
        if (orderId !== undefined) {
            this.options['orderNonceCache'][orderId] = nonce;
        }
        return order;
    }

    /**
     * @method
     * @name zex#cancelOrder
     * @description cancel an open order
     * @see https://docs.zex.finance/
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.nonce] the order nonce, required if not cached
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        let orderNonce = this.safeInteger (this.options['orderNonceCache'], id);
        if (orderNonce === undefined) {
            orderNonce = this.safeInteger (params, 'nonce');
        }
        if (orderNonce === undefined) {
            orderNonce = parseInt (id);
        }
        if (orderNonce === undefined) {
            throw new OrderNotFound (this.id + ' cancelOrder: could not find order nonce for order id ' + id);
        }
        const nl = "\n"; // eslint-disable-line quotes
        const msgLines = [
            'v: 1',
            'name: cancel',
            'user_id: ' + userId.toString (),
            'order_nonce: ' + orderNonce.toString (),
        ];
        const msg = msgLines.join (nl) + nl;
        const signature = this.zexSign (msg);
        const request: Dict = {
            'user_id': userId,
            'nonce': orderNonce,
            'signature_type': 'secp256k1',
            'signature': signature,
        };
        const response = await this.privateDeleteOrder (
            this.extend (request, params)
        );
        return this.safeOrder ({ 'id': id, 'info': response, 'status': 'canceled' });
    }

    /**
     * @method
     * @name zex#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.zex.finance/
     * @param {string[]} ids list of order ids
     * @param {string} [symbol] unified symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const orders = [];
        const items = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let orderNonce = this.safeInteger (this.options['orderNonceCache'], id);
            if (orderNonce === undefined) {
                // fall back to interpreting the id as the nonce (zex order ids ARE nonces in this client)
                orderNonce = parseInt (id);
            }
            if (orderNonce === undefined) {
                throw new ArgumentsRequired (this.id + ' cancelOrders: could not resolve nonce for order ' + id);
            }
            const nl = "\n"; // eslint-disable-line quotes
            const msgLines = [
                'v: 1',
                'name: cancel',
                'user_id: ' + userId.toString (),
                'order_nonce: ' + orderNonce.toString (),
            ];
            const msg = msgLines.join (nl) + nl;
            const signature = this.zexSign (msg);
            items.push ({
                'type': 'cancel',
                'user_id': userId,
                'nonce': orderNonce,
                'signature_type': 'secp256k1',
                'signature': signature,
            });
        }
        const request: Dict = {
            'txs': items,
        };
        const response = await this.privatePostBatch (this.extend (request, params));
        // batch ack is { status: 'ok' } with no per-tx results; assume each cancel was accepted
        for (let i = 0; i < ids.length; i++) {
            orders.push (
                this.safeOrder ({ 'id': ids[i], 'info': response, 'status': 'canceled' })
            );
        }
        return orders;
    }

    /**
     * @method
     * @name zex#createOrders
     * @description create a list of trade orders
     * @see https://docs.zex.finance/
     * @param {object[]} orders list of orders, each with symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const items = [];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const symbol = this.safeString (order, 'symbol');
            const type = this.safeString (order, 'type');
            const side = this.safeString (order, 'side');
            const amount = this.safeNumber (order, 'amount');
            const price = this.safeNumber (order, 'price');
            if (type !== 'limit') {
                throw new InvalidOrder (this.id + ' createOrders only supports limit orders');
            }
            const market = this.market (symbol);
            const marketId = market['id'];
            const parts = marketId.split ('-');
            const baseToken = this.safeString (parts, 0);
            const quoteToken = this.safeString (parts, 1);
            const sideStr = side.toLowerCase ();
            const nonceResponse = await this.privateGetUserNonce ({ 'id': userId });
            const nonce = this.safeInteger (nonceResponse, 'nonce');
            const t = Math.floor (this.milliseconds () / 1000);
            const nl = "\n"; // eslint-disable-line quotes
            const amountStr = this.zexFormatDecimal (amount);
            const priceStr = this.zexFormatDecimal (price);
            const msgLines = [
                'v: 1',
                'name: ' + sideStr,
                'base token: ' + baseToken,
                'quote token: ' + quoteToken,
                'amount: ' + amountStr,
                'price: ' + priceStr,
                't: ' + t.toString (),
                'nonce: ' + nonce.toString (),
                'user_id: ' + userId.toString (),
            ];
            const msg = msgLines.join (nl) + nl;
            const signature = this.zexSign (msg);
            items.push ({
                'type': 'order',
                'operation': sideStr,
                'base_token': baseToken,
                'quote_token': quoteToken,
                'amount': amountStr,
                'price': priceStr,
                'user_id': userId,
                'nonce': nonce,
                'timestamp': t,
                'signature_type': 'secp256k1',
                'signature': signature,
            });
        }
        const request: Dict = {
            'txs': items,
        };
        await this.privatePostBatch (this.extend (request, params));
        // batch ack is { status: 'ok' } with no per-tx results; build order structs from submitted items
        const parsedOrders = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const merged: Dict = {
                'nonce': this.safeInteger (item, 'nonce'),
                'name': this.safeString (item, 'operation'),
                'base_token': this.safeString (item, 'base_token'),
                'quote_token': this.safeString (item, 'quote_token'),
                'amount': this.safeString (item, 'amount'),
                'price': this.safeString (item, 'price'),
                'filled_amount': '0',
                'timestamp': this.safeInteger (item, 'timestamp'),
                'status': 'open',
            };
            const parsed = this.parseOrder (merged);
            const orderId = this.safeString (parsed, 'id');
            const orderNonce = this.safeInteger (item, 'nonce');
            if (orderId !== undefined && orderNonce !== undefined) {
                this.options['orderNonceCache'][orderId] = orderNonce;
            }
            parsedOrders.push (parsed);
        }
        return parsedOrders;
    }

    /**
     * @method
     * @name zex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.zex.finance/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const request: Dict = {
            'id': userId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetUserOrders (
            this.extend (request, params)
        );
        const items = this.safeList (response, 'items', []);
        const orders = this.parseOrders (items, market, since, limit);
        return orders;
    }

    /**
     * @method
     * @name zex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.zex.finance/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'open') as Order[];
    }

    /**
     * @method
     * @name zex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.zex.finance/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name zex#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.zex.finance/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'canceled') as Order[];
    }

    /**
     * @ignore
     * @method
     * @description parse a single order
     */
    parseOrder (order, market: Market = undefined): Order {
        const nonce = this.safeInteger (order, 'nonce');
        const id = nonce !== undefined ? nonce.toString () : this.safeString (order, 'id');
        if (id !== undefined && nonce !== undefined) {
            this.options['orderNonceCache'][id] = nonce;
        }
        const baseToken = this.safeString (order, 'base_token');
        const quoteToken = this.safeString (order, 'quote_token');
        const symbol = baseToken + '/' + quoteToken;
        const rawStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (rawStatus);
        const sideRaw = this.safeStringLower (order, 'name');
        const side = sideRaw === 'buy' ? 'buy' : 'sell';
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'amount');
        const filled = this.safeNumber (order, 'filled_amount');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const filledStr = this.safeString (order, 'filled_amount');
        const priceStr = this.safeString (order, 'price');
        const filledCostStr = Precise.stringMul (priceStr, filledStr);
        const feeAmount = (filledCostStr !== undefined) ? this.parseNumber (Precise.stringMul (filledCostStr, '0.002')) : undefined;
        return this.safeOrder (
            {
                'id': id,
                'clientOrderId': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'lastTradeTimestamp': undefined,
                'status': status,
                'symbol': symbol,
                'type': 'limit',
                'timeInForce': undefined,
                'postOnly': undefined,
                'side': side,
                'price': price,
                'stopPrice': undefined,
                'average': undefined,
                'amount': amount,
                'filled': filled,
                'remaining': undefined,
                'cost': this.parseNumber (filledCostStr),
                'trades': undefined,
                'fee': {
                    'cost': feeAmount,
                    'currency': quoteToken,
                },
                'info': order,
            },
            market
        );
    }

    /**
     * @ignore
     * @method
     * @description map raw order status to unified CCXT status
     */
    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'open': 'open',
            'partially_filled': 'open',
            'closed': 'closed',
            'filled': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name zex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.zex.finance/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const request: Dict = {
            'id': userId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetUserTrades (
            this.extend (request, params)
        );
        const items = this.safeList (response, 'items', []);
        return this.parseTrades (items, market, since, limit);
    }

    /**
     * @ignore
     * @method
     * @description parse a single trade
     */
    parseTrade (trade, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const baseToken = this.safeString (trade, 'base_token');
        const quoteToken = this.safeString (trade, 'quote_token');
        const symbol = baseToken + '/' + quoteToken;
        const priceStr = this.safeString (trade, 'price');
        const amountStr = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceStr);
        const amount = this.parseNumber (amountStr);
        const cost = this.parseNumber (Precise.stringMul (priceStr, amountStr));
        const sideRaw = this.safeStringLower (trade, 'name');
        const side = sideRaw === 'buy' ? 'buy' : 'sell';
        const orderId = this.safeString (trade, 'taker_order_id');
        let feeAmount = this.safeNumber (trade, 'fee');
        if (feeAmount === undefined && cost !== undefined) {
            feeAmount = cost * 0.002;
        }
        return this.safeTrade (
            {
                'id': id,
                'info': trade,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'symbol': symbol,
                'order': orderId,
                'type': 'limit',
                'side': side,
                'takerOrMaker': 'taker',
                'price': price,
                'amount': amount,
                'cost': cost,
                'fee': {
                    'cost': feeAmount,
                    'currency': quoteToken,
                },
            },
            market
        );
    }

    /**
     * @method
     * @name zex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.zex.finance/
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const request: Dict = {
            'id': userId,
        };
        const response = await this.privateGetUserDeposits (
            this.extend (request, params)
        );
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit, {
            'type': 'deposit',
        });
    }

    /**
     * @method
     * @name zex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.zex.finance/
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const request: Dict = {
            'id': userId,
        };
        const response = await this.privateGetUserWithdraws (
            this.extend (request, params)
        );
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (response, currency, since, limit, {
            'type': 'withdrawal',
        });
    }

    /**
     * @ignore
     * @method
     * @description parse a deposit or withdrawal transaction
     */
    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        const currencyId = this.safeString (transaction, 'token_name');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        const rawStatus = this.safeString (transaction, 'status');
        const status = this.parseTransactionStatus (rawStatus);
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'id', 'nonce'),
            'txid': this.safeString (transaction, 'tx_hash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': this.safeString (transaction, 'chain'),
            'address': this.safeString2 (transaction, 'destination', 'to'),
            'addressTo': this.safeString2 (transaction, 'destination', 'to'),
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': this.safeInteger (transaction, 'sequence_timestamp'),
            'internal': false,
            'comment': this.safeString (transaction, 'fail_reason'),
            'fee': {
                'currency': this.safeCurrencyCode (this.safeString (transaction, 'fee_token_name'), currency),
                'cost': this.safeNumber (transaction, 'fee'),
            },
        };
    }

    /**
     * @ignore
     * @method
     * @description map raw transaction status to unified CCXT status
     */
    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'pending': 'pending',
            'successful': 'ok',
            'rejected': 'failed',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name zex#withdraw
     * @description make a withdrawal
     * @see https://docs.zex.finance/
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] withdrawal tag (not used by zex)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.chain the chain to withdraw on (e.g. 'EVM', 'BTC')
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const userId = await this.getUserId ();
        const chain = this.safeString (params, 'chain');
        if (chain === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires a chain parameter (e.g. EVM, BTC)');
        }
        const nonceResponse = await this.privateGetUserNonce ({ 'id': userId });
        const nonce = this.safeInteger (nonceResponse, 'nonce');
        const t = this.milliseconds ();
        const amountStr = this.zexFormatDecimal (amount);
        const nl = "\n"; // eslint-disable-line quotes
        const msg = '1' + nl + 'withdraw' + nl + chain + nl + currency['id'] + nl + amountStr + nl + address + nl + t.toString () + nl + nonce.toString () + nl + userId.toString ();
        const signature = this.zexSign (msg);
        const request: Dict = {
            'chain': chain,
            'token_name': currency['id'],
            'amount': amountStr,
            'to': address,
            't': t,
            'nonce': nonce,
            'user_id': userId,
            'signature': signature,
        };
        const response = await this.privatePostWithdraw (
            this.extend (this.omit (request, 'chain'), { 'chain': chain }, params)
        );
        return this.parseTransaction (response, currency);
    }

    /**
     * @method
     * @name zex#transfer
     * @description transfer currency internally between wallets on the same exchange
     * @see https://docs.zex.finance/
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount not used — transfers are always from your account
     * @param {string} toAccount recipient user ID as a string
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const userId = await this.getUserId ();
        const recipientId = parseInt (toAccount);
        const nonceResponse = await this.privateGetUserNonce ({ 'id': userId });
        const nonce = this.safeInteger (nonceResponse, 'nonce');
        const t = Math.floor (this.milliseconds () / 1000);
        const amountStr = this.zexFormatDecimal (amount);
        const nl = "\n"; // eslint-disable-line quotes
        const msgLines = [
            'v: 1',
            'token_name: ' + currency['id'],
            'amount: ' + amountStr,
            'recipient_id: ' + recipientId.toString (),
            't: ' + t.toString (),
            'nonce: ' + nonce.toString (),
            'user_id: ' + userId.toString (),
        ];
        const msg = msgLines.join (nl) + nl;
        const signature = this.zexSign (msg);
        const request: Dict = {
            'token_name': currency['id'],
            'recipient_id': recipientId,
            'amount': amountStr,
            'user_id': userId,
            'nonce': nonce,
            'timestamp': t,
            'signature_type': 'secp256k1',
            'signature': signature,
        };
        const response = await this.privatePostTransfer (
            this.extend (request, params)
        );
        return this.parseTransfer (response, currency);
    }

    /**
     * @ignore
     * @method
     * @description parse a transfer response
     */
    parseTransfer (transfer, currency: Currency = undefined): TransferEntry {
        const currencyId = this.safeString (transfer, 'token_name');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (
            transfer,
            'timestamp',
            this.milliseconds ()
        );
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': undefined,
            'toAccount': this.safeString (transfer, 'recipient_id'),
            'status': 'ok',
        };
    }

    /**
     * @method
     * @name zex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated to this account
     * @see https://docs.zex.finance/
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.vm the VM type for the address (EVM, SVM, TVM, BTC)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const vm = this.safeString (params, 'vm');
        if (vm === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a vm parameter (EVM, SVM, TVM, BTC)');
        }
        const request: Dict = {
            'id': userId,
            'vm': vm,
        };
        const response = await this.privateGetUserAddress (
            this.extend (request, this.omit (params, 'vm'))
        );
        const address = this.safeString (response, 'address');
        return {
            'info': response,
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': vm,
        } as DepositAddress;
    }

    /**
     * @method
     * @name zex#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @see https://docs.zex.finance/
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.chain the chain to get fee for (e.g. 'EVM')
     * @returns {object} a fee structure
     */
    async fetchDepositWithdrawFee (code: string, params = {}): Promise<DepositWithdrawFee> {
        await this.loadMarkets ();
        if (this.currencies === undefined || Object.keys (this.currencies).length === 0) {
            await this.fetchCurrencies ();
        }
        const currency = this.currency (code);
        const chainParam = this.safeString (params, 'chain');
        params = this.omit (params, 'chain');
        let chains = undefined;
        if (chainParam !== undefined) {
            chains = [ chainParam ];
        } else {
            const networks = this.safeDict (currency, 'networks', {});
            const networkIds = Object.keys (networks);
            chains = [];
            for (let i = 0; i < networkIds.length; i++) {
                const network = this.safeDict (networks, networkIds[i], {});
                const networkId = this.safeString (network, 'id', networkIds[i]);
                chains.push (networkId);
            }
        }
        const result: Dict = {
            'info': {},
            'withdraw': { 'fee': undefined, 'percentage': false },
            'deposit': { 'fee': undefined, 'percentage': undefined },
            'networks': {},
        };
        const infoByChain: Dict = {};
        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];
            const request: Dict = {
                'token_name': currency['id'],
                'chain': chain,
            };
            const response = await this.publicGetWithdrawFee (this.extend (request, params));
            const fee = this.safeNumber (response, 'fee');
            infoByChain[chain] = response;
            result['networks'][chain] = {
                'withdraw': { 'fee': fee, 'percentage': false },
                'deposit': { 'fee': undefined, 'percentage': undefined },
            };
            if (result['withdraw']['fee'] === undefined) {
                result['withdraw']['fee'] = fee;
            }
        }
        result['info'] = infoByChain;
        return result as DepositWithdrawFee;
    }

    /**
     * @ignore
     * @method
     * @description handle errors from the exchange
     */
    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody): any {
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeString (response, 'code');
        const msg = this.safeString2 (response, 'msg', 'error');
        if (code !== undefined && code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                code,
                feedback
            );
            this.throwBroadlyMatchedException (
                this.exceptions['broad'],
                msg,
                feedback
            );
            throw new ExchangeError (feedback);
        }
        if (msg !== undefined && code === undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (
                this.exceptions['broad'],
                msg,
                feedback
            );
        }
        return undefined;
    }

    /**
     * @ignore
     * @method
     * @description sign a request
     */
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url = url + '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url = url + '?' + this.urlencode (query);
                }
            } else {
                // POST / DELETE: body is JSON with signature already set
                headers = {
                    'Content-Type': 'application/json',
                };
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
