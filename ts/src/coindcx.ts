
//  ---------------------------------------------------------------------------

import Exchange from './abstract/coindcx.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class coindcx
 * @augments Exchange
 */
export default class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': [ 'IN' ], // India
            'version': 'v1',
            'rateLimit': 960, // 960 per minute
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
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
                    'public': 'https://api.coindcx.com', // base URL for some public endpoint is https://public.coindcx.com. However, it will only be used where it is exclusively mentioned in the documentation.
                    'private': 'https://api.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': [
                    'https://docs.coindcx.com/',
                ],
                'fees': '', // The User hereby agrees and acknowledges that presently no fees or charges are levied by CoinDCX for the use of CoinDCX API
            },
            'api': {
                'public': {
                    'get': {
                        'exchange/ticker': 1,
                        'exchange/v1/markets': 1,
                        'exchange/v1/markets_details': 1,
                        'market_data/trade_history': 1,
                        'market_data/orderbook': 1,
                        'market_data/candles': 1,
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                        'exchange/v1/users/balances': 1,
                        'exchange/v1/users/info': 1,
                        'exchange/v1/orders/create': 1,
                        'exchange/v1/orders/create_multiple': 1,
                        'exchange/v1/orders/status': 1,
                        'exchange/v1/orders/status_multiple': 1,
                        'exchange/v1/orders/active_orders': 1,
                        'exchange/v1/orders/trade_history': 1,
                        'exchange/v1/orders/active_orders_count': 1,
                        'exchange/v1/orders/cancel_all': 1,
                        'exchange/v1/orders/cancel_by_ids': 1,
                        'exchange/v1/orders/cancel': 1,
                        'exchange/v1/orders/edit': 1,
                        'exchange/v1/funding/fetch_orders': 1,
                        'exchange/v1/funding/lend': 1,
                        'exchange/v1/funding/settle': 1,
                        'exchange/v1/margin/create': 1,
                        'exchange/v1/margin/cancel': 1,
                        'exchange/v1/margin/exit': 1,
                        'exchange/v1/margin/edit_target': 1,
                        'exchange/v1/margin/edit_price_of_target_order': 1,
                        'exchange/v1/margin/edit_sl': 1,
                        'exchange/v1/margin/edit_trailing_sl': 1,
                        'exchange/v1/margin/add_margin': 1,
                        'exchange/v1/margin/remove_margin': 1,
                        'exchange/v1/margin/fetch_orders': 1,
                        'exchange/v1/margin/order': 1,
                    },
                    'delete': {
                    },
                },
            },
            'fees': {
                // currently no fees
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
