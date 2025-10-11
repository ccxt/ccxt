
// ---------------------------------------------------------------------------

import Exchange from './abstract/deepcoin.js';
import { } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Dict, Market, Str } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class deepcoin
 * @augments Exchange
 */
export default class deepcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'deepcoin',
            'name': 'DeepCoin',
            'countries': [ 'SG' ], // Singapore
            'rateLimit': 50, // 20 times per second
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
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
                'createLimitBuyOrder': false,
                'createLimitOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLossOrder': false,
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
                'fetchDepositWithdrawFees': false,
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
                'fetchOpenInterest': false,
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
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15': '15m',
                '30': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1month',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.deepcoin.com',
                    'private': 'https://api.deepcoin.com',
                },
                'www': 'https://www.deepcoin.com/',
                'doc': 'https://www.deepcoin.com/docs',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'deepcoin/market/books': 1,
                        'deepcoin/market/candles': 1,
                        'deepcoin/market/instruments': 1,
                        'deepcoin/market/tickers': 1,
                        'deepcoin/market/index-candles': 1,
                        'deepcoin/market/trades': 1,
                        'deepcoin/market/mark-price-candles': 1,
                        'deepcoin/market/step-margin': 1,
                    },
                },
                'private': {
                    'get': {
                        'deepcoin/account/balances': 1,
                        'deepcoin/account/bills': 1,
                        'deepcoin/account/positions': 1,
                        'deepcoin/trade/fills': 1,
                        'deepcoin/trade/orderByID': 1,
                        'deepcoin/trade/finishOrderByID': 1,
                        'deepcoin/trade/orders-history': 1,
                        'deepcoin/trade/v2/orders-pending': 1,
                        'deepcoin/trade/funding-rate': 1,
                        'deepcoin/trade/fund-rate/current-funding-rate': 1,
                        'deepcoin/trade/fund-rate/history': 1,
                        'deepcoin/trade/trigger-orders-pending': 1,
                        'deepcoin/trade/trigger-orders-history': 1,
                        'deepcoin/copytrading/support-contracts': 1,
                        'deepcoin/copytrading/leader-position': 1,
                        'deepcoin/copytrading/estimate-profit': 1,
                        'deepcoin/copytrading/history-profit': 1,
                        'deepcoin/copytrading/follower-rank': 1,
                        'deepcoin/internal-transfer/support': 1,
                        'deepcoin/internal-transfer/history-order': 1,
                        'deepcoin/rebate/config': 1,
                        'deepcoin/agents/users': 1,
                        'deepcoin/agents/users/rebate-list': 1,
                        'deepcoin/agents/users/rebates': 1,
                        'deepcoin/asset/deposit-list': 1,
                        'deepcoin/asset/withdraw-list': 1,
                        'deepcoin/asset/recharge-chain-list': 1,
                    },
                    'post': {
                        'deepcoin/account/set-leverage': 1,
                        'deepcoin/trade/order': 1,
                        'deepcoin/trade/replace-order': 1,
                        'deepcoin/trade/cancel-order': 1,
                        'deepcoin/trade/batch-cancel-order': 1,
                        'deepcoin/trade/cancel-trigger-order': 1,
                        'deepcoin/trade/swap/cancel-all': 1,
                        'deepcoin/trade/trigger-order': 1,
                        'deepcoin/trade/batch-close-position': 1,
                        'deepcoin/trade/replace-order-sltp': 1,
                        'deepcoin/trade/close-position-by-ids': 1,
                        'deepcoin/copytrading/leader-settings': 1,
                        'deepcoin/copytrading/set-contracts': 1,
                        'deepcoin/internal-transfer': 1,
                        'deepcoin/rebate/config': 1,
                        'deepcoin/asset/transfer': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber ('0.0015'),
                    'maker': this.parseNumber ('0.0010'),
                },
            },
            'features': {
            },
            'requiredCredentials': {
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'recvWindow': 5000,
                'networks': {
                },
                'networksById': {
                },
                'fetchMarkets': {
                    'types': [ 'spot', 'swap' ], // spot, swap,
                },
                'exchangeType': {
                    'spot': 'SPOT',
                    'swap': 'SWAP',
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // { code: '51', msg: 'The instType field is required', data: null }
                    // {"code":"51","msg":"The instType value `spot` is not in acceptable range: SPOT,SWAP","data":null}
                },
                'broad': {},
            },
        });
    }

    handleMarketTypeAndParams (methodName: string, market: Market = undefined, params = {}, defaultValue = undefined): any {
        const instType = this.safeString (params, 'instType');
        params = this.omit (params, 'instType');
        const type = this.safeString (params, 'type');
        if ((type === undefined) && (instType !== undefined)) {
            params['type'] = instType;
        }
        return super.handleMarketTypeAndParams (methodName, market, params, defaultValue);
    }

    convertToInstrumentType (type) {
        const exchangeTypes = this.safeDict (this.options, 'exchangeType', {});
        return this.safeString (exchangeTypes, type, type);
    }

    /**
     * @method
     * @name deepcoin#fetchMarkets
     * @see https://www.deepcoin.com/docs/DeepCoinMarket/getBaseInfo
     * @description retrieves data on all markets for okcoin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const types = [ 'spot','swap' ];
        let promises = [];
        let result = [];
        for (let i = 0; i < types.length; i++) {
            promises.push (this.fetchMarketsByType (types[i], params));
        }
        promises = await Promise.all (promises);
        for (let i = 0; i < promises.length; i++) {
            result = this.arrayConcat (result, promises[i]);
        }
        return result;
    }

    async fetchMarketsByType (type, params = {}) {
        const request: Dict = {
            'instType': this.convertToInstrumentType (type),
        };
        const response = await this.publicGetDeepcoinMarketInstruments (this.extend (request, params));
        //
        // spot, future, swap, option
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "A-USDT",
        //                 "uly": "",
        //                 "baseCcy": "A",
        //                 "quoteCcy": "USDT",
        //                 "ctVal": "1",
        //                 "ctValCcy": "",
        //                 "listTime": "0",
        //                 "lever": "1",
        //                 "tickSz": "0.0001",
        //                 "lotSz": "0.001",
        //                 "minSz": "0.5",
        //                 "ctType": "",
        //                 "alias": "",
        //                 "state": "live",
        //                 "maxLmtSz": "7692307",
        //                 "maxMktSz": "7692307"
        //             }
        //         ]
        //     }
        //
        const dataResponse = this.safeList (response, 'data', []);
        return this.parseMarkets (dataResponse);
    }

    parseMarket (market: Dict): Market {
        //
        // spot markets
        //
        //     {
        //         "instType": "SPOT",
        //         "instId": "A-USDT",
        //         "uly": "",
        //         "baseCcy": "A",
        //         "quoteCcy": "USDT",
        //         "ctVal": "1",
        //         "ctValCcy": "",
        //         "listTime": "0",
        //         "lever": "1",
        //         "tickSz": "0.0001",
        //         "lotSz": "0.001",
        //         "minSz": "0.5",
        //         "ctType": "",
        //         "alias": "",
        //         "state": "live",
        //         "maxLmtSz": "7692307",
        //         "maxMktSz": "7692307"
        //     }
        //
        // swap markets
        //
        //     {
        //         "instType": "SWAP",
        //         "instId": "ZORA-USDT-SWAP",
        //         "uly": "",
        //         "baseCcy": "ZORA",
        //         "quoteCcy": "USDT",
        //         "ctVal": "1",
        //         "ctValCcy": "",
        //         "listTime": "0",
        //         "lever": "20",
        //         "tickSz": "0.00001",
        //         "lotSz": "1",
        //         "minSz": "1685",
        //         "ctType": "",
        //         "alias": "",
        //         "state": "live",
        //         "maxLmtSz": "10000000",
        //         "maxMktSz": "10000000"
        //     }
        //
        const id = this.safeString (market, 'instId');
        const type = this.safeStringLower (market, 'instType');
        const spot = (type === 'spot');
        const swap = (type === 'swap');
        let baseId = this.safeString (market, 'baseCcy');
        let quoteId = this.safeString (market, 'quoteCcy', '');
        const settleId = this.safeString (market, 'quoteCcy'); // todo but I think that we use quoteId as settleId for swap markets
        const settle = this.safeCurrencyCode (settleId);
        const underlying = this.safeString (market, 'uly');
        if ((underlying !== undefined) && !spot) {
            const parts = underlying.split ('-');
            baseId = this.safeString (parts, 0);
            quoteId = this.safeString (parts, 1);
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        if (swap) {
            if (settle !== undefined) {
                symbol = symbol + ':' + settle;
            }
        }
        const fees = this.safeDict2 (this.fees, type, 'trading', {});
        let maxLeverage = this.safeString (market, 'lever', '1');
        maxLeverage = Precise.stringMax (maxLeverage, '1');
        const maxSpotCost = this.safeNumber (market, 'maxMktSz');
        return this.extend (fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': spot && (Precise.stringGt (maxLeverage, '1')),
            'swap': swap,
            'future': undefined,
            'option': undefined,
            'active': true,
            'contract': undefined,
            'linear': swap ? (quoteId === settleId) : undefined,
            'inverse': swap ? (baseId === settleId) : undefined,
            'contractSize': swap ? this.safeNumber (market, 'ctVal') : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'created': this.safeInteger (market, 'listTime'),
            'precision': {
                'amount': this.safeNumber (market, 'lotSz'),
                'price': this.safeNumber (market, 'tickSz'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.parseNumber (maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber (market, 'minSz'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': swap ? undefined : maxSpotCost,
                },
            },
            'info': market,
        });
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
