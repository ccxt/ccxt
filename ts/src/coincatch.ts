
// ---------------------------------------------------------------------------

import Exchange from './abstract/coincatch.js';
import { } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Dict, Int, List, Num, Str } from './base/types.js';

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
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
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
                'fetchCurrencies': true,
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
                'currenciesByIdForParseMarket': undefined,
                'broker': '',
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
        return this.safeInteger (response, 'data');
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name coincatch#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://coincatch.github.io/github.io/en/spot/#get-coin-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetApiSpotV1PublicCurrencies (params);
        const data = this.safeList (response, 'data', []);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725102364202,
        //         "data": [
        //             {
        //                 "coinId": "1",
        //                 "coinName": "BTC",
        //                 "transfer": "true",
        //                 "chains": [
        //                     {
        //                         "chainId": "10",
        //                         "chain": "BITCOIN",
        //                         "needTag": "false",
        //                         "withdrawable": "true",
        //                         "rechargeable": "true",
        //                         "withdrawFee": "0.0005",
        //                         "extraWithDrawFee": "0",
        //                         "depositConfirm": "1",
        //                         "withdrawConfirm": "1",
        //                         "minDepositAmount": "0.00001",
        //                         "minWithdrawAmount": "0.001",
        //                         "browserUrl": "https://blockchair.com/bitcoin/transaction/"
        //                     }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const result: Dict = {};
        const spotCurrenciesIds: List = [];
        for (let i = 0; i < data.length; i++) {
            const currecy = data[i];
            const currencyId = this.safeString (currecy, 'coinName');
            spotCurrenciesIds.push (currencyId);
            const code = this.safeCurrencyCode (currencyId);
            let allowDeposit = false;
            let allowWithdraw = false;
            let minDeposit: Num = undefined;
            let minWithdraw: Num = undefined;
            const networks = this.safeList (currecy, 'chains');
            // const networksById = this.safeDict (this.options, 'networksById');
            const parsedNetworks: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'chain');
                // const networkName = this.safeString (networksById, networkId, networkId);
                const networkDeposit = this.safeBool (network, 'rechargeable');
                const networkWithdraw = this.safeBool (network, 'withdrawable');
                const networkMinDeposit = this.safeNumber (network, 'minDepositAmount');
                const networkMinWithdraw = this.safeNumber (network, 'minWithdrawAmount');
                parsedNetworks[networkId] = {
                    'id': networkId,
                    'network': '', // todo
                    'limits': {
                        'deposit': {
                            'min': networkMinDeposit,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': networkMinWithdraw,
                            'max': undefined,
                        },
                    },
                    'active': networkDeposit && networkWithdraw,
                    'deposit': networkDeposit,
                    'withdraw': networkWithdraw,
                    'fee': this.safeNumber (network, 'withdrawFee'),
                    'precision': undefined,
                    'info': network,
                };
                allowDeposit = allowDeposit ? allowDeposit : networkDeposit;
                allowWithdraw = allowWithdraw ? allowWithdraw : networkWithdraw;
                minDeposit = minDeposit ? Math.min (networkMinDeposit, minDeposit) : networkMinDeposit;
                minWithdraw = minWithdraw ? Math.min (networkMinWithdraw, minWithdraw) : networkMinWithdraw;
            }
            result[code] = {
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': undefined,
                'name': undefined,
                'active': allowWithdraw && allowDeposit,
                'deposit': allowDeposit,
                'withdraw': allowWithdraw,
                'fee': undefined,
                'limits': {
                    'deposit': {
                        'min': minDeposit,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minWithdraw,
                        'max': undefined,
                    },
                },
                'networks': parsedNetworks,
                'info': currecy,
            };
        }
        this.options['currenciesByIdForParseMarket'] = spotCurrenciesIds;
        return result;
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
