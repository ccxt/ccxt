
//  ---------------------------------------------------------------------------

import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from './abstract/derive.js';
import { Precise } from './base/Precise.js';
import type { Dict, List, Currencies, Transaction, Currency, CurrencyInterface, FundingHistory, Market, Bool, Str, Strings, Ticker, Int, int, Trade, OrderType, OrderSide, Num, FundingRateHistory, FundingRate, Balances, Order, Position, NullableDict, Endpoint } from './base/types.js';
import { BadRequest, InvalidOrder, ExchangeError, OrderNotFound, ArgumentsRequired, InsufficientFunds, RateLimitExceeded, AuthenticationError } from './base/errors.js';
import { ecdsa } from './base/functions/crypto.js';
import { TICK_SIZE } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class derive
 * @augments Exchange
 */
export default class derive extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'derive',
            'name': 'Derive',
            'countries': [],
            'version': 'v3',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': true,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
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
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
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
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': false,
                            'mark': true,
                            'index': false,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': undefined,
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': undefined,
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/9e640700-c870-41f9-8907-fba58e120fed',
                'api': {
                    'public': 'https://api.derive.xyz/v3/public',
                    'private': 'https://api.derive.xyz/v3/private',
                },
                'test': {
                    'public': 'https://testnet.api.derive.xyz/v3/public',
                    'private': 'https://testnet.api.derive.xyz/v3/private',
                },
                'www': 'https://www.derive.xyz/',
                'doc': 'https://docs.derive.xyz/',
                'fees': 'https://docs.derive.xyz/integrators/trading/trading-fees',
                'referral': 'https://www.derive.xyz/invite/3VB0B',
            },
            'api': {
                'public': {
                    'get': {
                        'get_all_currencies': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': {
                        'decode_action': { 'cost': 1 } as Endpoint<Dict>,
                        'get_wallets_from_session_key': { 'cost': 1 } as Endpoint<Dict>,
                        'get_all_currencies': { 'cost': 1 } as Endpoint<Dict>,
                        'get_currency': { 'cost': 1 } as Endpoint<Dict>,
                        'get_risk_universes': { 'cost': 1 } as Endpoint<Dict>,
                        'get_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'get_all_instruments': { 'cost': 1 } as Endpoint<Dict>,
                        'get_all_live_instruments': { 'cost': 1 } as Endpoint<Dict>,
                        'get_ticker': { 'cost': 1 } as Endpoint<Dict>,
                        'get_tickers': { 'cost': 1 } as Endpoint<Dict>,
                        'get_latest_signed_feeds': { 'cost': 1 } as Endpoint<Dict>,
                        'get_option_settlement_prices': { 'cost': 1 } as Endpoint<Dict>,
                        'get_index_chart_data': { 'cost': 1 } as Endpoint<Dict>,
                        'get_tradingview_chart_data': { 'cost': 1 } as Endpoint<Dict>,
                        'get_funding_rate_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_trade_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_liquidation_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_interest_rate_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_transaction': { 'cost': 1 } as Endpoint<Dict>,
                        'get_onchain_action_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_pending_deposits': { 'cost': 1 } as Endpoint<Dict>,
                        'register_deposit_address': { 'cost': 1 } as Endpoint<Dict>,
                        'get_margin': { 'cost': 1 } as Endpoint<Dict>,
                        'margin_watch': { 'cost': 1 } as Endpoint<Dict>,
                        'order_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'get_live_auctions': { 'cost': 1 } as Endpoint<Dict>,
                        'start_auction': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vault': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vaults': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vault_action_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vault_performance_history': { 'cost': 1 } as Endpoint<Dict>,
                        'set_socialization_feed_data': { 'cost': 1 } as Endpoint<Dict>,
                        'withdraw_debug': { 'cost': 1 } as Endpoint<Dict>,
                        'send_quote_debug': { 'cost': 1 } as Endpoint<Dict>,
                        'execute_quote_debug': { 'cost': 1 } as Endpoint<Dict>,
                        'get_all_referral_codes': { 'cost': 1 } as Endpoint<Dict>,
                        'get_referral_performance': { 'cost': 1 } as Endpoint<Dict>,
                        'get_time': { 'cost': 1 } as Endpoint<Dict>,
                        'get_maker_programs': { 'cost': 1 } as Endpoint<Dict>,
                        'get_maker_program_scores': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'post': {
                        'get_account': { 'cost': 1 } as Endpoint<Dict>,
                        'get_subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'get_subaccounts': { 'cost': 1 } as Endpoint<Dict>,
                        'delete_subaccount': { 'cost': 1 } as Endpoint<Dict>,
                        'get_all_portfolios': { 'cost': 1 } as Endpoint<Dict>,
                        'change_subaccount_label': { 'cost': 1 } as Endpoint<Dict>,
                        'withdraw': { 'cost': 1 } as Endpoint<Dict>,
                        'transfer_spot': { 'cost': 1 } as Endpoint<Dict>,
                        'transfer_spot_external': { 'cost': 1 } as Endpoint<Dict>,
                        'transfer_positions': { 'cost': 1 } as Endpoint<Dict>,
                        'reject_deposit_request': { 'cost': 1 } as Endpoint<Dict>,
                        'update_whitelisted_recipients': { 'cost': 1 } as Endpoint<Dict>,
                        'order': { 'cost': 1 } as Endpoint<Dict>,
                        'replace': { 'cost': 1 } as Endpoint<Dict>,
                        'order_debug': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order': { 'cost': 1 } as Endpoint<Dict>,
                        'get_open_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'get_trigger_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'get_algo_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_by_label': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_by_nonce': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_by_instrument': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_trigger_order': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_algo_order': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_algo_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_trigger_orders': { 'cost': 1 } as Endpoint<Dict>,
                        'get_order_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_trade_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_deposit_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_withdrawal_history': { 'cost': 1 } as Endpoint<Dict>,
                        'send_rfq': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_rfq': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_batch_rfqs': { 'cost': 1 } as Endpoint<Dict>,
                        'get_rfqs': { 'cost': 1 } as Endpoint<Dict>,
                        'poll_rfqs': { 'cost': 1 } as Endpoint<Dict>,
                        'send_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_batch_quotes': { 'cost': 1 } as Endpoint<Dict>,
                        'get_quotes': { 'cost': 1 } as Endpoint<Dict>,
                        'poll_quotes': { 'cost': 1 } as Endpoint<Dict>,
                        'execute_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'order_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'replace_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'rfq_get_best_quote': { 'cost': 1 } as Endpoint<Dict>,
                        'get_margin': { 'cost': 1 } as Endpoint<Dict>,
                        'get_collaterals': { 'cost': 1 } as Endpoint<Dict>,
                        'get_positions': { 'cost': 1 } as Endpoint<Dict>,
                        'get_option_settlement_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_subaccount_value_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_funding_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_interest_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_erc20_transfer_history': { 'cost': 1 } as Endpoint<Dict>,
                        'get_liquidation_history': { 'cost': 1 } as Endpoint<Dict>,
                        'liquidate': { 'cost': 1 } as Endpoint<Dict>,
                        'session_keys': { 'cost': 1 } as Endpoint<Dict>,
                        'set_session_key': { 'cost': 1 } as Endpoint<Dict>,
                        'edit_session_key': { 'cost': 1 } as Endpoint<Dict>,
                        'get_mmp_config': { 'cost': 1 } as Endpoint<Dict>,
                        'set_mmp_config': { 'cost': 1 } as Endpoint<Dict>,
                        'reset_mmp': { 'cost': 1 } as Endpoint<Dict>,
                        'create_vault': { 'cost': 1 } as Endpoint<Dict>,
                        'update_vault_info': { 'cost': 1 } as Endpoint<Dict>,
                        'mint_vault_shares': { 'cost': 1 } as Endpoint<Dict>,
                        'burn_vault_shares': { 'cost': 1 } as Endpoint<Dict>,
                        'force_burn': { 'cost': 1 } as Endpoint<Dict>,
                        'request_vault_deposit': { 'cost': 1 } as Endpoint<Dict>,
                        'request_vault_withdraw': { 'cost': 1 } as Endpoint<Dict>,
                        'cancel_all_vault_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vault_shares': { 'cost': 1 } as Endpoint<Dict>,
                        'get_curated_vaults': { 'cost': 1 } as Endpoint<Dict>,
                        'get_shareholder_vaults': { 'cost': 1 } as Endpoint<Dict>,
                        'get_live_mint_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_live_burn_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_live_vault_requests': { 'cost': 1 } as Endpoint<Dict>,
                        'get_vault_request_history': { 'cost': 1 } as Endpoint<Dict>,
                    },
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
                    '-32000': RateLimitExceeded, // Rate limit exceeded
                    '-32100': RateLimitExceeded, // Number of concurrent websocket clients limit exceeded
                    '-32700': BadRequest, // Parse error
                    '-32600': BadRequest, // Invalid Request
                    '-32601': BadRequest, // Method not found
                    '-32602': InvalidOrder, // {"id":"55e66a3d-6a4e-4a36-a23d-5cf8a91ef478","error":{"code":"","message":"Invalid params"}}
                    '-32603': InvalidOrder, // {"code":"-32603","message":"Internal error","data":"SubAccount matching query does not exist."}
                    '9000': InvalidOrder, // Order confirmation timeout
                    '10000': BadRequest, // Manager not found
                    '10001': BadRequest, // Asset is not an ERC20 token
                    '10002': BadRequest, // Sender and recipient wallet do not match
                    '10003': BadRequest, // Sender and recipient subaccount IDs are the same
                    '10004': InvalidOrder, // Multiple currencies not supported
                    '10005': BadRequest, // Maximum number of subaccounts per wallet reached
                    '10006': BadRequest, // Maximum number of session keys per wallet reached
                    '10007': BadRequest, // Maximum number of assets per subaccount reached
                    '10008': BadRequest, // Maximum number of expiries per subaccount reached
                    '10009': BadRequest, // Recipient subaccount ID of the transfer cannot be 0
                    '10010': InvalidOrder, // PMRM only supports USDC asset collateral. Cannot trade spot markets.
                    '10011': InsufficientFunds, // ERC20 allowance is insufficient
                    '10012': InsufficientFunds, // ERC20 balance is less than transfer amount
                    '10013': ExchangeError, // There is a pending deposit for this asset
                    '10014': ExchangeError, // There is a pending withdrawal for this asset
                    '11000': InsufficientFunds, // Insufficient funds
                    '11002': InvalidOrder, // Order rejected from queue
                    '11003': InvalidOrder, // Already cancelled
                    '11004': InvalidOrder, // Already filled
                    '11005': InvalidOrder, // Already expired
                    '11006': OrderNotFound, // {"code":"11006","message":"Does not exist","data":"Open order with id: 804018f3-b092-40a3-a933-b29574fa1ff8 does not exist."}
                    '11007': InvalidOrder, // Self-crossing disallowed
                    '11008': InvalidOrder, // Post-only reject
                    '11009': InvalidOrder, // Zero liquidity for market or IOC/FOK order
                    '11010': InvalidOrder, // Post-only invalid order type
                    '11011': InvalidOrder, // {"code":11011,"message":"Invalid signature expiry","data":"Order must expire in 300 sec or more"}
                    '11012': InvalidOrder, // {"code":"11012","message":"Invalid amount","data":"Amount must be a multiple of 0.01"}
                    '11013': InvalidOrder, // {"code":"11013","message":"Invalid limit price","data":{"limit":"10000","bandwidth":"92530"}}
                    '11014': InvalidOrder, // Fill-or-kill not filled
                    '11015': InvalidOrder, // MMP frozen
                    '11016': InvalidOrder, // Already consumed
                    '11017': InvalidOrder, // Non unique nonce
                    '11018': InvalidOrder, // Invalid nonce date
                    '11019': InvalidOrder, // Open orders limit exceeded
                    '11020': InsufficientFunds, // Negative ERC20 balance
                    '11021': InvalidOrder, // Instrument is not live
                    '11022': InvalidOrder, // Reject timestamp exceeded
                    '11023': InvalidOrder, // {"code":"11023","message":"Max fee order param is too low","data":"signed max_fee must be >= 194.420835871999983091712000000000000000"}
                    '11024': InvalidOrder, // {"code":11024,"message":"Reduce only not supported with this time in force"}
                    '11025': InvalidOrder, // Reduce only reject
                    '11026': BadRequest, // Transfer reject
                    '11027': InvalidOrder, // Subaccount undergoing liquidation
                    '11028': InvalidOrder, // Replaced order filled amount does not match expected state.
                    '11029': InvalidOrder, // {"code":11029,"message":"Trade or transfer rejected: open interest cap would be exceeded","data":"open-interest cap exceeded for SpotBorrow on 0x... in universe 1: pre 0, post 2000000000, cap 0"}
                    '11050': InvalidOrder, // Trigger order was cancelled between the time worker sent order and engine processed order
                    '11051': InvalidOrder, // {"code":"11051","message":"Trigger price must be higher than the current price for stop orders and vice versa for take orders","data":"Trigger price 9000.0 must be < or > current price 102671.2 depending on trigger type and direction."}
                    '11052': InvalidOrder, // Trigger order limit exceeded (separate limit from regular orders)
                    '11053': InvalidOrder, // Index and last-trade trigger price types not supported yet
                    '11054': InvalidOrder, // {"code":"11054","message":"Trigger orders cannot replace or be replaced"}
                    '11055': InvalidOrder, // Market order limit_price is unfillable at the given trigger price
                    '11100': InvalidOrder, // Leg instruments are not unique
                    '11101': InvalidOrder, // RFQ not found
                    '11102': InvalidOrder, // Quote not found
                    '11103': InvalidOrder, // Quote leg does not match RFQ leg
                    '11104': InvalidOrder, // Requested quote or RFQ is not open
                    '11105': InvalidOrder, // Requested quote ID references a different RFQ ID
                    '11106': InvalidOrder, // Invalid RFQ counterparty
                    '11107': InvalidOrder, // Quote maker total cost too high
                    '11200': InvalidOrder, // Auction not ongoing
                    '11201': InvalidOrder, // Open orders not allowed
                    '11202': InvalidOrder, // Price limit exceeded
                    '11203': InvalidOrder, // Last trade ID mismatch
                    '12000': InvalidOrder, // Asset not found
                    '12001': InvalidOrder, // Instrument not found
                    '12002': BadRequest, // Currency not found
                    '12003': BadRequest, // USDC does not have asset caps per manager
                    '13000': BadRequest, // Invalid channels
                    '14000': BadRequest, // {"code": 14000, "message": "Account not found"}
                    '14001': InvalidOrder, // {"code": 14001, "message": "Subaccount not found"}
                    '14002': BadRequest, // Subaccount was withdrawn
                    '14008': BadRequest, // Cannot reduce expiry using registerSessionKey RPC route
                    '14009': BadRequest, // Session key expiry must be > utc_now + 10 min
                    '14010': BadRequest, // Session key already registered for this account
                    '14011': BadRequest, // Session key already registered with another account
                    '14012': BadRequest, // Address must be checksummed
                    '14013': BadRequest, // String is not a valid ethereum address
                    '14014': InvalidOrder, // {"code":"14014","message":"Signature invalid for message or transaction","data":"Signature does not match data"}
                    '14015': BadRequest, // Transaction count for given wallet does not match provided nonce
                    '14016': BadRequest, // The provided signed raw transaction contains function name that does not match the expected function name
                    '14017': BadRequest, // The provided signed raw transaction contains contract address that does not match the expected contract address
                    '14018': BadRequest, // The provided signed raw transaction contains function params that do not match any expected function params
                    '14019': BadRequest, // The provided signed raw transaction contains function param values that do not match the expected values
                    '14020': BadRequest, // The X-DeriveWallet header does not match the requested subaccount_id or wallet
                    '14021': BadRequest, // The X-DeriveWallet header not provided
                    '14022': AuthenticationError, // Subscription to a private channel failed
                    '14023': InvalidOrder, // {"code":"14023","message":"Signer in on-chain related request is not wallet owner or registered session key","data":"Session key does not belong to wallet"}
                    '14024': BadRequest, // Chain ID must match the current roll up chain id
                    '14025': BadRequest, // The private request is missing a wallet or subaccount_id param
                    '14026': BadRequest, // Session key not found
                    '14027': AuthenticationError, // Unauthorized as RFQ maker
                    '14028': BadRequest, // Cross currency RFQ not supported
                    '14029': AuthenticationError, // Session key IP not whitelisted
                    '14030': BadRequest, // Session key expired
                    '14031': AuthenticationError, // Unauthorized key scope
                    '14032': BadRequest, // Scope should not be changed
                    '16000': AuthenticationError, // You are in a restricted region that violates our terms of service.
                    '16001': AuthenticationError, // Account is disabled due to compliance violations, please contact support to enable it.
                    '16100': AuthenticationError, // Sentinel authorization is invalid
                    '17000': BadRequest, // This accoount does not have a shareable invite code
                    '17001': BadRequest, // Invalid invite code
                    '17002': BadRequest, // Invite code already registered for this account
                    '17003': BadRequest, // Invite code has no remaining uses
                    '17004': BadRequest, // Requirement for successful invite registration not met
                    '17005': BadRequest, // Account must register with a valid invite code to be elligible for points
                    '17006': BadRequest, // Point program does not exist
                    '17007': BadRequest, // Invalid leaderboard page number
                    '18000': BadRequest, // Invalid block number
                    '18001': BadRequest, // Failed to estimate block number. Please try again later.
                    '18002': BadRequest, // The provided smart contract owner does not match the wallet in LightAccountFactory.getAddress()
                    '18003': BadRequest, // Vault ERC20 asset does not exist
                    '18004': BadRequest, // Vault ERC20 pool does not exist
                    '18005': BadRequest, // Must add asset to pool before getting balances
                    '18006': BadRequest, // Invalid Swell season. Swell seasons are in the form 'swell_season_X'.
                    '18007': BadRequest, // Vault not found
                    '19000': BadRequest, // Maker program not found
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'deriveWalletAddress': '', // the owner wallet "0x"-prefixed hexstring; defaults to the walletAddress credential (v3 has no separate derive wallet), override only when signing with a session key for another owner wallet
                'id': '0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749',
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'maxMarketPages': 25,
                'maxMarketsPerPage': 1000,
            },
        });
    }

    override setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }

    /**
     * @method
     * @name derive#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.derive.xyz/api-reference/system/publicget_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params: Dict = {}): Promise<Int> {
        const response = await this.publicPostGetTime (params);
        //
        // {
        //     "result": 1735846536758,
        //     "id": "f1c03d21-f886-4c5a-9a9d-33dd06f180f0"
        // }
        //
        return this.safeInteger (response, 'result');
    }

    /**
     * @method
     * @name derive#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_all_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const tokenResponse = await this.publicGetGetAllCurrencies (params);
        //
        //    {
        //        "result": [
        //            {
        //                "currency": "SEI",
        //                "instrument_types": [
        //                    "perp"
        //                ],
        //                "protocol_asset_addresses": {
        //                    "perp": "0x7225889B75fd34C68eA3098dAE04D50553C09840",
        //                    "option": null,
        //                    "spot": null,
        //                    "underlying_erc20": null
        //                },
        //                "managers": [
        //                    {
        //                        "address": "0x28c9ddF9A3B29c2E6a561c1BC520954e5A33de5D",
        //                        "margin_type": "SM",
        //                        "currency": null
        //                    }
        //                ],
        //                "srm_im_discount": "0",
        //                "srm_mm_discount": "0",
        //                "pm2_collateral_discounts": [],
        //                "borrow_apy": "0",
        //                "supply_apy": "0",
        //                "total_borrow": "0",
        //                "total_supply": "0",
        //                "asset_cap_and_supply_per_manager": {
        //                    "perp": {
        //                        "SM": [
        //                            {
        //                                "current_open_interest": "0",
        //                                "interest_cap": "2000000",
        //                                "manager_currency": null
        //                            }
        //                        ]
        //                    },
        //                    "option": {},
        //                    "erc20": {}
        //                },
        //                "market_type": "SRM_PERP_ONLY",
        //                "spot_price": "0.2193542905042081",
        //                "spot_price_24h": "0.238381655533635830"
        //            },
        //     "id": "7e07fe1d-0ab4-4d2b-9e22-b65ce9e232dc"
        // }
        //
        const currencies = this.safeList (tokenResponse, 'result', []);
        return this.parseCurrencies (currencies);
    }

    override parseCurrency (rawCurrency: Dict): CurrencyInterface {
        const currencyId = this.safeString (rawCurrency, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'name': undefined,
            'code': code,
            'precision': undefined,
            'active': undefined,
            'fee': undefined,
            'networks': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name derive#fetchMarkets
     * @description retrieves data on all markets for derive
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_all_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        if (this.safeBool (this.options, 'adjustForTimeDifference', false)) {
            await this.loadTimeDifference ();
        }
        const spotMarketsPromise = this.fetchSpotMarkets (params);
        const swapMarketsPromise = this.fetchSwapMarkets (params);
        const optionMarketsPromise = this.fetchOptionMarkets (params);
        const [ spotMarkets, swapMarkets, optionMarkets ] = await Promise.all ([ spotMarketsPromise, swapMarketsPromise, optionMarketsPromise ]);
        //
        // {
        //     "result": {
        //         "instruments": [
        //             {
        //                 "instrument_type": "perp",
        //                 "instrument_name": "BTC-PERP",
        //                 "scheduled_activation": 1701840228,
        //                 "scheduled_deactivation": 9223372036854776000,
        //                 "is_active": true,
        //                 "tick_size": "0.1",
        //                 "minimum_amount": "0.01",
        //                 "maximum_amount": "10000",
        //                 "amount_step": "0.001",
        //                 "mark_price_fee_rate_cap": "0",
        //                 "maker_fee_rate": "0.00005",
        //                 "taker_fee_rate": "0.0003",
        //                 "base_fee": "0.1",
        //                 "base_currency": "BTC",
        //                 "quote_currency": "USD",
        //                 "option_details": null,
        //                 "perp_details": {
        //                     "index": "BTC-USD",
        //                     "max_rate_per_hour": "0.004",
        //                     "min_rate_per_hour": "-0.004",
        //                     "static_interest_rate": "0.0000125",
        //                     "aggregate_funding": "10538.574363381759146829",
        //                     "funding_rate": "0.0000125"
        //                 },
        //                 "erc20_details": null,
        //                 "base_asset_address": "0xDBa83C0C654DB1cd914FA2710bA743e925B53086",
        //                 "base_asset_sub_id": "0",
        //                 "pro_rata_fraction": "0",
        //                 "fifo_min_allocation": "0",
        //                 "pro_rata_amount_step": "0.1"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a06bc0b2-8e78-4536-a21f-f785f225b5a5"
        // }
        //
        let result = this.arrayConcat (spotMarkets, swapMarkets);
        result = this.arrayConcat (result, optionMarkets);
        return result;
    }

    async fetchSpotMarkets (params: Dict = {}): Promise<Market[]> {
        const request: Dict = {
            'expired': false,
            'instrument_type': 'erc20',
        };
        return await this.getMarketsPaginated (request, params);
    }

    async fetchSwapMarkets (params: Dict = {}): Promise<Market[]> {
        const request: Dict = {
            'expired': false,
            'instrument_type': 'perp',
        };
        return await this.getMarketsPaginated (request, params);
    }

    async fetchOptionMarkets (params: Dict = {}): Promise<Market[]> {
        const request: Dict = {
            'expired': false,
            'instrument_type': 'option',
        };
        return await this.getMarketsPaginated (request, params);
    }

    /**
     * @method
     * @ignore
     * @name derive#getMarketsPaginated
     * @description fetches every page of public/get_all_instruments for the given filter and parses the instruments; v3 paginates the endpoint, options alone exceed 5000 entries
     * @param {object} request the base request with the instrument_type filter
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of market structures
     */
    async getMarketsPaginated (request: Dict, params: Dict = {}): Promise<Market[]> {
        let allInstruments: Dict[] = [];
        let maxPages = 25;
        let paramsOmitted: Dict = {};
        [ maxPages, paramsOmitted ] = this.handleOptionAndParams (params, 'getMarketsPaginated', 'maxMarketPages', maxPages);
        let pageSize = 1000;
        [ pageSize, paramsOmitted ] = this.handleOptionAndParams (paramsOmitted, 'getMarketsPaginated', 'maxMarketsPerPage', pageSize);
        let page = 1;
        for (let i = 0; i < maxPages; i++) {
            const requestExtension: Dict = {
                'page': page,
                'page_size': pageSize,
            };
            const requestExtended = this.extend (request, requestExtension, paramsOmitted);
            const response = await this.publicPostGetAllInstruments (requestExtended);
            const result = this.safeDict (response, 'result', {});
            const data = this.safeList (result, 'instruments', []);
            allInstruments = this.arrayConcat (allInstruments, data);
            const pagination = this.safeDict (result, 'pagination', {});
            const count = this.safeInteger (pagination, 'count', 0);
            const collected = allInstruments.length;
            if (collected >= count) {
                break;
            }
            page += 1;
        }
        return this.parseMarkets (allInstruments);
    }

    override parseMarket (market: Dict): Market {
        const type = this.safeString (market, 'instrument_type');
        let marketType: Str = undefined;
        let spot = false;
        let margin = true;
        let swap = false;
        let option = false;
        let linear: Bool = undefined;
        let inverse: Bool = undefined;
        const baseId = this.safeString (market, 'base_currency');
        const quoteId = this.safeString (market, 'quote_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        if ((base === undefined) || (quote === undefined)) {
            return undefined;
        }
        const marketId = this.safeString (market, 'instrument_name');
        let symbol = base + '/' + quote;
        let settleId: Str = undefined;
        let settle: Str = undefined;
        let expiry: Num = undefined;
        let strike: Num = undefined;
        let optionType: Str = undefined;
        let optionLetter: Str = undefined;
        if (type === 'erc20') {
            spot = true;
            marketType = 'spot';
        } else if (type === 'perp') {
            margin = false;
            settleId = 'USDC';
            settle = this.safeCurrencyCode (settleId);
            symbol = base + '/' + quote + ':' + settle;
            swap = true;
            linear = true;
            inverse = false;
            marketType = 'swap';
        } else if (type === 'option') {
            settleId = 'USDC';
            settle = this.safeCurrencyCode (settleId);
            margin = false;
            option = true;
            marketType = 'option';
            const optionDetails = this.safeDict (market, 'option_details');
            expiry = this.safeTimestamp (optionDetails, 'expiry');
            strike = this.safeInteger (optionDetails, 'strike');
            optionLetter = this.safeString (optionDetails, 'option_type');
            symbol = base + '/' + quote + ':' + settle + '-' + this.yymmdd (expiry) + '-' + this.numberToString (strike) + '-' + optionLetter;
            if (optionLetter === 'P') {
                optionType = 'put';
            } else {
                optionType = 'call';
            }
            linear = true;
            inverse = false;
        }
        const contractSize = (spot) ? undefined : 1;
        const isContract = (swap || option);
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': false,
            'option': option,
            'active': this.safeBool (market, 'is_active'),
            'contract': isContract,
            'linear': linear,
            'inverse': inverse,
            'contractSize': contractSize,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'taker': this.safeNumber (market, 'taker_fee_rate'),
            'maker': this.safeNumber (market, 'maker_fee_rate'),
            'strike': strike,
            'optionType': optionType,
            'precision': {
                'amount': this.safeNumber (market, 'amount_step'),
                'price': this.safeNumber (market, 'tick_size'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minimum_amount'),
                    'max': this.safeNumber (market, 'maximum_amount'),
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
            'info': market,
        });
    }

    /**
     * @method
     * @name derive#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        const response = await this.publicPostGetTicker (this.extend (request, params));
        //
        //     {
        //         "id": "45bb6856-54b7-48da-a9c1-1c3ba964888b",
        //         "result": {
        //             "t": 1790867526668,
        //             "A": "0",
        //             "a": "0",
        //             "B": "0",
        //             "b": "0",
        //             "f": "0.000012500",
        //             "option_pricing": null,
        //             "I": "83946.3",
        //             "M": "83938.8",
        //             "stats": {
        //                 "c": "16.41",
        //                 "v": "1377350.271",
        //                 "pr": "1377095.872",
        //                 "n": 98,
        //                 "oi": "0",
        //                 "h": "84282",
        //                 "l": "83661.8",
        //                 "p": "0"
        //             },
        //             "minp": "82293.1",
        //             "maxp": "85617.6"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'result', {});
        return this.parseTicker (data, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     v3 slim format; the payload does not carry the instrument name, so the symbol comes from the market argument
        //
        //     {
        //         "t": 1790867526668,
        //         "A": "0",
        //         "a": "0",
        //         "B": "0",
        //         "b": "0",
        //         "f": "0.000012500",
        //         "option_pricing": null,
        //         "I": "83946.3",
        //         "M": "83938.8",
        //         "stats": {
        //             "c": "16.41",           // contract_volume_24h
        //             "v": "1377350.271",     // notional_volume_24h
        //             "pr": "1377095.872",    // premium_volume_24h
        //             "n": 98,                // trade_count_24h
        //             "oi": "0",              // open_interest
        //             "h": "84282",           // high_24h
        //             "l": "83661.8",         // low_24h
        //             "p": "0"                // percent_change_24h
        //         },
        //         "minp": "82293.1",
        //         "maxp": "85617.6"
        //     }
        //
        const timestamp = this.safeIntegerOmitZero (ticker, 't');
        const stats = this.safeDict (ticker, 'stats');
        const change = this.safeString (stats, 'p');
        let percentage: Str = undefined;
        if (change !== undefined) {
            percentage = Precise.stringMul (change, '100');
        }
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (stats, 'h'),
            'low': this.safeString (stats, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeString (stats, 'c'),
            'quoteVolume': this.safeString (stats, 'v'),
            'indexPrice': this.safeString (ticker, 'I'),
            'markPrice': this.safeString (ticker, 'M'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name derive#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_trade_history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch; limits above ~500 cannot be filled in a single request because the venue caps pages at 1000 raw rows (two per match), use params.paginate instead
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ paginate, paramsPaginate ] = this.handleOptionBoolAndParams (params, 'fetchTrades', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchTrades', symbol, since, limit, paramsPaginate, 'page', 1000) as Trade[];
        }
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        let limitResolved: Int = limit;
        if (limit !== undefined && limit > 1000) {
            limitResolved = 1000;
        }
        if (limitResolved !== undefined) {
            // the venue lists every match twice (a maker row and a taker row) and parseTrades drops the maker duplicates, so twice the limit is requested to return close to the asked amount
            let pageSize = limitResolved * 2;
            if (pageSize > 1000) {
                pageSize = 1000; // default 100, max 1000
            }
            request['page_size'] = pageSize;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        const until = this.safeInteger (paramsPaginate, 'until');
        const paramsOmitted: Dict = this.omit (paramsPaginate, [ 'until' ]);
        if (until !== undefined) {
            request['to_timestamp'] = until;
        }
        const response = await this.publicPostGetTradeHistory (this.extend (request, paramsOmitted));
        //
        // {
        //     "result": {
        //         "trades": [
        //             {
        //                 "trade_id": "9dbc88b0-f0c4-4439-9cc1-4e6409d4eafb",
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1736153910930,
        //                 "trade_price": "98995.3",
        //                 "trade_amount": "0.033",
        //                 "mark_price": "98990.875914388161618263",
        //                 "index_price": "99038.050611100001501184",
        //                 "direction": "sell",
        //                 "quote_id": null,
        //                 "wallet": "0x88B6BB87fbFac92a34F8155aaA35c87B5b166fA9",
        //                 "subaccount_id": 8250,
        //                 "tx_status": "settled",
        //                 "tx_hash": "0x020bd735b312f867f17f8cc254946d87cfe9f2c8ff3605035d8129082eb73723",
        //                 "trade_fee": "0.980476701049890015",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "-2.92952402688793509",
        //                 "realized_pnl_excl_fees": "-1.949047325838045075"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 598196,
        //             "count": 598196
        //         }
        //     },
        //     "id": "b8539544-6975-4497-8163-5e51a38e4aa7"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const data: Dict[] = this.safeList (result, 'trades', []);
        return this.parseTrades (data, market, since, limitResolved);
    }

    override parseTrades (trades: List, market: Market = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Trade[] {
        const tradesArray = this.toArray (trades);
        let result: Trade[] = [];
        for (let i = 0; i < tradesArray.length; i++) {
            const rawTrade = tradesArray[i];
            const isFetchTrades = !('order_id' in rawTrade);
            const liquidityRole = this.safeString (rawTrade, 'liquidity_role');
            if (isFetchTrades && (liquidityRole === 'maker')) {
                // skip maker trades
                continue;
            }
            const parsed = this.parseTrade (rawTrade, market);
            const trade = this.extend (parsed, params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = this.safeString (market, 'symbol');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Trade[];
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades & fetchMyTrades
        //
        // {
        //     "subaccount_id": 130837,
        //     "instrument_name": "BTC-PERP",
        //     "direction": "sell",
        //     "quote_id": null,
        //     "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //     "timestamp": 1738065303708,
        //     "mark_price": "102740.137375457314192317",
        //     "index_price": "102741.553409299981533184",
        //     "trade_price": "102700.6",
        //     "trade_amount": "0.01",
        //     "liquidity_role": "taker",
        //     "realized_pnl": "0",
        //     "realized_pnl_excl_fees": "0",
        //     "tx_status": "settled",
        //     "trade_fee": "1.127415534092999815",
        //     "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //     "label": "test1234",                                      // only fetchMyTrades
        //     "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",       // only fetchMyTrades
        //     "is_transfer": false,                                     // only fetchMyTrades
        //     "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d11bb", // only fetchMyTrades
        //     "rfq_id": null,                                           // only fetchTrades
        //     "wallet": "0x353Bf69715DdbF7A2b0C6Deba8EAC1F1D160c123",   // only fetchTrades
        //     "expected_rebate": "0",                                   // only fetchTrades
        //     "extra_fee": "0",                                         // only fetchTrades
        // }
        //
        const marketId = this.safeString (trade, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const fee = {
            'currency': 'USDC',
            'cost': this.safeString (trade, 'trade_fee'),
        };
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'trade_id'),
            'order': this.safeString (trade, 'order_id'),
            'symbol': symbol,
            'side': this.safeStringLower (trade, 'direction'),
            'type': undefined,
            'takerOrMaker': this.safeString (trade, 'liquidity_role'),
            'price': this.safeString (trade, 'trade_price'),
            'amount': this.safeString (trade, 'trade_amount'),
            'cost': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name derive#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<FundingRateHistory[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_name': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        const paramsOmitted: Dict = this.omit (params, [ 'until' ]);
        if (until !== undefined) {
            request['end_timestamp'] = until; // the venue silently ignores the to_timestamp spelling other endpoints use
        }
        const response = await this.publicPostGetFundingRateHistory (this.extend (request, paramsOmitted));
        //
        // {
        //     "result": {
        //         "funding_rate_history": [
        //             {
        //                 "timestamp": 1736215200000,
        //                 "funding_rate": "-0.000020014"
        //             }
        //         ]
        //     },
        //     "id": "3200ab8d-0080-42f0-8517-c13e3d9201d8"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const data: Dict[] = this.safeList (result, 'funding_rate_history', []);
        const rates: List = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'timestamp');
            rates.push ({
                'info': entry,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, this.safeString (market, 'symbol'), since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name derive#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        const response = await this.fetchFundingRateHistory (symbol, undefined, 1, params);
        //
        // [
        //     {
        //         "info": {
        //             "timestamp": 1736157600000,
        //             "funding_rate": "-0.000008872"
        //         },
        //         "symbol": "BTC/USD:USDC",
        //         "fundingRate": -0.000008872,
        //         "timestamp": 1736157600000,
        //         "datetime": "2025-01-06T10:00:00.000Z"
        //     }
        // ]
        //
        const data = this.safeDict (response, 0);
        return this.parseFundingRate (data);
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        const symbol = this.safeString (contract, 'symbol');
        const fundingTimestamp = this.safeInteger (contract, 'timestamp');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': fundingTimestamp,
            'fundingDatetime': this.iso8601 (fundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    hashOrderMessage (order: any) {
        const accountHash = this.hash (this.ethAbiEncode ([
            'bytes32', 'uint256', 'uint256', 'address', 'bytes32', 'uint256', 'address', 'address',
        ], order), keccak, 'binary');
        const sandboxMode = this.safeBool (this.options, 'sandboxMode', false);
        // EIP712Domain (name "Matching", version "1.0", verifyingContract 0xeB8d770ec18DB98Db922E9D83260A585b9F0DeAD) precomputed for chainId 1 (mainnet) and 11155111 (sepolia testnet)
        let DOMAIN_SEPARATOR: Str = 'da616dfabb88681b08e1592820a41d55ddc62d68de110e327ae99d734506fe19';
        if (sandboxMode === true) {
            DOMAIN_SEPARATOR = '24d674cd5f2b9d564691c51e9d88f649b99246a2244dd74ce27b96578d773e85';
        }
        const binaryDomainSeparator = this.base16ToBinary (DOMAIN_SEPARATOR);
        const prefix = this.base16ToBinary ('1901');
        return this.hash (this.binaryConcat (prefix, binaryDomainSeparator, accountHash), keccak, 'hex');
    }

    signOrder (order: any, privateKey: string): string {
        const hashOrder = this.hashOrderMessage (order);
        return this.signHash (hashOrder.slice (-64), privateKey.slice (-64));
    }

    /**
     * @method
     * @ignore
     * @name derive#nonceString
     * @description returns a unique nanosecond-scale action nonce as a decimal string; v3 requires UTC timestamps in nanoseconds (~19 digits), which overflow double precision, so the millisecond timestamp from incrementingNonce is concatenated with a random 6-digit suffix (the venue accepts string nonces)
     * @returns {string} a nanosecond-scale nonce as a decimal string
     */
    nonceString (): string {
        // incrementingNonce guarantees unique milliseconds within one instance; the result matches the official derive-ts client nonce format (error 11017 = duplicate nonce)
        const milliseconds = this.numberToString (this.incrementingNonce ());
        const suffix = this.numberToString (this.randNumber (6)); // guards against collisions of different instances with the same wallet
        const padded = suffix.padStart (6, '0');
        return milliseconds + padded;
    }

    hashMessage (message: any) {
        const binaryMessage = this.encode (message);
        const binaryMessageLength = this.binaryLength (binaryMessage);
        const x19 = this.base16ToBinary ('19');
        const newline = this.base16ToBinary ('0a');
        const prefix = this.binaryConcat (x19, this.encode ('Ethereum Signed Message:'), newline, this.encode (this.numberToString (binaryMessageLength)));
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash: string, privateKey: string): string {
        this.checkRequiredCredentials ();
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16 (this.sum (27, signature['v']));
        return '0x' + r.padStart (64, '0') + s.padStart (64, '0') + v;
    }

    signMessage (message: any, privateKey: string): string {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    parseUnits (num: string, dec: string = '1000000000000000000'): Str {
        return Precise.stringMul (num, dec);
    }

    /**
     * @method
     * @name derive#createOrder
     * @description create a trade order
     * @see https://docs.derive.xyz/api-reference/orderbook/privateorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {float} [params.triggerPrice] the price a standalone trigger (stop) order is triggered at
     * @param {float} [params.stopLossPrice] the price a standalone stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price a standalone take profit order is triggered at
     * @param {string} [params.trigger_price_type] the price type the trigger watches, only 'mark' is supported by the venue (default)
     * @param {bool} [params.postOnly] true makes the order post only
     * @param {bool} [params.reduceOnly] true reduces the position only, not available with post only
     * @param {float} [params.max_fee] *required* the maximum fee you are willing to pay for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument');
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('createOrder', params);
        const test = this.safeBool (paramsDeriveSubaccountId, 'test', false);
        const reduceOnly = this.safeBool2 (paramsDeriveSubaccountId, 'reduceOnly', 'reduce_only');
        const timeInForce = this.safeStringLower2 (paramsDeriveSubaccountId, 'timeInForce', 'time_in_force');
        const postOnly = this.safeBool (paramsDeriveSubaccountId, 'postOnly');
        const orderType = type.toLowerCase ();
        const orderSide = (side as string).toLowerCase ();
        const orderSideIsBuy = (orderSide === 'buy'); // extracted to a named local: the Rust transpiler can't lower a bare `===` bool inside a list literal (ethAbiEncode args)
        const nonce = this.nonceString ();
        // Order signature expiry must be between 2592000 and 7776000 sec from now
        const signatureExpiry = this.safeInteger (paramsDeriveSubaccountId, 'signature_expiry_sec', this.seconds () + 7776000);
        const ACTION_TYPEHASH = this.base16ToBinary ('4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17');
        const TRADE_MODULE_ADDRESS: Str = '0xB8D20c2B7a1Ad2EE33Bc50eF10876eD3035b5e7b'; // shared across mainnet and testnet in v3
        const priceString = this.numberToString (price);
        let maxFee: Num = undefined;
        let paramsMaxFee: Dict = {};
        [ maxFee, paramsMaxFee ] = this.handleOptionAndParams (paramsDeriveSubaccountId, 'createOrder', 'max_fee');
        if (maxFee === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a max_fee argument in params');
        }
        const maxFeeString = this.numberToString (maxFee);
        const amountString = this.numberToString (amount);
        const tradeModuleDataHash = this.hash (this.ethAbiEncode ([
            'address', 'uint', 'int', 'int', 'uint', 'uint', 'bool',
        ], [
            market['info']['base_asset_address'],
            this.convertToBigInt (market['info']['base_asset_sub_id']), // options carry a huge encoded sub_id that overflows double precision, so it must stay integral
            this.convertToBigInt ((this.parseUnits (priceString) as string)),
            this.convertToBigInt ((this.parseUnits ((this.amountToPrecision (symbol, amountString) as string)) as string)),
            this.convertToBigInt ((this.parseUnits (maxFeeString) as string)),
            subaccountId,
            orderSideIsBuy,
        ]), keccak, 'binary');
        const [ deriveWalletAddress, paramsDeriveWalletAddress ] = this.handleDeriveWalletAddress ('createOrder', paramsMaxFee);
        const signature = this.signOrder ([
            ACTION_TYPEHASH,
            subaccountId,
            this.convertToBigInt (nonce),
            TRADE_MODULE_ADDRESS,
            tradeModuleDataHash,
            signatureExpiry,
            deriveWalletAddress,
            this.walletAddress,
        ], this.privateKey);
        const request: Dict = {
            'instrument_name': market['id'],
            'direction': orderSide,
            'order_type': orderType,
            'nonce': nonce,
            'amount': amountString,
            'limit_price': priceString,
            'max_fee': maxFeeString,
            'subaccount_id': subaccountId,
            'signature_expiry_sec': signatureExpiry,
            'referral_code': this.safeString (this.options, 'id', '0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749'),
            'signer': this.walletAddress,
        };
        if (reduceOnly !== undefined) {
            request['reduce_only'] = reduceOnly;
            if (reduceOnly && (postOnly === true)) {
                throw new InvalidOrder (this.id + ' cannot use reduce only with post only time in force');
            }
        }
        if (postOnly !== undefined) {
            request['time_in_force'] = 'post_only';
        } else if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        // the venue supports exactly two standalone conditional kinds: 'stoploss' triggers on adverse crossing (the classic stop semantics, so both triggerPrice and stopLossPrice map onto it) and 'takeprofit' triggers on the favorable one; attached stop loss / take profit are not supported
        const triggerPrice = this.safeStringN (paramsDeriveWalletAddress, [ 'triggerPrice', 'stopPrice', 'trigger_price' ]);
        const stopLossPrice = this.safeString (paramsDeriveWalletAddress, 'stopLossPrice');
        const takeProfitPrice = this.safeString (paramsDeriveWalletAddress, 'takeProfitPrice');
        if ((takeProfitPrice !== undefined) && ((triggerPrice !== undefined) || (stopLossPrice !== undefined))) {
            throw new InvalidOrder (this.id + ' createOrder() accepts only one of triggerPrice, stopLossPrice or takeProfitPrice');
        }
        const triggerPriceType = this.safeString (paramsDeriveWalletAddress, 'trigger_price_type', 'mark');
        const stopPrice = (triggerPrice !== undefined) ? triggerPrice : stopLossPrice;
        if (stopPrice !== undefined) {
            request['trigger_price'] = stopPrice;
            request['trigger_type'] = 'stoploss';
            request['trigger_price_type'] = triggerPriceType;
        } else if (takeProfitPrice !== undefined) {
            request['trigger_price'] = takeProfitPrice;
            request['trigger_type'] = 'takeprofit';
            request['trigger_price_type'] = triggerPriceType;
        }
        const clientOrderId = this.safeString (paramsDeriveWalletAddress, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        }
        request['signature'] = signature;
        const paramsOmitted = this.omit (paramsDeriveWalletAddress, [ 'reduceOnly', 'reduce_only', 'timeInForce', 'time_in_force', 'postOnly', 'test', 'clientOrderId', 'stopPrice', 'triggerPrice', 'trigger_price', 'stopLossPrice', 'takeProfitPrice', 'trigger_price_type' ]);
        let response: Dict;
        if (test === true) {
            response = await this.privatePostOrderDebug (this.extend (request, paramsOmitted));
        } else {
            response = await this.privatePostOrder (this.extend (request, paramsOmitted));
        }
        //
        //     {
        //         "id": "dd0fe5ec-043c-41ab-95e1-fc2421c6fc10",
        //         "result": {
        //             "order": {
        //                 "subaccount_id": 86815,
        //                 "order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "buy",
        //                 "label": "",
        //                 "quote_id": null,
        //                 "amount": "0.01",
        //                 "average_price": "0",
        //                 "cancel_reason": "",
        //                 "creation_timestamp": 1790871618199,
        //                 "filled_amount": "0",
        //                 "is_transfer": false,
        //                 "last_update_timestamp": 1790871618199,
        //                 "limit_price": "83000",
        //                 "signed_limit_price": null,
        //                 "max_fee": "100",
        //                 "mmp": false,
        //                 "nonce": "1790871617137835612",
        //                 "order_fee": "0",
        //                 "order_status": "open",
        //                 "order_type": "limit",
        //                 "replaced_order_id": null,
        //                 "signature": "0x55412a2a39e2dd70b0c39ea03859ac499b5c500756b46197900a413f7bfd294e0adb8c2c5eec467b4c83ef75f7068b528e21044cdd27faa47a6db475461641c21b",
        //                 "signature_expiry_sec": 1798647617,
        //                 "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                 "time_in_force": "gtc",
        //                 "trigger_type": null,
        //                 "trigger_price": null,
        //                 "trigger_price_type": null,
        //                 "trigger_reject_message": null,
        //                 "extra_fee": "0",
        //                 "algo_type": null,
        //                 "algo_duration_sec": null,
        //                 "algo_num_slices": null,
        //                 "algo_slices_completed": null
        //             },
        //             "trades": []
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result');
        let rawOrder = this.safeDict (result, 'raw_data');
        if (rawOrder === undefined) {
            rawOrder = this.safeDict (result, 'order', {});
        }
        const order = this.parseOrder (rawOrder, market);
        order['type'] = type;
        return order;
    }

    /**
     * @method
     * @name derive#editOrder
     * @description edit a trade order
     * @see https://docs.derive.xyz/api-reference/orderbook/privatereplace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params: Dict = {}) {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('editOrder', params);
        const reduceOnly = this.safeBool2 (paramsDeriveSubaccountId, 'reduceOnly', 'reduce_only');
        const timeInForce = this.safeStringLower2 (paramsDeriveSubaccountId, 'timeInForce', 'time_in_force');
        const postOnly = this.safeBool (paramsDeriveSubaccountId, 'postOnly');
        const orderType = type.toLowerCase ();
        const orderSide = (side as string).toLowerCase ();
        const orderSideIsBuy = (orderSide === 'buy'); // extracted to a named local: the Rust transpiler can't lower a bare `===` bool inside a list literal (ethAbiEncode args)
        const nonce = this.nonceString ();
        const signatureExpiry = this.safeNumber (paramsDeriveSubaccountId, 'signature_expiry_sec', this.seconds () + 7776000);
        const ACTION_TYPEHASH = this.base16ToBinary ('4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17');
        const TRADE_MODULE_ADDRESS: Str = '0xB8D20c2B7a1Ad2EE33Bc50eF10876eD3035b5e7b'; // shared across mainnet and testnet in v3
        const priceString = this.numberToString (price) as string;
        const maxFeeString = this.safeString (paramsDeriveSubaccountId, 'max_fee', '0');
        const amountString = this.numberToString (amount);
        const tradeModuleDataHash = this.hash (this.ethAbiEncode ([
            'address', 'uint', 'int', 'int', 'uint', 'uint', 'bool',
        ], [
            market['info']['base_asset_address'],
            this.convertToBigInt (market['info']['base_asset_sub_id']), // options carry a huge encoded sub_id that overflows double precision, so it must stay integral
            this.convertToBigInt ((this.parseUnits (priceString) as string)),
            this.convertToBigInt ((this.parseUnits ((this.amountToPrecision (symbol, amountString) as string)) as string)),
            this.convertToBigInt ((this.parseUnits (maxFeeString) as string)),
            subaccountId,
            orderSideIsBuy,
        ]), keccak, 'binary');
        const [ deriveWalletAddress, paramsDeriveWalletAddress ] = this.handleDeriveWalletAddress ('editOrder', paramsDeriveSubaccountId);
        const signature = this.signOrder ([
            ACTION_TYPEHASH,
            subaccountId,
            this.convertToBigInt (nonce),
            TRADE_MODULE_ADDRESS,
            tradeModuleDataHash,
            signatureExpiry,
            deriveWalletAddress,
            this.walletAddress,
        ], this.privateKey);
        const request: Dict = {
            'instrument_name': market['id'],
            'order_id_to_cancel': id,
            'direction': orderSide,
            'order_type': orderType,
            'nonce': nonce,
            'amount': amountString,
            'limit_price': priceString,
            'max_fee': maxFeeString,
            'subaccount_id': subaccountId,
            'signature_expiry_sec': signatureExpiry,
            'signer': this.walletAddress,
        };
        if (reduceOnly !== undefined) {
            request['reduce_only'] = reduceOnly;
            if (reduceOnly && (postOnly === true)) {
                throw new InvalidOrder (this.id + ' cannot use reduce only with post only time in force');
            }
        }
        if (postOnly !== undefined) {
            request['time_in_force'] = 'post_only';
        } else if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        const clientOrderId = this.safeString (paramsDeriveWalletAddress, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['label'] = clientOrderId;
        }
        request['signature'] = signature;
        const paramsOmitted = this.omit (paramsDeriveWalletAddress, [ 'reduceOnly', 'reduce_only', 'timeInForce', 'time_in_force', 'postOnly', 'clientOrderId' ]);
        const response = await this.privatePostReplace (this.extend (request, paramsOmitted));
        //
        //     {
        //         "id": "bdeaa36f-5eae-4193-a1d2-81fb7f0dfd9d",
        //         "result": {
        //             "cancelled_order": {
        //                 "subaccount_id": 86815,
        //                 "order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "buy",
        //                 "label": "",
        //                 "quote_id": null,
        //                 "amount": "0.01",
        //                 "average_price": "0",
        //                 "cancel_reason": "user_request",
        //                 "creation_timestamp": 1790871618199,
        //                 "filled_amount": "0",
        //                 "is_transfer": false,
        //                 "last_update_timestamp": 1790871630849,
        //                 "limit_price": "83000",
        //                 "signed_limit_price": null,
        //                 "max_fee": "100",
        //                 "mmp": false,
        //                 "nonce": "1790871617137835612",
        //                 "order_fee": "0",
        //                 "order_status": "cancelled",
        //                 "order_type": "limit",
        //                 "replaced_order_id": null,
        //                 "signature": "0x55412a2a39e2dd70b0c39ea03859ac499b5c500756b46197900a413f7bfd294e0adb8c2c5eec467b4c83ef75f7068b528e21044cdd27faa47a6db475461641c21b",
        //                 "signature_expiry_sec": 1798647617,
        //                 "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                 "time_in_force": "gtc",
        //                 "trigger_type": null,
        //                 "trigger_price": null,
        //                 "trigger_price_type": null,
        //                 "trigger_reject_message": null,
        //                 "extra_fee": "0",
        //                 "algo_type": null,
        //                 "algo_duration_sec": null,
        //                 "algo_num_slices": null,
        //                 "algo_slices_completed": null
        //             },
        //             "order": {
        //                 "subaccount_id": 86815,
        //                 "order_id": "af3f3ec2-eab8-4929-bd50-8ce1657f9e93",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "buy",
        //                 "label": "",
        //                 "quote_id": null,
        //                 "amount": "0.01",
        //                 "average_price": "0",
        //                 "cancel_reason": "",
        //                 "creation_timestamp": 1790871630849,
        //                 "filled_amount": "0",
        //                 "is_transfer": false,
        //                 "last_update_timestamp": 1790871630849,
        //                 "limit_price": "83500",
        //                 "signed_limit_price": null,
        //                 "max_fee": "100",
        //                 "mmp": false,
        //                 "nonce": "1790871630331176421",
        //                 "order_fee": "0",
        //                 "order_status": "open",
        //                 "order_type": "limit",
        //                 "replaced_order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //                 "signature": "0x0c8ae3bebd23b1e303b49dd60eb34a5c96ccd450ea9f37536f30d7fa07322980569e4e691e90673a9a8db27b253cf00026ea813034ad2f5e22e2db727cb42faa1c",
        //                 "signature_expiry_sec": 1798647630,
        //                 "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                 "time_in_force": "gtc",
        //                 "trigger_type": null,
        //                 "trigger_price": null,
        //                 "trigger_price_type": null,
        //                 "trigger_reject_message": null,
        //                 "extra_fee": "0",
        //                 "algo_type": null,
        //                 "algo_duration_sec": null,
        //                 "algo_num_slices": null,
        //                 "algo_slices_completed": null
        //             },
        //             "trades": [],
        //             "create_order_error": null
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result');
        const rawOrder = this.safeDict (result, 'order', {});
        const order = this.parseOrder (rawOrder, market);
        return order;
    }

    /**
     * @method
     * @name derive#cancelOrder
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market: Market = this.market (symbol);
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('cancelOrder', params);
        const paramsOmitted: Dict = this.omit (paramsDeriveSubaccountId, [ 'trigger', 'stop' ]);
        const request: Dict = {
            'instrument_name': market['id'],
            'subaccount_id': subaccountId,
        };
        const clientOrderIdUnified = this.safeString (paramsOmitted, 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString (paramsOmitted, 'label', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response: Dict;
        if (isByClientOrder) {
            request['label'] = clientOrderIdExchangeSpecific;
            const paramsLabel: Dict = this.omit (paramsOmitted, [ 'clientOrderId', 'label' ]);
            response = await this.privatePostCancelByLabel (this.extend (request, paramsLabel));
        } else {
            request['order_id'] = id;
            if (isTrigger === true) {
                response = await this.privatePostCancelTriggerOrder (this.extend (request, paramsOmitted));
            } else {
                response = await this.privatePostCancel (this.extend (request, paramsOmitted));
            }
        }
        //
        //     {
        //         "id": "1765272a-2d4d-4761-8e05-64061d64dc9c",
        //         "result": {
        //             "subaccount_id": 86815,
        //             "order_id": "af3f3ec2-eab8-4929-bd50-8ce1657f9e93",
        //             "instrument_name": "BTC-PERP",
        //             "direction": "buy",
        //             "label": "",
        //             "quote_id": null,
        //             "amount": "0.01",
        //             "average_price": "0",
        //             "cancel_reason": "user_request",
        //             "creation_timestamp": 1790871630849,
        //             "filled_amount": "0",
        //             "is_transfer": false,
        //             "last_update_timestamp": 1790871644913,
        //             "limit_price": "83500",
        //             "signed_limit_price": null,
        //             "max_fee": "100",
        //             "mmp": false,
        //             "nonce": "1790871630331176421",
        //             "order_fee": "0",
        //             "order_status": "cancelled",
        //             "order_type": "limit",
        //             "replaced_order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //             "signature": "0x0c8ae3bebd23b1e303b49dd60eb34a5c96ccd450ea9f37536f30d7fa07322980569e4e691e90673a9a8db27b253cf00026ea813034ad2f5e22e2db727cb42faa1c",
        //             "signature_expiry_sec": 1798647630,
        //             "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //             "time_in_force": "gtc",
        //             "trigger_type": null,
        //             "trigger_price": null,
        //             "trigger_price_type": null,
        //             "trigger_reject_message": null,
        //             "extra_fee": "0",
        //             "algo_type": null,
        //             "algo_duration_sec": null,
        //             "algo_num_slices": null,
        //             "algo_slices_completed": null
        //         }
        //     }
        //
        const extendParams: Dict = { 'symbol': symbol };
        const order = this.safeDict (response, 'result', {});
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        }
        return this.extend (this.parseOrder (order, market), extendParams) as Order;
    }

    /**
     * @method
     * @name derive#cancelAllOrders
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel_by_instrument
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel_all
     * @description cancel all open orders in a market
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async cancelAllOrders (symbol: Str = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('cancelAllOrders', params);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let response: Dict;
        if (market !== undefined) {
            request['instrument_name'] = market['id'];
            response = await this.privatePostCancelByInstrument (this.extend (request, paramsDeriveSubaccountId));
        } else {
            response = await this.privatePostCancelAll (this.extend (request, paramsDeriveSubaccountId));
        }
        //
        // {
        //     "result": {
        //         "cancelled_orders": 0
        //     },
        //     "id": "9d633799-2098-4559-b547-605bb6f4d8f5"
        // }
        //
        // {
        //     "id": "45548646-c74f-4ca2-9de4-551e6de49afa",
        //     "result": "ok"
        // }
        //
        return [ this.safeOrder ({ 'info': response }) ];
    }

    /**
     * @method
     * @name derive#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user; only orders in a terminal state (filled, cancelled, expired) are returned, use fetchOpenOrders for orders resting on the order book
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ paginate, paramsPaginate ] = this.handleOptionBoolAndParams (params, 'fetchCanceledAndClosedOrders', 'paginate', false);
        if (paginate) {
            // paginate without a symbol: the venue cannot filter the order history by instrument, so an inner call filtering by symbol could return an empty page and stop the pagination loop prematurely
            const allOrders = await this.fetchPaginatedCallIncremental ('fetchCanceledAndClosedOrders', undefined, since, undefined, paramsPaginate, 'page', 500) as Order[];
            return this.filterBySymbolSinceLimit (allOrders, symbol, since, limit) as Order[];
        }
        const until = this.safeInteger (paramsPaginate, 'until');
        const paramsOmitted: Dict = this.omit (paramsPaginate, [ 'until' ]);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchCanceledAndClosedOrders', paramsOmitted);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        } else {
            request['page_size'] = 500;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        if (until !== undefined) {
            request['to_timestamp'] = until;
        }
        const response = await this.privatePostGetOrderHistory (this.extend (request, paramsDeriveSubaccountId));
        //
        //     {
        //         "id": "c55b1f4e-7263-4045-ac9f-158da9a97c5c",
        //         "result": {
        //             "subaccount_id": 86815,
        //             "orders": [
        //                 {
        //                     "subaccount_id": 86815,
        //                     "order_id": "af3f3ec2-eab8-4929-bd50-8ce1657f9e93",
        //                     "instrument_name": "BTC-PERP",
        //                     "direction": "buy",
        //                     "label": "",
        //                     "quote_id": null,
        //                     "amount": "0.01",
        //                     "average_price": "0",
        //                     "cancel_reason": "user_request",
        //                     "creation_timestamp": 1790871630849,
        //                     "filled_amount": "0",
        //                     "is_transfer": false,
        //                     "last_update_timestamp": 1790871644913,
        //                     "limit_price": "83500",
        //                     "signed_limit_price": null,
        //                     "max_fee": "100",
        //                     "mmp": false,
        //                     "nonce": "1790871630331176421",
        //                     "order_fee": "0",
        //                     "order_status": "cancelled",
        //                     "order_type": "limit",
        //                     "replaced_order_id": null,
        //                     "signature": "",
        //                     "signature_expiry_sec": 1798647630,
        //                     "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "time_in_force": "gtc",
        //                     "trigger_type": null,
        //                     "trigger_price": null,
        //                     "trigger_price_type": null,
        //                     "trigger_reject_message": null,
        //                     "extra_fee": "0",
        //                     "algo_type": null,
        //                     "algo_duration_sec": null,
        //                     "algo_num_slices": null,
        //                     "algo_slices_completed": null
        //                 }
        //             ],
        //             "pagination": {
        //                 "num_pages": 2,
        //                 "count": 6
        //             }
        //         }
        //     }
        //
        const data = this.safeDict (response, 'result');
        const page = this.safeInteger (paramsDeriveSubaccountId, 'page');
        if (page !== undefined) {
            const pagination = this.safeDict (data, 'pagination');
            const currentPage = this.safeInteger (pagination, 'num_pages', 0);
            if (page > currentPage) {
                return [];
            }
        }
        const orders: Dict[] = this.safeList (data, 'orders', []);
        const parsedOrders = this.parseOrders (orders, market);
        return this.filterBySymbolSinceLimit (parsedOrders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name derive#fetchOpenOrders
     * @description fetches information on all currently open orders of the user resting on the order book
     * @see https://docs.derive.xyz/api-reference/orderbook/privateget_open_orders
     * @see https://docs.derive.xyz/api-reference/orderbook/privateget_trigger_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] when true fetches the pending trigger orders that have not fired yet instead of the orders resting on the order book
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        const paramsOmitted: Dict = this.omit (params, [ 'trigger', 'stop' ]);
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchOpenOrders', paramsOmitted);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let response: Dict;
        if (isTrigger === true) {
            response = await this.privatePostGetTriggerOrders (this.extend (request, paramsDeriveSubaccountId));
        } else {
            response = await this.privatePostGetOpenOrders (this.extend (request, paramsDeriveSubaccountId));
        }
        //
        //     {
        //         "id": "aca80354-f6fe-4862-bbbd-7982f774914e",
        //         "result": {
        //             "subaccount_id": 86815,
        //             "orders": [
        //                 {
        //                     "subaccount_id": 86815,
        //                     "order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //                     "instrument_name": "BTC-PERP",
        //                     "direction": "buy",
        //                     "label": "",
        //                     "quote_id": null,
        //                     "amount": "0.01",
        //                     "average_price": "0",
        //                     "cancel_reason": "",
        //                     "creation_timestamp": 1790871618199,
        //                     "filled_amount": "0",
        //                     "is_transfer": false,
        //                     "last_update_timestamp": 1790871618199,
        //                     "limit_price": "83000",
        //                     "signed_limit_price": null,
        //                     "max_fee": "100",
        //                     "mmp": false,
        //                     "nonce": "1790871617137835612",
        //                     "order_fee": "0",
        //                     "order_status": "open",
        //                     "order_type": "limit",
        //                     "replaced_order_id": null,
        //                     "signature": "0x55412a2a39e2dd70b0c39ea03859ac499b5c500756b46197900a413f7bfd294e0adb8c2c5eec467b4c83ef75f7068b528e21044cdd27faa47a6db475461641c21b",
        //                     "signature_expiry_sec": 1798647617,
        //                     "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "time_in_force": "gtc",
        //                     "trigger_type": null,
        //                     "trigger_price": null,
        //                     "trigger_price_type": null,
        //                     "trigger_reject_message": null,
        //                     "extra_fee": "0",
        //                     "algo_type": null,
        //                     "algo_duration_sec": null,
        //                     "algo_num_slices": null,
        //                     "algo_slices_completed": null
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'result');
        const orders: Dict[] = this.safeList (data, 'orders', []);
        const parsedOrders = this.parseOrders (orders, market);
        return this.filterBySymbolSinceLimit (parsedOrders, symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name derive#fetchClosedOrders
     * @description fetches information on multiple closed (fully filled) orders made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name derive#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const orders = await this.fetchCanceledAndClosedOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'canceled') as Order[];
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'gtc': 'GTC',
            'post_only': 'PO',
        };
        return this.safeString (timeInForces, (timeInForce as string));
    }

    parseOrderStatus (status: Str) {
        if (status !== undefined) {
            const statuses: Dict = {
                'open': 'open',
                'untriggered': 'open',
                'filled': 'closed',
                'cancelled': 'canceled',
                'expired': 'rejected',
            };
            return this.safeString (statuses, status, status);
        }
        return undefined;
    }

    override parseOrder (rawOrder: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "subaccount_id": 86815,
        //         "order_id": "af3f3ec2-eab8-4929-bd50-8ce1657f9e93",
        //         "instrument_name": "BTC-PERP",
        //         "direction": "buy",
        //         "label": "",
        //         "quote_id": null,
        //         "amount": "0.01",
        //         "average_price": "0",
        //         "cancel_reason": "user_request",
        //         "creation_timestamp": 1790871630849,
        //         "filled_amount": "0",
        //         "is_transfer": false,
        //         "last_update_timestamp": 1790871644913,
        //         "limit_price": "83500",
        //         "signed_limit_price": null,
        //         "max_fee": "100",
        //         "mmp": false,
        //         "nonce": "1790871630331176421",
        //         "order_fee": "0",
        //         "order_status": "cancelled",
        //         "order_type": "limit",
        //         "replaced_order_id": "f690dfc9-5b9c-4f62-a2b0-3f6ba502f2f6",
        //         "signature": "0x0c8ae3bebd23b1e303b49dd60eb34a5c96ccd450ea9f37536f30d7fa07322980569e4e691e90673a9a8db27b253cf00026ea813034ad2f5e22e2db727cb42faa1c",
        //         "signature_expiry_sec": 1798647630,
        //         "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //         "time_in_force": "gtc",
        //         "trigger_type": null,
        //         "trigger_price": null,
        //         "trigger_price_type": null,
        //         "trigger_reject_message": null,
        //         "extra_fee": "0",
        //         "algo_type": null,
        //         "algo_duration_sec": null,
        //         "algo_num_slices": null,
        //         "algo_slices_completed": null
        //     }
        //
        let order = this.safeDict (rawOrder, 'data');
        if (order === undefined) {
            order = rawOrder;
        }
        const timestamp = this.safeInteger (rawOrder, 'creation_timestamp'); // the nonce is no longer a usable fallback: v3 nonces are nanosecond-scale values with a random suffix
        const orderId = this.safeString (order, 'order_id');
        const marketId = this.safeString (order, 'instrument_name');
        const marketResolved: Market = (marketId !== undefined) ? this.safeMarket (marketId, market) : market;
        const symbol = this.safeString (marketResolved, 'symbol');
        const price = this.safeString (order, 'limit_price');
        const average = this.safeString (order, 'average_price');
        const amount = this.safeString2 (order, 'amount', 'desired_amount'); // plain orders carry amount, the raw_data debug shape nests desired_amount
        const filled = this.safeString (order, 'filled_amount');
        const fee = this.safeString (order, 'order_fee');
        const orderType = this.safeStringLower (order, 'order_type');
        const isBid = this.safeBool (order, 'is_bid');
        let side = this.safeString (order, 'direction');
        if (side === undefined) {
            if (isBid === true) {
                side = 'buy';
            } else {
                side = 'sell';
            }
        }
        const triggerType = this.safeString (order, 'trigger_type');
        let stopLossPrice: Str = undefined;
        let takeProfitPrice: Str = undefined;
        let triggerPrice: Str = undefined;
        if (triggerType !== undefined) {
            triggerPrice = this.safeString (order, 'trigger_price');
            if (triggerType === 'stoploss') {
                stopLossPrice = triggerPrice;
            } else {
                takeProfitPrice = triggerPrice;
            }
        }
        const lastUpdateTimestamp = this.safeInteger (rawOrder, 'last_update_timestamp');
        const status = this.safeString (order, 'order_status');
        const timeInForce = this.safeString (order, 'time_in_force');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': this.safeString (order, 'label'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (timeInForce),
            'postOnly': undefined, // handled in safeOrder
            'reduceOnly': this.safeBool (order, 'reduce_only'),
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': fee,
                'currency': 'USDC',
            },
            'info': order,
        }, marketResolved);
    }

    /**
     * @method
     * @name derive#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.derive.xyz/api-reference/history/privateget_trade_history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchOrderTrades', params);
        const request: Dict = {
            'order_id': id,
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        const response = await this.privatePostGetTradeHistory (this.extend (request, paramsDeriveSubaccountId));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "trades": [
        //             {
        //                 "subaccount_id": 130837,
        //                 "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "sell",
        //                 "label": "test1234",
        //                 "quote_id": null,
        //                 "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //                 "timestamp": 1738065303708,
        //                 "mark_price": "102740.137375457314192317",
        //                 "index_price": "102741.553409299981533184",
        //                 "trade_price": "102700.6",
        //                 "trade_amount": "0.01",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "0",
        //                 "realized_pnl_excl_fees": "0",
        //                 "is_transfer": false,
        //                 "tx_status": "settled",
        //                 "trade_fee": "1.127415534092999815",
        //                 "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //                 "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d51bb"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a16f798c-a121-44e2-b77e-c38a063f8a99"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const trades: Dict[] = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit, paramsDeriveSubaccountId);
    }

    /**
     * @method
     * @name derive#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_trade_history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ paginate, paramsPaginate ] = this.handleOptionBoolAndParams (params, 'fetchMyTrades', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchMyTrades', symbol, since, limit, paramsPaginate, 'page', 500) as Trade[];
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchMyTrades', paramsPaginate);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['from_timestamp'] = since;
        }
        const response = await this.privatePostGetTradeHistory (this.extend (request, paramsDeriveSubaccountId));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "trades": [
        //             {
        //                 "subaccount_id": 130837,
        //                 "order_id": "30c48194-8d48-43ac-ad00-0d5ba29eddc9",
        //                 "instrument_name": "BTC-PERP",
        //                 "direction": "sell",
        //                 "label": "test1234",
        //                 "quote_id": null,
        //                 "trade_id": "f8a30740-488c-4c2d-905d-e17057bafde1",
        //                 "timestamp": 1738065303708,
        //                 "mark_price": "102740.137375457314192317",
        //                 "index_price": "102741.553409299981533184",
        //                 "trade_price": "102700.6",
        //                 "trade_amount": "0.01",
        //                 "liquidity_role": "taker",
        //                 "realized_pnl": "0",
        //                 "realized_pnl_excl_fees": "0",
        //                 "is_transfer": false,
        //                 "tx_status": "settled",
        //                 "trade_fee": "1.127415534092999815",
        //                 "tx_hash": "0xc55df1f07330faf86579bd8a6385391fbe9e73089301149d8550e9d29c9ead74",
        //                 "transaction_id": "e18b9426-3fa5-41bb-99d3-8b54fb4d51bb"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 1
        //         }
        //     },
        //     "id": "a16f798c-a121-44e2-b77e-c38a063f8a99"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const page = this.safeInteger (paramsDeriveSubaccountId, 'page');
        if (page !== undefined) {
            const pagination = this.safeDict (result, 'pagination');
            const currentPage = this.safeInteger (pagination, 'num_pages', 0);
            if (page > currentPage) {
                return [];
            }
        }
        const trades: Dict[] = this.safeList (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit, paramsDeriveSubaccountId);
    }

    /**
     * @method
     * @name derive#fetchPositions
     * @description fetch all open positions
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_positions
     * @param {string[]} [symbols] not used by fetchPositions ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchPositions', params);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        const paramsOmitted: Dict = this.omit (paramsDeriveSubaccountId, [ 'subaccount_id' ]);
        const response = await this.privatePostGetPositions (this.extend (request, paramsOmitted));
        //
        // {
        //     "result": {
        //         "subaccount_id": 130837,
        //         "positions": [
        //             {
        //                 "instrument_type": "perp",
        //                 "instrument_name": "BTC-PERP",
        //                 "amount": "-0.02",
        //                 "average_price": "102632.9105389869500088",
        //                 "realized_pnl": "0",
        //                 "unrealized_pnl": "-2.6455959784245548835819950103759765625",
        //                 "total_fees": "2.255789220260999824",
        //                 "average_price_excl_fees": "102745.7",
        //                 "realized_pnl_excl_fees": "0",
        //                 "unrealized_pnl_excl_fees": "-0.3898067581635550595819950103759765625",
        //                 "net_settlements": "-4.032902047219498639",
        //                 "cumulative_funding": "-0.004677736347850093",
        //                 "pending_funding": "0",
        //                 "mark_price": "102765.190337908177752979099750518798828125",
        //                 "index_price": "102767.657193800017641472",
        //                 "delta": "1",
        //                 "gamma": "0",
        //                 "vega": "0",
        //                 "theta": "0",
        //                 "mark_value": "1.38730606879471451975405216217041015625",
        //                 "maintenance_margin": "-101.37788426911356509663164615631103515625",
        //                 "initial_margin": "-132.2074413704858670826070010662078857421875",
        //                 "open_orders_margin": "264.116085900726830004714429378509521484375",
        //                 "leverage": "8.6954476205089299495699106539379941746377322586618",
        //                 "liquidation_price": "109125.705451984322280623018741607666015625",
        //                 "creation_timestamp": 1738065303840
        //             }
        //         ]
        //     },
        //     "id": "167350f1-d9fc-41d4-9797-1c78f83fda8e"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const positions: Dict[] = this.safeList (result, 'positions', []);
        return this.parsePositions (positions, symbols);
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        // {
        //     "instrument_type": "perp",
        //     "instrument_name": "BTC-PERP",
        //     "amount": "-0.02",
        //     "average_price": "102632.9105389869500088",
        //     "realized_pnl": "0",
        //     "unrealized_pnl": "-2.6455959784245548835819950103759765625",
        //     "total_fees": "2.255789220260999824",
        //     "average_price_excl_fees": "102745.7",
        //     "realized_pnl_excl_fees": "0",
        //     "unrealized_pnl_excl_fees": "-0.3898067581635550595819950103759765625",
        //     "net_settlements": "-4.032902047219498639",
        //     "cumulative_funding": "-0.004677736347850093",
        //     "pending_funding": "0",
        //     "mark_price": "102765.190337908177752979099750518798828125",
        //     "index_price": "102767.657193800017641472",
        //     "delta": "1",
        //     "gamma": "0",
        //     "vega": "0",
        //     "theta": "0",
        //     "mark_value": "1.38730606879471451975405216217041015625",
        //     "maintenance_margin": "-101.37788426911356509663164615631103515625",
        //     "initial_margin": "-132.2074413704858670826070010662078857421875",
        //     "open_orders_margin": "264.116085900726830004714429378509521484375",
        //     "leverage": "8.6954476205089299495699106539379941746377322586618",
        //     "liquidation_price": "109125.705451984322280623018741607666015625",
        //     "creation_timestamp": 1738065303840
        // }
        //
        const contract = this.safeString (position, 'instrument_name');
        const marketResolved: Market = this.safeMarket (contract, market);
        let size = this.safeString (position, 'amount');
        let side: Str = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else {
            side = 'short';
        }
        const contractSize = this.safeString (marketResolved, 'contractSize');
        const markPrice = this.safeString (position, 'mark_price');
        const timestamp = this.safeInteger (position, 'creation_timestamp');
        const unrealisedPnl = this.safeString (position, 'unrealized_pnl');
        size = Precise.stringAbs (size);
        const notional = Precise.stringMul (size, markPrice);
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeString (marketResolved, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.safeNumber (position, 'initial_margin'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.safeNumber (position, 'maintenance_margin'),
            'maintenanceMarginPercentage': undefined,
            'entryPrice': undefined,
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),
            'contractSize': this.parseNumber (contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidation_price'),
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name derive#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.derive.xyz/api-reference/history/privateget_funding_history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    override async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<FundingHistory[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ paginate, paramsPaginate ] = this.handleOptionBoolAndParams (params, 'fetchFundingHistory', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallIncremental ('fetchFundingHistory', symbol, since, limit, paramsPaginate, 'page', 500) as FundingHistory[];
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchFundingHistory', paramsPaginate);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_name'] = market['id'];
        }
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const until = this.safeInteger (paramsDeriveSubaccountId, 'until');
        const paramsOmitted: Dict = this.omit (paramsDeriveSubaccountId, [ 'until' ]);
        if (until !== undefined) {
            request['end_timestamp'] = until;
        }
        const response = await this.privatePostGetFundingHistory (this.extend (request, paramsOmitted));
        //
        // {
        //     "result": {
        //         "events": [
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738066618272,
        //                 "funding": "-0.004677736347850093",
        //                 "pnl": "-0.944081615774632967"
        //             },
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738066617964,
        //                 "funding": "0",
        //                 "pnl": "-0.437556413479249408"
        //             },
        //             {
        //                 "instrument_name": "BTC-PERP",
        //                 "timestamp": 1738065307565,
        //                 "funding": "0",
        //                 "pnl": "-0.39547479770461644"
        //             }
        //         ],
        //         "pagination": {
        //             "num_pages": 1,
        //             "count": 3
        //         }
        //     },
        //     "id": "524b817f-2108-467f-8795-511066f4acec"
        // }
        //
        const result = this.safeDict (response, 'result', {});
        const page = this.safeInteger (paramsDeriveSubaccountId, 'page');
        if (page !== undefined) {
            const pagination = this.safeDict (result, 'pagination');
            const currentPage = this.safeInteger (pagination, 'num_pages', 0);
            if (page > currentPage) {
                return [];
            }
        }
        const events: Dict[] = this.safeList (result, 'events', []);
        return this.parseIncomes (events, market, since, limit);
    }

    override parseIncome (income: Dict, market: Market = undefined): Dict {
        //
        // {
        //     "instrument_name": "BTC-PERP",
        //     "timestamp": 1738065307565,
        //     "funding": "0",
        //     "pnl": "-0.39547479770461644"
        // }
        //
        const marketId = this.safeString (income, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const rate = this.safeString (income, 'funding');
        const code = this.safeCurrencyCode ('USDC');
        const timestamp = this.safeInteger (income, 'timestamp');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'amount': undefined,
            'rate': rate,
        };
    }

    /**
     * @method
     * @name derive#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_all_portfolios
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ deriveWalletAddress, paramsDeriveWalletAddress ] = this.handleDeriveWalletAddress ('fetchBalance', params);
        const request: Dict = {
            'wallet': deriveWalletAddress,
        };
        const response = await this.privatePostGetAllPortfolios (this.extend (request, paramsDeriveWalletAddress));
        //
        //     {
        //         "id": "eb40a04b-167e-4a3f-b142-63f76e0e2a31",
        //         "result": [
        //             {
        //                 "subaccount_id": 86815,
        //                 "failed_to_fetch": false,
        //                 "manager_id": 1,
        //                 "risk_universe_id": 1,
        //                 "label": "",
        //                 "currency": [
        //                     "AUSD",
        //                     "BTC",
        //                     "CBBTC",
        //                     "DRV",
        //                     "ETH",
        //                     "FXUSDC",
        //                     "HEMIBTC",
        //                     "LBTC",
        //                     "SC_USDC_2",
        //                     "SC_USDT_2",
        //                     "SFP",
        //                     "SUSDE",
        //                     "USDC",
        //                     "USDE",
        //                     "USDT",
        //                     "WBTC",
        //                     "WEETH",
        //                     "WSTETH"
        //                 ],
        //                 "margin_type": "SM",
        //                 "is_under_liquidation": false,
        //                 "positions_value": "1466.712032105876",
        //                 "collaterals_value": "4527.545377437385",
        //                 "subaccount_value": "5994.257409543261",
        //                 "mm_credits": "0",
        //                 "positions_maintenance_margin": "-42.257371387251",
        //                 "positions_initial_margin": "-55.755494300332",
        //                 "collaterals_maintenance_margin": "4527.545388020506",
        //                 "collaterals_initial_margin": "4527.545388020506",
        //                 "maintenance_margin": "4485.288016633255",
        //                 "initial_margin": "4471.789893720174",
        //                 "open_orders_margin": "-1305.403225577642",
        //                 "projected_margin_change": "0",
        //                 "open_orders": [
        //                     {
        //                         "subaccount_id": 86815,
        //                         "order_id": "dbc70689-dcc4-43d3-9d95-492a6c165bde",
        //                         "instrument_name": "LBTC-USDC",
        //                         "direction": "buy",
        //                         "label": "",
        //                         "quote_id": null,
        //                         "amount": "0.002",
        //                         "average_price": "0",
        //                         "cancel_reason": "",
        //                         "creation_timestamp": 1790874519896,
        //                         "filled_amount": "0",
        //                         "is_transfer": false,
        //                         "last_update_timestamp": 1790874519896,
        //                         "limit_price": "82000",
        //                         "signed_limit_price": null,
        //                         "max_fee": "300",
        //                         "mmp": false,
        //                         "nonce": "1790874518872109498",
        //                         "order_fee": "0",
        //                         "order_status": "open",
        //                         "order_type": "limit",
        //                         "replaced_order_id": null,
        //                         "signature": "0x089fcff0654a15babcc7e7c256ab500dcee78beb3eb1963c102d7d53e233d2521ee0754fd1fa17c403a4aa9028c00f7ab5cd3d260a3136d84b617ad97e72d2c71c",
        //                         "signature_expiry_sec": 1798650518,
        //                         "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                         "time_in_force": "gtc",
        //                         "trigger_type": null,
        //                         "trigger_price": null,
        //                         "trigger_price_type": null,
        //                         "trigger_reject_message": null,
        //                         "extra_fee": "0",
        //                         "algo_type": null,
        //                         "algo_duration_sec": null,
        //                         "algo_num_slices": null,
        //                         "algo_slices_completed": null
        //                     },
        //                     {
        //                         "subaccount_id": 86815,
        //                         "order_id": "c33e2299-e60e-4d71-8910-15cd5ea43fef",
        //                         "instrument_name": "BTC-20270924-85000-C",
        //                         "direction": "buy",
        //                         "label": "",
        //                         "quote_id": null,
        //                         "amount": "0.1",
        //                         "average_price": "0",
        //                         "cancel_reason": "",
        //                         "creation_timestamp": 1790874524730,
        //                         "filled_amount": "0",
        //                         "is_transfer": false,
        //                         "last_update_timestamp": 1790874524730,
        //                         "limit_price": "12000",
        //                         "signed_limit_price": null,
        //                         "max_fee": "300",
        //                         "mmp": false,
        //                         "nonce": "1790874524124508650",
        //                         "order_fee": "0",
        //                         "order_status": "open",
        //                         "order_type": "limit",
        //                         "replaced_order_id": null,
        //                         "signature": "0x74bb9bc53c590985a916acf0e39d14f264e06105ca008c1e94935cb643741978084e05b7b4d3afa894d763d5c7abe038c58fed6c8b0a899dbeb5d0a2f3b50c8e1c",
        //                         "signature_expiry_sec": 1798650524,
        //                         "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                         "time_in_force": "gtc",
        //                         "trigger_type": null,
        //                         "trigger_price": null,
        //                         "trigger_price_type": null,
        //                         "trigger_reject_message": null,
        //                         "extra_fee": "0",
        //                         "algo_type": null,
        //                         "algo_duration_sec": null,
        //                         "algo_num_slices": null,
        //                         "algo_slices_completed": null
        //                     },
        //                     {
        //                         "subaccount_id": 86815,
        //                         "order_id": "1625ce89-9cf3-4ec0-8a6c-e208b49e5830",
        //                         "instrument_name": "BTC-PERP",
        //                         "direction": "buy",
        //                         "label": "",
        //                         "quote_id": null,
        //                         "amount": "0.01",
        //                         "average_price": "0",
        //                         "cancel_reason": "",
        //                         "creation_timestamp": 1790874522225,
        //                         "filled_amount": "0",
        //                         "is_transfer": false,
        //                         "last_update_timestamp": 1790874522225,
        //                         "limit_price": "83000",
        //                         "signed_limit_price": null,
        //                         "max_fee": "100",
        //                         "mmp": false,
        //                         "nonce": "1790874521734002365",
        //                         "order_fee": "0",
        //                         "order_status": "open",
        //                         "order_type": "limit",
        //                         "replaced_order_id": null,
        //                         "signature": "0x5005d1696341bc1a5bc1ddd9f1312343439cdef792767f0ecc823e43af809480060b1deea0f51e4827899c3766b672d4eb0d4038394d153f8b0a2cd68d3bfe5a1c",
        //                         "signature_expiry_sec": 1798650521,
        //                         "signer": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                         "time_in_force": "gtc",
        //                         "trigger_type": null,
        //                         "trigger_price": null,
        //                         "trigger_price_type": null,
        //                         "trigger_reject_message": null,
        //                         "extra_fee": "0",
        //                         "algo_type": null,
        //                         "algo_duration_sec": null,
        //                         "algo_num_slices": null,
        //                         "algo_slices_completed": null
        //                     }
        //                 ],
        //                 "positions": [
        //                     {
        //                         "instrument_type": "perp",
        //                         "instrument_name": "BTC-PERP",
        //                         "amount": "0.01",
        //                         "average_price": "84438.4183362967",
        //                         "average_price_excl_fees": "84412.1",
        //                         "mark_price": "84372.319949036835",
        //                         "index_price": "84363.26788266873",
        //                         "mark_value": "-0.075737406633",
        //                         "amount_step": "0.0001",
        //                         "creation_timestamp": 0,
        //                         "cumulative_funding": "-0.000067374305",
        //                         "pending_funding": "-0.000041006163",
        //                         "net_settlements": "-0.585287472129",
        //                         "initial_margin": "-55.755494300332",
        //                         "maintenance_margin": "-42.257371387251",
        //                         "open_orders_margin": "-55.755494300331",
        //                         "realized_pnl": "0",
        //                         "realized_pnl_excl_fees": "0",
        //                         "total_fees": "0.263183362967",
        //                         "unrealized_pnl": "-0.660983872598",
        //                         "unrealized_pnl_excl_fees": "-0.397800509631",
        //                         "delta": "1",
        //                         "gamma": "0",
        //                         "vega": "0",
        //                         "theta": "0",
        //                         "leverage": "0.186356454478",
        //                         "liquidation_price": null
        //                     },
        //                     {
        //                         "instrument_type": "option",
        //                         "instrument_name": "BTC-20270924-85000-C",
        //                         "amount": "0.1",
        //                         "average_price": "14711.3113013995",
        //                         "average_price_excl_fees": "14681",
        //                         "mark_price": "14667.877695125091",
        //                         "index_price": "84363.26788266873",
        //                         "mark_value": "1466.787769512509",
        //                         "amount_step": "0.00001",
        //                         "creation_timestamp": 0,
        //                         "cumulative_funding": "0",
        //                         "pending_funding": "0",
        //                         "net_settlements": "0",
        //                         "initial_margin": "0",
        //                         "maintenance_margin": "0",
        //                         "open_orders_margin": "0",
        //                         "realized_pnl": "0",
        //                         "realized_pnl_excl_fees": "0",
        //                         "total_fees": "3.03113013995",
        //                         "unrealized_pnl": "-4.34336062744",
        //                         "unrealized_pnl_excl_fees": "-1.31223048749",
        //                         "delta": "0.620796293303",
        //                         "gamma": "0.00001229971",
        //                         "vega": "334.523390908959",
        //                         "theta": "-18.178343402455",
        //                         "leverage": null,
        //                         "liquidation_price": null
        //                     }
        //                 ],
        //                 "collaterals": [
        //                     {
        //                         "asset_type": "erc20",
        //                         "asset_name": "USDC",
        //                         "amount": "4527.545377437385",
        //                         "average_price": "1",
        //                         "average_price_excl_fees": "1",
        //                         "mark_price": "1",
        //                         "mark_value": "4527.545377437385",
        //                         "amount_step": "0",
        //                         "currency": "USDC",
        //                         "creation_timestamp": 0,
        //                         "cumulative_interest": "0.008352036862",
        //                         "pending_interest": "0.000010583121",
        //                         "initial_margin": "4527.545388020506",
        //                         "maintenance_margin": "4527.545388020506",
        //                         "open_orders_margin": "0",
        //                         "realized_pnl": "0",
        //                         "realized_pnl_excl_fees": "0",
        //                         "total_fees": "0",
        //                         "unrealized_pnl": "0",
        //                         "unrealized_pnl_excl_fees": "0",
        //                         "delta_currency": "USDC",
        //                         "delta": "1"
        //                     }
        //                 ],
        //                 "vault_deposit_holds": []
        //             }
        //         ]
        //     }
        //
        const result = this.safeList (response, 'result');
        return this.parseBalance (result);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        // margin requirements come as negative subaccount-level contributions in usd terms (initial_margin = collaterals_initial_margin + positions_initial_margin, verified on live data), so they are attributed to the usdc settlement currency and clamped by the usdc cash below; other collaterals stay total-only because the shared margin pool cannot be split per currency
        let usedUsd: Str = '0';
        for (let i = 0; i < response.length; i++) {
            const subaccount = this.safeDict (response, i);
            const positionsMargin = this.safeString (subaccount, 'positions_initial_margin', '0');
            const ordersMargin = this.safeString (subaccount, 'open_orders_margin', '0');
            usedUsd = Precise.stringSub (usedUsd, Precise.stringAdd (positionsMargin, ordersMargin));
            const collaterals: Dict[] = this.safeList (subaccount, 'collaterals', []);
            for (let j = 0; j < collaterals.length; j++) {
                const balance = this.safeDict (collaterals, j);
                const code = this.safeCurrencyCode (this.safeString (balance, 'currency'));
                let account = this.safeDict (result, code);
                if (account === undefined) {
                    account = this.account ();
                    account['total'] = this.safeString (balance, 'amount');
                } else {
                    const amount = this.safeString (balance, 'amount');
                    account['total'] = Precise.stringAdd (account['total'], amount);
                }
                if (code !== undefined) {
                    result[code] = account;
                }
            }
        }
        const usdcAccount = this.safeDict (result, 'USDC');
        if (usdcAccount !== undefined) {
            const totalUsdc = this.safeString (usdcAccount, 'total');
            let used: Str = usedUsd;
            if (Precise.stringGt (used, totalUsdc)) {
                used = totalUsdc;
            }
            usdcAccount['used'] = used;
            usdcAccount['free'] = Precise.stringSub (totalUsdc, used);
            result['USDC'] = usdcAccount;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name derive#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.derive.xyz/api-reference/history/privateget_deposit_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchDeposits', params);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const response = await this.privatePostGetDepositHistory (this.extend (request, paramsDeriveSubaccountId));
        //
        //     {
        //         "id": "4ba60e41-fa05-490c-b849-9ead5aef63c8",
        //         "result": {
        //             "deposits": [
        //                 {
        //                     "operation_id": "01a0f7f4-008c-7322-81c6-7c80e1b98a79",
        //                     "new_subaccount": true,
        //                     "subaccount_id": 86815,
        //                     "wallet": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "asset": "USDC",
        //                     "amount": "10000",
        //                     "fee": "0",
        //                     "timestamp": 1790866358000,
        //                     "batch_uuid": "01a0f7f1-b8f3-7261-b09f-54c6df91273e",
        //                     "batch_status": "Batching",
        //                     "tx_hash": null,
        //                     "action_id": 418,
        //                     "is_fallback": false,
        //                     "fallback_error_code": null,
        //                     "fallback_error_message": null,
        //                     "fallback_error_data": null,
        //                     "l1_tx_hash": "0x77a6f738abb0642f32a35f1a53050968728182bd29ab0b19f8234f5df7bac309",
        //                     "l1_sender": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee"
        //                 }
        //             ]
        //         }
        //     }
        //
        const currency = this.safeCurrency (code);
        const result = this.safeDict (response, 'result', {});
        const deposits: Dict[] = this.safeList (result, 'deposits', []);
        return this.parseTransactions (deposits, currency, since, limit, paramsDeriveSubaccountId);
    }

    /**
     * @method
     * @name derive#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.derive.xyz/api-reference/history/privateget_withdrawal_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Transaction[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ subaccountId, paramsDeriveSubaccountId ] = this.handleDeriveSubaccountId ('fetchWithdrawals', params);
        const request: Dict = {
            'subaccount_id': subaccountId,
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const response = await this.privatePostGetWithdrawalHistory (this.extend (request, paramsDeriveSubaccountId));
        //
        //     {
        //         "id": "f3d46c05-5c8f-4e4a-9d2f-5a86d26124b3",
        //         "result": {
        //             "withdrawals": [
        //                 {
        //                     "operation_id": "01a0f7f9-b539-7a42-b48e-6081fa401b3f",
        //                     "subaccount_id": 86820,
        //                     "wallet": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "recipient": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "asset": "USDC",
        //                     "erc20_address": "0x73Efab09362052D26FB93A730Be4F8a5EdC833af",
        //                     "amount": "100",
        //                     "fee": "1.000073283608",
        //                     "timestamp": 1790866732000,
        //                     "batch_uuid": "01a0f7f7-1010-7c33-8bcf-7fef764d7fc5",
        //                     "batch_status": "Batching",
        //                     "tx_hash": null
        //                 }
        //             ]
        //         }
        //     }
        //
        const currency = this.safeCurrency (code);
        const result = this.safeDict (response, 'result', {});
        const withdrawals: Dict[] = this.safeList (result, 'withdrawals', []);
        return this.parseTransactions (withdrawals, currency, since, limit, paramsDeriveSubaccountId);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "operation_id": "01a0f7f4-008c-7322-81c6-7c80e1b98a79",
        //         "new_subaccount": true,
        //         "subaccount_id": 86815,
        //         "wallet": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //         "asset": "USDC",
        //         "amount": "10000",
        //         "fee": "0",
        //         "timestamp": 1790866358000,
        //         "batch_uuid": "01a0f7f1-b8f3-7261-b09f-54c6df91273e",
        //         "batch_status": "Batching",
        //         "tx_hash": null,
        //         "action_id": 418,
        //         "is_fallback": false,
        //         "fallback_error_code": null,
        //         "fallback_error_message": null,
        //         "fallback_error_data": null,
        //         "l1_tx_hash": "0x77a6f738abb0642f32a35f1a53050968728182bd29ab0b19f8234f5df7bac309",
        //         "l1_sender": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee"
        //     }
        //
        const code = this.safeString (transaction, 'asset');
        const timestamp = this.safeInteger (transaction, 'timestamp');
        // tx_hash is the settling ethereum L1 transaction and stays null until the batch settles; deposits carry the sender's own L1 transaction in l1_tx_hash
        let txId = this.safeString2 (transaction, 'tx_hash', 'l1_tx_hash');
        if (txId === '0x0') {
            txId = undefined;
        }
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString2 (transaction, 'operation_id', 'transaction_id'),
            'txid': txId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': this.safeString (transaction, 'recipient'),
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString2 (transaction, 'batch_status', 'tx_status')),
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'network': undefined,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'Batching': 'pending',
            'Executing': 'pending',
            'Da': 'pending',
            'Proving': 'pending',
            'Settling': 'pending',
            'Settled': 'ok',
            'BatchingError': 'failed',
            'ExecutingError': 'failed',
            'DaError': 'failed',
            'ProvingError': 'failed',
            'SettlingError': 'failed',
            'SettledError': 'failed',
            'settled': 'ok', // v2 legacy
            'reverted': 'failed', // v2 legacy
        };
        return this.safeString (statuses, (status as string), status);
    }

    handleDeriveSubaccountId (methodName: string, params: Dict): [any, Dict] {
        const [ derivesubAccountId, paramsSubaccountId ] = this.handleOptionAndParams (params, methodName, 'subaccount_id');
        if ((derivesubAccountId !== undefined) && (derivesubAccountId !== '')) {
            this.options['subaccount_id'] = derivesubAccountId; // saving in options
            return [ derivesubAccountId, paramsSubaccountId ];
        }
        const optionsWallet = this.safeString (this.options, 'subaccount_id');
        if (optionsWallet !== undefined) {
            return [ optionsWallet, paramsSubaccountId ];
        }
        throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a subaccount_id parameter inside \'params\' or exchange.options[\'subaccount_id\']=ID.');
    }

    handleDeriveWalletAddress (methodName: string, params: Dict): [Str, Dict] {
        const [ deriveWalletAddress, paramsDeriveWalletAddress ] = this.handleOptionStringAndParams (params, methodName, 'deriveWalletAddress');
        if ((deriveWalletAddress !== undefined) && (deriveWalletAddress !== '')) {
            this.options['deriveWalletAddress'] = deriveWalletAddress; // saving in options
            return [ deriveWalletAddress, paramsDeriveWalletAddress ];
        }
        const optionsWallet = this.safeString (this.options, 'deriveWalletAddress');
        if ((optionsWallet !== undefined) && (optionsWallet !== '')) {
            return [ optionsWallet, paramsDeriveWalletAddress ];
        }
        // v3 abolished the separate derive wallet: the owner wallet is the user's own EOA, so the walletAddress credential is the default; set deriveWalletAddress explicitly only when signing with a session key registered to another owner wallet
        if ((this.walletAddress !== undefined) && (this.walletAddress !== '')) {
            return [ this.walletAddress, paramsDeriveWalletAddress ];
        }
        throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires the walletAddress credential, a deriveWalletAddress parameter inside \'params\', or exchange.options[\'deriveWalletAddress\'] = ADDRESS.');
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        const error = this.safeDict (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }

    override nonce (): number {
        // signs the auth timestamp and feeds incrementingNonce (), which nonceString () extends to the nanosecond-scale action nonce; must be unique per wallet (error 11017) while staying a valid date (error 11018)
        return this.milliseconds () - this.safeInteger (this.options, 'timeDifference', 0);
    }

    override sign (path: string, api = 'public', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const apiUrl = this.safeString (this.urls['api'], api);
        if (apiUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no API URL for this endpoint');
        }
        const url = apiUrl + '/' + path;
        if (method === 'POST') {
            const postHeaders: Dict = {
                'Content-Type': 'application/json',
            };
            if (api === 'private') {
                const now = this.numberToString (this.nonce ());
                const signature = this.signMessage (now, this.privateKey);
                let deriveWalletAddress = this.safeString (this.options, 'deriveWalletAddress');
                if ((deriveWalletAddress === undefined) || (deriveWalletAddress === '')) {
                    deriveWalletAddress = this.walletAddress; // v3: the owner wallet is the user's own EOA
                }
                postHeaders['X-DeriveWallet'] = deriveWalletAddress;
                postHeaders['X-DeriveTimestamp'] = now;
                postHeaders['X-DeriveSignature'] = signature;
            }
            const postBody: Str = this.json (params);
            return { 'url': url, 'method': method, 'body': postBody, 'headers': postHeaders };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
