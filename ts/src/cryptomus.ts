
// ---------------------------------------------------------------------------

import Exchange from './abstract/cryptomus.js';
// import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ContractUnavailable, DDoSProtection, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidAddress, InvalidNonce, InvalidOrder, NotSupported, OperationFailed, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import type { Account, Balances, Bool, Currencies, Currency, Dict, FundingRateHistory, LastPrice, LastPrices, Leverage, LeverageTier, LeverageTiers, Int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class cryptomus
 * @augments Exchange
 */
export default class cryptomus extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomus',
            'name': 'Cryptomus',
            'countries': [ '' ], // todo
            'rateLimit': 100, // todo check
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
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
            'timeframes': {},
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.cryptomus.com',
                    'private': 'https://api.cryptomus.com',
                },
                'www': 'https://cryptomus.com',
                'doc': 'https://doc.cryptomus.com/personal',
                'fees': 'https://cryptomus.com/tariffs', // todo check
                'referral': '', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'v1/exchange/market/assets': 1,
                        'v1/exchange/market/order-book/{currencyPair}': 1,
                        'v1/exchange/market/tickers': 1,
                        'v1/exchange/market/trades/{currencyPair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/user-api/balance': 1,
                        'v2/user-api/convert/direction-list': 1,
                        'v2/user-api/convert/order-list': 1,
                    },
                    'post': {
                        'v2/user-api/convert/calculate': 1,
                        'v2/user-api/convert/': 1,
                        'v2/user-api/convert/limit': 1,
                    },
                    'delete': {
                        'v2/user-api/convert/{orderUuid}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    // todo
                },
            },
            'options': {
                'networks': {
                    // todo
                },
                'networksById': {
                    // todo
                },
                'defaultNetwork': 'ERC20',
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // todo
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        const query = this.urlencode (params);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
