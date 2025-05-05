//  ---------------------------------------------------------------------------

import Exchange from './abstract/bullish.js';
import { } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bullish
 * @augments Exchange
 */
export default class bullish extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bullish',
            'name': 'Bullish',
            'countries': [ 'DE' ],
            'version': 'v3',
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
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
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
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
                'repayMargin': false,
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
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.exchange.bullish.com/trading-api',
                    'private': 'https://api.exchange.bullish.com/trading-api',
                },
                'www': 'https://bullish.com/',
                'referral': '',
                'doc': [
                    'https://api.exchange.bullish.com/docs/api/rest/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v1/nonce': 1,
                        'v1/time': 1,
                        'v1/assets': 1,
                        'v1/assets/{symbol}': 1,
                        'v1/markets': 1,
                        'v1/markets/{symbol}': 1,
                        'v1/markets/{symbol}/orderbook/hybrid': 1,
                        'v1/markets/{symbol}/trades': 1,
                        'v1/markets/{symbol}/tick': 1,
                        'v1/markets/{symbol}/candle': 1,
                        'v1/history/markets/{symbol}/trades': 1,
                        'v1/history/markets/{symbol}/funding-rate': 1,
                        'v1/index-prices': 1,
                        'v1/index-prices/{assetSymbol}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/orders': 1,
                        'v2/orders/{orderId}': 1,
                        'v2/amm-instructions': 1,
                        'v2/amm-instructions/{instructionId}': 1,
                        'v1/wallets/transactions': 1,
                        'v1/wallets/limits/{symbol}': 1,
                        'v1/wallets/deposit-instructions/crypto/{symbol}': 1,
                        'v1/wallets/withdrawal-instructions/crypto/{symbol}': 1,
                        'v1/wallets/deposit-instructions/fiat/{symbol}': 1,
                        'v1/wallets/withdrawal-instructions/fiat/{symbol}': 1,
                        'v1/trades': 1,
                        'v1/trades/{tradeId}': 1,
                        'v1/accounts/asset': 1,
                        'v1/accounts/asset/{symbol}': 1,
                        'v1/users/logout': 1,
                        'v1/users/hmac/login': 1,
                        'v1/accounts/trading-accounts': 1,
                        'v1/accounts/trading-accounts/{tradingAccountId}': 1,
                        'v1/derivatives-positions': 1,
                        'v1/history/derivatives-settlement': 1,
                        'v1/history/transfer': 1,
                        'v1/history/borrow-interest': 1,
                    },
                    'post': {
                        'v2/orders': 1,
                        'v2/command': 1,
                        'v2/amm-instructions': 1,
                        'v1/wallets/withdrawal': 1,
                        'v2/users/login': 1,
                        'v1/command?commandType=V1TransferAsset': 1,
                        'v1/simulate-portfolio-margin': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'networksById': {
                },
            },
            'features': {
                'spot': {
                },
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name bullish#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetV1Time (params);
        //
        //     {
        //         "datetime": "2025-05-05T20:05:50.999Z",
        //         "timestamp": 1746475550999
        //     }
        //
        return this.safeInteger (response, 'timestamp');
    }


    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        url += '?' + query;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
