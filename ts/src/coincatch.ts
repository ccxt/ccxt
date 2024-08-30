
// ---------------------------------------------------------------------------

import Exchange from './abstract/coincatch.js';
import { } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Int, Str } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class coincatch
 * @augments Exchange
 */
export default class coincatch extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coincatch',
            'name': 'CoinCatch',
            'countries': [ 'BVI' ], // British Virgin Islands
            'rateLimit': 20,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
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
                'fetchMarkets': false,
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
            'timeframes': {
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.coincatch.com',
                    'private': 'https://api.coincatch.com',
                },
                'www': 'https://www.coincatch.com/',
                'doc': 'https://coincatch.github.io/github.io/en/',
                'fees': 'https://www.coincatch.com/en/rate/',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'api/spot/v1/public/time': 1,
                        'api/spot/v1/public/currencies': 1,
                        'api/spot/v1/market/ticker': 1,
                        'api/spot/v1/market/tickers': 1,
                        'api/spot/v1/market/fills': 1,
                        'api/spot/v1/market/fills-history': 1,
                        'api/spot/v1/market/candles': 1,
                        'api/spot/v1/market/history-candles': 1,
                        'api/spot/v1/market/depth': 1,
                        'api/spot/v1/market/merge-depth': 1,
                        'api/mix/v1/market/contracts': 1,
                        'api/mix/v1/market/merge-depth': 1,
                        'api/mix/v1/market/depth': 1,
                        'api/mix/v1/market/ticker': 1,
                        'api/mix/v1/market/tickers': 1,
                        'api/mix/v1/market/fills': 1,
                        'api/mix/v1/market/fills-history': 1,
                        'api/mix/v1/market/candles': 1,
                        'pi/mix/v1/market/index': 1,
                        'api/mix/v1/market/funding-time': 1,
                        'api/mix/v1/market/history-fundRate': 1,
                        'api/mix/v1/market/current-fundRate': 1,
                        'api/mix/v1/market/open-interest': 1,
                        'api/mix/v1/market/mark-price': 1,
                        'api/mix/v1/market/symbol-leverage': 1,
                        'api/mix/v1/market/queryPositionLever': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/spot/v1/wallet/deposit-address': 1,
                        'pi/spot/v1/wallet/withdrawal-list': 1,
                        'api/spot/v1/wallet/withdrawal-list-v2': 1,
                        'api/spot/v1/wallet/deposit-list': 1,
                        'api/spot/v1/account/getInfo': 1,
                        'api/spot/v1/account/assets': 1,
                        'api/spot/v1/account/bills': 1,
                        'api/spot/v1/account/transferRecords': 1,
                        'api/mix/v1/account/account': 1,
                        'api/mix/v1/account/accounts': 1,
                        'api/mix/v1/position/singlePosition-v2': 1,
                        'api/mix/v1/position/allPosition-v2': 1,
                        'api/mix/v1/account/accountBill': 1,
                        'api/mix/v1/account/accountBusinessBill': 1,
                        'api/mix/v1/order/current': 1,
                        'api/mix/v1/order/marginCoinCurrent': 1,
                        'api/mix/v1/order/history': 1,
                        'api/mix/v1/order/historyProductType': 1,
                        'api/mix/v1/order/detail': 1,
                        'api/mix/v1/order/fills': 1,
                        'api/mix/v1/order/allFills': 1,
                        'api/mix/v1/plan/currentPlan': 1,
                        'api/mix/v1/plan/historyPlan': 1,
                    },
                    'post': {
                        'api/spot/v1/wallet/transfer-v2': 1,
                        'api/spot/v1/wallet/withdrawal-v2': 1,
                        'api/spot/v1/wallet/withdrawal-inner-v2': 1,
                        'api/spot/v1/trade/orders': 1,
                        'api/spot/v1/trade/batch-orders': 1,
                        'api/spot/v1/trade/cancel-order': 1,
                        'api/spot/v1/trade/cancel-order-v2': 1,
                        'api/spot/v1/trade/cancel-symbol-orders': 1,
                        'api/spot/v1/trade/cancel-batch-orders': 1,
                        'api/spot/v1/trade/cancel-batch-orders-v2': 1,
                        'api/spot/v1/trade/orderInfo': 1,
                        'api/spot/v1/trade/open-orders': 1,
                        'api/spot/v1/trade/history': 1,
                        'api/spot/v1/trade/fills': 1,
                        'api/spot/v1/plan/placePlan': 1,
                        'api/spot/v1/plan/modifyPlan': 1,
                        'api/spot/v1/plan/cancelPlan': 1,
                        'api/spot/v1/plan/currentPlan': 1,
                        'api/spot/v1/plan/historyPlan': 1,
                        'api/spot/v1/plan/batchCancelPlan': 1,
                        'api/mix/v1/account/open-count': 1,
                        'api/mix/v1/account/setLeverage': 1,
                        'api/mix/v1/account/setMargin': 1,
                        'api/mix/v1/account/setMarginMode': 1,
                        'api/mix/v1/account/setPositionMode': 1,
                        'api/mix/v1/order/cancel-order': 1,
                        'api/mix/v1/order/cancel-batch-orders': 1,
                        'api/mix/v1/order/cancel-symbol-orders': 1,
                        'api/mix/v1/order/cancel-all-orders': 1,
                        'api/mix/v1/plan/placePlan': 1,
                        'api/mix/v1/plan/modifyPlan': 1,
                        'api/mix/v1/plan/modifyPlanPreset': 1,
                        'api/mix/v1/plan/placeTPSL': 1,
                        'api/mix/v1/plan/placeTrailStop': 1,
                        'api/mix/v1/plan/placePositionsTPSL': 1,
                        'api/mix/v1/plan/modifyTPSLPlan': 1,
                        'api/mix/v1/plan/cancelPlan': 1,
                        'api/mix/v1/plan/cancelSymbolPlan': 1,
                        'api/mix/v1/plan/cancelAllPlan': 1,
                    },
                    'put': {
                        'api/v1/userDataStream': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                },
            },
            'options': {
                'broker': '',
                'recvWindow': undefined,
                'sandboxMode': false,
                'networks': {
                },
                'networksById': {
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchTime (params = {}): Promise<Int> {
        /**
         * @method
         * @name coincatch#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://coincatch.github.io/github.io/en/spot/#get-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetApiSpotV1PublicTime (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725046822028,
        //         "data": "1725046822028"
        //     }
        //
        return this.safeInteger (response, 'requestTime');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query: Str = undefined;
        query = this.urlencode (params);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
