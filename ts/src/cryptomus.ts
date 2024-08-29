
// ---------------------------------------------------------------------------

import Exchange from './abstract/cryptomus.js';
// import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ContractUnavailable, DDoSProtection, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidAddress, InvalidNonce, InvalidOrder, NotSupported, OperationFailed, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Dict, Market, Strings, Ticker, Tickers } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class cryptomus
 * @augments Exchange
 */
export default class cryptomus extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomus',
            'name': 'Cryptomus',
            'countries': [ '' ], // todo
            'rateLimit': 100, // todo check
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {},
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.cryptomus.com',
                    'private': 'https://api.cryptomus.com',
                },
                'www': 'https://cryptomus.com',
                'doc': 'https://doc.cryptomus.com/personal',
                'fees': 'https://cryptomus.com/tariffs', // todo check
                'referral': '', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'v1/exchange/market/assets': 1,
                        'v1/exchange/market/order-book/{currencyPair}': 1,
                        'v1/exchange/market/tickers': 1,
                        'v1/exchange/market/trades/{currencyPair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/user-api/balance': 1,
                        'v2/user-api/convert/direction-list': 1,
                        'v2/user-api/convert/order-list': 1,
                    },
                    'post': {
                        'v2/user-api/convert/calculate': 1,
                        'v2/user-api/convert/': 1,
                        'v2/user-api/convert/limit': 1,
                    },
                    'delete': {
                        'v2/user-api/convert/{orderUuid}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'feeSide': 'get',
                    'maker': this.parseNumber ('0.02'),
                    'taker': this.parseNumber ('0.02'),
                },
            },
            'options': {
                'networks': {
                    // todo
                },
                'networksById': {
                    // todo
                },
                'defaultNetwork': 'ERC20',
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // todo
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cryptomus#fetchMarkets
         * @description retrieves data on all markets for the exchange
         * @see https://doc.cryptomus.com/personal/market-cap/tickers
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1ExchangeMarketTickers (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "currency_pair": "XMR_USDT",
        //                 "last_price": "158.04829771",
        //                 "base_volume": "0.35185785",
        //                 "quote_volume": "55.523761128544"
        //             },
        //             {
        //                 "currency_pair": "AVAX_USDT",
        //                 "last_price": "23.80761382",
        //                 "base_volume": "45.09235372",
        //                 "quote_volume": "1073.5458110958"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data');
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "currency_pair": "XMR_USDT",
        //         "last_price": "158.04829771",
        //         "base_volume": "0.35185785",
        //         "quote_volume": "55.523761128544"
        //     }
        //
        const marketId = this.safeString (market, 'currency_pair');
        const parts = marketId.split ('_');
        const baseId = parts[0];
        const quoteId = parts[1];
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const fees = this.safeDict (this.fees, 'trading');
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': 'spot',
            'subType': undefined,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'percentage': this.safeBool (fees, 'percentage'),
            'tierBased': undefined,
            'feeSide': this.safeString (fees, 'feeSide'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
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
        });
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name cryptomus#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://doc.cryptomus.com/personal/market-cap/tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1ExchangeMarketTickers (params);
        const data = this.safeList (response, 'data');
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "currency_pair": "XMR_USDT",
        //         "last_price": "158.04829771",
        //         "base_volume": "0.35185785",
        //         "quote_volume": "55.523761128544"
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_price');
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
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        const query = this.urlencode (params);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
