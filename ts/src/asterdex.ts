//  ---------------------------------------------------------------------------

import Exchange from './abstract/asterdex.js';
import { ExchangeError, ArgumentsRequired, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, RequestTimeout } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Int, Market, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Balances, Num, Dict, Trade, Position } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class asterdex
 * @augments Exchange
 */
export default class asterdex extends Exchange {
    describe (): any {
        return this.deepExtend(super.describe(), {
            'id': 'asterdex',
            'name': 'AsterDEX',
            'countries': [],
            'rateLimit': 50,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrder': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': false,
                'fetchDeposits': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': true,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMarkPrice': true,
                'fetchMarkPrices': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': false,
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
                'logo': 'https://www.asterdex.com/logo.png',
                'api': {
                    'fapiPublic': 'https://fapi.asterdex.com/fapi/v3',
                    'fapiPrivate': 'https://fapi.asterdex.com/fapi/v3',
                    'sapiPublic': 'https://sapi.asterdex.com/api/v1',
                    'sapiPrivate': 'https://sapi.asterdex.com/api/v1',
                    'public': 'https://sapi.asterdex.com/api/v1',
                    'private': 'https://sapi.asterdex.com/api/v1',
                },
                'www': 'https://www.asterdex.com',
                'doc': [
                    'https://docs.asterdex.com/product/aster-perpetual-pro/api/api-documentation',
                    'https://github.com/asterdex/api-docs',
                ],
                'referral': '',
            },
            'api': {
                // Futures API endpoints
                'fapiPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': 1,
                        'trades': 1,
                        'historicalTrades': 1,
                        'aggTrades': 1,
                        'klines': 1,
                        'indexPriceKlines': 1,
                        'markPriceKlines': 1,
                        'premiumIndex': 1,
                        'fundingRate': 1,
                        'ticker/24hr': 1,
                        'ticker/price': 1,
                        'ticker/bookTicker': 1,
                    },
                },
                'fapiPrivate': {
                    'get': {
                        'positionSide/dual': 1,
                        'multiAssetsMargin': 1,
                        'order': 1,
                        'openOrder': 1,
                        'openOrders': 1,
                        'allOrders': 1,
                        'balance': 1,
                        'account': 1,
                        'positionRisk': 1,
                        'userTrades': 1,
                        'income': 1,
                        'leverageBracket': 1,
                        'adlQuantile': 1,
                        'forceOrders': 1,
                        'commissionRate': 1,
                        'positionMargin/history': 1,
                    },
                    'post': {
                        'positionSide/dual': 1,
                        'multiAssetsMargin': 1,
                        'order': 1,
                        'batchOrders': 1,
                        'countdownCancelAll': 1,
                        'leverage': 1,
                        'marginType': 1,
                        'positionMargin': 1,
                        'transfer': 1,
                        'listenKey': 1,
                    },
                    'put': {
                        'listenKey': 1,
                    },
                    'delete': {
                        'order': 1,
                        'allOpenOrders': 1,
                        'batchOrders': 1,
                        'listenKey': 1,
                    },
                },
                // Spot API endpoints
                'sapiPublic': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': 1,
                        'trades': 1,
                        'historicalTrades': 1,
                        'aggTrades': 1,
                        'klines': 1,
                        'ticker/24hr': 1,
                        'ticker/price': 1,
                        'ticker/bookTicker': 1,
                        'asset/withdraw-fee': 1,
                        'account/nonce': 1,
                    },
                },
                'sapiPrivate': {
                    'get': {
                        'order': 1,
                        'openOrders': 1,
                        'allOrders': 1,
                        'account': 1,
                        'myTrades': 1,
                    },
                    'post': {
                        'order': 1,
                        'transfer': 1,
                        'withdraw': 1,
                        'account/apikey': 1,
                        'listenKey': 1,
                    },
                    'put': {
                        'listenKey': 1,
                    },
                    'delete': {
                        'order': 1,
                        'openOrders': 1,
                        'listenKey': 1,
                    },
                },
                'public': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'exchangeInfo': 1,
                        'depth': 1,
                        'trades': 1,
                        'historicalTrades': 1,
                        'aggTrades': 1,
                        'klines': 1,
                        'ticker/24hr': 1,
                        'ticker/price': 1,
                        'ticker/bookTicker': 1,
                    },
                },
                'private': {
                    'get': {
                        'order': 1,
                        'openOrders': 1,
                        'allOrders': 1,
                        'account': 1,
                        'myTrades': 1,
                    },
                    'post': {
                        'order': 1,
                        'transfer': 1,
                    },
                    'delete': {
                        'order': 1,
                        'openOrders': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.0002'),
                    'taker': this.parseNumber('0.0005'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,    // Main account wallet address (user)
                'privateKey': true,        // Signer private key for ECDSA signatures
            },
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // UNKNOWN
                    '-1001': ExchangeError, // DISCONNECTED
                    '-1002': AuthenticationError, // UNAUTHORIZED
                    '-1003': RateLimitExceeded, // TOO_MANY_REQUESTS
                    '-1006': ExchangeError, // UNEXPECTED_RESP
                    '-1007': RequestTimeout, // TIMEOUT
                    '-1013': InvalidOrder, // INVALID_MESSAGE
                    '-1014': InvalidOrder, // UNKNOWN_ORDER_COMPOSITION
                    '-1015': RateLimitExceeded, // TOO_MANY_ORDERS
                    '-1016': ExchangeError, // SERVICE_SHUTTING_DOWN
                    '-1020': InvalidOrder, // UNSUPPORTED_OPERATION
                    '-1021': InvalidNonce, // INVALID_TIMESTAMP
                    '-1022': AuthenticationError, // INVALID_SIGNATURE
                    '-1100': InvalidOrder, // ILLEGAL_CHARS
                    '-1101': InvalidOrder, // TOO_MANY_PARAMETERS
                    '-1102': InvalidOrder, // MANDATORY_PARAM_EMPTY_OR_MALFORMED
                    '-1103': InvalidOrder, // UNKNOWN_PARAM
                    '-1104': InvalidOrder, // UNREAD_PARAMETERS
                    '-1105': InvalidOrder, // PARAM_EMPTY
                    '-1106': InvalidOrder, // PARAM_NOT_REQUIRED
                    '-1111': BadRequest, // BAD_PRECISION
                    '-1112': InvalidOrder, // NO_DEPTH
                    '-1114': InvalidOrder, // TIF_NOT_REQUIRED
                    '-1115': InvalidOrder, // INVALID_TIF
                    '-1116': InvalidOrder, // INVALID_ORDER_TYPE
                    '-1117': InvalidOrder, // INVALID_SIDE
                    '-1118': InvalidOrder, // EMPTY_NEW_CL_ORD_ID
                    '-1119': InvalidOrder, // EMPTY_ORG_CL_ORD_ID
                    '-1120': BadRequest, // BAD_INTERVAL
                    '-1121': BadSymbol, // BAD_SYMBOL
                    '-1125': AuthenticationError, // INVALID_LISTEN_KEY
                    '-1127': InvalidOrder, // MORE_THAN_XX_HOURS
                    '-1128': InvalidOrder, // OPTIONAL_PARAMS_BAD_COMBO
                    '-1130': InvalidOrder, // INVALID_PARAMETER
                    '-2010': ExchangeError, // NEW_ORDER_REJECTED
                    '-2011': OrderNotFound, // CANCEL_REJECTED
                    '-2013': OrderNotFound, // NO_SUCH_ORDER
                    '-2014': AuthenticationError, // BAD_API_KEY_FMT
                    '-2015': AuthenticationError, // REJECTED_MBX_KEY
                    '-2016': ExchangeError, // NO_TRADING_WINDOW
                    '-2019': InsufficientFunds, // MARGIN_INSUFFICIENT
                    '-4000': InvalidOrder, // INVALID_PARAM
                    '-4001': BadRequest, // BAD_ASSET
                    '-5021': InvalidOrder, // DUE_TO_SELF_TRADE
                    '-5022': InvalidOrder, // DUE_TO_IMMEDIATE_TRIGGER
                },
                'broad': {
                    'has no operation privilege': PermissionDenied,
                    'MAX_POSITION': InvalidOrder,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',  // 'spot', 'swap', 'future'
                'defaultSubType': 'linear',
                'recvWindow': 50000, // 50 seconds window
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'parseOrderToPrecision': false,
                'newOrderRespType': 'RESULT', // or 'ACK', 'FULL'
            },
        });
    }

    nonce (): number {
        // AsterDEX uses microsecond precision for nonce
        return Math.trunc(this.milliseconds() * 1000);
    }

    /**
     * Encode parameters for Web3-style signing
     * @param {object} params - Parameters to encode
     * @param {string} user - User wallet address
     * @param {string} signer - Signer wallet address
     * @param {number} nonce - Microsecond timestamp
     * @returns {Uint8Array} - Encoded message hash
     */
    encodeMessage (params, user, signer, nonce): Uint8Array {
        // Convert params to JSON string (sorted keys, no whitespace)
        const paramsJson = this.json(params);

        // Encode using eth-abi format: ['string', 'address', 'address', 'uint256']
        // This mimics: encode(['string', 'address', 'address', 'uint256'], [paramsJson, user, signer, nonce])

        // For now, we'll use a simplified approach similar to Hyperliquid
        // Concatenate: paramsJson + user + signer + nonce
        const message = paramsJson + user.toLowerCase() + signer.toLowerCase() + nonce.toString();

        // Hash with keccak256
        const messageBytes = this.encode(message);
        const hash = keccak(messageBytes);

        return hash;
    }

    /**
     * Sign a message hash with ECDSA secp256k1
     * @param {Uint8Array} hash - Message hash to sign
     * @param {string} privateKey - Private key (without 0x prefix)
     * @returns {object} - Signature with r, s, v
     */
    signHash (hash, privateKey): Dict {
        // Remove 0x prefix if present
        const cleanPrivateKey = privateKey.replace(/^0x/, '');

        // Sign using ecdsa with secp256k1
        const signature = ecdsa(hash.slice(-64), this.encode(cleanPrivateKey).slice(-32), secp256k1, undefined);

        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': this.sum(27, signature['v']),
        };
    }

    /**
     * Create ECDSA signature for AsterDEX authentication
     * @param {object} params - Request parameters
     * @param {string} user - User wallet address
     * @param {string} signer - Signer wallet address
     * @param {number} nonce - Microsecond timestamp
     * @returns {string} - Hex signature string
     */
    createSignature (params, user, signer, nonce): string {
        const hash = this.encodeMessage(params, user, signer, nonce);
        const signature = this.signHash(hash, this.privateKey);

        // Combine r, s, v into single hex string (without 0x prefix for v)
        const v = signature['v'].toString(16).padStart(2, '0');
        const combined = signature['r'] + signature['s'].slice(2) + v;

        return combined;
    }

    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isPrivate = (api === 'private') || (api === 'fapiPrivate') || (api === 'sapiPrivate');

        if (!(api in this.urls['api'])) {
            throw new NotSupported(this.id + ' does not have URL for ' + api + ' endpoints');
        }

        let url = this.urls['api'][api];
        url += '/' + path;

        if (isPrivate) {
            this.checkRequiredCredentials();

            const nonce = this.nonce();
            const timestamp = this.milliseconds();
            const recvWindow = this.safeInteger(this.options, 'recvWindow', 50000);

            // Extend params with timestamp and recvWindow
            const extendedParams = this.extend({
                'timestamp': timestamp,
                'recvWindow': recvWindow,
            }, params);

            // Create signature
            const user = this.walletAddress;
            const signer = this.walletAddress; // If using different signer address, add as credential
            const signature = this.createSignature(extendedParams, user, signer, nonce);

            // Add authentication parameters
            extendedParams['user'] = user;
            extendedParams['signer'] = signer;
            extendedParams['nonce'] = nonce;
            extendedParams['signature'] = signature;

            const query = this.urlencode(extendedParams);

            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };

            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + query;
            } else {
                body = query;
            }
        } else {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchTime (params = {}): Promise<number> {
        /**
         * @method
         * @name asterdex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime(params);
        //
        //     {
        //         "serverTime": 1499827319559
        //     }
        //
        return this.safeInteger(response, 'serverTime');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name asterdex#fetchMarkets
         * @description retrieves data on all markets for asterdex
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const defaultType = this.safeString(this.options, 'defaultType', 'swap');
        const type = this.safeString(params, 'type', defaultType);
        const query = this.omit(params, 'type');

        let response = undefined;
        if (type === 'spot') {
            response = await this.sapiPublicGetExchangeInfo(query);
        } else {
            response = await this.fapiPublicGetExchangeInfo(query);
        }

        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": 1565246363776,
        //         "rateLimits": [
        //             { "rateLimitType": "REQUEST_WEIGHT", "interval": "MINUTE", "intervalNum": 1, "limit": 1200 },
        //             { "rateLimitType": "ORDERS", "interval": "SECOND", "intervalNum": 10, "limit": 100 }
        //         ],
        //         "symbols": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "pair": "BTCUSDT",
        //                 "contractType": "PERPETUAL",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC",
        //                 "quoteAsset": "USDT",
        //                 "pricePrecision": 2,
        //                 "quantityPrecision": 3,
        //                 "baseAssetPrecision": 8,
        //                 "quotePrecision": 8,
        //                 "filters": [...],
        //                 ...
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList(response, 'symbols', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push(this.parseMarket(markets[i]));
        }
        return result;
    }

    parseMarket(market) {
        //
        // Futures
        //     {
        //         "symbol": "BTCUSDT",
        //         "pair": "BTCUSDT",
        //         "contractType": "PERPETUAL",
        //         "status": "TRADING",
        //         "baseAsset": "BTC",
        //         "quoteAsset": "USDT",
        //         "pricePrecision": 2,
        //         "quantityPrecision": 3,
        //         "baseAssetPrecision": 8,
        //         "quotePrecision": 8,
        //         "filters": [...]
        //     }
        //
        const id = this.safeString(market, 'symbol');
        const baseId = this.safeString(market, 'baseAsset');
        const quoteId = this.safeString(market, 'quoteAsset');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        const status = this.safeString(market, 'status');
        const active = (status === 'TRADING');
        const contractType = this.safeString(market, 'contractType');
        const spot = (contractType === undefined);
        const swap = (contractType === 'PERPETUAL');
        const future = !spot && !swap;

        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': swap || future ? quote : undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': swap || future ? quoteId : undefined,
            'type': spot ? 'spot' : 'swap',
            'spot': spot,
            'margin': false,
            'swap': swap,
            'future': future,
            'option': false,
            'active': active,
            'contract': !spot,
            'linear': swap || future ? true : undefined,
            'inverse': false,
            'contractSize': swap || future ? 1 : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeInteger(market, 'quantityPrecision'),
                'price': this.safeInteger(market, 'pricePrecision'),
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

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name asterdex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const defaultType = this.safeString(this.options, 'defaultType', 'swap');
        const type = this.safeString(params, 'type', defaultType);
        const query = this.omit(params, 'type');

        let response = undefined;
        if (type === 'spot') {
            response = await this.sapiPrivateGetAccount(query);
        } else {
            response = await this.fapiPrivateGetAccount(query);
        }

        //
        // Futures
        //     {
        //         "feeTier": 0,
        //         "canTrade": true,
        //         "canDeposit": true,
        //         "canWithdraw": true,
        //         "updateTime": 0,
        //         "totalInitialMargin": "0.00000000",
        //         "totalMaintMargin": "0.00000000",
        //         "totalWalletBalance": "23.72469206",
        //         "totalUnrealizedProfit": "0.00000000",
        //         "totalMarginBalance": "23.72469206",
        //         "totalPositionInitialMargin": "0.00000000",
        //         "totalOpenOrderInitialMargin": "0.00000000",
        //         "totalCrossWalletBalance": "23.72469206",
        //         "totalCrossUnPnl": "0.00000000",
        //         "availableBalance": "23.72469206",
        //         "maxWithdrawAmount": "23.72469206",
        //         "assets": [
        //             {
        //                 "asset": "USDT",
        //                 "walletBalance": "23.72469206",
        //                 "unrealizedProfit": "0.00000000",
        //                 "marginBalance": "23.72469206",
        //                 "maintMargin": "0.00000000",
        //                 "initialMargin": "0.00000000",
        //                 "positionInitialMargin": "0.00000000",
        //                 "openOrderInitialMargin": "0.00000000",
        //                 "crossWalletBalance": "23.72469206",
        //                 "crossUnPnl": "0.00000000",
        //                 "availableBalance": "23.72469206",
        //                 "maxWithdrawAmount": "23.72469206"
        //             }
        //         ],
        //         "positions": [...]
        //     }
        //
        return this.parseBalance(response);
    }

    parseBalance(response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };

        const balances = this.safeList2(response, 'balances', 'assets', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString2(balance, 'free', 'availableBalance');
            account['used'] = this.safeString(balance, 'locked');
            account['total'] = this.safeString2(balance, 'balance', 'walletBalance');
            result[code] = account;
        }

        return this.safeBalance(result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name asterdex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const uppercaseType = type.toUpperCase();
        const uppercaseSide = side.toUpperCase();

        const request = {
            'symbol': market['id'],
            'side': uppercaseSide,
            'type': uppercaseType,
        };

        if (market['contract']) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
            const positionSide = this.safeString(params, 'positionSide');
            if (positionSide !== undefined) {
                request['positionSide'] = positionSide;
            }
        } else {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }

        if (uppercaseType === 'LIMIT') {
            request['price'] = this.priceToPrecision(symbol, price);
            request['timeInForce'] = this.safeString(params, 'timeInForce', 'GTC');
        }

        const query = this.omit(params, ['positionSide', 'timeInForce']);
        let response = undefined;
        if (market['spot']) {
            response = await this.sapiPrivatePostOrder(this.extend(request, query));
        } else {
            response = await this.fapiPrivatePostOrder(this.extend(request, query));
        }

        //
        //     {
        //         "orderId": 28,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
        //         "price": "0.1",
        //         "avgPrice": "0.00000",
        //         "origQty": "1.0",
        //         "executedQty": "0",
        //         "cumQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "updateTime": 1566818724722
        //     }
        //
        return this.parseOrder(response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name asterdex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': parseInt(id),
        };

        let response = undefined;
        if (market['spot']) {
            response = await this.sapiPrivateDeleteOrder(this.extend(request, params));
        } else {
            response = await this.fapiPrivateDeleteOrder(this.extend(request, params));
        }

        return this.parseOrder(response, market);
    }

    parseOrder(order, market = undefined) {
        //
        // createOrder, cancelOrder, fetchOrder
        //     {
        //         "orderId": 28,
        //         "symbol": "BTCUSDT",
        //         "status": "NEW",
        //         "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP",
        //         "price": "0.1",
        //         "avgPrice": "0.00000",
        //         "origQty": "1.0",
        //         "executedQty": "0",
        //         "cumQty": "0",
        //         "cumQuote": "0",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "reduceOnly": false,
        //         "closePosition": false,
        //         "side": "BUY",
        //         "positionSide": "SHORT",
        //         "stopPrice": "0",
        //         "workingType": "CONTRACT_PRICE",
        //         "priceProtect": false,
        //         "origType": "LIMIT",
        //         "updateTime": 1566818724722
        //     }
        //
        const id = this.safeString(order, 'orderId');
        const clientOrderId = this.safeString(order, 'clientOrderId');
        const timestamp = this.safeInteger2(order, 'time', 'transactTime');
        const lastUpdateTimestamp = this.safeInteger(order, 'updateTime');
        const marketId = this.safeString(order, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const side = this.safeStringLower(order, 'side');
        const type = this.safeStringLower(order, 'type');
        const price = this.safeString(order, 'price');
        const amount = this.safeString2(order, 'origQty', 'quantity');
        const filled = this.safeString2(order, 'executedQty', 'cumQty');
        const average = this.safeString(order, 'avgPrice');
        const cost = this.safeString(order, 'cumQuote');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const timeInForce = this.safeString(order, 'timeInForce');
        const postOnly = (timeInForce === 'GTX');

        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastUpdateTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'stopPrice': this.safeString(order, 'stopPrice'),
            'triggerPrice': this.safeString(order, 'stopPrice'),
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString(statuses, status, status);
    }

    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name asterdex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'orderId': parseInt(id),
        };

        let response = undefined;
        if (market['spot']) {
            response = await this.sapiPrivateGetOrder(this.extend(request, params));
        } else {
            response = await this.fapiPrivateGetOrder(this.extend(request, params));
        }

        return this.parseOrder(response, market);
    }

    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name asterdex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;

        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }

        if (limit !== undefined) {
            request['limit'] = limit;
        }

        const defaultType = this.safeString(this.options, 'defaultType', 'swap');
        const type = this.safeString(params, 'type', defaultType);
        const query = this.omit(params, 'type');

        let response = undefined;
        if (type === 'spot') {
            response = await this.sapiPrivateGetOpenOrders(this.extend(request, query));
        } else {
            response = await this.fapiPrivateGetOpenOrders(this.extend(request, query));
        }

        return this.parseOrders(response, market, since, limit);
    }

    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name asterdex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };

        if (limit !== undefined) {
            request['limit'] = limit;
        }

        let response = undefined;
        if (market['spot']) {
            response = await this.sapiPublicGetDepth(this.extend(request, params));
        } else {
            response = await this.fapiPublicGetDepth(this.extend(request, params));
        }

        //
        //     {
        //         "lastUpdateId": 1027024,
        //         "bids": [
        //             ["4.00000000", "431.00000000"]
        //         ],
        //         "asks": [
        //             ["4.00000200", "12.00000000"]
        //         ]
        //     }
        //
        const timestamp = this.safeInteger(response, 'T');
        const orderbook = this.parseOrderBook(response, symbol, timestamp, 'bids', 'asks');
        orderbook['nonce'] = this.safeInteger(response, 'lastUpdateId');
        return orderbook;
    }

    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name asterdex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };

        let response = undefined;
        if (market['spot']) {
            response = await this.sapiPublicGetTicker24hr(this.extend(request, params));
        } else {
            response = await this.fapiPublicGetTicker24hr(this.extend(request, params));
        }

        return this.parseTicker(response, market);
    }

    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "priceChange": "-94.99999800",
        //         "priceChangePercent": "-95.960",
        //         "weightedAvgPrice": "0.29628482",
        //         "prevClosePrice": "0.10002000",
        //         "lastPrice": "4.00000200",
        //         "lastQty": "200.00000000",
        //         "bidPrice": "4.00000000",
        //         "bidQty": "100.00000000",
        //         "askPrice": "4.00000200",
        //         "askQty": "100.00000000",
        //         "openPrice": "99.00000000",
        //         "highPrice": "100.00000000",
        //         "lowPrice": "0.10000000",
        //         "volume": "8913.30000000",
        //         "quoteVolume": "15.30000000",
        //         "openTime": 1499783499040,
        //         "closeTime": 1499869899040,
        //         "firstId": 28385,
        //         "lastId": 28460,
        //         "count": 76
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'closeTime');
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'lastPrice');
        const open = this.safeString(ticker, 'openPrice');

        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidQty'),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askQty'),
            'vwap': this.safeString(ticker, 'weightedAvgPrice'),
            'open': open,
            'close': last,
            'last': last,
            'previousClose': this.safeString(ticker, 'prevClosePrice'),
            'change': this.safeString(ticker, 'priceChange'),
            'percentage': this.safeString(ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': this.safeString(ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }
}
