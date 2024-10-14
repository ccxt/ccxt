
// ---------------------------------------------------------------------------

import Exchange from './abstract/defx.js';
// import { AuthenticationError, RateLimitExceeded, BadRequest, OperationFailed, ExchangeError, InvalidOrder, ArgumentsRequired, NotSupported, OnMaintenance } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import type { TransferEntry, Balances, Conversion, Currency, FundingRateHistory, Int, Market, MarginModification, MarketType, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Dict, Bool, Strings, Trade, Transaction, Leverage, Account, Currencies, TradingFees, int, FundingHistory, LedgerEntry, FundingRate, FundingRates, DepositAddress } from './base/types.js';
import type { Dict, int } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class defx
 * @augments Exchange
 */
export default class defx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'defx',
            'name': 'Defx X',
            // 'countries': [ '' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'hostname': 'defx.com',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': true,
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
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
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
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/defxtrade-documents/#token-withdraw
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
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.testnet.{hostname}',
                    'private': 'https://api.testnet.{hostname}',
                },
                'www': 'https://defx.com/home',
                'doc': [
                    'https://docs.defx.com/docs',
                    'https://api-docs.defx.com/',
                ],
                'fees': [
                    '',
                ],
                'referral': {
                    'url': '',
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'healthcheck/ping': 1,
                            'symbols/{symbol}/ohlc': 1,
                            'symbols/{symbol}/trades': 1,
                            'symbols/{symbol}/prices': 1,
                            'symbols/{symbol}/ticker/24hr': 1,
                            'symbols/{symbol}/depth/5/0.01': 1,
                            'ticker/24HrAgg': 1,
                            'c/markets': 1,
                            'c/markets/metadata': 1,
                            'analytics/market/stats/newUsers': 1,
                            'analytics/market/stats/tvl': 1,
                            'analytics/market/stats/volumeByInstrument': 1,
                            'analytics/market/stats/liquidation': 1,
                            'analytics/market/stats/totalVolume': 1,
                            'analytics/market/stats/openInterest': 1,
                            'analytics/market/stats/totalTrades': 1,
                            'analytics/market/stats/basis': 1,
                            'analytics/market/stats/insuranceFund': 1,
                            'analytics/market/stats/longAndShortRatio': 1,
                            'analytics/market/stats/fundingRate': 1,
                            'analytics/market/overview': 1,
                            'explorer/search': 1,
                            'explorer/transactions': 1,
                            'explorer/blocks': 1,
                        },
                    },
                    'private': {
                        'get': {
                        },
                        'post': {
                        },
                        'delete': {
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
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'networks': {
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'brokerId': 'bc830de7-50f3-460b-9ee0-f430f83f9dad',
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

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name defx#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetHealthcheckPing (params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        let status = undefined;
        const success = this.safeBool (response, 'success');
        if (success) {
            status = 'ok';
        } else {
            status = 'error';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name defx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v1PublicGetHealthcheckPing (params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        return this.safeInteger (response, 't');
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
            url += 'open/' + pathWithParams;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
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

    defaultNetworkCodeForCurrency (code) { // TODO: can be moved into base as an unified method
        const currencyItem = this.currency (code);
        const networks = currencyItem['networks'];
        const networkKeys = Object.keys (networks);
        for (let i = 0; i < networkKeys.length; i++) {
            const network = networkKeys[i];
            if (network === 'ETH') {
                return network;
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        return this.safeValue (networkKeys, 0);
    }

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }
}
