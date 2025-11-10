//  ---------------------------------------------------------------------------
import Exchange from './abstract/lighter.js';
import { ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Dict, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class lighter
 * @augments Exchange
 */
export default class lighter extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'lighter',
            'name': 'Lighter',
            'countries': [],
            'version': 'v1',
            'rateLimit': 1000, // 60 requests per minute - normal account
            'certified': false,
            'pro': false,
            'dex': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchAllGreeks': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'hostname': 'zklighter.elliot.ai',
            'urls': {
                'logo': '',
                'api': {
                    'root': 'https://mainnet.{hostname}',
                    'public': 'https://mainnet.{hostname}',
                    'private': 'https://mainnet.{hostname}',
                },
                'test': {
                    'root': 'https://testnet.{hostname}',
                    'public': 'https://testnet.{hostname}',
                    'private': 'https://testnet.{hostname}',
                },
                'www': 'https://lighter.xyz/',
                'doc': 'https://apidocs.lighter.xyz/',
                'fees': 'https://docs.lighter.xyz/perpetual-futures/fees',
                'referral': '',
            },
            'api': {
                'root': {
                    'get': {
                        // root
                        '': 1, // status
                        'info': 1,
                    },
                },
                'public': {
                    'get': {
                        // account
                        'account': 1,
                        'accountsByL1Address': 1,
                        'apikeys': 1,
                        // order
                        'exchangeStats': 1,
                        'orderBookDetails': 1,
                        'orderBookOrders': 1,
                        'orderBooks': 1,
                        'recentTrades': 1,
                        // transaction
                        'blockTxs': 1,
                        'nextNonce': 1,
                        'tx': 1,
                        'txFromL1TxHash': 1,
                        'txs': 1,
                        // announcement
                        'announcement': 1,
                        // block
                        'block': 1,
                        'blocks': 1,
                        'currentHeight': 1,
                        // candlestick
                        'candlesticks': 1,
                        'fundings': 1,
                        // bridge
                        'fastbridge/info': 1,
                        // funding
                        'funding-rates': 1,
                        // info
                        'withdrawalDelay': 1,
                    },
                    'post': {
                        // transaction
                        'sendTx': 1,
                        'sendTxBatch': 1,
                    },
                },
                'private': {
                    'get': {
                        // account
                        'accountLimits': 1,
                        'accountMetadata': 1,
                        'pnl': 1,
                        'l1Metadata': 1,
                        'liquidations': 1,
                        'positionFunding': 1,
                        'publicPoolsMetadata': 1,
                        // order
                        'accountActiveOrders': 1,
                        'accountInactiveOrders': 1,
                        'export': 1,
                        'trades': 1,
                        // transaction
                        'accountTxs': 1,
                        'deposit/history': 1,
                        'transfer/history': 1,
                        'withdraw/history': 1,
                        // referral
                        'referral/points': 1,
                        // info
                        'transferFeeInfo': 1,
                    },
                    'post': {
                        // account
                        'changeAccountTier': 1,
                        // notification
                        'notification/ack': 1,
                    },
                },
            },
            'httpExceptions': {
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'fees': {
                'taker': 0,
                'maker': 0,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'walletAddress': false,
                'privateKey': false,
                'password': false,
                'apiKeyIndex': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = undefined;
        if (api === 'root') {
            url = this.implodeHostname (this.urls['api']['public']);
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else if (api === 'public') {
            url = this.implodeHostname (this.urls['api'][api]) + '/api/' + this.version + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else if (api === 'private') {
            url = this.implodeHostname (this.urls['api'][api]) + '/api/' + this.version + '/' + path;
            this.checkRequiredCredentials ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "code": "200",
        //         "message": "string"
        //     }
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (code !== undefined && code !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}

