//  ---------------------------------------------------------------------------

import Exchange from './abstract/interactivebrokers.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InvalidOrder, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type { Account, Balances, Dict, Endpoint, Int, List, Market, Num, NullableDict, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';
import { rsa } from './base/functions/rsa.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha1 } from '@noble/hashes/legacy.js';

//  ---------------------------------------------------------------------------

/**
 * @class interactivebrokers
 * @augments Exchange
 */
export default class interactivebrokers extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'interactivebrokers',
            'name': 'Interactive Brokers',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100, // the client portal gateway allows ~10 requests per second
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createStopOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'deposit': false,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
                '2m': '2min',
                '3m': '3min',
                '5m': '5min',
                '10m': '10min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1h',
                '2h': '2h',
                '3h': '3h',
                '4h': '4h',
                '8h': '8h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'urls': {
                'logo': '',
                'api': {
                    'webapi': 'https://api.ibkr.com/',
                    'private': 'https://api.ibkr.com/v1/api/',
                },
                'www': 'https://www.interactivebrokers.com/',
                'referral': '',
                'doc': [
                    'https://www.interactivebrokers.com/docs/web-api/introduction',
                    'https://github.com/Voyz/ibind/blob/master/docs/oauth/oauth_1a.md#enabling_oauth1a',
                    'https://ndcdyn.interactivebrokers.com/oauth/?loginType=1&action=OAUTH&clt=0&RL=1&ip2loc=US#/configuration',
                    'https://ndcdyn.interactivebrokers.com/sso/Login?action=OAUTH&RL=1&ip2loc=US',
                ],
                'fees': 'https://www.interactivebrokers.com/en/index.php?f=1590&p=crypto',
            },
            'api': {
                'webapi': {
                    'get': {
                        'v1/api/iserver/account/pnl/partitioned': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/acesws/:accountId/signatures-and-owners': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/search/:searchPattern': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/summary/balances': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/summary/margins': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/summary/market_value': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/summary/available_funds': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/mta': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/alert/:alertId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/alerts': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/currency/pairs': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/exchangerate': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/contract/:conid/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/secdef/info': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/trsrv/secdef': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/contract/:conid/info-and-rules': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/trsrv/all-conids': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/contract/:conid/algos': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/secdef/bond-filters': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/trsrv/futures': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/secdef/search': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/trsrv/stocks': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/secdef/strikes': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/trsrv/secdef/schedule': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/forecast/category/tree': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/forecast/contract/details': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/forecast/contract/rules': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/forecast/contract/schedules': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/forecast/contract/market': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/group': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/presets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/models': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/deliveryoptions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/disclaimer/:typecode': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/settings': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/unreadnumber': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/notifications': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/marketdata/unsubscribeall': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/marketdata/history': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/marketdata/snapshot': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/order/status/:orderId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/allocation': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/meta': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/ledger': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/position/:conid': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/positions/:pageId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio2/:accountId/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/positions/:conid': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/combo/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/subaccounts': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/subaccounts2': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/sso/validate': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/scanner/params': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/watchlist': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/watchlists': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/details': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/status': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/login-messages': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/login-messages': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/tasks': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/status': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/kyc': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/client-instructions/:clientInstructionId': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/instructions/:instructionId': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/instruction-sets/:instructionSetId': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/statements/available': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-documents/available': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/trade-confirmations/available': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/enumerations/complex-asset-transfer': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/enumerations/:enumerationType': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/forms': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/participating-banks': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/requests': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/forms/required-forms': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/requests/:requestId/status': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/validations/usernames/:username': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/list': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/lists/ids': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/restriction': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/ids': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/user': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/account': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/restriction-scope': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers/:requestId/download': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers/dividends': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers/active-countries': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers/years': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers/:requestId/state': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/echo/https': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'v1/api/oauth/request_token': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/oauth/access_token': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/oauth/live_session_token': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/sso-browser-sessions': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/sso-sessions': { 'cost': 1 } as Endpoint<Dict>,
                        'oauth2/api/v1/token': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/dynaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/alert/activate': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/alert': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/contract/rules': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/secdef/search': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/group': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/group/delete': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/group/single': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/allocation/presets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/fa-preset/get': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/accounts-details': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/invest-divest': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/is-full-master': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/cash-analyzer': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/rebalance/to-existing-targets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/rebalance/to-new-targets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/rebalance/to-specific-targets': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/list': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/save': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/fa-preset/save': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:modelCode/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/submit-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/invest-divest-positions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fa/model/tws-invest-divest': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/settings/:typecode': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/deliveryoptions/device': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/marketdata/unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/reply/:replyId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/notification': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/order/:orderId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/orders/whatif': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/questions/suppress/reset': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/questions/suppress': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/portfolio/:accountId/positions/invalidate': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/pa/performance': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/pa/allperiods': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/pa/allocation': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/pa/transactions': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/scanner/run': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/tickle': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/auth/status': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/auth/ssodh/init': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/watchlist': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/tasks': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/documents': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/instructions/cancel': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/bank-instructions:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/instructions/cancel:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/external-asset-transfers:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v2/external-asset-transfers:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/external-cash-transfers:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/internal-asset-transfers:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/internal-cash-transfers:bulk': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/instructions/query': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/bank-instructions': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/external-cash-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/internal-cash-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/external-asset-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v2/external-asset-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/internal-asset-transfers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/bank-instructions/query': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/external-cash-transfers/query': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-documents': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/trade-confirmations': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/statements': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/restrictions/verify': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/balances/query': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/tax-vouchers': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/echo/signed-jwt': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'put': {
                        'v1/api/iserver/account/allocation/group': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/disclaimer/:typecode': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/notifications/:notificationId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/deliveryoptions/email': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'v1/api/iserver/account/:accountId/alert/:alertId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/fyi/deliveryoptions/:deviceId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/account/:accountId/order/:orderId': { 'cost': 1 } as Endpoint<Dict>,
                        'v1/api/iserver/watchlist': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'patch': {
                        'gw/api/v1/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/status': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/accounts/:accountId/tasks': { 'cost': 1 } as Endpoint<Dict>,
                        'gw/api/v1/requests/:requestId/status': { 'cost': 1 } as Endpoint<Dict>,
                    }
                },
                'private': {
                    'get': {
                        'oauth/request_token': { 'cost': 1 } as Endpoint<Dict>,
                        // informational
                        'trsrv/secdef/schedule': { 'cost': 1 } as Endpoint<List>, // trading schedule up to a month for the requested contract
                        'trsrv/futures': { 'cost': 1 } as Endpoint<Dict>, // non-expired future contracts (conid) for given symbol(s)
                        'trsrv/stocks': { 'cost': 1 } as Endpoint<Dict>, // stock contracts (conid) for given symbol(s)
                        'trsrv/all-conids': { 'cost': 1 } as Endpoint<List>, // all tradable contracts on an exchange
                        'trsrv/secdef': { 'cost': 1 } as Endpoint<Dict>, // contract definitions for given conids
                        'iserver/currency/pairs': { 'cost': 1 } as Endpoint<Dict>, // fx pairs for a currency
                        'iserver/exchangerate': { 'cost': 1 } as Endpoint<Dict>,
                        // iserver
                        'iserver/account/trades': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/{accountId}/alerts': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/alert/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/mta': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/order/status/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/pnl/partitioned': { 'cost': 1 } as Endpoint<Dict>,
                        // must be called before modifying an order or querying open orders
                        // 'iserver' endpoints do not work on free-trial accounts
                        'iserver/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/snapshot': { 'cost': 1 } as Endpoint<List>, // requires conids
                        'iserver/marketdata/{conid}/unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/unsubscribeall': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/history': { 'cost': 1 } as Endpoint<Dict>, // requires conid
                        'iserver/contract/{conid}/info': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/strikes': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/info': { 'cost': 1 } as Endpoint<List>,
                        'iserver/contract/{conid}/algos': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/contract/{conid}/info-and-rules': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/scanner/params': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        // in non-tiered account structures, portfolio/accounts must be called prior to other /portfolio endpoints
                        'portfolio/accounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/subaccounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/meta': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/allocation': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/positions/{pageId}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/position/{conid}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/ledger': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/positions/{conid}': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio2/{accountId}/positions': { 'cost': 1 } as Endpoint<List>, // real-time, uncached positions
                        'iserver/account/{accountId}/summary/available_funds': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/unreadnumber': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/settings': { 'cost': 1 } as Endpoint<List>,
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications': { 'cost': 1 } as Endpoint<List>,
                        'fyi/notifications/more': { 'cost': 1 } as Endpoint<List>,
                        // others
                        'ibcust/entity/info': { 'cost': 1 } as Endpoint<Dict>,
                        'portal/sso/validate': { 'cost': 1 } as Endpoint<Dict>, // extends active session
                        'sso/Dispatcher': { 'cost': 1 } as Endpoint<Dict>, // undocumented: validates the login
                    },
                    'post': {
                        'oauth/access_token': { 'cost': 1 } as Endpoint<Dict>,
                        'oauth/live_session_token': { 'cost': 1 } as Endpoint<Dict>,
                        // iserver
                        'iserver/auth/ssodh/init': { 'cost': 1 } as Endpoint<Dict>, // opens the brokerage session
                        'iserver/auth/status': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/reauthenticate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account': { 'cost': 1 } as Endpoint<Dict>, // switch account
                        'iserver/account/{accountId}/alert': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/activate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/orders': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/orders/{faGroup}': { 'cost': 1 } as Endpoint<List>, // financial advisor orders
                        'iserver/reply/{replyid}': { 'cost': 1 } as Endpoint<List>, // order reply confirmation
                        'iserver/account/{accountId}/orders/whatif': { 'cost': 1 } as Endpoint<Dict>, // order preview with commission info
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<List>, // modify order
                        'iserver/secdef/search': { 'cost': 1 } as Endpoint<List>, // search by symbol or company name
                        'iserver/contract/rules': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/questions/suppress': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/scanner/run': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        'portfolio/allocation': { 'cost': 1 } as Endpoint<Dict>, // consolidated view of all accounts returned by /portfolio/accounts
                        'portfolio/{accountId}/positions/invalidate': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/settings/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/device': { 'cost': 1 } as Endpoint<Dict>,
                        // others
                        'pa/performance': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/transactions': { 'cost': 1 } as Endpoint<Dict>,
                        'ws': { 'cost': 1 } as Endpoint<Dict>,
                        'tickle': { 'cost': 1 } as Endpoint<Dict>, // validates the session
                        'logout': { 'cost': 1 } as Endpoint<Dict>,
                        'trsrv/secdef': { 'cost': 1 } as Endpoint<Dict>, // requires conids
                    },
                    'put': {
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/email': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications/{notificationId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'fyi/deliveryoptions/{deviceId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/{alertId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<Dict>, // cancel order
                    },
                },
                'gwPrivate': {
                    'get': {
                        'accounts/{accountId}/details': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'accounts/{accountId}/tasks': { 'cost': 1 } as Endpoint<Dict>,
                        'accounts': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                // oauth 1.0a credentials
                'apiKey': true, // access token
                'secret': true, // encrypted access token secret
                'uid': true, // consumer key
            },
            'options': {
                'accountId': undefined, // default account used by private methods, filled by fetchAccounts
                'accounts': [],
                'fetchPortfolioAccounts': {
                    'method': 'privateGetPortfolioAccounts', // or 'privateGetPortfolioSubaccounts'
                },
                // oauth 1.0a
                'realm': 'limited_poa',
                'signaturePemPath': undefined, // private signature key, signs the live session token request
                'encryptionPemPath': undefined, // private encryption key, decrypts the access token secret
                'dhParamPemPath': undefined, // diffie-hellman parameters
                'dhGen': this.convertToBigInt ('2'), // diffie-hellman generator
                'liveSessionToken': undefined, // filled by signIn ()
                'liveSessionTokenExpiration': undefined, // filled by signIn ()
                'accessTokenSecretHex': undefined, // decrypted access token secret, filled by signIn ()
                'liveSessionTokenRefreshMargin': 60000, // re-sign in when the token expires within this many ms
                'signInInitRequest': {
                    'publish': true,
                    'compete': true,
                },
                'serviceAccountsLoaded': false, // iserver/accounts must be called once per session before trading endpoints
                'fetchMarkets': {
                    'stockExchanges': [ 'NASDAQ', 'NYSE' ], // loaded via trsrv/all-conids
                    'stockQuote': 'USD',
                    'stockPriceIncrement': '0.01',
                    'stockAmountIncrement': '1',
                    'cryptoSymbols': [ 'BTC', 'ETH', 'LTC', 'BCH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK' ], // resolved via iserver/secdef/search
                    'cryptoAmountIncrement': '0.00000001',
                    'fxCurrencies': [ 'USD' ], // fx pairs involving these currencies, via iserver/currency/pairs
                    'fxAmountIncrement': '1',
                },
                'fetchTickers': {
                    // 31 last, 55 symbol, 70 high, 71 low, 82 change, 83 change %, 84 bid, 85 ask size, 86 ask, 88 bid size,
                    // 7295 open, 7296 close, 7635 mark, 7741 prior close, 7762 volume (full precision), 6509 market data availability
                    'fields': '31,55,70,71,82,83,84,85,86,88,6509,7295,7296,7635,7741,7762',
                    'retries': 5, // the first snapshot request only subscribes, data arrives on subsequent requests
                    'retryDelay': 500,
                },
                'fetchOHLCV': {
                    'limit': 1000,
                },
                'fetchOrders': {
                    'retryDelay': 500, // the first request of a session may return an incomplete snapshot
                },
                'fetchMyTrades': {
                    'days': 7, // max 7
                },
                'createOrder': {
                    'autoConfirmOrderReplies': true, // automatically confirm order warnings via iserver/reply/{replyid}
                    'maxReplies': 10,
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 7,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 1, // current brokerage session only
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': 1, // current brokerage session only
                        'daysBackCanceled': 1,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'exceptions': {
                'exact': {
                    '401': AuthenticationError,
                    '429': RateLimitExceeded,
                },
                'broad': {
                    'Conid(s) missing': ArgumentsRequired, // {"error":"Bad Request: Conid(s) missing","statusCode":400}
                    'not authenticated': AuthenticationError,
                    'Invalid symbol': BadSymbol,
                    'Order not found': OrderNotFound,
                    'is not found': OrderNotFound, // {"error":"Order 1888681780 is not found","statusCode":503}
                    'Bad Request': BadRequest,
                },
            },
            'commonCurrencies': {},
        });
    }

    /**
     * @method
     * @name interactivebrokers#signIn
     * @description obtains a live session token via the oauth 1.0a diffie-hellman exchange and opens the brokerage session, must be called prior to using other authenticated methods (called automatically by authenticate)
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#oauth-lst
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#ssodh-init
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    override async signIn (params: Dict = {}): Promise<Dict> {
        this.checkRequiredCredentials ();
        await this.initFileSystem ();
        const encryptionKey = this.readFile (this.options['encryptionPemPath']) as string;
        const dhPrime = this.convertToBigInt ('0x' + this.readDhParam (this.options['dhParamPemPath']));
        // the access token secret is encrypted with the consumer's public encryption key
        const decrypted = this.decryptPrivateKey (encryptionKey, this.secret);
        const accessTokenSecretHex = this.binaryToBase16 (decrypted);
        this.options['accessTokenSecretHex'] = accessTokenSecretHex; // prepended to the signature base string in sign ()
        this.options['serviceAccountsLoaded'] = false; // a new brokerage session needs iserver/accounts again
        const dhRandom = this.convertToBigInt ('0x' + this.randomBytes (32));
        const dhChallenge = this.modPow (this.options['dhGen'], dhRandom, dhPrime);
        const request: Dict = {
            'diffie_hellman_challenge': this.intToBase16 (dhChallenge),
        };
        const response = await this.webapiPostV1ApiOauthLiveSessionToken (this.extend (request, params));
        //
        //     {
        //         "diffie_hellman_response": "1d9c...",
        //         "live_session_token_signature": "9a7e...",
        //         "live_session_token_expiration": 1714661586311
        //     }
        //
        const dhResponse = this.safeString (response, 'diffie_hellman_response');
        const sharedSecret = this.modPow (this.convertToBigInt ('0x' + dhResponse), dhRandom, dhPrime);
        const liveSessionToken = this.hmac (this.base16ToBinary (accessTokenSecretHex), this.bigToBytes (sharedSecret), sha1, 'base64');
        const check = this.hmac (this.encode (this.uid), this.base64ToBinary (liveSessionToken), sha1, 'hex');
        if (check !== this.safeString (response, 'live_session_token_signature')) {
            throw new AuthenticationError (this.id + ' signIn() live session token validation failed');
        }
        this.options['liveSessionToken'] = liveSessionToken;
        this.options['liveSessionTokenExpiration'] = this.safeInteger (response, 'live_session_token_expiration');
        // open the brokerage session
        const initRequest = this.safeDict (this.options, 'signInInitRequest', {});
        await this.privatePostIserverAuthSsodhInit (initRequest);
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#authenticate
     * @description signs in when there is no live session token yet or the current one is about to expire
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} the live session token
     */
    async authenticate (params: Dict = {}): Promise<Str> {
        const liveSessionToken = this.safeString (this.options, 'liveSessionToken');
        const expiration = this.safeInteger (this.options, 'liveSessionTokenExpiration');
        const refreshMargin = this.safeInteger (this.options, 'liveSessionTokenRefreshMargin', 60000);
        let expired = false;
        if (expiration !== undefined) {
            expired = (this.milliseconds () + refreshMargin) >= expiration;
        }
        if ((liveSessionToken !== undefined) && !expired) {
            return liveSessionToken;
        }
        // single-flight leader election, see https://github.com/ccxt/ccxt/issues/29393
        // concurrent private calls on a cold (or expiring) instance would each pass the staleness
        // gate above and each run their own signIn (), so the first caller leads the flight and
        // the rest wait for it. the flight is registered on a never-dialed client: client.futures
        // is the registry, client.resolve () / client.reject () settle and remove the entry
        const messageHash = 'authenticate';
        const client = this.client ('authenticationFlights');
        if (messageHash in client.futures) {
            // a flight is already in progress - wake when the leader settles it
            await client.future (messageHash);
            return this.safeString (this.options, 'liveSessionToken');
        }
        // reusableFuture (), not future (), so the trailing await below is safe in every port
        const future = client.reusableFuture (messageHash);
        try {
            await this.signIn (params);
            const token = this.safeString (this.options, 'liveSessionToken');
            // settle the flight and wake every waiter, resolve () also clears the registry entry
            client.resolve (token, messageHash);
        } catch (e) {
            // reject the flight - waiters throw and the next caller re-leads instead of deadlocking
            client.reject (e, messageHash);
        }
        // rethrows the leader's own failure and attaches the handler a lone leader needs
        await future;
        return this.safeString (this.options, 'liveSessionToken');
    }

    /**
     * @method
     * @name interactivebrokers#loadAccountId
     * @description returns the account id from params, options, or the first account returned by fetchAccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id to use
     * @returns {Array} the account id and the params without accountId
     */
    async loadAccountId (params: Dict = {}): Promise<any[]> {
        const [ accountIdFromParams, query ] = this.handleOptionAndParams (params, 'loadAccountId', 'accountId');
        let accountId: Str = accountIdFromParams;
        if (accountId === undefined) {
            await this.fetchAccounts ();
            accountId = this.safeString (this.options, 'accountId');
        }
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' requires an accountId in params["accountId"] or options["accountId"], fetchAccounts() returned no accounts');
        }
        return [ accountId, query ];
    }

    /**
     * @method
     * @name interactivebrokers#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"] or the selected account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.authenticate ();
        const [ accountId, query ] = await this.loadAccountId (params);
        const request: Dict = {
            'accountId': accountId,
        };
        const response = await this.privateGetPortfolioAccountIdLedger (this.extend (request, query));
        //
        //     {
        //         "USD": {
        //             "commoditymarketvalue": 0.0,
        //             "futuremarketvalue": 0.0,
        //             "settledcash": 214716688.0,
        //             "exchangerate": 1,
        //             "sessionid": 1,
        //             "cashbalance": 214716688.0,
        //             "corporatebondsmarketvalue": 0.0,
        //             "netliquidationvalue": 215335840.0,
        //             "interest": 305569.94,
        //             "unrealizedpnl": 39695.82,
        //             "stockmarketvalue": 314123.88,
        //             "currency": "USD",
        //             "realizedpnl": 0.0,
        //             "acctcode": "U1234567",
        //             "key": "LedgerList",
        //             "timestamp": 1702582321,
        //             "secondkey": "USD",
        //             ...
        //         },
        //         "BASE": { ... }
        //     }
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            if (currencyId === 'BASE') {
                continue; // aggregated entry in the account base currency
            }
            const balance = this.safeDict (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId) as string;
            const account = this.account ();
            account['total'] = this.safeString (balance, 'cashbalance');
            result[code] = account;
        }
        const timestamp = this.safeTimestamp (this.safeDict (response, 'BASE', {}), 'timestamp');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name interactivebrokers#loadServiceAccounts
     * @description calls iserver/accounts once per brokerage session, required by IBKR before trading and market data endpoints
     * @ignore
     * @returns {undefined}
     */
    async loadServiceAccounts (): Promise<any> {
        await this.authenticate ();
        if (!this.safeBool (this.options, 'serviceAccountsLoaded', false)) {
            await this.fetchServiceAccounts ();
            this.options['serviceAccountsLoaded'] = true;
        }
        return undefined;
    }

    /**
     * @method
     * @name interactivebrokers#fetchMarkets
     * @description retrieves data on the configured markets: stocks of options.fetchMarkets.stockExchanges, crypto of options.fetchMarkets.cryptoSymbols and fx pairs of options.fetchMarkets.fxCurrencies, the market id is the IBKR conid
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-all-conids-by-exchange
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/search-contract-by-symbol
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-currency-pairs
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-security-definition-by-conid
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        await this.loadServiceAccounts ();
        const options = this.safeDict (this.options, 'fetchMarkets', {});
        const stockExchanges = this.safeList (options, 'stockExchanges', []);
        const cryptoSymbols = this.safeList (options, 'cryptoSymbols', []);
        const fxCurrencies = this.safeList (options, 'fxCurrencies', []);
        const stockQuote = this.safeString (options, 'stockQuote', 'USD');
        const stockPriceIncrement = this.safeString (options, 'stockPriceIncrement', '0.01');
        const stockAmountIncrement = this.safeString (options, 'stockAmountIncrement', '1');
        const cryptoAmountIncrement = this.safeString (options, 'cryptoAmountIncrement', '0.00000001');
        const fxAmountIncrement = this.safeString (options, 'fxAmountIncrement', '1');
        const entries: Dict[] = [];
        const seenStocks: Dict = {}; // the same conid is returned by several exchanges, e.g. NYSE also lists NASDAQ stocks
        for (let i = 0; i < stockExchanges.length; i++) {
            const stockRequest: Dict = {
                'exchange': stockExchanges[i],
                'assetClass': 'STK',
            };
            const stocks = await this.privateGetTrsrvAllConids (this.extend (stockRequest, params));
            //
            //     [ { "ticker": "AAPL", "conid": 265598, "exchange": "NMS" } ]
            //
            for (let j = 0; j < stocks.length; j++) {
                const stock = stocks[j];
                const stockConid = this.safeString (stock, 'conid');
                if ((stockConid === undefined) || (stockConid in seenStocks)) {
                    continue;
                }
                seenStocks[stockConid] = true;
                entries.push ({
                    'id': stockConid,
                    'baseId': this.safeString (stock, 'ticker'),
                    'quoteId': stockQuote,
                    'assetClass': 'STK',
                    'exchange': this.safeString (stock, 'exchange'),
                    'priceIncrement': stockPriceIncrement,
                    'amountIncrement': stockAmountIncrement,
                    'info': stock,
                });
            }
        }
        // crypto and fx contracts get their tick size from trsrv/secdef
        const detailIds: string[] = [];
        const details: Dict = {};
        for (let i = 0; i < cryptoSymbols.length; i++) {
            const cryptoSymbol = cryptoSymbols[i];
            const searchRequest: Dict = {
                'symbol': cryptoSymbol,
                'secType': 'CRYPTO',
            };
            const results = await this.privatePostIserverSecdefSearch (searchRequest);
            //
            //     [
            //         {
            //             "conid": "479624278",
            //             "companyName": "Bitcoin cryptocurrency",
            //             "symbol": "BTC",
            //             "sections": [ { "secType": "CRYPTO", "exchange": "PAXOS;" } ]
            //         },
            //         ...
            //     ]
            //
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const sections = this.safeList (result, 'sections', []);
                let isCrypto = false;
                for (let k = 0; k < sections.length; k++) {
                    if (this.safeString (sections[k], 'secType') === 'CRYPTO') {
                        isCrypto = true;
                    }
                }
                const conid = this.safeString (result, 'conid');
                if (isCrypto && (this.safeString (result, 'symbol') === cryptoSymbol) && (conid !== undefined)) {
                    detailIds.push (conid);
                    details[conid] = {
                        'id': conid,
                        'baseId': cryptoSymbol,
                        'quoteId': undefined,
                        'assetClass': 'CRYPTO',
                        'exchange': undefined,
                        'priceIncrement': undefined,
                        'amountIncrement': cryptoAmountIncrement,
                        'info': result,
                    };
                    break;
                }
            }
        }
        for (let i = 0; i < fxCurrencies.length; i++) {
            const fxCurrency = fxCurrencies[i];
            const pairsRequest: Dict = {
                'currency': fxCurrency,
            };
            const pairsResponse = await this.privateGetIserverCurrencyPairs (pairsRequest);
            //
            //     { "USD": [ { "symbol": "EUR.USD", "conid": 12087792, "ccyPair": "EUR" }, ... ] }
            //
            const pairs = this.safeList (pairsResponse, fxCurrency, []);
            for (let j = 0; j < pairs.length; j++) {
                const pair = pairs[j];
                const conid = this.safeString (pair, 'conid');
                const pairSymbol = this.safeString (pair, 'symbol');
                if ((conid === undefined) || (pairSymbol === undefined) || (conid in details)) {
                    continue;
                }
                const parts = pairSymbol.split ('.');
                detailIds.push (conid);
                details[conid] = {
                    'id': conid,
                    'baseId': this.safeString (parts, 0),
                    'quoteId': this.safeString (parts, 1),
                    'assetClass': 'CASH',
                    'exchange': undefined,
                    'priceIncrement': undefined,
                    'amountIncrement': fxAmountIncrement,
                    'info': pair,
                };
            }
        }
        const numDetails = detailIds.length;
        if (numDetails > 0) {
            const secdefRequest: Dict = {
                'conids': detailIds.join (','),
            };
            const secdefResponse = await this.privateGetTrsrvSecdef (secdefRequest);
            //
            //     {
            //         "secdef": [
            //             {
            //                 "conid": 479624278,
            //                 "currency": "USD",
            //                 "incrementRules": [ { "lowerEdge": 0, "increment": 0.25 } ],
            //                 "listingExchange": "PAXOS",
            //                 "assetClass": "CRYPTO",
            //                 "ticker": "BTC",
            //                 ...
            //             }
            //         ]
            //     }
            //
            const secdefs = this.safeList (secdefResponse, 'secdef', []);
            for (let i = 0; i < secdefs.length; i++) {
                const secdef = secdefs[i];
                const conid = this.safeString (secdef, 'conid', '');
                const entry = this.safeDict (details, conid);
                if (entry === undefined) {
                    continue;
                }
                const incrementRules = this.safeList (secdef, 'incrementRules', []);
                const firstRule = this.safeDict (incrementRules, 0, {});
                entry['priceIncrement'] = this.safeString (firstRule, 'increment');
                entry['exchange'] = this.safeString (secdef, 'listingExchange');
                if (entry['quoteId'] === undefined) {
                    entry['quoteId'] = this.safeString (secdef, 'currency');
                }
                entry['info'] = this.extend (entry['info'], secdef);
                details[conid] = entry;
            }
        }
        for (let i = 0; i < detailIds.length; i++) {
            entries.push (details[detailIds[i]]);
        }
        return this.parseMarkets (entries);
    }

    override parseMarket (market: Dict): Market {
        //
        // normalized by fetchMarkets
        //
        //     {
        //         "id": "479624278",
        //         "baseId": "BTC",
        //         "quoteId": "USD",
        //         "assetClass": "CRYPTO",
        //         "exchange": "PAXOS",
        //         "priceIncrement": "0.25",
        //         "amountIncrement": "0.00000001",
        //         "info": { ... }
        //     }
        //
        const assetClass = this.safeString (market, 'assetClass');
        const baseId = this.safeString (market, 'baseId', '');
        const quoteId = this.safeString (market, 'quoteId', 'USD');
        let base: Str = undefined;
        if (assetClass === 'STK') {
            // stock tickers are not currencies, skip commonCurrencies remapping, 'BRK B' -> 'BRK.B'
            base = baseId.split (' ').join ('.');
        } else {
            base = this.safeCurrencyCode (baseId);
        }
        const quote = this.safeCurrencyCode (quoteId);
        const amountIncrement = this.safeString (market, 'amountIncrement');
        return this.safeMarketStructure ({
            'id': this.safeString (market, 'id'),
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountIncrement),
                'price': this.parseNumber (this.safeString (market, 'priceIncrement')),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.parseNumber (amountIncrement),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': this.safeDict (market, 'info'),
        });
    }

    /**
     * @method
     * @name interactivebrokers#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-market-data-snapshot
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        return this.safeDict (tickers, market['symbol']) as Ticker;
    }

    /**
     * @method
     * @name interactivebrokers#fetchTickers
     * @description fetches price tickers for multiple markets, the first snapshot request only subscribes to the market data, so the request is retried until data arrives
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-market-data-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.fields] comma-separated snapshot field ids, max 50
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires a symbols argument');
        }
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const symbolsNormalized = this.marketSymbols (symbols);
        const conids: string[] = [];
        for (let i = 0; i < symbolsNormalized.length; i++) {
            const market = this.market (symbolsNormalized[i]);
            conids.push (this.safeString (market, 'id', ''));
        }
        const options = this.safeDict (this.options, 'fetchTickers', {});
        const [ fields, query ] = this.handleOptionAndParams (params, 'fetchTickers', 'fields', '31,55,70,71,82,83,84,85,86,88,6509,7295,7296,7635,7741,7762');
        const retries = this.safeInteger (options, 'retries', 5);
        const retryDelay = this.safeInteger (options, 'retryDelay', 500);
        const request: Dict = {
            'conids': conids.join (','),
            'fields': fields,
        };
        let response: List = [];
        for (let i = 0; i <= retries; i++) {
            response = await this.privateGetIserverMarketdataSnapshot (this.extend (request, query));
            if (this.ibkrSnapshotReady (response)) {
                break;
            }
            if (i < retries) {
                await this.sleep (retryDelay);
            }
        }
        //
        //     [
        //         {
        //             "31": "82838.50",
        //             "70": "85639.25",
        //             "71": "82209.75",
        //             "84": "82836.00",
        //             "85": "0.00018171",
        //             "86": "82843.75",
        //             "88": "0.27167244",
        //             "6509": "R",
        //             "7762": "78",
        //             "conidEx": "479624278",
        //             "_updated": 1791449398940,
        //             "conid": 479624278
        //         }
        //     ]
        //
        return this.parseTickers (response, symbolsNormalized);
    }

    ibkrSnapshotReady (response: List): boolean {
        const numItems = response.length;
        if (numItems === 0) {
            return false;
        }
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const last = this.safeString (item, '31');
            const bid = this.safeString (item, '84');
            const ask = this.safeString (item, '86');
            if ((last === undefined) && (bid === undefined) && (ask === undefined)) {
                return false;
            }
        }
        return true;
    }

    ibkrParseValue (value: Str): Str {
        // snapshot values are formatted strings: "C82838.50" (prior close), "H1.2" (halted), "+1.04", "1.5%", "1M", "1,234"
        if ((value === undefined) || (value === '') || (value === 'N/A')) {
            return undefined;
        }
        let result = value.split (',').join ('');
        if (result.startsWith ('C') || result.startsWith ('H') || result.startsWith ('+')) {
            result = result.slice (1);
        }
        if (result.endsWith ('%')) {
            result = result.slice (0, result.length - 1);
        }
        let multiplier: Str = undefined;
        if (result.endsWith ('K')) {
            multiplier = '1000';
        } else if (result.endsWith ('M')) {
            multiplier = '1000000';
        } else if (result.endsWith ('B')) {
            multiplier = '1000000000';
        }
        if (multiplier !== undefined) {
            const scaled = Precise.stringMul (result.slice (0, result.length - 1), multiplier);
            if (scaled === undefined) {
                return undefined;
            }
            result = scaled;
        }
        if (result === '') {
            return undefined;
        }
        return result;
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'conid');
        const resolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, '_updated');
        const last = this.ibkrParseValue (this.safeString (ticker, '31'));
        return this.safeTicker ({
            'symbol': resolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.ibkrParseValue (this.safeString (ticker, '70')),
            'low': this.ibkrParseValue (this.safeString (ticker, '71')),
            'bid': this.ibkrParseValue (this.safeString (ticker, '84')),
            'bidVolume': this.ibkrParseValue (this.safeString (ticker, '88')),
            'ask': this.ibkrParseValue (this.safeString (ticker, '86')),
            'askVolume': this.ibkrParseValue (this.safeString (ticker, '85')),
            'vwap': undefined,
            'open': this.ibkrParseValue (this.safeString (ticker, '7295')),
            'close': last,
            'last': last,
            'previousClose': this.ibkrParseValue (this.safeString (ticker, '7741')),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.ibkrParseValue (this.safeString (ticker, '7762')),
            'quoteVolume': undefined,
            'markPrice': this.ibkrParseValue (this.safeString (ticker, '7635')),
            'indexPrice': undefined,
            'info': ticker,
        }, resolved);
    }

    /**
     * @method
     * @name interactivebrokers#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-historical-market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.outsideRth] include data outside regular trading hours
     * @param {string} [params.source] 'Last', 'Bid_Ask' or 'Midpoint'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.market (symbol);
        const maxLimit = this.safeInteger (this.safeDict (this.options, 'fetchOHLCV', {}), 'limit', 1000);
        const requestLimit = (limit === undefined) ? maxLimit : Math.min (limit, maxLimit);
        const request: Dict = {
            'conid': market['id'],
            'bar': this.safeString (this.timeframes, timeframe, timeframe),
            'period': this.ibkrPeriod (this.parseTimeframe (timeframe), requestLimit),
        };
        if (since !== undefined) {
            request['startTime'] = this.ibkrFormatTime (since);
            request['direction'] = '1'; // forward from startTime, by default startTime is the end of the range
        }
        const response = await this.privateGetIserverMarketdataHistory (this.extend (request, params));
        //
        //     {
        //         "points": 99,
        //         "startTime": "20261007-18:20:00",
        //         "data": [
        //             { "o": 336.94, "c": 336.89, "h": 336.97, "l": 336.85, "v": 1164.625, "t": 1791397200000 }
        //         ],
        //         ...
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    ibkrPeriod (duration: int, limit: int): string {
        // duration of one bar in seconds, the period is expressed in the largest fitting unit
        const total = duration * limit;
        if (duration < 3600) {
            return this.numberToString (this.parseToInt (total / 60)) + 'min';
        } else if (duration < 86400) {
            return this.numberToString (this.parseToInt (total / 3600)) + 'h';
        } else if (duration < 604800) {
            return this.numberToString (this.parseToInt (total / 86400)) + 'd';
        } else if (duration < 2592000) {
            return this.numberToString (this.parseToInt (total / 604800)) + 'w';
        }
        return this.numberToString (this.parseToInt (total / 2592000)) + 'm';
    }

    ibkrFormatTime (timestamp: int): string {
        // YYYYMMDD-hh:mm:ss in UTC
        const iso = this.iso8601 (timestamp) as string;
        return this.yyyymmdd (timestamp, '') + '-' + iso.slice (11, 19);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /**
     * @method
     * @name interactivebrokers#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        // as required by IBKR, iserver/accounts must be called at least once before any other trading endpoint
        const portfolioAccounts = await this.fetchPortfolioAccounts (params);
        const accountIds = Object.keys (this.indexBy (portfolioAccounts, 'accountId'));
        const length = accountIds.length;
        if (length === 0) {
            throw new ExchangeError ('No tradingaccount IDs found for the user');
        }
        if (this.safeString (this.options, 'accountId') === undefined) {
            if (length === 1) {
                this.options['accountId'] = accountIds[0];
            } else {
                throw new ExchangeError ('Multiple account IDs found, please set .options["accountId"] to desired one from: ' + accountIds.join (', '));
            }
        }
        const accounts: Account[] = [];
        for (let i = 0; i < portfolioAccounts.length; i++) {
            accounts.push (this.parseAccount (portfolioAccounts[i]));
        }
        return accounts;
    }

    override parseAccount (account: Dict): Account {
        //
        //     {
        //         "id": "U3449298",
        //         "accountId": "U3449298",
        //         "accountVan": "U3449298",
        //         "accountTitle": "John Doe",
        //         "displayName": "John Doe",
        //         "accountAlias": null,
        //         "accountStatus": "1646607600000",
        //         "currency": "USD",
        //         "type": "INDIVIDUAL",
        //         "tradingType": "STKNOPT",
        //         ...
        //     }
        //
        const currencyId = this.safeString (account, 'currency');
        return {
            'id': this.safeString2 (account, 'accountId', 'id'),
            'type': this.safeStringLower (account, 'type'),
            'code': this.safeCurrencyCode (currencyId),
            'info': account,
            'name': this.safeString (account, 'accountTitle'),
        };
    }

    /**
     * @method
     * @name interactivebrokers#fetchServiceAccounts
     * @description fetch the accounts the user has trading access to, must be called before modifying an order or querying open orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#accounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async fetchServiceAccounts (params: Dict = {}): Promise<Dict> {
        await this.authenticate ();
        const response = await this.privateGetIserverAccounts (params);
        //
        //    {
        //        "accounts": [
        //            "U3448645"
        //        ],
        //        "acctProps": {
        //            "U3448645": {
        //                "hasChildAccounts": false,
        //                "supportsCashQty": true,
        //                "liteUnderPro": false,
        //                "noFXConv": false,
        //                "isProp": false,
        //                "supportsFractions": true,
        //                "allowCustomerTime": false,
        //                "autoFx": false
        //            }
        //        },
        //        "aliases": {
        //            "U3448645": "U3448645"
        //        },
        //        "allowFeatures": {
        //            "showGFIS": true,
        //            "showEUCostReport": false,
        //            "allowEventContract": true,
        //            "allowFXConv": true,
        //            "allowFinancialLens": false,
        //            "allowMTA": true,
        //            "allowTypeAhead": true,
        //            "allowEventTrading": true,
        //            "snapshotRefreshTimeout": 30,
        //            "liteUser": false,
        //            "showWebNews": true,
        //            "research": true,
        //            "debugPnl": true,
        //            "showTaxOpt": true,
        //            "showImpactDashboard": true,
        //            "allowDynAccount": false,
        //            "allowCrypto": false,
        //            "allowFA": false,
        //            "allowLiteUnderPro": false,
        //            "allowedAssetTypes": "STK,CFD,OPT,FOP,WAR,FUT,BAG,PDC,CASH,IND,BOND,BILL,FUND,SLB,News,CMDTY,IOPT,ICU,ICS,PHYSS,CRYPTO",
        //            "restrictTradeSubscription": false,
        //            "showUkUserLabels": true,
        //            "sideBySide": true
        //        },
        //        "chartPeriods": {
        //            "STK": [ "*" ],
        //            "CFD": [ "*" ],
        //            "OPT": [ "2h", "1d", "2d", "1w", "1m" ],
        //            "FOP": [ "2h", "1d", "2d", "1w", "1m" ],
        //            "WAR": [ "*" ],
        //            "IOPT": [ "*" ],
        //            "FUT": [ "*" ],
        //            "CASH": [ "*" ],
        //            "IND": [ "*" ],
        //            "BOND": [ "*" ],
        //            "FUND": [ "*" ],
        //            "CMDTY": [ "*" ],
        //            "PHYSS": [ "*" ],
        //            "CRYPTO": [ "*" ]
        //        },
        //        "groups": [],
        //        "profiles": [],
        //        "selectedAccount": "U3448645",
        //        "serverInfo": {
        //            "serverName": "JifZ26071",
        //            "serverVersion": "Build 10.50.1a, Sep 23, 2026 1:23:38 PM"
        //        },
        //        "sessionId": "6ac5c713.0000037a",
        //        "isFT": false,
        //        "isPaper": false
        //    }
        //
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#fetchPortfolioAccounts
     * @description fetch the accounts for which the user can view position and account information
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-accounts
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-subaccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} the raw response from the exchange
     */
    async fetchPortfolioAccounts (params: Dict = {}): Promise<Dict[]> {
        await this.authenticate ();
        const [ method, query ] = this.handleOptionAndParams (params, 'fetchPortfolioAccounts', 'method', 'privateGetPortfolioAccounts');
        let response = undefined;
        if (method === 'privateGetPortfolioSubaccounts') {
            response = await this.privateGetPortfolioSubaccounts (query);
        } else {
            response = await this.privateGetPortfolioAccounts (query);
            //
            //    [
            //        {
            //            "id": "U3448645",
            //            "PrepaidCrypto-Z": false,
            //            "PrepaidCrypto-P": true,
            //            "brokerageAccess": true,
            //            "accountId": "U3448645",
            //            "accountVan": "U3448645",
            //            "accountTitle": "Toma Todua",
            //            "displayName": "Toma Todua",
            //            "accountAlias": null,
            //            "accountStatus": 1646607600000,
            //            "currency": "USD",
            //            "type": "INDIVIDUAL",
            //            "tradingType": "STKNOPT",
            //            "businessType": "INDEPENDENT",
            //            "category": "",
            //            "ibEntity": "IBLLC-US",
            //            "faclient": false,
            //            "clearingStatus": "O",
            //            "covestor": false,
            //            "noClientTrading": false,
            //            "trackVirtualFXPortfolio": true,
            //            "acctCustType": "INDIVIDUAL",
            //            "parent": {
            //                "mmc": [],
            //                "accountId": "",
            //                "isMParent": false,
            //                "isMChild": false,
            //                "isMultiplex": false
            //            },
            //            "desc": "U3448645"
            //        }
            //    ]
            //
        }
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#switchToAccount
     * @description switch the active account (for users with multiple accounts)
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#switch-account
     * @ignore
     * @param {string} accountId the account id to switch to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async switchToAccount (accountId: string, params: Dict = {}): Promise<Dict> {
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' switchToAccount() requires an accountId argument');
        }
        const request: Dict = {
            'acctId': accountId,
        };
        await this.authenticate ();
        const response = await this.privatePostIserverAccount (this.extend (request, params));
        //
        //     {
        //         "set": true,
        //         "acctId": "U3449298"
        //     }
        //
        // if the account is already selected, the gateway responds with http 501 instead
        //
        this.options['accountId'] = accountId;
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#createOrder
     * @description create a trade order, order reply prompts are confirmed automatically when options.createOrder.autoConfirmOrderReplies is true
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/submit-new-order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/respond-to-server-prompt
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the stop price, creates a STP (market) or STP LMT (limit) order
     * @param {float} [params.trailingAmount] the trailing offset in quote currency, creates a TRAIL or TRAILLMT order
     * @param {float} [params.trailingPercent] the trailing offset in percent, creates a TRAIL or TRAILLMT order
     * @param {string} [params.timeInForce] 'DAY', 'IOC', 'GTC', 'OPG' or 'PAX'
     * @param {string} [params.clientOrderId] a unique id for the order, sent as cOID
     * @param {boolean} [params.outsideRTH] allow the order to execute outside regular trading hours
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.market (symbol);
        const [ accountId, query ] = await this.loadAccountId (params);
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, query);
        orderRequest['acctId'] = accountId;
        const request: Dict = {
            'accountId': accountId,
            'orders': [ orderRequest ],
        };
        const response = await this.privatePostIserverAccountAccountIdOrders (request);
        const result = await this.ibkrHandleOrderReplies (response, 'createOrder');
        //
        //     [ { "order_id": "1370093239", "order_status": "PreSubmitted", "encrypt_message": "1" } ]
        //
        const order = this.parseOrder (result, market);
        order['type'] = type;
        order['side'] = side;
        order['amount'] = amount;
        order['price'] = price;
        return order;
    }

    /**
     * @method
     * @name interactivebrokers#createOrderRequest
     * @description builds a single order ticket for createOrder and editOrder
     * @ignore
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the order ticket
     */
    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Dict {
        const market = this.market (symbol);
        const isMarket = (type === 'market');
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const trailingAmount = this.safeString (params, 'trailingAmount');
        const trailingPercent = this.safeString (params, 'trailingPercent');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'cOID');
        const assetClass = this.safeString (market['info'], 'assetClass');
        const request: Dict = {
            'conid': this.parseToInt (market['id']),
            'side': side.toUpperCase (),
            'quantity': this.parseNumber (this.amountToPrecision (symbol, amount)),
        };
        let orderType: Str = undefined;
        if ((trailingAmount !== undefined) || (trailingPercent !== undefined)) {
            orderType = isMarket ? 'TRAIL' : 'TRAILLMT';
            if (trailingPercent !== undefined) {
                request['trailingType'] = '%';
                request['trailingAmt'] = this.parseNumber (trailingPercent);
            } else {
                request['trailingType'] = 'amt';
                request['trailingAmt'] = this.parseNumber (this.priceToPrecision (symbol, trailingAmount));
            }
            if (triggerPrice !== undefined) {
                request['auxPrice'] = this.parseNumber (this.priceToPrecision (symbol, triggerPrice));
            }
            if (!isMarket) {
                request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
            }
        } else if (triggerPrice !== undefined) {
            if (isMarket) {
                orderType = 'STP';
                request['price'] = this.parseNumber (this.priceToPrecision (symbol, triggerPrice));
            } else {
                orderType = 'STP LMT';
                request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
                request['auxPrice'] = this.parseNumber (this.priceToPrecision (symbol, triggerPrice));
            }
        } else if (isMarket) {
            orderType = 'MKT';
        } else {
            orderType = 'LMT';
            request['price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        request['orderType'] = orderType;
        let defaultTimeInForce = 'DAY';
        if (assetClass === 'CRYPTO') {
            defaultTimeInForce = isMarket ? 'IOC' : 'PAX';
        }
        const timeInForce = this.safeStringUpper2 (params, 'timeInForce', 'tif', defaultTimeInForce);
        request['tif'] = timeInForce;
        if (clientOrderId !== undefined) {
            request['cOID'] = clientOrderId;
        }
        const query = this.omit (params, [ 'triggerPrice', 'stopPrice', 'trailingAmount', 'trailingPercent', 'clientOrderId', 'cOID', 'timeInForce', 'tif' ]);
        return this.extend (request, query);
    }

    /**
     * @method
     * @name interactivebrokers#ibkrHandleOrderReplies
     * @description confirms order reply prompts until the order is accepted, or throws InvalidOrder when options.createOrder.autoConfirmOrderReplies is false
     * @ignore
     * @param {object} response the order submission response
     * @param {string} methodName the calling method name
     * @returns {object} the accepted order entry
     */
    async ibkrHandleOrderReplies (response: any, methodName: string): Promise<Dict> {
        const options = this.safeDict (this.options, 'createOrder', {});
        const autoConfirm = this.safeBool (options, 'autoConfirmOrderReplies', true);
        const maxReplies = this.safeInteger (options, 'maxReplies', 10);
        let current = response;
        for (let i = 0; i <= maxReplies; i++) {
            if (!Array.isArray (current)) {
                //
                // advanced order reject
                //
                //     { "orderId": 123456789, "reqId": "22170", "text": "...", "options": [ ... ], "messageId": "p12", "prompt": true }
                //
                const text = this.safeString (current, 'text');
                throw new InvalidOrder (this.id + ' ' + methodName + '() rejected: ' + text);
            }
            const first = this.safeDict (current, 0, {});
            const orderId = this.safeString2 (first, 'order_id', 'orderId');
            if (orderId !== undefined) {
                return first;
            }
            //
            // reply prompt
            //
            //     [ { "id": "99097238-...", "isSuppressed": false, "message": [ "You are submitting an order without market data..." ], "messageIds": [ "o354" ] } ]
            //
            const replyId = this.safeString (first, 'id');
            const messages = this.safeList (first, 'message', []);
            const message = messages.join (' ');
            if (replyId === undefined) {
                throw new InvalidOrder (this.id + ' ' + methodName + '() unexpected response: ' + this.json (current));
            }
            if (!autoConfirm) {
                throw new InvalidOrder (this.id + ' ' + methodName + '() requires confirmation (reply id ' + replyId + '): ' + message);
            }
            const replyRequest: Dict = {
                'replyid': replyId,
                'confirmed': true,
            };
            current = await this.privatePostIserverReplyReplyid (replyRequest);
        }
        throw new InvalidOrder (this.id + ' ' + methodName + '() exceeded options.createOrder.maxReplies order reply confirmations');
    }

    /**
     * @method
     * @name interactivebrokers#editOrder
     * @description edit a trade order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint, see createOrder
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}): Promise<Order> {
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument');
        }
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.market (symbol);
        const [ accountId, query ] = await this.loadAccountId (params);
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, query);
        orderRequest['acctId'] = accountId;
        orderRequest['accountId'] = accountId;
        orderRequest['orderId'] = id;
        const response = await this.privatePostIserverAccountAccountIdOrderOrderId (orderRequest);
        const result = await this.ibkrHandleOrderReplies (response, 'editOrder');
        const order = this.parseOrder (result, market);
        order['type'] = type;
        order['side'] = side;
        order['amount'] = amount;
        order['price'] = price;
        return order;
    }

    /**
     * @method
     * @name interactivebrokers#cancelOrder
     * @description cancels an open order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/cancel-open-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.marketOrNull (symbol);
        const [ accountId, query ] = await this.loadAccountId (params);
        const request: Dict = {
            'accountId': accountId,
            'orderId': id,
        };
        const response = await this.privateDeleteIserverAccountAccountIdOrderOrderId (this.extend (request, query));
        //
        //     { "msg": "Request was submitted", "order_id": 123456789, "conid": 265598, "account": "U1234567" }
        //
        const order = this.parseOrder (response, market);
        order['status'] = 'canceled';
        return order;
    }

    /**
     * @method
     * @name interactivebrokers#fetchOrder
     * @description fetches information on an order made by the user, only orders of the current brokerage session are available
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-order-status
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.marketOrNull (symbol);
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetIserverAccountOrderStatusOrderId (this.extend (request, params));
        //
        //     {
        //         "order_id": 1799796559,
        //         "conid": 265598,
        //         "side": "BUY",
        //         "order_status": "Filled",
        //         "order_type": "MARKET",
        //         "size": "0.0",
        //         "total_size": "5.0",
        //         "cum_fill": "5.0",
        //         "average_price": "192.26",
        //         "tif": "DAY",
        //         "order_time": "231211180049",
        //         ...
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name interactivebrokers#fetchOrders
     * @description fetches information on multiple orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-live-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] comma-separated status filters, e.g. 'submitted,filled'
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.marketOrNull (symbol);
        const retryDelay = this.safeInteger (this.safeDict (this.options, 'fetchOrders', {}), 'retryDelay', 500);
        let response = await this.privateGetIserverAccountOrders (params);
        if (!this.safeBool (response, 'snapshot', true)) {
            // the first request of a session only starts the order subscription
            await this.sleep (retryDelay);
            response = await this.privateGetIserverAccountOrders (params);
        }
        //
        //     {
        //         "orders": [
        //             {
        //                 "acct": "U1234567",
        //                 "conid": 265598,
        //                 "orderId": 1234568790,
        //                 "cashCcy": "USD",
        //                 "remainingQuantity": 5.0,
        //                 "filledQuantity": 0.0,
        //                 "totalSize": 5.0,
        //                 "status": "Submitted",
        //                 "origOrderType": "LIMIT",
        //                 "orderType": "Limit",
        //                 "side": "BUY",
        //                 "price": "185.50",
        //                 "timeInForce": "CLOSE",
        //                 "lastExecutionTime_r": 1702317649000,
        //                 ...
        //             }
        //         ],
        //         "snapshot": true
        //     }
        //
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name interactivebrokers#fetchOpenOrders
     * @description fetch all unfilled currently open orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-live-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const result: Order[] = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === 'open') {
                result.push (orders[i]);
            }
        }
        return this.filterBySinceLimit (result, since, limit) as Order[];
    }

    /**
     * @method
     * @name interactivebrokers#fetchClosedOrders
     * @description fetches information on multiple closed orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-live-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        const result: Order[] = [];
        for (let i = 0; i < orders.length; i++) {
            const status = orders[i]['status'];
            if ((status === 'closed') || (status === 'canceled') || (status === 'rejected')) {
                result.push (orders[i]);
            }
        }
        return this.filterBySinceLimit (result, since, limit) as Order[];
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'Inactive': 'rejected',
            'PendingSubmit': 'open',
            'PreSubmitted': 'open',
            'Submitted': 'open',
            'Filled': 'closed',
            'PendingCancel': 'open',
            'PreCancelled': 'canceled',
            'Cancelled': 'canceled',
            'WarnState': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (orderType: Str): Str {
        if (orderType === undefined) {
            return undefined;
        }
        const types: Dict = {
            'LMT': 'limit',
            'LIMIT': 'limit',
            'MKT': 'market',
            'MARKET': 'market',
            'STP': 'market',
            'STOP': 'market',
            'STP LMT': 'limit',
            'STOP_LIMIT': 'limit',
            'STOPLIMIT': 'limit',
            'TRAIL': 'market',
            'TRAILLMT': 'limit',
            'TRAILING_STOP': 'market',
            'TRAILING_STOP_LIMIT': 'limit',
            'MIDPRICE': 'limit',
        };
        return this.safeString (types, orderType.toUpperCase (), orderType);
    }

    parseOrderTimeInForce (timeInForce: Str): Str {
        const timeInForces: Dict = {
            'DAY': 'Day',
            'GTC': 'GTC',
            'IOC': 'IOC',
            'OPG': 'OPG',
            'PAX': 'PAX',
            'CLOSE': 'Day',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder / editOrder
        //
        //     { "order_id": "1370093239", "order_status": "PreSubmitted", "encrypt_message": "1" }
        //
        // cancelOrder
        //
        //     { "msg": "Request was submitted", "order_id": 123456789, "conid": 265598, "account": "U1234567" }
        //
        // fetchOrder
        //
        //     { "order_id": 1799796559, "conid": 265598, "side": "BUY", "order_status": "Filled", "order_type": "MARKET", "size": "0.0", "total_size": "5.0", "cum_fill": "5.0", "average_price": "192.26", "tif": "DAY", "order_time": "231211180049" }
        //
        // fetchOrders
        //
        //     { "orderId": 1234568790, "conid": 265598, "side": "BUY", "status": "Submitted", "orderType": "Limit", "price": "185.50", "avgPrice": "185.40", "filledQuantity": 0.0, "remainingQuantity": 5.0, "totalSize": 5.0, "timeInForce": "CLOSE", "lastExecutionTime_r": 1702317649000, "order_ref": "my-id" }
        //
        const marketId = this.safeString (order, 'conid');
        const resolved = this.safeMarket (marketId, market);
        const orderTime = this.safeString (order, 'order_time');
        let timestamp = this.safeInteger (order, 'lastExecutionTime_r');
        if ((timestamp === undefined) && (orderTime !== undefined)) {
            // YYMMDDhhmmss in UTC
            const datetime = '20' + orderTime.slice (0, 2) + '-' + orderTime.slice (2, 4) + '-' + orderTime.slice (4, 6) + 'T' + orderTime.slice (6, 8) + ':' + orderTime.slice (8, 10) + ':' + orderTime.slice (10, 12) + 'Z';
            timestamp = this.parse8601 (datetime);
        }
        const rawType = this.safeString2 (order, 'origOrderType', 'order_type');
        const orderType = this.safeString (order, 'orderType', rawType);
        const sideId = this.safeStringUpper (order, 'side');
        let side: Str = undefined;
        if ((sideId === 'B') || (sideId === 'BUY')) {
            side = 'buy';
        } else if ((sideId === 'S') || (sideId === 'SELL')) {
            side = 'sell';
        }
        let average = this.safeString2 (order, 'avgPrice', 'average_price');
        if (Precise.stringEq (average, '0')) {
            average = undefined;
        }
        let price = this.safeString2 (order, 'price', 'limit_price');
        if (Precise.stringEq (price, '0')) {
            price = undefined;
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'order_id', 'orderId'),
            'clientOrderId': this.safeString2 (order, 'order_ref', 'cOID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': resolved['symbol'],
            'type': this.parseOrderType (orderType),
            'timeInForce': this.parseOrderTimeInForce (this.safeString2 (order, 'timeInForce', 'tif')),
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': this.safeString (order, 'auxPrice'),
            'amount': this.safeString2 (order, 'totalSize', 'total_size'),
            'cost': undefined,
            'average': average,
            'filled': this.safeString2 (order, 'filledQuantity', 'cum_fill'),
            'remaining': this.safeString2 (order, 'remainingQuantity', 'size'),
            'status': this.parseOrderStatus (this.safeString2 (order, 'status', 'order_status')),
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, resolved);
    }

    /**
     * @method
     * @name interactivebrokers#fetchMyTrades
     * @description fetch all trades made by the user over the last days (max 7)
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.days] number of days to fetch, max 7
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        await this.loadServiceAccounts ();
        const market = this.marketOrNull (symbol);
        let days = this.safeInteger (this.safeDict (this.options, 'fetchMyTrades', {}), 'days', 7);
        if (since !== undefined) {
            days = Math.min (7, Math.max (1, this.parseToInt (Math.ceil ((this.milliseconds () - since) / 86400000))));
        }
        const request: Dict = {
            'days': days,
        };
        const response = await this.privateGetIserverAccountTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "execution_id": "0000e0d5.6576fd38.01.01",
        //             "symbol": "BTC",
        //             "side": "B",
        //             "order_description": "Bot 0.0001 @ 82000",
        //             "trade_time_r": 1702319818000,
        //             "size": 0.0001,
        //             "price": "82000",
        //             "order_ref": "my-id",
        //             "exchange": "PAXOS",
        //             "commission": "0.02",
        //             "net_amount": 8.2,
        //             "account": "U1234567",
        //             "sec_type": "CRYPTO",
        //             "conidex": "479624278",
        //             "conid": 479624278,
        //             "order_id": 1234567890
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const marketId = this.safeString (trade, 'conid');
        const resolved = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'trade_time_r');
        const sideId = this.safeString (trade, 'side');
        let side: Str = undefined;
        if ((sideId === 'B') || (sideId === 'BUY')) {
            side = 'buy';
        } else if ((sideId === 'S') || (sideId === 'SELL')) {
            side = 'sell';
        }
        const commission = this.safeString (trade, 'commission');
        let fee = undefined;
        if (commission !== undefined) {
            fee = {
                'cost': commission,
                'currency': resolved['quote'],
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'execution_id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': resolved['symbol'],
            'order': this.safeString (trade, 'order_id'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'size'),
            'cost': undefined,
            'fee': fee,
        }, resolved);
    }

    /**
     * @method
     * @name interactivebrokers#fetchPositions
     * @description fetch all open positions
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-positions-in-real-time
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        const [ accountId, query ] = await this.loadAccountId (params);
        const request: Dict = {
            'accountId': accountId,
        };
        const response = await this.privateGetPortfolio2AccountIdPositions (this.extend (request, query));
        //
        //     [
        //         {
        //             "position": 12.0,
        //             "conid": "265598",
        //             "avgCost": 192.5,
        //             "avgPrice": 192.5,
        //             "currency": "USD",
        //             "description": "AAPL",
        //             "isLastToLoq": false,
        //             "marketPrice": 193.12,
        //             "marketValue": 2317.44,
        //             "realizedPnl": 0.0,
        //             "secType": "STK",
        //             "timestamp": 1717444668,
        //             "unrealizedPnl": 7.44,
        //             "assetClass": "STK",
        //             "sector": "Technology",
        //             "group": "Computers",
        //             "model": ""
        //         }
        //     ]
        //
        return this.parsePositions (response, symbols);
    }

    /**
     * @method
     * @name interactivebrokers#fetchPosition
     * @description fetch data on a single open position
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-positions-in-real-time
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params: Dict = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positions = await this.fetchPositions ([ market['symbol'] ], params);
        return this.safeDict (positions, 0) as Position;
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'conid');
        const resolved = this.safeMarket (marketId, market);
        const timestamp = this.safeTimestamp (position, 'timestamp');
        const contracts = this.safeString (position, 'position');
        let side: Str = undefined;
        if (Precise.stringGt (contracts, '0')) {
            side = 'long';
        } else if (Precise.stringLt (contracts, '0')) {
            side = 'short';
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': resolved['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'isolated': undefined,
            'hedged': undefined,
            'side': side,
            'contracts': this.parseNumber (Precise.stringAbs (contracts)),
            'contractSize': undefined,
            'entryPrice': this.safeNumber2 (position, 'avgPrice', 'avgCost'),
            'markPrice': this.safeNumber2 (position, 'marketPrice', 'mktPrice'),
            'notional': this.safeNumber2 (position, 'marketValue', 'mktValue'),
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'realizedPnl': this.safeNumber (position, 'realizedPnl'),
            'liquidationPrice': undefined,
            'marginMode': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'lastUpdateTimestamp': undefined,
        });
    }

    ibkrEncrypt (value: string): string {
        // RFC 3986 percent-encoding (also escapes !'()*), as required by the oauth 1.0a signature base string
        const encoded = this.urlencode ({ 'v': value });
        return encoded.slice (2); // strip the 'v=' prefix
    }

    ibkrBaseString (method: string, url: string, params: Dict, prepend: string = ''): string {
        const query = this.rawencode (this.keysort (params));
        return prepend + method + '&' + this.ibkrEncrypt (url) + '&' + this.ibkrEncrypt (query);
    }

    ibkrAuthHeader (params: Dict): string {
        const sorted = this.keysort (params);
        const keys = Object.keys (sorted);
        const parts: string[] = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            parts.push (key + '="' + sorted[key] + '"');
        }
        return 'OAuth realm="' + this.options['realm'] + '", ' + parts.join (', ');
    }

    ibkrOauthBase (consumerKey: string, consumerAccessToken: string): Dict {
        return {
            'oauth_consumer_key': consumerKey,
            'oauth_nonce': this.randomBytes (16),
            'oauth_timestamp': this.seconds ().toString (),
            'oauth_token': consumerAccessToken,
        };
    }

    override sign (path: string, api = 'private', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const baseUrl = this.urls['api'][api] + this.implodeParams (path, params);
        let url = baseUrl;
        const query = this.omit (params, this.extractParams (path));
        const hasQuery = Object.keys (query).length > 0;
        const isGetOrDelete = (method === 'GET') || (method === 'DELETE');
        let requestBody: Str = body;
        let requestHeaders: NullableDict = headers;
        this.checkRequiredCredentials ();
        const oauthParams = this.ibkrOauthBase (this.uid, this.apiKey);
        if (path.endsWith ('v1/api/oauth/live_session_token')) {
            // the live session token request is signed with RSA-SHA256,
            // its parameters (diffie_hellman_challenge) are sent as oauth parameters in the Authorization header
            const accessTokenSecretHex = this.safeString (this.options, 'accessTokenSecretHex', '');
            const signatureKey = this.readFile (this.options['signaturePemPath']) as string;
            oauthParams['oauth_signature_method'] = 'RSA-SHA256';
            const authParams = this.extend (oauthParams, query);
            const auth = this.ibkrBaseString (method, baseUrl, authParams, accessTokenSecretHex);
            const signature = rsa (auth, signatureKey, sha256);
            authParams['oauth_signature'] = this.ibkrEncrypt (signature);
            requestHeaders = {
                'Authorization': this.ibkrAuthHeader (authParams),
                'User-Agent': 'ccxt',
            };
        } else {
            // private requests are signed with HMAC-SHA256 using the live session token obtained by signIn ()
            const liveSessionToken = this.safeString (this.options, 'liveSessionToken');
            if (liveSessionToken === undefined) {
                throw new AuthenticationError (this.id + ' requires a live session token, call signIn() first');
            }
            oauthParams['oauth_signature_method'] = 'HMAC-SHA256';
            let signingParams = oauthParams;
            if (isGetOrDelete) {
                if (hasQuery) {
                    url += '?' + this.urlencode (query);
                    // the query-string params are part of the signature base string too
                    signingParams = this.extend (oauthParams, query);
                }
            } else if (hasQuery) {
                requestBody = this.json (query);
            }
            const auth = this.ibkrBaseString (method, baseUrl, signingParams);
            const signature = this.hmac (this.encode (auth), this.base64ToBinary (liveSessionToken), sha256, 'base64');
            oauthParams['oauth_signature'] = this.ibkrEncrypt (signature);
            requestHeaders = {
                'Authorization': this.ibkrAuthHeader (oauthParams),
                'Content-Type': 'application/json',
                'User-Agent': 'ccxt',
            };
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "error": "Bad Request: Conid(s) missing",
        //         "statusCode": 400
        //     }
        //
        const errorMessage = this.safeString (response, 'error');
        if (errorMessage !== undefined) {
            const feedback = this.id + ' ' + body;
            const statusCode = this.safeString (response, 'statusCode');
            this.throwExactlyMatchedException (this.exceptions['exact'], statusCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
