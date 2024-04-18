
// ---------------------------------------------------------------------------

import Exchange from './abstract/woofipro.js';
import { TICK_SIZE } from './base/functions/number.js';

// ---------------------------------------------------------------------------

/**
 * @class woofipro
 * @augments Exchange
 */
export default class woofipro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woofipro',
            'name': 'WOOFI PRO',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'dex.woo.org',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelWithdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api-evm.orderly.org',
                    'private': 'https://api-evm.orderly.org',
                },
                'test': {
                    'public': 'https://testnet-operator-evm.orderly.org',
                    'private': 'https://testnet-operator-evm.orderly.org',
                },
                'www': 'https://dex.woo.org',
                'doc': [
                    'https://orderly.network/docs/build-on-evm/building-on-evm',
                ],
                'fees': [
                    'https://dex.woo.org/en/orderly',
                ],
                'referral': {
                    'url': '',
                    'discount': 0, // TODO: update
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'public/volume/stats': 1,
                            'public/broker/name': 1,
                            'public/chain_info/{broker_id}': 1,
                            'public/system_info': 1,
                            'public/vault_balance': 1,
                            'public/insurancefund': 1,
                            'public/chain_info': 1,
                            'faucet/usdc': 1,
                            'public/account': 1,
                            'get_account': 1,
                            'registration_nonce': 1,
                            'get_orderly_key': 1,
                            'public/liquidation': 1,
                            'public/liquidated_positions': 1,
                            'public/config': 1,
                            'public/campaign/ranking': 10,
                            'public/campaign/stats': 10,
                            'public/campaign/user': 10,
                            'public/campaign/stats/details': 10,
                            'public/campaigns': 10,
                            'public/points/leaderboard': 1,
                            'client/points': 1,
                            'public/points/epoch': 1,
                            'public/points/epoch_dates': 1,
                            'public/referral/check_ref_code': 1,
                            'public/referral/verify_ref_code': 1,
                            'referral/admin_info': 1,
                            'referral/info': 1,
                            'referral/referee_info': 1,
                            'referral/referee_rebate_summary': 1,
                            'referral/referee_history': 1,
                            'referral/referral_history': 1,
                            'referral/rebate_summary': 1,
                            'client/distribution_history': 1,
                            'tv/config': 1,
                            'tv/history': 1,
                            'tv/symbol_info': 1,
                            'public/funding_rate_history': 1,
                            'public/funding_rate/{symbol}': 0.33,
                            'public/funding_rates': 1,
                            'public/info': 1,
                            'public/info/{symbol}': 1,
                            'public/market_trades': 1,
                            'public/token': 1,
                            'public/futures': 1,
                            'public/futures/{symbol}': 1,
                        },
                        'post': {
                            'register_account': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/key_info': 6,
                            'client/orderly_key_ip_restriction': 6,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'algo/order/{oid}': 1,
                            'algo/client/order/{client_order_id}': 1,
                            'orders': 1,
                            'algo/orders': 1,
                            'trade/{tid}': 1,
                            'trades': 1,
                            'order/{oid}/trades': 1,
                            'client/liquidator_liquidations': 1,
                            'liquidations': 1,
                            'asset/history': 60,
                            'client/holding': 1,
                            'withdraw_nonce': 1,
                            'settle_nonce': 1,
                            'pnl_settlement/history': 1,
                            'volume/user/daily': 60,
                            'volume/user/stats': 60,
                            'client/statistics': 60,
                            'client/info': 60,
                            'client/statistics/daily': 60,
                            'positions': 3.33,
                            'position/{symbol}': 3.33,
                            'funding_fee/history': 30,
                            'notification/inbox/notifications': 60,
                            'notification/inbox/unread': 60,
                            'volume/broker/daily': 60,
                            'broker/fee_rate/default': 10,
                            'broker/user_info': 10,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                        },
                        'post': {
                            'orderly_key': 1,
                            'client/set_orderly_key_ip_restriction': 6,
                            'client/reset_orderly_key_ip_restriction': 6,
                            'order': 1,
                            'batch-order': 10,
                            'algo/order': 1,
                            'liquidation': 1,
                            'claim_insurance_fund': 1,
                            'withdraw_request': 1,
                            'settle_pnl': 1,
                            'notification/inbox/mark_read': 60,
                            'notification/inbox/mark_read_all': 60,
                            'client/leverage': 120,
                            'client/maintenance_config': 60,
                            'delegate_signer': 10,
                            'delegate_orderly_key': 10,
                            'delegate_settle_pnl': 10,
                            'delegate_withdraw_request': 10,
                            'broker/fee_rate/set': 10,
                            'broker/fee_rate/set_default': 10,
                            'broker/fee_rate/default': 10,
                            'referral/create': 10,
                            'referral/update': 10,
                            'referral/bind': 10,
                            'referral/edit_split': 10,
                        },
                        'put': {
                            'order': 1,
                            'algo/order': 1,
                        },
                        'delete': {
                            'order': 1,
                            'algo/order': 1,
                            'client/order': 1,
                            'algo/client/order': 1,
                            'algo/orders': 1,
                            'orders': 1,
                            'batch-order': 1,
                            'client/batch-order': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
                'brokerId': '',
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

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name woofipro#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetPublicSystemInfo (params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": 0,
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        let status = this.safeString (data, 'status');
        if (status === undefined) {
            status = 'error';
        } else if (status === '0') {
            status = 'ok';
        } else {
            status = 'maintenance';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += pathWithParams;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }
}
