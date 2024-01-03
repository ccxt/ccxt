
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hyperliquid';
import { ExchangeError, ExchangeNotAvailable, NotSupported, OnMaintenance, ArgumentsRequired, BadRequest, AccountSuspended, InvalidAddress, PermissionDenied, DDoSProtection, InsufficientFunds, InvalidNonce, CancelPending, InvalidOrder, OrderNotFound, AuthenticationError, RequestTimeout, BadSymbol, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Liquidation } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class hyperliquid
 * @augments Exchange
 */
export default class hyperliquid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hyperliquid',
            'name': 'Hyperliquid',
            'countries': [ 'US' ], // is this dex in US?
            'version': 'v!',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'hyperliquid.xyz',
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.hyperliquid-testnet.xyz',
                    'private': 'https://api.hyperliquid-testnet.xyz',
                },
                'www': 'https://hyperliquid.xyz',
                'doc': 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api',
                'fees': 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees',
                'referral': '',
            },
            'api': {
                'public': {
                    'post': {
                        'info': 1,
                    },
                },
                'private': {
                    'post': {
                        'exchange': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0006'),
                    'maker': this.parseNumber ('0.0004'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMarkets
         * @description retrieves data on all markets for hyperliquid
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'metaAndAssetCtxs',
        };
        const response = await this.publicPostInfo(this.extend (request, params));
        return response;
    }

    // parseMarket (market): Market {
    //     //
    //     //
    //     const marketId = this.safeString (market, 'symbol');
    //     const quoteId = this.safeString (market, 'quoteCoin');
    //     const baseId = this.safeString (market, 'baseCoin');
    //     const quote = this.safeCurrencyCode (quoteId);
    //     const base = this.safeCurrencyCode (baseId);
    //     const supportMarginCoins = this.safeValue (market, 'supportMarginCoins', []);
    //     let settleId = undefined;
    //     if (this.inArray (baseId, supportMarginCoins)) {
    //         settleId = baseId;
    //     } else if (this.inArray (quoteId, supportMarginCoins)) {
    //         settleId = quoteId;
    //     } else {
    //         settleId = this.safeString (supportMarginCoins, 0);
    //     }
    //     const settle = this.safeCurrencyCode (settleId);
    //     let symbol = base + '/' + quote;
    //     let type = undefined;
    //     let swap = false;
    //     let spot = false;
    //     let future = false;
    //     let contract = false;
    //     let pricePrecision = undefined;
    //     let amountPrecision = undefined;
    //     let linear = undefined;
    //     let inverse = undefined;
    //     let expiry = undefined;
    //     let expiryDatetime = undefined;
    //     const symbolType = this.safeString (market, 'symbolType');
    //     if (symbolType === undefined) {
    //         type = 'spot';
    //         spot = true;
    //         pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision')));
    //         amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantityPrecision')));
    //     } else {
    //         if (symbolType === 'perpetual') {
    //             type = 'swap';
    //             swap = true;
    //             symbol = symbol + ':' + settle;
    //         } else if (symbolType === 'delivery') {
    //             expiry = this.safeInteger (market, 'deliveryTime');
    //             expiryDatetime = this.iso8601 (expiry);
    //             const expiryParts = expiryDatetime.split ('-');
    //             const yearPart = this.safeString (expiryParts, 0);
    //             const dayPart = this.safeString (expiryParts, 2);
    //             const year = yearPart.slice (2, 4);
    //             const month = this.safeString (expiryParts, 1);
    //             const day = dayPart.slice (0, 2);
    //             const expiryString = year + month + day;
    //             type = 'future';
    //             future = true;
    //             symbol = symbol + ':' + settle + '-' + expiryString;
    //         }
    //         contract = true;
    //         inverse = (base === settle);
    //         linear = !inverse;
    //         const priceDecimals = this.safeInteger (market, 'pricePlace');
    //         const amountDecimals = this.safeInteger (market, 'volumePlace');
    //         const priceStep = this.safeString (market, 'priceEndStep');
    //         const amountStep = this.safeString (market, 'minTradeNum');
    //         const precisePrice = new Precise (priceStep);
    //         precisePrice.decimals = Math.max (precisePrice.decimals, priceDecimals);
    //         precisePrice.reduce ();
    //         const priceString = precisePrice.toString ();
    //         pricePrecision = this.parseNumber (priceString);
    //         const preciseAmount = new Precise (amountStep);
    //         preciseAmount.decimals = Math.max (preciseAmount.decimals, amountDecimals);
    //         preciseAmount.reduce ();
    //         const amountString = preciseAmount.toString ();
    //         amountPrecision = this.parseNumber (amountString);
    //     }
    //     const status = this.safeString2 (market, 'status', 'symbolStatus');
    //     let active = undefined;
    //     if (status !== undefined) {
    //         active = ((status === 'online') || (status === 'normal'));
    //     }
    //     let minCost = undefined;
    //     if (quote === 'USDT') {
    //         minCost = this.safeNumber (market, 'minTradeUSDT');
    //     }
    //     const contractSize = contract ? 1 : undefined;
    //     return {
    //         'id': marketId,
    //         'symbol': symbol,
    //         'base': base,
    //         'quote': quote,
    //         'settle': settle,
    //         'baseId': baseId,
    //         'quoteId': quoteId,
    //         'settleId': settleId,
    //         'type': type,
    //         'spot': spot,
    //         'margin': undefined,
    //         'swap': swap,
    //         'future': future,
    //         'option': false,
    //         'active': active,
    //         'contract': contract,
    //         'linear': linear,
    //         'inverse': inverse,
    //         'taker': this.safeNumber (market, 'takerFeeRate'),
    //         'maker': this.safeNumber (market, 'makerFeeRate'),
    //         'contractSize': contractSize,
    //         'expiry': expiry,
    //         'expiryDatetime': expiryDatetime,
    //         'strike': undefined,
    //         'optionType': undefined,
    //         'precision': {
    //             'amount': amountPrecision,
    //             'price': pricePrecision,
    //         },
    //         'limits': {
    //             'leverage': {
    //                 'min': this.safeNumber (market, 'minLever'),
    //                 'max': this.safeNumber (market, 'maxLever'),
    //             },
    //             'amount': {
    //                 'min': this.safeNumber2 (market, 'minTradeNum', 'minTradeAmount'),
    //                 'max': this.safeNumber (market, 'maxTradeAmount'),
    //             },
    //             'price': {
    //                 'min': undefined,
    //                 'max': undefined,
    //             },
    //             'cost': {
    //                 'min': minCost,
    //                 'max': undefined,
    //             },
    //         },
    //         'created': this.safeInteger (market, 'launchTime'),
    //         'info': market,
    //     };
    // }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //
        const message = this.safeString (response, 'err_msg');
        const errorCode = this.safeString2 (response, 'code', 'err_code');
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const nonZeroErrorCode = (errorCode !== undefined) && (errorCode !== '00000');
        if (nonZeroErrorCode) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        if (nonZeroErrorCode || nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json'
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
