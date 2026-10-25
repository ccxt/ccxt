//  ---------------------------------------------------------------------------

import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from './abstract/reya.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ecdsa } from './base/functions/crypto.js';
import type { int, Account, Balances, Currency, Dict, Endpoint, FundingRate, FundingRates, Int, Market, Num, NullableDict, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry } from './base/types.js';

/**
 * @class reya
 * @augments Exchange
 */
export default class reya extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'reya',
            'name': 'Reya',
            'version': 'v2',
            'rateLimit': 200,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createStopOrder': false,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchDeposits': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
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
                'fetchTrades': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': undefined,
                'api': { 'public': 'https://api.reya.xyz', 'private': 'https://api.reya.xyz' },
                'test': { 'public': 'https://api-devnet.reya-cronos.network', 'private': 'https://api-devnet.reya-cronos.network' },
                'www': 'https://reya.xyz',
                'doc': [ 'https://docs.reya.xyz/developers', 'https://github.com/Reya-Labs/reya-api-specs' ],
                'fees': 'https://docs.reya.xyz',
            },
            'requiredCredentials': { 'apiKey': false, 'secret': false, 'walletAddress': true, 'privateKey': true },
            'precisionMode': TICK_SIZE,
            'timeframes': { '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m', '1h': '1h', '4h': '4h', '1d': '1d' },
            'api': {
                'public': {
                    'get': {
                        'perpMarketDefinitions': { 'cost': 1 } as Endpoint<Dict[]>,
                        'perpMarkets/summary': { 'cost': 1 } as Endpoint<Dict[]>,
                        'perpMarket/{symbol}/summary': 1,
                        'market/{symbol}/depth': 1,
                        'market/{symbol}/perpExecutions': 1,
                        'candleHistory/{symbol}/{resolution}': 1,
                        'assetDefinitions': { 'cost': 1 } as Endpoint<Dict[]>,
                        'assetOraclePrices': { 'cost': 1 } as Endpoint<Dict[]>,
                        'feeTiers': { 'cost': 1 } as Endpoint<Dict[]>,
                        'globalFeeParameters': 1,
                    },
                },
                'private': {
                    'get': {
                        'wallet/{address}/accounts': { 'cost': 1 } as Endpoint<Dict[]>,
                        'wallet/{address}/accountBalances': { 'cost': 1 } as Endpoint<Dict[]>,
                        'wallet/{address}/positions': { 'cost': 1 } as Endpoint<Dict[]>,
                        'wallet/{address}/configuration': 1,
                        'wallet/{address}/openOrders': { 'cost': 1 } as Endpoint<Dict[]>,
                        'wallet/{address}/orderHistory': 1,
                        'wallet/{address}/perpExecutions': 1,
                        'wallet/{address}/transfers': 1,
                    },
                    'post': { 'createOrder': 1, 'cancelOrder': 1, 'cancelAll': 1 },
                },
            },
            'options': {
                'defaultType': 'swap',
                'accountId': undefined,
                'lastNonce': 0,
                'slippage': 0.005,
                'deadlineSeconds': 30,
                'mainnet': { 'chainId': 1729, 'exchangeId': 2, 'ordersGateway': '0xfc8c96be87da63cecddbf54abfa7b13ee8044739' },
                'sandbox': { 'chainId': 89346162, 'exchangeId': 1, 'ordersGateway': '0x7Ec89E555c771D2B5939aBE5C4E4291852633D4D' },
            },
            'features': {
                'swap': {
                    'linear': {
                        'sandbox': true,
                        'createOrder': {
                            'marginMode': false,
                            'triggerPrice': false,
                            'triggerPriceType': undefined,
                            'triggerDirection': false,
                            'stopLossPrice': false,
                            'takeProfitPrice': false,
                            'attachedStopLossTakeProfit': undefined,
                            'timeInForce': {
                                'GTC': true,
                                'IOC': true,
                                'FOK': false,
                                'PO': false, // use params.postOnly with GTC or venue-specific GTT
                                'GTD': false, // venue-specific GTT uses params.expiresAfter
                            },
                            'hedged': false,
                            'trailing': false,
                            'leverage': false,
                            'marketBuyByCost': false,
                            'marketBuyRequiresPrice': false,
                            'selfTradePrevention': false,
                            'iceberg': false,
                        },
                        'createOrders': undefined,
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
                            'limit': undefined,
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
                        'fetchClosedOrders': undefined,
                        'fetchOHLCV': { 'limit': 200 },
                    },
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    'INPUT_VALIDATION_ERROR': BadRequest,
                    'INVALID_SIGNATURE_ERROR': AuthenticationError,
                    'UNAUTHORIZED_SIGNATURE_ERROR': AuthenticationError,
                    'SYMBOL_NOT_FOUND_ERROR': BadSymbol,
                    'NO_ACCOUNTS_FOUND_ERROR': AuthenticationError,
                    'INVALID_NONCE_ERROR': InvalidNonce,
                    'UNAUTHORIZED_ERROR': PermissionDenied,
                    'UNAUTHORIZED_SIGNER_ERROR': PermissionDenied,
                    'ACCOUNT_NOT_FOUND_ERROR': AuthenticationError,
                    'MARKET_NOT_FOUND_ERROR': BadSymbol,
                    'ORDER_NOT_FOUND_ERROR': OrderNotFound,
                    'POST_ONLY_WOULD_CROSS_ERROR': InvalidOrder,
                    'INSUFFICIENT_MARGIN_ERROR': InsufficientFunds,
                    'RATE_LIMITED_ERROR': RateLimitExceeded,
                    'CAPACITY_LIMITED_ERROR': ExchangeNotAvailable,
                    'SERVICE_UNAVAILABLE_ERROR': ExchangeNotAvailable,
                    'ORDER_OUTCOME_UNKNOWN_ERROR': RequestTimeout,
                },
                'broad': {},
            },
        });
    }

    /** @ignore */
    reyaAccountId (params: Dict = {}): number {
        const raw = this.safeString (params, 'accountId', this.safeString (this.options, 'accountId'));
        const accountId = this.safeInteger (params, 'accountId', this.safeInteger (this.options, 'accountId'));
        if (accountId === undefined || accountId <= 0 || accountId > 9007199254740991 || !Precise.stringEq (raw, this.numberToString (accountId))) {
            throw new ArgumentsRequired (this.id + ' requires a positive safe-integer options.accountId or params.accountId');
        }
        return accountId;
    }

    /** @ignore */
    reyaWalletAddress (): string {
        if (this.walletAddress === undefined || this.walletAddress.length === 0) {
            throw new ArgumentsRequired (this.id + ' requires walletAddress (the owner, not the delegated signer)');
        }
        return this.walletAddress;
    }

    /** @ignore */
    reyaNetwork (): Dict {
        const network = this.isSandboxModeEnabled ? 'sandbox' : 'mainnet';
        return this.safeDict (this.options, network, {});
    }

    /**
     * @method
     * @name reya#fetchMarkets
     * @description fetch perpetual market definitions and trading increments
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/openapi-trading-v2.yaml
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of market structures
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const response = await this.publicGetPerpMarketDefinitions (params);
        return this.parseMarkets (response);
    }

    /** @ignore */
    override parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        if (marketId === undefined || !marketId.endsWith ('RUSDPERP')) {
            throw new BadSymbol (this.id + ' invalid perpetual symbol');
        }
        const baseId = marketId.slice (0, -8);
        const base = this.safeCurrencyCode (baseId);
        return this.safeMarketStructure ({
            'id': marketId, 'symbol': base + '/RUSD:RUSD', 'base': base, 'quote': 'RUSD', 'settle': 'RUSD',
            'baseId': baseId, 'quoteId': 'RUSD', 'settleId': 'RUSD',
            'type': 'swap', 'spot': false, 'margin': false, 'swap': true, 'future': false, 'option': false,
            'active': this.safeString (market, 'status') === 'TRADING',
            'contract': true, 'linear': true, 'inverse': false, 'contractSize': 1,
            'expiry': undefined, 'expiryDatetime': undefined, 'strike': undefined, 'optionType': undefined,
            'precision': { 'amount': this.safeNumber (market, 'qtyStepSize'), 'price': this.safeNumber (market, 'tickSize') },
            'limits': {
                'amount': { 'min': this.safeNumber (market, 'minOrderQty'), 'max': undefined },
                'price': { 'min': this.safeNumber (market, 'tickSize'), 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
                'leverage': { 'min': 1, 'max': this.safeNumber (market, 'maxLeverage') },
            },
            'marginModes': { 'cross': true, 'isolated': false },
            'info': market,
        });
    }

    /**
     * @method
     * @name reya#fetchOrderBook
     * @description fetch a bounded L2 order book snapshot
     * @param {string} symbol unified market symbol
     * @param {int} [limit] maximum levels per side, up to 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an order book structure
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'symbol': market['id'] };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.publicGetMarketSymbolDepth (this.extend (request, params));
        return this.parseOrderBook (response, symbol, this.safeInteger (response, 'updatedAt'), 'bids', 'asks', 'px', 'qty');
    }

    /** @ignore */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'updatedAt');
        return this.safeTicker ({
            'symbol': this.safeSymbol (this.safeString (ticker, 'symbol'), market),
            'timestamp': timestamp, 'datetime': this.iso8601 (timestamp),
            'high': undefined, 'low': undefined, 'bid': undefined, 'bidVolume': undefined,
            'ask': undefined, 'askVolume': undefined, 'vwap': undefined, 'open': undefined,
            'close': undefined, 'last': undefined, 'previousClose': undefined,
            'change': this.safeString (ticker, 'pxChange24h'), 'percentage': undefined, 'average': undefined,
            'baseVolume': undefined, 'quoteVolume': this.safeString (ticker, 'volume24h'),
            'markPrice': this.safeNumber (ticker, 'markPrice'), 'indexPrice': this.safeNumber (ticker, 'oraclePrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name reya#fetchTicker
     * @description fetch market summary; last trade price is not provided by this endpoint
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a ticker structure
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetPerpMarketSymbolSummary (this.extend ({ 'symbol': market['id'] }, params));
        return this.parseTicker (response, market);
    }

    /**
     * @method
     * @name reya#fetchTickers
     * @description fetch all perpetual market summaries
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} ticker structures indexed by symbol
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetPerpMarketsSummary (params);
        return this.parseTickers (response, symbols);
    }

    /** @ignore */
    override parseFundingRate (fundingRate: any, market: Market = undefined): FundingRate {
        const timestamp = this.safeInteger (fundingRate, 'updatedAt');
        return {
            'info': fundingRate, 'symbol': this.safeSymbol (this.safeString (fundingRate, 'symbol'), market),
            'timestamp': timestamp, 'datetime': this.iso8601 (timestamp),
            'markPrice': this.safeNumber (fundingRate, 'markPrice'), 'indexPrice': this.safeNumber (fundingRate, 'oraclePrice'),
            'interestRate': undefined, 'estimatedSettlePrice': undefined,
            'fundingRate': this.parseNumber (Precise.stringDiv (this.safeString (fundingRate, 'fundingRate'), '100')), 'interval': '1h',
            'fundingTimestamp': undefined, 'fundingDatetime': undefined,
            'nextFundingRate': undefined, 'nextFundingTimestamp': undefined, 'nextFundingDatetime': undefined,
            'previousFundingRate': undefined, 'previousFundingTimestamp': undefined, 'previousFundingDatetime': undefined,
        };
    }

    /**
     * @method
     * @name reya#fetchFundingRate
     * @description fetch the current hourly funding rate; funding accrues continuously
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a funding rate structure
     */
    override async fetchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetPerpMarketSymbolSummary (this.extend ({ 'symbol': market['id'] }, params));
        return this.parseFundingRate (response, market);
    }

    /**
     * @method
     * @name reya#fetchFundingRates
     * @description fetch current hourly funding rates
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} funding rate structures indexed by symbol
     */
    override async fetchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const response = await this.publicGetPerpMarketsSummary (params);
        return this.parseFundingRates (response, symbols);
    }

    /**
     * @method
     * @name reya#fetchOHLCV
     * @description fetch up to 200 candles; volume is undefined because Reya does not return it
     * @param {string} symbol unified market symbol
     * @param {string} [timeframe] candle interval
     * @param {int} [since] earliest candle timestamp in milliseconds
     * @param {int} [limit] maximum candles, up to 200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] latest candle timestamp in milliseconds
     * @returns {object[]} OHLCV arrays
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const duration = this.parseTimeframe (timeframe) * 1000;
        const candleLimit = (limit === undefined) ? 200 : Math.min (limit, 200);
        let endTime = this.milliseconds ();
        if (since !== undefined) {
            endTime = Math.min (endTime, this.sum (since, duration * (candleLimit - 1)));
        }
        const until = this.safeInteger (params, 'until', endTime);
        const request: Dict = { 'symbol': market['id'], 'resolution': this.safeString (this.timeframes, timeframe, timeframe), 'endTime': until };
        const response = await this.publicGetCandleHistorySymbolResolution (this.extend (request, this.omit (params, 'until')));
        const timestamps = this.safeList (response, 't', []);
        const opens = this.safeList (response, 'o', []);
        const highs = this.safeList (response, 'h', []);
        const lows = this.safeList (response, 'l', []);
        const closes = this.safeList (response, 'c', []);
        const result = [];
        for (let i = 0; i < timestamps.length; i++) {
            result.push ([ this.safeTimestamp (timestamps, i), this.safeNumber (opens, i), this.safeNumber (highs, i), this.safeNumber (lows, i), this.safeNumber (closes, i), undefined ]);
        }
        return this.filterBySinceLimit (this.sortBy (result, 0), since, candleLimit, 0, since === undefined) as OHLCV[];
    }

    /** @ignore */
    reyaHistoryRequest (since: Int, limit: Int, params: Dict): Dict {
        let request: Dict = {};
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 100);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        request = this.extend (request, this.omit (params, [ 'until', 'accountId' ]));
        return request;
    }

    /** @ignore */
    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        return this.safeTrade (this.parseReyaTrade (trade, market), market);
    }

    /** @ignore */
    parseReyaTrade (trade: Dict, market: Market = undefined, accountId: Str = undefined): Trade {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const isMaker = accountId !== undefined && this.safeString (trade, 'makerAccountId') === accountId;
        const isTaker = accountId !== undefined && this.safeString (trade, 'takerAccountId') === accountId;
        let side = (this.safeString (trade, 'side') === 'B') ? 'buy' : 'sell';
        if (isMaker) {
            side = (side === 'buy') ? 'sell' : 'buy';
        }
        let fee = undefined;
        let orderId = undefined;
        let takerOrMaker = undefined;
        if (isMaker || isTaker) {
            orderId = isMaker ? this.safeString (trade, 'makerOrderId') : this.safeString (trade, 'takerOrderId');
            takerOrMaker = isMaker ? 'maker' : 'taker';
            const feeCost = isMaker ? this.safeString (trade, 'makerFee', '0') : this.safeString (trade, 'takerFee');
            fee = { 'currency': 'RUSD', 'cost': feeCost };
        }
        return this.safeTrade ({
            'info': trade, 'id': this.safeString (trade, 'sequenceNumber'), 'order': orderId,
            'timestamp': timestamp, 'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (this.safeString (trade, 'symbol'), market),
            'type': undefined, 'side': side, 'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'), 'amount': this.safeString (trade, 'qty'), 'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name reya#fetchTrades
     * @description fetch settled public executions
     * @param {string} symbol unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum entries, up to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.cursor] opaque pagination cursor
     * @param {int} [params.until] latest timestamp in milliseconds
     * @returns {object[]} trade structures
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({ 'symbol': market['id'] }, this.reyaHistoryRequest (since, limit, params));
        const response = await this.publicGetMarketSymbolPerpExecutions (request);
        return this.parseTrades (this.safeList (response, 'data', []), market, since, limit);
    }

    /**
     * @method
     * @name reya#fetchAccounts
     * @description fetch accounts owned by walletAddress
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} account structures
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        const response = await this.privateGetWalletAddressAccounts (this.extend ({ 'address': this.reyaWalletAddress () }, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const account = response[i];
            result.push ({ 'id': this.safeString (account, 'accountId'), 'type': this.safeString (account, 'type'), 'code': 'RUSD', 'info': account });
        }
        return result;
    }

    /**
     * @method
     * @name reya#fetchBalance
     * @description fetch realized balances for one account; free margin and unrealized PnL are not reported by this endpoint
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id, defaults to options.accountId
     * @returns {object} a balance structure with total balances only
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        const accountId = this.numberToString (this.reyaAccountId (params));
        const response = await this.privateGetWalletAddressAccountBalances (this.extend ({ 'address': this.reyaWalletAddress () }, this.omit (params, 'accountId')));
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            if (this.safeString (entry, 'accountId') === accountId) {
                const code = this.safeCurrencyCode (this.safeString (entry, 'asset'));
                const account = this.account ();
                account['total'] = this.safeString (entry, 'realBalance');
                if (code !== undefined) {
                    result[code] = account;
                }
            }
        }
        return this.safeBalance (result);
    }

    /** @ignore */
    async reyaTransferHistory (movementType: string, code: Str, since: Int, limit: Int, params: Dict): Promise<Dict[]> {
        const accountId = this.numberToString (this.reyaAccountId (params));
        const maxPages = this.safeInteger (params, 'paginationCalls', 10);
        const maxResults = (limit === undefined) ? 100 : this.parseToInt (limit);
        if (maxResults < 1 || maxPages < 1) {
            throw new BadRequest (this.id + ' limit and paginationCalls must be positive integers');
        }
        const query = this.omit (params, [ 'paginationCalls', 'limit', 'address', 'type' ]);
        const request: Dict = this.extend ({ 'address': this.reyaWalletAddress (), 'type': movementType }, this.reyaHistoryRequest (since, undefined, query));
        const currencyCode = this.safeCurrencyCode (code);
        const result = [];
        let collected = 0;
        const seenEntries: Dict = {};
        const seenCursors: Dict = {};
        const initialCursor = this.safeString (request, 'cursor');
        if (initialCursor !== undefined) {
            seenCursors[initialCursor] = true;
        }
        for (let page = 0; page < maxPages; page++) {
            request['limit'] = 100;
            const response = await this.privateGetWalletAddressTransfers (request);
            const rows = this.safeList (response, 'data', []);
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowCode = this.safeCurrencyCode (this.safeString (row, 'asset'));
                if (this.safeString (row, 'accountId') !== accountId || this.safeString (row, 'type') !== movementType || (currencyCode !== undefined && rowCode !== currencyCode)) {
                    continue;
                }
                const timestamp = this.safeInteger (row, 'timestamp');
                if (since !== undefined && timestamp !== undefined && timestamp < since) {
                    continue;
                }
                const entryId = this.safeString (row, 'sequenceNumber');
                if (entryId !== undefined && this.safeBool (seenEntries, entryId, false)) {
                    continue;
                }
                if (entryId !== undefined) {
                    seenEntries[entryId] = true;
                }
                result.push (row);
                collected += 1;
                if (collected >= maxResults) {
                    break;
                }
            }
            if (collected >= maxResults) {
                break;
            }
            const meta = this.safeDict (response, 'meta', {});
            const cursor = this.safeString (meta, 'nextCursor');
            if (cursor === undefined) {
                break;
            }
            if (this.safeBool (seenCursors, cursor, false)) {
                throw new ExchangeError (this.id + ' transfers history cursor did not advance');
            }
            seenCursors[cursor] = true;
            request['cursor'] = cursor;
        }
        return result;
    }

    /** @ignore */
    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const transactionType = this.safeStringLower (transaction, 'type');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'sequenceNumber'),
            'txid': this.safeString (transaction, 'transactionHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': transactionType,
            'amount': this.parseNumber (Precise.stringAbs (this.safeString (transaction, 'amount'))),
            'currency': this.safeCurrencyCode (this.safeString (transaction, 'asset'), currency),
            // A settled Reya debit does not establish destination-chain arrival or pending status.
            'status': (transactionType === 'deposit') ? 'ok' : undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }

    /** @ignore */
    override parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const timestamp = this.safeInteger (transfer, 'timestamp');
        const amount = this.safeString (transfer, 'amount');
        const outgoing = Precise.stringLt (amount, '0');
        const accountId = this.safeString (transfer, 'accountId');
        const counterparty = this.safeString (transfer, 'counterpartyAccountId');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'sequenceNumber'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (this.safeString (transfer, 'asset'), currency),
            'amount': this.parseNumber (Precise.stringAbs (amount)),
            'fromAccount': (outgoing) ? accountId : counterparty,
            'toAccount': (outgoing) ? counterparty : accountId,
            'status': 'ok',
        };
    }

    /**
     * @method
     * @name reya#fetchDeposits
     * @description fetch settled deposits credited to one Reya account; IDs and transaction hashes identify Reya ledger settlement, with no source network or address metadata
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/openapi-trading-v2.yaml
     * @param {string} [code] unified currency code
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum entries to return, defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] account id, defaults to options.accountId
     * @param {string} [params.cursor] opaque cursor from the raw transfers response meta.nextCursor
     * @param {int} [params.until] latest timestamp in milliseconds
     * @param {int} [params.paginationCalls] maximum wallet pages to read, defaults to 10; pages containing only other accounts or assets are skipped
     * @returns {object[]} a list of transaction structures
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const rows = await this.reyaTransferHistory ('DEPOSIT', code, since, limit, params);
        return this.parseTransactions (rows, undefined, since, limit);
    }

    /**
     * @method
     * @name reya#fetchWithdrawals
     * @description fetch settled Reya-side withdrawal debits for one account; status is unknown because destination-chain arrival is not reported
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/openapi-trading-v2.yaml
     * @param {string} [code] unified currency code
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum entries to return, defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] account id, defaults to options.accountId
     * @param {string} [params.cursor] opaque cursor from the raw transfers response meta.nextCursor
     * @param {int} [params.until] latest timestamp in milliseconds
     * @param {int} [params.paginationCalls] maximum wallet pages to read, defaults to 10; pending and destination-completed bridge transactions are not distinguished
     * @returns {object[]} a list of transaction structures with unknown destination status, network, addresses and fee
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const rows = await this.reyaTransferHistory ('WITHDRAWAL', code, since, limit, params);
        return this.parseTransactions (rows, undefined, since, limit);
    }

    /**
     * @method
     * @name reya#fetchTransfers
     * @description fetch settled internal transfers for one account; each id identifies that account's ledger leg and local account filtering avoids counting both sides of a same-wallet transfer
     * @see https://github.com/Reya-Labs/reya-api-specs/blob/main/openapi-trading-v2.yaml
     * @param {string} [code] unified currency code
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum entries to return, defaults to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] account id, defaults to options.accountId
     * @param {string} [params.cursor] opaque cursor from the raw transfers response meta.nextCursor
     * @param {int} [params.until] latest timestamp in milliseconds
     * @param {int} [params.paginationCalls] maximum wallet pages to read, defaults to 10; identical movements sharing a transaction hash remain distinct
     * @returns {object[]} a list of transfer structures with positive amounts and source/destination account IDs
     */
    override async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        const rows = await this.reyaTransferHistory ('TRANSFER', code, since, limit, params);
        return this.parseTransfers (rows, undefined, since, limit);
    }

    /** @ignore */
    override parsePosition (position: Dict, market: Market = undefined): Position {
        const side = this.safeString (position, 'side');
        return this.safePosition ({
            'info': position, 'id': undefined, 'symbol': this.safeSymbol (this.safeString (position, 'symbol'), market),
            'timestamp': undefined, 'datetime': undefined, 'lastUpdateTimestamp': undefined,
            'hedged': false, 'side': (side === 'B') ? 'long' : 'short',
            'contracts': this.safeNumber (position, 'qty'), 'contractSize': 1,
            'entryPrice': this.safeNumber (position, 'avgEntryPrice'), 'markPrice': undefined,
            'notional': undefined, 'leverage': undefined, 'collateral': undefined,
            'initialMargin': undefined, 'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined, 'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined, 'liquidationPrice': undefined, 'marginRatio': undefined,
            'marginMode': 'cross', 'percentage': undefined,
        });
    }

    /**
     * @method
     * @name reya#fetchPositions
     * @description fetch positions for one account
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id, defaults to options.accountId
     * @returns {object[]} position structures
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const accountId = this.numberToString (this.reyaAccountId (params));
        const response = await this.privateGetWalletAddressPositions (this.extend ({ 'address': this.reyaWalletAddress () }, this.omit (params, 'accountId')));
        const positions = [];
        for (let i = 0; i < response.length; i++) {
            if (this.safeString (response[i], 'accountId') === accountId) {
                positions.push (this.parsePosition (response[i]));
            }
        }
        return this.filterByArrayPositions (positions, 'symbol', symbols);
    }

    /** @ignore */
    override parseOrder (order: Dict, market: Market = undefined): Order {
        const timestamp = this.safeInteger (order, 'createdAt');
        const statuses: Dict = { 'OPEN': 'open', 'FILLED': 'closed', 'CANCELLED': 'canceled' };
        const status = this.safeString (statuses, this.safeString (order, 'status'));
        const orderType = this.safeString (order, 'orderType');
        const sides: Dict = { 'B': 'buy', 'A': 'sell' };
        const trigger = orderType === 'STOP_LOSS' || orderType === 'TAKE_PROFIT';
        return this.safeOrder ({
            'info': order, 'id': this.safeString (order, 'orderId'), 'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp, 'datetime': this.iso8601 (timestamp), 'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'lastUpdateAt'),
            'symbol': this.safeSymbol (this.safeString (order, 'symbol'), market),
            'type': (orderType === undefined) ? undefined : 'limit', 'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': this.safeBool (order, 'postOnly'), 'reduceOnly': trigger || this.safeBool (order, 'reduceOnly', false),
            'side': this.safeString (sides, this.safeString (order, 'side')), 'price': this.safeString (order, 'limitPx'),
            'triggerPrice': this.safeString (order, 'triggerPx'), 'amount': this.safeString (order, 'qty'),
            'filled': this.safeString (order, 'cumQty'), 'remaining': undefined, 'average': this.safeString (order, 'avgFillPx'),
            'cost': undefined, 'status': status, 'fee': undefined, 'trades': undefined,
        }, market);
    }

    /** @ignore */
    reyaFilterOrders (orders: Dict[], accountId: number): Dict[] {
        const result: Dict = {};
        const account = this.numberToString (accountId);
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const orderId = this.safeString (order, 'orderId');
            if (this.safeString (order, 'accountId') === account) {
                const previous = this.safeDict (result, orderId, {});
                if (this.safeInteger (order, 'sequenceNumber', 0) >= this.safeInteger (previous, 'sequenceNumber', 0)) {
                    if (orderId !== undefined) {
                        result[orderId] = order;
                    }
                }
            }
        }
        return this.toArray (result);
    }

    /**
     * @method
     * @name reya#fetchOpenOrders
     * @description fetch current open orders for one account
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest order creation timestamp in milliseconds
     * @param {int} [limit] maximum entries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @returns {object[]} order structures
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const accountId = this.reyaAccountId (params);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const response = await this.privateGetWalletAddressOpenOrders (this.extend ({ 'address': this.reyaWalletAddress () }, this.omit (params, 'accountId')));
        return this.parseOrders (this.reyaFilterOrders (response, accountId), market, since, limit);
    }

    /**
     * @method
     * @name reya#fetchOrders
     * @description fetch one page of order history, keeping the newest event per order within that page
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest event timestamp in milliseconds
     * @param {int} [limit] maximum events per page, up to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @param {string} [params.cursor] opaque pagination cursor
     * @param {int} [params.until] latest event timestamp in milliseconds
     * @returns {object[]} order structures
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const accountId = this.reyaAccountId (params);
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const request = this.extend ({ 'address': this.reyaWalletAddress () }, this.reyaHistoryRequest (since, limit, params));
        const response = await this.privateGetWalletAddressOrderHistory (request);
        return this.parseOrders (this.reyaFilterOrders (this.safeList (response, 'data', []), accountId), market, undefined, limit);
    }

    /**
     * @method
     * @name reya#fetchOrder
     * @description look up an order in open orders and paginated event history
     * @param {string} id exchange order id
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @param {int} [params.maxPages] maximum history pages to search, defaults to 20
     * @returns {object} an order structure
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const accountId = this.reyaAccountId (params);
        const maxPages = this.safeInteger (params, 'maxPages', 20);
        const query = this.omit (params, 'maxPages');
        const openOrders = await this.fetchOpenOrders (symbol, undefined, undefined, query);
        for (let i = 0; i < openOrders.length; i++) {
            const openOrder = this.safeDict (openOrders, i);
            if (this.safeString (openOrder, 'id') === id) {
                return openOrder as Order;
            }
        }
        const request: Dict = this.extend ({ 'address': this.reyaWalletAddress () }, this.omit (query, 'accountId'));
        for (let page = 0; page < maxPages; page++) {
            const response = await this.privateGetWalletAddressOrderHistory (request);
            const orders = this.reyaFilterOrders (this.safeList (response, 'data', []), accountId);
            for (let i = 0; i < orders.length; i++) {
                if (this.safeString (orders[i], 'orderId') === id) {
                    return this.parseOrder (orders[i]);
                }
            }
            const meta = this.safeDict (response, 'meta', {});
            const cursor = this.safeString (meta, 'nextCursor');
            if (cursor === undefined) {
                throw new OrderNotFound (this.id + ' order ' + id + ' not found; history may lag recent order entry');
            }
            request['cursor'] = cursor;
        }
        throw new ExchangeError (this.id + ' fetchOrder history search limit reached; increase params.maxPages');
    }

    /**
     * @method
     * @name reya#fetchMyTrades
     * @description fetch settled executions for one account
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds
     * @param {int} [limit] maximum entries per page, up to 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.cursor] opaque pagination cursor
     * @param {int} [params.until] latest timestamp in milliseconds
     * @returns {object[]} trade structures
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const accountId = this.numberToString (this.reyaAccountId (params));
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const request = this.extend ({ 'address': this.reyaWalletAddress () }, this.reyaHistoryRequest (since, limit, params));
        const response = await this.privateGetWalletAddressPerpExecutions (request);
        const rows = this.safeList (response, 'data', []);
        const trades = [];
        for (let i = 0; i < rows.length; i++) {
            if (this.safeString (rows[i], 'makerAccountId') === accountId || this.safeString (rows[i], 'takerAccountId') === accountId) {
                trades.push (this.parseReyaTrade (rows[i], market, accountId));
            }
        }
        return this.filterBySymbolSinceLimit (this.sortBy (trades, 'timestamp'), symbol, since, limit) as Trade[];
    }

    /**
     * @method
     * @name reya#createOrder
     * @description create a perpetual order; market orders use an IOC limit with a slippage cap
     * @param {string} symbol unified market symbol
     * @param {string} type limit or market
     * @param {string} side buy or sell
     * @param {float} amount quantity in base units
     * @param {float} [price] limit price, or worst execution price for a market order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @param {string} [params.clientOrderId] non-zero uint64 decimal client id
     * @param {string} [params.timeInForce] GTC, IOC or GTT
     * @param {bool} [params.postOnly] maker-only GTC/GTT order
     * @param {bool} [params.reduceOnly] only supported for IOC orders
     * @param {int} [params.expiresAfter] GTT expiry in Unix seconds
     * @param {float} [params.slippage] market order slippage fraction, defaults to 0.005
     * @returns {object} an order structure
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const market = this.market (symbol);
        if (type !== 'limit' && type !== 'market') {
            throw new NotSupported (this.id + ' supports limit and market (IOC limit) orders');
        }
        if (this.safeValue (params, 'stopLossPrice') !== undefined || this.safeValue (params, 'takeProfitPrice') !== undefined || this.safeValue (params, 'triggerPrice') !== undefined) {
            throw new NotSupported (this.id + ' protective stops close the entire position and are not supported by createOrder');
        }
        const timeInForce = this.safeStringUpper (params, 'timeInForce', (type === 'market') ? 'IOC' : 'GTC');
        const postOnly = this.safeBool (params, 'postOnly', false);
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        if ((type === 'market' && timeInForce !== 'IOC') || (timeInForce !== 'GTC' && timeInForce !== 'IOC' && timeInForce !== 'GTT')) {
            throw new InvalidOrder (this.id + ' invalid timeInForce');
        }
        if (reduceOnly && timeInForce !== 'IOC') {
            throw new NotSupported (this.id + ' reduceOnly requires IOC');
        }
        if (postOnly && timeInForce === 'IOC') {
            throw new InvalidOrder (this.id + ' postOnly cannot be combined with IOC');
        }
        const accountId = this.reyaAccountId (params);
        const request: Dict = {
            'accountId': accountId, 'symbol': market['id'], 'isBuy': side === 'buy',
            'orderType': 'LIMIT', 'timeInForce': timeInForce,
            'qty': this.amountToPrecision (symbol, amount),
            'exchangeId': this.safeInteger (this.reyaNetwork (), 'exchangeId'),
        };
        let orderPrice = price;
        if (type === 'market' && price === undefined) {
            const book = await this.fetchOrderBook (symbol, 1);
            const levels = this.safeList (book, (side === 'buy') ? 'asks' : 'bids', []);
            const level = this.safeList (levels, 0, []);
            const best = this.safeString (level, 0);
            const slippage = this.safeString (params, 'slippage', this.safeString (this.options, 'slippage', '0.005'));
            if (best === undefined || Precise.stringLt (slippage, '0') || Precise.stringGt (slippage, '1')) {
                throw new InvalidOrder (this.id + ' market order needs a non-empty book and slippage between 0 and 1');
            }
            const factor = (side === 'buy') ? Precise.stringAdd ('1', slippage) : Precise.stringSub ('1', slippage);
            orderPrice = this.parseNumber (Precise.stringMul (best, factor));
        }
        if (orderPrice === undefined || orderPrice <= 0 || amount <= 0) {
            throw new InvalidOrder (this.id + ' requires a positive amount and price');
        }
        request['limitPx'] = this.priceToPrecision (symbol, orderPrice);
        if (timeInForce === 'IOC') {
            request['reduceOnly'] = reduceOnly;
        } else {
            request['postOnly'] = postOnly;
        }
        if (timeInForce === 'GTT') {
            const expiresAfter = this.safeInteger (params, 'expiresAfter');
            if (expiresAfter === undefined || expiresAfter <= this.seconds () + 60) {
                throw new InvalidOrder (this.id + ' GTT requires expiresAfter more than 60 seconds in the future');
            }
            request['expiresAfter'] = expiresAfter;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            const normalized = Precise.stringAdd (clientOrderId, '0');
            if (normalized === undefined || normalized.indexOf ('.') >= 0 || Precise.stringLe (normalized, '0') || Precise.stringGt (normalized, '18446744073709551615')) {
                throw new InvalidOrder (this.id + ' clientOrderId must be a non-zero uint64 decimal string');
            }
            request['clientOrderId'] = normalized;
        }
        const omitted = this.omit (params, [ 'accountId', 'clientOrderId', 'timeInForce', 'postOnly', 'reduceOnly', 'slippage', 'expiresAfter' ]);
        const response = await this.privatePostCreateOrder (this.extend (omitted, request));
        const sideId = (side === 'buy') ? 'B' : 'A';
        const merged = this.extend (this.extend (request, { 'side': sideId }), response);
        const parsed = this.parseOrder (merged, market);
        parsed['type'] = type;
        return parsed;
    }

    /**
     * @method
     * @name reya#cancelOrder
     * @description cancel an order using its exchange id
     * @param {string} id exchange order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @returns {object} an order structure
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol');
        }
        const market = this.market (symbol);
        const request = { 'orderId': id, 'symbol': market['id'], 'accountId': this.reyaAccountId (params) };
        const response = await this.privatePostCancelOrder (this.extend (this.omit (params, 'accountId'), request));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name reya#cancelAllOrders
     * @description cancel all orders for one account, optionally restricted to a market
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountId] trading account id
     * @returns {object[]} an order structure containing the raw cancellation count
     */
    override async cancelAllOrders (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = { 'accountId': this.reyaAccountId (params) };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostCancelAll (this.extend (this.omit (params, 'accountId'), request));
        return [ this.parseOrder (response, market) ];
    }

    /** @ignore */
    override nonce (): number {
        const previous = this.safeInteger (this.options, 'lastNonce', 0);
        const next = Math.max (this.milliseconds () * 1000, previous + 1);
        this.options['lastNonce'] = next;
        return next;
    }

    /** @ignore */
    reyaSignPayload (path: string, request: Dict): Dict {
        this.checkRequiredCredentials ();
        const network = this.reyaNetwork ();
        const domain = { 'name': 'Reya', 'version': '1', 'verifyingContract': this.safeString (network, 'ordersGateway') };
        const nonce = this.safeString (request, 'nonce', this.numberToString (this.nonce ()));
        const deadline = this.safeInteger (request, 'deadline', this.sum (this.seconds (), this.safeInteger (this.options, 'deadlineSeconds', 30)));
        const accountId = this.safeInteger (request, 'accountId');
        const symbol = this.safeString (request, 'symbol');
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const marketId = (market === undefined) ? 0 : this.safeInteger (market['info'], 'marketId');
        let types: Dict = {};
        const message: Dict = { 'verifyingChainId': this.safeInteger (network, 'chainId'), 'deadline': deadline };
        if (path === 'createOrder') {
            if (this.safeString (request, 'orderType') !== 'LIMIT') {
                throw new NotSupported (this.id + ' signing supports LIMIT orders only');
            }
            const signer = this.ethGetAddressFromPrivateKey (this.privateKey);
            const signedQty = this.safeBool (request, 'isBuy') ? this.safeString (request, 'qty') : Precise.stringNeg (this.safeString (request, 'qty'));
            const timeInForceValues: Dict = { 'GTC': 0, 'IOC': 1, 'GTT': 2 };
            types = {
                'Order': [ { 'name': 'verifyingChainId', 'type': 'uint256' }, { 'name': 'deadline', 'type': 'uint256' }, { 'name': 'order', 'type': 'OrderDetails' } ],
                'OrderDetails': [
                    { 'name': 'accountId', 'type': 'uint128' }, { 'name': 'marketId', 'type': 'uint128' },
                    { 'name': 'exchangeId', 'type': 'uint128' }, { 'name': 'orderType', 'type': 'uint8' },
                    { 'name': 'quantity', 'type': 'int256' }, { 'name': 'limitPrice', 'type': 'uint256' },
                    { 'name': 'triggerPrice', 'type': 'uint256' }, { 'name': 'timeInForce', 'type': 'uint8' },
                    { 'name': 'clientOrderId', 'type': 'uint64' }, { 'name': 'reduceOnly', 'type': 'bool' },
                    { 'name': 'postOnly', 'type': 'bool' }, { 'name': 'expiresAfter', 'type': 'uint256' },
                    { 'name': 'signer', 'type': 'address' }, { 'name': 'nonce', 'type': 'uint256' },
                ],
            };
            message['order'] = {
                'accountId': accountId, 'marketId': marketId, 'exchangeId': this.safeInteger (request, 'exchangeId'),
                'orderType': 0, 'quantity': Precise.stringMul (signedQty, '1000000000000000000'),
                'limitPrice': Precise.stringMul (this.safeString (request, 'limitPx'), '1000000000000000000'),
                'triggerPrice': '0', 'timeInForce': this.safeInteger (timeInForceValues, this.safeString (request, 'timeInForce')),
                'clientOrderId': this.safeString (request, 'clientOrderId', '0'),
                'reduceOnly': this.safeBool (request, 'reduceOnly', false), 'postOnly': this.safeBool (request, 'postOnly', false),
                'expiresAfter': this.safeInteger (request, 'expiresAfter', 0), 'signer': signer, 'nonce': nonce,
            };
            request['signerWallet'] = signer;
        } else if (path === 'cancelOrder') {
            types = {
                'OrderCancel': [ { 'name': 'verifyingChainId', 'type': 'uint64' }, { 'name': 'deadline', 'type': 'uint64' }, { 'name': 'cancel', 'type': 'OrderCancelDetails' } ],
                'OrderCancelDetails': [
                    { 'name': 'accountId', 'type': 'uint64' }, { 'name': 'marketId', 'type': 'uint64' },
                    { 'name': 'orderId', 'type': 'uint64' }, { 'name': 'clOrdId', 'type': 'uint64' }, { 'name': 'nonce', 'type': 'uint64' },
                ],
            };
            message['cancel'] = { 'accountId': accountId, 'marketId': marketId, 'orderId': this.safeString (request, 'orderId', '0'), 'clOrdId': this.safeString (request, 'clientOrderId', '0'), 'nonce': nonce };
        } else {
            types = {
                'MassCancel': [ { 'name': 'verifyingChainId', 'type': 'uint64' }, { 'name': 'deadline', 'type': 'uint64' }, { 'name': 'massCancel', 'type': 'MassCancelDetails' } ],
                'MassCancelDetails': [ { 'name': 'accountId', 'type': 'uint64' }, { 'name': 'marketId', 'type': 'uint64' }, { 'name': 'nonce', 'type': 'uint64' } ],
            };
            message['massCancel'] = { 'accountId': accountId, 'marketId': marketId, 'nonce': nonce };
        }
        const encoded = this.ethEncodeStructuredData (domain, types, message);
        const digest = this.hash (encoded, keccak, 'hex');
        const signature = ecdsa (digest, this.remove0xPrefix (this.privateKey), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        request['signature'] = '0x' + r.padStart (64, '0') + s.padStart (64, '0') + this.intToBase16 (this.sum (27, signature['v'])).toLowerCase ();
        request['nonce'] = nonce;
        request['deadline'] = deadline;
        return request;
    }

    /** @ignore */
    override sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict {
        let headers: NullableDict = undefined;
        let body: Str = undefined;
        let url = this.urls['api'][api[0]] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'POST') {
            query = this.reyaSignPayload (path, query);
            body = this.json (query);
            headers = { 'Content-Type': 'application/json' };
        } else if (!this.isEmpty (query)) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /** @ignore */
    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], this.safeString (response, 'message'), feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
