
//  ---------------------------------------------------------------------------

import Exchange from './abstract/hyperliquid.js';
import { ExchangeError } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
// import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
// import { ecdsa } from './base/functions/crypto.js';
// import type { Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class dydx
 * @augments Exchange
 */
export default class dydx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dydx',
            'name': 'dydx',
            'countries': [ ],
            'version': 'v4',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
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
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'dydx.exchange',
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://dydx-testnet.imperator.co',
                    'private': 'https://test-dydx.kingnodes.com',
                },
                'test': {
                    'public': 'https://dydx-testnet.imperator.co',
                    'private': 'https://test-dydx.kingnodes.com',
                },
                'www': 'https://dydx.exchange/',
                'doc': 'https://docs.dydx.exchange/',
                'fees': '',
                'referral': '',
            },
            'api': {
                'public': {
                },
                'private': {
                },
            },
            'fees': {
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'sandboxMode': false,
            },
        });
    }

    testCreateOrder () {
        // steps to testCreateOrder
        // create a simple order
        // encoding with order proto
        // sign it with private key
        console.log ('testCreateOrder');
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        const status = this.safeString (response, 'status', '');
        let message = undefined;
        if (status === 'err') {
            message = this.safeString (response, 'response');
        } else {
            const responsePayload = this.safeDict (response, 'response', {});
            const data = this.safeDict (responsePayload, 'data', {});
            const statuses = this.safeList (data, 'statuses', []);
            const firstStatus = this.safeDict (statuses, 0);
            message = this.safeString (firstStatus, 'error');
        }
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        if (nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
