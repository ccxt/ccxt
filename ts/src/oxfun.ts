
//  ---------------------------------------------------------------------------

import Exchange from './abstract/oxfun.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class oxfun
 * @augments Exchange
 */
export default class oxfun extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oxfun',
            'name': 'Oxfun',
            'countries': [ 'PA' ], // Panama but need to be confirmed
            'version': 'v3',
            'rateLimit': 300, // 500 per minute
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': undefined,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                // todo: complete list of timeframes
            },
            'urls': {
                'logo': '', // todo: add a logo
                'api': {
                    'public': 'https://api.ox.fun',
                    'private': 'https://api.ox.fun',
                },
                'www': 'https://ox.fun/',
                'doc': [
                    'https://docs.ox.fun/',
                ],
                'fees': 'https://support.ox.fun/en/articles/8819866-trading-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'v3/markets': 1,
                        'v3/assets': 1,
                        'v3/tickers': 1,
                        'v3/funding/estimates': 1,
                        'v3/candles': 1,
                        'v3/depth': 1,
                        'v3/markets/operational': 1,
                        'v3/exchange-trades': 1,
                        'v3/funding/rates': 1,
                        'v3/leverage/tiers': 1,
                    },
                },
                'private': {
                    'get': {
                        'v3/account': 1,
                        'v3/account/names': 1,
                        'v3/wallets': 1,
                        'v3/transfer': 1,
                        'v3/balances': 1,
                        'v3/positions': 1,
                        'v3/funding': 1,
                        'v3/deposit-addresses': 1,
                        'v3/deposit': 1,
                        'v3/withdrawal-addresses': 1,
                        'v3/withdrawal': 1,
                        'v3/withdrawal-fees': 1,
                        'v3/orders/status': 1,
                        'v3/orders/working': 1,
                        'v3/trades': 1,
                    },
                    'post': {
                        'v3/transfer': 1,
                        'v3/withdrawal': 1,
                        'v3/orders/place': 1,
                    },
                    'delete': {
                        'v3/orders/cancel': 1,
                        'v3/orders/cancel-all': 1,
                    },
                },
            },
            'fees': {
                // todo: deduce the fees from the API
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'networks': {
                    // todo: complete list of networks
                },
            },
            'exceptions': {
                'exact': {
                    // todo: add more error codes
                },
                'broad': {
                    // todo: add more error codes
                },
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name oxfun#fetchMarkets
         * @description retrieves data on all markets for bitmex
         * @see https://docs.ox.fun/?json#get-v3-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV3Markets (params);
        //
        //         {
        //             success: true,
        //             data: [
        //                 {
        //                     marketCode: 'OX-USD-SWAP-LIN',
        //                     name: 'OX/USD Perp',
        //                     referencePair: 'OX/USDT',
        //                     base: 'OX',
        //                     counter: 'USD',
        //                     type: 'FUTURE',
        //                     tickSize: '0.00001',
        //                     minSize: '1',
        //                     listedAt: '1704766320000',
        //                     upperPriceBound: '0.02122',
        //                     lowerPriceBound: '0.01142',
        //                     markPrice: '0.01632',
        //                     indexPrice: '0.01564',
        //                     lastUpdatedAt: '1714762235569'
        //                 },
        //                 {
        //                     marketCode: 'BTC-USD-SWAP-LIN',
        //                     name: 'BTC/USD Perp',
        //                     referencePair: 'BTC/USDT',
        //                     base: 'BTC',
        //                     counter: 'USD',
        //                     type: 'FUTURE',
        //                     tickSize: '1',
        //                     minSize: '0.0001',
        //                     listedAt: '1704686640000',
        //                     upperPriceBound: '67983',
        //                     lowerPriceBound: '55621',
        //                     markPrice: '61802',
        //                     indexPrice: '61813',
        //                     lastUpdatedAt: '1714762234765'
        //                 },
        //                 ...
        //             ]
        //         }
        //
        const markets = this.safeValue (response, 'data', []);
        return markets;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        query = this.urlencode (query);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
