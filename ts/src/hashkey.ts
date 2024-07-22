
// ---------------------------------------------------------------------------

import Exchange from './abstract/hashkey.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class hashkey
 * @augments Exchange
 */
export default class hashkey extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hashkey',
            'name': 'HashKey Global',
            'countries': [ 'BM' ], // Bermuda
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'https://global.hashkey.com/',
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
                'cancelOrder': false,
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
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': 'emulated',
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
                    'public': 'https://api-glb.hashkey.com',
                    'private': 'https://api-glb.hashkey.com',
                },
                'test': {
                    'public': 'https://api-glb.sim.hashkeydev.com',
                    'private': 'https://api-glb.sim.hashkeydev.com',
                },
                'www': 'https://global.hashkey.com/',
                'doc': [
                    'https://hashkeyglobal-apidoc.readme.io/',
                ],
                'fees': [
                    'https://support.global.hashkey.com/hc/en-us/articles/13199900083612-HashKey-Global-Fee-Structure',
                ],
                'referral': {
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'api/v1/exchangeInfo': 1,
                            'quote/v1/depth': 1,
                            'quote/v1/trades': 1,
                            'quote/v1/klines': 1,
                            'quote/v1/ticker/24hr': 1,
                            'quote/v1/ticker/price': 1,
                            'quote/v1/ticker/bookTicker': 1,
                            'quote/v1/depth/merged': 1,
                            'quote/v1/markPrice': 1,
                            'quote/v1/index': 1,
                            'api/v1/ping': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'api/v1/time': 1,
                            'api/v1/spot/order': 1,
                            'api/v1/spot/openOrders': 1,
                            'api/v1/spot/tradeOrders': 1,
                            'api/v1/futures/leverage': 1,
                            'api/v1/futures/order': 1,
                            'api/v1/futures/openOrders': 1,
                            'api/v1/futures/userTrades': 1,
                            'api/v1/futures/positions': 1,
                            'api/v1/futures/historyOrders': 1,
                            'api/v1/futures/balance': 1,
                            'api/v1/futures/liquidationAssignStatus': 1,
                            'api/v1/futures/fundingRate': 1,
                            'api/v1/futures/historyFundingRate': 1,
                            'api/v1/futures/riskLimit': 1,
                            'api/v1/futures/commissionRate': 1,
                            'api/v1/futures/getBestOrders': 1,
                            'api/v1/account/vipInfo': 1,
                            'api/v1/account': 1,
                            'api/v1/account/trades': 1,
                            'api/v1/account/types': 1,
                            'api/v1/account/checkApiKey': 1,
                            'api/v1/account/balanceFlow': 1,
                            'api/v1/spot/subAccount/openOrders': 1,
                            'api/v1/spot/subAccount/tradeOrders': 1,
                            'api/v1/subAccount/trades': 1,
                            'api/v1/futures/subAccount/openOrders': 1,
                            'api/v1/futures/subAccount/historyOrders': 1,
                            'api/v1/futures/subAccount/userTrades': 1,
                            'api/v1/account/deposit/address': 1,
                            'api/v1/account/depositOrders': 1,
                            'api/v1/account/withdrawOrders': 1,
                        },
                        'post': {
                            'api/v1/userDataStream': 1,
                            'api/v1/spot/orderTest': 1,
                            'api/v1/spot/order': 1,
                            'api/v1/spot/batchOrders': 1,
                            'api/v1/futures/leverage': 1,
                            'api/v1/futures/order': 1,
                            'api/v1/futures/position/trading-stop': 1,
                            'api/v1/futures/batchOrders': 1,
                            'api/v1/account/assetTransfer': 1,
                            'api/v1/account/authAddress': 1,
                            'api/v1/account/withdraw': 1,
                        },
                        'delete': {
                            'api/v1/spot/order': 1,
                            'api/v1/spot/openOrders': 1,
                            'api/v1/spot/cancelOrderByIds': 1,
                            'api/v1/futures/order': 1,
                            'api/v1/futures/batchOrders': 1,
                            'api/v1/futures/cancelOrderByIds': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                },
            },
            'options': {
                'sandboxMode': false,
                'networks': {
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    nonce () {
        return this.milliseconds ();
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
